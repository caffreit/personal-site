import type { Metadata } from "next";
import HousingMarketAnalysis from "@/components/tools/HousingMarketAnalysis";

export const metadata: Metadata = {
  title: "Ireland Housing Market | Labs",
  description:
    "Interactive mortgage affordability explorer for the Ireland housing market story.",
};

export default function IrelandHousingMarketLabPage() {
  return <HousingMarketAnalysis />;
}

