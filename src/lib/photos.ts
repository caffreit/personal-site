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
