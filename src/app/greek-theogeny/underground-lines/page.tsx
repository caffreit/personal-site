import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Theogony Underground",
  description:
    "Prototype tube-map layouts of major Greek divine lineages — switchable left-to-right and ring variants with optional other-parent links.",
};

const EMBED_SRC = "/posters/greek-theogony/theogony-underground.html";

export default function TheogonyUndergroundLinesPage() {
  return (
    <div className="flex min-h-[calc(100dvh-4rem)] flex-col">
      <div className="border-b border-[var(--rule-color)] px-4 py-3 sm:px-6">
        <Link
          href="/greek-theogeny"
          className="inline-flex items-center gap-2 text-[var(--text-muted)] transition-colors hover:text-[var(--foreground)]"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="font-mono text-xs font-medium uppercase tracking-[0.2em]">
            Greek Theogony poster
          </span>
        </Link>
        <p className="mt-2 max-w-3xl font-[family-name:var(--font-newsreader)] text-sm italic text-[var(--text-muted)]">
          Interactive prototype — use the bar below the map to switch layout
          variants or show dashed other-parent links. Arrow keys work when focus
          is not in a control.
        </p>
      </div>
      <iframe
        title="Theogony Underground layout prototype"
        src={EMBED_SRC}
        className="min-h-[calc(100dvh-12rem)] w-full flex-1 border-0 bg-[#e6e4de]"
      />
    </div>
  );
}
