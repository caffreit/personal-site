export type Lab = {
  title: string;
  description: string;
  href: string;
  badge: string;
  meta: string;
  publishedAt: string;
  image?: string;
  imageAlt?: string;
  isPinned?: boolean;
  isFeatured?: boolean;
};

const LABS: Lab[] = [
  {
    title: "Three Stations",
    description:
      "Tap anywhere on the Liffey corridor to compare real-time walking routes from Connolly, Tara Street, and Pearse using the Google Maps Directions API.",
    href: "/three-stations",
    badge: "Google Maps",
    meta: "Transit • Experiment",
    publishedAt: "2025-12-31",
  },
  {
    title: "Ireland Housing Market",
    description:
      "Explore interactive mortgage affordability simulations across historical prices, wages, rates, and inflation.",
    href: "/labs/ireland-housing-market",
    badge: "Data Viz",
    meta: "Housing • Simulation",
    publishedAt: "2026-03-03",
  },
  {
    title: "Irish Budget Quiz",
    description:
      "Test your intuition on how Ireland's 2024 public spending is allocated, with score tracking and an interactive budget breakdown explorer.",
    href: "/labs/irish-budget-quiz",
    badge: "Civics",
    meta: "Budget • Quiz",
    publishedAt: "2026-06-10",
    image: "/labs/irish-budget-quiz/cover.png",
    imageAlt: "Screenshot of the Irish Budget Quiz interactive budget controls.",
    isPinned: true,
    isFeatured: true,
  },
  {
    title: "FDA Pre-Sub Quiz",
    description:
      "A tongue-in-cheek SaMD quiz on surviving FDA pre-sub meetings, while pressure-testing the quality of your validation story.",
    href: "/labs/samd-fda-pre-sub-quiz",
    badge: "SaMD",
    meta: "FDA • Quiz",
    publishedAt: "2026-06-12",
  },
  {
    title: "SaMD Startup Quiz",
    description:
      "Find your SaMD startup archetype across intended use, QMS maturity, validation discipline, and claim strategy.",
    href: "/labs/samd-startup-quiz",
    badge: "SaMD",
    meta: "Startup • Quiz",
    publishedAt: "2026-06-12",
  },
  {
    title: "12 Stages of QMS",
    description:
      "A satirical but practical interactive journey through the 12 moments when a SaMD team realises quality management can no longer be postponed.",
    href: "/labs/samd-qms-stages",
    badge: "SaMD",
    meta: "QMS • Interactive",
    publishedAt: "2026-06-12",
  },
  {
    title: "Which ISO Standard Are You?",
    description:
      "A SaMD standards personality quiz to discover whether your default mode is QMS, risk, software lifecycle, usability, clinical evidence, or security governance.",
    href: "/labs/samd-iso-standard-quiz",
    badge: "SaMD",
    meta: "Standards • Quiz",
    publishedAt: "2026-06-12",
  },
  {
    title: "Irish Budget Block Game",
    description:
      "Allocate 20 budget blocks across major spending categories, then compare your guess to Ireland's rounded 2024 expenditure mix.",
    href: "/labs/irish-budget-block-game",
    badge: "Civics",
    meta: "Budget • Game",
    publishedAt: "2026-06-10",
    isPinned: true,
  },
  {
    title: "Ireland's Fiscal Flow",
    description:
      "Estimate your annual tax contribution and compare it with how Ireland's 2024 public spending is distributed.",
    href: "/labs/irelands-fiscal-flow",
    badge: "Civics",
    meta: "Budget • Explorer",
    publishedAt: "2026-06-10",
    isPinned: true,
  },
  {
    title: "Irish Tax Breakdown 2026",
    description:
      "Explore effective and marginal income tax, USC, and PRSI rates across incomes with pension and employment controls.",
    href: "/labs/irish-tax-breakdown-2026",
    badge: "Data Viz",
    meta: "Tax • Explorer",
    publishedAt: "2026-06-12",
  },
  {
    title: "Irish Tax Waterfall 2026",
    description:
      "Trace how illustrative 2026 taxes, spending, and return taxes convert gross pay into retained annual wealth.",
    href: "/labs/irish-tax-waterfall-2026",
    badge: "Data Viz",
    meta: "Tax • Waterfall",
    publishedAt: "2026-06-12",
  },
  {
    title: "Irish Purchase Tax Time 2026",
    description:
      "Estimate how much working time goes to the thing itself, income taxes, and direct purchase taxes across everyday and big-ticket items.",
    href: "/labs/irish-purchase-tax-time-2026",
    badge: "Data Viz",
    meta: "Tax • Calculator",
    publishedAt: "2026-06-25",
  },
  {
    title: "Ireland's Finances Breakdown",
    description:
      "Explore Ireland's 2024 income and expenditure mix with interactive doughnut charts and clickable spending drilldowns.",
    href: "/labs/irelands-finances-breakdown",
    badge: "Civics",
    meta: "Budget • Data Viz",
    publishedAt: "2026-06-12",
  },
];

export function sortLabs(labs: Lab[]) {
  return [...labs].sort((a, b) => {
    if (Boolean(a.isPinned) !== Boolean(b.isPinned)) {
      return a.isPinned ? -1 : 1;
    }

    const dateDelta =
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();

    if (dateDelta !== 0) {
      return dateDelta;
    }

    return a.title.localeCompare(b.title);
  });
}

export function getAllLabs() {
  return sortLabs(LABS);
}

export function getFeaturedLab() {
  const labs = getAllLabs();
  return labs.find((lab) => lab.isFeatured) ?? labs[0];
}

export function getRecentLabs(limit = 5) {
  return getAllLabs().slice(0, limit);
}
