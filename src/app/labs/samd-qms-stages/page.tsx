import type { Metadata } from "next";
import SamdQmsStages from "@/components/tools/SamdQmsStages";

export const metadata: Metadata = {
  title: "12 Stages of QMS | Labs",
  description:
    "Interactive BBT-style SaMD listicle on the 12 stages of realizing your team needs a right-sized QMS.",
};

export default function SamdQmsStagesLabPage() {
  return <SamdQmsStages />;
}
