import fs from "node:fs";
import path from "node:path";
import type { PhotoImage } from "@/lib/photos";
import type { WallGroupConfig, WallLayout, WallPlate, WallPlatePhoto } from "@/lib/albumWallTypes";

export type { WallGroupConfig, WallPlate, WallPlatePhoto, WallLayout, WallSize } from "@/lib/albumWallTypes";

type CuratedWallConfig = {
  groups: WallGroupConfig[];
};

/** Printed rhythm for non-curated albums: opener, pair, single, pair — repeating. */
const AUTO_RHYTHM: WallLayout[] = ["bleed", "pair", "inset", "pair"];

const FAVES_WALL_PATH = path.join(process.cwd(), "content", "photos", "faves-wall.json");

function toPlatePhotos(images: PhotoImage[], albumId: string): WallPlatePhoto[] {
  return images.map((img, i) => ({
    ...img,
    n: i + 1,
    url: `/photos/${encodeURIComponent(albumId)}/${encodeURIComponent(img.filename)}`,
  }));
}

function renumberPlates(plates: WallPlate[]): WallPlate[] {
  let n = 1;
  for (const plate of plates) {
    for (const photo of plate.photos) {
      photo.n = n++;
    }
  }
  return plates;
}

export function readFavesWallConfig(): CuratedWallConfig {
  if (!fs.existsSync(FAVES_WALL_PATH)) {
    return { groups: [] };
  }
  return JSON.parse(fs.readFileSync(FAVES_WALL_PATH, "utf8")) as CuratedWallConfig;
}

/** Explicit groups only; everything else is a smart single. Preserves album order. */
export function buildCuratedWallPlates(
  images: PhotoImage[],
  albumId: string,
  groups: WallGroupConfig[],
): WallPlate[] {
  const numbered = toPlatePhotos(images, albumId);
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

/**
 * Auto rhythm from the curator’s wall mockup.
 * Prefers landscape frames for bleeds; may pull a later wide shot forward.
 * Caption numbers follow final display order.
 */
export function buildAutoWallPlates(images: PhotoImage[], albumId: string): WallPlate[] {
  const pool = toPlatePhotos(images, albumId);
  const plates: WallPlate[] = [];
  let step = 0;

  while (pool.length) {
    const layout = AUTO_RHYTHM[step % AUTO_RHYTHM.length];
    step++;

    if (layout === "bleed") {
      const wideIdx = pool.findIndex((p) => p.width / p.height > 1.3);
      const idx = wideIdx === -1 ? 0 : wideIdx;
      plates.push({ layout, photos: pool.splice(idx, 1) });
    } else if (layout === "pair") {
      plates.push({ layout, photos: pool.splice(0, Math.min(2, pool.length)) });
    } else {
      plates.push({ layout, photos: pool.splice(0, 1) });
    }
  }

  return renumberPlates(plates);
}

/** Diptychs are authored as consecutive pairs — keep that pairing intact. */
export function buildDiptychWallPlates(images: PhotoImage[], albumId: string): WallPlate[] {
  const pool = toPlatePhotos(images, albumId);
  const plates: WallPlate[] = [];

  while (pool.length) {
    plates.push({ layout: "pair", photos: pool.splice(0, Math.min(2, pool.length)) });
  }

  return renumberPlates(plates);
}

export function buildAlbumWallPlates(
  albumId: string,
  images: PhotoImage[],
): WallPlate[] {
  if (albumId === "Faves") {
    return buildCuratedWallPlates(images, albumId, readFavesWallConfig().groups);
  }
  if (albumId === "Diptych") {
    return buildDiptychWallPlates(images, albumId);
  }
  return buildAutoWallPlates(images, albumId);
}
