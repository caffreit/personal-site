'use client';

import React, { useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { PhotoAlbum, PhotoImage } from '@/lib/photos';

interface PhotoGalleryProps {
  albums: PhotoAlbum[];
}

type AlbumWithCover = {
  album: PhotoAlbum;
  cover: PhotoImage;
};

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({ albums }) => {
  const albumsWithCovers = useMemo<AlbumWithCover[]>(
    () =>
      albums.flatMap((album) => {
        const cover = album.images.find(
          (img: PhotoImage) => img.filename === album.cover
        ) ?? album.images[0];

        return cover ? [{ album, cover }] : [];
      }),
    [albums]
  );

  return (
    <section className="border-t border-[var(--rule-color)] pt-16">
      {/* Header */}
      <div className="mx-auto flex max-w-[1200px] flex-col gap-1 px-6 pb-8 sm:flex-row sm:items-end sm:justify-between lg:px-10">
        <Link href="/photos">
          <h2 className="font-serif text-[3rem] font-bold transition-colors hover:text-[var(--color-yellow)]">
            Photography
          </h2>
        </Link>
        <span className="font-[family-name:var(--font-display)] text-[0.8rem] uppercase tracking-[0.15em] text-[var(--text-muted)] xl:hidden">
          Scroll to browse &rarr;
        </span>
        <Link
          href="/photos"
          className="hidden font-[family-name:var(--font-display)] text-[0.8rem] uppercase tracking-[0.15em] text-[var(--text-muted)] transition-colors hover:text-[var(--foreground)] xl:inline"
        >
          View all photos &rarr;
        </Link>
      </div>

      <div className="flex snap-x snap-mandatory overflow-x-auto scrollbar-none [&::-webkit-scrollbar]:hidden xl:mx-auto xl:grid xl:max-w-[1200px] xl:grid-cols-3 xl:gap-4 xl:overflow-visible xl:px-10 xl:pb-20 xl:snap-none">
        {albumsWithCovers.map(({ album, cover }) => {
          return (
            <Link
              key={album.id}
              href={`/photos/${encodeURIComponent(album.id)}`}
              className="group relative h-[60vh] w-[45vw] min-w-[320px] flex-none snap-start overflow-hidden xl:aspect-[4/5] xl:h-auto xl:w-full xl:min-w-0 xl:flex-auto"
            >
              <Image
                src={`/photos/${encodeURIComponent(album.id)}/${encodeURIComponent(cover.filename)}`}
                alt={album.title}
                fill
                className="object-cover transition-transform duration-600 ease-out group-hover:scale-[1.03]"
                sizes="(max-width: 1279px) 45vw, 380px"
              />
              {/* Caption overlay */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[var(--caption-gradient)] to-transparent p-8 text-white">
                <h4 className="font-serif text-[clamp(1.5rem,2.2vw,1.8rem)] font-semibold">
                  {album.title}
                </h4>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};
