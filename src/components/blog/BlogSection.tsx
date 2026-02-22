import Link from "next/link";
import Image from "next/image";
import { PostListItem } from "@/lib/posts";

const getPostImage = (post: PostListItem) =>
  post.image ?? `https://picsum.photos/seed/${post.slug}-preview/640/400`;

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

export function BlogSection({ posts }: { posts: PostListItem[] }) {
  return (
    <section>
      <div className="mx-auto max-w-[1200px] px-6 py-20 lg:px-10">
        {/* Header */}
        <div className="mb-12 flex flex-col gap-1 border-b-2 border-[var(--foreground)] pb-6 sm:flex-row sm:items-end sm:justify-between">
          <Link href="/blog">
            <h2 className="font-serif text-[2.5rem] font-bold transition-colors hover:text-[var(--color-yellow)]">
              Writing
            </h2>
          </Link>
          <Link
            href="/blog"
            className="font-[family-name:var(--font-display)] text-[0.8rem] uppercase tracking-[0.15em] text-[var(--text-muted)] transition-colors hover:text-[var(--foreground)]"
          >
            View all posts &rarr;
          </Link>
        </div>

        {/* 2-column grid */}
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
          {posts.map((post) => {
            const category = post.category ?? post.tags?.[0] ?? "Featured";
            return (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group block transition-transform duration-300 hover:-translate-y-1"
              >
                <div className="relative mb-5 aspect-[16/10] overflow-hidden">
                  <Image
                    src={getPostImage(post)}
                    alt={post.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 550px"
                  />
                </div>
                <span className="mb-3 inline-block bg-[var(--card-badge-bg)] px-3 py-1 font-[family-name:var(--font-display)] text-[0.65rem] font-bold uppercase tracking-[0.2em] text-[var(--color-yellow)]">
                  {category}
                </span>
                <h3 className="mb-2 font-serif text-[1.5rem] font-bold leading-snug">
                  {post.title}
                </h3>
                <p className="font-mono text-[0.75rem] text-[var(--text-muted)]">
                  {formatDate(post.date)}
                </p>
                {post.summary && (
                  <p className="mt-3 text-[0.95rem] leading-relaxed text-[var(--text-body-rgb)]">
                    {post.summary}
                  </p>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
