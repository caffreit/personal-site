import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export type PostFrontmatter = {
  title: string;
  date: string;
  summary?: string;
  tags?: string[];
  draft?: boolean;
  image?: string;
  category?: string;
};

export type PostListItem = {
  slug: string;
  title: string;
  date: string;
  summary?: string;
  tags: string[];
  draft: boolean;
  image?: string;
  category?: string;
};

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

export function getPostSlugs(): string[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  const slugs = fs
    .readdirSync(BLOG_DIR)
    .filter((name) =>
      fs.existsSync(path.join(BLOG_DIR, name, "index.mdx"))
    );
  return slugs;
}

export function readPostMdx(slug: string): { content: string; data: PostFrontmatter } {
  const file = path.join(BLOG_DIR, slug, "index.mdx");
  const source = fs.readFileSync(file, "utf8");
  const { content, data } = matter(source);
  const fm = data as Partial<PostFrontmatter>;
  return {
    content,
    data: {
      title: fm.title ?? slug,
      date: fm.date ?? new Date().toISOString(),
      summary: fm.summary,
      tags: fm.tags ?? [],
      draft: Boolean(fm.draft),
      image: fm.image,
      category: fm.category,
    },
  };
}

export function getAllPosts(): PostListItem[] {
  return getPostSlugs()
    .map((slug) => {
      const { data } = readPostMdx(slug);
      return {
        slug,
        title: data.title,
        date: data.date,
        summary: data.summary,
        tags: data.tags ?? [],
        draft: Boolean(data.draft),
        image: data.image,
        category: data.category,
      } as PostListItem;
    })
    .filter((p) => !p.draft)
    .sort((a, b) => (a.date > b.date ? -1 : 1));
}


