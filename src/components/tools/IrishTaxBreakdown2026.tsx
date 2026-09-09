"use client";

import { useCallback, useMemo, useState } from "react";
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
  LabLedger,
  LabLedgerRow,
  LabRail,
  LabSection,
  LabShell,
} from "@/components/labs/LabChrome";
import {
  LabLegend,
  LabTooltip,
  labAxisProps,
  labGridProps,
  useLabChartTheme,
} from "@/components/labs/labChartTheme";
import {
  labEyebrow,
  labFootnote,
  labMicroLabel,
  labSlider,
  labSubheading,
  labTab,
} from "@/components/labs/labTokens";

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

const RATE_SERIES = [
  { key: "it", name: "Income Tax", color: "#3b82f6", width: 2 },
  { key: "usc", name: "USC", color: "#f59e0b", width: 2 },
  { key: "prsi", name: "PRSI", color: "#10b981", width: 2 },
  { key: "total", name: "Total Rate", color: "#0f172a", width: 3.5 },
];

type RateTooltipProps = {
  active?: boolean;
  label?: string | number;
  payload?: Array<{
    name?: string | number;
    value?: string | number;
    color?: string;
    payload: TaxBreakdownRow;
  }>;
};

function RateTooltip({ active, label, payload }: RateTooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <LabTooltip
      label={`Gross income: €${Number(label).toLocaleString("en-IE")}`}
      rows={payload.map((entry) => ({
        key: String(entry.name),
        name: String(entry.name),
        value:
          entry.name === "Total Rate"
            ? `${entry.value}% (${entry.payload.totalEuro})`
            : `${entry.value}%`,
        color: entry.color,
      }))}
    />
  );
}

export default function IrishTaxBreakdown2026() {
  const [isSelfEmployed, setIsSelfEmployed] = useState(false);
  const [pensionContrib, setPensionContrib] = useState(0);
  const [viewType, setViewType] = useState<ViewType>("effective");
  const chartTheme = useLabChartTheme();

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
    <LabShell>
      <LabHeader
        eyebrow="Irish Income Tax - 2026 assumptions"
        title="Irish Tax Breakdown 2026"
        lede="Explore effective and marginal tax rates across income levels, including the USC threshold behavior around €13,000."
      />

      <div className="grid gap-10 lg:grid-cols-[236px_minmax(0,1fr)] lg:gap-0">
        <LabRail label="Assumptions">
          <div className="border-t border-[color:var(--rule-color)] pt-4">
            <p className={labMicroLabel}>Employment</p>
            <div className="mt-3 flex gap-5">
              <button
                type="button"
                onClick={() => setIsSelfEmployed(false)}
                className={labTab(!isSelfEmployed)}
              >
                Employee
              </button>
              <button
                type="button"
                onClick={() => setIsSelfEmployed(true)}
                className={labTab(isSelfEmployed)}
              >
                Self-employed
              </button>
            </div>
          </div>

          <div className="mt-7 border-t border-[color:var(--rule-color)] pt-4">
            <div className="flex items-baseline justify-between gap-3">
              <p className={labMicroLabel}>Pension contribution</p>
              <span className="text-[1.15rem] font-light tabular-nums text-[color:var(--foreground)]">
                {pensionContrib}%
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={40}
              step={1}
              value={pensionContrib}
              onChange={(event) => setPensionContrib(Number(event.target.value))}
              className={`mt-3 ${labSlider}`}
              aria-label="Pension contribution"
            />
            <p className={`mt-3 ${labFootnote}`}>
              Pension relief reduces income-taxable pay in this model, but USC and PRSI stay
              linked to gross income.
            </p>
          </div>

          <div className="mt-7 border-l-2 border-[#F4CA16] pl-4">
            <p className={labFootnote}>
              <span className="text-[color:var(--foreground)]">USC cliff:</span> under this
              model, crossing from €13,000 to €13,001 can trigger an immediate USC jump.
            </p>
          </div>
        </LabRail>

        <article className="min-w-0 lg:pl-12">
          <div className="mb-6 flex flex-wrap items-baseline justify-between gap-4">
            <h2 className="text-[1.6rem] font-normal tracking-[-0.015em] text-[color:var(--foreground)]">
              Rate Profile by Gross Income
            </h2>
            <div className="flex gap-5">
              <button
                type="button"
                onClick={() => setViewType("effective")}
                className={labTab(viewType === "effective")}
              >
                Effective rate
              </button>
              <button
                type="button"
                onClick={() => setViewType("marginal")}
                className={labTab(viewType === "marginal")}
              >
                Marginal rate
              </button>
            </div>
          </div>

          <LabLegend
            className="mb-5"
            items={RATE_SERIES.map((series) => ({
              key: series.key,
              label: series.name,
              color: series.color,
            }))}
          />

          <div className="h-[30rem] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 20, right: 24, left: 0, bottom: 6 }}>
                <CartesianGrid {...labGridProps(chartTheme)} />
                <XAxis
                  dataKey="income"
                  interval={9}
                  tickFormatter={(value) => `€${value / 1_000}k`}
                  {...labAxisProps(chartTheme)}
                />
                <YAxis unit="%" domain={[0, 60]} {...labAxisProps(chartTheme)} />
                <Tooltip content={<RateTooltip />} />

                <ReferenceLine
                  x={13_000}
                  stroke={chartTheme.muted}
                  strokeDasharray="3 3"
                  label={{
                    position: "top",
                    value: "USC cliff",
                    fontSize: 10,
                    fill: chartTheme.muted,
                  }}
                />
                <ReferenceLine
                  x={20_000}
                  stroke={chartTheme.muted}
                  strokeDasharray="2 2"
                  label={{
                    position: "top",
                    value: "IT starts",
                    fontSize: 10,
                    fill: chartTheme.muted,
                  }}
                />
                <ReferenceLine
                  x={44_000}
                  stroke={chartTheme.foreground}
                  strokeOpacity={0.4}
                  label={{
                    position: "top",
                    value: "40% band",
                    fontSize: 10,
                    fill: chartTheme.muted,
                  }}
                />

                {RATE_SERIES.map((series) => (
                  <Line
                    key={series.key}
                    type="monotone"
                    dataKey={series.key}
                    stroke={series.color}
                    strokeWidth={series.width}
                    dot={false}
                    name={series.name}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

          <p className={`mt-6 border-t border-[color:var(--rule-color)] pt-4 ${labFootnote}`}>
            This lab is an illustrative model based on embedded 2026 assumptions (bands, rates,
            and credits) and is not financial or tax advice.
          </p>
        </article>
      </div>

      <LabSection className="mt-12">
        <p className={labEyebrow}>Reading the chart</p>
        <h2 className="mt-4 text-[clamp(2.2rem,4vw,3.2rem)] font-light leading-[1.05] tracking-[-0.02em] text-[color:var(--foreground)]">
          Marginal pain, average calm
        </h2>
        <p className="mt-5 max-w-[720px] text-[1.05rem] leading-[1.7] text-[color:var(--text-body-rgb)]">
          The main illusion in the Irish tax system is the gap between marginal and effective
          rates. The average rate stays relatively low for a long time, but a raise, bonus, or
          extra contract can hit the high marginal bands immediately.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-2 xl:grid-cols-3">
          {TAX_INSIGHTS.map((insight) => (
            <div key={insight.title} className="border-t border-[color:var(--rule-color)] pt-4">
              <p className={labMicroLabel}>{insight.label}</p>
              <h3 className="mt-2.5 text-[1.15rem] font-normal text-[color:var(--foreground)]">
                {insight.title}
              </h3>
              <p className={`mt-2.5 ${labFootnote}`}>{insight.description}</p>
            </div>
          ))}
        </div>
      </LabSection>

      <LabSection className="mt-12">
        <div className="grid gap-10 md:grid-cols-2 md:gap-0">
          <div className="border-[color:var(--rule-color)] md:border-r md:pr-10">
            <p className={labMicroLabel}>The salient number</p>
            <p className="mt-3 text-[clamp(3rem,6vw,4.5rem)] font-light leading-[0.9] tracking-[-0.04em] text-[color:var(--foreground)]">
              €1.85
            </p>
            <p className="mt-5 max-w-[420px] text-[1rem] leading-[1.7] text-[color:var(--text-body-rgb)]">
              For a high earner around €150k+, the economy can spend about €1.85 in total labour
              cost to leave €1.00 of spending power. The remaining €0.85 is the combined drag
              from employee tax and employer PRSI.
            </p>
          </div>

          <div className="md:pl-10">
            <h3 className={labSubheading}>Income Landscape</h3>
            <p className="mt-4 text-[1rem] leading-[1.7] text-[color:var(--text-body-rgb)]">
              CSO data puts median annual full-time earnings at roughly €44,816 in 2024. The
              distribution is skewed: the top 10% earn above about €77,500 and pay around 61% of
              personal income tax, while the top 1% earn over €200,000 and pay roughly 19-20%.
            </p>
            <p className="mt-4 text-[1rem] leading-[1.7] text-[color:var(--text-body-rgb)]">
              At the other end, the bottom 40% pay less than 5% of income tax collected, which
              makes the system highly progressive but also dependent on a narrow high-earner
              base.
            </p>
          </div>
        </div>
      </LabSection>

      <LabSection className="mt-12">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className={labEyebrow}>Total labour cost</p>
            <h2 className="mt-4 text-[clamp(2.2rem,4vw,3.2rem)] font-light leading-[1.05] tracking-[-0.02em] text-[color:var(--foreground)]">
              What it costs to deliver take-home pay
            </h2>
          </div>
          <p className={`max-w-[420px] ${labFootnote}`}>
            These rounded examples add employer PRSI to salary cost, then compare the full
            economic cost with approximate net pay.
          </p>
        </div>

        <LabLedger
          label="Total labour cost by gross salary"
          columns="minmax(0,1fr) repeat(4, minmax(4.5rem, 7rem))"
          headers={["Gross", "Employer PRSI", "Net pay", "Total cost", "Tax per €1 net"]}
        >
          {LABOUR_COST_ROWS.map((row) => (
            <LabLedgerRow key={row.grossSalary}>
              <span className="text-[1.05rem] tabular-nums text-[color:var(--foreground)]">
                {row.grossSalary}
              </span>
              <span className="text-right text-[0.95rem] tabular-nums text-[color:var(--text-muted)]">
                {row.employerPrsi}
              </span>
              <span className="text-right text-[0.95rem] tabular-nums text-[color:var(--text-muted)]">
                {row.netPay}
              </span>
              <span className="text-right text-[0.95rem] tabular-nums text-[color:var(--text-muted)]">
                {row.totalCost}
              </span>
              <span className="text-right text-[1.05rem] font-medium tabular-nums text-[color:var(--foreground)]">
                {row.taxPaidPerNetEuro}
              </span>
            </LabLedgerRow>
          ))}
        </LabLedger>
      </LabSection>
    </LabShell>
  );
}
