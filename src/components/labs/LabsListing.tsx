"use client";

import { useMemo, useState, type CSSProperties } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Star } from "lucide-react";
import type { Lab } from "@/lib/labs";
import Rolodex, {
  FilterLink,
  ListingEmptyState,
  formatListingDate,
  type RolodexItem,
} from "@/components/shared/Rolodex";
import { getBadgeAccentVars, getTileGradient } from "./labBadgeColors";

type LabsListingProps = {
  labs: Lab[];
};

const ALL_FILTER = "All";
const PINNED_FILTER = "Pinned";
const TAX_FILTER = "Tax";

export default function LabsListing({ labs }: LabsListingProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState(ALL_FILTER);

  const badges = useMemo(
    () => Array.from(new Set(labs.map((lab) => lab.badge))).sort(),
    [labs],
  );

  const filters = useMemo(
    () => [ALL_FILTER, PINNED_FILTER, TAX_FILTER, ...badges],
    [badges],
  );

  const filteredLabs = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return labs.filter((lab) => {
      const matchesSearch =
        query === "" ||
        [lab.title, lab.description, lab.badge, lab.meta].some((value) =>
          value.toLowerCase().includes(query),
        );

      if (!matchesSearch) return false;

      if (selectedFilter === ALL_FILTER) return true;
      if (selectedFilter === PINNED_FILTER) return Boolean(lab.isPinned);
      if (selectedFilter === TAX_FILTER) {
        return [lab.title, lab.description, lab.href, lab.meta].some((value) =>
          value.toLowerCase().includes("tax"),
        );
      }
      return lab.badge === selectedFilter;
    });
  }, [labs, searchQuery, selectedFilter]);

  const items: RolodexItem[] = filteredLabs.map((lab, index) => {
    const position = String(index + 1).padStart(2, "0");

    return {
      key: lab.href,
      href: lab.href,
      title: lab.title,
      summary: lab.description,
      cta: "Open lab",
      meta: (
        <>
          <span>{position}</span>
          <span>{formatListingDate(lab.publishedAt)}</span>
          <span className="badge-accent" style={getBadgeAccentVars(lab.badge)}>
            {lab.badge}
          </span>
          <span>{lab.meta}</span>
          {lab.isPinned && (
            <span className="inline-flex items-center gap-[6px] text-[var(--foreground)]">
              <Star
                className="h-3 w-3 fill-[var(--color-yellow)] text-[var(--color-yellow)]"
                aria-hidden
              />
              Pinned
            </span>
          )}
        </>
      ),
      media: lab.image ? (
        <Image
          src={lab.image}
          alt={lab.imageAlt ?? ""}
          fill
          sizes="(max-width: 860px) 100vw, 1400px"
          priority={index === 0}
        />
      ) : (
        <div
          className="rolodex-media-generated"
          style={
            {
              "--tile-gradient": getTileGradient(lab.href, lab.badge),
            } as CSSProperties
          }
        >
          <span className="rolodex-media-index" aria-hidden>
            {position}
          </span>
          <span className="rolodex-media-label" aria-hidden>
            {lab.badge}
          </span>
        </div>
      ),
    };
  });

  return (
    <div className="pb-24">
      <div className="mx-auto max-w-[1400px] px-5 pt-16 sm:px-10">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-stone-500 transition-colors hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="font-mono text-sm font-medium uppercase tracking-[0.2em]">
            Back to Home
          </span>
        </Link>

        <h1 className="text-[clamp(3rem,7vw,5.5rem)] font-light leading-[0.95] tracking-[-0.02em]">
          Labs
        </h1>
        <p className="mt-5 max-w-[520px] font-serif text-[1.05rem] font-light italic leading-relaxed text-[var(--text-muted)]">
          WIP explorations that lean on APIs, data viz, and playful UI patterns.
          Pinned favourites stay first; everything else is newest first.
        </p>

        <div className="mt-14 flex flex-wrap items-baseline justify-between gap-6 border-b border-[var(--rule-color)] pb-4">
          <div className="flex flex-wrap gap-[22px]">
            {filters.map((filter) => (
              <FilterLink
                key={filter}
                label={filter}
                isActive={selectedFilter === filter}
                accent={
                  badges.includes(filter)
                    ? getBadgeAccentVars(filter)
                    : undefined
                }
                onClick={() =>
                  setSelectedFilter(
                    filter === selectedFilter ? ALL_FILTER : filter,
                  )
                }
              />
            ))}
          </div>

          <input
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search"
            aria-label="Search labs"
            className="w-full border-b border-[var(--rule-color)] bg-transparent py-1 font-mono text-[0.63rem] uppercase tracking-[0.18em] outline-none transition-colors placeholder:text-[var(--text-muted)] focus:border-[var(--color-yellow)] sm:w-[200px]"
          />
        </div>
      </div>

      {items.length > 0 ? (
        <Rolodex items={items} />
      ) : (
        <ListingEmptyState
          message="No labs found matching your criteria."
          onClear={() => {
            setSearchQuery("");
            setSelectedFilter(ALL_FILTER);
          }}
        />
      )}
    </div>
  );
}
