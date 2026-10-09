import type { Metadata } from "next";
import { GreekTheogenyPosterView } from "@/components/posters/GreekTheogenyPosterView";

export const metadata: Metadata = {
  title: "Greek Theogony Poster",
  description:
    "Outlines and translucent editions of an A2 Greek divine genealogy chart — SVG previews with PDF and PNG downloads.",
};

export default function GreekTheogenyPage() {
  return <GreekTheogenyPosterView />;
}
