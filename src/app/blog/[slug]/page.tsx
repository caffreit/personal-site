import { notFound } from "next/navigation";
import { getPostSlugs, readPostMdx } from "@/lib/posts";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import type { ComponentType } from "react";
import components from "@/components/mdx/MDXComponents";
import BlogPostLayout from "@/components/blog/BlogPostLayout";

type PostParams = { slug: string };

export async function generateStaticParams() {
  return getPostSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<PostParams> }) {
  const { slug } = await params;
  const slugs = getPostSlugs();
  if (!slugs.includes(slug)) return {};
  const { data } = readPostMdx(slug);
  return {
    title: data.title,
    description: data.summary ?? undefined,
  };
}

export default async function BlogPostPage({ params }: { params: Promise<PostParams> }) {
  const { slug } = await params;
  const slugs = getPostSlugs();
  if (!slugs.includes(slug)) return notFound();
  const { content, data } = readPostMdx(slug);

  // Calculate read time (approx 200 words per minute)
  const wordCount = content.split(/\s+/g).length;
  const readTimeMinutes = Math.ceil(wordCount / 200);
  const readTime = `${readTimeMinutes} min`;

  // Format date
  const date = new Date(data.date).toLocaleDateString('en-US', {
    month: 'short', // "OCT" in screenshot
    day: 'numeric',
    year: 'numeric'
  }).toUpperCase();

  return (
    <BlogPostLayout
      title={data.title}
      category={data.category}
      date={date}
      readTime={readTime}
      excerpt={data.summary} // Using summary as excerpt/subtitle
    >
      <MDXRemote
        source={content}
        options={{
          mdxOptions: {
            remarkPlugins: [remarkGfm],
            rehypePlugins: [rehypeHighlight],
          },
        }}
        components={components as Record<string, ComponentType<any>>}
      />
    </BlogPostLayout>
  );
}
