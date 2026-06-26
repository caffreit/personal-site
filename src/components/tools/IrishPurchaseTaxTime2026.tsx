"use client";

import Link from "next/link";
import { ArrowLeft, Clock, Info, ReceiptText, WalletCards } from "lucide-react";
import { useMemo, useState } from "react";

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

const ANNUAL_WORK_HOURS = 37.5 * 52;
const DEFAULT_INCOME = 60_000;

const ITEMS: PurchaseItem[] = [
  {
    id: "roll",
    name: "Chicken fillet roll",
    category: "Lunch",
    price: 5.5,
    vatRate: 0.135,
    description: "The humble deli counter benchmark.",
    assumption: "Assumes a prepared deli item charged at the 13.5% hospitality rate.",
  },
  {
    id: "pint",
    name: "Pint in a pub",
    category: "Hospitality",
    price: 6.5,
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
    vatRate: 0.23,
    description: "A discretionary purchase at the standard VAT rate.",
    assumption: "Assumes a new camera body or kit bought retail in Ireland at 23% VAT.",
  },
  {
    id: "car",
    name: "New family car",
    category: "Motoring",
    price: 38_000,
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

function formatCurrency(value: number, maximumFractionDigits = 0) {
  return value.toLocaleString("en-IE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits,
  });
}

function formatPercent(value: number) {
  return `${Math.round(value)}%`;
}

function formatWorkTime(hours: number) {
  if (hours < 1) {
    return `${Math.max(1, Math.round(hours * 60))} min`;
  }

  if (hours < 24) {
    return `${hours.toFixed(hours < 10 ? 1 : 0)} h`;
  }

  return `${(hours / 7.5).toFixed(1)} working days`;
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
      label: `VAT at ${formatPercent(item.vatRate * 100)}`,
      amount: item.price - item.price / (1 + item.vatRate),
      note: "Estimated VAT included in the displayed purchase price.",
    });
  }

  for (const tax of item.fixedTaxes ?? []) {
    lines.push(tax);
  }

  return lines;
}

function clampPercent(value: number) {
  return `${Math.max(0, Math.min(100, value)).toFixed(1)}%`;
}

function ItemIllustration({ kind }: { kind: ItemKind }) {
  const common = "drop-shadow-[0_12px_18px_rgba(0,0,0,0.18)]";

  if (kind === "roll") {
    return (
      <svg viewBox="0 0 96 72" aria-hidden="true" className={common}>
        <rect x="10" y="28" width="76" height="24" rx="12" fill="#f6d8a8" />
        <rect x="17" y="33" width="62" height="14" rx="7" fill="#c47a5a" />
        <path d="M25 30l7-14 9 14M46 30l7-18 9 18M66 30l6-12 8 12" fill="#f8f5f0" />
        <path d="M22 38h50" stroke="#8f4f34" strokeWidth="4" strokeLinecap="round" />
      </svg>
    );
  }

  if (kind === "pint") {
    return (
      <svg viewBox="0 0 96 72" aria-hidden="true" className={common}>
        <path d="M32 14h29l-4 46H36z" fill="#f4ca16" />
        <path d="M35 10h25a6 6 0 016 6v3H29v-3a6 6 0 016-6z" fill="#f8f5f0" />
        <path d="M62 24h8a9 9 0 010 18h-10" fill="none" stroke="#f8f5f0" strokeWidth="6" />
        <path d="M38 23h16" stroke="#d4a017" strokeWidth="5" strokeLinecap="round" />
      </svg>
    );
  }

  if (kind === "petrol") {
    return (
      <svg viewBox="0 0 96 72" aria-hidden="true" className={common}>
        <rect x="24" y="13" width="34" height="48" rx="6" fill="#c47a5a" />
        <rect x="31" y="20" width="20" height="13" rx="2" fill="#f8f5f0" />
        <path d="M58 23h10l6 8v22a6 6 0 01-12 0V40" fill="none" stroke="#d4a017" strokeWidth="6" />
        <path d="M35 45h13" stroke="#8f4f34" strokeWidth="5" strokeLinecap="round" />
      </svg>
    );
  }

  if (kind === "camera") {
    return (
      <svg viewBox="0 0 96 72" aria-hidden="true" className={common}>
        <rect x="17" y="24" width="62" height="36" rx="9" fill="#3f3a36" />
        <rect x="27" y="17" width="23" height="10" rx="4" fill="#c47a5a" />
        <circle cx="49" cy="42" r="15" fill="#d4a017" />
        <circle cx="49" cy="42" r="8" fill="#0a5c36" />
        <circle cx="69" cy="31" r="4" fill="#f8f5f0" />
      </svg>
    );
  }

  if (kind === "car") {
    return (
      <svg viewBox="0 0 96 72" aria-hidden="true" className={common}>
        <path d="M18 42l9-18h37l14 18v11H18z" fill="#c47a5a" />
        <path d="M33 28h25l8 12H27z" fill="#f8f5f0" />
        <circle cx="31" cy="55" r="8" fill="#302b28" />
        <circle cx="66" cy="55" r="8" fill="#302b28" />
        <path d="M20 44h55" stroke="#8f4f34" strokeWidth="4" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 96 72" aria-hidden="true" className={common}>
      <path d="M18 39l30-25 30 25v24H18z" fill="#c47a5a" />
      <path d="M27 39l21-17 21 17" fill="none" stroke="#8f4f34" strokeWidth="7" />
      <rect x="41" y="45" width="14" height="18" rx="2" fill="#f8f5f0" />
      <circle cx="68" cy="51" r="8" fill="#d4a017" />
    </svg>
  );
}

export default function IrishPurchaseTaxTime2026() {
  const [grossIncome, setGrossIncome] = useState(DEFAULT_INCOME);
  const [selectedId, setSelectedId] = useState<ItemKind>("roll");

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
      { label: "Item before direct purchase tax", value: preTaxItemPrice, color: "bg-emerald-500" },
      { label: "Purchase tax", value: purchaseTaxTotal, color: "bg-amber-500" },
      { label: "Income tax to earn it", value: incomeTaxToEarn, color: "bg-rose-500" },
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
      incomeTaxLines,
      segments,
    };
  }, [grossIncome, selectedItem]);

  return (
    <div className="mx-auto max-w-7xl px-4 pt-10 pb-24 sm:px-6 lg:px-8">
      <Link
        href="/labs"
        className="mb-8 inline-flex items-center gap-2 text-stone-500 transition-colors hover:text-stone-900"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="font-mono text-sm font-medium uppercase tracking-[0.2em]">Back to Labs</span>
      </Link>

      <header className="mb-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-4">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.3em] text-stone-500">
            Irish Tax Lens - 2026 assumptions
          </p>
          <h1 className="text-5xl font-black uppercase leading-[0.9] tracking-tight text-stone-900 sm:text-7xl">
            What Did That Really Cost?
          </h1>
          <p className="max-w-4xl text-lg leading-relaxed text-stone-600 sm:text-xl">
            Pick a purchase and see how much working time goes to the thing itself, the tax
            charged when you buy it, and the income taxes paid before your wages became spending
            money.
          </p>
        </div>

        <aside className="h-fit rounded-[2rem] border border-stone-200 bg-white p-5 shadow-[0_10px_40px_-25px_rgba(0,0,0,0.4)]">
          <label className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <span className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
                Gross salary
              </span>
              <span className="text-lg font-black text-stone-900">{formatCurrency(grossIncome)}</span>
            </div>
            <input
              type="range"
              min={20_000}
              max={250_000}
              step={1_000}
              value={grossIncome}
              onChange={(event) => setGrossIncome(Number(event.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-stone-200 accent-stone-900"
            />
          </label>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
              <p className="text-2xl font-black text-stone-900">
                {formatPercent(result.netRate * 100)}
              </p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
                Take-home ratio
              </p>
            </div>
            <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
              <p className="text-2xl font-black text-stone-900">
                {formatCurrency(result.grossHourly, 2)}
              </p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
                Gross hourly
              </p>
            </div>
          </div>
        </aside>
      </header>

      <section className="grid gap-6 lg:grid-cols-[19rem_minmax(0,1fr)]">
        <nav
          className="h-fit rounded-[2rem] border border-stone-200 bg-white p-4 shadow-[0_10px_40px_-25px_rgba(0,0,0,0.4)] lg:sticky lg:top-6"
          aria-label="Purchases"
        >
          <h2 className="mb-3 px-2 font-mono text-xs font-semibold uppercase tracking-[0.3em] text-stone-500">
            Purchases
          </h2>
          <div className="space-y-2">
            {ITEMS.map((item) => {
              const isSelected = item.id === selectedItem.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedId(item.id)}
                  className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition ${
                    isSelected
                      ? "border-emerald-300 bg-emerald-50 text-emerald-950"
                      : "border-transparent text-stone-700 hover:bg-stone-100"
                  }`}
                >
                  <span className="flex h-14 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#0A5C36]">
                    <ItemIllustration kind={item.id} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-black">{item.name}</span>
                    <span className="mt-1 block font-mono text-xs uppercase tracking-[0.16em] text-stone-500">
                      {formatCurrency(item.price)} - {item.category}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </nav>

        <article className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-[0_10px_40px_-25px_rgba(0,0,0,0.4)] sm:p-8">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_18rem]">
            <div>
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.3em] text-emerald-700">
                {selectedItem.category}
              </p>
              <h2 className="mt-3 text-4xl font-black leading-tight tracking-tight text-stone-900 sm:text-5xl">
                {selectedItem.name}
              </h2>
              <p className="mt-3 max-w-2xl text-lg leading-relaxed text-stone-600">
                {selectedItem.description}
              </p>
            </div>

            <div className="rounded-[1.5rem] border border-stone-200 bg-stone-50 p-5">
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
                Shelf or transaction price
              </p>
              <p className="mt-2 text-4xl font-black text-stone-900">
                {formatCurrency(selectedItem.price)}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">{selectedItem.assumption}</p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-stone-200 bg-stone-50 p-5">
              <Clock className="h-5 w-5 text-emerald-700" />
              <p className="mt-3 text-3xl font-black text-stone-900">
                {formatWorkTime(result.totalWorkHours)}
              </p>
              <p className="mt-1 text-sm font-semibold uppercase tracking-[0.14em] text-stone-500">
                Gross work needed
              </p>
            </div>
            <div className="rounded-2xl border border-stone-200 bg-stone-50 p-5">
              <ReceiptText className="h-5 w-5 text-amber-700" />
              <p className="mt-3 text-3xl font-black text-stone-900">
                {formatCurrency(result.purchaseTaxTotal, selectedItem.price < 100 ? 2 : 0)}
              </p>
              <p className="mt-1 text-sm font-semibold uppercase tracking-[0.14em] text-stone-500">
                Direct purchase tax
              </p>
            </div>
            <div className="rounded-2xl border border-stone-200 bg-stone-50 p-5">
              <WalletCards className="h-5 w-5 text-rose-700" />
              <p className="mt-3 text-3xl font-black text-stone-900">
                {formatCurrency(result.totalTax, selectedItem.price < 100 ? 2 : 0)}
              </p>
              <p className="mt-1 text-sm font-semibold uppercase tracking-[0.14em] text-stone-500">
                Total tax in the chain
              </p>
            </div>
          </div>

          <section className="mt-8 rounded-[1.5rem] border border-stone-200 bg-stone-50 p-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h3 className="text-xl font-black tracking-tight text-stone-900">
                  Where the gross earnings go
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-stone-600">
                  This splits the gross salary required to afford the selected purchase.
                </p>
              </div>
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
                {formatCurrency(result.grossRequired)} gross earnings
              </p>
            </div>

            <div className="mt-5 h-7 overflow-hidden rounded-full bg-white ring-1 ring-stone-200">
              {result.segments.map((segment) => (
                <div
                  key={segment.label}
                  className={`inline-block h-full ${segment.color}`}
                  style={{ width: clampPercent((segment.value / result.grossRequired) * 100) }}
                  title={`${segment.label}: ${formatCurrency(segment.value)}`}
                />
              ))}
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {result.segments.map((segment) => (
                <div key={segment.label} className="rounded-2xl border border-stone-200 bg-white p-4">
                  <div className="flex items-center gap-2">
                    <span className={`h-3 w-3 rounded-full ${segment.color}`} />
                    <p className="text-sm font-bold text-stone-800">{segment.label}</p>
                  </div>
                  <p className="mt-2 text-2xl font-black text-stone-900">
                    {formatCurrency(segment.value, selectedItem.price < 100 ? 2 : 0)}
                  </p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
                    {formatPercent((segment.value / result.grossRequired) * 100)} of gross earnings
                  </p>
                </div>
              ))}
            </div>
          </section>

          <div className="mt-6 grid gap-6 xl:grid-cols-2">
            <section className="rounded-[1.5rem] border border-stone-200 bg-white p-5">
              <h3 className="text-lg font-black tracking-tight text-stone-900">Purchase tax detail</h3>
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between gap-4 border-b border-stone-200 pb-3">
                  <span className="text-sm text-stone-600">Item before these direct taxes</span>
                  <span className="font-bold text-stone-900">
                    {formatCurrency(result.preTaxItemPrice, selectedItem.price < 100 ? 2 : 0)}
                  </span>
                </div>
                {result.purchaseTaxes.map((line) => (
                  <div key={line.label} className="border-b border-stone-200 pb-3 last:border-b-0">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm font-semibold text-stone-700">{line.label}</span>
                      <span className="font-bold text-stone-900">
                        {formatCurrency(line.amount, selectedItem.price < 100 ? 2 : 0)}
                      </span>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-stone-500">{line.note}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[1.5rem] border border-stone-200 bg-white p-5">
              <h3 className="text-lg font-black tracking-tight text-stone-900">Income tax detail</h3>
              <div className="mt-4 space-y-3">
                {result.incomeTaxLines.map((line) => (
                  <div key={line.label} className="border-b border-stone-200 pb-3 last:border-b-0">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm font-semibold text-stone-700">{line.label}</span>
                      <span className="font-bold text-stone-900">
                        {formatCurrency(line.amount, selectedItem.price < 100 ? 2 : 0)}
                      </span>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-stone-500">{line.note}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <section className="mt-6 rounded-[1.5rem] border border-amber-200 bg-amber-50 p-5">
            <div className="flex gap-3">
              <Info className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
              <div>
                <h3 className="font-black tracking-tight text-stone-900">What this model leaves out</h3>
                <p className="mt-2 leading-relaxed text-stone-700">
                  These are illustrative direct taxes only. The model does not estimate supplier
                  VAT, corporate tax, employer PRSI, import duties, local charges, discounts,
                  deductions, pension contributions, or product-specific reliefs. It is meant to
                  make the time trade-off legible, not to produce a tax bill.
                </p>
                <div className="mt-4 grid gap-3 text-sm text-stone-700 md:grid-cols-3">
                  <p>
                    <span className="font-bold text-stone-900">Income:</span> single PAYE employee,
                    2026 illustrative PAYE, USC, and employee PRSI.
                  </p>
                  <p>
                    <span className="font-bold text-stone-900">Time:</span> 37.5 paid hours per
                    week for 52 weeks, before holidays or unpaid time.
                  </p>
                  <p>
                    <span className="font-bold text-stone-900">Purchases:</span> direct transaction
                    taxes are simplified and displayed beside each item.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </article>
      </section>
    </div>
  );
}
