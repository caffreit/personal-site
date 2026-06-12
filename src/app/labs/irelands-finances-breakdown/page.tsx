import type { Metadata } from "next";
import IrelandsFinancesBreakdown from "@/components/tools/IrelandsFinancesBreakdown";

export const metadata: Metadata = {
  title: "Ireland's Finances Breakdown | Labs",
  description:
    "Interactive explorer of Ireland's 2024 income sources and expenditure breakdown with drilldown charts.",
};

export default function IrelandsFinancesBreakdownPage() {
  return <IrelandsFinancesBreakdown />;
}
