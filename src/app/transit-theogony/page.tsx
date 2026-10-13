import type { Metadata } from "next";
import { TransitTheogonyPosterView } from "@/components/posters/TransitTheogonyPosterView";

export const metadata: Metadata = {
  title: "Transit Theogony",
  description:
    "Left-to-right and ring A2 transit maps of the Greek divine genealogy — SVG previews with PDF and PNG downloads.",
};

export default function TransitTheogonyPage() {
  return <TransitTheogonyPosterView />;
}
