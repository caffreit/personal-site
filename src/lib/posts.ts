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
  readTime: string; // e.g. "5 min read" - calculated from content (200 words/min)
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
      const { content, data } = readPostMdx(slug);
      // Same read time calculation as article pages: 200 words per minute
      const wordCount = content.split(/\s+/g).filter(Boolean).length;
      const readTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));
      const readTime = `${readTimeMinutes} min read`;
      return {
        slug,
        title: data.title,
        date: data.date,
        summary: data.summary,
        tags: data.tags ?? [],
        draft: Boolean(data.draft),
        image: data.image,
        category: data.category,
        readTime,
      } as PostListItem;
    })
    .filter((p) => !p.draft)
    .sort((a, b) => (a.date > b.date ? -1 : 1));
}



/**
 * The opening lines of a post as plain text, for teasers on the home page.
 * Skips embedded JSX, headings, quotes and images, then takes whole sentences up to roughly `maxChars`.
 */
export function getPostOpening(slug: string, maxChars = 320): string {
  const { content } = readPostMdx(slug);
  const paragraphs: string[] = [];
  let inJsx = false;

  for (const block of content.split(/\n\s*\n/)) {
    const text = block.trim();
    if (!text) continue;
    if (inJsx) {
      if (/<\/[A-Za-z][^>]*>\s*$/.test(text)) inJsx = false;
      continue;
    }
    if (text.startsWith("<")) {
      // a JSX block may span several paragraphs; skip until its closing tag
      if (!/(\/>|<\/[A-Za-z][^>]*>)\s*$/.test(text)) inJsx = true;
      continue;
    }
    if (/^(#|>|!\[|import |export |```|[-*] |\d+\. |\|)/.test(text)) {
      if (paragraphs.length) break; // the opening ends at the first heading, quote or list
      continue;
    }
    paragraphs.push(
      text
        .replace(/\s+/g, " ")
        .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
        .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
        .replace(/[*_`]+/g, "")
        .trim(),
    );
    if (paragraphs.join(" ").length >= maxChars) break;
  }

  const full = paragraphs.join(" ");
  if (full.length <= maxChars) return full;

  // prefer to stop at the end of a sentence
  const sentences = full.match(/[^.!?]+[.!?]+(\s|$)/g) ?? [full];
  let out = "";
  for (const sentence of sentences) {
    if (out && (out + sentence).length > maxChars) break;
    out += sentence;
  }
  out = out.trim();
  if (out.length > maxChars * 1.4) out = `${out.slice(0, maxChars).replace(/\s+\S*$/, "")}…`;
  return out;
}
