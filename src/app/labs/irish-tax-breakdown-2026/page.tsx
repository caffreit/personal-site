import type { Metadata } from "next";
import IrishTaxBreakdown2026 from "@/components/tools/IrishTaxBreakdown2026";

export const metadata: Metadata = {
  title: "Irish Tax Breakdown 2026 | Labs",
  description:
    "Interactive chart of illustrative 2026 Irish income tax, USC, and PRSI rates across income levels.",
};

export default function IrishTaxBreakdown2026Page() {
  return <IrishTaxBreakdown2026 />;
}
