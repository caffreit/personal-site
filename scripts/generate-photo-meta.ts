/**
 * Migration script: Scans existing folder structure and generates photo-meta.json
 * 
 * This script identifies location folders vs theme folders and creates a mapping
 * of each photo to its location. Run this ONCE before reorganizing your folders.
 * 
 * Usage: npx tsx scripts/generate-photo-meta.ts
 */

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const PUBLIC_PHOTOS_DIR = path.join(ROOT, "public", "photos");
const OUTPUT_FILE = path.join(ROOT, "content", "photos", "photo-meta.json");

// Define which folders are locations vs themes
// Locations are places (cities, countries, regions)
const LOCATION_FOLDERS = new Set([
  "Amsterdam",
  "Beijing",
  "Bordeaux",
  "Chengdu",
  "Donegal",
  "Dublin",
  "Eastern Europe",
  "Hong Kong",
  "Howth",
  "Kyoto",
  "Lecce",
  "Lisbon",
  "Lisbon on film", // Hybrid - treat as location for migration
  "Malahide",
  "Milan",
  "Osaka",
  "Shanghai",
  "Tokyo",
  "Venice",
]);

// Theme folders (these will become the primary albums)
const THEME_FOLDERS = new Set([
  "Animals",
  "BnW",
  "Buildings",
  "Diptych",
  "Faves",
  "Film",
  "Minimal",
  "Mountains",
  "People",
  "Portraits",
]);

type PhotoMeta = {
  location?: string;
  tags?: string[];
  sourceFolder?: string; // Track where we found this photo originally
};

type PhotoMetaMap = Record<string, PhotoMeta>;

function getImageFiles(dir: string): string[] {
  const supported = ["jpg", "jpeg", "png", "webp", "gif", "avif"];
  try {
    return fs
      .readdirSync(dir, { withFileTypes: true })
      .filter(
        (ent) =>
          ent.isFile() &&
          supported.some((ext) => ent.name.toLowerCase().endsWith(`.${ext}`))
      )
      .map((ent) => ent.name);
  } catch {
    return [];
  }
}

async function main() {
  if (!fs.existsSync(PUBLIC_PHOTOS_DIR)) {
    console.error(`No photos directory at ${PUBLIC_PHOTOS_DIR}`);
    process.exit(1);
  }

  const photoMeta: PhotoMetaMap = {};

  // Load existing photo-meta.json if it exists (to preserve manual edits)
  if (fs.existsSync(OUTPUT_FILE)) {
    try {
      const existing = JSON.parse(fs.readFileSync(OUTPUT_FILE, "utf8"));
      Object.assign(photoMeta, existing);
      console.log(`Loaded existing photo-meta.json with ${Object.keys(existing).length} entries`);
    } catch {
      console.log("Could not parse existing photo-meta.json, starting fresh");
    }
  }

  // Get all folders
  const allFolders = fs
    .readdirSync(PUBLIC_PHOTOS_DIR, { withFileTypes: true })
    .filter((ent) => ent.isDirectory())
    .map((ent) => ent.name);

  console.log(`\nFound ${allFolders.length} folders in public/photos/`);
  console.log("---");

  // First pass: scan location folders to build filename -> location mapping
  const locationMap = new Map<string, string>();
  
  for (const folder of allFolders) {
    if (LOCATION_FOLDERS.has(folder)) {
      const folderPath = path.join(PUBLIC_PHOTOS_DIR, folder);
      const files = getImageFiles(folderPath);
      
      console.log(`📍 Location: ${folder} (${files.length} photos)`);
      
      for (const filename of files) {
        // If a photo appears in multiple location folders, keep the first one found
        // (you can manually edit photo-meta.json to fix edge cases)
        if (!locationMap.has(filename)) {
          locationMap.set(filename, folder);
        }
      }
    }
  }

  // Second pass: scan ALL folders and assign metadata
  let totalPhotos = 0;
  let photosWithLocation = 0;
  let photosWithoutLocation = 0;

  for (const folder of allFolders) {
    const folderPath = path.join(PUBLIC_PHOTOS_DIR, folder);
    const files = getImageFiles(folderPath);
    
    const isLocation = LOCATION_FOLDERS.has(folder);
    const isTheme = THEME_FOLDERS.has(folder);
    
    if (!isLocation && !isTheme) {
      console.log(`⚠️  Uncategorized folder: ${folder} (${files.length} photos)`);
    } else if (isTheme) {
      console.log(`🎨 Theme: ${folder} (${files.length} photos)`);
    }

    for (const filename of files) {
      totalPhotos++;
      
      // Only update if not already in photoMeta (preserve manual edits)
      if (!photoMeta[filename]) {
        const location = locationMap.get(filename);
        
        photoMeta[filename] = {
          location: location || undefined,
          sourceFolder: folder,
        };
        
        if (location) {
          photosWithLocation++;
        } else {
          photosWithoutLocation++;
        }
      }
    }
  }

  // Write output
  fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(photoMeta, null, 2));

  console.log("\n---");
  console.log(`✅ Generated ${OUTPUT_FILE}`);
  console.log(`   Total unique photos: ${Object.keys(photoMeta).length}`);
  console.log(`   Photos with location: ${photosWithLocation}`);
  console.log(`   Photos without location: ${photosWithoutLocation}`);
  console.log("\n💡 Review photo-meta.json and manually add locations for photos without one.");
  console.log("   Then run 'npm run generate:albums' to regenerate the manifest.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

