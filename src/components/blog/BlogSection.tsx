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
    <section className="w-full bg-gradient-to-br from-stone-950 via-stone-900 to-black text-stone-100">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-12 px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-8 border-b border-white/10 pb-10 md:flex-row md:items-end">
          <div>
            <span className="mb-3 block text-xs font-mono font-semibold uppercase tracking-[0.4em] text-stone-400">
              Writing
            </span>
            <h2 className="text-4xl font-black tracking-tight text-white sm:text-6xl">
              Blog
            </h2>
            <p className="mt-3 max-w-2xl text-base text-stone-300">
              Long-form notes, research logs, and visual essays on data,
              engineering, and travel.
            </p>
          </div>
          <Link
            href="/blog"
            className="hidden md:inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-2 text-sm font-semibold tracking-wide text-white transition hover:border-yellow-400 hover:text-yellow-200"
          >
            View all posts <span aria-hidden="true">→</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-10">
          {posts.map((post) => {
            const category = post.category ?? post.tags?.[0] ?? "Featured";
            return (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group grid grid-cols-1 gap-6 rounded-3xl border border-white/10 bg-white/5 p-4 transition hover:border-yellow-300/60 hover:bg-white/10 lg:grid-cols-[260px_1fr]"
              >
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-stone-900">
                  <Image
                    src={getPostImage(post)}
                    alt={post.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 260px"
                    className="object-cover transition duration-700 group-hover:scale-105"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent opacity-60"></div>
                  <span className="absolute bottom-3 left-3 inline-flex items-center rounded-full bg-black/60 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                    {category}
                  </span>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="text-sm font-mono uppercase tracking-[0.3em] text-stone-400">
                    {formatDate(post.date)}
                  </div>
                  <h3 className="text-2xl font-bold text-white transition-colors group-hover:text-yellow-200 sm:text-3xl">
                    {post.title}
                  </h3>
                  <p className="text-base text-stone-300">
                    {post.summary ?? "Read more about this topic..."}
                  </p>
                  <div className="mt-auto flex items-center gap-2 text-sm font-semibold text-yellow-200">
                    Read article
                    <span
                      aria-hidden="true"
                      className="transition-transform group-hover:translate-x-1"
                    >
                      →
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-4 flex justify-center md:hidden">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-2 text-sm font-semibold text-white transition hover:border-yellow-400 hover:text-yellow-200"
          >
            View all posts <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

