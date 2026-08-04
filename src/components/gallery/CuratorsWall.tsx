"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";
import "@/styles/curators-wall.css";
import type { WallPlate, WallPlatePhoto } from "@/lib/favesWallTypes";

type CuratorsWallProps = {
  title: string;
  description?: string;
  plates: WallPlate[];
};

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function formatPrice(price: number, currency = "EUR") {
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}

function wallOrient(width: number, height: number): "portrait" | "landscape" | "pano" {
  const r = width / height;
  if (r > 1.9) return "pano";
  if (r > 1) return "landscape";
  return "portrait";
}

function PlateCaption({
  photo,
  total,
}: {
  photo: WallPlatePhoto;
  total: number;
}) {
  const print = photo.print;
  const soldOut =
    print?.status === "sold_out" || (print != null && print.sold >= print.editionSize);

  return (
    <div className="cw-cap">
      <div className="cw-cap-head">
        <span className="cw-cap-num">
          {pad(photo.n)} / {pad(total)}
        </span>
        {print && (
          <span className="cw-cap-edition" data-sold={soldOut ? "true" : "false"}>
            {soldOut
              ? "Sold out"
              : `Edition of ${print.editionSize} · ${print.sold} sold`}
          </span>
        )}
      </div>
      <div className="cw-cap-loc">{photo.location || "Untitled"}</div>
      {print && (
        <div className="cw-cap-print" data-sold={soldOut ? "true" : "false"}>
          <span className="cw-price">
            {soldOut
              ? "Sold out"
              : print.price != null
                ? formatPrice(print.price, print.currency)
                : "Enquiry"}
          </span>
          {!soldOut && (
            <a href={print.requestUrl || "mailto:ivan.caffrey@gmail.com"}>Enquire →</a>
          )}
        </div>
      )}
    </div>
  );
}

function PlateSection({
  plate,
  index,
  total,
  onOpen,
}: {
  plate: WallPlate;
  index: number;
  total: number;
  onOpen: (filename: string) => void;
}) {
  const ref = useRef<HTMLElement>(null);
  const align = index % 2 === 0 ? "left" : "right";
  const orient =
    plate.layout === "inset" && plate.photos[0]
      ? wallOrient(plate.photos[0].width, plate.photos[0].height)
      : undefined;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            el.dataset.in = "true";
            observer.unobserve(el);
          }
        });
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      className="cw-plate"
      data-layout={plate.layout}
      data-align={align}
      data-orient={orient}
      data-size={plate.size}
    >
      <div className="cw-wrap">
        <div className="cw-plate-mark">Plate {pad(index + 1)}</div>
        <div className="cw-row">
          {plate.photos.map((photo) => {
            const ratio = photo.width / photo.height;
            const flexStyle =
              plate.layout === "pair" || plate.layout === "triple"
                ? { flex: `${ratio} ${ratio} 0%` }
                : undefined;

            return (
              <div key={photo.filename} className="cw-unit" style={flexStyle}>
                <button
                  type="button"
                  className="cw-frame"
                  onClick={() => onOpen(photo.filename)}
                  aria-label={`View ${photo.location || photo.filename}`}
                >
                  <Image
                    src={photo.url}
                    alt={photo.location || photo.filename}
                    width={photo.width}
                    height={photo.height}
                    sizes={
                      plate.layout === "bleed"
                        ? "100vw"
                        : plate.layout === "pair" || plate.layout === "triple"
                          ? "(max-width: 900px) 100vw, 50vw"
                          : "(max-width: 900px) 100vw, 82vw"
                    }
                  />
                </button>
                <PlateCaption photo={photo} total={total} />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function CuratorsWall({ title, description, plates }: CuratorsWallProps) {
  const flat = useMemo(() => plates.flatMap((p) => p.photos), [plates]);
  const total = flat.length;
  const locationCount = useMemo(
    () => new Set(flat.map((p) => p.location).filter(Boolean)).size,
    [flat],
  );
  const editions = useMemo(() => {
    const withPrint = flat.filter((p) => p.print);
    const available = withPrint.filter(
      (p) => p.print && p.print.status !== "sold_out" && p.print.sold < p.print.editionSize,
    );
    return { available: available.length, total: withPrint.length };
  }, [flat]);

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    const setScrollbarWidth = () => {
      const sbw = window.innerWidth - document.documentElement.clientWidth;
      document.documentElement.style.setProperty("--sbw", `${sbw}px`);
    };
    setScrollbarWidth();
    window.addEventListener("resize", setScrollbarWidth);
    return () => window.removeEventListener("resize", setScrollbarWidth);
  }, []);

  const openPhoto = (filename: string) => {
    const idx = flat.findIndex((p) => p.filename === filename);
    if (idx < 0) return;
    setLightboxIndex(idx);
    setLightboxOpen(true);
  };

  return (
    <div className="curators-wall">
      <div className="cw-wrap">
        <header className="cw-colophon">
          <Link className="cw-back" href="/photos">
            <span className="cw-arrow">←</span> Back to Albums
          </Link>
          <div className="cw-colophon-grid">
            <div>
              <h1 className="cw-title">{title}</h1>
              {description && <p className="cw-intro">{description}</p>}
            </div>
            <div className="cw-ledger">
              <div className="cw-ledger-row">
                <span>Plates</span>
                <b>{plates.length}</b>
              </div>
              <div className="cw-ledger-row">
                <span>Photographs</span>
                <b>{total}</b>
              </div>
              <div className="cw-ledger-row">
                <span>Locations</span>
                <b>{locationCount}</b>
              </div>
              <div className="cw-ledger-row">
                <span>Editions available</span>
                <b>
                  {editions.available} of {editions.total}
                </b>
              </div>
            </div>
          </div>
        </header>
      </div>

      <main>
        {plates.map((plate, i) => (
          <PlateSection
            key={`plate-${i}-${plate.photos.map((p) => p.filename).join("-")}`}
            plate={plate}
            index={i}
            total={total}
            onOpen={openPhoto}
          />
        ))}
      </main>

      <div className="cw-wrap">
        <footer className="cw-end">
          <span>
            {title} — {total} frames
          </span>
          <Link href="/photos">Back to Albums</Link>
        </footer>
      </div>

      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        index={lightboxIndex}
        slides={flat.map((img) => ({
          src: img.url,
          title: img.location || img.caption || "Untitled",
        }))}
        plugins={[Zoom]}
        zoom={{
          maxZoomPixelRatio: 4,
          zoomInMultiplier: 2,
          scrollToZoom: true,
        }}
      />
    </div>
  );
}
