import type { Metadata } from "next";
import SamdIsoStandardQuiz from "@/components/tools/SamdIsoStandardQuiz";

export const metadata: Metadata = {
  title: "Which ISO Standard Are You? | Labs",
  description:
    "A deeply unserious SaMD standards personality quiz covering QMS, risk, software lifecycle, usability, clinical evidence, and security.",
  openGraph: {
    title: "Which ISO Standard Are You?",
    description:
      "Take the SaMD standards personality quiz and find out which ISO standard is quietly running your meetings.",
    images: [
      {
        url: "/labs/samd-iso-standard-quiz/software.png",
        width: 1024,
        height: 1536,
        alt: "IEC 62304: The Software Realist quiz result illustration",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Which ISO Standard Are You?",
    description:
      "Take the SaMD standards personality quiz and find out which ISO standard is quietly running your meetings.",
    images: ["/labs/samd-iso-standard-quiz/software.png"],
  },
};

export default function SamdIsoStandardQuizPage() {
  return <SamdIsoStandardQuiz />;
}
