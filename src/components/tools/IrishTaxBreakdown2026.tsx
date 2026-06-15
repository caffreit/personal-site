"use client";

import Link from "next/link";
import { ArrowLeft, Briefcase, Info, PiggyBank } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type ViewType = "effective" | "marginal";

type TaxRules = {
  srcop: number;
  personalCredit: number;
  payeCredit: number;
  uscExemptionLimit: number;
  uscBands: [number, number, number];
  uscRates: [number, number, number, number];
  selfEmployedSurchargeThreshold: number;
  selfEmployedSurchargeRate: number;
  prsiRate: number;
  prsiSelfRate: number;
  prsiThreshold: number;
  selfEmployedMinPrsi: number;
  selfEmployedPrsiExemption: number;
};

type TaxBreakdownRow = {
  income: number;
  it: string;
  usc: string;
  prsi: string;
  total: string;
  totalEuro: string;
};

type TaxInsight = {
  title: string;
  label: string;
  description: string;
};

type LabourCostRow = {
  grossSalary: string;
  employerPrsi: string;
  netPay: string;
  totalCost: string;
  taxPaidPerNetEuro: string;
};

const TAX_RULES_2026: TaxRules = {
  srcop: 44_000,
  personalCredit: 2_000,
  payeCredit: 2_000,
  uscExemptionLimit: 13_000,
  uscBands: [12_012, 28_700, 70_044],
  uscRates: [0.005, 0.02, 0.03, 0.08],
  selfEmployedSurchargeThreshold: 100_000,
  selfEmployedSurchargeRate: 0.03,
  prsiRate: 0.0435,
  prsiSelfRate: 0.042,
  prsiThreshold: 18_304,
  selfEmployedMinPrsi: 500,
  selfEmployedPrsiExemption: 5_000,
};

function formatCurrency(value: number) {
  return value.toLocaleString("en-IE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  });
}

const TAX_INSIGHTS: TaxInsight[] = [
  {
    title: "The Hidden Employer Charge",
    label: "11.05% employer PRSI",
    description:
      "Before gross salary reaches the payslip, the employer may already be paying a substantial social-insurance charge. It behaves like a tax on jobs and helps explain why total labour cost can sit well above take-home pay.",
  },
  {
    title: "The Narrow Tax Base",
    label: "Bottom 40% pay little income tax",
    description:
      "Ireland protects lower earners by keeping many people out of meaningful income-tax liability. The trade-off is reliance on a smaller group of higher earners to fund a large share of public services.",
  },
  {
    title: "The USC Entry Cliff",
    label: "Threshold, not allowance",
    description:
      "USC is unusual because crossing the exemption threshold can trigger liability on the full amount, not just the extra euro. That is why the chart marks the sharp break around €13,000.",
  },
  {
    title: "The 52% Wall",
    label: "40% IT + 4% PRSI + 8% USC",
    description:
      "Above the higher USC band, new PAYE income can be cut by roughly half before it reaches the worker. This is the marginal rate, so it is felt most sharply on overtime, bonuses, and raises.",
  },
  {
    title: "The Self-Employed Peak",
    label: "55% above €100k",
    description:
      "Successful self-employment faces an extra 3% USC surcharge above €100,000, pushing the peak marginal rate above the ordinary employee rate in this simplified model.",
  },
  {
    title: "The Pension Arbitrage",
    label: "Income tax relief, not USC relief",
    description:
      "Pension contributions reduce the income-taxable base, but USC and PRSI still follow gross income. The state encourages long-term saving while keeping today's social charges in place.",
  },
];

const LABOUR_COST_ROWS: LabourCostRow[] = [
  {
    grossSalary: "€25,000",
    employerPrsi: "€2,205",
    netPay: "€23,100",
    totalCost: "€27,205",
    taxPaidPerNetEuro: "€0.18",
  },
  {
    grossSalary: "€50,000",
    employerPrsi: "€5,525",
    netPay: "€39,250",
    totalCost: "€55,525",
    taxPaidPerNetEuro: "€0.41",
  },
  {
    grossSalary: "€100,000",
    employerPrsi: "€11,050",
    netPay: "€66,100",
    totalCost: "€111,050",
    taxPaidPerNetEuro: "€0.68",
  },
  {
    grossSalary: "€150,000",
    employerPrsi: "€16,575",
    netPay: "€90,100",
    totalCost: "€166,575",
    taxPaidPerNetEuro: "€0.85",
  },
];

export default function IrishTaxBreakdown2026() {
  const [isSelfEmployed, setIsSelfEmployed] = useState(false);
  const [pensionContrib, setPensionContrib] = useState(0);
  const [viewType, setViewType] = useState<ViewType>("effective");

  const calculateTaxAtIncome = useCallback(
    (income: number): TaxBreakdownRow => {
      if (income <= 0) {
        return {
          income: 0,
          it: "0.00",
          usc: "0.00",
          prsi: "0.00",
          total: "0.00",
          totalEuro: "€0",
        };
      }

      const pensionAmount = income * (pensionContrib / 100);
      const taxableIncomeBase = Math.max(0, income - pensionAmount);

      let grossTax = 0;
      if (taxableIncomeBase <= TAX_RULES_2026.srcop) {
        grossTax = taxableIncomeBase * 0.2;
      } else {
        grossTax =
          TAX_RULES_2026.srcop * 0.2 + (taxableIncomeBase - TAX_RULES_2026.srcop) * 0.4;
      }

      const baseCredits = TAX_RULES_2026.personalCredit + TAX_RULES_2026.payeCredit;
      const netIncomeTax = Math.max(0, grossTax - baseCredits);

      let usc = 0;
      if (income > TAX_RULES_2026.uscExemptionLimit) {
        usc += Math.min(income, TAX_RULES_2026.uscBands[0]) * TAX_RULES_2026.uscRates[0];

        if (income > TAX_RULES_2026.uscBands[0]) {
          usc +=
            Math.min(
              income - TAX_RULES_2026.uscBands[0],
              TAX_RULES_2026.uscBands[1] - TAX_RULES_2026.uscBands[0],
            ) * TAX_RULES_2026.uscRates[1];
        }

        if (income > TAX_RULES_2026.uscBands[1]) {
          usc +=
            Math.min(
              income - TAX_RULES_2026.uscBands[1],
              TAX_RULES_2026.uscBands[2] - TAX_RULES_2026.uscBands[1],
            ) * TAX_RULES_2026.uscRates[2];
        }

        if (income > TAX_RULES_2026.uscBands[2]) {
          usc += (income - TAX_RULES_2026.uscBands[2]) * TAX_RULES_2026.uscRates[3];
        }

        if (isSelfEmployed && income > TAX_RULES_2026.selfEmployedSurchargeThreshold) {
          usc +=
            (income - TAX_RULES_2026.selfEmployedSurchargeThreshold) *
            TAX_RULES_2026.selfEmployedSurchargeRate;
        }
      }

      let prsi = 0;
      if (isSelfEmployed) {
        if (income >= TAX_RULES_2026.selfEmployedPrsiExemption) {
          prsi = Math.max(
            TAX_RULES_2026.selfEmployedMinPrsi,
            income * TAX_RULES_2026.prsiSelfRate,
          );
        }
      } else if (income >= TAX_RULES_2026.prsiThreshold) {
        prsi = income * TAX_RULES_2026.prsiRate;
      }

      const totalTaxAmount = netIncomeTax + usc + prsi;

      const effIT = (netIncomeTax / income) * 100;
      const effUSC = (usc / income) * 100;
      const effPRSI = (prsi / income) * 100;
      const effTotal = (totalTaxAmount / income) * 100;

      function getMarginalValues(incomePoint: number) {
        if (incomePoint <= 0) return { it: 0, usc: 0, prsi: 0 };

        const pensionReliefFactor = 1 - pensionContrib / 100;
        const pensionAdjusted = incomePoint - incomePoint * (pensionContrib / 100);
        const marginalIncomeTax =
          (pensionAdjusted > TAX_RULES_2026.srcop
            ? 0.4
            : pensionAdjusted > 20_000
              ? 0.2
              : 0) * pensionReliefFactor;

        let marginalUsc = 0;
        if (incomePoint === TAX_RULES_2026.uscExemptionLimit + 1) {
          marginalUsc = 80;
        } else if (incomePoint > TAX_RULES_2026.uscBands[2]) {
          marginalUsc = TAX_RULES_2026.uscRates[3];
        } else if (incomePoint > TAX_RULES_2026.uscBands[1]) {
          marginalUsc = TAX_RULES_2026.uscRates[2];
        } else if (incomePoint > TAX_RULES_2026.uscBands[0]) {
          marginalUsc = TAX_RULES_2026.uscRates[1];
        } else if (incomePoint > TAX_RULES_2026.uscExemptionLimit) {
          marginalUsc = TAX_RULES_2026.uscRates[0];
        }

        if (isSelfEmployed && incomePoint > TAX_RULES_2026.selfEmployedSurchargeThreshold) {
          marginalUsc += TAX_RULES_2026.selfEmployedSurchargeRate;
        }

        const marginalPrsi =
          incomePoint >=
          (isSelfEmployed
            ? TAX_RULES_2026.selfEmployedPrsiExemption
            : TAX_RULES_2026.prsiThreshold)
            ? isSelfEmployed
              ? TAX_RULES_2026.prsiSelfRate
              : TAX_RULES_2026.prsiRate
            : 0;

        return { it: marginalIncomeTax, usc: marginalUsc, prsi: marginalPrsi };
      }

      const marginals = getMarginalValues(income);

      if (viewType === "effective") {
        return {
          income,
          it: effIT.toFixed(2),
          usc: effUSC.toFixed(2),
          prsi: effPRSI.toFixed(2),
          total: effTotal.toFixed(2),
          totalEuro: formatCurrency(totalTaxAmount),
        };
      }

      return {
        income,
        it: (marginals.it * 100).toFixed(2),
        usc: (marginals.usc * 100).toFixed(2),
        prsi: (marginals.prsi * 100).toFixed(2),
        total: ((marginals.it + marginals.usc + marginals.prsi) * 100).toFixed(2),
        totalEuro: formatCurrency(totalTaxAmount),
      };
    },
    [isSelfEmployed, pensionContrib, viewType],
  );

  const chartData = useMemo(() => {
    const rows: TaxBreakdownRow[] = [];
    for (let income = 0; income <= 150_000; income += 1_000) {
      rows.push(calculateTaxAtIncome(income));
    }
    return rows;
  }, [calculateTaxAtIncome]);

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
          Irish Income Tax • 2026 Assumptions
        </p>
        <h1 className="max-w-5xl text-5xl font-black uppercase leading-[0.9] tracking-tight text-stone-900 sm:text-7xl">
          Irish Tax Breakdown 2026
        </h1>
        <p className="max-w-3xl text-lg leading-relaxed text-stone-600 sm:text-xl">
          Explore effective and marginal tax rates across income levels, including
          the USC threshold behavior around €13,000.
        </p>
      </header>

      <section className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        <aside className="space-y-5 lg:col-span-1">
          <article className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-[0_10px_40px_-25px_rgba(0,0,0,0.4)]">
            <h2 className="mb-4 flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
              <Briefcase className="h-4 w-4" />
              Employment
            </h2>
            <div className="flex rounded-full border border-stone-200 bg-stone-100 p-1">
              <button
                type="button"
                onClick={() => setIsSelfEmployed(false)}
                className={`flex-1 rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] transition ${
                  !isSelfEmployed
                    ? "bg-white text-stone-900 shadow-sm"
                    : "text-stone-500 hover:text-stone-700"
                }`}
              >
                Employee
              </button>
              <button
                type="button"
                onClick={() => setIsSelfEmployed(true)}
                className={`flex-1 rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] transition ${
                  isSelfEmployed
                    ? "bg-white text-stone-900 shadow-sm"
                    : "text-stone-500 hover:text-stone-700"
                }`}
              >
                Self-Employed
              </button>
            </div>
          </article>

          <article className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-[0_10px_40px_-25px_rgba(0,0,0,0.4)]">
            <h2 className="mb-3 flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
              <PiggyBank className="h-4 w-4" />
              Pension Contribution
            </h2>
            <input
              type="range"
              min={0}
              max={40}
              step={1}
              value={pensionContrib}
              onChange={(event) => setPensionContrib(Number(event.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-stone-200 accent-blue-600"
            />
            <div className="mt-2 text-right text-lg font-black tracking-tight text-stone-900">
              {pensionContrib}%
            </div>
            <p className="mt-2 text-xs leading-relaxed text-stone-500">
              Pension relief reduces income-taxable pay in this model, but USC and PRSI
              stay linked to gross income.
            </p>
          </article>

          <article className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
            <p className="flex items-start gap-3 text-sm leading-relaxed text-blue-900">
              <Info className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                <strong>USC cliff:</strong> under this model, crossing from €13,000 to
                €13,001 can trigger an immediate USC jump.
              </span>
            </p>
          </article>
        </aside>

        <article className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-[0_10px_40px_-25px_rgba(0,0,0,0.4)] sm:p-8 lg:col-span-3">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-black tracking-tight text-stone-900 sm:text-3xl">
              Rate Profile by Gross Income
            </h2>
            <div className="flex rounded-full border border-stone-200 bg-stone-100 p-1">
              <button
                type="button"
                onClick={() => setViewType("effective")}
                className={`pill-control rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-[0.12em] transition ${
                  viewType === "effective"
                    ? "bg-stone-900 text-white"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                <span className="pill-label">Effective Rate</span>
              </button>
              <button
                type="button"
                onClick={() => setViewType("marginal")}
                className={`pill-control rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-[0.12em] transition ${
                  viewType === "marginal"
                    ? "bg-stone-900 text-white"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                <span className="pill-label">Marginal Rate</span>
              </button>
            </div>
          </div>

          <div className="h-[30rem] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 16, right: 24, left: 0, bottom: 6 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e7e5e4" />
                <XAxis
                  dataKey="income"
                  stroke="#78716c"
                  fontSize={11}
                  interval={9}
                  tickFormatter={(value) => `€${value / 1_000}k`}
                />
                <YAxis unit="%" domain={[0, 60]} stroke="#78716c" fontSize={11} />
                <Tooltip
                  labelFormatter={(label) => `Gross income: €${Number(label).toLocaleString("en-IE")}`}
                  formatter={(value, name, props) => {
                    const seriesName = String(name).toUpperCase();

                    if (name === "Total Rate") {
                      return [`${value}% (${props.payload.totalEuro})`, seriesName];
                    }
                    return [`${value}%`, seriesName];
                  }}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #e7e5e4",
                    boxShadow: "0 14px 28px -18px rgba(0,0,0,0.45)",
                  }}
                />
                <Legend verticalAlign="top" height={42} />

                <ReferenceLine
                  x={13_000}
                  stroke="#a8a29e"
                  strokeDasharray="3 3"
                  label={{ position: "top", value: "USC Cliff", fontSize: 10 }}
                />
                <ReferenceLine
                  x={20_000}
                  stroke="#60a5fa"
                  strokeDasharray="2 2"
                  label={{ position: "top", value: "IT Starts", fontSize: 10 }}
                />
                <ReferenceLine
                  x={44_000}
                  stroke="#78716c"
                  label={{ position: "top", value: "40% Band", fontSize: 10, fontWeight: "bold" }}
                />

                <Line type="monotone" dataKey="it" stroke="#3b82f6" strokeWidth={2} dot={false} name="Income Tax" />
                <Line type="monotone" dataKey="usc" stroke="#f59e0b" strokeWidth={2} dot={false} name="USC" />
                <Line type="monotone" dataKey="prsi" stroke="#10b981" strokeWidth={2} dot={false} name="PRSI" />
                <Line type="monotone" dataKey="total" stroke="#0f172a" strokeWidth={3.5} dot={false} name="Total Rate" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <p className="mt-5 rounded-xl border border-stone-200 bg-stone-50 p-3 text-sm leading-relaxed text-stone-600">
            This lab is an illustrative model based on embedded 2026 assumptions
            (bands, rates, and credits) and is not financial or tax advice.
          </p>
        </article>
      </section>

      <section className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <article className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-[0_10px_40px_-25px_rgba(0,0,0,0.4)] sm:p-8 lg:col-span-2">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.3em] text-stone-500">
            Reading The Chart
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-stone-900 sm:text-4xl">
            Marginal pain, average calm
          </h2>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-stone-600">
            The main illusion in the Irish tax system is the gap between marginal
            and effective rates. The average rate stays relatively low for a long
            time, but a raise, bonus, or extra contract can hit the high marginal
            bands immediately.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
            {TAX_INSIGHTS.map((insight) => (
              <div
                key={insight.title}
                className="rounded-2xl border border-stone-200 bg-stone-50 p-5"
              >
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-stone-500">
                  {insight.label}
                </p>
                <h3 className="mt-2 text-lg font-black tracking-tight text-stone-900">
                  {insight.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-stone-600">
                  {insight.description}
                </p>
              </div>
            ))}
          </div>
        </article>

        <aside className="space-y-6">
          <article className="rounded-[2rem] border border-stone-200 bg-stone-900 p-6 text-white shadow-[0_10px_40px_-25px_rgba(0,0,0,0.4)] sm:p-8">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.3em] text-stone-400">
              The Salient Number
            </p>
            <p className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">€1.85</p>
            <p className="mt-3 text-sm leading-relaxed text-stone-300">
              For a high earner around €150k+, the economy can spend about €1.85
              in total labour cost to leave €1.00 of spending power. The remaining
              €0.85 is the combined drag from employee tax and employer PRSI.
            </p>
          </article>

          <article className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-[0_10px_40px_-25px_rgba(0,0,0,0.4)]">
            <h2 className="text-xl font-black tracking-tight text-stone-900">
              Income Landscape
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-stone-600">
              CSO data puts median annual full-time earnings at roughly €44,816
              in 2024. The distribution is skewed: the top 10% earn above about
              €77,500 and pay around 61% of personal income tax, while the top 1%
              earn over €200,000 and pay roughly 19-20%.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-stone-600">
              At the other end, the bottom 40% pay less than 5% of income tax
              collected, which makes the system highly progressive but also
              dependent on a narrow high-earner base.
            </p>
          </article>
        </aside>
      </section>

      <section className="mt-8 rounded-[2rem] border border-stone-200 bg-white p-6 shadow-[0_10px_40px_-25px_rgba(0,0,0,0.4)] sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.3em] text-stone-500">
              Total Labour Cost
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-stone-900 sm:text-4xl">
              What it costs to deliver take-home pay
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-relaxed text-stone-600">
            These rounded examples add employer PRSI to salary cost, then compare
            the full economic cost with approximate net pay.
          </p>
        </div>

        <div className="mt-8 overflow-hidden rounded-2xl border border-stone-200">
          <div className="grid grid-cols-5 bg-stone-100 px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-stone-500">
            <span>Gross</span>
            <span>Employer PRSI</span>
            <span>Net Pay</span>
            <span>Total Cost</span>
            <span>Tax Per €1 Net</span>
          </div>
          {LABOUR_COST_ROWS.map((row) => (
            <div
              key={row.grossSalary}
              className="grid grid-cols-1 gap-2 border-t border-stone-200 px-4 py-4 text-sm text-stone-700 sm:grid-cols-5 sm:gap-0"
            >
              <span className="font-bold text-stone-900">{row.grossSalary}</span>
              <span>{row.employerPrsi}</span>
              <span>{row.netPay}</span>
              <span>{row.totalCost}</span>
              <span className="font-bold text-stone-900">{row.taxPaidPerNetEuro}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
