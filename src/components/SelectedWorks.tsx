import Link from "next/link";
import Image from "next/image";
import { PostListItem } from "@/lib/posts";
import type { Lab } from "@/lib/labs";

interface EditorialThreeColProps {
  posts: PostListItem[];
  featuredPost: PostListItem;
  recentLabs: Lab[];
}

const formatShortDate = (date: string) =>
  new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

export function SelectedWorks({
  posts,
  featuredPost,
  recentLabs,
}: EditorialThreeColProps) {
  const recentPosts = posts
    .filter((post) => post.slug !== featuredPost.slug)
    .slice(0, 5);

  return (
    <section>
      <div className="mx-auto grid max-w-[1200px] gap-10 px-6 py-16 md:grid-cols-[240px_1fr_240px] md:gap-10 lg:px-10">
        {/* Left: Table of Contents */}
        <div>
          <h3 className="mb-6 border-b border-[var(--rule-color)] pb-3 font-[family-name:var(--font-display)] text-[0.7rem] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">
            Recent Writing
          </h3>
          {recentPosts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="block border-b border-[var(--rule-color)] py-3 transition-all hover:pl-2"
            >
              <span className="block font-mono text-[0.7rem] text-[var(--text-muted)]">
                {formatShortDate(post.date)}
              </span>
              <span className="text-[0.95rem] font-semibold leading-snug">
                {post.title}
              </span>
            </Link>
          ))}
          <Link
            href="/blog"
            className="mt-5 inline-block font-[family-name:var(--font-display)] text-sm font-medium uppercase tracking-[0.15em] text-[var(--color-yellow)] transition-opacity hover:opacity-80"
          >
            View all blogs &rarr;
          </Link>
        </div>

        {/* Center: Featured Essay */}
        <div className="border-[var(--rule-color)] md:border-x md:px-10">
          <p className="mb-3 font-[family-name:var(--font-display)] text-[0.7rem] font-bold uppercase tracking-[0.2em] text-[var(--color-yellow)]">
            Featured Essay
          </p>
          <Link
            href={`/blog/${featuredPost.slug}`}
            className="block transition-opacity hover:opacity-90"
          >
            <h2 className="mb-4 font-serif text-[2.2rem] font-bold leading-tight">
              {featuredPost.title}
            </h2>
          </Link>
          {featuredPost.image && (
            <Link
              href={`/blog/${featuredPost.slug}`}
              className="block transition-opacity hover:opacity-90"
            >
              <div className="relative mb-6 aspect-[3/2] overflow-hidden">
                <Image
                  src={featuredPost.image}
                  alt={featuredPost.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 900px) 100vw, 600px"
                />
              </div>
            </Link>
          )}
          {featuredPost.summary && (
            <p className="dropcap text-[1.1rem] leading-relaxed text-[var(--text-body-rgb)]">
              {featuredPost.summary}
            </p>
          )}
          <Link
            href={`/blog/${featuredPost.slug}`}
            className="mt-6 inline-block font-[family-name:var(--font-display)] text-sm font-medium uppercase tracking-[0.15em] text-[var(--color-yellow)] transition-opacity hover:opacity-80"
          >
            Read essay &rarr;
          </Link>
        </div>

        {/* Right: Labs index */}
        <div>
          <h3 className="mb-6 border-b border-[var(--rule-color)] pb-3 font-[family-name:var(--font-display)] text-[0.7rem] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">
            Recent Labs
          </h3>
          {recentLabs.map((lab) => (
            <Link
              key={lab.href}
              href={lab.href}
              className="block border-b border-[var(--rule-color)] py-3 transition-all hover:pl-2"
            >
              <span className="block font-mono text-[0.7rem] text-[var(--text-muted)]">
                {lab.badge} / {formatShortDate(lab.publishedAt)}
              </span>
              <span className="text-[0.95rem] font-semibold leading-snug">
                {lab.title}
              </span>
            </Link>
          ))}
          <Link
            href="/labs"
            className="mt-5 inline-block font-[family-name:var(--font-display)] text-sm font-medium uppercase tracking-[0.15em] text-[var(--color-yellow)] transition-opacity hover:opacity-80"
          >
            View all labs &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}
