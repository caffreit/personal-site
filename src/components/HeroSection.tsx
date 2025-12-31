"use client";

import { useEffect, useState } from "react";

export default function HeroSection() {
  const [viewportHeight, setViewportHeight] = useState<number>(0);

  useEffect(() => {
    // Set initial viewport height
    const setHeight = () => {
      setViewportHeight(window.innerHeight);
    };

    // Set on mount
    setHeight();

    // Update on resize
    window.addEventListener("resize", setHeight);
    
    // Also handle orientation change on mobile
    window.addEventListener("orientationchange", () => {
      setTimeout(setHeight, 100);
    });

    return () => {
      window.removeEventListener("resize", setHeight);
      window.removeEventListener("orientationchange", setHeight);
    };
  }, []);

  return (
    <section 
      className="flex w-full flex-col pt-6 pb-10"
      style={{ 
        minHeight: viewportHeight > 0 ? `${viewportHeight}px` : '100vh',
        display: 'flex',
        justifyContent: 'space-between'
      }}
    >
      {/* Hero Text Area */}
      <div className="mb-12 flex flex-col justify-between gap-8 pt-10 lg:flex-row lg:items-end lg:pt-20">
        <h1 className="max-w-4xl text-[11vw] font-bold leading-[0.85] tracking-tighter text-[#0A0A0A] dark:text-white lg:text-[12vw]">
          <span className="block">Visual Analytics</span>
          <span className="block text-2xl font-medium tracking-normal text-zinc-400 dark:text-zinc-500 lg:text-4xl">
             by <span className="text-[var(--color-yellow)]">drdimg</span>
          </span>
        </h1>
        <div className="max-w-xs lg:max-w-sm lg:pb-4 lg:text-right">
          <p className="text-lg leading-relaxed text-zinc-500 dark:text-zinc-400 lg:text-xl">
            Putting data in the frame.
            <br />
            A collection of moments and stories.
          </p>
        </div>
      </div>
    </section>
  );
}

