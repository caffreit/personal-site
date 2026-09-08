"use client";

import { FormEvent, ReactNode, useMemo, useState } from "react";
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

import { LabDetails, LabHeader, LabSection, LabShell } from "@/components/labs/LabChrome";
import {
  LabTooltip,
  labAxisProps,
  labGridProps,
  useLabChartTheme,
} from "@/components/labs/labChartTheme";
import {
  labField,
  labFieldLabel,
  labFootnote,
  labLink,
  labMicroLabel,
  labQuietButton,
  labSubheading,
  labTab,
  labTextButton,
} from "@/components/labs/labTokens";

type ViewMode = "total" | "personal";
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

type SpendingNode = {
  name: string;
  value: number;
  color: string;
  children?: SpendingNode[];
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
const EMPTY_SPENDING_CHILDREN: SpendingNode[] = [];

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

const ABOUT_YOU_DEFAULTS: Pick<
  FiscalInputs,
  "maritalStatus" | "employmentStatus" | "isMedicalCardHolder" | "isOver70" | "spouseSalary"
> = {
  maritalStatus: "single",
  employmentStatus: "paye",
  isMedicalCardHolder: false,
  isOver70: false,
  spouseSalary: 0,
};

const INCOME_DEFAULTS: Pick<
  FiscalInputs,
  "grossSalary" | "spouseSalary" | "selfEmployedIncome" | "rentalIncome"
> = {
  grossSalary: 60_000,
  spouseSalary: 0,
  selfEmployedIncome: 0,
  rentalIncome: 5_000,
};

const SPENDING_DEFAULTS: Pick<
  FiscalInputs,
  | "spendingGroceries"
  | "spendingEnergy"
  | "spendingHospitality"
  | "spendingFuel"
  | "spendingAlcoholTobacco"
  | "spendingGeneral"
> = {
  spendingGroceries: 600,
  spendingEnergy: 150,
  spendingHospitality: 200,
  spendingFuel: 150,
  spendingAlcoholTobacco: 100,
  spendingGeneral: 400,
};

const OTHER_TAX_DEFAULTS: Pick<
  FiscalInputs,
  | "totalSavings"
  | "interestRate"
  | "cgtGain"
  | "lpt"
  | "motorTax"
  | "vrtPrice"
  | "vrtCo2"
  | "catValue"
  | "catGroup"
> = {
  totalSavings: 10_000,
  interestRate: 3,
  cgtGain: 5_000,
  lpt: 450,
  motorTax: 390,
  vrtPrice: 30_000,
  vrtCo2: 110,
  catValue: 20_000,
  catGroup: "B",
};

const ESTIMATE_TAX_DEFAULTS: Partial<FiscalInputs> = {
  ...ABOUT_YOU_DEFAULTS,
  ...INCOME_DEFAULTS,
  ...SPENDING_DEFAULTS,
  ...OTHER_TAX_DEFAULTS,
};

const SPENDING_HIERARCHY: SpendingNode = {
  name: "Total Revenue",
  value: TOTAL_REVENUE_MILLIONS,
  color: "#0f172a",
  children: [
    {
      name: "Social Protection",
      value: 42_569,
      color: "#45B7D1",
      children: [
        {
          name: "Pensions",
          value: 20_400,
          color: "#5cb8d6",
          children: [
            { name: "State Pension", value: 11_200, color: "#7ac4dd" },
            { name: "Public Sector Pensions", value: 4_200, color: "#8cd0e3" },
            { name: "Other Pensions", value: 5_000, color: "#9ddcec" },
          ],
        },
        {
          name: "Illness & Disability",
          value: 9_800,
          color: "#6fc2da",
          children: [
            { name: "Disability Allowance", value: 3_500, color: "#85cde2" },
            { name: "Invalidity Pension", value: 2_500, color: "#97d7ea" },
            { name: "Carer's Allowance", value: 2_000, color: "#a9e2f2" },
            { name: "Illness Benefit", value: 1_000, color: "#bbecfa" },
            { name: "Other Illness Supports", value: 800, color: "#cdf6ff" },
          ],
        },
        {
          name: "Child & Family",
          value: 7_069,
          color: "#82cce0",
          children: [
            { name: "Child Benefit", value: 4_500, color: "#95d6e6" },
            { name: "TUSLA", value: 2_569, color: "#a8dfec" },
          ],
        },
        {
          name: "Working Age",
          value: 5_300,
          color: "#95d6e6",
          children: [
            { name: "Jobseeker Payments", value: 2_500, color: "#a8dfec" },
            { name: "One-Parent Family Payment", value: 1_200, color: "#bbe8f2" },
            { name: "Supplementary Welfare", value: 600, color: "#cef1f8" },
            { name: "Working Family Payment", value: 500, color: "#e1faff" },
            { name: "Other Working Age", value: 500, color: "#ecfdff" },
          ],
        },
      ],
    },
    {
      name: "Health",
      value: 24_100,
      color: "#FF6B6B",
      children: [
        {
          name: "Acute Hospitals",
          value: 11_500,
          color: "#ff8c8c",
          children: [
            { name: "HSE Pay", value: 7_500, color: "#ffabab" },
            { name: "Clinical Supplies & Drugs", value: 2_500, color: "#ffcaca" },
            { name: "Other Hospital Operating Costs", value: 1_500, color: "#ffe9e9" },
          ],
        },
        {
          name: "Primary Care",
          value: 5_200,
          color: "#ffacac",
          children: [
            { name: "Medical Cards (GMS)", value: 2_800, color: "#ffc5c5" },
            { name: "Prescription Drug Schemes", value: 1_600, color: "#ffdddd" },
            { name: "Community Health Services", value: 800, color: "#fff0f0" },
          ],
        },
        {
          name: "Targeted Health",
          value: 7_400,
          color: "#ffcdcd",
          children: [
            { name: "Disability Services", value: 3_000, color: "#ffe2e2" },
            { name: "Older Persons", value: 2_100, color: "#ffeaea" },
            { name: "Mental Health", value: 1_300, color: "#fff1f1" },
            { name: "Other HSE", value: 1_000, color: "#fff7f7" },
          ],
        },
      ],
    },
    {
      name: "Education",
      value: 15_500,
      color: "#4ECDC4",
      children: [
        {
          name: "Schools",
          value: 12_000,
          color: "#6fd7d0",
          children: [
            { name: "Primary Education", value: 5_500, color: "#8fe1db" },
            { name: "Secondary Education", value: 5_000, color: "#afebf5" },
            { name: "Special Education", value: 1_500, color: "#cff5ef" },
          ],
        },
        {
          name: "Higher & Further Ed.",
          value: 3_500,
          color: "#82e0d8",
          children: [
            { name: "University Grants", value: 2_500, color: "#9eebe3" },
            { name: "Apprenticeships", value: 1_000, color: "#baf5ef" },
          ],
        },
      ],
    },
    {
      name: "Housing",
      value: 6_100,
      color: "#F7B801",
      children: [
        { name: "Capital Build", value: 2_650, color: "#f8c53b" },
        {
          name: "Current Supports",
          value: 2_450,
          color: "#fad165",
          children: [
            { name: "HAP", value: 1_250, color: "#fbde90" },
            { name: "RAS", value: 600, color: "#fce9b1" },
            { name: "Other Supports", value: 600, color: "#fdf3d2" },
          ],
        },
        { name: "Water/Planning", value: 1_000, color: "#feeb9a" },
      ],
    },
    {
      name: "Debt & EU Budget",
      value: 4_715,
      color: "#5A4D9B",
      children: [
        { name: "Debt Service", value: 2_900, color: "#7264ad" },
        { name: "EU Budget", value: 1_500, color: "#8a7bc0" },
        { name: "Other Costs", value: 315, color: "#a294d2" },
      ],
    },
    {
      name: "Transport",
      value: 4_531,
      color: "#F18701",
      children: [
        {
          name: "Public Transport",
          value: 1_600,
          color: "#f39d35",
          children: [
            { name: "Bus/Rail Subsidies", value: 950, color: "#f6b56a" },
            { name: "NTA Investment", value: 650, color: "#f8cd9d" },
          ],
        },
        {
          name: "Road Networks",
          value: 1_400,
          color: "#f5af50",
          children: [
            { name: "National Roads", value: 600, color: "#f8c983" },
            { name: "Regional/Local Roads", value: 550, color: "#fae0b2" },
            { name: "TII Operations", value: 150, color: "#fcead1" },
            { name: "Road Safety", value: 100, color: "#fef3ea" },
          ],
        },
        { name: "Active Travel", value: 931, color: "#f7bf74" },
        { name: "Aviation/Maritime", value: 600, color: "#f9d7a5" },
      ],
    },
    {
      name: "Enterprise & Agriculture",
      value: 4_500,
      color: "#8ECAE6",
      children: [
        { name: "Agri & Food", value: 2_500, color: "#a7d7ed" },
        { name: "Enterprise/Trade", value: 2_000, color: "#bfE4f3" },
      ],
    },
    {
      name: "Justice & Defence",
      value: 3_800,
      color: "#EF476F",
      children: [
        { name: "Gardai", value: 2_355, color: "#f26b8c" },
        { name: "Defence Forces", value: 933, color: "#f58eaa" },
        { name: "Prisons/Courts", value: 512, color: "#f9b2c7" },
      ],
    },
    {
      name: "Other Core Services",
      value: 2_785,
      color: "#9CA3AF",
      children: [
        { name: "Foreign Affairs", value: 1_200, color: "#b2b8c2" },
        { name: "Central Admin", value: 1_585, color: "#c8cdd5" },
      ],
    },
  ],
};

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

type SpendingTooltipProps = {
  active?: boolean;
  viewMode: ViewMode;
  parentName: string;
  payload?: Array<{
    value?: number;
    payload: {
      name: string;
      color: string;
      percentageOfTotal: number;
      percentageOfParent: number;
    };
  }>;
};

function SpendingTooltip({ active, payload, viewMode, parentName }: SpendingTooltipProps) {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  const slice = entry.payload;
  const value = Number(entry.value ?? 0);

  if (viewMode === "total") {
    return (
      <LabTooltip
        label={slice.name}
        rows={[{ key: "value", value: formatMillions(Math.round(value)), name: "Allocation", color: slice.color }]}
        note={`${slice.percentageOfTotal.toFixed(2)}% of total, ${slice.percentageOfParent.toFixed(2)}% of ${parentName}`}
      />
    );
  }

  return (
    <LabTooltip
      label={slice.name}
      rows={[
        { key: "value", name: "Your share", value: formatCurrency(value), color: slice.color },
      ]}
    />
  );
}

/** Underline-only number field, the form equivalent of a hairline rule. */
function NumberField({
  label,
  value,
  placeholder,
  step,
  onChange,
}: {
  label: string;
  value: number;
  placeholder: string;
  step?: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className={labFieldLabel}>{label}</span>
      <input
        type="number"
        step={step}
        value={value || ""}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={labField}
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  className = "",
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label className={`block ${className}`}>
      <span className={labFieldLabel}>{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={labField}
      >
        {children}
      </select>
    </label>
  );
}

function CheckboxField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2.5 text-[0.95rem] text-[color:var(--foreground)]">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-3.5 w-3.5 accent-[color:var(--foreground)]"
      />
      {label}
    </label>
  );
}

/** A numbered fieldset separated from its neighbours by a single rule. */
function FormBlock({ step, title, children }: { step: string; title: string; children: ReactNode }) {
  return (
    <fieldset className="border-t border-[color:var(--rule-color)] pt-5">
      <legend className="sr-only">{title}</legend>
      <div className="flex items-baseline gap-3">
        <span className={labMicroLabel}>{step}</span>
        <h3 className={labSubheading}>{title}</h3>
      </div>
      {children}
    </fieldset>
  );
}

export default function IrelandsFiscalFlow() {
  const [inputs, setInputs] = useState<FiscalInputs>(DEFAULT_INPUTS);
  const [hasCalculated, setHasCalculated] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("total");
  const [drilldownPath, setDrilldownPath] = useState<SpendingNode[]>([
    SPENDING_HIERARCHY,
  ]);
  const chartTheme = useLabChartTheme();

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

  const currentSpendingNode = drilldownPath[drilldownPath.length - 1];
  const chartChildren = currentSpendingNode.children ?? EMPTY_SPENDING_CHILDREN;

  const chartData = useMemo(
    () =>
      chartChildren.map((category) => ({
        name: category.name,
        color: category.color,
        percentageOfTotal: (category.value / TOTAL_REVENUE_MILLIONS) * 100,
        percentageOfParent: (category.value / currentSpendingNode.value) * 100,
        displayValue:
          viewMode === "total"
            ? category.value
            : (category.value / TOTAL_REVENUE_MILLIONS) * totalEstimatedAnnualTax,
      })),
    [chartChildren, currentSpendingNode.value, totalEstimatedAnnualTax, viewMode],
  );

  const chartHeight = Math.max(360, chartData.length * 56);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setHasCalculated(true);
    setDrilldownPath([SPENDING_HIERARCHY]);
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

  function applyDefaults(defaults: Partial<FiscalInputs>) {
    setInputs((prev) => ({ ...prev, ...defaults }));
  }

  function enterDrilldown(index: number) {
    const next = chartChildren[index];
    if (!next?.children?.length) return;
    setDrilldownPath((prev) => [...prev, next]);
  }

  function goBackDrilldown() {
    setDrilldownPath((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
  }

  const taxBreakdownLines = [
    { key: "it", label: "Income tax", value: incomeTaxResult.incomeTax },
    { key: "usc", label: "USC", value: incomeTaxResult.usc },
    { key: "prsi", label: "PRSI", value: incomeTaxResult.prsi },
    { key: "vat", label: "VAT", value: consumptionTaxes.vat },
    { key: "excise", label: "Excise duties", value: consumptionTaxes.excise },
    { key: "property", label: "Property & capital taxes", value: propertyAndCapitalTaxes },
    { key: "motor", label: "Motor taxes", value: motorTaxes },
  ];

  return (
    <LabShell>
      <LabHeader
        eyebrow="Public Spending - Ireland 2024"
        title="Ireland's Fiscal Flow"
        lede="Estimate your tax contribution, then compare it against how the 2024 public spending pot is distributed across major services."
      />

      <LabSection
        heading="Step 1: Estimate your tax"
        intro="Enter your details to get an illustrative annual estimate. Use Fill defaults if you want quick sample values first."
        action={
          <button
            type="button"
            onClick={() => applyDefaults(ESTIMATE_TAX_DEFAULTS)}
            className={labQuietButton}
          >
            Fill defaults
          </button>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-9">
          <FormBlock step="01" title="About you">
            <div className="mt-5 grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2">
              <SelectField
                label="Marital status"
                value={inputs.maritalStatus}
                onChange={(value) => setStringField("maritalStatus", value as MaritalStatus)}
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
              </SelectField>

              <SelectField
                label="Employment status"
                value={inputs.employmentStatus}
                onChange={(value) =>
                  setStringField("employmentStatus", value as EmploymentStatus)
                }
              >
                <option value="paye">PAYE Employee</option>
                <option value="self-employed">Self-Employed</option>
                <option value="both">Both PAYE &amp; Self-Employed</option>
                <option value="none">Unemployed / Not Working</option>
              </SelectField>
            </div>

            <div className="mt-6 flex flex-wrap gap-8">
              <CheckboxField
                label="Full medical card"
                checked={inputs.isMedicalCardHolder}
                onChange={(checked) => setBooleanField("isMedicalCardHolder", checked)}
              />
              <CheckboxField
                label="Over 70"
                checked={inputs.isOver70}
                onChange={(checked) => setBooleanField("isOver70", checked)}
              />
            </div>
          </FormBlock>

          <FormBlock step="02" title="Annual income">
            <div className="mt-5 grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2">
              <NumberField
                label="Gross salary (PAYE)"
                value={inputs.grossSalary}
                placeholder="e.g. 60000"
                onChange={(value) => setNumberField("grossSalary", value)}
              />

              {inputs.maritalStatus === "married-two-incomes" && (
                <NumberField
                  label="Spouse gross salary"
                  value={inputs.spouseSalary}
                  placeholder="e.g. 50000"
                  onChange={(value) => setNumberField("spouseSalary", value)}
                />
              )}

              <NumberField
                label="Self-employed income"
                value={inputs.selfEmployedIncome}
                placeholder="e.g. 25000"
                onChange={(value) => setNumberField("selfEmployedIncome", value)}
              />

              <NumberField
                label="Rental income"
                value={inputs.rentalIncome}
                placeholder="e.g. 5000"
                onChange={(value) => setNumberField("rentalIncome", value)}
              />
            </div>

            {incomeTaxResult.totalIncome > 0 && (
              <div className="mt-6 border-l-2 border-[#F4CA16] pl-4">
                <p className={labMicroLabel}>Estimated net monthly income</p>
                <p className="mt-1.5 text-[1.7rem] font-light tracking-[-0.02em] tabular-nums text-[color:var(--foreground)]">
                  {formatCurrency(incomeTaxResult.netPay / 12)}
                </p>
              </div>
            )}
          </FormBlock>

          <FormBlock step="03" title="Monthly spending">
            <div className="mt-5 grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2">
              <NumberField
                label="Groceries (~4.6% VAT)"
                value={inputs.spendingGroceries}
                placeholder="e.g. 600"
                onChange={(value) => setNumberField("spendingGroceries", value)}
              />
              <NumberField
                label="Energy bills (9% VAT)"
                value={inputs.spendingEnergy}
                placeholder="e.g. 150"
                onChange={(value) => setNumberField("spendingEnergy", value)}
              />
              <NumberField
                label="Hospitality (13.5% VAT)"
                value={inputs.spendingHospitality}
                placeholder="e.g. 200"
                onChange={(value) => setNumberField("spendingHospitality", value)}
              />
              <NumberField
                label="Fuel (~50% tax)"
                value={inputs.spendingFuel}
                placeholder="e.g. 150"
                onChange={(value) => setNumberField("spendingFuel", value)}
              />
              <NumberField
                label="Alcohol/tobacco (~60% tax)"
                value={inputs.spendingAlcoholTobacco}
                placeholder="e.g. 100"
                onChange={(value) => setNumberField("spendingAlcoholTobacco", value)}
              />
              <NumberField
                label="Other general spending (23% VAT)"
                value={inputs.spendingGeneral}
                placeholder="e.g. 400"
                onChange={(value) => setNumberField("spendingGeneral", value)}
              />
            </div>

            {monthlySpending > 0 && (
              <div className="mt-6 border-l-2 border-[#F4CA16] pl-4">
                <p className={labMicroLabel}>Estimated monthly spending</p>
                <p className="mt-1.5 text-[1.7rem] font-light tracking-[-0.02em] tabular-nums text-[color:var(--foreground)]">
                  {formatCurrency(monthlySpending)}
                </p>
              </div>
            )}
          </FormBlock>

          <FormBlock step="04" title="Other taxes (optional)">
            <div className="mt-5 grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2">
              <NumberField
                label="Total savings"
                value={inputs.totalSavings}
                placeholder="e.g. 10000"
                onChange={(value) => setNumberField("totalSavings", value)}
              />
              <NumberField
                label="Interest rate (%)"
                value={inputs.interestRate}
                placeholder="e.g. 3.00"
                step="0.01"
                onChange={(value) => setNumberField("interestRate", value)}
              />
              <NumberField
                label="Profit from assets (CGT)"
                value={inputs.cgtGain}
                placeholder="e.g. 5000"
                onChange={(value) => setNumberField("cgtGain", value)}
              />
              <NumberField
                label="Annual LPT"
                value={inputs.lpt}
                placeholder="e.g. 450"
                onChange={(value) => setNumberField("lpt", value)}
              />
              <NumberField
                label="Annual motor tax"
                value={inputs.motorTax}
                placeholder="e.g. 390"
                onChange={(value) => setNumberField("motorTax", value)}
              />
              <NumberField
                label="Vehicle purchase price (VRT)"
                value={inputs.vrtPrice}
                placeholder="e.g. 30000"
                onChange={(value) => setNumberField("vrtPrice", value)}
              />
              <NumberField
                label="Vehicle CO2 g/km (VRT)"
                value={inputs.vrtCo2}
                placeholder="e.g. 110"
                onChange={(value) => setNumberField("vrtCo2", value)}
              />
              <NumberField
                label="Gift / inheritance value"
                value={inputs.catValue}
                placeholder="e.g. 20000"
                onChange={(value) => setNumberField("catValue", value)}
              />
              <SelectField
                label="Relationship to giver"
                value={inputs.catGroup}
                onChange={(value) => setStringField("catGroup", value as CatGroup)}
                className="md:col-span-2"
              >
                <option value="none">-- Select --</option>
                <option value="A">Child</option>
                <option value="B">Parent, Sibling, etc.</option>
                <option value="C">Other</option>
              </SelectField>
            </div>
          </FormBlock>

          <div className="border-t border-[color:var(--rule-color)] pt-6">
            <button type="submit" className={labTextButton}>
              Calculate &amp; view fiscal flow
            </button>
          </div>
        </form>

        {hasCalculated && (
          <div className="mt-12">
            <h3 className={labSubheading}>Your estimated tax breakdown</h3>
            <div className="mt-5 grid gap-10 md:grid-cols-[minmax(0,1fr)_minmax(220px,0.7fr)] md:gap-12">
              <dl className="border-t border-[color:var(--rule-color)]">
                {taxBreakdownLines.map((line) => (
                  <div
                    key={line.key}
                    className="flex items-baseline justify-between gap-4 border-b border-[color:var(--rule-color)] py-3"
                  >
                    <dt className="text-[1rem] text-[color:var(--text-muted)]">{line.label}</dt>
                    <dd className="text-[1.05rem] tabular-nums text-[color:var(--foreground)]">
                      {formatCurrency(line.value)}
                    </dd>
                  </div>
                ))}
              </dl>

              <div className="border-t-2 border-[#F4CA16] pt-4">
                <p className={labMicroLabel}>Total estimated annual tax</p>
                <p className="mt-2 text-[clamp(2.2rem,4vw,3rem)] font-light leading-[0.95] tracking-[-0.04em] tabular-nums text-[color:var(--foreground)]">
                  {formatCurrency(totalEstimatedAnnualTax)}
                </p>
                {taxAsIncomeShare !== null && (
                  <p className={`mt-3 ${labFootnote}`}>
                    Approx. {taxAsIncomeShare.toFixed(1)}% of annual income
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </LabSection>

      {hasCalculated && (
        <LabSection
          heading="Step 2: See where it goes"
          intro="Click a bar to drill into further detail."
          action={
            <div className="flex gap-5">
              <button
                type="button"
                onClick={() => setViewMode("total")}
                className={labTab(viewMode === "total")}
              >
                Total + %
              </button>
              <button
                type="button"
                onClick={() => setViewMode("personal")}
                className={labTab(viewMode === "personal")}
              >
                Your share
              </button>
            </div>
          }
        >
          <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-[color:var(--rule-color)] pb-4">
            <p className={labMicroLabel}>Viewing: {currentSpendingNode.name}</p>
            {drilldownPath.length > 1 && (
              <button type="button" onClick={goBackDrilldown} className={labQuietButton}>
                Back one level
              </button>
            )}
          </div>

          <div className="mt-6" style={{ height: chartHeight }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 8, right: 24, left: 16, bottom: 8 }}
              >
                <CartesianGrid {...labGridProps(chartTheme)} vertical horizontal={false} />
                <XAxis
                  type="number"
                  tickFormatter={(value: number) => {
                    if (viewMode === "total") return formatMillions(Math.round(value));
                    return `EUR ${Math.round(value).toLocaleString("en-IE")}`;
                  }}
                  {...labAxisProps(chartTheme)}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={210}
                  {...labAxisProps(chartTheme)}
                />
                <Tooltip
                  content={
                    <SpendingTooltip
                      viewMode={viewMode}
                      parentName={currentSpendingNode.name}
                    />
                  }
                  cursor={{ fill: chartTheme.rule, fillOpacity: 0.25 }}
                />
                <Bar
                  dataKey="displayValue"
                  radius={0}
                  onClick={(_entry, index) => {
                    if (typeof index === "number") {
                      enterDrilldown(index);
                    }
                  }}
                >
                  {chartData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </LabSection>
      )}

      <LabDetails heading="Notes and sources" summary="What this model assumes, and where the data comes from.">
        <p className="max-w-[720px] text-[1rem] leading-[1.7] text-[color:var(--text-body-rgb)]">
          This tool is an illustrative explainer and not personal tax advice. Spending values
          are aggregated from 2024 public spending references.
        </p>
        <ul className="mt-5 max-w-[720px] space-y-3 text-[1rem] leading-[1.7] text-[color:var(--text-body-rgb)]">
          <li>
            <a
              href="https://www.gov.ie/en/department-of-public-expenditure-infrastructure-public-service-reform-and-digitalisation/press-releases/minister-donohoe-publishes-the-revised-estimates-for-public-services-2024/"
              target="_blank"
              rel="noreferrer"
              className={labLink}
            >
              Department of Public Expenditure: Revised Estimates for Public Services 2024
            </a>
          </li>
          <li>
            <a
              href="https://data.oireachtas.ie/ie/oireachtas/parliamentaryBudgetOffice/2024/2024-02-14_overview-of-the-revised-estimates-for-public-services-2024_en.pdf"
              target="_blank"
              rel="noreferrer"
              className={labLink}
            >
              Oireachtas Parliamentary Budget Office: Overview of the Revised Estimates for
              Public Services 2024
            </a>
          </li>
        </ul>
      </LabDetails>
    </LabShell>
  );
}
