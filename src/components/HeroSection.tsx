"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowDown } from "lucide-react";

export default function HeroSection() {
  const [viewportHeight, setViewportHeight] = useState<number>(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
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

  const scrollToNextSection = () => {
    const nextSection = document.getElementById("selected-works-section");
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: "smooth" });
    } else {
      window.scrollTo({
        top: window.innerHeight,
        behavior: "smooth"
      });
    }
  };

  // Approximate header height is 81px
  const sectionHeight = mounted && viewportHeight > 0 
    ? `${viewportHeight - 81}px` 
    : 'calc(100vh - 81px)';

  return (
    <section 
      className="flex w-full flex-col pt-6 pb-4 relative"
      style={{ 
        minHeight: sectionHeight,
        display: 'flex',
        flexDirection: 'column',
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
            Charts, dog portraits, occasional opinions.
          </p>
        </div>
      </div>

      {/* Scroll Indicator */}
      <AnimatePresence>
        {mounted && (
          <motion.div 
            className="cursor-pointer flex flex-col items-center gap-3 z-10 py-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
            onClick={scrollToNextSection}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 ml-1">
              Scroll
            </span>
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ 
                duration: 2, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              className="rounded-full border border-zinc-200 p-2.5 dark:border-zinc-800 bg-white/50 dark:bg-black/50 backdrop-blur-sm shadow-sm"
            >
              <ArrowDown className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

