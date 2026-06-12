import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import LabsListing, { type Lab } from "@/components/labs/LabsListing";

const LABS: Lab[] = [
  {
    title: "Three Stations",
    description: "Tap anywhere on the Liffey corridor to compare real-time walking routes from Connolly, Tara Street, and Pearse using the Google Maps Directions API.",
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
    isPinned: true,
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
    title: "Ireland's Finances Breakdown",
    description:
      "Explore Ireland's 2024 income and expenditure mix with interactive doughnut charts and clickable spending drilldowns.",
    href: "/labs/irelands-finances-breakdown",
    badge: "Civics",
    meta: "Budget • Data Viz",
    publishedAt: "2026-06-12",
  },
];

export const metadata = {
  title: "Labs",
  description: "Prototype playgrounds and interactive data experiments.",
};

export default function LabsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 pt-12 pb-32 sm:px-6 lg:px-8">
      <div className="mb-12">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-stone-500 transition-colors hover:text-stone-900"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="font-mono text-sm font-medium uppercase tracking-[0.2em]">
            Back to Home
          </span>
        </Link>

        <h1 className="text-6xl font-black uppercase leading-[0.8] tracking-tighter text-stone-900 sm:text-8xl mb-8">
          Labs
        </h1>
        <p className="max-w-2xl text-xl leading-relaxed text-stone-600 font-serif italic">
          WIP explorations that lean on APIs, data viz, and playful UI patterns—
          sharing the same editorial feel as the photo and blog archives.
        </p>
      </div>

      <LabsListing labs={LABS} />
    </div>
  );
}


