"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { PhotoAlbum, LocationAlbum } from "@/lib/photos";

type ViewMode = "themes" | "locations";

interface PhotoGalleryViewProps {
  albums: PhotoAlbum[];
  locations: LocationAlbum[];
}

const carouselVariants = {
  enter: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 14 },
};

export function PhotoGalleryView({ albums, locations }: PhotoGalleryViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("themes");

  const featured = albums[0];
  const availablePrintCount = albums.reduce(
    (count, album) => count + album.images.filter((image) => image.print?.available).length,
    0,
  );

  return (
    <div>
      {/* ---- HERO ---- */}
      <section className="relative w-full h-[80vh] min-h-[500px] overflow-hidden">
        <Image
          src={`/photos/${encodeURIComponent(featured.id)}/${encodeURIComponent(featured.cover)}`}
          alt={featured.title}
          fill
          className="object-cover hero-zoom"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />

        <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-10 lg:p-16">
          <span className="font-[family-name:var(--font-mono)] text-[0.7rem] uppercase tracking-[0.2em] text-[var(--color-yellow)] mb-3">
            Featured Album
          </span>
          <Link
            href={`/photos/${encodeURIComponent(featured.id)}`}
            className="group w-fit"
          >
            <h1 className="font-[family-name:var(--font-serif)] text-[clamp(2.5rem,5vw,4rem)] font-semibold text-white tracking-tight leading-[1.1] mb-2 group-hover:text-[var(--color-yellow)] transition-colors duration-300">
              {featured.title}
            </h1>
          </Link>
          <span className="font-[family-name:var(--font-mono)] text-[0.7rem] uppercase tracking-[0.15em] text-white/50">
            {featured.images.length} Photographs
          </span>
        </div>

        <span className="absolute bottom-6 right-6 sm:bottom-10 sm:right-10 lg:bottom-16 lg:right-16 font-[family-name:var(--font-mono)] text-[0.75rem] text-white/40 tracking-[0.05em]">
          01 / {String(albums.length).padStart(2, "0")}
        </span>
      </section>

      {/* ---- BROWSE SECTION ---- */}
      <section className="border-t border-[var(--rule-color)] pt-10 md:pt-16">
        {/* Toggle header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between max-w-[1200px] mx-auto px-6 lg:px-10 pb-6 md:pb-8 gap-4">
          <div className="flex items-baseline gap-5 md:gap-8">
            <button
              onClick={() => setViewMode("themes")}
              className={`photo-toggle-btn ${viewMode === "themes" ? "photo-toggle-active" : "photo-toggle-inactive"}`}
            >
              By Theme
            </button>
            {locations.length > 0 && (
              <button
                onClick={() => setViewMode("locations")}
                className={`photo-toggle-btn ${viewMode === "locations" ? "photo-toggle-active" : "photo-toggle-inactive"}`}
              >
                By Location
              </button>
            )}
          </div>
          <div className="flex items-center gap-4">
            {availablePrintCount > 0 && (
              <Link
                href="/photos/prints"
                className="pill-control rounded-full border border-[var(--rule-color)] px-4 py-2 font-[family-name:var(--font-mono)] text-[0.62rem] uppercase tracking-[0.17em] text-[var(--foreground)] transition-colors hover:border-[var(--color-yellow)] hover:text-[var(--color-yellow)]"
              >
                <span className="pill-label">Available Prints ({availablePrintCount})</span>
              </Link>
            )}
            <span className="hidden sm:block font-[family-name:var(--font-display)] text-[0.8rem] uppercase tracking-[0.15em] text-[var(--text-muted)] whitespace-nowrap">
              Scroll to browse &rarr;
            </span>
          </div>
        </div>

        {/* Carousel */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={viewMode}
            variants={carouselVariants}
            initial="enter"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
          >
            <div className="flex overflow-x-auto snap-x snap-mandatory pb-20 photo-carousel">
              {viewMode === "themes"
                ? albums.map((album) => (
                    <Link
                      key={album.id}
                      href={`/photos/${encodeURIComponent(album.id)}`}
                      className="photo-strip-card group"
                    >
                      <Image
                        src={`/photos/${encodeURIComponent(album.id)}/${encodeURIComponent(album.cover)}`}
                        alt={album.title}
                        fill
                        className="object-cover transition-transform duration-[600ms] ease-out group-hover:scale-[1.03]"
                        sizes="(max-width: 640px) 80vw, 45vw"
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-6 sm:p-10 text-white">
                        <h4 className="font-[family-name:var(--font-serif)] text-[clamp(1.25rem,2.2vw,1.75rem)] font-semibold mb-1">
                          {album.title}
                        </h4>
                        <span className="font-[family-name:var(--font-mono)] text-[0.65rem] uppercase tracking-[0.15em] text-white/55">
                          {album.images.length} Photographs
                        </span>
                        {album.images.some((image) => image.print?.available) && (
                          <div className="mt-2 font-[family-name:var(--font-mono)] text-[0.6rem] uppercase tracking-[0.16em] text-[var(--color-yellow)]">
                            Limited prints available
                          </div>
                        )}
                      </div>
                    </Link>
                  ))
                : locations.map((loc) => (
                    <Link
                      key={loc.id}
                      href={`/photos/location/${encodeURIComponent(loc.id)}`}
                      className="photo-strip-card group"
                    >
                      <Image
                        src={`/photos/${encodeURIComponent(loc.coverAlbum)}/${encodeURIComponent(loc.cover)}`}
                        alt={loc.name}
                        fill
                        className="object-cover transition-transform duration-[600ms] ease-out group-hover:scale-[1.03]"
                        sizes="(max-width: 640px) 80vw, 45vw"
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-6 sm:p-10 text-white">
                        <h4 className="font-[family-name:var(--font-serif)] text-[clamp(1.25rem,2.2vw,1.75rem)] font-semibold mb-1">
                          {loc.name}
                        </h4>
                        <span className="font-[family-name:var(--font-mono)] text-[0.65rem] uppercase tracking-[0.15em] text-white/55">
                          {loc.photoCount} Photographs
                        </span>
                      </div>
                    </Link>
                  ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </section>
    </div>
  );
}
