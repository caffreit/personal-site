import fs from "node:fs";
import path from "node:path";
import imageSize from "image-size";

type CuratedAlbum = {
  id: string;
  title?: string;
  description?: string;
  cover?: string;
  order?: number;
  featuredImages?: string[];
  imageOrder?: string[];
};

type PhotoMeta = {
  location?: string;
  tags?: string[];
  sourceFolder?: string;
};

type PhotoMetaMap = Record<string, PhotoMeta>;

type ManifestImage = {
  filename: string;
  width: number;
  height: number;
  caption?: string;
  isFeatured?: boolean;
  location?: string;
  tags?: string[];
};

type ManifestAlbum = {
  id: string;
  title: string;
  description?: string;
  cover: string;
  images: ManifestImage[];
};

type LocationAlbum = {
  id: string;
  name: string;
  photoCount: number;
  cover: string;
  coverAlbum: string;
};

type Manifest = {
  generatedAt: string;
  albums: ManifestAlbum[];
  locations: LocationAlbum[];
};

const ROOT = process.cwd();
const PUBLIC_PHOTOS_DIR = path.join(ROOT, "public", "photos");
const CURATED_FILE = path.join(ROOT, "content", "photos", "albums.json");
const PHOTO_META_FILE = path.join(ROOT, "content", "photos", "photo-meta.json");
const OUTPUT_FILE = path.join(ROOT, "content", "photos", "manifest.json");

// Theme folders - these become the primary albums
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

function loadCurated(): Record<string, CuratedAlbum> {
  try {
    if (!fs.existsSync(CURATED_FILE)) return {};
    const raw = JSON.parse(fs.readFileSync(CURATED_FILE, "utf8")) as CuratedAlbum[];
    const map: Record<string, CuratedAlbum> = {};
    for (const item of raw) {
      map[item.id] = item;
    }
    return map;
  } catch {
    return {};
  }
}

function loadPhotoMeta(): PhotoMetaMap {
  try {
    if (!fs.existsSync(PHOTO_META_FILE)) return {};
    return JSON.parse(fs.readFileSync(PHOTO_META_FILE, "utf8")) as PhotoMetaMap;
  } catch {
    return {};
  }
}

async function main() {
  if (!fs.existsSync(PUBLIC_PHOTOS_DIR)) {
    console.warn(`No photos directory at ${PUBLIC_PHOTOS_DIR}. Skipping.`);
    fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
    const empty: Manifest = { generatedAt: new Date().toISOString(), albums: [], locations: [] };
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(empty, null, 2));
    return;
  }

  const curated = loadCurated();
  const photoMeta = loadPhotoMeta();
  const supported = ["jpg", "jpeg", "png", "webp", "gif", "avif"];

  const albumsById = new Map<string, ManifestAlbum>();

  // Track photos by location for virtual location albums
  const locationPhotos = new Map<string, { album: string; filename: string; width: number; height: number }[]>();

  // Get all folders
  const allFolders = fs
    .readdirSync(PUBLIC_PHOTOS_DIR, { withFileTypes: true })
    .filter((ent) => ent.isDirectory())
    .map((ent) => ent.name);

  // Process ONLY theme folders as primary albums
  const themeFolders = allFolders.filter((f) => THEME_FOLDERS.has(f));
  
  console.log(`Processing ${themeFolders.length} theme folders as albums...`);

  for (const albumId of themeFolders) {
    const albumDir = path.join(PUBLIC_PHOTOS_DIR, albumId);
    const captionsPath = path.join(albumDir, "captions.json");
    let captions: Record<string, string> = {};
    if (fs.existsSync(captionsPath)) {
      try {
        captions = JSON.parse(fs.readFileSync(captionsPath, "utf8")) as Record<string, string>;
      } catch {
        captions = {};
      }
    }

    const files = fs
      .readdirSync(albumDir, { withFileTypes: true })
      .filter(
        (ent) =>
          ent.isFile() &&
          supported.some((ext) => ent.name.toLowerCase().endsWith(`.${ext.toLowerCase()}`)),
      )
      .map((ent) => ent.name);

    const curatedAlbum = curated[albumId] ?? {};
    const featuredSet = new Set(curatedAlbum.featuredImages || []);

    for (const filename of files) {
      const abs = path.join(albumDir, filename);
      const { width, height } = imageSize(fs.readFileSync(abs));
      if (!width || !height) continue;

      // Get location from photo-meta.json
      const meta = photoMeta[filename] ?? {};
      const location = meta.location;
      const tags = meta.tags;

      const existing = albumsById.get(albumId);
      const image: ManifestImage = {
        filename,
        width,
        height,
        caption: captions[filename],
        isFeatured: featuredSet.has(filename),
        location,
        tags,
      };

      if (!existing) {
        albumsById.set(albumId, {
          id: albumId,
          title: curatedAlbum.title ?? albumId,
          description: curatedAlbum.description,
          cover: curatedAlbum.cover ?? filename,
          images: [image],
        });
      } else {
        existing.images.push(image);
      }

      // Track by location for virtual location albums
      if (location) {
        if (!locationPhotos.has(location)) {
          locationPhotos.set(location, []);
        }
        locationPhotos.get(location)!.push({ album: albumId, filename, width, height });
      }
    }
  }

  // Also scan location-only folders for photos not in any theme
  // These will be added to a special "Uncategorized" album but tracked by location
  const locationOnlyFolders = allFolders.filter((f) => !THEME_FOLDERS.has(f));
  
  console.log(`Scanning ${locationOnlyFolders.length} location folders for additional photos...`);

  // Create a set of all filenames already in theme albums
  const filesInThemes = new Set<string>();
  for (const album of albumsById.values()) {
    for (const img of album.images) {
      filesInThemes.add(img.filename);
    }
  }

  // Collect uncategorized photos (in location folders but not in any theme)
  const uncategorizedImages: ManifestImage[] = [];

  for (const folder of locationOnlyFolders) {
    const folderPath = path.join(PUBLIC_PHOTOS_DIR, folder);
    const files = fs
      .readdirSync(folderPath, { withFileTypes: true })
      .filter(
        (ent) =>
          ent.isFile() &&
          supported.some((ext) => ent.name.toLowerCase().endsWith(`.${ext.toLowerCase()}`)),
      )
      .map((ent) => ent.name);

    for (const filename of files) {
      // Skip if already in a theme album
      if (filesInThemes.has(filename)) continue;

      const abs = path.join(folderPath, filename);
      const { width, height } = imageSize(fs.readFileSync(abs));
      if (!width || !height) continue;

      const meta = photoMeta[filename] ?? {};
      // Use folder name as location if not in photo-meta
      const location = meta.location ?? folder;

      const image: ManifestImage = {
        filename,
        width,
        height,
        location,
        tags: meta.tags,
      };

      uncategorizedImages.push(image);

      // Track by location
      if (!locationPhotos.has(location)) {
        locationPhotos.set(location, []);
      }
      locationPhotos.get(location)!.push({ album: "Uncategorized", filename, width, height });
    }
  }

  // Add uncategorized album if there are any
  if (uncategorizedImages.length > 0) {
    console.log(`Found ${uncategorizedImages.length} photos not in any theme album`);
    
    // Get the folder for the first uncategorized image to use as cover source
    const firstImg = uncategorizedImages[0];
    const firstLocation = firstImg.location ?? "Uncategorized";
    
    albumsById.set("Uncategorized", {
      id: "Uncategorized",
      title: "Uncategorized",
      description: "Photos not yet assigned to a theme album",
      cover: firstImg.filename,
      images: uncategorizedImages,
    });
  }

  // Sort images by filename or custom order
  for (const album of albumsById.values()) {
    const curatedAlbum = curated[album.id];
    const customOrder = curatedAlbum?.imageOrder;

    if (customOrder && customOrder.length > 0) {
      // Create a map for fast lookup of position
      const orderMap = new Map(customOrder.map((filename, index) => [filename, index]));
      
      album.images.sort((a, b) => {
        const posA = orderMap.has(a.filename) ? orderMap.get(a.filename)! : Number.MAX_SAFE_INTEGER;
        const posB = orderMap.has(b.filename) ? orderMap.get(b.filename)! : Number.MAX_SAFE_INTEGER;
        
        if (posA !== posB) return posA - posB;
        return a.filename.localeCompare(b.filename);
      });
    } else {
      album.images.sort((a, b) => a.filename.localeCompare(b.filename));
    }

    if (!album.cover) {
      album.cover = album.images[0]?.filename ?? "";
    }
  }

  const albums = Array.from(albumsById.values());
  
  // Optional ordering by curated order
  const curatedMap = loadCurated();
  albums.sort((a, b) => {
    const ao = curatedMap[a.id]?.order ?? Number.MAX_SAFE_INTEGER;
    const bo = curatedMap[b.id]?.order ?? Number.MAX_SAFE_INTEGER;
    if (ao !== bo) return ao - bo;
    return a.title.localeCompare(b.title);
  });

  // Generate virtual location albums
  const locations: LocationAlbum[] = [];
  for (const [locationId, photos] of locationPhotos) {
    // Pick the first photo as cover
    const coverPhoto = photos[0];
    locations.push({
      id: locationId,
      name: locationId,
      photoCount: photos.length,
      cover: coverPhoto.filename,
      coverAlbum: coverPhoto.album,
    });
  }

  // Sort locations alphabetically
  locations.sort((a, b) => a.name.localeCompare(b.name));

  const manifest: Manifest = {
    generatedAt: new Date().toISOString(),
    albums,
    locations,
  };

  fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(manifest, null, 2));
  
  console.log(`\n✅ Wrote manifest to ${path.relative(ROOT, OUTPUT_FILE)}`);
  console.log(`   ${albums.length} album(s)`);
  console.log(`   ${locations.length} location(s)`);
  
  // Summary
  let totalPhotos = 0;
  for (const album of albums) {
    totalPhotos += album.images.length;
  }
  console.log(`   ${totalPhotos} total photos in albums`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
