"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Star } from "lucide-react";

export type Lab = {
  title: string;
  description: string;
  href: string;
  badge: string;
  meta: string;
  publishedAt: string;
  isPinned?: boolean;
};

type LabsListingProps = {
  labs: Lab[];
};

const DATE_FORMATTER = new Intl.DateTimeFormat("en-IE", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
  year: "numeric",
});

export default function LabsListing({ labs }: LabsListingProps) {
  const [selectedFilter, setSelectedFilter] = useState("All");

  const filters = useMemo(() => {
    const badges = Array.from(new Set(labs.map((lab) => lab.badge))).sort();
    return ["All", "Pinned", ...badges];
  }, [labs]);

  const sortedLabs = useMemo(() => {
    return [...labs].sort((a, b) => {
      if (Boolean(a.isPinned) !== Boolean(b.isPinned)) {
        return a.isPinned ? -1 : 1;
      }

      const dateDelta =
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();

      if (dateDelta !== 0) {
        return dateDelta;
      }

      return a.title.localeCompare(b.title);
    });
  }, [labs]);

  const filteredLabs = useMemo(() => {
    if (selectedFilter === "All") {
      return sortedLabs;
    }

    if (selectedFilter === "Pinned") {
      return sortedLabs.filter((lab) => lab.isPinned);
    }

    return sortedLabs.filter((lab) => lab.badge === selectedFilter);
  }, [selectedFilter, sortedLabs]);

  return (
    <>
      <div className="mb-16 rounded-[2.5rem] border border-stone-200/80 bg-white/80 p-6 shadow-[0_10px_40px_-25px_rgba(0,0,0,0.35)] backdrop-blur-sm dark:border-stone-800/70 dark:bg-[#0b0b0b]/80">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">
              Filter labs
            </p>
            <p className="mt-2 text-sm text-stone-500">
              Pinned favourites stay first; everything else is newest first.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {filters.map((filter) => (
              <FilterChip
                key={filter}
                label={filter}
                isActive={selectedFilter === filter}
                onClick={() => setSelectedFilter(filter)}
              />
            ))}
          </div>
        </div>
      </div>

      {filteredLabs.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {filteredLabs.map((lab) => (
            <LabCard key={lab.href} lab={lab} />
          ))}
        </div>
      ) : (
        <div className="rounded-[2.5rem] border border-dashed border-stone-200 bg-white py-24 text-center text-stone-500 dark:border-stone-700 dark:bg-[#0b0b0b] dark:text-stone-400">
          <p className="text-lg">No labs found for this filter.</p>
          <button
            onClick={() => setSelectedFilter("All")}
            className="mt-4 font-mono text-xs uppercase tracking-[0.3em] text-stone-900 underline decoration-yellow-400 decoration-2 underline-offset-4 transition-colors hover:text-yellow-600 dark:text-white"
          >
            Clear filter
          </button>
        </div>
      )}
    </>
  );
}

function FilterChip({
  label,
  isActive,
  onClick,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-[10px] font-black uppercase tracking-[0.3em] transition-colors ${
        isActive
          ? "border-stone-900 bg-stone-900 text-white dark:border-white dark:bg-white dark:text-stone-900"
          : "border-stone-200 text-stone-500 hover:border-stone-900 hover:text-stone-900 dark:border-stone-700 dark:text-stone-400 dark:hover:text-white"
      }`}
    >
      <span className="chip-text">{label}</span>
    </button>
  );
}

function LabCard({ lab }: { lab: Lab }) {
  return (
    <Link
      href={lab.href}
      className="group relative flex h-full flex-col overflow-hidden rounded-[2.5rem] border border-stone-200 bg-white p-8 shadow-[0_10px_40px_-25px_rgba(0,0,0,0.4)] transition-transform duration-500 hover:-translate-y-1 hover:shadow-[0_25px_60px_-35px_rgba(0,0,0,0.4)] dark:border-stone-800 dark:bg-[#0f0f0f]"
    >
      <div className="mb-8 flex items-start justify-between gap-4 text-xs font-bold uppercase tracking-[0.3em] text-stone-400">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-lime-100 px-3 py-1 text-lime-700 dark:bg-lime-950/60 dark:text-lime-300">
            <span className="chip-text">{lab.badge}</span>
          </span>
          {lab.isPinned && (
            <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-3 py-1 text-yellow-700 dark:bg-yellow-950/60 dark:text-yellow-300">
              <Star className="h-3 w-3 fill-current" />
              <span className="chip-text">Pinned</span>
            </span>
          )}
        </div>
        <time
          dateTime={lab.publishedAt}
          className="shrink-0 pt-1 text-right font-mono text-[10px] font-black text-stone-400"
        >
          {DATE_FORMATTER.format(new Date(lab.publishedAt))}
        </time>
      </div>

      <div className="space-y-4">
        <h2 className="text-3xl font-black tracking-tight text-stone-900 sm:text-4xl dark:text-white">
          {lab.title}
        </h2>
        <p className="text-base leading-relaxed text-stone-600 dark:text-stone-300">
          {lab.description}
        </p>
      </div>

      <div className="mt-auto flex flex-col gap-4 pt-10 text-sm text-stone-500 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <span className="block font-mono uppercase tracking-[0.3em]">
            {lab.meta}
          </span>
        </div>
        <span className="flex items-center gap-2 font-semibold text-stone-900 transition-colors group-hover:text-yellow-600 dark:text-white dark:group-hover:text-yellow-400">
          View Lab
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
        </span>
      </div>

      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-10"
        style={{
          backgroundImage: "linear-gradient(135deg, #bef264 0%, #0ea5e9 100%)",
        }}
      />
    </Link>
  );
}
