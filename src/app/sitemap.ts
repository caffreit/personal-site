import { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/posts";
import { readPhotoManifest } from "@/lib/photos";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const now = new Date();
  const routes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, lastModified: now },
    { url: `${baseUrl}/photos`, lastModified: now },
    { url: `${baseUrl}/blog`, lastModified: now },
  ];
  const posts = getAllPosts();
  for (const p of posts) {
    routes.push({
      url: `${baseUrl}/blog/${p.slug}`,
      lastModified: new Date(p.date),
    });
  }
  const manifest = readPhotoManifest();
  for (const a of manifest.albums) {
    routes.push({
      url: `${baseUrl}/photos/${a.id}`,
      lastModified: now,
    });
  }
  return routes;
}


