import type { Metadata } from "next";
import IrishPurchaseTaxTime2026 from "@/components/tools/IrishPurchaseTaxTime2026";

export const metadata: Metadata = {
  title: "What Did That Really Cost? | Labs",
  description:
    "See how much working time goes to the thing itself, purchase taxes, and the income taxes paid before your wages became spending money.",
};

export default function IrishPurchaseTaxTime2026Page() {
  return <IrishPurchaseTaxTime2026 />;
}
