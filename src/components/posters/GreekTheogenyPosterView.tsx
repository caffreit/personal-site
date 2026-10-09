"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Download, ZoomIn } from "lucide-react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import {
  GREEK_THEOGONY_VARIANTS,
  type GreekTheogonyVariant,
} from "@/lib/greekTheogenyPoster";

function PosterVariantSection({ variant }: { variant: GreekTheogonyVariant }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const aspect = variant.width / variant.height;

  return (
    <section
      className="border-t border-[var(--rule-color)] pt-12 first:border-t-0 first:pt-0"
      aria-labelledby={`poster-${variant.id}-title`}
    >
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2
            id={`poster-${variant.id}-title`}
            className="font-[family-name:var(--font-display)] text-2xl font-semibold uppercase tracking-wide text-[var(--foreground)] sm:text-3xl"
          >
            {variant.label}
          </h2>
          <p className="mt-2 max-w-2xl font-[family-name:var(--font-newsreader)] text-base italic leading-relaxed text-[var(--text-muted)] sm:text-lg">
            {variant.blurb}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {(
            [
              variant.downloads.pdf,
              variant.downloads.svg,
              variant.downloads.png,
            ] as const
          ).map((file) => (
            <a
              key={file.href}
              href={file.href}
              download
              className="inline-flex items-center gap-1.5 rounded-full border border-[var(--rule-color)] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--foreground)] transition-colors hover:bg-[var(--rule-color)]/30"
            >
              <Download className="h-3 w-3 shrink-0" />
              {file.label}
            </a>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={() => setLightboxOpen(true)}
        className="group relative w-full overflow-hidden rounded-sm border border-[var(--rule-color)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--foreground)]"
        aria-label={`Open full-size ${variant.label} poster`}
      >
        <div
          className={
            variant.showTransparency
              ? "bg-[repeating-conic-gradient(var(--rule-color)_0_90deg,transparent_0_180deg)] bg-[length:18px_18px]"
              : "bg-[var(--rule-color)]/10"
          }
          style={{ aspectRatio: String(aspect) }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={variant.displaySrc}
            alt={`Greek theogony poster — ${variant.label.toLowerCase()} version`}
            width={variant.width}
            height={variant.height}
            className="h-full w-full object-contain transition-opacity group-hover:opacity-95"
            loading={variant.id === "outlines" ? "eager" : "lazy"}
            decoding="async"
          />
        </div>
        <span
          className="pointer-events-none absolute bottom-4 right-4 flex items-center gap-2 rounded-full bg-[var(--background)]/90 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)] opacity-0 shadow-sm backdrop-blur transition-opacity group-hover:opacity-100"
        >
          <ZoomIn className="h-3.5 w-3.5" />
          Zoom
        </span>
      </button>

      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        slides={[
          {
            src: variant.displaySrc,
            alt: `Greek theogony — ${variant.label}`,
          },
        ]}
      />
    </section>
  );
}

export function GreekTheogenyPosterView() {
  return (
    <div className="mx-auto max-w-7xl px-4 pt-12 pb-32 sm:px-6 lg:px-8">
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-2 text-[var(--text-muted)] transition-colors hover:text-[var(--foreground)]"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="font-mono text-sm font-medium uppercase tracking-[0.2em]">
          Back to Home
        </span>
      </Link>

      <header className="mb-12 max-w-3xl border-b border-[var(--rule-color)] pb-10">
        <p className="mb-3 font-mono text-xs uppercase tracking-[0.25em] text-[var(--text-muted)]">
          Reference chart · A2
        </p>
        <h1
          className="font-[family-name:var(--font-display)] text-5xl font-bold uppercase tracking-tight text-[var(--foreground)] sm:text-7xl"
        >
          Greek Theogony
        </h1>
        <p className="mt-6 font-[family-name:var(--font-newsreader)] text-xl leading-relaxed text-[var(--text-muted)] italic">
          A family tree of the Greek gods — Titans, Olympians, and the lines
          between them. Two finishes: crisp outlines and a translucent fill
          you can layer over your own background.
        </p>
        <p className="mt-4 font-mono text-xs uppercase tracking-[0.15em] text-[var(--text-muted)]">
          On-screen previews use SVG · Print downloads are PDF · Raster exports
          at 300 DPI
        </p>
      </header>

      <div className="flex flex-col gap-16">
        {GREEK_THEOGONY_VARIANTS.map((variant) => (
          <PosterVariantSection key={variant.id} variant={variant} />
        ))}
      </div>
    </div>
  );
}
