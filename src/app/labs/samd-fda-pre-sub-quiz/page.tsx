import type { Metadata } from "next";
import SamdFdaPreSubQuiz from "@/components/tools/SamdFdaPreSubQuiz";

export const metadata: Metadata = {
  title: "BBT FDA Pre-Sub Quiz | Labs",
  description:
    "Tongue-in-cheek interactive SaMD quiz on preparing for an FDA Pre-Sub meeting.",
};

export default function SamdFdaPreSubQuizLabPage() {
  return <SamdFdaPreSubQuiz />;
}
