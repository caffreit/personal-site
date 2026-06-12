"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { useMemo, useState } from "react";

type BudgetNode = {
  name: string;
  value: number;
  color: string;
  description: string;
  children?: BudgetNode[];
};

type IncomeSlice = {
  name: string;
  value: number;
  color: string;
  description: string;
};

const INCOME_DATA: IncomeSlice[] = [
  {
    name: "Corporation Tax",
    value: 39.1,
    color: "#45B7D1",
    description:
      "Tax paid by companies on profits. A large share comes from a relatively small group of multinational firms.",
  },
  {
    name: "Income Tax",
    value: 35.1,
    color: "#4ECDC4",
    description:
      "Tax on personal earnings (PAYE and self-employed), including USC. This is the largest personal-tax stream.",
  },
  {
    name: "VAT",
    value: 21.8,
    color: "#FF6B6B",
    description:
      "Value Added Tax on goods and services purchased by households and businesses.",
  },
  {
    name: "Excise Duties",
    value: 6.3,
    color: "#F7B801",
    description: "Product taxes on goods such as alcohol, tobacco, and fuel.",
  },
  {
    name: "Borrowing & Other",
    value: 5.3,
    color: "#5A4D9B",
    description: "Borrowing plus smaller non-tax revenue sources such as fees and charges.",
  },
];

const EXPENDITURE_ROOT: BudgetNode = {
  name: "Total Expenditure",
  value: 104.1,
  color: "#0f172a",
  description: "Ireland's total planned public spending for the year.",
  children: [
    {
      name: "Social Protection",
      value: 42.6,
      color: "#45B7D1",
      description:
        "Largest spending area, covering pensions, child benefit, and broader welfare supports.",
      children: [
        {
          name: "Pensions",
          value: 20.4,
          color: "#5cb8d6",
          description:
            "Payments to retired citizens, including State Pension and public service pensions.",
          children: [
            {
              name: "State Pension",
              value: 11.2,
              color: "#7ac4dd",
              description: "Weekly pension payment for eligible older citizens.",
            },
            {
              name: "Public Sector Pensions",
              value: 4.2,
              color: "#8cd0e3",
              description: "Pension commitments for retired public sector workers.",
            },
            {
              name: "Other Pensions",
              value: 5.0,
              color: "#9ddcec",
              description: "Other schemes, including widowed and invalidity-related pensions.",
            },
          ],
        },
        {
          name: "Illness & Disability",
          value: 9.8,
          color: "#6fc2da",
          description:
            "Supports for people unable to work due to illness or disability, including carers.",
          children: [
            {
              name: "Disability Allowance",
              value: 3.5,
              color: "#8ad1e3",
              description: "Means-tested support payment for people with disabilities.",
            },
            {
              name: "Invalidity Pension",
              value: 2.5,
              color: "#9cd9e9",
              description: "Long-term payment for people permanently incapable of work.",
            },
            {
              name: "Carer's Allowance",
              value: 2.0,
              color: "#addfef",
              description: "Income support for full-time carers.",
            },
            {
              name: "Illness Benefit",
              value: 1.0,
              color: "#bde6f5",
              description: "Short-term payment for workers unable to work due to illness.",
            },
            {
              name: "Other Illness Supports",
              value: 0.8,
              color: "#cdf0fa",
              description: "Other illness/disability support schemes.",
            },
          ],
        },
        {
          name: "Child & Family",
          value: 7.1,
          color: "#82cce0",
          description: "Support for children and families including Child Benefit and TUSLA.",
          children: [
            {
              name: "Child Benefit",
              value: 4.5,
              color: "#99d7e7",
              description: "Universal monthly payment for children.",
            },
            {
              name: "TUSLA",
              value: 2.6,
              color: "#b0e2ee",
              description: "Funding for the Child and Family Agency.",
            },
          ],
        },
        {
          name: "Working Age Supports",
          value: 5.3,
          color: "#95d6e6",
          description: "Income supports for jobseekers and low-income working-age households.",
          children: [
            {
              name: "Jobseeker's Payments",
              value: 2.5,
              color: "#a8deef",
              description: "Income support for people actively seeking work.",
            },
            {
              name: "One-Parent Family",
              value: 1.2,
              color: "#bbe6f4",
              description: "Support payment for lone parents.",
            },
            {
              name: "Working Family Payment",
              value: 0.5,
              color: "#ceeffa",
              description: "In-work support for low-income families with children.",
            },
            {
              name: "Supplementary Welfare",
              value: 0.6,
              color: "#dff7fc",
              description: "Means-tested supports for exceptional or temporary need.",
            },
            {
              name: "Other Working Age",
              value: 0.5,
              color: "#effbff",
              description: "Other working-age income support schemes.",
            },
          ],
        },
      ],
    },
    {
      name: "Health",
      value: 24.1,
      color: "#FF6B6B",
      description: "Funding for hospitals, primary care, and specialized health services.",
      children: [
        {
          name: "Acute Hospitals",
          value: 11.5,
          color: "#ff8c8c",
          description: "Day-to-day operating funding for acute hospitals.",
          children: [
            {
              name: "HSE Pay",
              value: 7.5,
              color: "#ffabab",
              description: "Salaries and wages for acute-hospital staff.",
            },
            {
              name: "Clinical Supplies & Drugs",
              value: 2.5,
              color: "#ffcaca",
              description: "Medicines, equipment, and clinical consumables.",
            },
            {
              name: "Other Operating Costs",
              value: 1.5,
              color: "#ffe9e9",
              description: "Non-clinical operating costs such as energy and maintenance.",
            },
          ],
        },
        {
          name: "Primary Care",
          value: 5.2,
          color: "#ffacac",
          description: "Funding for GPs, community health services, and related schemes.",
        },
        {
          name: "Targeted Health",
          value: 7.4,
          color: "#ffcdcd",
          description: "Includes disability, older persons, and mental health services.",
        },
      ],
    },
    {
      name: "Education",
      value: 15.5,
      color: "#4ECDC4",
      description: "All levels of education from schools through higher and further education.",
      children: [
        {
          name: "Schools",
          value: 12.0,
          color: "#6fd7d0",
          description: "Funding for primary and secondary schools.",
          children: [
            {
              name: "Primary Education",
              value: 5.5,
              color: "#8fe1db",
              description: "Operating and staffing funding for primary schools.",
            },
            {
              name: "Secondary Education",
              value: 5.0,
              color: "#afebf5",
              description: "Operating and staffing funding for secondary schools.",
            },
            {
              name: "Special Education",
              value: 1.5,
              color: "#cff5ef",
              description: "Additional supports for students with special educational needs.",
            },
          ],
        },
        {
          name: "Higher & Further Ed.",
          value: 3.5,
          color: "#8fe1db",
          description: "Funding for universities, colleges, and skills training pathways.",
          children: [
            {
              name: "University Grants",
              value: 2.5,
              color: "#a2e8e3",
              description: "Core grants for higher education institutions.",
            },
            {
              name: "Apprenticeships",
              value: 1.0,
              color: "#c5f2ef",
              description: "Support for apprenticeships and related training.",
            },
          ],
        },
      ],
    },
    {
      name: "Other",
      value: 6.6,
      color: "#9A9A9A",
      description: "Broad category covering justice, defence, and other core services.",
      children: [
        {
          name: "Justice & Defence",
          value: 3.8,
          color: "#aeaeae",
          description: "Funding for Garda, Defence Forces, courts, and prisons.",
          children: [
            { name: "Gardaí", value: 2.4, color: "#c1c1c1", description: "An Garda Siochana." },
            {
              name: "Defence Forces",
              value: 0.9,
              color: "#d5d5d5",
              description: "Armed forces operational and capital funding.",
            },
            {
              name: "Prisons/Courts",
              value: 0.5,
              color: "#e8e8e8",
              description: "Irish Prison Service and court system costs.",
            },
          ],
        },
        {
          name: "Other Core Services",
          value: 2.8,
          color: "#c1c1c1",
          description: "Includes agriculture, foreign affairs, and public administration.",
        },
      ],
    },
    {
      name: "Housing",
      value: 6.1,
      color: "#F7B801",
      description: "Funding for social housing, rental supports, and homeless services.",
      children: [
        {
          name: "Capital Build",
          value: 2.7,
          color: "#f8c534",
          description: "Direct investment in new social and affordable housing supply.",
          children: [
            {
              name: "New Social Housing",
              value: 1.6,
              color: "#f9d267",
              description: "Build and acquisition of social housing units.",
            },
            {
              name: "Affordable Housing",
              value: 1.1,
              color: "#fadf9a",
              description: "Support for affordable housing delivery programmes.",
            },
          ],
        },
        {
          name: "Current Supports",
          value: 2.4,
          color: "#f9d267",
          description: "Supports for renters, mainly HAP and RAS.",
          children: [
            {
              name: "HAP",
              value: 1.2,
              color: "#fadd9a",
              description: "Housing Assistance Payment.",
            },
            {
              name: "RAS & Other",
              value: 1.2,
              color: "#fce8cd",
              description: "Rental Accommodation Scheme and related supports.",
            },
          ],
        },
        {
          name: "Water & Planning",
          value: 1.0,
          color: "#fadf9a",
          description: "Funding for Uisce Eireann and planning systems.",
        },
      ],
    },
    {
      name: "Debt & EU Budget",
      value: 4.7,
      color: "#5A4D9B",
      description: "Debt interest and mandatory EU budget contributions.",
      children: [
        {
          name: "Debt Service",
          value: 2.9,
          color: "#776aae",
          description: "Interest payments on sovereign debt.",
        },
        {
          name: "EU Budget",
          value: 1.5,
          color: "#9487c1",
          description: "Ireland's annual EU contribution.",
        },
        {
          name: "Other Costs",
          value: 0.3,
          color: "#b1a4d4",
          description: "Other costs tied to debt management.",
        },
      ],
    },
    {
      name: "Transport",
      value: 4.5,
      color: "#F18701",
      description: "Public transport, roads, active travel, and aviation/maritime supports.",
      children: [
        {
          name: "Public Transport",
          value: 1.6,
          color: "#f39e34",
          description: "Investment and subsidies for bus and rail services.",
        },
        {
          name: "Road Networks",
          value: 1.4,
          color: "#f5b567",
          description: "Maintenance and development of road infrastructure.",
        },
        {
          name: "Active Travel",
          value: 0.9,
          color: "#f7cc9a",
          description: "Walking and cycling infrastructure investment.",
        },
        {
          name: "Aviation/Maritime",
          value: 0.6,
          color: "#f9e3cd",
          description: "Funding for ports, airports, and coast guard services.",
        },
      ],
    },
  ],
};

type TooltipSlice = {
  name: string;
  value: number;
  description: string;
};

type SliceTooltipProps = {
  active?: boolean;
  payload?: Array<{ payload: TooltipSlice; value: number; percent: number }>;
};

function formatBillions(value: number) {
  return `€${value.toFixed(1)}B`;
}

function SliceTooltip({ active, payload }: SliceTooltipProps) {
  if (!active || !payload?.length) return null;
  const datum = payload[0];
  const item = datum.payload;
  const percentage = (datum.percent * 100).toFixed(1);

  return (
    <div className="max-w-xs rounded-xl border border-stone-300 bg-stone-900 px-3 py-2 text-sm text-white shadow-xl">
      <p className="font-bold">{item.name}</p>
      <p className="mt-1 text-stone-200">
        {percentage}% ({formatBillions(datum.value)})
      </p>
      <p className="mt-2 text-xs leading-relaxed text-stone-300">{item.description}</p>
    </div>
  );
}

function getChildren(node: BudgetNode) {
  return node.children ?? [];
}

export default function IrelandsFinancesBreakdown() {
  const [drilldownPath, setDrilldownPath] = useState<BudgetNode[]>([EXPENDITURE_ROOT]);
  const currentNode = drilldownPath[drilldownPath.length - 1];
  const expenditureSlices = getChildren(currentNode);

  const incomeTotal = useMemo(
    () => INCOME_DATA.reduce((sum, item) => sum + item.value, 0),
    [],
  );
  const expenditureTotal = useMemo(
    () => expenditureSlices.reduce((sum, item) => sum + item.value, 0),
    [expenditureSlices],
  );

  function enterDrilldown(index: number) {
    const next = expenditureSlices[index];
    if (!next?.children?.length) return;
    setDrilldownPath((prev) => [...prev, next]);
  }

  function goBack() {
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
        <h1 className="max-w-5xl text-5xl font-black uppercase leading-[0.9] tracking-tight text-stone-900 sm:text-7xl">
          Ireland&apos;s Finances: Interactive Breakdown
        </h1>
        <p className="max-w-3xl text-lg leading-relaxed text-stone-600 sm:text-xl">
          Compare income sources with expenditure categories and drill into spending
          segments for additional detail.
        </p>
      </header>

      <section className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <article className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-[0_10px_40px_-25px_rgba(0,0,0,0.4)] sm:p-8">
          <h2 className="text-2xl font-black tracking-tight text-stone-900 sm:text-3xl">
            Total Income: {formatBillions(incomeTotal)}
          </h2>
          <div className="mt-6 h-[24rem] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={INCOME_DATA}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={138}
                  paddingAngle={2}
                >
                  {INCOME_DATA.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<SliceTooltip />} />
                <Legend layout="vertical" verticalAlign="middle" align="right" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-[0_10px_40px_-25px_rgba(0,0,0,0.4)] sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-black tracking-tight text-stone-900 sm:text-3xl">
              {currentNode.name}: {formatBillions(expenditureTotal)}
            </h2>
            {drilldownPath.length > 1 && (
              <button
                type="button"
                onClick={goBack}
                className="rounded-full border border-stone-300 bg-white px-4 py-1 text-xs font-bold uppercase tracking-[0.16em] text-stone-800 transition hover:border-stone-900"
              >
                Back
              </button>
            )}
          </div>

          <div className="mt-6 h-[24rem] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenditureSlices}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={138}
                  paddingAngle={2}
                  onClick={(_, index) => {
                    if (typeof index === "number") {
                      enterDrilldown(index);
                    }
                  }}
                >
                  {expenditureSlices.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<SliceTooltip />} />
                <Legend layout="vertical" verticalAlign="middle" align="right" />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <p className="mt-3 text-center text-xs italic text-stone-500">
            Click a segment for a deeper spending breakdown where available.
          </p>
        </article>
      </section>

      <footer className="mt-10 text-center text-sm text-stone-600">
        Data sourced and aggregated from the{" "}
        <a
          href="https://assets.gov.ie/static/documents/revised-estimates-for-public-service-2024.pdf"
          target="_blank"
          rel="noreferrer"
          className="underline decoration-stone-400 underline-offset-4 transition hover:decoration-stone-900"
        >
          Revised Estimates for Public Service 2024
        </a>
        .
      </footer>
    </div>
  );
}
