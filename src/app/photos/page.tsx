import { readPhotoManifest } from "@/lib/photos";
import { PhotoGalleryView } from "@/components/photos/PhotoGalleryView";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Photos",
  description: "A collection of photo albums.",
};

export default function PhotosIndex() {
  const manifest = readPhotoManifest();
  const albums = manifest.albums;
  const locations = manifest.locations ?? [];
  
  return (
    <div className="mx-auto max-w-7xl px-4 pt-12 pb-32 sm:px-6 lg:px-8">
      <div className="mb-12">
        <Link 
           href="/"
           className="inline-flex items-center gap-2 text-stone-500 hover:text-stone-900 mb-10 transition-colors"
         >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-medium text-sm font-mono uppercase tracking-wider">Back to Home</span>
         </Link>

        <h1 className="text-6xl sm:text-8xl font-black text-stone-900 tracking-tighter uppercase leading-[0.8] mb-8">
          Photo Albums
        </h1>
        <p className="max-w-2xl text-xl leading-relaxed text-stone-600 font-serif italic">
          A curated selection of moments and stories that reflect a love for
          simplicity, restraint, and purposeful design.
        </p>
      </div>
      
      <div>
        {albums.length === 0 ? (
          <p className="text-zinc-600 dark:text-zinc-300">
            No albums yet. Add images under{" "}
            <code>public/photos/&lt;album&gt;/</code> then run{" "}
            <code>npm run generate:albums</code>.
          </p>
        ) : (
          <PhotoGalleryView albums={albums} locations={locations} />
        )}
      </div>
    </div>
  );
}
