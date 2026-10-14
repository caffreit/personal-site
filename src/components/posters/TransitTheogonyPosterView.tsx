"use client";

import { GenealogyPosterView } from "@/components/posters/GenealogyPosterView";
import { TRANSIT_THEOGONY_VARIANTS } from "@/lib/transitTheogonyPoster";

export function TransitTheogonyPosterView() {
  return (
    <GenealogyPosterView
      posterName="Transit theogony"
      kicker="Mythology · A2 poster"
      title="Transit Theogony"
      intro="The Greek divine family, drawn as a transit map. Follow the lines from Chaos to the Olympians."
      story="Coloured lines are lineages, stations are figures, and interchanges mark where ancestry joins. Generation bands help you follow the family through time. Choose a landscape map that reads from left to right, or a portrait layout arranged around a ring."
      related={{
        href: "/greek-theogeny",
        label: "Greek Theogony",
        description: "Explore the divine family as a nested genealogy chart.",
      }}
      variants={TRANSIT_THEOGONY_VARIANTS}
    />
  );
}
