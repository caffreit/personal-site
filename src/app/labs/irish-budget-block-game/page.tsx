import type { Metadata } from "next";
import IrishBudgetBlockGame from "@/components/tools/IrishBudgetBlockGame";

export const metadata: Metadata = {
  title: "Irish Budget Block Game | Labs",
  description:
    "Interactive drag-and-drop game to guess how Ireland's 2024 public spending is allocated.",
};

export default function IrishBudgetBlockGamePage() {
  return <IrishBudgetBlockGame />;
}
