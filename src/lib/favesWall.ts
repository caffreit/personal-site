import fs from "node:fs";
import path from "node:path";
import type { PhotoImage } from "@/lib/photos";
import type { WallGroupConfig, WallPlate, WallPlatePhoto } from "@/lib/favesWallTypes";

export type { WallGroupConfig, WallPlate, WallPlatePhoto, WallLayout, WallSize } from "@/lib/favesWallTypes";

type FavesWallConfig = {
  groups: WallGroupConfig[];
};

const CONFIG_PATH = path.join(process.cwd(), "content", "photos", "faves-wall.json");

export function readFavesWallConfig(): FavesWallConfig {
  if (!fs.existsSync(CONFIG_PATH)) {
    return { groups: [] };
  }
  return JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8")) as FavesWallConfig;
}

export function buildFavesWallPlates(
  images: PhotoImage[],
  albumId: string,
  groups: WallGroupConfig[] = readFavesWallConfig().groups,
): WallPlate[] {
  const numbered: WallPlatePhoto[] = images.map((img, i) => ({
    ...img,
    n: i + 1,
    url: `/photos/${encodeURIComponent(albumId)}/${encodeURIComponent(img.filename)}`,
  }));

  const byFile = new Map(numbered.map((p) => [p.filename, p]));
  const groupOf = new Map<string, WallGroupConfig>();
  groups.forEach((group) => {
    group.files.forEach((file) => groupOf.set(file, group));
  });

  const plates: WallPlate[] = [];
  const used = new Set<string>();

  numbered.forEach((photo) => {
    if (used.has(photo.filename)) return;

    const group = groupOf.get(photo.filename);
    if (group) {
      const members = group.files.map((f) => byFile.get(f)).filter(Boolean) as WallPlatePhoto[];
      if (members.length !== group.files.length) return;
      const firstN = Math.min(...members.map((m) => m.n));
      if (photo.n !== firstN) return;
      members.forEach((m) => used.add(m.filename));
      const ordered = group.files
        .map((f) => byFile.get(f))
        .filter(Boolean) as WallPlatePhoto[];
      plates.push({ layout: group.layout, size: group.size, photos: ordered });
      return;
    }

    used.add(photo.filename);
    plates.push({ layout: "inset", photos: [photo] });
  });

  return plates;
}
