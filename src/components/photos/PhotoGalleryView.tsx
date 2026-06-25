"use client";

import { type CSSProperties, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { PhotoAlbum, LocationAlbum } from "@/lib/photos";

type ViewMode = "themes" | "locations";

interface PhotoGalleryViewProps {
  albums: PhotoAlbum[];
  locations: LocationAlbum[];
}

type PhotoBrowseItem = {
  id: string;
  title: string;
  href: string;
  imageSrc: string;
  imageAlt: string;
  count: number;
  hasPrints?: boolean;
};

const carouselVariants = {
  enter: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 14 },
};

function getBalancedRows<T>(items: T[], maxRowSize: number) {
  if (items.length === 0) return [];

  const rowCount = Math.ceil(items.length / maxRowSize);
  const baseRowSize = Math.floor(items.length / rowCount);
  const rowsWithExtraItem = items.length % rowCount;
  const rows: T[][] = [];
  let start = 0;

  for (let rowIndex = 0; rowIndex < rowCount; rowIndex += 1) {
    const rowSize = baseRowSize + (rowIndex < rowsWithExtraItem ? 1 : 0);
    rows.push(items.slice(start, start + rowSize));
    start += rowSize;
  }

  return rows;
}

function PhotoBrowseCard({
  item,
  className = "",
  style,
  onMouseEnter,
  onFocus,
  onBlur,
}: {
  item: PhotoBrowseItem;
  className?: string;
  style?: CSSProperties;
  onMouseEnter?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
}) {
  return (
    <Link
      href={item.href}
      className={`photo-strip-card group ${className}`}
      style={style}
      onMouseEnter={onMouseEnter}
      onFocus={onFocus}
      onBlur={onBlur}
    >
      <div
        className="photo-strip-card-frame"
        style={{ inset: 0, width: "100%", height: "100%", transform: "none", boxShadow: "none" }}
      >
        <Image
          src={item.imageSrc}
          alt={item.imageAlt}
          fill
          className="object-cover transition-transform duration-[600ms] ease-out group-hover:scale-[1.03]"
          sizes="(max-width: 640px) 80vw, (max-width: 1279px) 45vw, 60vw"
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-6 sm:p-10 text-white">
          <h4 className="font-[family-name:var(--font-serif)] text-[clamp(1.25rem,2.2vw,1.75rem)] font-semibold mb-1">
            {item.title}
          </h4>
          <span className="font-[family-name:var(--font-mono)] text-[0.65rem] uppercase tracking-[0.15em] text-white/55">
            {item.count} Photographs
          </span>
          {item.hasPrints && (
            <div className="mt-2 font-[family-name:var(--font-mono)] text-[0.6rem] uppercase tracking-[0.16em] text-[var(--color-yellow)]">
              Limited prints available
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

export function PhotoGalleryView({ albums, locations }: PhotoGalleryViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("themes");
  const [activeDesktopItem, setActiveDesktopItem] = useState<string | null>(null);

  const featured = albums[0];
  const availablePrintCount = albums.reduce(
    (count, album) => count + album.images.filter((image) => image.print?.available).length,
    0,
  );
  const themeItems: PhotoBrowseItem[] = albums.map((album) => ({
    id: album.id,
    title: album.title,
    href: `/photos/${encodeURIComponent(album.id)}`,
    imageSrc: `/photos/${encodeURIComponent(album.id)}/${encodeURIComponent(album.cover)}`,
    imageAlt: album.title,
    count: album.images.length,
    hasPrints: album.images.some((image) => image.print?.available),
  }));
  const locationItems: PhotoBrowseItem[] = locations.map((loc) => ({
    id: loc.id,
    title: loc.name,
    href: `/photos/location/${encodeURIComponent(loc.id)}`,
    imageSrc: `/photos/${encodeURIComponent(loc.coverAlbum)}/${encodeURIComponent(loc.cover)}`,
    imageAlt: loc.name,
    count: loc.photoCount,
  }));
  const browseItems = viewMode === "themes" ? themeItems : locationItems;
  const desktopRows = getBalancedRows(browseItems, 5);

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
            <span className="hidden sm:block xl:hidden font-[family-name:var(--font-display)] text-[0.8rem] uppercase tracking-[0.15em] text-[var(--text-muted)] whitespace-nowrap">
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
            <div className="flex overflow-x-auto snap-x snap-mandatory pb-20 photo-carousel xl:hidden">
              {browseItems.map((item) => (
                <PhotoBrowseCard key={item.id} item={item} />
              ))}
            </div>

            <div className="hidden photo-accordion xl:flex xl:flex-col xl:gap-2 xl:px-2 xl:pb-16">
              {desktopRows.map((row, rowIndex) => (
                <div
                  key={`${viewMode}-${rowIndex}`}
                  className="photo-accordion-row"
                  style={{
                    display: "flex",
                    gap: "0.5rem",
                    height: "clamp(340px, 34vw, 560px)",
                  }}
                  onMouseLeave={() => setActiveDesktopItem(null)}
                >
                  {row.map((item) => {
                    const rowHasActiveItem = row.some(({ id }) => id === activeDesktopItem);
                    const isActive = activeDesktopItem === item.id;

                    return (
                      <PhotoBrowseCard
                        key={item.id}
                        item={item}
                        className="photo-accordion-card"
                        style={{
                          flex: rowHasActiveItem ? (isActive ? "2.8 1 0" : "0.85 1 0") : "1 1 0",
                          width: "auto",
                          minWidth: 0,
                          height: "100%",
                          aspectRatio: "auto",
                          overflow: "hidden",
                          transition: "flex 0.7s cubic-bezier(0.25, 1, 0.5, 1)",
                        }}
                        onMouseEnter={() => setActiveDesktopItem(item.id)}
                        onFocus={() => setActiveDesktopItem(item.id)}
                        onBlur={() => setActiveDesktopItem(null)}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </section>
    </div>
  );
}
