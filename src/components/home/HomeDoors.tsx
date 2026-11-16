"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type CSSProperties, type MouseEvent } from "react";
import PurchaseWidget, { PURCHASE_ITEMS } from "./PurchaseWidget";
import { FINE_POINTER, REDUCED_MOTION, useMediaQuery } from "./useMediaQuery";

export type DoorPhoto = { src: string; caption: string };

export type DoorEssay = {
  href: string;
  title: string;
  dek?: string;
  excerpt: string;
  date: string;
  readTime: string;
  image?: string;
  category?: string;
};

type Props = {
  photos: DoorPhoto[];
  essay?: DoorEssay;
  counts: { essays: number; labs: number; albums: number };
};

/** How long each door stays open before the next one takes over (ms). */
const DWELL = [9600, 8000, 9000];
const PHOTO_INTERVAL = 3200;
const LAB_HREF = "/labs/irish-purchase-tax-time-2026";
const LABELS = ["Photographs", "Essays", "Labs"];

export default function HomeDoors({ photos, essay, counts }: Props) {
  const [current, setCurrent] = useState(0);
  const [held, setHeld] = useState(false); // paused while the pointer or focus is inside
  // paused for good: the visitor's choice once they make one, otherwise their reduced-motion setting
  const [userStopped, setUserStopped] = useState<boolean | null>(null);
  const [epoch, setEpoch] = useState(0); // bumping this restarts the progress bar and the timer
  const [photoIndex, setPhotoIndex] = useState(0);
  const [itemIndex, setItemIndex] = useState(0);

  const doorRefs = useRef<(HTMLDivElement | null)[]>([]);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const loadedPhotos = useRef<boolean[]>([]);

  const finePointer = useMediaQuery(FINE_POINTER);
  const reducedMotion = useMediaQuery(REDUCED_MOTION);
  const stopped = userStopped ?? reducedMotion;

  useEffect(() => () => clearTimeout(hoverTimer.current), []);

  const running = !held && !stopped;

  // one door is always open; it moves on by itself until someone takes over
  useEffect(() => {
    if (!running) return;
    const timer = setTimeout(() => {
      setCurrent((c) => (c + 1) % LABELS.length);
      setEpoch((e) => e + 1);
    }, DWELL[current]);
    return () => clearTimeout(timer);
  }, [current, running, epoch]);

  // the photo door flicks through its frames while it is open
  useEffect(() => {
    if (current !== 0 || photos.length < 2 || reducedMotion) return;
    const timer = setInterval(() => {
      setPhotoIndex((i) => {
        const next = (i + 1) % photos.length;
        return loadedPhotos.current[next] ? next : i; // wait for a frame that is still downloading
      });
    }, PHOTO_INTERVAL);
    return () => clearInterval(timer);
  }, [current, photos.length, reducedMotion]);

  const openDoor = useCallback((n: number) => {
    setCurrent(n);
    setEpoch((e) => e + 1);
  }, []);

  const release = useCallback(() => {
    setHeld(false);
    setEpoch((e) => e + 1);
  }, []);

  const stopCycle = useCallback(() => setUserStopped(true), []);

  const onDoorClick = (n: number) => (e: MouseEvent<HTMLDivElement>) => {
    if (n === current) return;
    openDoor(n);
    // the closed door's tab is a real button; once the door opens the tab hides, so hand focus to the door
    if ((e.target as HTMLElement).closest(".tab")) doorRefs.current[n]?.focus({ preventScroll: true });
  };

  const doorProps = (n: number, kind: string) => ({
    ref: (el: HTMLDivElement | null) => {
      doorRefs.current[n] = el;
    },
    className: `door door-${kind}${n === current ? " open" : ""}`,
    role: "group" as const,
    tabIndex: -1,
    "aria-label": LABELS[n],
    onClick: onDoorClick(n),
    onMouseEnter: () => {
      if (!finePointer) return;
      clearTimeout(hoverTimer.current);
      hoverTimer.current = setTimeout(() => openDoor(n), 140);
    },
    onMouseLeave: () => clearTimeout(hoverTimer.current),
  });

  const progress = (n: number) => (
    <div className="prog">
      <i
        key={epoch}
        className={n === current && !stopped ? "run" : undefined}
        style={{ "--dwell": `${DWELL[n]}ms` } as CSSProperties}
      />
    </div>
  );

  const tab = (n: number, peek: string) => (
    <button className="tab" type="button" aria-expanded={n === current} aria-controls={`door-${n}`}>
      <span className="n">{String(n + 1).padStart(2, "0")}</span>
      <span className="lbl">{LABELS[n]}</span>
      <span className="peek">{peek}</span>
    </button>
  );

  return (
    <>
      <section
        className={`doors${held ? " held" : ""}${stopped ? " stopped" : ""}`}
        aria-label="Photographs, essays and labs"
        onMouseEnter={() => finePointer && setHeld(true)}
        onMouseLeave={() => finePointer && release()}
        onFocus={() => setHeld(true)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget)) release();
        }}
      >
        {/* 01 photographs */}
        <div {...doorProps(0, "photo")}>
          {progress(0)}
          <div className="bg">
            {photos.map((photo, i) => (
              <Image
                key={photo.src}
                src={photo.src}
                alt=""
                fill
                sizes="100vw"
                priority={i === 0}
                className={i === photoIndex ? "on" : undefined}
                onLoad={() => {
                  loadedPhotos.current[i] = true;
                }}
              />
            ))}
          </div>
          {tab(0, `${counts.albums} albums`)}
          <div className="content" id="door-0">
            <div className="rise">
              <h1>
                Putting <em>data</em>
                <br />
                in the frame.
              </h1>
              <p className="sub">Photographs, essays and small interactive labs, mostly from Dublin.</p>
              <Link className="more" href="/photos">
                Open the albums →
              </Link>
            </div>
            <div className="exif rise">
              <div>{photos[photoIndex]?.caption}</div>
              <div className="dots">
                {photos.map((photo, i) => (
                  <b key={photo.src} className={i === photoIndex ? "on" : undefined} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 02 essays */}
        <div {...doorProps(1, "essay")}>
          {progress(1)}
          <div className="bg" />
          {tab(1, essay ? `Latest · ${essay.title}` : "Writing")}
          <div className="content" id="door-1">
            {essay && (
              <>
                <div className="rise">
                  <div className="kick">
                    <span>Latest essay</span>
                    <span>{essay.date}</span>
                    <span>{essay.readTime}</span>
                  </div>
                  <h2>{essay.title}</h2>
                  {essay.dek && <p className="dek">{essay.dek}</p>}
                  <p className="excerpt">{essay.excerpt}</p>
                  <Link className="more" href={essay.href}>
                    Keep reading →
                  </Link>
                </div>
                {essay.image && (
                  <figure className="plate">
                    <Image src={essay.image} alt="" width={1440} height={1080} sizes="720px" />
                    <figcaption>
                      FIG. 1{essay.category ? ` · ${essay.category}` : ""} · {counts.essays} essays
                    </figcaption>
                  </figure>
                )}
              </>
            )}
          </div>
        </div>

        {/* 03 labs */}
        <div {...doorProps(2, "lab")}>
          {progress(2)}
          <div className="bg" />
          {tab(2, "Try one now")}
          <div className="content" id="door-2">
            <div className="intro rise">
              <div className="kick">Lab · What Did That Really Cost?</div>
              <h2>
                How long do you work for <em>{PURCHASE_ITEMS[itemIndex].name}</em>?
              </h2>
              <p className="dek">
                Pick something, set your salary. The answer counts the VAT in the price and the income tax on the
                money you earned to pay it.
              </p>
              <Link className="more" href={LAB_HREF}>
                Open the full lab →
              </Link>
            </div>
            <PurchaseWidget
              itemIndex={itemIndex}
              onItemChange={setItemIndex}
              active={current === 2}
              onEngage={stopCycle}
            />
          </div>
        </div>
      </section>

      {/* the strip that shows there is more below */}
      <div className="peekbar">
        <div className="wrap">
          <a href="#writing">
            <span className="arrow">↓</span> Writing · Labs · Photography
          </a>
          <div className="latest">
            <span>
              <i style={{ background: "var(--emerald)" }} />
              {counts.essays} essays
            </span>
            <span>
              <i style={{ background: "var(--accent)" }} />
              {counts.labs} labs
            </span>
            <span>
              <i style={{ background: "var(--yellow)" }} />
              {counts.albums} albums
            </span>
            <button
              className={`auto${stopped ? " stopped" : ""}`}
              type="button"
              aria-label={stopped ? "Resume the door cycle" : "Pause the door cycle"}
              onClick={() => {
                setUserStopped(!stopped);
                setEpoch((e) => e + 1);
              }}
            >
              <span className="ico" />
              <span>{stopped ? "Paused" : "Auto"}</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
