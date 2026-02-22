'use client';

import { useTheme } from "next-themes";
import React, { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const current = theme ?? resolvedTheme ?? "dark";
  const isDark = current === "dark";

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      title="Toggle theme"
      className="group relative inline-flex h-9 items-center gap-2 rounded-full border border-[var(--rule-color)] px-2.5 font-mono text-[0.7rem] tracking-wide text-[var(--text-muted)] transition-[color,border-color] duration-300 hover:border-zinc-500 hover:text-[var(--foreground)] cursor-pointer"
    >
      <span
        className={`inline-flex h-6 w-6 items-center justify-center rounded-full bg-[var(--rule-color)] text-sm leading-none text-[var(--foreground)] transition-transform duration-300 ${
          isDark ? "translate-x-0" : "translate-x-[2px] rotate-180"
        }`}
      >
        {isDark ? "☾" : "☀"}
      </span>
      <span className="pr-1">{isDark ? "Dark" : "Light"}</span>
    </button>
  );
}
