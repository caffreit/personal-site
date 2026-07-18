"use client";

import Link from "next/link";
import { ArrowLeft, Info, RotateCcw } from "lucide-react";
import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type MetricId =
  | "marginalRate"
  | "averageRate"
  | "netIncome"
  | "taxMinutes"
  | "totalMinutes";
type TaxRules = {
  srcop: number;
  personalCredit: number;
  payeCredit: number;
  uscExemptionLimit: number;
  uscBands: [number, number, number];
  uscRates: [number, number, number, number];
  prsiRate: number;
  prsiThreshold: number;
};

type TaxOutcome = {
  tax: number;
  marginalRate: number;
};

type ScheduleConfig = {
  id: ScheduleId;
  label: string;
  shortLabel: string;
  color: string;
  description: string;
};

type ChartRow = {
  income: number;
} & Record<string, number | null>;

type ScheduleId =
  | "noTax"
  | "currentIrish"
  | "equalAbsolute"
  | "flatPercentage"
  | "protectedMinimum"
  | "negativeIncomeTax"
  | "equalPurchaseTime"
  | "incomeCompression";

const TAX_RULES_2026: TaxRules = {
  srcop: 44_000,
  personalCredit: 2_000,
  payeCredit: 2_000,
  uscExemptionLimit: 13_000,
  uscBands: [12_012, 28_700, 70_044],
  uscRates: [0.005, 0.02, 0.03, 0.08],
  prsiRate: 0.0435,
  prsiThreshold: 18_304,
};

const BENCHMARK_INCOME = 60_000;
const PROTECTED_MINIMUM = 20_000;
const NEGATIVE_INCOME_GUARANTEE = 10_000;
const INCOME_COMPRESSION_ALPHA = 0.8;
const ANNUAL_WORK_HOURS = 37.5 * 52;
const SPENDING_AMOUNT = 100;
const MIN_SALARY = 10_000;
const MAX_SALARY = 500_000;

const BENCHMARK_TAX = calculateIrishTax(BENCHMARK_INCOME).tax;
const BENCHMARK_NET = BENCHMARK_INCOME - BENCHMARK_TAX;
const BENCHMARK_AVERAGE_RATE = BENCHMARK_TAX / BENCHMARK_INCOME;
const DEFAULT_PURCHASE_TIME_K =
  (BENCHMARK_INCOME * (1 - BENCHMARK_AVERAGE_RATE)) / BENCHMARK_AVERAGE_RATE;

const SCHEDULES: ScheduleConfig[] = [
  {
    id: "currentIrish",
    label: "Current Irish rates",
    shortLabel: "Irish rates",
    color: "#0f172a",
    description: "PAYE income tax, USC, and employee PRSI using the site's 2026 assumptions.",
  },
  {
    id: "noTax",
    label: "No tax",
    shortLabel: "No tax",
    color: "#94a3b8",
    description: "A baseline where gross salary and net income are the same.",
  },
  {
    id: "equalAbsolute",
    label: "Equal absolute contribution",
    shortLabel: "Equal euro",
    color: "#dc2626",
    description: "Everyone pays the same euro amount as the benchmark taxpayer.",
  },
  {
    id: "flatPercentage",
    label: "Flat percentage",
    shortLabel: "Flat rate",
    color: "#2563eb",
    description: "Everyone pays the same average and marginal percentage.",
  },
  {
    id: "protectedMinimum",
    label: "Protected minimum",
    shortLabel: "Protected min",
    color: "#16a34a",
    description: "The first EUR20,000 is untaxed; income above that faces a flat rate.",
  },
  {
    id: "negativeIncomeTax",
    label: "Negative income tax",
    shortLabel: "NIT",
    color: "#9333ea",
    description:
      "Everyone is guaranteed a minimum income. If earnings are too low, the tax number turns negative and tops them up.",
  },
  {
    id: "equalPurchaseTime",
    label: "Equal purchase time",
    shortLabel: "Equal time",
    color: "#ea580c",
    description:
      "For a given purchase, everyone contributes the same amount of working time to the state.",
  },
  {
    id: "incomeCompression",
    label: "Income compression",
    shortLabel: "Compression",
    color: "#0891b2",
    description: "Net income grows with gross income, but only with elasticity alpha = 0.8.",
  },
];

const METRICS: { id: MetricId; label: string; description: string }[] = [
  {
    id: "marginalRate",
    label: "Marginal tax rate",
    description: "The share of the next euro of gross income paid in tax.",
  },
  {
    id: "averageRate",
    label: "Average tax rate",
    description: "Total tax divided by gross salary.",
  },
  {
    id: "netIncome",
    label: "Net income",
    description: "Annual gross salary after tax or transfer.",
  },
  {
    id: "taxMinutes",
    label: "Minutes worked for tax",
    description: "For a €100 purchase, work minutes used to earn its tax component.",
  },
  {
    id: "totalMinutes",
    label: "Total minutes worked",
    description: "For a €100 purchase, total work minutes needed to keep it after tax.",
  },
];

const SALARY_TICKS = [10_000, 20_000, 40_000, 60_000, 100_000, 200_000, 500_000];
const AXIS_TICK_FONT_SIZE = 14;
const AXIS_LABEL_FONT_SIZE = 16;

function formatCurrency(value: number, maximumFractionDigits = 0) {
  return value.toLocaleString("en-IE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits,
  });
}

function formatNumber(value: number, maximumFractionDigits = 0) {
  return value.toLocaleString("en-IE", { maximumFractionDigits });
}

function formatPercent(value: number, maximumFractionDigits = 1) {
  return `${value.toLocaleString("en-IE", { maximumFractionDigits })}%`;
}

function formatSalaryTick(value: number) {
  if (value >= 1_000_000) {
    return "EUR1m";
  }

  return `EUR${value / 1_000}k`;
}

function formatMetricValue(value: number, metric: MetricId) {
  if (metric === "marginalRate" || metric === "averageRate") {
    return formatPercent(value, Math.abs(value) < 10 ? 1 : 0);
  }

  if (metric === "netIncome") {
    return formatCurrency(value);
  }

  return `${formatNumber(value, Math.abs(value) < 10 ? 1 : 0)} min`;
}

function calculateIrishTax(income: number): TaxOutcome {
  if (income <= 0) {
    return { tax: 0, marginalRate: 0 };
  }

  const grossPaye =
    income <= TAX_RULES_2026.srcop
      ? income * 0.2
      : TAX_RULES_2026.srcop * 0.2 + (income - TAX_RULES_2026.srcop) * 0.4;
  const payeCredits = TAX_RULES_2026.personalCredit + TAX_RULES_2026.payeCredit;
  const paye = Math.max(0, grossPaye - payeCredits);

  const [band1, band2, band3] = TAX_RULES_2026.uscBands;
  const [rate1, rate2, rate3, rate4] = TAX_RULES_2026.uscRates;

  let usc = 0;
  if (income > TAX_RULES_2026.uscExemptionLimit) {
    usc += Math.min(income, band1) * rate1;
    usc += Math.max(0, Math.min(income, band2) - band1) * rate2;
    usc += Math.max(0, Math.min(income, band3) - band2) * rate3;
    usc += Math.max(0, income - band3) * rate4;
  }

  const prsi = income > TAX_RULES_2026.prsiThreshold ? income * TAX_RULES_2026.prsiRate : 0;
  const marginalPaye = income > TAX_RULES_2026.srcop ? 0.4 : income > 20_000 ? 0.2 : 0;
  const marginalUsc =
    income <= TAX_RULES_2026.uscExemptionLimit
      ? 0
      : income > band3
        ? rate4
        : income > band2
          ? rate3
          : income > band1
            ? rate2
            : rate1;
  const marginalPrsi = income > TAX_RULES_2026.prsiThreshold ? TAX_RULES_2026.prsiRate : 0;

  return {
    tax: paye + usc + prsi,
    marginalRate: marginalPaye + marginalUsc + marginalPrsi,
  };
}

function getScheduleOutcome(id: ScheduleId, income: number, purchaseTimeK: number): TaxOutcome {
  if (income <= 0) {
    return { tax: 0, marginalRate: 0 };
  }

  if (id === "currentIrish") {
    return calculateIrishTax(income);
  }

  if (id === "noTax") {
    return { tax: 0, marginalRate: 0 };
  }

  if (id === "equalAbsolute") {
    return { tax: BENCHMARK_TAX, marginalRate: 0 };
  }

  if (id === "flatPercentage") {
    return {
      tax: BENCHMARK_AVERAGE_RATE * income,
      marginalRate: BENCHMARK_AVERAGE_RATE,
    };
  }

  if (id === "protectedMinimum") {
    const rate = BENCHMARK_TAX / (BENCHMARK_INCOME - PROTECTED_MINIMUM);
    return {
      tax: income <= PROTECTED_MINIMUM ? 0 : (income - PROTECTED_MINIMUM) * rate,
      marginalRate: income <= PROTECTED_MINIMUM ? 0 : rate,
    };
  }

  if (id === "negativeIncomeTax") {
    const withdrawalRate = (BENCHMARK_TAX + NEGATIVE_INCOME_GUARANTEE) / BENCHMARK_INCOME;
    return {
      tax: income * withdrawalRate - NEGATIVE_INCOME_GUARANTEE,
      marginalRate: withdrawalRate,
    };
  }

  if (id === "equalPurchaseTime") {
    const tax = (income * income) / (income + purchaseTimeK);
    const marginalRate = (income * (income + 2 * purchaseTimeK)) / (income + purchaseTimeK) ** 2;
    return { tax, marginalRate };
  }

  const netIncome = BENCHMARK_NET * (income / BENCHMARK_INCOME) ** INCOME_COMPRESSION_ALPHA;
  return {
    tax: income - netIncome,
    marginalRate: 1 - (INCOME_COMPRESSION_ALPHA * netIncome) / income,
  };
}

function getSalarySamples() {
  const values = new Set<number>([BENCHMARK_INCOME]);

  for (let income = MIN_SALARY; income <= 100_000; income += 2_500) {
    values.add(income);
  }

  for (let income = 110_000; income <= 300_000; income += 10_000) {
    values.add(income);
  }

  for (let income = 325_000; income <= MAX_SALARY; income += 25_000) {
    values.add(income);
  }

  values.add(MAX_SALARY);
  return Array.from(values).sort((a, b) => a - b);
}

function getMetricValue(
  metric: MetricId,
  income: number,
  outcome: TaxOutcome,
  spendingAmount: number,
) {
  if (metric === "marginalRate") {
    return outcome.marginalRate * 100;
  }

  if (metric === "averageRate") {
    return (outcome.tax / income) * 100;
  }

  if (metric === "netIncome") {
    return income - outcome.tax;
  }

  const takeHomeRatio = (income - outcome.tax) / income;
  if (takeHomeRatio <= 0.001) {
    return null;
  }

  const grossRequired = spendingAmount / takeHomeRatio;
  const grossHourly = income / ANNUAL_WORK_HOURS;

  if (metric === "totalMinutes") {
    return (grossRequired / grossHourly) * 60;
  }

  return ((grossRequired - spendingAmount) / grossHourly) * 60;
}

function getChartData(metric: MetricId, spendingAmount: number, purchaseTimeK: number) {
  return getSalarySamples().map((income) => {
    const row: ChartRow = { income };

    for (const schedule of SCHEDULES) {
      const outcome = getScheduleOutcome(schedule.id, income, purchaseTimeK);
      row[schedule.id] = getMetricValue(metric, income, outcome, spendingAmount);
    }

    return row;
  });
}

function getMetricDescription(metric: MetricId) {
  return METRICS.find((candidate) => candidate.id === metric)?.description ?? "";
}

function getMetricLabel(metric: MetricId) {
  return METRICS.find((candidate) => candidate.id === metric)?.label ?? "";
}

function getYAxisLabel(metric: MetricId) {
  if (metric === "marginalRate" || metric === "averageRate") return "Rate";
  if (metric === "netIncome") return "Net income";
  return "Minutes";
}

export default function TaxScheduleComparisonLab() {
  const [selectedMetric, setSelectedMetric] = useState<MetricId>("averageRate");
  const [purchaseTimeK, setPurchaseTimeK] = useState(Math.round(DEFAULT_PURCHASE_TIME_K / 1_000) * 1_000);
  const [visibleIds, setVisibleIds] = useState<ScheduleId[]>(SCHEDULES.map((schedule) => schedule.id));

  const visibleSet = useMemo(() => new Set(visibleIds), [visibleIds]);
  const chartData = useMemo(
    () => getChartData(selectedMetric, SPENDING_AMOUNT, purchaseTimeK),
    [selectedMetric, purchaseTimeK],
  );

  function toggleSchedule(id: ScheduleId) {
    setVisibleIds((current) =>
      current.includes(id)
        ? current.filter((candidate) => candidate !== id)
        : [...current, id],
    );
  }

  function resetControls() {
    setSelectedMetric("averageRate");
    setPurchaseTimeK(Math.round(DEFAULT_PURCHASE_TIME_K / 1_000) * 1_000);
    setVisibleIds(SCHEDULES.map((schedule) => schedule.id));
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
          Tax Philosophy - Interactive Comparison
        </p>
        <h1 className="max-w-5xl text-5xl font-black uppercase leading-[0.9] tracking-tight text-stone-900 sm:text-7xl">
          Tax Schedule Comparison
        </h1>
        <p className="max-w-4xl text-lg leading-relaxed text-stone-600 sm:text-xl">
          Compare eight ways of turning gross salary into tax, take-home pay, and
          working time. The stylised schedules start calibrated to the current
          Irish model at a EUR60,000 salary.
        </p>
      </header>

      <section className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        <aside className="space-y-5 lg:col-span-1">
          <article className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-[0_10px_40px_-25px_rgba(0,0,0,0.4)]">
            <div className="space-y-2">
              {METRICS.map((metric) => (
                <button
                  key={metric.id}
                  type="button"
                  onClick={() => setSelectedMetric(metric.id)}
                  className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                    selectedMetric === metric.id
                      ? "border-stone-900 bg-stone-900 text-white"
                      : "border-stone-200 bg-stone-50 text-stone-700 hover:border-stone-400"
                  }`}
                >
                  <span className="block text-sm font-black tracking-tight">{metric.label}</span>
                  <span
                    className={`mt-1 block text-xs leading-relaxed ${
                      selectedMetric === metric.id ? "text-stone-300" : "text-stone-500"
                    }`}
                  >
                    {metric.description}
                  </span>
                </button>
              ))}
            </div>
          </article>

          <article className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-[0_10px_40px_-25px_rgba(0,0,0,0.4)]">
            <h2 className="mb-3 font-mono text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
              Equal-time K
            </h2>
            <input
              type="range"
              min={20_000}
              max={500_000}
              step={5_000}
              value={purchaseTimeK}
              onChange={(event) => setPurchaseTimeK(Number(event.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-stone-200 accent-orange-600"
            />
            <div className="mt-2 flex items-baseline justify-between gap-3">
              <p className="text-2xl font-black tracking-tight text-stone-900">
                {formatCurrency(purchaseTimeK)}
              </p>
              <p className="max-w-[9rem] text-right text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
                50% average tax salary
              </p>
            </div>
          </article>

          <button
            type="button"
            onClick={resetControls}
            className="pill-control inline-flex w-full items-center justify-center gap-2 rounded-full border border-stone-300 px-5 py-3 font-mono text-xs font-bold uppercase tracking-[0.2em] text-stone-700 transition hover:border-stone-900 hover:text-stone-900"
          >
            <RotateCcw className="h-4 w-4" />
            <span className="pill-label">Reset</span>
          </button>
        </aside>

        <article className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-[0_10px_40px_-25px_rgba(0,0,0,0.4)] sm:p-8 lg:col-span-3">
          <div className="mb-6">
            <h2 className="text-3xl font-black tracking-tight text-stone-900 sm:text-4xl">
              {getMetricLabel(selectedMetric)}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-stone-600">
              {getMetricDescription(selectedMetric)}
            </p>
          </div>

          <div className="mb-5 flex flex-wrap gap-2">
            {SCHEDULES.map((schedule) => {
              const isVisible = visibleSet.has(schedule.id);
              return (
                <button
                  key={schedule.id}
                  type="button"
                  onClick={() => toggleSchedule(schedule.id)}
                  aria-pressed={isVisible}
                  title={`${isVisible ? "Hide" : "Show"} ${schedule.label}`}
                  style={{ borderColor: schedule.color }}
                  className={`pill-control relative overflow-hidden rounded-full border-2 bg-white py-2 pr-3 pl-10 text-[10px] font-black uppercase tracking-[0.14em] transition ${
                    isVisible
                      ? "text-stone-900"
                      : "opacity-45 hover:opacity-100"
                  }`}
                >
                  <span
                    className="absolute inset-y-1 left-1 aspect-square rounded-full"
                    style={{ backgroundColor: schedule.color }}
                  />
                  <span className="pill-label relative">{schedule.label}</span>
                </button>
              );
            })}
          </div>

          <div className="h-[34rem] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 18, right: 28, left: 8, bottom: 32 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e7e5e4" />
                <XAxis
                  dataKey="income"
                  type="number"
                  scale="log"
                  domain={[MIN_SALARY, MAX_SALARY]}
                  ticks={SALARY_TICKS}
                  allowDataOverflow
                  stroke="#78716c"
                  fontSize={AXIS_TICK_FONT_SIZE}
                  tickFormatter={formatSalaryTick}
                  label={{
                    value: "Gross Salary",
                    position: "insideBottom",
                    offset: -8,
                    fontSize: AXIS_LABEL_FONT_SIZE,
                    fill: "#78716c",
                  }}
                />
                <YAxis
                  stroke="#78716c"
                  fontSize={AXIS_TICK_FONT_SIZE}
                  width={80}
                  label={{
                    value: getYAxisLabel(selectedMetric),
                    angle: -90,
                    position: "insideLeft",
                    fontSize: AXIS_LABEL_FONT_SIZE,
                    fill: "#78716c",
                  }}
                  tickFormatter={(value) => formatMetricValue(Number(value), selectedMetric)}
                />
                <Tooltip
                  labelFormatter={(label) =>
                    `Gross salary: ${formatCurrency(Number(label))}`
                  }
                  formatter={(value, name) => [
                    formatMetricValue(Number(value), selectedMetric),
                    String(name),
                  ]}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #e7e5e4",
                    boxShadow: "0 14px 28px -18px rgba(0,0,0,0.45)",
                  }}
                />
                <ReferenceLine
                  x={BENCHMARK_INCOME}
                  stroke="#a8a29e"
                  strokeDasharray="4 4"
                  label={{
                    position: "top",
                    value: "EUR60k concordance",
                    fontSize: 10,
                    fill: "#78716c",
                  }}
                />
                {selectedMetric === "averageRate" && (
                  <ReferenceLine
                    y={BENCHMARK_AVERAGE_RATE * 100}
                    stroke="#d6d3d1"
                    strokeDasharray="3 3"
                    label={{
                      position: "insideTopRight",
                      value: "benchmark rate",
                      fontSize: 10,
                      fill: "#78716c",
                    }}
                  />
                )}

                {SCHEDULES.filter((schedule) => visibleSet.has(schedule.id)).map((schedule) => (
                  <Line
                    key={schedule.id}
                    type="monotone"
                    dataKey={schedule.id}
                    name={schedule.label}
                    stroke={schedule.color}
                    strokeWidth={schedule.id === "currentIrish" ? 3.5 : 2.3}
                    dot={false}
                    connectNulls
                    isAnimationActive={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

          <p className="mt-5 rounded-xl border border-stone-200 bg-stone-50 p-3 text-sm leading-relaxed text-stone-600">
            All stylised schedules except no-tax start calibrated to the current
            Irish model at EUR60,000. Moving K intentionally changes the
            equal-purchase-time line so you can see how that assumption reshapes the curve.
          </p>
        </article>
      </section>

      <section className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <article className="rounded-[2rem] border border-stone-200 bg-stone-900 p-6 text-white shadow-[0_10px_40px_-25px_rgba(0,0,0,0.4)] sm:p-8">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.3em] text-stone-400">
            Concordance point
          </p>
          <p className="mt-4 text-4xl font-black tracking-tight">
            {formatPercent(BENCHMARK_AVERAGE_RATE * 100)}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-stone-300">
            A single PAYE employee on {formatCurrency(BENCHMARK_INCOME)} pays about{" "}
            {formatCurrency(BENCHMARK_TAX)} in PAYE, USC, and PRSI in this model.
          </p>
        </article>

        <article className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-[0_10px_40px_-25px_rgba(0,0,0,0.4)] sm:p-8 lg:col-span-2">
          <p className="flex items-start gap-3 text-sm leading-relaxed text-stone-600">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-stone-500" />
            <span>
              The chart is a shape explorer, not a revenue model. It compares how
              different fairness rules distribute the burden across salaries after
              they are anchored to the same benchmark taxpayer.
            </span>
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {SCHEDULES.map((schedule) => (
              <div key={schedule.id} className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                <div className="flex items-center gap-2">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: schedule.color }}
                  />
                  <h3 className="text-sm font-black tracking-tight text-stone-900">
                    {schedule.label}
                  </h3>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-stone-600">
                  {schedule.description}
                </p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
