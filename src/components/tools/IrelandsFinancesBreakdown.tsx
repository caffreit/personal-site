"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { useMemo, useState } from "react";

import { LabDetails, LabHeader, LabShell } from "@/components/labs/LabChrome";
import { LabLegend, LabTooltip } from "@/components/labs/labChartTheme";
import {
  labFootnote,
  labLink,
  labMicroLabel,
  labQuietButton,
} from "@/components/labs/labTokens";

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
    <LabTooltip
      label={item.name}
      rows={[
        {
          key: "share",
          name: `${percentage}% of total`,
          value: formatBillions(datum.value),
        },
      ]}
      note={item.description}
    />
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
    <LabShell>
      <LabHeader
        eyebrow="Public Spending - Ireland 2024"
        title="Ireland's Finances: Interactive Breakdown"
        lede="Compare income sources with expenditure categories and drill into spending segments for additional detail."
      />

      <section className="mt-9 grid grid-cols-1 gap-12 border-t border-[color:var(--rule-color)] pt-7 lg:grid-cols-2 lg:gap-0">
        <article className="min-w-0 border-[color:var(--rule-color)] lg:border-r lg:pr-10">
          <p className={labMicroLabel}>Total income</p>
          <h2 className="mt-2 text-[2.4rem] font-light tracking-[-0.03em] tabular-nums text-[color:var(--foreground)]">
            {formatBillions(incomeTotal)}
          </h2>

          <div className="mt-6 h-[22rem] w-full">
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
                  stroke="none"
                >
                  {INCOME_DATA.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<SliceTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <LabLegend
            className="mt-6 border-t border-[color:var(--rule-color)] pt-5"
            items={INCOME_DATA.map((entry) => ({
              key: entry.name,
              label: entry.name,
              color: entry.color,
            }))}
          />
        </article>

        <article className="min-w-0 lg:pl-10">
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <p className={labMicroLabel}>{currentNode.name}</p>
            {drilldownPath.length > 1 && (
              <button type="button" onClick={goBack} className={labQuietButton}>
                Back one level
              </button>
            )}
          </div>
          <h2 className="mt-2 text-[2.4rem] font-light tracking-[-0.03em] tabular-nums text-[color:var(--foreground)]">
            {formatBillions(expenditureTotal)}
          </h2>

          <div className="mt-6 h-[22rem] w-full">
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
                  stroke="none"
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
              </PieChart>
            </ResponsiveContainer>
          </div>

          <LabLegend
            className="mt-6 border-t border-[color:var(--rule-color)] pt-5"
            items={expenditureSlices.map((entry) => ({
              key: entry.name,
              label: entry.name,
              color: entry.color,
              dimmed: !entry.children?.length,
            }))}
            onSelect={(key) =>
              enterDrilldown(expenditureSlices.findIndex((entry) => entry.name === key))
            }
          />

          <p className={`mt-5 ${labFootnote}`}>
            Click a segment for a deeper spending breakdown where available.
          </p>
        </article>
      </section>

      <LabDetails
        heading="Notes and sources"
        summary="Where these figures come from."
      >
        <p className="text-[1rem] leading-[1.7] text-[color:var(--text-body-rgb)]">
          Data sourced and aggregated from the{" "}
          <a
            href="https://assets.gov.ie/static/documents/revised-estimates-for-public-service-2024.pdf"
            target="_blank"
            rel="noreferrer"
            className={labLink}
          >
            Revised Estimates for Public Service 2024
          </a>
          .
        </p>
      </LabDetails>
    </LabShell>
  );
}
