import { notFound } from "next/navigation";
import { readPhotoManifest, findLocationById, getPhotosByLocation } from "@/lib/photos";
import { LocationAlbumView } from "@/components/gallery/LocationAlbumView";

export const dynamicParams = true;

type LocationParams = { location: string };

export async function generateStaticParams() {
  const manifest = readPhotoManifest();
  return (manifest.locations ?? []).map((l) => ({ location: l.id }));
}

export async function generateMetadata({ params }: { params: Promise<LocationParams> }) {
  const { location: locationId } = await params;
  const decodedId = decodeURIComponent(locationId);
  const location = findLocationById(decodedId);
  if (!location) return {};
  const coverUrl = `/photos/${encodeURIComponent(location.coverAlbum)}/${encodeURIComponent(location.cover)}`;
  const images = [{ url: coverUrl, width: 1200, height: 630, alt: location.name }];
  return {
    title: `${location.name} • Photos`,
    description: `Photos from ${location.name}`,
    openGraph: { images },
    twitter: { card: "summary_large_image" as const, images },
  };
}

export default async function LocationPage({ params }: { params: Promise<LocationParams> }) {
  const { location: locationId } = await params;
  const decodedId = decodeURIComponent(locationId);
  const location = findLocationById(decodedId);
  if (!location) return notFound();

  const photosByLocation = getPhotosByLocation(decodedId);

  // Transform to match the view format
  const images = photosByLocation.map(({ album, image }) => ({
    id: image.filename,
    url: `/photos/${encodeURIComponent(album.id)}/${encodeURIComponent(image.filename)}`,
    title: image.caption || "Untitled",
    albumId: album.id,
    albumTitle: album.title,
    width: image.width,
    height: image.height,
  }));

  return (
    <LocationAlbumView 
      location={location.name}
      images={images}
    />
  );
}

