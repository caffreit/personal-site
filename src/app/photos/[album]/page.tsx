import { notFound } from "next/navigation";
import { findAlbumById, normalizePhotoPrint, readPhotoManifest } from "@/lib/photos";
import { CuratorsWall } from "@/components/gallery/CuratorsWall";
import { buildAlbumWallPlates } from "@/lib/albumWall";

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
  const coverUrl = `/photos/${encodeURIComponent(album.id)}/${encodeURIComponent(album.cover)}`;
  const images = [{ url: coverUrl, width: 1200, height: 630, alt: album.title }];
  return {
    title: `${album.title} • Photos`,
    description: album.description ?? undefined,
    openGraph: { images },
    twitter: { card: "summary_large_image" as const, images },
  };
}

export default async function AlbumPage({ params }: { params: Promise<AlbumParams> }) {
  const { album: albumId } = await params;
  const decodedId = decodeURIComponent(albumId);
  const album = findAlbumById(decodedId);
  if (!album) return notFound();

  const wallImages = album.images.map((img) => ({
    ...img,
    print: img.print ? normalizePhotoPrint(img.print) : undefined,
  }));
  const plates = buildAlbumWallPlates(album.id, wallImages);

  return (
    <CuratorsWall
      title={album.title}
      description={album.description}
      plates={plates}
    />
  );
}
