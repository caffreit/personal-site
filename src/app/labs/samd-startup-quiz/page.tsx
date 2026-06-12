import type { Metadata } from "next";
import SamdStartupQuiz from "@/components/tools/SamdStartupQuiz";

export const metadata: Metadata = {
  title: "SaMD Startup Quiz | Labs",
  description:
    "Interactive SaMD startup archetype quiz covering intended use, QMS, validation, and claims strategy.",
};

export default function SamdStartupQuizLabPage() {
  return <SamdStartupQuiz />;
}
