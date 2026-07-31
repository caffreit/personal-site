'use client';

import { useState, useMemo, useEffect, useRef, type CSSProperties } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { PostListItem } from "@/lib/posts";

const NARROW = "(max-width: 860px)";

function getPlaceholderImage(slug: string): string {
  return `https://picsum.photos/seed/${slug}/1600/900`;
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

interface BlogListingProps {
  posts: PostListItem[];
}

export default function BlogListing({ posts }: BlogListingProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [openIndex, setOpenIndex] = useState(0);
  const [isNarrow, setIsNarrow] = useState(false);
  const [navOffset, setNavOffset] = useState(0);
  const rolodexRef = useRef<HTMLDivElement>(null);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    posts.forEach((post) => post.tags.forEach((tag) => tags.add(tag)));
    return Array.from(tags).sort();
  }, [posts]);

  const filteredPosts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return posts.filter((post) => {
      const matchesSearch =
        query === "" ||
        post.title.toLowerCase().includes(query) ||
        post.summary?.toLowerCase().includes(query) ||
        post.tags.some((tag) => tag.toLowerCase().includes(query));
      const matchesTag = selectedTag === null || post.tags.includes(selectedTag);
      return matchesSearch && matchesTag;
    });
  }, [posts, searchQuery, selectedTag]);

  const count = filteredPosts.length;

  useEffect(() => {
    setOpenIndex(0);
  }, [searchQuery, selectedTag]);

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
    if (!isNarrow || count === 0) {
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
  }, [isNarrow, count, navOffset]);

  return (
    <div className="pb-24">
      <div className="mx-auto max-w-[1400px] px-5 pt-16 sm:px-10">
        <h1 className="text-[clamp(3rem,7vw,5.5rem)] font-light leading-[0.95] tracking-[-0.02em]">
          Blog
        </h1>
        <p className="mt-5 max-w-[520px] font-serif text-[1.05rem] font-light italic leading-relaxed text-[var(--text-muted)]">
          Essays, build logs, and notes from data-forward experiments.
        </p>

        <div className="mt-14 flex flex-wrap items-baseline justify-between gap-6 border-b border-[var(--rule-color)] pb-4">
          <div className="flex flex-wrap gap-[22px]">
            <FilterLink
              label="All"
              isActive={selectedTag === null}
              onClick={() => setSelectedTag(null)}
            />
            {allTags.map((tag) => (
              <FilterLink
                key={tag}
                label={tag}
                isActive={selectedTag === tag}
                onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
              />
            ))}
          </div>

          <input
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search"
            aria-label="Search posts"
            className="w-full border-b border-[var(--rule-color)] bg-transparent py-1 font-mono text-[0.63rem] uppercase tracking-[0.18em] outline-none transition-colors placeholder:text-[var(--text-muted)] focus:border-[var(--color-yellow)] sm:w-[200px]"
          />
        </div>
      </div>

      {count > 0 ? (
        <>
          <div
            ref={rolodexRef}
            className="blog-rolodex mx-auto max-w-[1400px] px-5 sm:px-10"
            style={{ "--blog-n": count } as CSSProperties}
          >
            <div className="blog-stack" style={{ top: navOffset }}>
              {filteredPosts.map((post, index) => (
                <BlogPanel
                  key={post.slug}
                  post={post}
                  index={index}
                  isOpen={index === openIndex}
                  onActivate={() => {
                    if (!isNarrow) setOpenIndex(index);
                  }}
                />
              ))}
            </div>
          </div>
          <div className="blog-rolodex-tail" />
        </>
      ) : (
        <div className="mx-auto max-w-[1400px] px-5 py-24 text-center sm:px-10">
          <p className="font-serif text-lg italic text-[var(--text-muted)]">
            No posts found matching your criteria.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedTag(null);
            }}
            className="mt-5 border-b border-[var(--color-yellow)] pb-1 font-mono text-[0.62rem] uppercase tracking-[0.2em]"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}

function FilterLink({
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
      className={`border-b pb-[2px] font-mono text-[0.63rem] uppercase tracking-[0.18em] transition-colors ${
        isActive
          ? "border-[var(--color-yellow)] text-[var(--foreground)]"
          : "border-transparent text-[var(--text-muted)] hover:text-[var(--foreground)]"
      }`}
    >
      {label}
    </button>
  );
}

function BlogPanel({
  post,
  index,
  isOpen,
  onActivate,
}: {
  post: PostListItem;
  index: number;
  isOpen: boolean;
  onActivate: () => void;
}) {
  const imageUrl = post.image || getPlaceholderImage(post.slug);
  const category = post.category || post.tags[0] || "Post";

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="blog-panel group"
      data-open={isOpen}
      onMouseEnter={onActivate}
      onFocus={onActivate}
    >
      <div className="blog-panel-media">
        <Image
          src={imageUrl}
          alt=""
          fill
          sizes="(max-width: 860px) 100vw, 1400px"
          priority={index === 0}
        />
      </div>

      <div className="blog-cap">
        <div className="flex flex-wrap items-baseline gap-4 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-[var(--text-muted)]">
          <span>{String(index + 1).padStart(2, "0")}</span>
          <span>{formatDate(post.date)}</span>
          <span className="text-[var(--foreground)]">{category}</span>
          <span>{post.readTime}</span>
        </div>

        <h2 className="blog-cap-title mt-[10px]">{post.title}</h2>

        <div className="blog-cap-reveal">
          {post.summary && (
            <p className="font-serif text-base font-light italic leading-relaxed text-[var(--text-muted)]">
              {post.summary}
            </p>
          )}
          <span className="mt-[18px] inline-flex items-center gap-[10px] border-b border-[var(--color-yellow)] pb-[3px] font-mono text-[0.62rem] uppercase tracking-[0.2em]">
            Read article
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-[5px]" />
          </span>
        </div>
      </div>
    </Link>
  );
}
