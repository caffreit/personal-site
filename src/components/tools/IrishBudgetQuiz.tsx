"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, RotateCcw } from "lucide-react";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

type QuizOption = {
  id: string;
  label: string;
};

type QuizQuestion = {
  id: string;
  prompt: string;
  options: QuizOption[];
  correctOptionId: string;
  feedback: string;
  sources: { label: string; href: string }[];
};

type BudgetNode = {
  id: string;
  label: string;
  value: number;
  description: string;
  color: string;
  children?: BudgetNode[];
};

const BEST_SCORE_KEY = "personal-site-irish-budget-quiz-best";
const EMPTY_CHILDREN: BudgetNode[] = [];
const SOURCES = {
  rev2024: {
    label: "REV 2024 release",
    href: "https://www.gov.ie/en/department-of-public-expenditure-infrastructure-public-service-reform-and-digitalisation/press-releases/minister-donohoe-publishes-the-revised-estimates-for-public-services-2024/",
  },
  pboOverview: {
    label: "PBO overview (2024)",
    href: "https://data.oireachtas.ie/ie/oireachtas/parliamentaryBudgetOffice/2024/2024-02-14_overview-of-the-revised-estimates-for-public-services-2024_en.pdf",
  },
};

const chartHierarchy: BudgetNode = {
  id: "total-expenditure",
  label: "Total Expenditure",
  value: 104.1,
  color: "#0f172a",
  description: "Interactive breakdown of major 2024 expenditure categories.",
  children: [
    {
      id: "social-protection",
      label: "Social Protection",
      value: 42.6,
      color: "#45B7D1",
      description:
        "The largest area of spending, covering welfare payments like pensions, child benefit and unemployment support.",
      children: [
        {
          id: "pensions",
          label: "Pensions",
          value: 20.4,
          color: "#5cb8d6",
          description:
            "Payments to retired citizens, including State Pension and public service pensions.",
          children: [
            {
              id: "state-pension",
              label: "State Pension",
              value: 11.2,
              color: "#7ac4dd",
              description:
                "Weekly payments to eligible older citizens based on social insurance contributions.",
            },
            {
              id: "public-sector-pensions",
              label: "Public Sector Pensions",
              value: 4.2,
              color: "#8cd0e3",
              description:
                "Pension payments to retired civil servants, teachers, Garda members and other public staff.",
            },
            {
              id: "other-pensions",
              label: "Other Pensions",
              value: 5.0,
              color: "#9ddcec",
              description:
                "Other pension-related schemes including widow/widower and invalidity pensions.",
            },
          ],
        },
        {
          id: "illness-disability",
          label: "Illness & Disability",
          value: 9.8,
          color: "#6fc2da",
          description:
            "Income support for people unable to work due to illness/disability, including carer payments.",
        },
        {
          id: "child-family",
          label: "Child & Family",
          value: 7.1,
          color: "#82cce0",
          description:
            "Supports for children and families, including Child Benefit and TUSLA funding.",
        },
        {
          id: "working-age-supports",
          label: "Working Age Supports",
          value: 5.3,
          color: "#95d6e6",
          description:
            "Income supports for jobseekers, lone parents and supplementary welfare.",
        },
      ],
    },
    {
      id: "health",
      label: "Health",
      value: 24.1,
      color: "#FF6B6B",
      description:
        "Funding for the public health system, from hospitals to community care.",
      children: [
        {
          id: "acute-hospitals",
          label: "Acute Hospitals",
          value: 11.5,
          color: "#ff8c8c",
          description: "Day-to-day funding for the national hospital network.",
          children: [
            {
              id: "hse-pay",
              label: "HSE Pay",
              value: 7.5,
              color: "#ffabab",
              description: "Salaries and wages for acute-hospital staff.",
            },
            {
              id: "clinical-supplies-drugs",
              label: "Clinical Supplies & Drugs",
              value: 2.5,
              color: "#ffcaca",
              description:
                "Medicines, medical equipment and clinical supplies for hospitals.",
            },
            {
              id: "other-operating-costs",
              label: "Other Operating Costs",
              value: 1.5,
              color: "#ffe9e9",
              description:
                "Non-clinical hospital costs such as energy, maintenance and administration.",
            },
          ],
        },
        {
          id: "primary-care",
          label: "Primary Care",
          value: 5.2,
          color: "#ffacac",
          description:
            "Funding for GPs, community health services and community drug schemes.",
        },
        {
          id: "targeted-health",
          label: "Targeted Health",
          value: 7.4,
          color: "#ffcdcd",
          description:
            "Specialized services including disability, older persons and mental health.",
        },
      ],
    },
    {
      id: "education",
      label: "Education",
      value: 15.5,
      color: "#4ECDC4",
      description:
        "Covers education from primary schools through third-level institutions.",
      children: [
        {
          id: "schools",
          label: "Schools",
          value: 12.0,
          color: "#6fd7d0",
          description: "Funding for primary and secondary schools.",
          children: [
            {
              id: "primary-education",
              label: "Primary Education",
              value: 5.5,
              color: "#8fe1db",
              description:
                "Funding for primary school operations, including teacher pay.",
            },
            {
              id: "secondary-education",
              label: "Secondary Education",
              value: 5.0,
              color: "#afebf5",
              description:
                "Funding for secondary school operations, including teacher pay.",
            },
            {
              id: "special-education",
              label: "Special Education",
              value: 1.5,
              color: "#cff5ef",
              description:
                "Additional resources for students with special educational needs.",
            },
          ],
        },
        {
          id: "higher-further-ed",
          label: "Higher & Further Ed.",
          value: 3.5,
          color: "#8fe1db",
          description:
            "Funding for universities, colleges and skills training bodies such as SOLAS.",
        },
      ],
    },
    {
      id: "other",
      label: "Other",
      value: 6.6,
      color: "#9A9A9A",
      description: "Core state functions grouped into one broader category.",
      children: [
        {
          id: "justice-defence",
          label: "Justice & Defence",
          value: 3.8,
          color: "#aeaeae",
          description:
            "Funding for Garda, Defence Forces, Courts Service and Irish Prison Service.",
        },
        {
          id: "other-core-services",
          label: "Other Core Services",
          value: 2.8,
          color: "#c1c1c1",
          description:
            "Includes agriculture, foreign affairs and general administration.",
        },
      ],
    },
    {
      id: "housing",
      label: "Housing",
      value: 6.1,
      color: "#F7B801",
      description:
        "Funding for social/affordable homes, rental supports and homeless services.",
      children: [
        {
          id: "capital-build",
          label: "Capital Build",
          value: 2.7,
          color: "#f8c534",
          description: "Direct investment in building social and affordable homes.",
        },
        {
          id: "current-supports",
          label: "Current Supports",
          value: 2.4,
          color: "#f9d267",
          description: "Rental supports, mainly HAP and RAS.",
          children: [
            {
              id: "hap",
              label: "HAP",
              value: 1.2,
              color: "#fadd9a",
              description: "Housing Assistance Payment.",
            },
            {
              id: "ras-other",
              label: "RAS & Other",
              value: 1.2,
              color: "#fce8cd",
              description:
                "Rental Accommodation Scheme and other housing-related supports.",
            },
          ],
        },
        {
          id: "water-planning",
          label: "Water & Planning",
          value: 1.0,
          color: "#fadf9a",
          description:
            "Funding for Uisce Eireann and the planning system.",
        },
      ],
    },
    {
      id: "debt-eu-budget",
      label: "Debt & EU Budget",
      value: 4.7,
      color: "#5A4D9B",
      description:
        "Non-discretionary spending on debt servicing and EU contributions.",
      children: [
        {
          id: "debt-service",
          label: "Debt Service",
          value: 2.9,
          color: "#776aae",
          description: "Interest payments on the national debt.",
        },
        {
          id: "eu-budget",
          label: "EU Budget",
          value: 1.5,
          color: "#9487c1",
          description: "Ireland's annual contribution to the EU budget.",
        },
        {
          id: "other-debt-costs",
          label: "Other Costs",
          value: 0.3,
          color: "#b1a4d4",
          description: "Other costs associated with managing national debt.",
        },
      ],
    },
    {
      id: "transport",
      label: "Transport",
      value: 4.5,
      color: "#F18701",
      description:
        "Investment in public transport, roads and active travel.",
      children: [
        {
          id: "public-transport",
          label: "Public Transport",
          value: 1.6,
          color: "#f39e34",
          description:
            "Subsidies and investment for bus and rail services, including BusConnects.",
        },
        {
          id: "road-networks",
          label: "Road Networks",
          value: 1.4,
          color: "#f5b567",
          description:
            "Maintenance and development of national, regional and local roads.",
        },
        {
          id: "active-travel",
          label: "Active Travel",
          value: 0.9,
          color: "#f7cc9a",
          description:
            "Investment in walking and cycling infrastructure, including Greenways.",
        },
        {
          id: "aviation-maritime",
          label: "Aviation/Maritime",
          value: 0.6,
          color: "#f9e3cd",
          description: "Funding for ports, airports and the Coast Guard.",
        },
      ],
    },
  ],
};

const questions: QuizQuestion[] = [
  {
    id: "q1",
    prompt: "Which receives more funding annually?",
    options: [
      { id: "jobseeker", label: "Jobseeker's Payments" },
      { id: "child-benefit", label: "Child Benefit" },
    ],
    correctOptionId: "child-benefit",
    feedback:
      "Child Benefit is larger: ~4.3% (~€4.16bn) vs Jobseeker's Payments at ~2.4% (~€2.32bn).",
    sources: [SOURCES.pboOverview],
  },
  {
    id: "q2",
    prompt:
      "What percentage of total government spending goes to the Defence Forces?",
    options: [
      { id: "low", label: "< 1%" },
      { id: "mid", label: "Approx. 3%" },
      { id: "high", label: "Approx. 5%" },
    ],
    correctOptionId: "low",
    feedback:
      "The best answer is < 1%. For reference, 1% is about €0.97bn, and defence spending is below that.",
    sources: [SOURCES.pboOverview, SOURCES.rev2024],
  },
  {
    id: "q3",
    prompt:
      "True or False: The government spends more on building new social homes than it does on supporting private tenancies (like HAP).",
    options: [
      { id: "true", label: "True" },
      { id: "false", label: "False" },
    ],
    correctOptionId: "false",
    feedback:
      "False. In the quiz model, social-home building is ~1.5% (~€1.45bn), while private-tenancy supports are ~2.3% (~€2.22bn).",
    sources: [SOURCES.rev2024, SOURCES.pboOverview],
  },
  {
    id: "q4",
    prompt: "Which annual budget is higher?",
    options: [
      { id: "pensions", label: "All Pension Expenditure" },
      { id: "education", label: "The entire Education budget" },
    ],
    correctOptionId: "pensions",
    feedback:
      "All Pension Expenditure is higher: ~19.6% (~€18.95bn) vs education at ~15.6% (~€15.12bn).",
    sources: [SOURCES.pboOverview],
  },
  {
    id: "q5",
    prompt: "Which gets more funding?",
    options: [
      { id: "garda", label: "An Garda Siochana" },
      { id: "unallocated", label: "Unallocated expenditure" },
    ],
    correctOptionId: "garda",
    feedback:
      "An Garda Siochana receives more: about €2.356bn versus €0.376bn unallocated.",
    sources: [SOURCES.pboOverview],
  },
  {
    id: "q6",
    prompt:
      "What percentage of the budget is spent on supporting asylum seekers and refugees (accommodation, daily expenses, etc.)?",
    options: [
      { id: "a", label: "Approx. 1-2%" },
      { id: "b", label: "Approx. 4-5%" },
      { id: "c", label: "Approx. 8-9%" },
    ],
    correctOptionId: "a",
    feedback:
      "Approx. 1-2% is the closest range, which is roughly €0.97bn to €1.93bn.",
    sources: [SOURCES.pboOverview, SOURCES.rev2024],
  },
  {
    id: "q7",
    prompt: "Which receives more public funding?",
    options: [
      { id: "roads", label: "The Road Network" },
      { id: "transport", label: "Public Transport" },
    ],
    correctOptionId: "transport",
    feedback:
      "Public Transport is higher in this quiz model: about ~1.6% (~€1.55bn) versus roads at ~1.4% (~€1.35bn).",
    sources: [SOURCES.pboOverview, SOURCES.rev2024],
  },
  {
    id: "q8",
    prompt:
      "True or False: The state spends more on interest payments for the national debt than it does on the entire Arts Council budget.",
    options: [
      { id: "true", label: "True" },
      { id: "false", label: "False" },
    ],
    correctOptionId: "true",
    feedback:
      "True. Debt interest is around ~2.8-2.9% (about €2.71bn-€2.80bn), while Arts Council-level funding is near ~0.1% (about €0.10bn).",
    sources: [SOURCES.rev2024, SOURCES.pboOverview],
  },
  {
    id: "q9",
    prompt:
      "The total salary bill for all Primary & Secondary teachers is what percentage of total government spending?",
    options: [
      { id: "a", label: "Approx. 4%" },
      { id: "b", label: "Approx. 7%" },
      { id: "c", label: "Approx. 10%" },
    ],
    correctOptionId: "b",
    feedback:
      "Approx. 7% is the intended answer, which is about €6.77bn.",
    sources: [SOURCES.pboOverview, SOURCES.rev2024],
  },
  {
    id: "q10",
    prompt: "Which is larger?",
    options: [
      { id: "oda", label: "Ireland's Overseas Development Aid budget" },
      {
        id: "active-travel",
        label: "The budget for Active Travel (Greenways, cycle lanes)",
      },
    ],
    correctOptionId: "oda",
    feedback:
      "Overseas Development Aid is larger: ~1.1% (~€1.06bn) versus Active Travel at ~0.9% (~€0.87bn).",
    sources: [SOURCES.rev2024, SOURCES.pboOverview],
  },
  {
    id: "q11",
    prompt: "Which area gets the larger 2024 allocation?",
    options: [
      { id: "health", label: "Health" },
      {
        id: "social-protection",
        label: "Social Protection (Pension, Jobseekers, etc.)",
      },
    ],
    correctOptionId: "social-protection",
    feedback:
      "Social Protection is larger: about €25.579bn versus Health at about €22.821bn.",
    sources: [SOURCES.pboOverview],
  },
  {
    id: "q12",
    prompt: "Within Social Protection, which cost group is larger?",
    options: [
      { id: "pensions", label: "Pensions" },
      { id: "illness", label: "Illness, Disability & Carers" },
    ],
    correctOptionId: "pensions",
    feedback:
      "Pensions are larger: about €10.685bn versus €5.600bn for Illness, Disability & Carers.",
    sources: [SOURCES.pboOverview],
  },
];

function formatShare(value: number) {
  return `${value.toFixed(1)}%`;
}

function shuffle<T>(items: T[]) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]];
  }
  return copy;
}

function getMaxDepth(node: BudgetNode): number {
  if (!node.children || node.children.length === 0) return 1;
  return 1 + Math.max(...node.children.map((child) => getMaxDepth(child)));
}

const MAX_DRILL_LEVEL = getMaxDepth(chartHierarchy);

export default function IrishBudgetQuiz() {
  const [quizData, setQuizData] = useState<QuizQuestion[]>(questions);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState<number>(() => {
    if (typeof window === "undefined") return 0;
    const saved = window.localStorage.getItem(BEST_SCORE_KEY);
    const parsed = Number(saved);
    return Number.isNaN(parsed) ? 0 : parsed;
  });
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [drilldownPath, setDrilldownPath] = useState<BudgetNode[]>([chartHierarchy]);

  const currentQuestion = quizData[currentIndex];
  const isComplete = quizData.length > 0 && currentIndex >= quizData.length;
  const chartNode = drilldownPath[drilldownPath.length - 1];
  const chartChildren = chartNode.children ?? EMPTY_CHILDREN;
  const currentLevel = drilldownPath.length;
  const currentDetailLevel = Math.max(1, currentLevel - 1);
  const maxDetailLevel = Math.max(1, MAX_DRILL_LEVEL - 1);

  const chartData = useMemo(
    () =>
      chartChildren.map((item) => ({
        name: item.label,
        value: item.value,
        description: item.description,
        color: item.color,
      })),
    [chartChildren],
  );

  function resetQuiz() {
    setQuizData(shuffle(questions));
    setCurrentIndex(0);
    setScore(0);
    setSelectedOptionId(null);
    setHasAnswered(false);
    setDrilldownPath([chartHierarchy]);
  }

  function handleAnswer(optionId: string) {
    if (!currentQuestion || hasAnswered) return;
    setSelectedOptionId(optionId);
    setHasAnswered(true);
    if (optionId === currentQuestion.correctOptionId) {
      setScore((prev) => prev + 1);
    }
  }

  function goNext() {
    if (!hasAnswered) return;
    const nextIndex = currentIndex + 1;
    if (nextIndex >= quizData.length) {
      const finalScore = score;
      if (finalScore > bestScore) {
        setBestScore(finalScore);
        if (typeof window !== "undefined") {
          window.localStorage.setItem(BEST_SCORE_KEY, String(finalScore));
        }
      }
    }
    setCurrentIndex(nextIndex);
    setSelectedOptionId(null);
    setHasAnswered(false);
  }

  function getButtonClass(optionId: string) {
    if (!hasAnswered || !currentQuestion) {
      return "border-stone-300 bg-white text-stone-900 hover:border-yellow-500 hover:-translate-y-0.5";
    }
    if (optionId === currentQuestion.correctOptionId) {
      return "border-emerald-500 bg-emerald-50 text-emerald-900";
    }
    if (optionId === selectedOptionId) {
      return "border-rose-500 bg-rose-50 text-rose-900";
    }
    return "border-stone-300 bg-stone-100 text-stone-500";
  }

  function enterDrilldown(index: number) {
    const next = chartNode.children?.[index];
    if (!next?.children?.length) return;
    setDrilldownPath((prev) => [...prev, next]);
  }

  function goBackDrilldown() {
    setDrilldownPath((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pt-10 pb-24 sm:px-6 lg:px-8">
      <Link
        href="/labs"
        className="mb-8 inline-flex items-center gap-2 text-stone-500 transition-colors hover:text-stone-900"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="font-mono text-sm font-medium uppercase tracking-[0.2em]">
          Back to Labs
        </span>
      </Link>

      <header className="mb-10 space-y-4">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.3em] text-stone-500">
          Public Spending • Ireland 2024
        </p>
        <h1 className="max-w-4xl text-5xl font-black uppercase leading-[0.9] tracking-tight text-stone-900 sm:text-7xl">
          The Irish Budget Quiz
        </h1>
        <p className="max-w-3xl text-lg leading-relaxed text-stone-600 sm:text-xl">
          Guess where public money goes, then compare your intuition against
          the published 2024 allocations. Figures are rounded for readability
          and used as an explainer rather than a full accounting model.
        </p>
      </header>

      <section className="mb-8 rounded-[2rem] border border-stone-200 bg-white p-6 shadow-[0_10px_40px_-25px_rgba(0,0,0,0.4)] sm:p-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-2xl font-black tracking-tight text-stone-900 sm:text-3xl">
            Quiz
          </h2>
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-[0.2em]">
            <span className="rounded-full border border-stone-200 px-3 py-1 text-stone-700">
              Current {score}
            </span>
            <span className="rounded-full border border-stone-200 px-3 py-1 text-stone-700">
              Best {bestScore}
            </span>
          </div>
        </div>

        {!isComplete && currentQuestion && (
          <>
            <div className="mb-4 flex items-center justify-between text-sm text-stone-600">
              <span className="font-mono uppercase tracking-[0.16em]">
                Question {currentIndex + 1} / {quizData.length}
              </span>
              <span>{Math.round(((currentIndex + 1) / quizData.length) * 100)}%</span>
            </div>
            <div className="mb-6 h-2 overflow-hidden rounded-full bg-stone-200">
              <div
                className="h-full rounded-full bg-yellow-500 transition-all duration-300"
                style={{
                  width: `${((currentIndex + 1) / quizData.length) * 100}%`,
                }}
              />
            </div>

            <h3 className="mb-6 text-2xl font-bold leading-snug text-stone-900">
              {currentQuestion.prompt}
            </h3>
            <div className="space-y-3">
              {currentQuestion.options.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  disabled={hasAnswered}
                  onClick={() => handleAnswer(option.id)}
                  className={`w-full rounded-2xl border p-4 text-left text-base font-semibold transition ${getButtonClass(option.id)} disabled:cursor-not-allowed disabled:translate-y-0`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {hasAnswered && (
              <div className="mt-6 rounded-2xl border border-stone-200 bg-stone-50 p-5">
                <p className="text-base leading-relaxed text-stone-800">
                  {currentQuestion.feedback}
                </p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-stone-600">
                  {currentQuestion.sources.map((source) => (
                    <a
                      key={source.href}
                      href={source.href}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full border border-stone-300 bg-white px-3 py-1 underline decoration-stone-400 underline-offset-4 transition hover:border-stone-800 hover:decoration-stone-800"
                    >
                      Source: {source.label}
                    </a>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={goNext}
                  className="mt-4 inline-flex items-center rounded-full bg-stone-900 px-6 py-2 text-sm font-semibold text-white transition hover:bg-stone-700"
                >
                  {currentIndex + 1 === quizData.length
                    ? "See Results"
                    : "Next Question"}
                </button>
              </div>
            )}
          </>
        )}

        {isComplete && (
          <div className="rounded-2xl border border-stone-200 bg-stone-50 p-6 text-center sm:p-8">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.3em] text-stone-500">
              Quiz Complete
            </p>
            <h3 className="mt-2 text-4xl font-black tracking-tight text-stone-900">
              {score} / {quizData.length}
            </h3>
            <p className="mt-3 text-stone-700">
              Best score in this browser:{" "}
              <span className="font-bold text-stone-900">{bestScore}</span>
            </p>
            <button
              type="button"
              onClick={resetQuiz}
              className="mt-6 inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white px-5 py-2 text-sm font-semibold text-stone-900 transition hover:border-stone-900"
            >
              <RotateCcw className="h-4 w-4" />
              Play Again
            </button>
          </div>
        )}
      </section>

      {isComplete && (
        <>
      <section className="mb-8 rounded-[2rem] border border-stone-200 bg-white p-6 shadow-[0_10px_40px_-25px_rgba(0,0,0,0.4)] sm:p-8">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-2xl font-black tracking-tight text-stone-900 sm:text-3xl">
                Budget Breakdown Explorer
              </h2>
              <span className="rounded-full border border-stone-300 bg-stone-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-stone-700">
                Detail level {currentDetailLevel} of {maxDetailLevel}
              </span>
            </div>
            <p className="mb-4 text-sm text-stone-600">
              Total: <span className="font-semibold">{formatShare(chartNode.value)}</span>
            </p>
            <div className="mb-6 rounded-xl border border-yellow-300 bg-yellow-50 p-3 text-sm font-medium text-stone-800">
              Tip: click a chart segment to drill into more detail. Use Back on
              the chart to return to the previous level.
            </div>

        <div className="relative h-[26rem] w-full">
          {drilldownPath.length > 1 && (
            <button
              type="button"
              onClick={goBackDrilldown}
              className="absolute left-3 top-3 z-10 rounded-full border border-stone-400 bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-stone-800 shadow-sm transition hover:border-stone-900 hover:text-stone-900"
            >
              Back
            </button>
          )}
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={68}
                outerRadius={140}
                paddingAngle={2}
                onClick={(_, index) => {
                  if (typeof index === "number") {
                    enterDrilldown(index);
                  }
                }}
              >
                {chartData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number, _name, item) => {
                      const share = formatShare(value);
                      return [share, item.payload?.name ?? "Share"];
                }}
                contentStyle={{
                  borderRadius: "12px",
                  borderColor: "#d6d3d1",
                }}
                labelFormatter={(_label, payload) =>
                  payload?.[0]?.payload?.description ?? ""
                }
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-[0_10px_40px_-25px_rgba(0,0,0,0.4)] sm:p-8">
        <h2 className="text-2xl font-black tracking-tight text-stone-900 sm:text-3xl">
          Sources
        </h2>
        <ul className="mt-4 space-y-2 text-stone-700">
          <li>
            Department of Public Expenditure:{" "}
            <a
              href={SOURCES.rev2024.href}
              target="_blank"
              rel="noreferrer"
              className="underline decoration-stone-400 underline-offset-4 transition hover:decoration-stone-900"
            >
              Revised Estimates for Public Services 2024 release
            </a>
          </li>
          <li>
            Oireachtas Parliamentary Budget Office:{" "}
            <a
              href={SOURCES.pboOverview.href}
              target="_blank"
              rel="noreferrer"
              className="underline decoration-stone-400 underline-offset-4 transition hover:decoration-stone-900"
            >
              Overview of the Revised Estimates for Public Services 2024
            </a>
          </li>
        </ul>
      </section>
        </>
      )}
    </div>
  );
}
