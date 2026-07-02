import type { Metadata } from "next";
import TaxScheduleComparisonLab from "@/components/tools/TaxScheduleComparisonLab";

export const metadata: Metadata = {
  title: "Tax Schedule Comparison | Labs",
  description:
    "Compare stylised tax schedules against Ireland's current income tax shape across rates, net income, and working-time views.",
};

export default function TaxScheduleComparisonPage() {
  return <TaxScheduleComparisonLab />;
}
