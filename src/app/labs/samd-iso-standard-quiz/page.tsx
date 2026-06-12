import type { Metadata } from "next";
import SamdIsoStandardQuiz from "@/components/tools/SamdIsoStandardQuiz";

export const metadata: Metadata = {
  title: "Which ISO Standard Are You? | Labs",
  description:
    "A deeply unserious SaMD standards personality quiz covering QMS, risk, software lifecycle, usability, clinical evidence, and security.",
};

export default function SamdIsoStandardQuizPage() {
  return <SamdIsoStandardQuiz />;
}
