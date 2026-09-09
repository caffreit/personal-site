"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { LabDetails, LabHeader, LabSection, LabShell } from "@/components/labs/LabChrome";
import {
  LabTooltip,
  labAxisProps,
  labGridProps,
  useLabChartTheme,
} from "@/components/labs/labChartTheme";
import { labFootnote, labMicroLabel, labSlider } from "@/components/labs/labTokens";

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

type WaterfallPoint = {
  label: string;
  value: number;
  color: string;
};

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

const VAT_RATE = 0.23;
const DIRT_RATE = 0.33;
const CGT_RATE = 0.33;
const CGT_EXEMPTION = 1_270;
const SAVINGS_INTEREST_RATE = 0.035;
const INVESTMENT_GROWTH_RATE = 0.05;

function formatCurrency(value: number) {
  return value.toLocaleString("en-IE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  });
}

function formatPercent(value: number) {
  return `${Math.round(value)}%`;
}

function calculateIncomeTaxes(grossIncome: number) {
  const grossPaye =
    grossIncome <= TAX_RULES_2026.srcop
      ? grossIncome * 0.2
      : TAX_RULES_2026.srcop * 0.2 + (grossIncome - TAX_RULES_2026.srcop) * 0.4;
  const payeCredits = TAX_RULES_2026.personalCredit + TAX_RULES_2026.payeCredit;
  const paye = Math.max(0, grossPaye - payeCredits);

  const [band1, band2, band3] = TAX_RULES_2026.uscBands;
  const [rate1, rate2, rate3, rate4] = TAX_RULES_2026.uscRates;

  let usc = 0;
  if (grossIncome > TAX_RULES_2026.uscExemptionLimit) {
    usc += Math.min(grossIncome, band1) * rate1;
    usc += Math.max(0, Math.min(grossIncome, band2) - band1) * rate2;
    usc += Math.max(0, Math.min(grossIncome, band3) - band2) * rate3;
    usc += Math.max(0, grossIncome - band3) * rate4;
  }

  const prsi = grossIncome > TAX_RULES_2026.prsiThreshold ? grossIncome * TAX_RULES_2026.prsiRate : 0;
  const total = paye + usc + prsi;

  return { paye, usc, prsi, total };
}

type WaterfallTooltipProps = {
  active?: boolean;
  payload?: Array<{ payload: WaterfallPoint; value: number }>;
};

function WaterfallTooltip({ active, payload }: WaterfallTooltipProps) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;

  return (
    <LabTooltip
      label={point.label}
      rows={[
        {
          key: "value",
          name: point.value < 0 ? "Deducted" : "Amount",
          value: formatCurrency(point.value),
          color: point.color,
        },
      ]}
    />
  );
}

/** A slider with its live value on the label's baseline, over a hairline rule. */
function WaterfallControl({
  label,
  value,
  display,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  display: string;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block border-t border-[color:var(--rule-color)] pt-4">
      <div className="flex items-baseline justify-between gap-3">
        <span className={labMicroLabel}>{label}</span>
        <span className="text-[1.15rem] font-light tabular-nums text-[color:var(--foreground)]">
          {display}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className={`mt-3 ${labSlider}`}
      />
    </label>
  );
}

export default function IrishTaxWaterfall2026() {
  const [grossIncome, setGrossIncome] = useState(65_000);
  const [spendingPct, setSpendingPct] = useState(70);
  const [savingsPct, setSavingsPct] = useState(10);
  const [investmentPct, setInvestmentPct] = useState(10);
  const chartTheme = useLabChartTheme();

  const result = useMemo(() => {
    const taxes = calculateIncomeTaxes(grossIncome);
    const takeHomePay = Math.max(0, grossIncome - taxes.total);

    const amountSpent = takeHomePay * (spendingPct / 100);
    const spendingExVat = amountSpent / (1 + VAT_RATE);
    const vatPaid = amountSpent - spendingExVat;

    const availableAfterSpending = Math.max(0, takeHomePay - amountSpent);
    const requestedSavings = takeHomePay * (savingsPct / 100);
    const requestedInvestment = takeHomePay * (investmentPct / 100);
    const requestedCombined = requestedSavings + requestedInvestment;
    const allocationScale =
      requestedCombined > availableAfterSpending && requestedCombined > 0
        ? availableAfterSpending / requestedCombined
        : 1;

    const amountSaved = requestedSavings * allocationScale;
    const amountInvested = requestedInvestment * allocationScale;
    const unallocatedCash = Math.max(0, availableAfterSpending - amountSaved - amountInvested);

    const savingsInterest = amountSaved * SAVINGS_INTEREST_RATE;
    const dirtPaid = savingsInterest * DIRT_RATE;
    const netSavingsGrowth = savingsInterest - dirtPaid;

    const capitalGains = amountInvested * INVESTMENT_GROWTH_RATE;
    const taxableGains = Math.max(0, capitalGains - CGT_EXEMPTION);
    const cgtPaid = taxableGains * CGT_RATE;
    const netInvestmentGrowth = capitalGains - cgtPaid;

    const finalRetained =
      unallocatedCash + amountSaved + amountInvested + netSavingsGrowth + netInvestmentGrowth;

    const totalIncomeTaxes = taxes.total;
    const totalReturnTaxes = dirtPaid + cgtPaid;

    const waterfallData: WaterfallPoint[] = [
      { label: "Gross Income", value: grossIncome, color: "#2563eb" },
      { label: "Income Taxes", value: -totalIncomeTaxes, color: "#ef4444" },
      { label: "Take-Home Pay", value: takeHomePay, color: "#16a34a" },
      { label: "Non-VAT Spending", value: -spendingExVat, color: "#fb923c" },
      { label: "VAT on Spending", value: -vatPaid, color: "#ef4444" },
      { label: "Post-Consumption", value: availableAfterSpending, color: "#14b8a6" },
      { label: "DIRT + CGT", value: -totalReturnTaxes, color: "#ef4444" },
      { label: "Final Retained", value: finalRetained, color: "#4f46e5" },
    ];

    return {
      ...taxes,
      takeHomePay,
      amountSpent,
      spendingExVat,
      vatPaid,
      availableAfterSpending,
      amountSaved,
      amountInvested,
      unallocatedCash,
      savingsInterest,
      dirtPaid,
      capitalGains,
      cgtPaid,
      totalReturnTaxes,
      finalRetained,
      allocationScale,
      waterfallData,
    };
  }, [grossIncome, spendingPct, savingsPct, investmentPct]);

  const summaryColumns = [
    {
      label: "Income taxes",
      value: formatCurrency(result.total),
      lines: [
        { key: "paye", name: "PAYE", value: formatCurrency(result.paye) },
        { key: "usc", name: "USC", value: formatCurrency(result.usc) },
        { key: "prsi", name: "PRSI", value: formatCurrency(result.prsi) },
      ],
    },
    {
      label: "Consumption",
      value: formatCurrency(result.amountSpent),
      lines: [
        { key: "vat", name: "VAT element", value: formatCurrency(result.vatPaid) },
        { key: "exvat", name: "Non-VAT spend", value: formatCurrency(result.spendingExVat) },
        {
          key: "after",
          name: "After spending",
          value: formatCurrency(result.availableAfterSpending),
        },
      ],
    },
    {
      label: "Savings + investing",
      value: formatCurrency(result.amountSaved + result.amountInvested),
      lines: [
        { key: "saved", name: "Saved", value: formatCurrency(result.amountSaved) },
        { key: "invested", name: "Invested", value: formatCurrency(result.amountInvested) },
        {
          key: "unallocated",
          name: "Unallocated cash",
          value: formatCurrency(result.unallocatedCash),
        },
      ],
    },
    {
      label: "Return taxes + final",
      value: formatCurrency(result.finalRetained),
      lines: [
        { key: "dirt", name: "DIRT", value: formatCurrency(result.dirtPaid) },
        { key: "cgt", name: "CGT", value: formatCurrency(result.cgtPaid) },
        {
          key: "total",
          name: "Total return taxes",
          value: formatCurrency(result.totalReturnTaxes),
        },
      ],
    },
  ];

  return (
    <LabShell>
      <LabHeader
        eyebrow="Irish Tax Lens - 2026 assumptions"
        title="Your Income As A Waterfall"
        lede="Follow one year of gross income through income taxes, consumption, and tax on returns. The controls let you test how lifestyle choices change the amount you retain."
      />

      <LabSection heading="Controls">
        <div className="grid gap-x-8 gap-y-6 md:grid-cols-2 xl:grid-cols-4">
          <WaterfallControl
            label="Gross income"
            value={grossIncome}
            display={formatCurrency(grossIncome)}
            min={15_000}
            max={250_000}
            step={1_000}
            onChange={setGrossIncome}
          />
          <WaterfallControl
            label="Spending"
            value={spendingPct}
            display={formatPercent(spendingPct)}
            min={0}
            max={100}
            step={1}
            onChange={setSpendingPct}
          />
          <WaterfallControl
            label="Savings rate"
            value={savingsPct}
            display={formatPercent(savingsPct)}
            min={0}
            max={50}
            step={1}
            onChange={setSavingsPct}
          />
          <WaterfallControl
            label="Investment rate"
            value={investmentPct}
            display={formatPercent(investmentPct)}
            min={0}
            max={50}
            step={1}
            onChange={setInvestmentPct}
          />
        </div>

        {result.allocationScale < 1 ? (
          <p className={`mt-7 border-l-2 border-[#F4CA16] pl-4 ${labFootnote}`}>
            Savings and investment requests exceeded what remained after spending, so both were
            scaled down proportionally.
          </p>
        ) : null}
      </LabSection>

      <LabSection
        heading="Waterfall"
        action={<span className={labMicroLabel}>Signed annual amounts</span>}
      >
        <div className="h-[430px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={result.waterfallData}
              margin={{ top: 16, right: 20, left: 8, bottom: 64 }}
              barCategoryGap={20}
            >
              <CartesianGrid {...labGridProps(chartTheme)} />
              <XAxis
                dataKey="label"
                interval={0}
                angle={-18}
                textAnchor="end"
                height={70}
                {...labAxisProps(chartTheme)}
              />
              <YAxis
                {...labAxisProps(chartTheme)}
                tickFormatter={(value) =>
                  value.toLocaleString("en-IE", {
                    style: "currency",
                    currency: "EUR",
                    maximumFractionDigits: 0,
                  })
                }
              />
              <ReferenceLine y={0} stroke={chartTheme.foreground} strokeOpacity={0.35} />
              <Tooltip content={<WaterfallTooltip />} cursor={{ fill: chartTheme.rule, fillOpacity: 0.25 }} />
              <Bar dataKey="value" radius={0}>
                {result.waterfallData.map((entry) => (
                  <Cell key={entry.label} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </LabSection>

      <LabSection heading="Where it ends up">
        <div className="grid gap-x-8 gap-y-8 md:grid-cols-2 xl:grid-cols-4">
          {summaryColumns.map((column) => (
            <article key={column.label} className="border-t border-[color:var(--rule-color)] pt-4">
              <p className={labMicroLabel}>{column.label}</p>
              <p className="mt-2 text-[1.9rem] font-light tracking-[-0.03em] tabular-nums text-[color:var(--foreground)]">
                {column.value}
              </p>
              <dl className="mt-4">
                {column.lines.map((line) => (
                  <div
                    key={line.key}
                    className="flex items-baseline justify-between gap-3 border-b border-[color:var(--rule-color)] py-2"
                  >
                    <dt className="text-[0.9rem] text-[color:var(--text-muted)]">{line.name}</dt>
                    <dd className="text-[0.95rem] tabular-nums text-[color:var(--foreground)]">
                      {line.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </article>
          ))}
        </div>
      </LabSection>

      <LabDetails
        heading="Illustrative assumptions"
        summary="What this model simplifies."
      >
        <p className="max-w-[720px] text-[1rem] leading-[1.7] text-[color:var(--text-body-rgb)]">
          This tool is an educational model, not financial advice. It uses simplified 2026-style
          PAYE, USC, and PRSI settings for a single PAYE earner, a 23% VAT assumption on spending,
          and stylized annual return assumptions (3.5% for savings and 5% for investments) with
          DIRT/CGT overlays.
        </p>
      </LabDetails>
    </LabShell>
  );
}
