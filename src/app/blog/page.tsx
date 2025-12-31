import { getAllPosts } from "@/lib/posts";
import BlogListing from "@/components/blog/BlogListing";

export const metadata = {
  title: "Blog",
  description: "Posts and interactive tools",
};

export default function BlogIndex() {
  const posts = getAllPosts();
  return <BlogListing posts={posts} />;
}
