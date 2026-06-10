import type { Metadata } from "next";
import IrelandsFiscalFlow from "@/components/tools/IrelandsFiscalFlow";

export const metadata: Metadata = {
  title: "Ireland's Fiscal Flow | Labs",
  description:
    "Estimate your annual tax contribution and explore how 2024 Irish public spending is distributed.",
};

export default function IrelandsFiscalFlowPage() {
  return <IrelandsFiscalFlow />;
}
