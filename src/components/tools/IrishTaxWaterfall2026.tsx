"use client";

import Link from "next/link";
import { ArrowLeft, Info } from "lucide-react";
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

export default function IrishTaxWaterfall2026() {
  const [grossIncome, setGrossIncome] = useState(65_000);
  const [spendingPct, setSpendingPct] = useState(70);
  const [savingsPct, setSavingsPct] = useState(10);
  const [investmentPct, setInvestmentPct] = useState(10);

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

  return (
    <div className="mx-auto max-w-7xl px-4 pt-10 pb-24 sm:px-6 lg:px-8">
      <Link
        href="/labs"
        className="mb-8 inline-flex items-center gap-2 text-stone-500 transition-colors hover:text-stone-900"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="font-mono text-sm font-medium uppercase tracking-[0.2em]">Back to Labs</span>
      </Link>

      <header className="mb-10 space-y-4">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.3em] text-stone-500">
          Irish Tax Lens • 2026 assumptions
        </p>
        <h1 className="text-5xl font-black uppercase leading-[0.9] tracking-tight text-stone-900 sm:text-7xl">
          Your Income As A Waterfall
        </h1>
        <p className="max-w-4xl text-lg leading-relaxed text-stone-600 sm:text-xl">
          Follow one year of gross income through income taxes, consumption, and tax on returns.
          The controls let you test how lifestyle choices change the amount you retain.
        </p>
      </header>

      <section className="mb-8 rounded-[2rem] border border-stone-200 bg-white p-6 shadow-[0_10px_40px_-25px_rgba(0,0,0,0.4)] md:p-8">
        <h2 className="mb-6 text-2xl font-black tracking-tight text-stone-900">Controls</h2>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <label className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold uppercase tracking-[0.12em] text-stone-500">
                Gross Income
              </span>
              <span className="text-sm font-bold text-stone-900">{formatCurrency(grossIncome)}</span>
            </div>
            <input
              type="range"
              min={15_000}
              max={250_000}
              step={1_000}
              value={grossIncome}
              onChange={(event) => setGrossIncome(Number(event.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-stone-200 accent-stone-900"
            />
          </label>

          <label className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold uppercase tracking-[0.12em] text-stone-500">
                Spending
              </span>
              <span className="text-sm font-bold text-stone-900">{formatPercent(spendingPct)}</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={spendingPct}
              onChange={(event) => setSpendingPct(Number(event.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-stone-200 accent-stone-900"
            />
          </label>

          <label className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold uppercase tracking-[0.12em] text-stone-500">
                Savings Rate
              </span>
              <span className="text-sm font-bold text-stone-900">{formatPercent(savingsPct)}</span>
            </div>
            <input
              type="range"
              min={0}
              max={50}
              step={1}
              value={savingsPct}
              onChange={(event) => setSavingsPct(Number(event.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-stone-200 accent-stone-900"
            />
          </label>

          <label className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold uppercase tracking-[0.12em] text-stone-500">
                Investment Rate
              </span>
              <span className="text-sm font-bold text-stone-900">{formatPercent(investmentPct)}</span>
            </div>
            <input
              type="range"
              min={0}
              max={50}
              step={1}
              value={investmentPct}
              onChange={(event) => setInvestmentPct(Number(event.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-stone-200 accent-stone-900"
            />
          </label>
        </div>

        {result.allocationScale < 1 ? (
          <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Savings and investment requests exceeded what remained after spending, so both were scaled
            down proportionally.
          </div>
        ) : null}
      </section>

      <section className="mb-8 rounded-[2rem] border border-stone-200 bg-white p-6 shadow-[0_10px_40px_-25px_rgba(0,0,0,0.4)] md:p-8">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-2xl font-black tracking-tight text-stone-900">Waterfall</h2>
          <span className="font-mono text-xs uppercase tracking-[0.25em] text-stone-400">
            Signed Annual Amounts
          </span>
        </div>
        <div className="h-[430px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={result.waterfallData}
              margin={{ top: 16, right: 20, left: 8, bottom: 64 }}
              barCategoryGap={20}
            >
              <CartesianGrid stroke="#e7e5e4" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="label"
                interval={0}
                angle={-18}
                textAnchor="end"
                height={70}
                tick={{ fill: "#57534e", fontSize: 12 }}
              />
              <YAxis
                tick={{ fill: "#57534e", fontSize: 12 }}
                tickFormatter={(value) =>
                  value.toLocaleString("en-IE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 })
                }
              />
              <ReferenceLine y={0} stroke="#a8a29e" />
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{
                  borderRadius: "0.9rem",
                  borderColor: "#e7e5e4",
                  backgroundColor: "#fafaf9",
                }}
              />
              <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                {result.waterfallData.map((entry) => (
                  <Cell key={entry.label} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-[0_10px_35px_-26px_rgba(0,0,0,0.35)]">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">Income Taxes</p>
          <p className="mt-3 text-3xl font-black text-stone-900">{formatCurrency(result.total)}</p>
          <ul className="mt-4 space-y-1 text-sm text-stone-600">
            <li>PAYE: {formatCurrency(result.paye)}</li>
            <li>USC: {formatCurrency(result.usc)}</li>
            <li>PRSI: {formatCurrency(result.prsi)}</li>
          </ul>
        </article>

        <article className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-[0_10px_35px_-26px_rgba(0,0,0,0.35)]">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
            Consumption
          </p>
          <p className="mt-3 text-3xl font-black text-stone-900">{formatCurrency(result.amountSpent)}</p>
          <ul className="mt-4 space-y-1 text-sm text-stone-600">
            <li>VAT element: {formatCurrency(result.vatPaid)}</li>
            <li>Non-VAT spend: {formatCurrency(result.spendingExVat)}</li>
            <li>After spending: {formatCurrency(result.availableAfterSpending)}</li>
          </ul>
        </article>

        <article className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-[0_10px_35px_-26px_rgba(0,0,0,0.35)]">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
            Savings + Investing
          </p>
          <p className="mt-3 text-3xl font-black text-stone-900">
            {formatCurrency(result.amountSaved + result.amountInvested)}
          </p>
          <ul className="mt-4 space-y-1 text-sm text-stone-600">
            <li>Saved: {formatCurrency(result.amountSaved)}</li>
            <li>Invested: {formatCurrency(result.amountInvested)}</li>
            <li>Unallocated cash: {formatCurrency(result.unallocatedCash)}</li>
          </ul>
        </article>

        <article className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-[0_10px_35px_-26px_rgba(0,0,0,0.35)]">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
            Return Taxes + Final
          </p>
          <p className="mt-3 text-3xl font-black text-stone-900">{formatCurrency(result.finalRetained)}</p>
          <ul className="mt-4 space-y-1 text-sm text-stone-600">
            <li>DIRT: {formatCurrency(result.dirtPaid)}</li>
            <li>CGT: {formatCurrency(result.cgtPaid)}</li>
            <li>Total return taxes: {formatCurrency(result.totalReturnTaxes)}</li>
          </ul>
        </article>
      </section>

      <section className="mt-8 rounded-[2rem] border border-stone-200 bg-stone-50 p-6 text-sm leading-relaxed text-stone-600 md:p-8">
        <div className="mb-3 flex items-center gap-2 text-stone-700">
          <Info className="h-4 w-4" />
          <p className="font-semibold">Illustrative assumptions</p>
        </div>
        <p>
          This tool is an educational model, not financial advice. It uses simplified 2026-style PAYE,
          USC, and PRSI settings for a single PAYE earner, a 23% VAT assumption on spending, and stylized
          annual return assumptions (3.5% for savings and 5% for investments) with DIRT/CGT overlays.
        </p>
      </section>
    </div>
  );
}
