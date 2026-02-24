"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";

const HERO_SLIDES = [
  { src: "/photos/Faves/DSCF3535.jpg", alt: "Favourites" },
  { src: "/photos/BnW/000226840017.jpg", alt: "Black & White" },
  { src: "/photos/Diptych/DSCF8969.jpg", alt: "Diptychs" },
];

const INTERVAL = 5000;

export default function HeroSection() {
  const [current, setCurrent] = useState(0);
  const [mounted, setMounted] = useState(false);
  const fillRef = useRef<HTMLDivElement>(null);

  const restartProgress = useCallback(() => {
    const el = fillRef.current;
    if (!el) return;
    el.style.animation = "none";
    void el.offsetWidth;
    el.style.animation = "ruleFill 5s linear forwards";
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    restartProgress();

    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % HERO_SLIDES.length);
      restartProgress();
    }, INTERVAL);

    return () => clearInterval(timer);
  }, [mounted, restartProgress]);

  const counter = `${String(current + 1).padStart(2, "0")} / ${String(HERO_SLIDES.length).padStart(2, "0")}`;

  return (
    <section className="relative h-[85vh] w-full overflow-hidden">
      {/* Slides */}
      {HERO_SLIDES.map((slide, i) => (
        <div
          key={slide.src}
          className={`absolute inset-0 transition-opacity duration-[1500ms] ease-in-out ${
            i === current ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="relative h-full w-full overflow-hidden" style={{ animation: "kenBurns 15s ease-in-out alternate infinite" }}>
            <Image
              src={slide.src}
              alt={slide.alt}
              fill
              className="object-cover"
              priority={i === 0}
              sizes="100vw"
            />
          </div>
        </div>
      ))}

      {/* Overlay with editorial content */}
      <div className="absolute inset-0 z-10 flex flex-col justify-end bg-gradient-to-t from-[rgba(10,10,10,0.75)] via-[rgba(10,10,10,0.15)_40%] to-transparent p-8 sm:p-12 lg:p-20 pb-16 sm:pb-20">
        <h1 className="max-w-[700px] font-serif text-[clamp(3rem,7vw,6rem)] font-bold leading-none tracking-tight text-white">
          Putting Data in the Frame
        </h1>
        {/* Timer bar */}
        <div className="mt-6 h-[3px] w-[72px] overflow-hidden bg-[var(--hero-track)]">
          <div
            ref={fillRef}
            className="h-full w-full origin-left bg-[var(--color-yellow)]"
            style={{ transform: "scaleX(0)" }}
          />
        </div>
      </div>

      {/* Slide counter */}
      <div className="absolute bottom-16 right-8 z-10 font-mono text-[0.75rem] text-white/40 sm:bottom-20 sm:right-12">
        {counter}
      </div>
    </section>
  );
}
