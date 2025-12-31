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

  const current = theme ?? resolvedTheme ?? "light";
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
      className="flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-1.5 py-1.5 text-xs font-medium text-zinc-700 shadow-sm transition hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
    >
      <span
        className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] transition ${
          !isDark
            ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
            : "text-zinc-400"
        }`}
      >
        <svg
          viewBox="0 0 24 24"
          className="h-3.5 w-3.5"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="4" fill="currentColor" />
          <path
            d="M12 2v2m0 16v2M4 12H2m20 0h-2M5.64 5.64 7.05 7.05m9.9 9.9 1.41 1.41M5.64 18.36 7.05 16.95m9.9-9.9 1.41-1.41"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </span>
      <span
        className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] transition ${
          isDark
            ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
            : "text-zinc-400"
        }`}
      >
        <svg
          viewBox="0 0 24 24"
          className="h-3.5 w-3.5"
          aria-hidden="true"
        >
          <path
            d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
            fill="currentColor"
          />
        </svg>
      </span>
    </button>
  );
}

