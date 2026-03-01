import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { HERO_SLIDES } from "@/lib/hero";

export const alt = "Portraits, Patterns, Opinions — Photo stories and interactive explainers";
export const size = { width: 2048, height: 1638 };
export const contentType = "image/jpeg";

export default async function Image() {
  const firstSlide = HERO_SLIDES[0];
  const filePath = join(process.cwd(), "public", firstSlide.src);
  const buffer = await readFile(filePath);
  return new Response(buffer, {
    headers: {
      "Content-Type": "image/jpeg",
      "Cache-Control": "public, max-age=86400, immutable",
    },
  });
}
