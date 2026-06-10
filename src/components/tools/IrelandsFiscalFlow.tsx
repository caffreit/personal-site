"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type ViewMode = "absolute" | "percentage" | "personal";
type MaritalStatus =
  | "single"
  | "married-one-income"
  | "married-two-incomes"
  | "widowed"
  | "separated";
type EmploymentStatus = "paye" | "self-employed" | "both" | "none";
type CatGroup = "none" | "A" | "B" | "C";

type FiscalInputs = {
  maritalStatus: MaritalStatus;
  employmentStatus: EmploymentStatus;
  isMedicalCardHolder: boolean;
  isOver70: boolean;
  grossSalary: number;
  spouseSalary: number;
  selfEmployedIncome: number;
  rentalIncome: number;
  spendingGroceries: number;
  spendingEnergy: number;
  spendingHospitality: number;
  spendingFuel: number;
  spendingAlcoholTobacco: number;
  spendingGeneral: number;
  totalSavings: number;
  interestRate: number;
  cgtGain: number;
  lpt: number;
  motorTax: number;
  vrtPrice: number;
  vrtCo2: number;
  catValue: number;
  catGroup: CatGroup;
};

type SpendingCategory = {
  name: string;
  value: number;
  color: string;
};

type IncomeTaxResult = {
  totalIncome: number;
  incomeTax: number;
  usc: number;
  prsi: number;
  netPay: number;
};

const TOTAL_REVENUE_MILLIONS = 108_600;
const DIRT_RATE = 0.33;
const CGT_RATE = 0.33;
const CAT_RATE = 0.33;
const CGT_EXEMPTION = 1_270;
const PRSI_RATE = 0.04;
const USC_EXEMPTION_THRESHOLD = 13_000;
const CAT_THRESHOLDS: Record<Exclude<CatGroup, "none">, number> = {
  A: 335_000,
  B: 32_500,
  C: 16_250,
};

const DEFAULT_INPUTS: FiscalInputs = {
  maritalStatus: "single",
  employmentStatus: "paye",
  isMedicalCardHolder: false,
  isOver70: false,
  grossSalary: 0,
  spouseSalary: 0,
  selfEmployedIncome: 0,
  rentalIncome: 0,
  spendingGroceries: 0,
  spendingEnergy: 0,
  spendingHospitality: 0,
  spendingFuel: 0,
  spendingAlcoholTobacco: 0,
  spendingGeneral: 0,
  totalSavings: 0,
  interestRate: 0,
  cgtGain: 0,
  lpt: 0,
  motorTax: 0,
  vrtPrice: 0,
  vrtCo2: 0,
  catValue: 0,
  catGroup: "none",
};

const SPENDING_CATEGORIES: SpendingCategory[] = [
  { name: "Social Protection", value: 42_569, color: "#45B7D1" },
  { name: "Health", value: 24_100, color: "#FF6B6B" },
  { name: "Education", value: 15_500, color: "#4ECDC4" },
  { name: "Housing", value: 6_100, color: "#F7B801" },
  { name: "Debt & EU Budget", value: 4_715, color: "#5A4D9B" },
  { name: "Transport", value: 4_531, color: "#F18701" },
  { name: "Enterprise & Agriculture", value: 4_500, color: "#8ECAE6" },
  { name: "Justice & Defence", value: 3_800, color: "#EF476F" },
  { name: "Other Core Services", value: 2_785, color: "#9CA3AF" },
];

function formatCurrency(value: number) {
  return `EUR ${value.toLocaleString("en-IE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatMillions(value: number) {
  return `${value.toLocaleString("en-IE")} M`;
}

function toPositiveNumber(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function calculateIncomeTax(inputs: FiscalInputs): IncomeTaxResult {
  const spouseIncome =
    inputs.maritalStatus === "married-two-incomes" ? inputs.spouseSalary : 0;
  const totalIncome =
    inputs.grossSalary + spouseIncome + inputs.selfEmployedIncome + inputs.rentalIncome;

  if (totalIncome <= 0) {
    return { totalIncome: 0, incomeTax: 0, usc: 0, prsi: 0, netPay: 0 };
  }

  let standardRateCutoff = 42_000;
  if (inputs.maritalStatus === "married-one-income") {
    standardRateCutoff = 51_000;
  }
  if (inputs.maritalStatus === "married-two-incomes") {
    standardRateCutoff = 51_000 + Math.min(inputs.spouseSalary, 33_000);
  }
  if (inputs.maritalStatus === "widowed") {
    standardRateCutoff = 46_000;
  }

  const lowerBand = Math.min(totalIncome, standardRateCutoff);
  const upperBand = Math.max(0, totalIncome - standardRateCutoff);
  const grossIncomeTax = lowerBand * 0.2 + upperBand * 0.4;

  let taxCredits = inputs.maritalStatus.startsWith("married") ? 3_750 : 1_875;
  if (inputs.employmentStatus === "paye" || inputs.employmentStatus === "both") {
    taxCredits += 1_875;
  }
  if (
    inputs.employmentStatus === "self-employed" ||
    inputs.employmentStatus === "both"
  ) {
    taxCredits += 1_875;
  }
  if (inputs.maritalStatus === "married-two-incomes") {
    taxCredits += 1_875;
  }

  const incomeTax = Math.max(0, grossIncomeTax - taxCredits);

  let usc = 0;
  if (totalIncome > USC_EXEMPTION_THRESHOLD) {
    const bands =
      inputs.isMedicalCardHolder || inputs.isOver70
        ? [
            { limit: 12_012, rate: 0.005 },
            { limit: Number.POSITIVE_INFINITY, rate: 0.02 },
          ]
        : [
            { limit: 12_012, rate: 0.005 },
            { limit: 26_288, rate: 0.02 },
            { limit: 70_080, rate: 0.04 },
            { limit: Number.POSITIVE_INFINITY, rate: 0.08 },
          ];

    let taxedSoFar = 0;
    for (const band of bands) {
      const taxableInBand = Math.max(
        0,
        Math.min(totalIncome, band.limit) - taxedSoFar,
      );
      usc += taxableInBand * band.rate;
      taxedSoFar += taxableInBand;
      if (taxedSoFar >= totalIncome) break;
    }
  }

  let prsi = 0;
  const payeIncome = inputs.grossSalary + spouseIncome;
  if (
    (inputs.employmentStatus === "paye" || inputs.employmentStatus === "both") &&
    payeIncome > 18_304
  ) {
    prsi += payeIncome * PRSI_RATE;
  }
  if (
    (inputs.employmentStatus === "self-employed" ||
      inputs.employmentStatus === "both") &&
    inputs.selfEmployedIncome > 5_000
  ) {
    prsi += Math.max(500, inputs.selfEmployedIncome * PRSI_RATE);
  }

  const netPay = Math.max(0, totalIncome - incomeTax - usc - prsi);
  return { totalIncome, incomeTax, usc, prsi, netPay };
}

function calculateConsumptionTaxes(inputs: FiscalInputs) {
  const annualVat =
    12 *
    (inputs.spendingGroceries * 0.046 +
      inputs.spendingEnergy * 0.09 +
      inputs.spendingHospitality * 0.135 +
      inputs.spendingGeneral * 0.23);
  const annualExcise =
    12 * (inputs.spendingFuel * 0.5 + inputs.spendingAlcoholTobacco * 0.6);

  return {
    vat: annualVat,
    excise: annualExcise,
  };
}

function calculateDirt(inputs: FiscalInputs) {
  return inputs.totalSavings * (inputs.interestRate / 100) * DIRT_RATE;
}

function calculateCgt(inputs: FiscalInputs) {
  return Math.max(0, inputs.cgtGain - CGT_EXEMPTION) * CGT_RATE;
}

function calculateCat(inputs: FiscalInputs) {
  if (inputs.catGroup === "none" || inputs.catValue <= 0) return 0;
  const threshold = CAT_THRESHOLDS[inputs.catGroup] ?? 0;
  return Math.max(0, inputs.catValue - threshold) * CAT_RATE;
}

function calculateVrt(inputs: FiscalInputs) {
  if (inputs.vrtPrice <= 0 || inputs.vrtCo2 <= 0) return 0;

  const co2 = inputs.vrtCo2;
  let rate = 0.3;
  if (co2 <= 50) rate = 0.07;
  else if (co2 <= 80) rate = 0.09;
  else if (co2 <= 100) rate = 0.11;
  else if (co2 <= 120) rate = 0.15;
  else if (co2 <= 140) rate = 0.2;

  return inputs.vrtPrice * rate;
}

export default function IrelandsFiscalFlow() {
  const [inputs, setInputs] = useState<FiscalInputs>(DEFAULT_INPUTS);
  const [hasCalculated, setHasCalculated] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("absolute");

  const incomeTaxResult = useMemo(() => calculateIncomeTax(inputs), [inputs]);
  const consumptionTaxes = useMemo(() => calculateConsumptionTaxes(inputs), [inputs]);
  const dirt = useMemo(() => calculateDirt(inputs), [inputs]);
  const cgt = useMemo(() => calculateCgt(inputs), [inputs]);
  const cat = useMemo(() => calculateCat(inputs), [inputs]);
  const vrt = useMemo(() => calculateVrt(inputs), [inputs]);

  const propertyAndCapitalTaxes = inputs.lpt + dirt + cgt + cat;
  const motorTaxes = inputs.motorTax + vrt;
  const totalEstimatedAnnualTax =
    incomeTaxResult.incomeTax +
    incomeTaxResult.usc +
    incomeTaxResult.prsi +
    consumptionTaxes.vat +
    consumptionTaxes.excise +
    propertyAndCapitalTaxes +
    motorTaxes;

  const monthlySpending =
    inputs.spendingGroceries +
    inputs.spendingEnergy +
    inputs.spendingHospitality +
    inputs.spendingFuel +
    inputs.spendingAlcoholTobacco +
    inputs.spendingGeneral;

  const taxAsIncomeShare =
    incomeTaxResult.totalIncome > 0
      ? (totalEstimatedAnnualTax / incomeTaxResult.totalIncome) * 100
      : null;

  const chartData = useMemo(
    () =>
      SPENDING_CATEGORIES.map((category) => {
        if (viewMode === "absolute") {
          return {
            ...category,
            displayValue: category.value,
          };
        }
        if (viewMode === "percentage") {
          return {
            ...category,
            displayValue: (category.value / TOTAL_REVENUE_MILLIONS) * 100,
          };
        }
        return {
          ...category,
          displayValue:
            (category.value / TOTAL_REVENUE_MILLIONS) * totalEstimatedAnnualTax,
        };
      }),
    [viewMode, totalEstimatedAnnualTax],
  );

  const chartHeight = Math.max(420, chartData.length * 52);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setHasCalculated(true);
  }

  function setNumberField<Key extends keyof FiscalInputs>(key: Key, value: string) {
    setInputs((prev) => ({ ...prev, [key]: toPositiveNumber(value) }));
  }

  function setStringField<Key extends keyof FiscalInputs>(
    key: Key,
    value: FiscalInputs[Key],
  ) {
    setInputs((prev) => ({ ...prev, [key]: value }));
  }

  function setBooleanField<Key extends keyof FiscalInputs>(key: Key, value: boolean) {
    setInputs((prev) => ({ ...prev, [key]: value }));
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
          Ireland&apos;s Fiscal Flow
        </h1>
        <p className="max-w-3xl text-lg leading-relaxed text-stone-600 sm:text-xl">
          Estimate your tax contribution, then compare it against how the 2024
          public spending pot is distributed across major services.
        </p>
      </header>

      <section className="mb-8 rounded-[2rem] border border-stone-200 bg-white p-6 shadow-[0_10px_40px_-25px_rgba(0,0,0,0.4)] sm:p-8">
        <h2 className="text-2xl font-black tracking-tight text-stone-900 sm:text-3xl">
          Step 1: Estimate Your Tax
        </h2>
        <p className="mt-2 text-stone-600">
          Enter your details to get an illustrative annual estimate.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <div className="rounded-2xl border border-stone-200 bg-stone-50 p-5">
            <h3 className="text-lg font-bold text-stone-900">1) About You</h3>
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <label className="text-sm font-semibold text-stone-700">
                Marital Status
                <select
                  value={inputs.maritalStatus}
                  onChange={(event) =>
                    setStringField("maritalStatus", event.target.value as MaritalStatus)
                  }
                  className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900"
                >
                  <option value="single">Single</option>
                  <option value="married-one-income">
                    Married/Civil Partnership (One Income)
                  </option>
                  <option value="married-two-incomes">
                    Married/Civil Partnership (Two Incomes)
                  </option>
                  <option value="widowed">Widowed</option>
                  <option value="separated">Separated</option>
                </select>
              </label>

              <label className="text-sm font-semibold text-stone-700">
                Employment Status
                <select
                  value={inputs.employmentStatus}
                  onChange={(event) =>
                    setStringField(
                      "employmentStatus",
                      event.target.value as EmploymentStatus,
                    )
                  }
                  className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900"
                >
                  <option value="paye">PAYE Employee</option>
                  <option value="self-employed">Self-Employed</option>
                  <option value="both">Both PAYE & Self-Employed</option>
                  <option value="none">Unemployed / Not Working</option>
                </select>
              </label>
            </div>

            <div className="mt-4 flex flex-wrap gap-6">
              <label className="inline-flex items-center gap-2 text-sm text-stone-700">
                <input
                  type="checkbox"
                  checked={inputs.isMedicalCardHolder}
                  onChange={(event) =>
                    setBooleanField("isMedicalCardHolder", event.target.checked)
                  }
                />
                Full Medical Card
              </label>
              <label className="inline-flex items-center gap-2 text-sm text-stone-700">
                <input
                  type="checkbox"
                  checked={inputs.isOver70}
                  onChange={(event) => setBooleanField("isOver70", event.target.checked)}
                />
                Over 70
              </label>
            </div>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-stone-50 p-5">
            <h3 className="text-lg font-bold text-stone-900">2) Annual Income</h3>
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <label className="text-sm font-semibold text-stone-700">
                Gross Salary (PAYE)
                <input
                  type="number"
                  value={inputs.grossSalary || ""}
                  onChange={(event) => setNumberField("grossSalary", event.target.value)}
                  className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900"
                  placeholder="e.g. 60000"
                />
              </label>

              {inputs.maritalStatus === "married-two-incomes" && (
                <label className="text-sm font-semibold text-stone-700">
                  Spouse Gross Salary
                  <input
                    type="number"
                    value={inputs.spouseSalary || ""}
                    onChange={(event) => setNumberField("spouseSalary", event.target.value)}
                    className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900"
                    placeholder="e.g. 50000"
                  />
                </label>
              )}

              <label className="text-sm font-semibold text-stone-700">
                Self-Employed Income
                <input
                  type="number"
                  value={inputs.selfEmployedIncome || ""}
                  onChange={(event) =>
                    setNumberField("selfEmployedIncome", event.target.value)
                  }
                  className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900"
                  placeholder="e.g. 25000"
                />
              </label>

              <label className="text-sm font-semibold text-stone-700">
                Rental Income
                <input
                  type="number"
                  value={inputs.rentalIncome || ""}
                  onChange={(event) => setNumberField("rentalIncome", event.target.value)}
                  className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900"
                  placeholder="e.g. 5000"
                />
              </label>
            </div>

            {incomeTaxResult.totalIncome > 0 && (
              <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-3 text-center">
                <p className="text-sm text-blue-800">Estimated Net Monthly Income</p>
                <p className="text-xl font-bold text-blue-900">
                  {formatCurrency(incomeTaxResult.netPay / 12)}
                </p>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-stone-200 bg-stone-50 p-5">
            <h3 className="text-lg font-bold text-stone-900">3) Monthly Spending</h3>
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <label className="text-sm font-semibold text-stone-700">
                Groceries (~4.6% VAT)
                <input
                  type="number"
                  value={inputs.spendingGroceries || ""}
                  onChange={(event) =>
                    setNumberField("spendingGroceries", event.target.value)
                  }
                  className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900"
                />
              </label>
              <label className="text-sm font-semibold text-stone-700">
                Energy Bills (9% VAT)
                <input
                  type="number"
                  value={inputs.spendingEnergy || ""}
                  onChange={(event) => setNumberField("spendingEnergy", event.target.value)}
                  className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900"
                />
              </label>
              <label className="text-sm font-semibold text-stone-700">
                Hospitality (13.5% VAT)
                <input
                  type="number"
                  value={inputs.spendingHospitality || ""}
                  onChange={(event) =>
                    setNumberField("spendingHospitality", event.target.value)
                  }
                  className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900"
                />
              </label>
              <label className="text-sm font-semibold text-stone-700">
                Fuel (~50% Tax)
                <input
                  type="number"
                  value={inputs.spendingFuel || ""}
                  onChange={(event) => setNumberField("spendingFuel", event.target.value)}
                  className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900"
                />
              </label>
              <label className="text-sm font-semibold text-stone-700">
                Alcohol/Tobacco (~60% Tax)
                <input
                  type="number"
                  value={inputs.spendingAlcoholTobacco || ""}
                  onChange={(event) =>
                    setNumberField("spendingAlcoholTobacco", event.target.value)
                  }
                  className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900"
                />
              </label>
              <label className="text-sm font-semibold text-stone-700">
                Other General Spending (23% VAT)
                <input
                  type="number"
                  value={inputs.spendingGeneral || ""}
                  onChange={(event) => setNumberField("spendingGeneral", event.target.value)}
                  className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900"
                />
              </label>
            </div>

            {monthlySpending > 0 && (
              <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-center">
                <p className="text-sm text-emerald-800">Estimated Monthly Spending</p>
                <p className="text-xl font-bold text-emerald-900">
                  {formatCurrency(monthlySpending)}
                </p>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-stone-200 bg-stone-50 p-5">
            <h3 className="text-lg font-bold text-stone-900">
              4) Other Taxes (Optional)
            </h3>
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <label className="text-sm font-semibold text-stone-700">
                Total Savings
                <input
                  type="number"
                  value={inputs.totalSavings || ""}
                  onChange={(event) => setNumberField("totalSavings", event.target.value)}
                  className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900"
                />
              </label>
              <label className="text-sm font-semibold text-stone-700">
                Interest Rate (%)
                <input
                  type="number"
                  step="0.01"
                  value={inputs.interestRate || ""}
                  onChange={(event) => setNumberField("interestRate", event.target.value)}
                  className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900"
                />
              </label>
              <label className="text-sm font-semibold text-stone-700">
                Profit from Assets (CGT)
                <input
                  type="number"
                  value={inputs.cgtGain || ""}
                  onChange={(event) => setNumberField("cgtGain", event.target.value)}
                  className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900"
                />
              </label>
              <label className="text-sm font-semibold text-stone-700">
                Annual LPT
                <input
                  type="number"
                  value={inputs.lpt || ""}
                  onChange={(event) => setNumberField("lpt", event.target.value)}
                  className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900"
                />
              </label>
              <label className="text-sm font-semibold text-stone-700">
                Annual Motor Tax
                <input
                  type="number"
                  value={inputs.motorTax || ""}
                  onChange={(event) => setNumberField("motorTax", event.target.value)}
                  className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900"
                />
              </label>
              <label className="text-sm font-semibold text-stone-700">
                Vehicle Purchase Price (VRT)
                <input
                  type="number"
                  value={inputs.vrtPrice || ""}
                  onChange={(event) => setNumberField("vrtPrice", event.target.value)}
                  className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900"
                />
              </label>
              <label className="text-sm font-semibold text-stone-700">
                Vehicle CO2 g/km (VRT)
                <input
                  type="number"
                  value={inputs.vrtCo2 || ""}
                  onChange={(event) => setNumberField("vrtCo2", event.target.value)}
                  className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900"
                />
              </label>
              <label className="text-sm font-semibold text-stone-700">
                Gift / Inheritance Value
                <input
                  type="number"
                  value={inputs.catValue || ""}
                  onChange={(event) => setNumberField("catValue", event.target.value)}
                  className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900"
                />
              </label>
              <label className="text-sm font-semibold text-stone-700 md:col-span-2">
                Relationship to Giver
                <select
                  value={inputs.catGroup}
                  onChange={(event) =>
                    setStringField("catGroup", event.target.value as CatGroup)
                  }
                  className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900"
                >
                  <option value="none">-- Select --</option>
                  <option value="A">Child</option>
                  <option value="B">Parent, Sibling, etc.</option>
                  <option value="C">Other</option>
                </select>
              </label>
            </div>
          </div>

          <div className="flex justify-center">
            <button
              type="submit"
              className="rounded-full bg-stone-900 px-8 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-stone-700"
            >
              Calculate & View Fiscal Flow
            </button>
          </div>
        </form>

        {hasCalculated && (
          <div className="mt-8 rounded-2xl border border-stone-200 bg-stone-50 p-5">
            <h3 className="text-xl font-black tracking-tight text-stone-900">
              Your Estimated Tax Breakdown
            </h3>
            <div className="mt-4 space-y-2 text-sm text-stone-700">
              <div className="flex items-center justify-between border-b border-stone-200 py-2">
                <span>Income Tax</span>
                <span className="font-semibold">
                  {formatCurrency(incomeTaxResult.incomeTax)}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-stone-200 py-2">
                <span>USC</span>
                <span className="font-semibold">{formatCurrency(incomeTaxResult.usc)}</span>
              </div>
              <div className="flex items-center justify-between border-b border-stone-200 py-2">
                <span>PRSI</span>
                <span className="font-semibold">{formatCurrency(incomeTaxResult.prsi)}</span>
              </div>
              <div className="flex items-center justify-between border-b border-stone-200 py-2">
                <span>VAT</span>
                <span className="font-semibold">{formatCurrency(consumptionTaxes.vat)}</span>
              </div>
              <div className="flex items-center justify-between border-b border-stone-200 py-2">
                <span>Excise Duties</span>
                <span className="font-semibold">
                  {formatCurrency(consumptionTaxes.excise)}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-stone-200 py-2">
                <span>Property & Capital Taxes</span>
                <span className="font-semibold">
                  {formatCurrency(propertyAndCapitalTaxes)}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span>Motor Taxes</span>
                <span className="font-semibold">{formatCurrency(motorTaxes)}</span>
              </div>
            </div>

            <div className="mt-4 rounded-xl bg-stone-900 p-4 text-white">
              <p className="text-xs uppercase tracking-[0.16em] text-stone-300">
                Total Estimated Annual Tax
              </p>
              <p className="mt-1 text-2xl font-black">
                {formatCurrency(totalEstimatedAnnualTax)}
              </p>
              {taxAsIncomeShare !== null && (
                <p className="mt-2 text-sm text-stone-300">
                  Approx. {taxAsIncomeShare.toFixed(1)}% of annual income
                </p>
              )}
            </div>
          </div>
        )}
      </section>

      {hasCalculated && (
        <section className="mb-8 rounded-[2rem] border border-stone-200 bg-white p-6 shadow-[0_10px_40px_-25px_rgba(0,0,0,0.4)] sm:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-2xl font-black tracking-tight text-stone-900 sm:text-3xl">
              Step 2: See Where It Goes
            </h2>
            <div className="inline-flex rounded-xl border border-stone-300 bg-stone-100 p-1">
              <button
                type="button"
                onClick={() => setViewMode("absolute")}
                className={`rounded-lg px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] transition ${
                  viewMode === "absolute"
                    ? "bg-teal-500 text-white"
                    : "text-stone-700 hover:bg-stone-200"
                }`}
              >
                Total (M)
              </button>
              <button
                type="button"
                onClick={() => setViewMode("percentage")}
                className={`rounded-lg px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] transition ${
                  viewMode === "percentage"
                    ? "bg-teal-500 text-white"
                    : "text-stone-700 hover:bg-stone-200"
                }`}
              >
                % Breakdown
              </button>
              <button
                type="button"
                onClick={() => setViewMode("personal")}
                className={`rounded-lg px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] transition ${
                  viewMode === "personal"
                    ? "bg-teal-500 text-white"
                    : "text-stone-700 hover:bg-stone-200"
                }`}
              >
                Your Share
              </button>
            </div>
          </div>

          <p className="mt-3 text-sm text-stone-600">
            Compare the public spending mix in total terms, as a percentage, or
            as your estimated contribution.
          </p>

          <div className="mt-6" style={{ height: chartHeight }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ top: 8, right: 24, left: 16, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#d6d3d1" opacity={0.45} />
                <XAxis
                  type="number"
                  tickFormatter={(value: number) => {
                    if (viewMode === "absolute") return formatMillions(Math.round(value));
                    if (viewMode === "percentage") return `${value.toFixed(0)}%`;
                    return `EUR ${Math.round(value).toLocaleString("en-IE")}`;
                  }}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={170}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  formatter={(value: number, _name, item) => {
                    if (viewMode === "absolute") {
                      return [formatMillions(Math.round(value)), item.payload.name];
                    }
                    if (viewMode === "percentage") {
                      return [`${value.toFixed(2)}%`, item.payload.name];
                    }
                    return [formatCurrency(value), item.payload.name];
                  }}
                  contentStyle={{ borderRadius: "12px", borderColor: "#d6d3d1" }}
                />
                <Bar dataKey="displayValue" radius={[0, 8, 8, 0]}>
                  {chartData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      <section className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-[0_10px_40px_-25px_rgba(0,0,0,0.4)] sm:p-8">
        <h2 className="text-2xl font-black tracking-tight text-stone-900 sm:text-3xl">
          Notes & Sources
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-stone-700">
          This tool is an illustrative explainer and not personal tax advice.
          Spending values are aggregated from 2024 public spending references.
        </p>
        <ul className="mt-4 space-y-2 text-sm text-stone-700">
          <li>
            <a
              href="https://www.gov.ie/en/department-of-public-expenditure-infrastructure-public-service-reform-and-digitalisation/press-releases/minister-donohoe-publishes-the-revised-estimates-for-public-services-2024/"
              target="_blank"
              rel="noreferrer"
              className="underline decoration-stone-400 underline-offset-4 transition hover:decoration-stone-900"
            >
              Department of Public Expenditure: Revised Estimates for Public
              Services 2024
            </a>
          </li>
          <li>
            <a
              href="https://data.oireachtas.ie/ie/oireachtas/parliamentaryBudgetOffice/2024/2024-02-14_overview-of-the-revised-estimates-for-public-services-2024_en.pdf"
              target="_blank"
              rel="noreferrer"
              className="underline decoration-stone-400 underline-offset-4 transition hover:decoration-stone-900"
            >
              Oireachtas Parliamentary Budget Office: Overview of the Revised
              Estimates for Public Services 2024
            </a>
          </li>
        </ul>
      </section>
    </div>
  );
}
