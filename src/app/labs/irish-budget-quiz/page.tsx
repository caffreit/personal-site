import type { Metadata } from "next";
import IrishBudgetQuiz from "@/components/tools/IrishBudgetQuiz";

export const metadata: Metadata = {
  title: "Irish Budget Quiz | Labs",
  description:
    "Interactive quiz and explainer covering Ireland's 2024 public expenditure allocations.",
};

export default function IrishBudgetQuizLabPage() {
  return <IrishBudgetQuiz />;
}
