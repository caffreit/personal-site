import type { Metadata } from "next";
import IrishTaxWaterfall2026 from "@/components/tools/IrishTaxWaterfall2026";

export const metadata: Metadata = {
  title: "Irish Tax Waterfall 2026 | Labs",
  description:
    "Interactive waterfall model showing how illustrative 2026 Irish taxes, consumption, and return taxes shape retained annual income.",
};

export default function IrishTaxWaterfall2026Page() {
  return <IrishTaxWaterfall2026 />;
}
