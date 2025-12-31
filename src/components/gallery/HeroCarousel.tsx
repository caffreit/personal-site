"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import type { PhotoAlbum, PhotoImage } from "@/lib/photos";

interface HeroCarouselProps {
  albums: PhotoAlbum[];
}

export function HeroCarousel({ albums }: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    if (albums.length <= 1) return;

    let transitionTimeout: ReturnType<typeof setTimeout> | undefined;

    const mainTimeout = setTimeout(() => {
      setIsAnimating(false);
      transitionTimeout = setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % albums.length);
        setIsAnimating(true);
      }, 500);
    }, 5000); // Change image every 5 seconds

    return () => {
      clearTimeout(mainTimeout);
      if (transitionTimeout) clearTimeout(transitionTimeout);
    };
  }, [albums.length, currentIndex]);

  if (!albums.length) {
    return (
      <div className="flex h-full min-h-[600px] items-center justify-center border-2 border-dashed border-zinc-300 text-zinc-500 dark:border-zinc-700">
        <span>Add photos to populate</span>
      </div>
    );
  }

  const currentAlbum = albums[currentIndex];
  const currentCover = currentAlbum.images.find(
    (img: PhotoImage) => img.filename === currentAlbum.cover
  ) ?? currentAlbum.images[0];

  if (!currentCover) return null;

  return (
    <div className="relative h-full">
      <Link
        href={`/photos/${encodeURIComponent(currentAlbum.id)}`}
        className="group relative block h-full overflow-hidden rounded-[16px] bg-zinc-900/90"
      >
        {/* Image with fade animation */}
        <div
          key={currentIndex}
          className={`absolute inset-0 transition-opacity duration-700 ${
            isAnimating ? "animate-fadeIn opacity-100" : "opacity-0"
          }`}
        >
          <Image
            src={`/photos/${encodeURIComponent(currentAlbum.id)}/${encodeURIComponent(currentCover.filename)}`}
            alt={`Cover from ${currentAlbum.title}`}
            width={currentCover.width}
            height={currentCover.height}
            className="hero-zoom h-full w-full object-cover transition duration-700 group-hover:scale-105"
            priority={currentIndex === 0}
          />
        </div>

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/30 via-transparent to-black/40" />

        {/* Content overlay */}
        <div className="absolute inset-0 flex flex-col justify-end p-8 lg:p-12">
          {/* Bottom: Album title */}
          <div
            className={`transition-all duration-700 delay-300 ${
              isAnimating ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            }`}
          >
            <h3 className="mb-2 text-4xl font-bold leading-tight text-white lg:text-5xl">
              {currentAlbum.title}
            </h3>
          </div>
        </div>

        {/* Next button */}
        {albums.length > 1 && (
          <button
            onClick={(e) => {
              e.preventDefault();
              setIsAnimating(false);
              setTimeout(() => {
                setCurrentIndex((prev) => (prev + 1) % albums.length);
                setIsAnimating(true);
              }, 500);
            }}
            className="absolute bottom-8 right-8 flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition hover:bg-white/30 lg:bottom-12 lg:right-12"
            aria-label="Next album"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        )}
      </Link>

      {/* Carousel indicators – centered over the image (mid‑bottom) */}
      {albums.length > 1 && (
        <div className="pointer-events-none absolute inset-0 flex items-end justify-center pb-6 lg:pb-12">
          <div className="pointer-events-auto flex gap-2 px-4 py-2">
            {albums.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setIsAnimating(false);
                  setTimeout(() => {
                    setCurrentIndex(index);
                    setIsAnimating(true);
                  }, 500);
                }}
                className="relative h-1 w-8 overflow-hidden rounded-full bg-white/25"
                aria-label={`View album ${index + 1}`}
              >
                <span
                  key={index === currentIndex ? `active-${currentIndex}` : `inactive-${index}`}
                  className={`absolute inset-0 rounded-full bg-white ${
                    index === currentIndex
                      ? "indicator-progress"
                      : "opacity-30 scale-x-0"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

