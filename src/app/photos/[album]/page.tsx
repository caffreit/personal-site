import { notFound } from "next/navigation";
import { findAlbumById, normalizePhotoPrint, readPhotoManifest } from "@/lib/photos";
import { AlbumView } from "@/components/gallery/AlbumView";
import { CuratorsWall } from "@/components/gallery/CuratorsWall";
import { buildFavesWallPlates, readFavesWallConfig } from "@/lib/favesWall";

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

  if (album.id === "Faves") {
    const wall = readFavesWallConfig();
    const wallImages = album.images.map((img) => ({
      ...img,
      print: img.print ? normalizePhotoPrint(img.print) : undefined,
    }));
    const plates = buildFavesWallPlates(wallImages, album.id, wall.groups);
    return (
      <CuratorsWall
        title={album.title}
        description={album.description}
        plates={plates}
      />
    );
  }

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
    print: img.print ? normalizePhotoPrint(img.print) : undefined,
  }));

  return (
    <AlbumView
      album={album.title}
      albumId={album.id}
      description={album.description}
      images={images}
    />
  );
}
