"use client";

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

import {
  LabHeader,
  LabNote,
  LabRail,
  LabSection,
  LabShell,
} from "@/components/labs/LabChrome";
import {
  LabTooltip,
  labAxisProps,
  labGridProps,
  useLabChartTheme,
} from "@/components/labs/labChartTheme";
import { labFootnote, labMicroLabel } from "@/components/labs/labTokens";

type MetricId =
  | "marginalRate"
  | "averageRate"
  | "netIncome"
  | "taxMinutes"
  | "totalMinutes";
type CalibrationMode = "statusQuo" | "revenueNeutral";
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

type ScheduleCalibration = {
  equalAbsoluteTax: number;
  flatRate: number;
  protectedMinimumRate: number;
  negativeIncomeTaxRate: number;
  purchaseTimeK: number;
  incomeCompressionScale: number;
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
const NATIONAL_INCOME_TAX_RECEIPTS_2024 = 35_071_000_000;
const WAGE_SAMPLE_2024 = [13_500, 20_700, 27_400, 32_400, 38_000, 44_900, 53_700, 67_200, 90_500];

const BENCHMARK_TAX = calculateIrishTax(BENCHMARK_INCOME).tax;
const BENCHMARK_NET = BENCHMARK_INCOME - BENCHMARK_TAX;
const BENCHMARK_AVERAGE_RATE = BENCHMARK_TAX / BENCHMARK_INCOME;
const DEFAULT_PURCHASE_TIME_K =
  (BENCHMARK_INCOME * (1 - BENCHMARK_AVERAGE_RATE)) / BENCHMARK_AVERAGE_RATE;
const PURCHASE_TIME_K = Math.round(DEFAULT_PURCHASE_TIME_K / 1_000) * 1_000;
const WORKING_MINUTES_PER_YEAR = ANNUAL_WORK_HOURS * 60;

const SCHEDULES: ScheduleConfig[] = [
  {
    id: "currentIrish",
    label: "Current Irish rates",
    shortLabel: "Irish rates",
    color: "#0f172a",
    description: "PAYE income tax, USC, and employee PRSI using the site's 2026 assumptions.",
  },
  {
    id: "equalAbsolute",
    label: "Equal absolute contribution",
    shortLabel: "Equal euro",
    color: "#dc2626",
    description: "Everyone pays the same euro amount under the selected calibration.",
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
const AXIS_LABEL_FONT_SIZE = 11;
const DEFAULT_VISIBLE_SCHEDULE_IDS: ScheduleId[] = [
  "currentIrish",
  "equalAbsolute",
  "flatPercentage",
];

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

function formatBillions(value: number) {
  return `€${(value / 1_000_000_000).toLocaleString("en-IE", {
    maximumFractionDigits: 1,
  })}bn`;
}

function formatSalaryTick(value: number) {
  if (value >= 1_000_000) {
    return "€1m";
  }

  return `€${value / 1_000}k`;
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

function solvePurchaseTimeK(targetTax: number) {
  const aggregateTax = (purchaseTimeK: number) =>
    WAGE_SAMPLE_2024.reduce(
      (total, income) => total + (income * income) / (income + purchaseTimeK),
      0,
    );

  let lowerBound = 0;
  let upperBound = 1_000_000;

  while (aggregateTax(upperBound) > targetTax) {
    upperBound *= 2;
  }

  for (let iteration = 0; iteration < 100; iteration += 1) {
    const midpoint = (lowerBound + upperBound) / 2;
    if (aggregateTax(midpoint) > targetTax) {
      lowerBound = midpoint;
    } else {
      upperBound = midpoint;
    }
  }

  return (lowerBound + upperBound) / 2;
}

const STATUS_QUO_CALIBRATION: ScheduleCalibration = {
  equalAbsoluteTax: BENCHMARK_TAX,
  flatRate: BENCHMARK_AVERAGE_RATE,
  protectedMinimumRate: BENCHMARK_TAX / (BENCHMARK_INCOME - PROTECTED_MINIMUM),
  negativeIncomeTaxRate:
    (BENCHMARK_TAX + NEGATIVE_INCOME_GUARANTEE) / BENCHMARK_INCOME,
  purchaseTimeK: PURCHASE_TIME_K,
  incomeCompressionScale: BENCHMARK_NET / BENCHMARK_INCOME ** INCOME_COMPRESSION_ALPHA,
};

const SAMPLE_TOTAL_INCOME = WAGE_SAMPLE_2024.reduce((total, income) => total + income, 0);
const SAMPLE_IRISH_TAX = WAGE_SAMPLE_2024.reduce(
  (total, income) => total + calculateIrishTax(income).tax,
  0,
);
const SAMPLE_TAXABLE_ABOVE_MINIMUM = WAGE_SAMPLE_2024.reduce(
  (total, income) => total + Math.max(0, income - PROTECTED_MINIMUM),
  0,
);
const SAMPLE_COMPRESSED_INCOME = WAGE_SAMPLE_2024.reduce(
  (total, income) => total + income ** INCOME_COMPRESSION_ALPHA,
  0,
);

const REVENUE_NEUTRAL_CALIBRATION: ScheduleCalibration = {
  equalAbsoluteTax: SAMPLE_IRISH_TAX / WAGE_SAMPLE_2024.length,
  flatRate: SAMPLE_IRISH_TAX / SAMPLE_TOTAL_INCOME,
  protectedMinimumRate: SAMPLE_IRISH_TAX / SAMPLE_TAXABLE_ABOVE_MINIMUM,
  negativeIncomeTaxRate:
    (SAMPLE_IRISH_TAX + NEGATIVE_INCOME_GUARANTEE * WAGE_SAMPLE_2024.length) /
    SAMPLE_TOTAL_INCOME,
  purchaseTimeK: solvePurchaseTimeK(SAMPLE_IRISH_TAX),
  incomeCompressionScale:
    (SAMPLE_TOTAL_INCOME - SAMPLE_IRISH_TAX) / SAMPLE_COMPRESSED_INCOME,
};

function getScheduleOutcome(
  id: ScheduleId,
  income: number,
  calibration: ScheduleCalibration,
): TaxOutcome {
  if (income <= 0) {
    return { tax: 0, marginalRate: 0 };
  }

  if (id === "currentIrish") {
    return calculateIrishTax(income);
  }

  if (id === "equalAbsolute") {
    return { tax: calibration.equalAbsoluteTax, marginalRate: 0 };
  }

  if (id === "flatPercentage") {
    return {
      tax: calibration.flatRate * income,
      marginalRate: calibration.flatRate,
    };
  }

  if (id === "protectedMinimum") {
    return {
      tax:
        income <= PROTECTED_MINIMUM
          ? 0
          : (income - PROTECTED_MINIMUM) * calibration.protectedMinimumRate,
      marginalRate: income <= PROTECTED_MINIMUM ? 0 : calibration.protectedMinimumRate,
    };
  }

  if (id === "negativeIncomeTax") {
    return {
      tax: income * calibration.negativeIncomeTaxRate - NEGATIVE_INCOME_GUARANTEE,
      marginalRate: calibration.negativeIncomeTaxRate,
    };
  }

  if (id === "equalPurchaseTime") {
    const tax = (income * income) / (income + calibration.purchaseTimeK);
    const marginalRate =
      (income * (income + 2 * calibration.purchaseTimeK)) /
      (income + calibration.purchaseTimeK) ** 2;
    return { tax, marginalRate };
  }

  const netIncome = calibration.incomeCompressionScale * income ** INCOME_COMPRESSION_ALPHA;
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

function getChartData(
  metric: MetricId,
  spendingAmount: number,
  calibration: ScheduleCalibration,
) {
  return getSalarySamples().map((income) => {
    const row: ChartRow = { income };

    for (const schedule of SCHEDULES) {
      const outcome = getScheduleOutcome(schedule.id, income, calibration);
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

type ScheduleTooltipProps = {
  active?: boolean;
  label?: string | number;
  metric: MetricId;
  payload?: Array<{ name?: string | number; value?: string | number; color?: string }>;
};

function ScheduleTooltip({ active, label, metric, payload }: ScheduleTooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <LabTooltip
      label={`Gross salary: ${formatCurrency(Number(label))}`}
      rows={payload.map((entry) => ({
        key: String(entry.name),
        name: String(entry.name),
        value: formatMetricValue(Number(entry.value), metric),
        color: entry.color,
      }))}
    />
  );
}

export default function TaxScheduleComparisonLab() {
  const [selectedMetric, setSelectedMetric] = useState<MetricId>("averageRate");
  const [calibrationMode, setCalibrationMode] = useState<CalibrationMode>("statusQuo");
  const [visibleIds, setVisibleIds] = useState<ScheduleId[]>(DEFAULT_VISIBLE_SCHEDULE_IDS);
  const chartTheme = useLabChartTheme();

  const calibration =
    calibrationMode === "statusQuo"
      ? STATUS_QUO_CALIBRATION
      : REVENUE_NEUTRAL_CALIBRATION;
  const isStatusQuo = calibrationMode === "statusQuo";
  const visibleSet = useMemo(() => new Set(visibleIds), [visibleIds]);
  const chartData = useMemo(
    () => getChartData(selectedMetric, SPENDING_AMOUNT, calibration),
    [selectedMetric, calibration],
  );
  const oneMinutePurchasePrice =
    calibration.purchaseTimeK / WORKING_MINUTES_PER_YEAR;

  function toggleSchedule(id: ScheduleId) {
    setVisibleIds((current) =>
      current.includes(id)
        ? current.filter((candidate) => candidate !== id)
        : [...current, id],
    );
  }

  return (
    <LabShell>
      <LabHeader
        eyebrow="Tax Philosophy - Interactive Comparison"
        title="Tax Schedule Comparison"
        lede={
          <>
            Compare eight ways of turning gross salary into tax, take-home pay, and working
            time.{" "}
            {isStatusQuo
              ? "The stylised schedules are calibrated to the current Irish model at a €60,000 salary."
              : "The stylised schedules show the rates needed to keep Ireland’s total income-tax take unchanged."}
          </>
        }
      />

      <div className="grid gap-10 lg:grid-cols-[236px_minmax(0,1fr)] lg:gap-0">
        <LabRail label="Metric">
          <div className="border-t border-[color:var(--rule-color)]">
            {METRICS.map((metric) => {
              const isSelected = selectedMetric === metric.id;

              return (
                <button
                  key={metric.id}
                  type="button"
                  onClick={() => setSelectedMetric(metric.id)}
                  className={`block w-full border-b border-l-2 border-b-[color:var(--rule-color)] py-3.5 pl-3.5 text-left transition-colors ${
                    isSelected
                      ? "border-l-[#F4CA16]"
                      : "border-l-transparent hover:border-l-[color:var(--rule-color)]"
                  }`}
                >
                  <span
                    className={`block text-[0.98rem] ${
                      isSelected
                        ? "text-[color:var(--foreground)]"
                        : "text-[color:var(--text-muted)]"
                    }`}
                  >
                    {metric.label}
                  </span>
                  <span className={`mt-1 block ${labFootnote}`}>{metric.description}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-8">
            <p className={labMicroLabel}>Calibration</p>
            <div
              className="mt-3 border-t border-[color:var(--rule-color)]"
              role="radiogroup"
              aria-label="Tax schedule calibration"
            >
              {(
                [
                  {
                    id: "statusQuo",
                    label: "Status quo",
                    description: "25.2% at €60k",
                  },
                  {
                    id: "revenueNeutral",
                    label: "Same total revenue",
                    description: "Ireland’s 2024 tax take",
                  },
                ] as const
              ).map((option) => {
                const isSelected = calibrationMode === option.id;

                return (
                  <button
                    key={option.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => setCalibrationMode(option.id)}
                    className={`block w-full border-b border-l-2 border-b-[color:var(--rule-color)] py-3.5 pl-3.5 text-left transition-colors ${
                      isSelected
                        ? "border-l-[#F4CA16]"
                        : "border-l-transparent hover:border-l-[color:var(--rule-color)]"
                    }`}
                  >
                    <span
                      className={`block text-[0.98rem] ${
                        isSelected
                          ? "text-[color:var(--foreground)]"
                          : "text-[color:var(--text-muted)]"
                      }`}
                    >
                      {option.label}
                    </span>
                    <span className={`mt-1 block ${labFootnote}`}>{option.description}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </LabRail>

        <article className="min-w-0 lg:pl-12">
          <div className="mb-6">
            <h2 className="text-[clamp(1.9rem,3.2vw,2.6rem)] font-light leading-[1.1] tracking-[-0.02em] text-[color:var(--foreground)]">
              {getMetricLabel(selectedMetric)}
            </h2>
            <p className={`mt-3 max-w-[620px] ${labFootnote}`}>
              {getMetricDescription(selectedMetric)}
            </p>
          </div>

          <div className="mb-5 flex flex-wrap gap-x-6 gap-y-3 border-t border-[color:var(--rule-color)] pt-5">
            {SCHEDULES.map((schedule) => {
              const isVisible = visibleSet.has(schedule.id);

              return (
                <button
                  key={schedule.id}
                  type="button"
                  onClick={() => toggleSchedule(schedule.id)}
                  aria-pressed={isVisible}
                  title={`${isVisible ? "Hide" : "Show"} ${schedule.label}`}
                  className="flex items-center gap-2 border-b pb-1 transition-colors"
                  style={{ borderBottomColor: isVisible ? schedule.color : "transparent" }}
                >
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{
                      backgroundColor: schedule.color,
                      opacity: isVisible ? 1 : 0.35,
                    }}
                  />
                  <span
                    className={`font-mono text-[0.58rem] uppercase tracking-[0.14em] ${
                      isVisible
                        ? "text-[color:var(--foreground)]"
                        : "text-[color:var(--text-muted)]"
                    }`}
                  >
                    {schedule.label}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="h-[34rem] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 18, right: 28, left: 8, bottom: 32 }}>
                <CartesianGrid {...labGridProps(chartTheme)} />
                <XAxis
                  dataKey="income"
                  type="number"
                  scale="log"
                  domain={[MIN_SALARY, MAX_SALARY]}
                  ticks={SALARY_TICKS}
                  allowDataOverflow
                  tickFormatter={formatSalaryTick}
                  {...labAxisProps(chartTheme)}
                  label={{
                    value: "Gross Salary",
                    position: "insideBottom",
                    offset: -8,
                    fontSize: AXIS_LABEL_FONT_SIZE,
                    fill: chartTheme.muted,
                  }}
                />
                <YAxis
                  width={80}
                  {...labAxisProps(chartTheme)}
                  label={{
                    value: getYAxisLabel(selectedMetric),
                    angle: -90,
                    position: "insideLeft",
                    fontSize: AXIS_LABEL_FONT_SIZE,
                    fill: chartTheme.muted,
                  }}
                  tickFormatter={(value) => formatMetricValue(Number(value), selectedMetric)}
                />
                <Tooltip content={<ScheduleTooltip metric={selectedMetric} />} />
                {isStatusQuo && (
                  <>
                    <ReferenceLine
                      x={BENCHMARK_INCOME}
                      stroke={chartTheme.muted}
                      strokeDasharray="4 4"
                      label={{
                        position: "top",
                        value: "€60k concordance",
                        fontSize: 10,
                        fill: chartTheme.muted,
                      }}
                    />
                    {selectedMetric === "averageRate" && (
                      <ReferenceLine
                        y={BENCHMARK_AVERAGE_RATE * 100}
                        stroke={chartTheme.rule}
                        strokeDasharray="3 3"
                        label={{
                          position: "insideTopRight",
                          value: "benchmark rate",
                          fontSize: 10,
                          fill: chartTheme.muted,
                        }}
                      />
                    )}
                  </>
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

          <p className={`mt-6 border-t border-[color:var(--rule-color)] pt-4 ${labFootnote}`}>
            {isStatusQuo ? (
              <>
                All stylised schedules are calibrated to the current Irish model at €60,000.
              </>
            ) : (
              <>
                Each stylised schedule is calibrated to preserve Ireland&apos;s 2024 Income Tax
                and USC take. Nine equally weighted salary observations are used behind the
                scenes to estimate the required rates.
              </>
            )}
          </p>
        </article>
      </div>

      <LabSection className="mt-12">
        <div className="grid gap-10 lg:grid-cols-3 lg:gap-0">
          <div className="border-[color:var(--rule-color)] lg:border-r lg:pr-10">
            <p className={labMicroLabel}>
              {isStatusQuo ? "Status quo" : "2024 income tax take"}
            </p>
            <p className="mt-3 text-[clamp(2.6rem,5vw,3.8rem)] font-light leading-[0.9] tracking-[-0.04em] tabular-nums text-[color:var(--foreground)]">
              {isStatusQuo
                ? formatPercent(BENCHMARK_AVERAGE_RATE * 100)
                : formatBillions(NATIONAL_INCOME_TAX_RECEIPTS_2024)}
            </p>
            {isStatusQuo ? (
              <>
                <p className={`mt-5 ${labFootnote}`}>
                  A single PAYE employee on {formatCurrency(BENCHMARK_INCOME)} pays about{" "}
                  {formatCurrency(BENCHMARK_TAX)} in PAYE, USC, and PRSI in this model.
                </p>
                <p className={`mt-3 ${labFootnote}`}>
                  I tuned the other tax schedules so that each reaches 25.2% at €60,000. I chose
                  this to allow rough comparison to the current Irish-tax status quo.
                </p>
              </>
            ) : (
              <>
                <p className={`mt-5 ${labFootnote}`}>
                  Ireland collected €35.071 billion in net Income Tax receipts, including USC,
                  in 2024.
                </p>
                <p className={`mt-3 ${labFootnote}`}>
                  The nine salary observations are used behind the scenes to estimate the rates
                  each schedule would need to keep that national take unchanged.
                </p>
              </>
            )}
          </div>

          <div className="min-w-0 lg:col-span-2 lg:pl-10">
            <LabNote heading="What the chart is">
              The chart is a shape explorer, not a full-population revenue forecast. It compares
              how different fairness rules distribute the burden across salaries after{" "}
              {isStatusQuo
                ? "they are anchored to the same benchmark taxpayer."
                : "their parameters are adjusted to keep Ireland’s overall income-tax take unchanged."}
            </LabNote>

            <div className="mt-9 grid gap-x-8 gap-y-7 sm:grid-cols-2">
              {SCHEDULES.map((schedule) => (
                <div
                  key={schedule.id}
                  className="border-t border-[color:var(--rule-color)] pt-4"
                >
                  <div className="flex items-baseline gap-2">
                    <span
                      className="mt-[0.35em] h-2.5 w-2.5 shrink-0 self-start rounded-full"
                      style={{ backgroundColor: schedule.color }}
                    />
                    <h3 className="text-[1.02rem] font-normal leading-snug text-[color:var(--foreground)]">
                      {schedule.label}
                    </h3>
                  </div>
                  <p className={`mt-2.5 ${labFootnote}`}>{schedule.description}</p>
                  {schedule.id === "equalPurchaseTime" && (
                    <p
                      className={`mt-3 border-t border-[color:var(--rule-color)] pt-3 ${labFootnote}`}
                    >
                      Its average tax rate reaches 50% at a salary of{" "}
                      <span className="text-[color:var(--foreground)]">
                        {formatCurrency(calibration.purchaseTimeK)}
                      </span>
                      . With 37.5 working hours a week for 52 weeks (
                      {WORKING_MINUTES_PER_YEAR.toLocaleString("en-IE")} minutes a year), one
                      gross minute at that salary buys about{" "}
                      <span className="text-[color:var(--foreground)]">
                        {formatCurrency(oneMinutePurchasePrice, 2)}
                      </span>
                      .
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </LabSection>
    </LabShell>
  );
}
