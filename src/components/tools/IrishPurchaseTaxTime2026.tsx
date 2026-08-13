"use client";

import Image from "next/image";
import Link from "next/link";
import { Info } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

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

type ItemKind = "roll" | "pint" | "petrol" | "camera" | "car" | "house";

type FixedTax = {
  label: string;
  amount: number;
  note: string;
};

type PurchaseItem = {
  id: ItemKind;
  name: string;
  category: string;
  price: number;
  image: string;
  vatRate?: number;
  fixedTaxes?: FixedTax[];
  description: string;
  assumption: string;
};

type TaxLine = {
  label: string;
  amount: number;
  note: string;
};

type Segment = {
  label: string;
  shortLabel: string;
  value: number;
  hours: number;
  color: string;
  fill: string;
};

type EquivalentScale = "small" | "medium" | "large" | "all";

type EquivalentKind = "time" | "days" | "visits" | "length" | "percent";

type StateEquivalent = {
  id: string;
  label: string;
  bucket: "Public service" | "Welfare" | "Transport" | "Mega project" | "Civic oddity";
  unitCost: number;
  unitLabel: "minute" | "day" | "visit" | "metre" | "project";
  kind: EquivalentKind;
  scale: EquivalentScale[];
  note: string;
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

const ANNUAL_WORK_HOURS = 37.5 * 52;
const DEFAULT_INCOME = 60_000;
const MIN_INCOME = 20_000;
const MAX_INCOME = 250_000;
const INCOME_STEP = 1_000;

const PURCHASE_IMAGE_BASE = "/labs/irish-purchase-tax-time-2026";
const CANVAS_BODY_FONT = `"Newsreader", Georgia, serif`;
const CANVAS_MONO_FONT = `"Geist Mono", "SFMono-Regular", Consolas, monospace`;

const ITEMS: PurchaseItem[] = [
  {
    id: "roll",
    name: "Chicken fillet roll",
    category: "Lunch",
    price: 6,
    image: `${PURCHASE_IMAGE_BASE}/roll.png`,
    vatRate: 0.135,
    description: "The humble deli counter benchmark.",
    assumption: "Assumes a prepared deli item charged at the 13.5% hospitality rate.",
  },
  {
    id: "pint",
    name: "Pint in a pub",
    category: "Hospitality",
    price: 6.5,
    image: `${PURCHASE_IMAGE_BASE}/pint.png`,
    vatRate: 0.23,
    fixedTaxes: [
      {
        label: "Alcohol excise",
        amount: 0.55,
        note: "Illustrative duty estimate for one pint.",
      },
    ],
    description: "A small purchase with a surprisingly tax-heavy tail.",
    assumption: "Assumes on-premise alcohol at 23% VAT plus a simplified excise estimate.",
  },
  {
    id: "petrol",
    name: "Tank of petrol",
    category: "Transport",
    price: 108,
    image: `${PURCHASE_IMAGE_BASE}/petrol.png`,
    vatRate: 0.23,
    fixedTaxes: [
      {
        label: "Fuel excise and carbon charge",
        amount: 33,
        note: "Illustrative 60 litre tank estimate before supplier margins.",
      },
    ],
    description: "A weekly-ish transport cost where tax is very visible.",
    assumption: "Assumes 60 litres at EUR1.80 per litre, with VAT plus simplified excise/carbon charges.",
  },
  {
    id: "camera",
    name: "Mirrorless camera",
    category: "Gear",
    price: 1_600,
    image: `${PURCHASE_IMAGE_BASE}/camera.png`,
    vatRate: 0.23,
    description: "A discretionary purchase at the standard VAT rate.",
    assumption: "Assumes a new camera body or kit bought retail in Ireland at 23% VAT.",
  },
  {
    id: "car",
    name: "New family car",
    category: "Motoring",
    price: 38_000,
    image: `${PURCHASE_IMAGE_BASE}/car.png`,
    vatRate: 0.23,
    fixedTaxes: [
      {
        label: "VRT",
        amount: 4_950,
        note: "Illustrative 15% VRT-style estimate for a mid-emissions car.",
      },
    ],
    description: "The big-ticket example where VAT and VRT stack quickly.",
    assumption: "Assumes a new car with standard VAT and an illustrative VRT amount already inside the sticker price.",
  },
  {
    id: "house",
    name: "Home purchase",
    category: "Housing",
    price: 424_200,
    image: `${PURCHASE_IMAGE_BASE}/house.png`,
    fixedTaxes: [
      {
        label: "Stamp duty",
        amount: 4_200,
        note: "1% stamp duty on a EUR420,000 residential purchase.",
      },
    ],
    description: "A lifetime-scale purchase, shown with stamp duty rather than ordinary VAT.",
    assumption:
      "Assumes a EUR420,000 residential property plus 1% stamp duty. New builds, second homes, and higher bands can differ.",
  },
];

const STATE_EQUIVALENTS: StateEquivalent[] = [
  {
    id: "nurse-time",
    label: "Nurse time",
    bucket: "Public service",
    unitCost: 55 / 60,
    unitLabel: "minute",
    kind: "time",
    scale: ["small", "medium"],
    note: "Using a rough EUR55/hour fully-loaded cost.",
  },
  {
    id: "teacher-time",
    label: "Teacher time",
    bucket: "Public service",
    unitCost: 50 / 60,
    unitLabel: "minute",
    kind: "time",
    scale: ["medium"],
    note: "Using a rough EUR50/hour fully-loaded cost.",
  },
  {
    id: "gp-visit",
    label: "GP subsidy equivalent",
    bucket: "Public service",
    unitCost: 60,
    unitLabel: "visit",
    kind: "visits",
    scale: ["medium"],
    note: "Treats a subsidised GP visit as roughly EUR60.",
  },
  {
    id: "state-pension",
    label: "State Pension",
    bucket: "Welfare",
    unitCost: 299.3 / 7,
    unitLabel: "day",
    kind: "days",
    scale: ["small", "large"],
    note: "Based on the 2026 weekly contributory rate.",
  },
  {
    id: "jobseeker",
    label: "Jobseeker payment",
    bucket: "Welfare",
    unitCost: 254 / 7,
    unitLabel: "day",
    kind: "days",
    scale: ["small", "large"],
    note: "Based on the 2026 weekly adult rate.",
  },
  {
    id: "bus-route",
    label: "City bus route",
    bucket: "Transport",
    unitCost: 125 / 60,
    unitLabel: "minute",
    kind: "time",
    scale: ["medium"],
    note: "Uses a broad EUR125/hour operating-cost placeholder.",
  },
  {
    id: "cycle-lane",
    label: "Urban cycle lane",
    bucket: "Transport",
    unitCost: 2_000_000 / 1_000,
    unitLabel: "metre",
    kind: "length",
    scale: ["medium", "large"],
    note: "Based on a rough EUR2m/km urban scheme.",
  },
  {
    id: "luas-track",
    label: "Luas-style track",
    bucket: "Transport",
    unitCost: 100_000_000 / 1_000,
    unitLabel: "metre",
    kind: "length",
    scale: ["large"],
    note: "Uses a round EUR100m/km light-rail estimate.",
  },
  {
    id: "motorway",
    label: "M50-style works",
    bucket: "Transport",
    unitCost: 30_000_000 / 1_000,
    unitLabel: "metre",
    kind: "length",
    scale: ["large"],
    note: "Uses a rough EUR30m/km motorway-works estimate.",
  },
  {
    id: "traffic-light",
    label: "Traffic light crossing",
    bucket: "Civic oddity",
    unitCost: 125_000,
    unitLabel: "project",
    kind: "percent",
    scale: ["small", "medium"],
    note: "Compared with a rough EUR125k signalised crossing.",
  },
  {
    id: "road-paint",
    label: "White road paint",
    bucket: "Civic oddity",
    unitCost: 3,
    unitLabel: "metre",
    kind: "length",
    scale: ["small"],
    note: "Very rough EUR3/metre line-paint placeholder.",
  },
  {
    id: "childrens-hospital",
    label: "Children's hospital",
    bucket: "Mega project",
    unitCost: 2_240_000_000,
    unitLabel: "project",
    kind: "percent",
    scale: ["small", "large"],
    note: "Compared with the roughly EUR2.24bn approved budget.",
  },
];

const EQUIVALENT_IDS_BY_SCALE: Record<Exclude<EquivalentScale, "all">, string[]> = {
  small: ["nurse-time", "jobseeker", "childrens-hospital"],
  medium: ["teacher-time", "bus-route", "cycle-lane"],
  large: ["state-pension", "luas-track", "childrens-hospital"],
};

function formatCurrency(value: number, maximumFractionDigits = 0) {
  return value.toLocaleString("en-IE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits,
  });
}

function getCurrencyFractionDigits(value: number) {
  return Math.abs(value) < 100 ? 2 : 0;
}

function formatPercent(value: number, maximumFractionDigits = 0) {
  return `${value.toLocaleString("en-IE", { maximumFractionDigits })}%`;
}

function formatWorkTime(hours: number) {
  if (hours < 1) {
    return `${Math.max(1, Math.round(hours * 60))} min`;
  }

  if (hours < 24) {
    return `${hours.toFixed(hours < 10 ? 1 : 0)} h`;
  }

  return `${(hours / 7.5).toFixed(1)} days`;
}

function formatApproxNumber(value: number, maximumFractionDigits = 1) {
  return value.toLocaleString("en-IE", {
    maximumFractionDigits,
  });
}

function formatEquivalentTime(minutes: number, label?: string) {
  const ofLabel = label ? ` of ${label.toLowerCase()}` : "";

  if (minutes < 1) {
    return `less than 1 minute${ofLabel}`;
  }

  if (minutes < 60) {
    return `${formatApproxNumber(minutes, minutes < 10 ? 1 : 0)} minutes${ofLabel}`;
  }

  const hours = minutes / 60;
  return `${formatApproxNumber(hours, hours < 10 ? 1 : 0)} hours${ofLabel}`;
}

function formatEquivalentDays(days: number, label: string) {
  if (days < 1) {
    return `${formatApproxNumber(days, 1)} days of ${label}`;
  }

  if (days < 14) {
    return `${formatApproxNumber(days, days < 10 ? 1 : 0)} days of ${label}`;
  }

  const weeks = days / 7;
  return `${formatApproxNumber(weeks, weeks < 10 ? 1 : 0)} weeks of ${label}`;
}

function formatEquivalentVisits(visits: number) {
  if (visits < 1) {
    return `${formatApproxNumber(visits, 1)} GP visits`;
  }

  return `${formatApproxNumber(visits, visits < 10 ? 1 : 0)} GP visits`;
}

function formatEquivalentLength(metres: number, label: string) {
  if (metres < 0.01) {
    return `${formatApproxNumber(metres * 1_000, 1)} mm of ${label}`;
  }

  if (metres < 1) {
    return `${formatApproxNumber(metres * 100, 1)} cm of ${label}`;
  }

  return `${formatApproxNumber(metres, metres < 10 ? 1 : 0)} metres of ${label}`;
}

function formatEquivalentPercent(projectShare: number, label: string) {
  const percent = projectShare * 100;
  const digits = percent < 0.0001 ? 8 : percent < 0.01 ? 6 : percent < 1 ? 4 : 1;
  return `${formatPercent(percent, digits)} of ${label}`;
}

function getEquivalentValue(equivalent: StateEquivalent, totalTax: number) {
  const units = totalTax / equivalent.unitCost;

  if (equivalent.kind === "time") {
    return formatEquivalentTime(units, equivalent.label);
  }

  if (equivalent.kind === "days") {
    return formatEquivalentDays(units, equivalent.label);
  }

  if (equivalent.kind === "visits") {
    return formatEquivalentVisits(units);
  }

  if (equivalent.kind === "length") {
    return formatEquivalentLength(units, equivalent.label);
  }

  return formatEquivalentPercent(units, equivalent.label);
}

function getEquivalentScale(totalTax: number): Exclude<EquivalentScale, "all"> {
  if (totalTax < 25) {
    return "small";
  }

  if (totalTax < 1_000) {
    return "medium";
  }

  return "large";
}

function getStateEquivalents(totalTax: number) {
  const scale = getEquivalentScale(totalTax);

  return EQUIVALENT_IDS_BY_SCALE[scale]
    .map((id) => STATE_EQUIVALENTS.find((equivalent) => equivalent.id === id))
    .filter((equivalent): equivalent is StateEquivalent => Boolean(equivalent))
    .map((equivalent) => ({
      ...equivalent,
      value: getEquivalentValue(equivalent, totalTax),
    }));
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

  const prsi =
    grossIncome > TAX_RULES_2026.prsiThreshold ? grossIncome * TAX_RULES_2026.prsiRate : 0;
  const total = paye + usc + prsi;

  return { paye, usc, prsi, total };
}

function getPurchaseTaxLines(item: PurchaseItem): TaxLine[] {
  const lines: TaxLine[] = [];

  if (item.vatRate) {
    lines.push({
      label: `VAT at ${formatPercent(item.vatRate * 100, 1)}`,
      amount: item.price - item.price / (1 + item.vatRate),
      note: "Estimated VAT included in the displayed purchase price.",
    });
  }

  for (const tax of item.fixedTaxes ?? []) {
    lines.push(tax);
  }

  return lines;
}

function clampIncome(value: number) {
  return Math.max(MIN_INCOME, Math.min(MAX_INCOME, Math.round(value / INCOME_STEP) * INCOME_STEP));
}

function readIncomeParam(): number | null {
  const raw = new URLSearchParams(window.location.search).get("income");
  if (raw === null) {
    return null;
  }

  const income = Number(raw);
  return Number.isFinite(income) && income > 0 ? clampIncome(income) : null;
}

function readItemParam(): ItemKind | null {
  const item = new URLSearchParams(window.location.search).get("item");
  return ITEMS.some((candidate) => candidate.id === item) ? (item as ItemKind) : null;
}

function drawRoundedRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const clampedRadius = Math.min(radius, width / 2, height / 2);

  context.beginPath();
  context.moveTo(x + clampedRadius, y);
  context.lineTo(x + width - clampedRadius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + clampedRadius);
  context.lineTo(x + width, y + height - clampedRadius);
  context.quadraticCurveTo(x + width, y + height, x + width - clampedRadius, y + height);
  context.lineTo(x + clampedRadius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - clampedRadius);
  context.lineTo(x, y + clampedRadius);
  context.quadraticCurveTo(x, y, x + clampedRadius, y);
  context.closePath();
}

function drawText(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  options: {
    color?: string;
    font?: string;
    align?: CanvasTextAlign;
    baseline?: CanvasTextBaseline;
  } = {},
) {
  context.fillStyle = options.color ?? "#1c1917";
  context.font = options.font ?? `32px ${CANVAS_BODY_FONT}`;
  context.textAlign = options.align ?? "left";
  context.textBaseline = options.baseline ?? "alphabetic";
  context.fillText(text, x, y);
}

function drawFittedText(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  options: {
    color?: string;
    fontSize?: number;
    minFontSize?: number;
    fontWeight?: number;
    fontFamily?: string;
    align?: CanvasTextAlign;
    baseline?: CanvasTextBaseline;
  } = {},
) {
  let fontSize = options.fontSize ?? 32;
  const minFontSize = options.minFontSize ?? 20;
  const fontWeight = options.fontWeight ?? 700;
  const fontFamily = options.fontFamily ?? CANVAS_BODY_FONT;

  context.textAlign = options.align ?? "left";
  context.textBaseline = options.baseline ?? "alphabetic";
  context.fillStyle = options.color ?? "#1c1917";
  context.font = `${fontWeight} ${fontSize}px ${fontFamily}`;

  while (context.measureText(text).width > maxWidth && fontSize > minFontSize) {
    fontSize -= 2;
    context.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
  }

  context.fillText(text, x, y);
}

function drawWrappedText(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number,
  options: {
    color?: string;
    font?: string;
  } = {},
) {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  context.font = options.font ?? `32px ${CANVAS_BODY_FONT}`;
  context.fillStyle = options.color ?? "#1c1917";
  context.textAlign = "left";
  context.textBaseline = "alphabetic";

  for (const word of words) {
    const nextLine = currentLine ? `${currentLine} ${word}` : word;

    if (context.measureText(nextLine).width <= maxWidth || !currentLine) {
      currentLine = nextLine;
      continue;
    }

    lines.push(currentLine);
    currentLine = word;

    if (lines.length === maxLines) {
      break;
    }
  }

  if (currentLine && lines.length < maxLines) {
    lines.push(currentLine);
  }

  lines.forEach((line, index) => {
    const isLastVisibleLine = index === maxLines - 1 && words.join(" ").length > lines.join(" ").length;
    context.fillText(isLastVisibleLine ? `${line.replace(/\s+\S+$/, "")}...` : line, x, y + index * lineHeight);
  });
}

function drawTickBracket(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  side: "above" | "below",
) {
  const tick = 8;
  const line = "rgba(10, 10, 10, 0.4)";
  const mark = "rgba(10, 10, 10, 0.45)";

  context.strokeStyle = line;
  context.lineWidth = 1;
  context.beginPath();
  context.moveTo(x, y);
  context.lineTo(x + width, y);
  context.stroke();

  context.fillStyle = mark;
  if (side === "above") {
    context.fillRect(x, y - tick, 1, tick);
    context.fillRect(x + width - 1, y - tick, 1, tick);
  } else {
    context.fillRect(x, y, 1, tick);
    context.fillRect(x + width - 1, y, 1, tick);
  }
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

type EarningsBarProps = {
  segments: Segment[];
  grossRequired: number;
  itemPrice: number;
  totalTax: number;
  currencyDigits: number;
  itemPriceShare: number;
  taxStartShare: number;
};

function EarningsBar({
  segments,
  grossRequired,
  itemPrice,
  totalTax,
  currencyDigits,
  itemPriceShare,
  taxStartShare,
}: EarningsBarProps) {
  const priceWidth = Math.max(0, Math.min(100, itemPriceShare));
  const taxWidth = Math.max(0, Math.min(100, 100 - taxStartShare));

  return (
    <div
      className="mb-9"
      role="img"
      aria-label={`Earnings breakdown: purchase price ${formatCurrency(itemPrice, currencyDigits)} and total tax ${formatCurrency(totalTax, currencyDigits)} out of ${formatCurrency(grossRequired, getCurrencyFractionDigits(grossRequired))} gross earnings.`}
    >
      <div className="relative mb-1.5 h-12">
        <div
          className="absolute top-0 left-0 box-border h-full border-b border-[color:var(--foreground)]/40"
          style={{ width: `${priceWidth}%` }}
        >
          <span className="absolute bottom-[-1px] left-0 h-2 w-px bg-[color:var(--foreground)]/45" aria-hidden="true" />
          <span className="absolute right-0 bottom-[-1px] h-2 w-px bg-[color:var(--foreground)]/45" aria-hidden="true" />
          <div className="absolute inset-x-0 top-0 flex items-baseline gap-3">
            <span className="text-[1.35rem] font-medium tracking-tight text-[color:var(--foreground)]">
              {formatCurrency(itemPrice, currencyDigits)}
            </span>
            <span className="font-mono text-[0.72rem] uppercase tracking-[0.12em] text-[color:var(--foreground)]">
              Purchase price
            </span>
          </div>
        </div>
      </div>

      <div className="flex h-3 w-full" aria-hidden="true">
        {segments.map((segment) => (
          <span
            key={segment.label}
            className="block h-full"
            style={{
              width: `${(segment.value / Math.max(grossRequired, 0.01)) * 100}%`,
              background: segment.fill,
            }}
            title={`${segment.label}: ${formatCurrency(segment.value, currencyDigits)}`}
          />
        ))}
      </div>

      <div className="relative mt-1.5 h-12">
        <div
          className="absolute top-0 right-0 box-border h-full border-t border-[color:var(--foreground)]/40"
          style={{ width: `${taxWidth}%` }}
        >
          <span className="absolute top-[-1px] left-0 h-2 w-px bg-[color:var(--foreground)]/45" aria-hidden="true" />
          <span className="absolute top-[-1px] right-0 h-2 w-px bg-[color:var(--foreground)]/45" aria-hidden="true" />
          <div className="absolute inset-x-0 bottom-0 flex items-baseline justify-end gap-3">
            <span className="font-mono text-[0.72rem] uppercase tracking-[0.12em] text-[color:var(--foreground)]">
              Total tax
            </span>
            <span className="text-[1.35rem] font-medium tracking-tight text-[color:var(--foreground)]">
              {formatCurrency(totalTax, currencyDigits)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function IrishPurchaseTaxTime2026() {
  const [grossIncome, setGrossIncome] = useState(DEFAULT_INCOME);
  const [selectedId, setSelectedId] = useState<ItemKind>("roll");
  const [shareStatus, setShareStatus] = useState<"idle" | "sharing" | "shared" | "fallback" | "error">("idle");

  // Seed editable state from URL params after mount. Reading the URL during the
  // initial render would diverge from the server-rendered defaults and break hydration,
  // so this one-shot sync intentionally calls setState inside an effect.
  useEffect(() => {
    const income = readIncomeParam();
    if (income !== null) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setGrossIncome(income);
    }

    const item = readItemParam();
    if (item !== null) {
      setSelectedId(item);
    }
  }, []);

  const selectedItem = ITEMS.find((item) => item.id === selectedId) ?? ITEMS[0];

  const result = useMemo(() => {
    const annualTaxes = calculateIncomeTaxes(grossIncome);
    const netAnnual = Math.max(0, grossIncome - annualTaxes.total);
    const netRate = netAnnual / grossIncome;
    const grossHourly = grossIncome / ANNUAL_WORK_HOURS;
    const purchaseTaxes = getPurchaseTaxLines(selectedItem);
    const purchaseTaxTotal = purchaseTaxes.reduce((total, line) => total + line.amount, 0);
    const preTaxItemPrice = Math.max(0, selectedItem.price - purchaseTaxTotal);
    const grossRequired = selectedItem.price / Math.max(netRate, 0.01);
    const incomeTaxToEarn = Math.max(0, grossRequired - selectedItem.price);
    const totalTax = incomeTaxToEarn + purchaseTaxTotal;
    const totalWorkHours = grossRequired / grossHourly;
    const incomeTaxHours = incomeTaxToEarn / grossHourly;
    const purchaseTaxHours = purchaseTaxTotal / grossHourly;
    const itemHours = preTaxItemPrice / grossHourly;
    const totalTaxHours = incomeTaxHours + purchaseTaxHours;
    const totalTaxPercent = (totalTax / grossRequired) * 100;
    const annualScale = grossRequired / grossIncome;

    const incomeTaxLines: TaxLine[] = [
      {
        label: "Income tax",
        amount: annualTaxes.paye * annualScale,
        note: "PAYE income tax allocated across the gross earnings needed for this purchase.",
      },
      {
        label: "USC",
        amount: annualTaxes.usc * annualScale,
        note: "USC allocated across the gross earnings needed for this purchase.",
      },
      {
        label: "PRSI",
        amount: annualTaxes.prsi * annualScale,
        note: "Employee PRSI allocated across the gross earnings needed for this purchase.",
      },
    ];

    const segments: Segment[] = [
      {
        label: "Item before direct purchase tax",
        shortLabel: "Item",
        value: preTaxItemPrice,
        hours: itemHours,
        color: "bg-emerald-500",
        fill: "#10b981",
      },
      {
        label: "Purchase tax",
        shortLabel: "Purchase tax",
        value: purchaseTaxTotal,
        hours: purchaseTaxHours,
        color: "bg-amber-500",
        fill: "#f59e0b",
      },
      {
        label: "Income tax to earn it",
        shortLabel: "Income tax",
        value: incomeTaxToEarn,
        hours: incomeTaxHours,
        color: "bg-rose-500",
        fill: "#f43f5e",
      },
    ];

    return {
      annualTaxes,
      netAnnual,
      netRate,
      grossHourly,
      purchaseTaxes,
      purchaseTaxTotal,
      preTaxItemPrice,
      grossRequired,
      incomeTaxToEarn,
      totalTax,
      totalWorkHours,
      incomeTaxHours,
      purchaseTaxHours,
      itemHours,
      totalTaxHours,
      totalTaxPercent,
      incomeTaxLines,
      segments,
    };
  }, [grossIncome, selectedItem]);

  const selectedCurrencyDigits = getCurrencyFractionDigits(selectedItem.price);
  const grossRequiredCurrencyDigits = getCurrencyFractionDigits(result.grossRequired);
  const itemShare = (result.preTaxItemPrice / result.grossRequired) * 100;
  const transactionPriceShare = (selectedItem.price / result.grossRequired) * 100;
  const taxedFraction = (1 - result.netRate) * 100;
  const stateEquivalents = getStateEquivalents(result.totalTax);

  const getShareUrl = () => {
    const url = new URL(window.location.href);
    url.searchParams.set("item", selectedItem.id);
    url.searchParams.set("income", String(grossIncome));
    return url.toString();
  };

  const createShareImageBlob = async () => {
    await document.fonts?.ready;

    const width = 1200;
    const height = 920;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Could not create share image.");
    }

    context.fillStyle = "#faf9f6";
    context.fillRect(0, 0, width, height);

    const cardX = 72;
    const cardY = 56;
    const cardWidth = 1056;
    const cardHeight = 794;
    const contentX = 120;
    const contentWidth = 960;

    context.save();
    context.shadowColor = "rgba(0, 0, 0, 0.18)";
    context.shadowBlur = 40;
    context.shadowOffsetY = 18;
    drawRoundedRect(context, cardX, cardY, cardWidth, cardHeight, 44);
    context.fillStyle = "#ffffff";
    context.fill();
    context.restore();

    context.strokeStyle = "#e7e5e4";
    context.lineWidth = 2;
    drawRoundedRect(context, cardX, cardY, cardWidth, cardHeight, 44);
    context.stroke();

    drawText(context, selectedItem.category, contentX, 134, {
      font: `700 17px ${CANVAS_MONO_FONT}`,
      color: "#047857",
    });

    drawFittedText(context, selectedItem.name, contentX, 204, 620, {
      fontSize: 70,
      minFontSize: 46,
      fontWeight: 700,
      color: "#1c1917",
    });

    drawWrappedText(context, selectedItem.description, contentX, 254, 610, 33, 2, {
      font: `400 27px ${CANVAS_BODY_FONT}`,
      color: "#57534e",
    });

    drawRoundedRect(context, 806, 104, 274, 112, 28);
    context.fillStyle = "#fafaf9";
    context.fill();
    context.strokeStyle = "#e7e5e4";
    context.stroke();
    drawText(context, "Gross salary", 834, 146, {
      font: `700 15px ${CANVAS_MONO_FONT}`,
      color: "#78716c",
    });
    drawText(context, formatCurrency(grossIncome), 834, 190, {
      font: `700 43px ${CANVAS_BODY_FONT}`,
      color: "#1c1917",
    });

    drawRoundedRect(context, contentX, 314, contentWidth, 488, 30);
    context.fillStyle = "#fafaf9";
    context.fill();
    context.strokeStyle = "#e7e5e4";
    context.lineWidth = 2;
    context.stroke();

    drawText(context, "Where your earnings go", 160, 378, {
      font: `700 35px ${CANVAS_BODY_FONT}`,
      color: "#1c1917",
    });

    drawRoundedRect(context, 770, 342, 270, 100, 24);
    context.fillStyle = "#ffffff";
    context.fill();
    context.strokeStyle = "#e7e5e4";
    context.stroke();
    drawText(context, "Total earnings", 796, 374, {
      font: `700 14px ${CANVAS_MONO_FONT}`,
      color: "#047857",
    });
    drawFittedText(
      context,
      formatCurrency(result.grossRequired, grossRequiredCurrencyDigits),
      796,
      418,
      150,
      {
        fontSize: 38,
        minFontSize: 25,
        fontWeight: 700,
        color: "#1c1917",
      },
    );
    drawText(context, formatWorkTime(result.totalWorkHours), 1012, 414, {
      font: `600 21px ${CANVAS_BODY_FONT}`,
      color: "#57534e",
      align: "right",
    });

    const barX = 160;
    const barY = 538;
    const barWidth = 880;
    const barHeight = 48;
    const canvasTransactionPriceShare = selectedItem.price / result.grossRequired;
    const canvasTotalTaxShare = result.totalTax / result.grossRequired;
    const priceWidth = Math.max(0, Math.min(barWidth, canvasTransactionPriceShare * barWidth));
    const taxWidth = Math.max(0, Math.min(barWidth, canvasTotalTaxShare * barWidth));
    const taxX = barX + barWidth - taxWidth;

    const purchasePriceLabel = formatCurrency(selectedItem.price, selectedCurrencyDigits);
    drawFittedText(context, purchasePriceLabel, barX, 492, Math.max(120, priceWidth * 0.58), {
      fontSize: 28,
      minFontSize: 18,
      fontWeight: 500,
      color: "#1c1917",
    });
    const purchasePriceWidth = context.measureText(purchasePriceLabel).width;
    drawText(context, "PURCHASE PRICE", barX + purchasePriceWidth + 16, 490, {
      font: `400 13px ${CANVAS_MONO_FONT}`,
      color: "#1c1917",
    });
    drawTickBracket(context, barX, 522, priceWidth, "above");

    let segmentX = barX;
    for (const segment of result.segments) {
      const segmentWidth = (segment.value / result.grossRequired) * barWidth;
      context.fillStyle = segment.fill;
      context.fillRect(segmentX, barY, segmentWidth, barHeight);
      segmentX += segmentWidth;
    }

    drawTickBracket(context, taxX, 598, taxWidth, "below");
    const totalTaxLabel = formatCurrency(result.totalTax, selectedCurrencyDigits);
    drawFittedText(context, totalTaxLabel, taxX + taxWidth, 640, Math.max(120, taxWidth * 0.58), {
      fontSize: 28,
      minFontSize: 18,
      fontWeight: 500,
      color: "#1c1917",
      align: "right",
    });
    const totalTaxWidth = context.measureText(totalTaxLabel).width;
    drawText(context, "TOTAL TAX", taxX + taxWidth - totalTaxWidth - 16, 638, {
      font: `400 13px ${CANVAS_MONO_FONT}`,
      color: "#1c1917",
      align: "right",
    });

    result.segments.forEach((segment, index) => {
      const x = 160 + index * 296;
      const y = 674;
      drawRoundedRect(context, x, y, 270, 90, 22);
      context.fillStyle = "#ffffff";
      context.fill();
      context.strokeStyle = "#e7e5e4";
      context.stroke();

      drawRoundedRect(context, x + 24, y + 22, 14, 14, 7);
      context.fillStyle = segment.fill;
      context.fill();
      drawText(context, segment.shortLabel, x + 50, y + 36, {
        font: `700 22px ${CANVAS_BODY_FONT}`,
        color: "#292524",
      });
      drawFittedText(context, formatCurrency(segment.value, selectedCurrencyDigits), x + 24, y + 70, 116, {
        fontSize: 27,
        minFontSize: 18,
        fontWeight: 700,
        color: "#1c1917",
      });
      drawFittedText(context, formatWorkTime(segment.hours), x + 244, y + 70, 96, {
        fontSize: 18,
        minFontSize: 14,
        fontWeight: 600,
        color: "#57534e",
        align: "right",
      });
    });

    return new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
          return;
        }

        reject(new Error("Could not create share image."));
      }, "image/png");
    });
  };

  const handleShare = async () => {
    setShareStatus("sharing");

    try {
      const shareUrl = getShareUrl();
      const blob = await createShareImageBlob();
      const file = new File([blob], `purchase-tax-time-${selectedItem.id}.png`, { type: "image/png" });
      const shareData = {
        title: `What did ${selectedItem.name.toLowerCase()} really cost?`,
        text: `${selectedItem.name}: ${formatWorkTime(result.totalWorkHours)} gross work, with ${formatPercent(result.totalTaxPercent)} paid in tax.`,
        url: shareUrl,
        files: [file],
      };

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share(shareData);
        setShareStatus("shared");
        return;
      }

      if (navigator.share) {
        await navigator.share({
          title: shareData.title,
          text: shareData.text,
          url: shareData.url,
        });
        downloadBlob(blob, file.name);
        setShareStatus("fallback");
        return;
      }

      await navigator.clipboard?.writeText(shareUrl);
      downloadBlob(blob, file.name);
      setShareStatus("fallback");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        setShareStatus("idle");
        return;
      }

      setShareStatus("error");
    }
  };

  return (
    <div className="mx-auto max-w-[1280px] px-6 pt-10 pb-28 sm:px-8 lg:px-12">
      <Link
        href="/labs"
        className="mb-12 inline-block font-mono text-[0.62rem] uppercase tracking-[0.2em] text-[color:var(--text-muted)] transition-colors hover:text-[color:var(--foreground)]"
      >
        ← Back to Labs
      </Link>

      <header className="mb-12 border-b border-[color:var(--rule-color)] pb-10">
        <p className="mb-4 font-mono text-[0.62rem] uppercase tracking-[0.22em] text-[color:var(--text-muted)]">
          Irish Tax Lens - 2026 assumptions
        </p>
        <h1 className="mb-5 text-[clamp(3rem,6vw,5.2rem)] font-light leading-[0.94] tracking-[-0.02em] text-[color:var(--foreground)]">
          What Did That Really Cost?
        </h1>
        <p className="max-w-[640px] text-[1.1rem] font-light leading-[1.7] text-[color:var(--text-muted)] italic">
          See how much working time goes to the thing itself, the tax charged when you buy it, and
          the income taxes paid before your wages became spending money.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[136px_minmax(0,1fr)] lg:gap-0">
        <nav
          className="box-content w-full border-[color:var(--rule-color)] lg:w-[104px] lg:border-r lg:pr-8"
          aria-label="Purchases"
        >
          <p className="mb-3 font-mono text-[0.58rem] uppercase tracking-[0.2em] text-[color:var(--text-muted)]">
            Purchases
          </p>
          <div className="grid grid-cols-3 gap-3 lg:grid-cols-1 lg:gap-0">
            {ITEMS.map((item, index) => {
              const isSelected = item.id === selectedItem.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedId(item.id)}
                  className={`w-full border-b border-transparent py-2.5 text-left transition-colors lg:w-[104px] ${
                    index > 0 ? "lg:border-t lg:border-[color:var(--rule-color)]" : ""
                  } ${
                    isSelected
                      ? "border-b-[#F4CA16] text-[color:var(--foreground)]"
                      : "text-[color:var(--text-muted)] hover:text-[color:var(--foreground)]"
                  }`}
                >
                  <span className="relative mb-2 block aspect-square w-full overflow-hidden lg:w-[104px]">
                    <Image
                      src={item.image}
                      alt=""
                      fill
                      sizes="104px"
                      className={`object-contain transition-opacity ${isSelected ? "opacity-100" : "opacity-55"}`}
                    />
                  </span>
                  <span className="block text-[0.9rem] leading-snug">{item.name}</span>
                </button>
              );
            })}
          </div>
        </nav>

        <article className="min-w-0 lg:pl-12">
          <div className="grid gap-7 border-[color:var(--rule-color)] md:grid-cols-[minmax(0,1.4fr)_minmax(220px,0.9fr)] md:gap-10">
            <div className="min-w-0 border-[color:var(--rule-color)] md:border-r md:pr-8">
              <p className="mb-3 font-mono text-[0.62rem] uppercase tracking-[0.22em] text-[color:var(--text-muted)]">
                {selectedItem.category}
              </p>
              <h2 className="mb-5 text-[clamp(2.8rem,5vw,4.5rem)] font-normal leading-none tracking-[-0.025em] text-[color:var(--foreground)]">
                {selectedItem.name}
              </h2>
              <p className="max-w-[520px] text-[1.2rem] leading-[1.75] text-[color:var(--text-body-rgb)]">
                {selectedItem.description}
              </p>
              <p className="mt-3 max-w-[520px] text-[0.88rem] leading-relaxed text-[color:var(--text-muted)]">
                * {selectedItem.assumption}
              </p>
            </div>

            <aside className="min-w-0">
              <div className="font-mono text-[0.58rem] uppercase tracking-[0.18em] text-[color:var(--text-muted)]">
                Gross salary
              </div>
              <div className="mt-2 mb-4 text-[2.4rem] font-light tracking-[-0.03em] text-[color:var(--foreground)]">
                {formatCurrency(grossIncome)}
              </div>
              <label className="mb-5 block">
                <span className="sr-only">Gross salary</span>
                <input
                  type="range"
                  min={MIN_INCOME}
                  max={MAX_INCOME}
                  step={INCOME_STEP}
                  value={grossIncome}
                  onChange={(event) => setGrossIncome(clampIncome(Number(event.target.value)))}
                  className="w-full accent-[color:var(--foreground)]"
                />
              </label>
              <div className="grid grid-cols-2 gap-5 border-t border-[color:var(--rule-color)] pt-4">
                <div>
                  <div className="mb-1.5 font-mono text-[0.55rem] uppercase tracking-[0.16em] text-[color:var(--text-muted)]">
                    Taxed fraction
                  </div>
                  <div className="text-[1.7rem] tracking-[-0.02em] text-[color:var(--foreground)]">
                    {formatPercent(taxedFraction)}
                  </div>
                </div>
                <div>
                  <div className="mb-1.5 font-mono text-[0.55rem] uppercase tracking-[0.16em] text-[color:var(--text-muted)]">
                    Gross hourly
                  </div>
                  <div className="text-[1.7rem] tracking-[-0.02em] text-[color:var(--foreground)]">
                    {formatCurrency(result.grossHourly, 2)}
                  </div>
                </div>
              </div>
            </aside>
          </div>

          <section className="mt-9 border-t border-[color:var(--rule-color)] pt-7">
            <div className="mb-2 flex flex-wrap items-baseline justify-between gap-4">
              <h3 className="text-[1.6rem] font-normal tracking-[-0.015em] text-[color:var(--foreground)]">
                Where your earnings go
              </h3>
              <div className="flex flex-col items-start gap-1 sm:items-end">
                <button
                  type="button"
                  onClick={handleShare}
                  disabled={shareStatus === "sharing"}
                  className="border-b border-[#F4CA16] pb-0.5 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-[color:var(--foreground)] transition-opacity hover:opacity-70 disabled:cursor-wait disabled:opacity-60"
                >
                  {shareStatus === "sharing" ? "Preparing..." : "Share result"}
                </button>
                {shareStatus !== "idle" && shareStatus !== "sharing" ? (
                  <p className="max-w-64 text-left text-xs leading-relaxed text-[color:var(--text-muted)] sm:text-right">
                    {shareStatus === "shared"
                      ? "Shared with a summary image."
                      : shareStatus === "fallback"
                        ? "Link copied or shared, and the summary image was downloaded."
                        : "Could not share this result. Try again."}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="mb-8 flex items-end gap-6">
              <span className="text-[clamp(3.2rem,6vw,5rem)] font-light leading-[0.9] tracking-[-0.04em] text-[color:var(--foreground)]">
                {formatCurrency(result.grossRequired, grossRequiredCurrencyDigits)}
              </span>
              <span className="font-mono text-[0.65rem] uppercase leading-[1.35] tracking-[0.16em] text-[color:var(--text-muted)]">
                Total earnings
                <br />
                {formatWorkTime(result.totalWorkHours)} of work
              </span>
            </div>

            <EarningsBar
              segments={result.segments}
              grossRequired={result.grossRequired}
              itemPrice={selectedItem.price}
              totalTax={result.totalTax}
              currencyDigits={selectedCurrencyDigits}
              itemPriceShare={transactionPriceShare}
              taxStartShare={itemShare}
            />

            <div
              className="grid gap-x-3.5 border-t border-[color:var(--rule-color)] [grid-template-columns:14px_minmax(0,1fr)_5.5rem_5rem] sm:[grid-template-columns:14px_minmax(0,1fr)_5.5rem_5rem_5rem]"
              role="table"
              aria-label="Earnings breakdown"
            >
              <div
                className="col-span-full grid [grid-template-columns:subgrid] border-b border-[color:var(--rule-color)] pb-2.5 pt-3.5 font-mono text-[0.55rem] uppercase tracking-[0.16em] text-[color:var(--text-muted)]"
                role="row"
              >
                <span aria-hidden="true" />
                <span>Segment</span>
                <span className="text-right">Cost</span>
                <span className="hidden text-right sm:block">Share</span>
                <span className="text-right">Time</span>
              </div>
              {result.segments.map((segment) => {
                const share = (segment.value / Math.max(result.grossRequired, 0.01)) * 100;
                return (
                  <div
                    key={segment.label}
                    className="col-span-full grid [grid-template-columns:subgrid] items-baseline border-b border-[color:var(--rule-color)] py-3.5"
                    role="row"
                  >
                    <span
                      className="h-2.5 w-2.5 self-center rounded-full"
                      style={{ background: segment.fill }}
                      aria-hidden="true"
                    />
                    <span className="text-[1.05rem] text-[color:var(--foreground)]">{segment.shortLabel}</span>
                    <span className="text-right text-[1.15rem] font-medium tracking-tight text-[color:var(--foreground)] tabular-nums">
                      {formatCurrency(segment.value, selectedCurrencyDigits)}
                    </span>
                    <span className="hidden text-right font-mono text-[0.78rem] tracking-[0.08em] text-[color:var(--text-muted)] tabular-nums sm:block">
                      {formatPercent(share, 1)}
                    </span>
                    <span className="text-right font-mono text-[0.78rem] tracking-[0.08em] text-[color:var(--text-muted)] tabular-nums">
                      {formatWorkTime(segment.hours)}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="mt-10">
            <h3 className="mb-2 text-[1.6rem] font-normal tracking-[-0.015em] text-[color:var(--foreground)]">
              What could the state buy with this tax?
            </h3>
            <p className="mb-7 text-[0.98rem] leading-relaxed text-[color:var(--text-muted)]">
              Very rough scale comparisons, not earmarked spending.
            </p>
            <div className="grid gap-6 md:grid-cols-3 md:gap-0">
              {stateEquivalents.map((equivalent, index) => (
                <article
                  key={equivalent.id}
                  className={`pt-1 md:pr-7 ${
                    index > 0 ? "md:border-l md:border-[color:var(--rule-color)] md:pl-7" : ""
                  }`}
                >
                  <p className="mb-3 font-mono text-[0.55rem] uppercase tracking-[0.16em] text-[color:var(--text-muted)]">
                    {equivalent.bucket}
                  </p>
                  <p className="text-[1.55rem] leading-snug tracking-[-0.02em] text-[color:var(--foreground)]">
                    {equivalent.value}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <details className="group mt-16 border-t border-[color:var(--rule-color)]">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-7 [&::-webkit-details-marker]:hidden">
              <div>
                <h3 className="text-[1.4rem] font-normal text-[color:var(--foreground)]">Additional detail</h3>
                <p className="mt-1.5 text-[color:var(--text-muted)]">
                  Show the tax line items and model assumptions.
                </p>
              </div>
              <span className="font-mono text-[0.58rem] uppercase tracking-[0.14em] text-[color:var(--text-muted)]">
                <span className="group-open:hidden">Expand</span>
                <span className="hidden group-open:inline">Collapse</span>
              </span>
            </summary>

            <div className="pb-10">
              <h4 className="mt-2 mb-3 text-[1.15rem] font-normal text-[color:var(--foreground)]">
                State-equivalent assumptions
              </h4>
              <p className="mb-4 text-[color:var(--text-muted)] leading-relaxed">
                These are order-of-magnitude comparisons used for the state-scale cards.
              </p>
              <div className="grid gap-x-10 md:grid-cols-2">
                {STATE_EQUIVALENTS.map((equivalent) => (
                  <div
                    key={equivalent.id}
                    className="flex items-start justify-between gap-4 border-b border-[color:var(--rule-color)] py-3 text-[0.95rem]"
                  >
                    <span>
                      {equivalent.label}
                      <span className="mt-1 block text-[0.8rem] text-[color:var(--text-muted)]">
                        {equivalent.bucket} · {equivalent.note}
                      </span>
                    </span>
                    <span className="shrink-0 whitespace-nowrap">
                      {formatCurrency(equivalent.unitCost, getCurrencyFractionDigits(equivalent.unitCost))} /{" "}
                      {equivalent.unitLabel}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-2 grid gap-x-10 md:grid-cols-2">
                <div>
                  <h4 className="mt-8 mb-3 text-[1.15rem] font-normal text-[color:var(--foreground)]">
                    Purchase tax detail
                  </h4>
                  <div className="flex items-center justify-between gap-4 border-b border-[color:var(--rule-color)] py-3 text-[0.95rem]">
                    <span>Item before these direct taxes</span>
                    <span>{formatCurrency(result.preTaxItemPrice, selectedCurrencyDigits)}</span>
                  </div>
                  {result.purchaseTaxes.map((line) => (
                    <div
                      key={line.label}
                      className="flex items-start justify-between gap-4 border-b border-[color:var(--rule-color)] py-3 text-[0.95rem]"
                    >
                      <span>
                        {line.label}
                        <span className="mt-1 block text-[0.8rem] text-[color:var(--text-muted)]">{line.note}</span>
                      </span>
                      <span className="shrink-0">{formatCurrency(line.amount, selectedCurrencyDigits)}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <h4 className="mt-8 mb-3 text-[1.15rem] font-normal text-[color:var(--foreground)]">
                    Income tax detail
                  </h4>
                  {result.incomeTaxLines.map((line) => (
                    <div
                      key={line.label}
                      className="flex items-start justify-between gap-4 border-b border-[color:var(--rule-color)] py-3 text-[0.95rem]"
                    >
                      <span>
                        {line.label}
                        <span className="mt-1 block text-[0.8rem] text-[color:var(--text-muted)]">{line.note}</span>
                      </span>
                      <span className="shrink-0">{formatCurrency(line.amount, selectedCurrencyDigits)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <section className="mt-9 border-t-2 border-[#F4CA16] pt-6">
                <div className="flex gap-3">
                  <Info className="mt-0.5 h-5 w-5 shrink-0 text-[color:var(--foreground)]" />
                  <div>
                    <h4 className="text-[1.15rem] font-normal text-[color:var(--foreground)]">
                      What this model leaves out
                    </h4>
                    <p className="mt-2.5 max-w-[720px] leading-[1.7] text-[color:var(--text-body-rgb)]">
                      These are illustrative direct taxes only. The model does not estimate supplier
                      VAT, corporate tax, employer PRSI, import duties, local charges, discounts,
                      deductions, pension contributions, or product-specific reliefs. It is meant to
                      make the time trade-off legible, not to produce a tax bill.
                    </p>
                    <div className="mt-5 grid gap-5 text-[0.92rem] leading-relaxed text-[color:var(--text-body-rgb)] md:grid-cols-3">
                      <p>
                        <strong className="font-medium text-[color:var(--foreground)]">Income:</strong>{" "}
                        single PAYE employee, 2026 illustrative PAYE, USC, and employee PRSI.
                      </p>
                      <p>
                        <strong className="font-medium text-[color:var(--foreground)]">Time:</strong>{" "}
                        37.5 paid hours per week for 52 weeks, before holidays or unpaid time.
                      </p>
                      <p>
                        <strong className="font-medium text-[color:var(--foreground)]">Purchases:</strong>{" "}
                        direct transaction taxes are simplified and displayed beside each item.
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </details>
        </article>
      </div>
    </div>
  );
}
