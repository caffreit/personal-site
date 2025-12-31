'use client';

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { PostListItem } from "@/lib/posts";

// Helper function to get placeholder image based on slug
function getPlaceholderImage(slug: string): string {
  // You can customize this to use actual images or a placeholder service
  // For now, using a simple gradient placeholder
  return `https://picsum.photos/seed/${slug}/400/400`;
}

function estimateReadingTime(text?: string): string {
  const words = text?.split(/\s+/).filter(Boolean).length ?? 250;
  const minutes = Math.max(2, Math.round(words / 200));
  return `${minutes} min read`;
}

interface BlogListingProps {
  posts: PostListItem[];
}

export default function BlogListing({ posts }: BlogListingProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Get all unique tags from posts
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    posts.forEach((post) => {
      post.tags.forEach((tag) => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [posts]);

  // Filter posts based on search and tag
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesSearch =
        searchQuery === "" ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.summary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesTag = selectedTag === null || post.tags.includes(selectedTag);

      return matchesSearch && matchesTag;
    });
  }, [posts, searchQuery, selectedTag]);

  return (
    <div className="min-h-screen bg-white text-stone-900 dark:bg-[#050505] dark:text-stone-100">
      <div className="mx-auto max-w-7xl px-4 pt-12 pb-32 sm:px-6 lg:px-8">
        <div className="mb-12">
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-2 text-stone-500 transition-colors hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="font-mono text-sm font-medium uppercase tracking-[0.2em]">
              Back to Home
            </span>
          </Link>

          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <span className="mb-4 block font-mono text-xs font-bold uppercase tracking-[0.4em] text-yellow-600">
                Blog Archive
              </span>
              <h1 className="text-5xl font-black uppercase leading-[0.9] tracking-tight text-stone-900 sm:text-7xl dark:text-white">
                Blog
              </h1>
            </div>
            <p className="max-w-2xl font-serif text-lg italic text-stone-600 dark:text-stone-300">
              Essays, build logs, and notes from data-forward experiments—curated
              with the same editorial energy as the labs playground.
            </p>
          </div>
        </div>

        {/* Navigation Bar with Filters and Search */}
        <div className="mb-16 rounded-[2.5rem] border border-stone-200/80 bg-white/80 p-6 shadow-[0_10px_40px_-25px_rgba(0,0,0,0.35)] backdrop-blur-sm dark:border-stone-800/70 dark:bg-[#0b0b0b]/80">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            {/* Filter Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <FilterPill
                label="All"
                isActive={selectedTag === null}
                onClick={() => setSelectedTag(null)}
              />
              {allTags.map((tag) => (
                <FilterPill
                  key={tag}
                  label={tag}
                  isActive={selectedTag === tag}
                  onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                />
              ))}
            </div>

            {/* Search Bar */}
            <div className="relative w-full lg:max-w-sm">
              <input
                type="text"
                placeholder="Search posts"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full border border-stone-200 bg-transparent py-3 pl-12 pr-4 text-sm uppercase tracking-[0.2em] text-stone-900 placeholder:text-stone-400 focus:border-stone-900 focus:outline-none focus:ring-0 dark:border-stone-700 dark:text-white dark:placeholder:text-stone-500"
              />
              <svg
                className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400 dark:text-stone-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Blog Posts Grid */}
        {filteredPosts.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {filteredPosts.map((post) => (
              <BlogPostCard key={post.slug} post={post} />
            ))}
          </div>
        ) : (
          <div className="rounded-[2.5rem] border border-dashed border-stone-200 bg-white py-24 text-center text-stone-500 dark:border-stone-700 dark:bg-[#0b0b0b]">
            <p className="text-lg">No posts found matching your criteria.</p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedTag(null);
              }}
              className="mt-4 font-mono text-xs uppercase tracking-[0.3em] text-stone-900 underline decoration-yellow-400 decoration-2 underline-offset-4 transition-colors hover:text-yellow-600 dark:text-white"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function FilterPill({
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
      {label}
    </button>
  );
}

function BlogPostCard({ post }: { post: PostListItem }) {
  const imageUrl = post.image || getPlaceholderImage(post.slug);
  const category = post.category || post.tags[0] || "Post";
  const readingTime = estimateReadingTime(post.summary);

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-[2.5rem] border border-stone-200 bg-white p-8 shadow-[0_10px_40px_-25px_rgba(0,0,0,0.35)] transition-transform duration-500 hover:-translate-y-1 hover:shadow-[0_25px_60px_-35px_rgba(0,0,0,0.4)] dark:border-stone-800 dark:bg-[#0f0f0f]"
    >
      <div className="mb-6 flex flex-wrap items-center gap-3 text-[10px] font-bold uppercase tracking-[0.3em] text-stone-400">
        <span className="rounded-full border border-stone-200 px-3 py-1 text-[10px] font-black tracking-[0.4em] text-stone-600 dark:border-stone-700 dark:text-stone-200">
          {readingTime}
        </span>
        <span className="rounded-full bg-lime-100 px-3 py-1 text-lime-700 dark:bg-lime-900/40 dark:text-lime-200">
          {category}
        </span>
      </div>

      <div className="mb-8 overflow-hidden rounded-3xl border border-stone-100 dark:border-stone-800">
        <Image
          src={imageUrl}
          alt={post.title}
          width={900}
          height={500}
          className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </div>

      <div className="space-y-4">
        <h2 className="text-3xl font-black tracking-tight text-stone-900 transition-colors group-hover:text-yellow-600 dark:text-white">
          {post.title}
        </h2>
        {post.summary && (
          <p className="font-serif text-lg italic text-stone-600 dark:text-stone-300">
            {post.summary}
          </p>
        )}
      </div>

      {post.tags.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-600 dark:bg-stone-800 dark:text-stone-200"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="mt-10 flex items-center justify-end text-sm text-stone-900 dark:text-white">
        <span className="flex items-center gap-2 font-semibold text-stone-900 transition-colors group-hover:text-yellow-600 dark:text-white">
          Read Article
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
        </span>
      </div>

      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-10"
        style={{ backgroundImage: "linear-gradient(135deg, #bef264 0%, #0ea5e9 100%)" }}
      />
    </Link>
  );
}
