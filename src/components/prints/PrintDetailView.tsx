'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { RoomMockup, getSizePreset } from './RoomMockup';

export interface PrintDetailData {
  id: string;
  title: string;
  albumTitle: string;
  albumId: string;
  imageSrc: string;
  width: number;
  height: number;
  quote?: string;
  description?: string;
  editionSold: number;
  editionSize: number;
  remaining: number;
  price?: number;
  currency?: string;
  sizes?: string[];
  paper?: string;
  signed?: boolean;
  leadTime?: string;
  requestUrl?: string;
  prevPrint?: { id: string; title: string } | null;
  nextPrint?: { id: string; title: string } | null;
}

const PAPER_OPTIONS = [
  {
    id: 'rag',
    name: 'Hahnemühle Photo Rag',
    desc: '308gsm · Matte · Cotton',
    priceAdd: 0,
  },
  {
    id: 'baryta',
    name: 'Hahnemühle Baryta Satin',
    desc: '330gsm · Semi-Gloss · Baryta',
    priceAdd: 25,
  },
  {
    id: 'pearl',
    name: 'Canson Platine Fibre',
    desc: '310gsm · Pearl · Fibre-based',
    priceAdd: 15,
  },
];

function formatCurrency(amount: number, currency: string = 'EUR') {
  return new Intl.NumberFormat('en-IE', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function PrintDetailView({ data }: { data: PrintDetailData }) {
  const sizes = data.sizes ?? ['30x40cm'];
  const [selectedSizeIdx, setSelectedSizeIdx] = useState(0);
  const [selectedPaperIdx, setSelectedPaperIdx] = useState(0);

  const selectedSize = sizes[selectedSizeIdx];
  const selectedPaper = PAPER_OPTIONS[selectedPaperIdx];

  const basePrice = data.price ?? 0;
  const sizeModifier = selectedSizeIdx * 40;
  const totalPrice = basePrice + sizeModifier + selectedPaper.priceAdd;

  const editionPercent = data.editionSize > 0
    ? Math.round((data.editionSold / data.editionSize) * 100)
    : 0;

  const preset = getSizePreset(selectedSize);

  const requestSubject = encodeURIComponent(
    `Print request: ${data.title} — ${selectedSize}, ${selectedPaper.name}`,
  );
  const requestUrl =
    data.requestUrl?.split('?')[0] ?? 'mailto:ivan.caffrey@gmail.com';
  const mailtoHref = `${requestUrl}?subject=${requestSubject}`;

  const descriptionParagraphs = useMemo(() => {
    if (!data.description) return [];
    return data.description.split('\n\n').filter(Boolean);
  }, [data.description]);

  return (
    <div className="pt-[var(--nav-height,80px)]">
      {/* ─── FULL-WIDTH HERO ─── */}
      <div className="relative overflow-hidden">
        <div className="relative h-[80vh] w-full overflow-hidden">
          <Image
            src={data.imageSrc}
            alt={data.title}
            fill
            className="object-cover prints-detail-hero-img"
            sizes="100vw"
            priority
          />
        </div>
        <div className="prints-detail-hero-gradient" />
        <div className="absolute bottom-[clamp(40px,5vw,80px)] left-[clamp(24px,4vw,64px)] z-10">
          <p className="mb-3 font-[family-name:var(--font-mono)] text-[0.6rem] uppercase tracking-[0.2em] text-[var(--color-yellow)] drop-shadow-md">
            {data.albumTitle}
          </p>
          <h1 className="font-[family-name:var(--font-serif)] text-[clamp(2.5rem,5.5vw,4.5rem)] font-normal leading-[1.1] tracking-[-0.02em] drop-shadow-lg">
            {data.title}
          </h1>
        </div>
      </div>

      {/* ─── EDITORIAL BODY ─── */}
      <div className="prints-detail-body-grid mx-auto grid max-w-[1400px] gap-[clamp(40px,5vw,80px)] px-[clamp(24px,4vw,64px)] py-16 lg:grid-cols-[55%_1fr]">
        {/* Story column */}
        <div>
          <h2 className="mb-7 font-[family-name:var(--font-mono)] text-[0.6rem] uppercase tracking-[0.2em] text-[var(--text-muted)]">
            The Story
          </h2>

          {descriptionParagraphs.length > 0 ? (
            descriptionParagraphs.map((para, i) => (
              <p
                key={i}
                className={`mb-5 font-[family-name:var(--font-serif)] text-[1.05rem] leading-[1.75] text-[var(--text-body-rgb)] ${
                  i === 0 ? 'prints-dropcap text-[1.1rem]' : ''
                }`}
              >
                {para}
              </p>
            ))
          ) : (
            <p className="prints-dropcap mb-5 font-[family-name:var(--font-serif)] text-[1.1rem] leading-[1.75] text-[var(--text-body-rgb)]">
              Each print is individually inspected, numbered, and signed. Printed
              on archival paper using pigment inks rated for 200+ years of colour
              stability under museum conditions.
            </p>
          )}

          {data.quote && (
            <blockquote className="my-8 border-l-[3px] border-[var(--color-yellow)] pl-6 font-[family-name:var(--font-serif)] text-[1.1rem] italic leading-relaxed text-[var(--text-muted)]">
              &ldquo;{data.quote.replace(/^[""]|[""]$/g, '')}&rdquo;
            </blockquote>
          )}

          <p className="font-[family-name:var(--font-serif)] text-[1.05rem] leading-[1.75] text-[var(--text-body-rgb)]">
            Each print ships with a signed certificate of authenticity documenting
            the edition number, capture conditions, and archival details.
          </p>
        </div>

        {/* Purchase column */}
        <div className="prints-purchase-col lg:sticky lg:top-[calc(var(--nav-height,80px)+24px)] lg:self-start">
          <p className="mb-4 font-[family-name:var(--font-mono)] text-[0.55rem] uppercase tracking-[0.15em] text-[var(--text-muted)]">
            {data.albumTitle}
          </p>

          {/* Edition progress */}
          <div className="mb-6">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-[family-name:var(--font-mono)] text-[0.55rem] uppercase tracking-[0.1em] text-[var(--text-muted)]">
                Edition Progress
              </span>
              <span className="font-[family-name:var(--font-mono)] text-[0.55rem] tracking-[0.05em] text-[var(--text-muted)]">
                {data.editionSold} of {data.editionSize} sold
              </span>
            </div>
            <div className="prints-edition-bar">
              <div
                className="prints-edition-bar-fill"
                style={{ width: `${editionPercent}%` }}
              />
            </div>
          </div>

          {/* Size selector */}
          <p className="mb-2 font-[family-name:var(--font-mono)] text-[0.55rem] uppercase tracking-[0.15em] text-[var(--text-muted)]">
            Select Size
          </p>
          <div className="mb-6 flex border-b border-[var(--rule-color)]">
            {sizes.map((size, i) => (
              <button
                key={size}
                onClick={() => setSelectedSizeIdx(i)}
                className={`prints-size-tab font-[family-name:var(--font-mono)] text-[0.7rem] tracking-[0.08em] ${
                  selectedSizeIdx === i ? 'active' : ''
                }`}
              >
                {size}
              </button>
            ))}
          </div>

          {/* Paper selector */}
          <p className="mb-2 font-[family-name:var(--font-mono)] text-[0.55rem] uppercase tracking-[0.15em] text-[var(--text-muted)]">
            Paper
          </p>
          <div className="mb-6 flex flex-col gap-2">
            {PAPER_OPTIONS.map((paper, i) => (
              <button
                key={paper.id}
                onClick={() => setSelectedPaperIdx(i)}
                className={`prints-paper-card ${selectedPaperIdx === i ? 'active' : ''}`}
              >
                <div className="prints-paper-radio">
                  <div className="prints-paper-radio-inner" />
                </div>
                <div className="flex-1">
                  <div className="font-[family-name:var(--font-serif)] text-[0.9rem] font-medium">
                    {paper.name}
                  </div>
                  <div className="font-[family-name:var(--font-mono)] text-[0.5rem] uppercase tracking-[0.1em] text-[var(--text-muted)]">
                    {paper.desc}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Price */}
          <div className="mb-2 flex items-baseline gap-3 border-t border-[var(--rule-color)] pt-5">
            <span className="font-[family-name:var(--font-serif)] text-[2rem] font-medium tracking-[-0.02em]">
              {basePrice > 0 ? formatCurrency(totalPrice, data.currency) : 'Price on request'}
            </span>
            {data.signed && (
              <span className="font-[family-name:var(--font-mono)] text-[0.55rem] tracking-[0.1em] text-[var(--text-muted)]">
                incl. certificate
              </span>
            )}
          </div>
          {data.leadTime && (
            <p className="mb-5 font-[family-name:var(--font-mono)] text-[0.55rem] tracking-[0.1em] text-[var(--text-muted)]">
              Ships in {data.leadTime}
            </p>
          )}

          {/* CTA */}
          <a
            href={mailtoHref}
            target="_blank"
            rel="noopener noreferrer"
            className="prints-cta-btn text-center font-[family-name:var(--font-mono)] text-[0.7rem] font-bold uppercase tracking-[0.12em]"
          >
            Request This Print
          </a>
          <Link
            href={`/photos/${encodeURIComponent(data.albumId)}`}
            className="mt-4 block text-center font-[family-name:var(--font-mono)] text-[0.6rem] uppercase tracking-[0.12em] text-[var(--text-muted)] transition-colors hover:text-[var(--foreground)]"
          >
            View in Album
          </Link>
        </div>
      </div>

      {/* ─── ROOM MOCKUP ─── */}
      <div className="mx-auto max-w-[1400px] px-[clamp(24px,4vw,64px)] pb-16">
        <h3 className="mb-8 font-[family-name:var(--font-mono)] text-[0.6rem] uppercase tracking-[0.2em] text-[var(--text-muted)]">
          In Your Space
        </h3>
        <RoomMockup
          imageSrc={data.imageSrc}
          alt={data.title}
          sizeLabel={selectedSize}
          frameWidth={preset.w}
          frameHeight={preset.h}
        />
      </div>

      {/* ─── TRUST SIGNALS ─── */}
      <div className="prints-trust-grid mx-auto grid max-w-[1400px] grid-cols-3 gap-10 border-t border-[var(--rule-color)] px-[clamp(24px,4vw,64px)] py-14 text-center">
        <div>
          <span className="mb-3 block text-[1.5rem]">✦</span>
          <p className="mb-1 font-[family-name:var(--font-mono)] text-[0.6rem] uppercase tracking-[0.18em]">
            Free Shipping
          </p>
          <p className="font-[family-name:var(--font-serif)] text-[0.9rem] text-[var(--text-muted)]">
            Worldwide delivery, packaged flat between acid-free boards
          </p>
        </div>
        <div>
          <span className="mb-3 block text-[1.5rem]">◈</span>
          <p className="mb-1 font-[family-name:var(--font-mono)] text-[0.6rem] uppercase tracking-[0.18em]">
            Certificate of Authenticity
          </p>
          <p className="font-[family-name:var(--font-serif)] text-[0.9rem] text-[var(--text-muted)]">
            Signed, numbered, with capture metadata and edition details
          </p>
        </div>
        <div>
          <span className="mb-3 block text-[1.5rem]">↻</span>
          <p className="mb-1 font-[family-name:var(--font-mono)] text-[0.6rem] uppercase tracking-[0.18em]">
            14-Day Returns
          </p>
          <p className="font-[family-name:var(--font-serif)] text-[0.9rem] text-[var(--text-muted)]">
            Full refund if the print doesn&apos;t meet your expectations
          </p>
        </div>
      </div>

      {/* ─── FOOTER NAV ─── */}
      <div className="mx-auto flex max-w-[1400px] items-center justify-between border-t border-[var(--rule-color)] px-[clamp(24px,4vw,64px)] py-10">
        <Link
          href="/photos/prints"
          className="font-[family-name:var(--font-mono)] text-[0.65rem] uppercase tracking-[0.12em] transition-colors hover:text-[var(--color-yellow)]"
        >
          ← Back to The Print Room
        </Link>
        {data.nextPrint && (
          <Link
            href={`/photos/prints/${data.nextPrint.id}`}
            className="font-[family-name:var(--font-mono)] text-[0.65rem] uppercase tracking-[0.12em] transition-colors hover:text-[var(--color-yellow)]"
          >
            Next: {data.nextPrint.title} →
          </Link>
        )}
      </div>
    </div>
  );
}
