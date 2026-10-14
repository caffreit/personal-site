import type { Metadata } from "next";
import { TransitTheogonyPosterView } from "@/components/posters/TransitTheogonyPosterView";

export const metadata: Metadata = {
  title: "Transit Theogony",
  description:
    "Explore A2 transit maps of the Greek divine family in left-to-right and ring layouts, with detail previews and illustrative room views.",
};

export default function TransitTheogonyPage() {
  return <TransitTheogonyPosterView />;
}
