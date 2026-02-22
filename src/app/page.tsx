import { getAllPosts } from "@/lib/posts";
import { readPhotoManifest } from "@/lib/photos";
import { PhotoGallery } from "@/components/photos/PhotoGallery";
import { BlogSection } from "@/components/blog/BlogSection";
import { SelectedWorks } from "@/components/SelectedWorks";
import HeroSection from "@/components/HeroSection";

export default function Home() {
  const posts = getAllPosts();
  const manifest = readPhotoManifest();
  const albums = manifest.albums;

  const featuredPost = posts.find((p) => p.slug === "dunbars-number") ?? posts[0];
  const blogPosts = posts.slice(0, 4);

  return (
    <>
      {/* Hero: full-bleed carousel */}
      <HeroSection />

      {/* 3-column editorial section */}
      <SelectedWorks
        posts={posts}
        featuredPost={featuredPost}
      />

      {/* Photo strip: full-bleed horizontal scroll */}
      <PhotoGallery albums={albums} />

      {/* Blog editorial grid */}
      <BlogSection posts={blogPosts} />
    </>
  );
}
