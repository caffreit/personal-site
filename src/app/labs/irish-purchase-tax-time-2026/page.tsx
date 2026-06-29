import type { Metadata } from "next";
import IrishPurchaseTaxTime2026 from "@/components/tools/IrishPurchaseTaxTime2026";

export const metadata: Metadata = {
  title: "Irish Purchase Tax Time 2026 | Labs",
  description:
    "Estimate how much working time goes to Irish income tax and purchase taxes when buying everyday and big-ticket items.",
};

export default function IrishPurchaseTaxTime2026Page() {
  return <IrishPurchaseTaxTime2026 />;
}
