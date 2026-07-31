'use client';

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const NARROW = "(max-width: 860px)";

// Below 860px the panels share one viewport-height stack, so past this many
// items each closed panel gets too short to read. Longer sets fall back to a
// plain scrolling index instead of the pinned rolodex.
const MAX_PINNED_ITEMS = 8;

export type RolodexItem = {
  key: string;
  href: string;
  title: string;
  summary?: string;
  cta: string;
  meta: ReactNode;
  media: ReactNode;
};

export function formatListingDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function FilterLink({
  label,
  isActive,
  onClick,
  accent,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
  /* Custom properties from getBadgeAccentVars: when present the rule under the
     label is drawn in the category's colour instead of the default yellow. */
  accent?: CSSProperties;
}) {
  const state = isActive
    ? "text-[var(--foreground)]"
    : "text-[var(--text-muted)] hover:text-[var(--foreground)]";
  const rule = accent
    ? "filter-accent"
    : isActive
      ? "border-[var(--color-yellow)]"
      : "border-transparent";

  return (
    <button
      onClick={onClick}
      data-active={isActive}
      style={accent}
      className={`border-b pb-[2px] font-mono text-[0.63rem] uppercase tracking-[0.18em] transition-colors ${rule} ${state}`}
    >
      {label}
    </button>
  );
}

export function ListingEmptyState({
  message,
  onClear,
}: {
  message: string;
  onClear: () => void;
}) {
  return (
    <div className="mx-auto max-w-[1400px] px-5 py-24 text-center sm:px-10">
      <p className="font-serif text-lg italic text-[var(--text-muted)]">
        {message}
      </p>
      <button
        onClick={onClear}
        className="mt-5 border-b border-[var(--color-yellow)] pb-1 font-mono text-[0.62rem] uppercase tracking-[0.2em]"
      >
        Clear filters
      </button>
    </div>
  );
}

export default function Rolodex({ items }: { items: RolodexItem[] }) {
  const [openIndex, setOpenIndex] = useState(0);
  const [isNarrow, setIsNarrow] = useState(false);
  const [navOffset, setNavOffset] = useState(0);
  const rolodexRef = useRef<HTMLDivElement>(null);

  const count = items.length;
  const keys = items.map((item) => item.key).join("|");
  const isList = isNarrow && count > MAX_PINNED_ITEMS;

  useEffect(() => {
    setOpenIndex(0);
  }, [keys]);

  useEffect(() => {
    const query = window.matchMedia(NARROW);
    const update = () => setIsNarrow(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  // The pinned stack has to clear the sticky site header.
  useEffect(() => {
    const measure = () => {
      const header = document.querySelector("header");
      setNavOffset(header instanceof HTMLElement ? header.offsetHeight : 0);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // On narrow viewports the open panel is a pure function of scroll position:
  // no tap needed, and the first panel is already open on load.
  useEffect(() => {
    if (!isNarrow || isList || count === 0) {
      setOpenIndex(0);
      return;
    }

    let frame = 0;
    const read = () => {
      frame = 0;
      const element = rolodexRef.current;
      if (!element) return;
      const travel = element.offsetHeight - (window.innerHeight - navOffset);
      const scrolled = navOffset - element.getBoundingClientRect().top;
      const progress = travel > 0 ? scrolled / travel : 0;
      const next = Math.min(count - 1, Math.max(0, Math.floor(progress * count)));
      setOpenIndex(next);
    };
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(read);
    };

    read();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [isNarrow, isList, count, navOffset]);

  if (count === 0) return null;

  return (
    <>
      <div
        ref={rolodexRef}
        className={`rolodex mx-auto max-w-[1400px] px-5 sm:px-10${
          isList ? " rolodex--list" : ""
        }`}
        style={
          {
            "--rolodex-n": count,
            "--rolodex-nav": `${navOffset}px`,
          } as CSSProperties
        }
      >
        <div className="rolodex-stack" style={{ top: navOffset }}>
          {items.map((item, index) => (
            <RolodexPanel
              key={item.key}
              item={item}
              isOpen={!isList && index === openIndex}
              onActivate={() => {
                if (!isNarrow) setOpenIndex(index);
              }}
            />
          ))}
        </div>
      </div>
      {!isList && <div className="rolodex-tail" />}
    </>
  );
}

function RolodexPanel({
  item,
  isOpen,
  onActivate,
}: {
  item: RolodexItem;
  isOpen: boolean;
  onActivate: () => void;
}) {
  return (
    <Link
      href={item.href}
      className="rolodex-panel group"
      data-open={isOpen}
      onMouseEnter={onActivate}
      onFocus={onActivate}
    >
      <div className="rolodex-panel-media">{item.media}</div>

      <div className="rolodex-cap">
        <div className="flex flex-wrap items-center gap-4 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-[var(--text-muted)]">
          {item.meta}
        </div>

        <h2 className="rolodex-cap-title mt-[10px]">{item.title}</h2>

        <div className="rolodex-cap-reveal">
          {item.summary && (
            <p className="font-serif text-base font-light italic leading-relaxed text-[var(--text-muted)]">
              {item.summary}
            </p>
          )}
          <span className="mt-[18px] inline-flex items-center gap-[10px] border-b border-[var(--color-yellow)] pb-[3px] font-mono text-[0.62rem] uppercase tracking-[0.2em]">
            {item.cta}
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-[5px]" />
          </span>
        </div>
      </div>
    </Link>
  );
}
