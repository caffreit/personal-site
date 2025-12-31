import { notFound } from "next/navigation";
import { findAlbumById, readPhotoManifest } from "@/lib/photos";
import { AlbumView } from "@/components/gallery/AlbumView";

export const dynamicParams = true;

type AlbumParams = { album: string };

export async function generateStaticParams() {
  const manifest = readPhotoManifest();
  return manifest.albums.map((a) => ({ album: a.id }));
}

export async function generateMetadata({ params }: { params: Promise<AlbumParams> }) {
  const { album: albumId } = await params;
  const decodedId = decodeURIComponent(albumId);
  const album = findAlbumById(decodedId);
  if (!album) return {};
  return {
    title: `${album.title} • Photos`,
    description: album.description ?? undefined,
  };
}

export default async function AlbumPage({ params }: { params: Promise<AlbumParams> }) {
  const { album: albumId } = await params;
  const decodedId = decodeURIComponent(albumId);
  const album = findAlbumById(decodedId);
  if (!album) return notFound();

  // Transform existing images to match AlbumView expected format
  const images = album.images.map((img) => ({
    id: img.filename,
    url: `/photos/${encodeURIComponent(album.id)}/${encodeURIComponent(img.filename)}`,
    title: img.caption || "Untitled",
    location: img.location,
    iso: "400",
    aperture: "f/1.8",
    shutter: "1/125",
    width: img.width,
    height: img.height,
  }));

  return (
    <AlbumView 
      album={album.title} 
      description={album.description}
      images={images}
    />
  );
}
