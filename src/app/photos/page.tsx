import { readPhotoManifest } from "@/lib/photos";
import { PhotoGalleryView } from "@/components/photos/PhotoGalleryView";

export const metadata = {
  title: "Photos",
  description: "A collection of photo albums.",
};

export default function PhotosIndex() {
  const manifest = readPhotoManifest();
  const albums = manifest.albums;
  const locations = manifest.locations ?? [];

  if (albums.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 pt-12 pb-32 sm:px-6 lg:px-8">
        <p className="text-[var(--text-muted)]">
          No albums yet. Add images under{" "}
          <code>public/photos/&lt;album&gt;/</code> then run{" "}
          <code>npm run generate:albums</code>.
        </p>
      </div>
    );
  }

  return <PhotoGalleryView albums={albums} locations={locations} />;
}
