"use client";

import { GenealogyPosterView } from "@/components/posters/GenealogyPosterView";
import { TRANSIT_THEOGONY_VARIANTS } from "@/lib/transitTheogonyPoster";

export function TransitTheogonyPosterView() {
  return (
    <GenealogyPosterView
      posterName="Transit theogony"
      kicker="Transit map · A2 frameless"
      title="Transit Theogony"
      intro="The same Greek divine family, drawn as a transit map. Coloured lines are lineages, stations are figures, and the bands are generations. Two frameless A2 layouts: a left-to-right map and a ring."
      related={{
        href: "/greek-theogeny",
        before: "Have a look at the",
        label: "Greek Theogony",
        after:
          " — another version of a similar chart, drawn as a family tree in outlines and a translucent fill.",
      }}
      variants={TRANSIT_THEOGONY_VARIANTS}
    />
  );
}
