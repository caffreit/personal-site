import fs from "node:fs";
import path from "node:path";

export type PhotoImage = {
  filename: string;
  width: number;
  height: number;
  caption?: string;
  isFeatured?: boolean;
  location?: string;
  tags?: string[];
  print?: PhotoPrint;
};

export type PhotoPrintStatus = "available" | "sold_out" | "inquiry_only";

export type PhotoPrint = {
  available: boolean;
  editionSize: number;
  sold: number;
  status?: PhotoPrintStatus;
  price?: number;
  currency?: string;
  sizes?: string[];
  paper?: string;
  signed?: boolean;
  leadTime?: string;
  requestUrl?: string;
  quote?: string;
  description?: string;
};

export type PhotoAlbum = {
  id: string;
  title: string;
  description?: string;
  cover: string;
  images: PhotoImage[];
};

export type LocationAlbum = {
  id: string;
  name: string;
  photoCount: number;
  cover: string;
  coverAlbum: string; // Which theme album the cover comes from
};

export type PhotoManifest = {
  generatedAt: string;
  albums: PhotoAlbum[];
  locations: LocationAlbum[];
};

export type AvailablePrint = {
  id: string;
  album: PhotoAlbum;
  image: PhotoImage;
  print: PhotoPrint;
  remaining: number;
};

/** Derive a URL-safe print ID from a filename (strip extension). */
export function printIdFromFilename(filename: string): string {
  return filename.replace(/\.[^.]+$/, "").toLowerCase();
}

const MANIFEST_PATH = path.join(process.cwd(), "content", "photos", "manifest.json");

export function readPhotoManifest(): PhotoManifest {
  if (!fs.existsSync(MANIFEST_PATH)) {
    console.warn(
      `[photos] Missing manifest at ${MANIFEST_PATH}. Run "npm run generate:albums" after adding images.`,
    );
    return { generatedAt: new Date().toISOString(), albums: [], locations: [] };
  }
  const raw = fs.readFileSync(MANIFEST_PATH, "utf8");
  const manifest = JSON.parse(raw) as PhotoManifest;
  // Ensure locations array exists for backwards compatibility
  if (!manifest.locations) {
    manifest.locations = [];
  }
  return manifest;
}

export function findAlbumById(id: string): PhotoAlbum | undefined {
  const mf = readPhotoManifest();
  return mf.albums.find((a) => a.id === id);
}

export function findLocationById(id: string): LocationAlbum | undefined {
  const mf = readPhotoManifest();
  return mf.locations.find((l) => l.id === id);
}

export function getPhotosByLocation(locationId: string): { album: PhotoAlbum; image: PhotoImage }[] {
  const mf = readPhotoManifest();
  const results: { album: PhotoAlbum; image: PhotoImage }[] = [];
  const seen = new Set<string>(); // Dedupe by filename (same photo can be in multiple albums)
  
  for (const album of mf.albums) {
    for (const image of album.images) {
      if (image.location === locationId && !seen.has(image.filename)) {
        seen.add(image.filename);
        results.push({ album, image });
      }
    }
  }
  
  return results;
}

export function getAllLocations(): string[] {
  const mf = readPhotoManifest();
  return mf.locations.map((l) => l.id);
}

export function normalizePhotoPrint(print: PhotoPrint): PhotoPrint & { remaining: number } {
  const sold = Math.max(0, print.sold);
  const editionSize = Math.max(0, print.editionSize);
  const remaining = Math.max(0, editionSize - sold);
  const soldOut = remaining === 0 || print.status === "sold_out";

  return {
    ...print,
    sold,
    editionSize,
    remaining,
    status: soldOut ? "sold_out" : (print.status ?? "available"),
    available: !soldOut && print.available,
  };
}

export function getAvailablePrints(): AvailablePrint[] {
  const manifest = readPhotoManifest();
  const prints: AvailablePrint[] = [];
  const seen = new Set<string>();

  for (const album of manifest.albums) {
    for (const image of album.images) {
      if (!image.print || seen.has(image.filename)) continue;

      const normalized = normalizePhotoPrint(image.print);
      if (!normalized.available) continue;

      seen.add(image.filename);
      prints.push({
        id: printIdFromFilename(image.filename),
        album,
        image,
        print: normalized,
        remaining: normalized.remaining,
      });
    }
  }

  prints.sort((a, b) => {
    if (a.remaining !== b.remaining) return a.remaining - b.remaining;
    return a.album.title.localeCompare(b.album.title);
  });

  return prints;
}

export function getAllPrintIds(): string[] {
  return getAvailablePrints().map((p) => p.id);
}

export function getPrintById(id: string): AvailablePrint | undefined {
  return getAvailablePrints().find((p) => p.id === id);
}
