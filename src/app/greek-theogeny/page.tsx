import type { Metadata } from "next";
import { GreekTheogenyPosterView } from "@/components/posters/GreekTheogenyPosterView";

export const metadata: Metadata = {
  title: "Greek Theogony Poster",
  description:
    "Explore the Greek Theogony A2 poster in outlines and translucent styles, with detail previews and an illustrative room view.",
};

export default function GreekTheogenyPage() {
  return <GreekTheogenyPosterView />;
}
