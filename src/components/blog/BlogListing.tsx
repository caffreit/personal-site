'use client';

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { PostListItem } from "@/lib/posts";
import Rolodex, {
  FilterLink,
  ListingEmptyState,
  formatListingDate,
  type RolodexItem,
} from "@/components/shared/Rolodex";

function getPlaceholderImage(slug: string): string {
  return `https://picsum.photos/seed/${slug}/1600/900`;
}

interface BlogListingProps {
  posts: PostListItem[];
}

export default function BlogListing({ posts }: BlogListingProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

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

  const items: RolodexItem[] = filteredPosts.map((post, index) => ({
    key: post.slug,
    href: `/blog/${post.slug}`,
    title: post.title,
    summary: post.summary,
    cta: "Read article",
    meta: (
      <>
        <span>{String(index + 1).padStart(2, "0")}</span>
        <span>{formatListingDate(post.date)}</span>
        <span className="text-[var(--foreground)]">
          {post.category || post.tags[0] || "Post"}
        </span>
        <span>{post.readTime}</span>
      </>
    ),
    media: (
      <Image
        src={post.image || getPlaceholderImage(post.slug)}
        alt=""
        fill
        sizes="(max-width: 860px) 100vw, 1400px"
        priority={index === 0}
      />
    ),
  }));

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

      {items.length > 0 ? (
        <Rolodex items={items} />
      ) : (
        <ListingEmptyState
          message="No posts found matching your criteria."
          onClear={() => {
            setSearchQuery("");
            setSelectedTag(null);
          }}
        />
      )}
    </div>
  );
}
