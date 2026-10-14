"use client";

import { GenealogyPosterView } from "@/components/posters/GenealogyPosterView";
import { GREEK_THEOGONY_VARIANTS } from "@/lib/greekTheogenyPoster";

export function GreekTheogenyPosterView() {
  return (
    <GenealogyPosterView
      posterName="Greek theogony"
      kicker="Mythology · A2 poster"
      title="Greek Theogony"
      intro="A family tree of the Greek gods, from the first beings to the Titans and Olympians."
      story="Each connection follows a line of ancestry. Colour groups the gods by their place in the mythology, while nested rings trace the generations back to Chaos. Choose crisp outlines or soft translucent panels for the same divine family."
      related={{
        href: "/transit-theogony",
        label: "Transit Theogony",
        description: "Explore the same divine family as a transit map.",
      }}
      variants={GREEK_THEOGONY_VARIANTS}
    />
  );
}
