"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import type { GenealogyPosterVariant } from "@/lib/posterProducts";

export type GenealogyPosterPage = {
  posterName: string;
  kicker: string;
  title: string;
  intro: string;
  story: string;
  related: { href: string; label: string; description: string };
  variants: [GenealogyPosterVariant, ...GenealogyPosterVariant[]];
};

export function GenealogyPosterView({ posterName, kicker, title, intro, story, related, variants }: GenealogyPosterPage) {
  const [variant, setVariant] = useState(variants[0]);
  const [activeImage, setActiveImage] = useState(variant.gallery[0]);
  const dimensions = variant.orientation === "landscape" ? "594 × 420 mm" : "420 × 594 mm";

  return (
    <div className="mx-auto max-w-7xl px-5 pt-10 pb-24 sm:px-8 lg:px-10">
      <Link href="/labs" className="mb-8 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--text-muted)] transition-colors hover:text-[var(--foreground)]">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Labs
      </Link>

      <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:gap-16">
        <section aria-label={`${posterName} preview gallery`} className="min-w-0">
          <figure>
            <div id="poster-gallery-image" className="relative flex h-[420px] items-center justify-center border border-[var(--rule-color)] bg-[#f0eee9] p-5 sm:h-[580px] sm:p-8 lg:h-[620px]">
              <Image
                key={activeImage.src}
                src={activeImage.src}
                alt={`${posterName}, ${variant.label}: ${activeImage.label.toLowerCase()}`}
                fill
                unoptimized
                className={activeImage.label === "Whole poster" ? "object-contain p-5 sm:p-8" : "object-contain"}
                priority
              />
            </div>
            <figcaption aria-live="polite" className="mt-3 min-h-10 font-mono text-[10px] leading-relaxed text-[var(--text-muted)]">
              {activeImage.caption}
            </figcaption>
          </figure>
          <div className="mt-2 grid grid-cols-4 gap-2 sm:gap-3" role="group" aria-label="Gallery views">
            {variant.gallery.map((entry) => (
              <button
                key={entry.src}
                type="button"
                aria-label={`Show ${entry.label.toLowerCase()}`}
                aria-pressed={entry.src === activeImage.src}
                aria-controls="poster-gallery-image"
                onClick={() => setActiveImage(entry)}
                className={`group text-left ${entry.src === activeImage.src ? "text-[var(--foreground)]" : "text-[var(--text-muted)]"}`}
              >
                <span className={`relative block aspect-[4/3] overflow-hidden border bg-[#f0eee9] transition-colors ${entry.src === activeImage.src ? "border-[var(--foreground)]" : "border-[var(--rule-color)] group-hover:border-[var(--foreground)]"}`}>
                  <Image src={entry.src} alt="" fill unoptimized className="object-contain p-1" />
                </span>
                <span className="mt-2 block font-mono text-[9px] uppercase tracking-[0.08em] sm:text-[10px]">{entry.label}</span>
              </button>
            ))}
          </div>
        </section>

        <section aria-label="Poster details" className="lg:sticky lg:top-28">
          <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)]">{kicker}</p>
          <h1 className="font-[family-name:var(--font-display)] text-4xl leading-[1.05] font-semibold uppercase tracking-tight sm:text-5xl xl:text-6xl">{title}</h1>
          <p className="mt-6 text-xl leading-relaxed text-[var(--text-body-rgb)]">{intro}</p>

          <fieldset className="mt-8 border-t border-[var(--rule-color)] pt-6">
            <legend className="float-left mb-4 w-full font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--text-muted)]">Choose a version</legend>
            <div className="flex clear-both flex-wrap gap-2">
              {variants.map((option) => (
                <label key={option.id} className="cursor-pointer">
                  <input type="radio" name="poster-version" value={option.id} checked={option.id === variant.id} className="peer sr-only" onChange={() => { setVariant(option); setActiveImage(option.gallery[0]); }} />
                  <span className="block border border-[var(--rule-color)] px-4 py-3 font-mono text-[11px] uppercase tracking-[0.08em] transition-colors hover:border-[var(--foreground)] peer-checked:border-[var(--foreground)] peer-checked:bg-[var(--foreground)] peer-checked:text-[var(--background)] peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-[var(--color-yellow)]">{option.label}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <p aria-live="polite" className="mt-4 min-h-20 text-base leading-relaxed text-[var(--text-body-rgb)]">{variant.blurb}</p>

          <dl className="mt-5 border-y border-[var(--rule-color)] py-5 font-mono text-[11px]">
            <div className="flex items-baseline justify-between gap-3"><dt className="uppercase tracking-[0.12em] text-[var(--text-muted)]">Size</dt><dd>A2 · {dimensions}</dd></div>
            <div className="mt-3 flex items-baseline justify-between gap-3"><dt className="uppercase tracking-[0.12em] text-[var(--text-muted)]">Format</dt><dd>Unframed poster</dd></div>
          </dl>

          <div className="mt-6" aria-live="polite">
            {variant.order.status === "available" ? (
              <>
                <p className="mb-4 font-[family-name:var(--font-display)] text-3xl">
                  {new Intl.NumberFormat("en-IE", { style: "currency", currency: variant.order.currency }).format(variant.order.price)}
                </p>
                <a href={variant.order.checkoutUrl} target="_blank" rel="noopener noreferrer" className="flex w-full items-center justify-between bg-[var(--color-yellow)] px-5 py-4 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-[#0a0a0a] transition-opacity hover:opacity-80">
                  Buy this poster <ArrowUpRight className="h-4 w-4" />
                </a>
              </>
            ) : (
              <>
                <p className="border border-[var(--rule-color)] px-5 py-4 text-center font-mono text-[11px] uppercase tracking-[0.15em]">Coming soon</p>
                <p className="mt-3 text-sm text-[var(--text-muted)]">Price and ordering details will be available here.</p>
              </>
            )}
          </div>
        </section>
      </div>

      <section className="mt-16 grid gap-6 border-t border-[var(--rule-color)] pt-8 lg:mt-24 lg:grid-cols-[1fr_2fr] lg:gap-16" aria-labelledby="about-poster">
        <h2 id="about-poster" className="font-mono text-[11px] font-normal uppercase tracking-[0.18em] text-[var(--text-muted)]">About the poster</h2>
        <div className="max-w-2xl">
          <p className="text-xl leading-relaxed text-[var(--text-body-rgb)]">{story}</p>
          <Link href={related.href} className="mt-8 flex items-center justify-between gap-5 border-y border-[var(--rule-color)] py-5 transition-colors hover:text-[var(--text-muted)]">
            <span><span className="block font-[family-name:var(--font-display)] text-lg">{related.label}</span><span className="mt-1 block text-sm text-[var(--text-muted)]">{related.description}</span></span>
            <ArrowUpRight className="h-5 w-5 shrink-0" />
          </Link>
        </div>
      </section>
    </div>
  );
}
