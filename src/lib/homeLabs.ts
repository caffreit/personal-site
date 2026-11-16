import { getRecentLabs, type Lab } from "@/lib/labs";

/**
 * How labs are presented on the home page.
 *
 * The bento at the top is a hand-picked set with its own artwork and short copy.
 * Every other lab falls through to the ruled list underneath automatically, so a
 * new entry in `labs.ts` shows up on the home page without touching this file.
 */

export type LabArt =
  | { kind: "cover"; src: string; position?: string }
  | { kind: "items"; srcs: string[] }
  | { kind: "icons"; srcs: string[] };

export type BentoLab = {
  href: string;
  title: string;
  blurb: string;
  kicker: string;
  cta: string;
  size: "big" | "wide" | "normal";
  art: LabArt;
};

export type LabThumb =
  | { kind: "bars" | "fall" | "donut" | "blocks" | "line" | "notes" }
  | { kind: "img"; src: string };

export type LabRow = {
  href: string;
  title: string;
  subtitle?: string;
  description: string;
  badge: string;
  meta: string;
  date: string;
  thumb: LabThumb;
};

const PURCHASE = "/labs/irish-purchase-tax-time-2026";
const ISO = "/labs/samd-iso-standard-quiz";

type BentoConfig = Omit<BentoLab, "title"> & { title?: string };

const BENTO: BentoConfig[] = [
  {
    href: "/transit-theogony",
    size: "big",
    kicker: "Poster · Map",
    cta: "Explore",
    blurb:
      "The Greek divine family as a transit map. Follow the lineage lines across generations, then see it as an A2 print on the wall.",
    art: { kind: "cover", src: "/posters/transit-theogony/left-to-right/detail-1.webp" },
  },
  {
    href: "/labs/tax-schedule-comparison",
    size: "wide",
    kicker: "Tax · Comparison",
    cta: "Open",
    blurb: "Stylised tax schedules against Ireland's current income tax shape.",
    art: { kind: "cover", src: "/labs/tax-schedule-comparison/cover.webp", position: "50% 30%" },
  },
  {
    href: "/three-stations",
    size: "normal",
    kicker: "Google Maps · Transit",
    cta: "Open",
    blurb: "Which Dublin station is really closest? Tap the map.",
    art: { kind: "cover", src: "/labs/three-stations/thumbnail.webp", position: "100% 45%" },
  },
  {
    href: "/labs/irish-budget-quiz",
    size: "normal",
    kicker: "Civics · Quiz",
    cta: "Play",
    blurb: "How does Ireland spend €100bn? Guess, then check.",
    art: { kind: "cover", src: "/labs/irish-budget-quiz/cover.webp" },
  },
  {
    href: PURCHASE,
    size: "wide",
    kicker: "Data viz · Time",
    cta: "Open",
    blurb: "From a chicken fillet roll to a house: the hours you work for it, and how many go to tax.",
    art: {
      kind: "items",
      srcs: ["roll", "pint", "petrol", "camera", "car", "house"].map((n) => `${PURCHASE}/${n}.webp`),
    },
  },
  {
    href: ISO,
    size: "normal",
    kicker: "SaMD · Quiz",
    cta: "Play",
    blurb: "A standards personality quiz for medical-software people.",
    art: { kind: "icons", srcs: ["qms", "risk", "software"].map((n) => `${ISO}/${n}.webp`) },
  },
  {
    href: "/greek-theogeny",
    title: "Greek Theogony",
    size: "normal",
    kicker: "Poster · Genealogy",
    cta: "Explore",
    blurb: "An A2 divine family tree in two styles.",
    art: { kind: "cover", src: "/posters/greek-theogony/outlines/detail-1.webp" },
  },
];

/** Optional extras for labs in the list: a one-line subtitle and a stand-in thumbnail. */
const ROW_EXTRAS: Record<string, { subtitle?: string; thumb?: LabThumb }> = {
  "/labs/hlth-2026-field-notes": { thumb: { kind: "notes" } },
  "/labs/irish-tax-breakdown-2026": {
    subtitle: "Effective and marginal rates, by income",
    thumb: { kind: "bars" },
  },
  "/labs/irish-tax-waterfall-2026": {
    subtitle: "From gross pay to what you keep",
    thumb: { kind: "fall" },
  },
  "/labs/irelands-finances-breakdown": {
    subtitle: "Where the money comes from, and goes",
    thumb: { kind: "donut" },
  },
  "/labs/samd-fda-pre-sub-quiz": {
    subtitle: "Surviving the pre-submission meeting",
    thumb: { kind: "img", src: `${ISO}/clinical.webp` },
  },
  "/labs/samd-startup-quiz": {
    subtitle: "Find your startup archetype",
    thumb: { kind: "img", src: `${ISO}/security.webp` },
  },
  "/labs/samd-qms-stages": {
    subtitle: "When quality can no longer wait",
    thumb: { kind: "img", src: `${ISO}/usability.webp` },
  },
  "/labs/irish-budget-block-game": {
    subtitle: "Twenty blocks, one national budget",
    thumb: { kind: "blocks" },
  },
  "/labs/irelands-fiscal-flow": {
    subtitle: "Your tax, followed out the door",
    thumb: { kind: "donut" },
  },
  "/labs/ireland-housing-market": {
    subtitle: "Mortgage affordability, simulated",
    thumb: { kind: "line" },
  },
};

function splitTitle(title: string): { title: string; subtitle?: string } {
  const at = title.indexOf(": ");
  return at === -1 ? { title } : { title: title.slice(0, at), subtitle: title.slice(at + 2) };
}

function fallbackThumb(lab: Lab): LabThumb {
  return lab.image ? { kind: "img", src: lab.image } : { kind: "bars" };
}

export function getHomeLabs(): { total: number; bento: BentoLab[]; rows: LabRow[] } {
  const labs = getRecentLabs(Number.MAX_SAFE_INTEGER);
  const byHref = new Map(labs.map((lab) => [lab.href, lab]));

  const bento = BENTO.flatMap((entry) => {
    const lab = byHref.get(entry.href);
    return lab ? [{ ...entry, title: entry.title ?? lab.title }] : [];
  });
  const inBento = new Set(bento.map((entry) => entry.href));

  const rows = labs
    .filter((lab) => !inBento.has(lab.href))
    .map((lab) => {
      const extras = ROW_EXTRAS[lab.href] ?? {};
      const split = splitTitle(lab.title);
      return {
        href: lab.href,
        title: split.title,
        subtitle: extras.subtitle ?? split.subtitle,
        description: lab.description,
        badge: lab.badge,
        meta: lab.meta.replace(/\s*•\s*/g, " · "),
        date: lab.publishedAt,
        thumb: extras.thumb ?? fallbackThumb(lab),
      };
    });

  return { total: labs.length, bento, rows };
}
