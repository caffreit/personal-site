'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export interface PrintListingItem {
  id: string;
  title: string;
  albumTitle: string;
  albumId: string;
  imageSrc: string;
  width: number;
  height: number;
  quote?: string;
  editionSold: number;
  editionSize: number;
  remaining: number;
  price?: number;
  currency?: string;
  sizes?: string[];
}

interface PrintsListingViewProps {
  prints: PrintListingItem[];
}

function formatCurrency(price?: number, currency?: string) {
  if (typeof price !== 'number') return 'Price on request';
  return new Intl.NumberFormat('en-IE', {
    style: 'currency',
    currency: currency ?? 'EUR',
    maximumFractionDigits: 0,
  }).format(price);
}

function formatSizeRange(sizes?: string[]) {
  if (!sizes || sizes.length === 0) return '';
  if (sizes.length === 1) return sizes[0];
  return `${sizes[0]} — ${sizes[sizes.length - 1]}`;
}

export function PrintsListingView({ prints }: PrintsListingViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionsRef = useRef<(HTMLElement | null)[]>([]);
  const [activeSection, setActiveSection] = useState(0);
  const totalSections = prints.length + 1; // intro + prints

  const scrollToSection = useCallback((index: number) => {
    const container = containerRef.current;
    const el = sectionsRef.current[index];
    if (container && el) {
      container.scrollTo({ top: el.offsetTop - container.offsetTop, behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.getAttribute('data-section-index'));
            if (!isNaN(idx)) setActiveSection(idx);

            entry.target.querySelector('.prints-section-content')?.classList.add('in-view');
          }
        }
      },
      { root: container, threshold: 0.5 },
    );

    for (const section of sectionsRef.current) {
      if (section) observer.observe(section);
    }

    return () => observer.disconnect();
  }, [prints.length]);

  return (
    <div ref={containerRef} className="prints-listing">
      {/* Progress dots */}
      <div className="prints-progress-dots">
        {Array.from({ length: totalSections }).map((_, i) => (
          <button
            key={i}
            className={`prints-progress-dot ${activeSection === i ? 'active' : ''}`}
            onClick={() => scrollToSection(i)}
            aria-label={`Go to section ${i + 1}`}
          />
        ))}
      </div>

      {/* ─── INTRO ─── */}
      <section
        ref={(el) => { sectionsRef.current[0] = el; }}
        data-section-index={0}
        className="prints-snap-section flex items-center justify-center bg-[var(--background)]"
      >
        <div className="prints-section-content in-view text-center max-w-2xl px-6">
          <h1 className="font-[family-name:var(--font-serif)] text-[clamp(2.5rem,6vw,4.5rem)] font-normal leading-[1.05] tracking-[-0.02em]">
            The Print Room
          </h1>
          <div className="prints-intro-rule mx-auto mt-6 mb-8 h-[2px] w-16 bg-[var(--color-yellow)]" />
          <p className="font-[family-name:var(--font-serif)] text-[clamp(1rem,1.8vw,1.2rem)] italic leading-relaxed text-[var(--text-muted)]">
            A curated selection of limited-edition prints, each one a moment
            distilled to its purest form. Archival materials, meticulous
            reproduction, enduring beauty.
          </p>
          <p className="mt-6 font-[family-name:var(--font-mono)] text-[0.65rem] uppercase tracking-[0.2em] text-[var(--color-yellow)]">
            {prints.length} {prints.length === 1 ? 'edition' : 'editions'} available
          </p>
          <div className="prints-scroll-indicator mt-12 flex flex-col items-center gap-2 text-[var(--text-muted)]">
            <span className="font-[family-name:var(--font-mono)] text-[0.55rem] uppercase tracking-[0.2em]">
              Scroll
            </span>
            <div className="h-8 w-[1px] bg-[var(--rule-color)]" />
          </div>
        </div>
      </section>

      {/* ─── PRINT SECTIONS ─── */}
      {prints.map((print, index) => {
        const isReversed = index % 2 === 1;

        return (
          <section
            key={print.id}
            ref={(el) => { sectionsRef.current[index + 1] = el; }}
            data-section-index={index + 1}
            className="prints-snap-section relative"
          >
            {/* Full-bleed background */}
            <div className="absolute inset-0">
              <Image
                src={print.imageSrc}
                alt={print.title}
                fill
                className="object-cover prints-ken-burns"
                sizes="100vw"
                priority={index === 0}
              />
            </div>

            {/* Gradient overlay */}
            <div className="prints-gradient-overlay" />

            {/* Editorial overlay */}
            <div
              className={`prints-section-content absolute bottom-0 left-0 right-0 z-10 px-6 pb-10 pt-6 sm:px-10 sm:pb-14 lg:px-16 lg:pb-16 ${
                isReversed ? 'text-right' : 'text-left'
              }`}
              style={{ maxWidth: '650px', marginLeft: isReversed ? 'auto' : '0' }}
            >
              <h2 className="font-[family-name:var(--font-serif)] text-[clamp(2rem,5vw,3.5rem)] font-normal leading-[1.1] tracking-[-0.02em] text-white drop-shadow-lg">
                {print.title}
              </h2>

              {print.quote && (
                <blockquote
                  className={`mt-4 font-[family-name:var(--font-serif)] text-[clamp(0.85rem,1.5vw,1rem)] italic leading-relaxed text-white/80 ${
                    isReversed
                      ? 'border-r-[3px] border-[var(--color-yellow)] pr-5'
                      : 'border-l-[3px] border-[var(--color-yellow)] pl-5'
                  }`}
                >
                  {print.quote}
                </blockquote>
              )}

              <div className={`mt-4 font-[family-name:var(--font-mono)] text-[0.6rem] uppercase tracking-[0.14em] text-white/70 ${isReversed ? 'flex justify-end gap-1' : ''}`}>
                <span>Edition {print.editionSold} / {print.editionSize}</span>
                <span className="mx-1 opacity-50">·</span>
                <span>From <strong className="text-white">{formatCurrency(print.price, print.currency)}</strong></span>
                {print.sizes && print.sizes.length > 0 && (
                  <>
                    <span className="mx-1 opacity-50">·</span>
                    <span>{formatSizeRange(print.sizes)}</span>
                  </>
                )}
              </div>

              <Link
                href={`/photos/prints/${print.id}`}
                className={`mt-5 inline-flex items-center gap-2 font-[family-name:var(--font-mono)] text-[0.65rem] uppercase tracking-[0.14em] text-[var(--color-yellow)] transition-opacity hover:opacity-80 ${
                  isReversed ? 'flex-row-reverse' : ''
                }`}
              >
                View Print <span className="text-sm">→</span>
              </Link>
            </div>
          </section>
        );
      })}
    </div>
  );
}
