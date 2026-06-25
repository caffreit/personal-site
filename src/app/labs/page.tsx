import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import LabsListing from "@/components/labs/LabsListing";
import { getAllLabs } from "@/lib/labs";

export const metadata = {
  title: "Labs",
  description: "Prototype playgrounds and interactive data experiments.",
};

export default function LabsPage() {
  const labs = getAllLabs();

  return (
    <div className="mx-auto max-w-7xl px-4 pt-12 pb-32 sm:px-6 lg:px-8">
      <div className="mb-12">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-stone-500 transition-colors hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="font-mono text-sm font-medium uppercase tracking-[0.2em]">
            Back to Home
          </span>
        </Link>

        <h1 className="text-6xl font-black uppercase leading-[0.8] tracking-tighter text-stone-900 sm:text-8xl mb-8 dark:text-white">
          Labs
        </h1>
        <p className="max-w-2xl text-xl leading-relaxed text-stone-600 font-serif italic dark:text-stone-300">
          WIP explorations that lean on APIs, data viz, and playful UI patterns—
          sharing the same editorial feel as the photo and blog archives.
        </p>
      </div>

      <LabsListing labs={labs} />
    </div>
  );
}


