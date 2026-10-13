"use client";

import { GenealogyPosterView } from "@/components/posters/GenealogyPosterView";
import { GREEK_THEOGONY_VARIANTS } from "@/lib/greekTheogenyPoster";

export function GreekTheogenyPosterView() {
  return (
    <GenealogyPosterView
      posterName="Greek theogony"
      kicker="Reference chart · A2 frameless"
      title="Greek Theogony"
      intro="A family tree of the Greek gods — Titans, Olympians, and the lines between them. Frameless crop — no poster border or title block. Two finishes: crisp outlines and a translucent fill you can layer over your own background."
      related={{
        href: "/transit-theogony",
        before: "Have a look at the",
        label: "Transit Theogony",
        after:
          " — another version of the same genealogy, drawn as coloured transit lines, which you might like if you want a map instead of a tree.",
      }}
      variants={GREEK_THEOGONY_VARIANTS}
    />
  );
}
