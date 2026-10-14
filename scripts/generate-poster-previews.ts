import { mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

type Crop = { left: number; top: number; width: number; height: number };
type PreviewSource = { family: string; id: string; master: string; crops: [Crop, Crop] };

// Fractional crops deliberately cover small, separate sections, never the full sheet.
const greekCrops: [Crop, Crop] = [
  { left: 0.32, top: 0.28, width: 0.36, height: 0.25 },
  { left: 0.5, top: 0.5, width: 0.38, height: 0.25 },
];
const sources: PreviewSource[] = [
  { family: "greek-theogony", id: "outlines", master: "greek_theogony_frameless_outlines_A2_300dpi.png", crops: greekCrops },
  { family: "greek-theogony", id: "translucent", master: "greek_theogony_frameless_A2_300dpi.png", crops: greekCrops },
  { family: "transit-theogony", id: "left-to-right", master: "transit_theogony_ltr_A2_300dpi.png", crops: [
    { left: 0.26, top: 0.28, width: 0.3, height: 0.34 },
    { left: 0.59, top: 0.39, width: 0.3, height: 0.34 },
  ] },
  { family: "transit-theogony", id: "ring", master: "transit_theogony_ring_A2_300dpi.png", crops: [
    { left: 0.3, top: 0.24, width: 0.4, height: 0.25 },
    { left: 0.51, top: 0.48, width: 0.4, height: 0.25 },
  ] },
];

async function generate(source: PreviewSource) {
  const master = path.join("assets/poster-masters", source.family, source.master);
  const output = path.join("public/posters", source.family, source.id);
  await mkdir(output, { recursive: true });
  const { width, height } = await sharp(master).metadata();
  if (!width || !height) throw new Error(`Missing dimensions: ${master}`);

  const preview = await sharp(master).flatten({ background: "#ffffff" })
    .resize({ width: 800, height: 800, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 }).toBuffer();
  await sharp(preview).toFile(path.join(output, "preview.webp"));

  for (const [index, crop] of source.crops.entries()) {
    if (crop.width * crop.height > 0.2 || crop.left < 0 || crop.top < 0 || crop.left + crop.width > 1 || crop.top + crop.height > 1) {
      throw new Error(`Invalid detail crop: ${source.id} ${index}`);
    }
    await sharp(master).extract({
      left: Math.floor(crop.left * width), top: Math.floor(crop.top * height),
      width: Math.floor(crop.width * width), height: Math.floor(crop.height * height),
    }).flatten({ background: "#ffffff" })
      .resize({ width: 1000, height: 1000, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 90 }).toFile(path.join(output, `detail-${index + 1}.webp`));
  }

  // Compose the room using only the capped preview, never a print master.
  const artWidth = width > height ? 430 : 300;
  const artwork = await sharp(preview).resize({ width: artWidth }).png().toBuffer();
  const artHeight = Math.round(artWidth * height / width);
  const x = (1200 - artWidth) / 2;
  const y = width > height ? 200 : 120;
  const room = Buffer.from(`<svg width="1200" height="960" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="wall" x2="1" y2="1"><stop stop-color="#eeebe4"/><stop offset="1" stop-color="#ded8ce"/></linearGradient>
      <linearGradient id="wood" x2="0" y2="1"><stop stop-color="#ad8970"/><stop offset="1" stop-color="#886850"/></linearGradient>
      <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="5" dy="10" stdDeviation="10" flood-opacity="0.18"/></filter>
    </defs>
    <rect width="1200" height="960" fill="url(#wall)"/>
    <rect y="790" width="1200" height="170" fill="#c6b8a6"/>
    <path d="M0 790H1200" stroke="#b9ad9b" stroke-width="3"/>
    <rect x="290" y="670" width="620" height="145" rx="2" fill="url(#wood)" filter="url(#shadow)"/>
    <rect x="280" y="660" width="640" height="14" rx="2" fill="#b7987f"/>
    <path d="M497 678V805M704 678V805" stroke="#755b46" opacity="0.5"/>
    <path d="M315 815V858M885 815V858" stroke="#755b46" stroke-width="14"/>
    <rect x="320" y="646" width="90" height="14" fill="#eee9df"/>
    <rect x="332" y="636" width="78" height="10" fill="#6e7b6b"/>
    <path d="M825 658Q805 612 820 594H850Q865 612 845 658Z" fill="#b8a28e"/>
    <rect x="${x - 20}" y="${y - 20}" width="${artWidth + 40}" height="${artHeight + 40}" fill="#302c28" filter="url(#shadow)"/>
    <rect x="${x - 12}" y="${y - 12}" width="${artWidth + 24}" height="${artHeight + 24}" fill="#fff"/>
  </svg>`);
  await sharp(room).composite([{ input: artwork, left: x, top: y }])
    .webp({ quality: 85 }).toFile(path.join(output, "room.webp"));
  console.log(`Generated four previews: ${source.family}/${source.id}`);
}

async function main() {
  for (const source of sources) await generate(source);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
