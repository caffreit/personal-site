"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export type HomeAlbum = { href: string; title: string; cover: string; count: number };

type Props = { albums: HomeAlbum[]; frames: number };

/**
 * Two rows that scroll sideways. Every fifth album is a large tile; if that leaves
 * an odd number of small ones, the last is made tall so the grid ends flush.
 */
function tileSizes(count: number): ("big" | "tall" | "")[] {
  const sizes = Array.from({ length: count }, (_, i) => (i % 5 === 0 ? "big" : "")) as ("big" | "tall" | "")[];
  const small = sizes.filter((s) => s === "").length;
  if (small % 2 === 1) sizes[sizes.lastIndexOf("")] = "tall";
  return sizes;
}

export default function AlbumStrip({ albums, frames }: Props) {
  const scroller = useRef<HTMLDivElement>(null);
  const drag = useRef({ down: false, moved: false, x0: 0, s0: 0 });
  const [bar, setBar] = useState({ width: 100, left: 0 });
  const [edges, setEdges] = useState({ start: true, end: false });
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;

    const update = () => {
      const max = el.scrollWidth - el.clientWidth;
      const fraction = max ? el.scrollLeft / max : 1;
      const width = el.clientWidth / el.scrollWidth;
      setBar({ width: width * 100, left: fraction * (1 - width) * 100 });
      setEdges({ start: el.scrollLeft < 4, end: el.scrollLeft > max - 4 });
    };

    // drag to scroll with a mouse; touch and trackpads scroll natively
    const onMove = (e: PointerEvent) => {
      const d = drag.current;
      if (!d.down) return;
      const dx = e.clientX - d.x0;
      if (Math.abs(dx) > 5 && !d.moved) {
        d.moved = true;
        setDragging(true);
      }
      if (d.moved) el.scrollLeft = d.s0 - dx;
    };
    const onUp = () => {
      drag.current.down = false;
      setTimeout(() => setDragging(false), 0);
    };

    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, []);

  const step = (direction: number) => {
    const el = scroller.current;
    el?.scrollBy({ left: direction * el.clientWidth * 0.75, behavior: "smooth" });
  };

  const sizes = tileSizes(albums.length);

  return (
    <section className="sec photo-sec" id="photography">
      <div className="wrap">
        <div className="sec-head">
          <h2>
            <i style={{ background: "var(--yellow)" }} />
            Photography
          </h2>
          <div className="meta">
            <span>Drag or scroll sideways for all {albums.length}</span>
          </div>
        </div>
      </div>

      <div className={`strip${edges.end ? " at-end" : ""}`}>
        <div
          ref={scroller}
          className={`albums${dragging ? " dragging" : ""}`}
          onPointerDown={(e) => {
            if (e.pointerType !== "mouse") return;
            drag.current = { down: true, moved: false, x0: e.clientX, s0: e.currentTarget.scrollLeft };
          }}
          onClickCapture={(e) => {
            // a drag that ends on a tile shouldn't follow its link
            if (drag.current.moved) {
              e.preventDefault();
              e.stopPropagation();
              drag.current.moved = false;
            }
          }}
        >
          {albums.map((album, i) => (
            <Link className={`album${sizes[i] ? ` ${sizes[i]}` : ""}`} href={album.href} key={album.href} draggable={false}>
              <Image
                src={album.cover}
                alt=""
                fill
                draggable={false}
                sizes={sizes[i] === "big" ? "(max-width: 860px) 84vw, 38vw" : "(max-width: 860px) 42vw, 19vw"}
              />
              <span className="lbl">
                <b>{album.title}</b>
                <span>{sizes[i] === "big" ? `${album.count} frames` : album.count}</span>
              </span>
            </Link>
          ))}
        </div>
      </div>

      <div className="wrap">
        <div className="albums-foot">
          <span className="count">
            {albums.length} albums · {frames} frames
          </span>
          <div className="scrub">
            <button type="button" aria-label="Previous albums" disabled={edges.start} onClick={() => step(-1)}>
              ←
            </button>
            <span className="track">
              <i style={{ width: `${bar.width}%`, left: `${bar.left}%` }} />
            </span>
            <button type="button" aria-label="More albums" disabled={edges.end} onClick={() => step(1)}>
              →
            </button>
          </div>
          <Link href="/photos">All albums →</Link>
        </div>
      </div>
    </section>
  );
}
