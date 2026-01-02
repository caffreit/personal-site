import Image from "next/image";
import Link from "next/link";
import { getAllPosts, PostListItem } from "@/lib/posts";
import { readPhotoManifest, PhotoAlbum, PhotoImage } from "@/lib/photos";
import { PhotoGallery } from "@/components/photos/PhotoGallery";
import { BlogSection } from "@/components/blog/BlogSection";
import { SelectedWorks } from "@/components/SelectedWorks";
import HeroSection from "@/components/HeroSection";

type TimelineItem =
  | {
      type: "album";
      title: string;
      description: string;
      href: string;
      accent: string;
    }
  | {
      type: "post";
      title: string;
      description: string;
      href: string;
      accent: string;
    };

export default function Home() {
  const posts = getAllPosts();
  const manifest = readPhotoManifest();
  const albums = manifest.albums;

  const latestWorkPosts = posts.slice(0, 5);
  const sectionContainer = "px-4 sm:px-6 lg:px-8 w-full max-w-7xl mx-auto";

  return (
    <>
      <div className={sectionContainer}>
        <HeroSection />
      </div>

      <div className="pb-24 pt-0" id="selected-works-section">
        <div className={`${sectionContainer} flex w-full flex-col gap-24`}>
          <SelectedWorks />
          <PhotoGallery albums={albums} />
        </div>
        <div className="mt-24">
          <BlogSection posts={latestWorkPosts} />
        </div>
      </div>
    </>
  );
}

