"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { REDUCED_MOTION, useMediaQuery } from "./useMediaQuery";

/* The same maths as the full lab (IrishPurchaseTaxTime2026.tsx), stripped down to four items. */
const RULES = {
  srcop: 44000,
  credits: 4000,
  uscExempt: 13000,
  uscBands: [12012, 28700, 70044],
  uscRates: [0.005, 0.02, 0.03, 0.08],
  prsiRate: 0.0435,
  prsiThreshold: 18304,
};
const HOURS_PER_YEAR = 37.5 * 52;
const IMAGE_BASE = "/labs/irish-purchase-tax-time-2026";

export const PURCHASE_ITEMS = [
  { id: "roll", name: "a chicken fillet roll", label: "Roll €6", price: 6, vat: 0.135, fixed: 0 },
  { id: "pint", name: "a pint", label: "Pint €6.50", price: 6.5, vat: 0.23, fixed: 0.55 },
  { id: "petrol", name: "a tank of petrol", label: "Petrol €108", price: 108, vat: 0.23, fixed: 33 },
  { id: "camera", name: "a new camera", label: "Camera €1.6k", price: 1600, vat: 0.23, fixed: 0 },
] as const;

function incomeTax(gross: number) {
  const paye = Math.max(
    0,
    (gross <= RULES.srcop ? gross * 0.2 : RULES.srcop * 0.2 + (gross - RULES.srcop) * 0.4) - RULES.credits,
  );
  const [b1, b2, b3] = RULES.uscBands;
  const [r1, r2, r3, r4] = RULES.uscRates;
  let usc = 0;
  if (gross > RULES.uscExempt) {
    usc =
      Math.min(gross, b1) * r1 +
      Math.max(0, Math.min(gross, b2) - b1) * r2 +
      Math.max(0, Math.min(gross, b3) - b2) * r3 +
      Math.max(0, gross - b3) * r4;
  }
  const prsi = gross > RULES.prsiThreshold ? gross * RULES.prsiRate : 0;
  return paye + usc + prsi;
}

const num = (v: number) => (v < 10 ? +v.toFixed(1) : Math.round(v)).toLocaleString("en-IE");
const eur = (v: number) =>
  v.toLocaleString("en-IE", { style: "currency", currency: "EUR", maximumFractionDigits: v < 100 ? 2 : 0 });

function workTime(hours: number) {
  if (hours < 1) return `${Math.max(1, Math.round(hours * 60))} min`;
  if (hours < 24) return `${hours.toFixed(hours < 10 ? 1 : 0)} h`;
  return `${(hours / 7.5).toFixed(1)} days`;
}

const TAP = [{ transform: "scale(1)" }, { transform: "scale(.93)", offset: 0.4 }, { transform: "scale(1)" }];

type Props = {
  /** Index of the selected item; owned by the parent so the headline can name it. */
  itemIndex: number;
  onItemChange: (index: number) => void;
  /** True while the lab door is open: the demo only plays then. */
  active: boolean;
  /** Called the first time someone presses on the widget, so the door cycle can stop. */
  onEngage: () => void;
};

export default function PurchaseWidget({ itemIndex, onItemChange, active, onEngage }: Props) {
  const [income, setIncome] = useState(60000);
  const [used, setUsed] = useState(false);
  // with reduced motion there is no demo: the widget simply waits to be used
  const touched = useMediaQuery(REDUCED_MOTION) || used;
  const [hovering, setHovering] = useState(false);
  const [demo, setDemo] = useState(false);

  const widgetRef = useRef<HTMLDivElement>(null);
  const ghostRef = useRef<HTMLSpanElement>(null);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const indexRef = useRef(itemIndex);
  useEffect(() => {
    indexRef.current = itemIndex;
  }, [itemIndex]);

  const moveGhost = useCallback((index: number) => {
    const widget = widgetRef.current;
    const button = buttonRefs.current[index];
    const ghost = ghostRef.current;
    if (!widget || !button || !ghost) return;
    const w = widget.getBoundingClientRect();
    const r = button.getBoundingClientRect();
    ghost.style.transform = `translate(${r.left - w.left + r.width * 0.62}px, ${r.top - w.top + r.height * 0.58}px)`;
  }, []);

  // Demo mode: until someone uses the widget, a ghost finger taps through the items.
  useEffect(() => {
    if (!active || touched || hovering) return;

    let tapTimer: ReturnType<typeof setTimeout> | undefined;
    let interval: ReturnType<typeof setInterval> | undefined;

    const step = () => {
      const next = (indexRef.current + 1) % PURCHASE_ITEMS.length;
      moveGhost(next);
      tapTimer = setTimeout(() => {
        onItemChange(next);
        buttonRefs.current[next]?.animate(TAP, { duration: 500, easing: "cubic-bezier(.25,1,.5,1)" });
        ghostRef.current?.animate(
          [{ scale: 1 }, { scale: 0.7, offset: 0.4 }, { scale: 1 }],
          { duration: 500, easing: "ease-out" },
        );
      }, 650);
    };

    moveGhost(indexRef.current);
    const start = setTimeout(() => {
      setDemo(true);
      step();
      interval = setInterval(step, 2000);
    }, 1100);

    return () => {
      clearTimeout(start);
      clearTimeout(tapTimer);
      clearInterval(interval);
      setDemo(false);
    };
  }, [active, touched, hovering, moveGhost, onItemChange]);

  const item = PURCHASE_ITEMS[itemIndex];
  const netRate = (income - incomeTax(income)) / income;
  const hourly = income / HOURS_PER_YEAR;
  const vat = item.vat ? item.price - item.price / (1 + item.vat) : 0;
  const purchaseTax = vat + item.fixed;
  const grossNeeded = item.price / Math.max(netRate, 0.01);
  const incTax = grossNeeded - item.price;
  const totalTax = purchaseTax + incTax;
  const pre = item.price - purchaseTax;
  const pct = (v: number) => `${(v / grossNeeded) * 100}%`;

  const select = (index: number, focus = false) => {
    onItemChange(index);
    if (focus) buttonRefs.current[index]?.focus();
  };

  return (
    <div
      ref={widgetRef}
      className={`widget rise${touched ? " touched" : ""}${demo ? " demo" : ""}`}
      onPointerEnter={(e) => e.pointerType === "mouse" && setHovering(true)}
      onPointerLeave={(e) => e.pointerType === "mouse" && setHovering(false)}
      onPointerDown={() => {
        setUsed(true);
        onEngage();
      }}
      onKeyDown={() => setUsed(true)}
    >
      <span className="try">
        <i />
        Try it
      </span>
      <span className="ghost" ref={ghostRef} aria-hidden="true" />

      <div className="items" role="radiogroup" aria-label="Purchase">
        {PURCHASE_ITEMS.map((entry, i) => (
          <button
            key={entry.id}
            ref={(el) => {
              buttonRefs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={i === itemIndex}
            tabIndex={i === itemIndex ? 0 : -1}
            className={`item-btn${i === itemIndex ? " on" : ""}`}
            onClick={() => select(i)}
            onKeyDown={(e) => {
              const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
              if (!step) return;
              e.preventDefault();
              select((i + step + PURCHASE_ITEMS.length) % PURCHASE_ITEMS.length, true);
            }}
          >
            <Image src={`${IMAGE_BASE}/${entry.id}.webp`} alt="" width={148} height={148} />
            <span>{entry.label}</span>
          </button>
        ))}
      </div>

      <label className="slider">
        Salary{" "}
        <input
          type="range"
          min={20000}
          max={250000}
          step={1000}
          value={income}
          onChange={(e) => setIncome(+e.target.value)}
        />{" "}
        <output>{eur(income)}</output>
      </label>

      <div className="answer">
        <div className="big">
          <b>{workTime(grossNeeded / hourly)}</b>
          <span>
            of work. {workTime(totalTax / hourly)} of that is tax ({Math.round((totalTax / grossNeeded) * 100)}%).
          </span>
        </div>
        <div className="bar">
          <i className="b-item" style={{ width: pct(pre) }} />
          <i className="b-vat" style={{ width: pct(purchaseTax) }} />
          <i className="b-inc" style={{ width: pct(incTax) }} />
        </div>
        <div className="legend">
          <span>
            <i style={{ background: "var(--ink)" }} />
            The thing <b>{eur(pre)}</b>
          </span>
          <span>
            <i style={{ background: "var(--accent)" }} />
            VAT &amp; duty <b>{eur(purchaseTax)}</b>
          </span>
          <span>
            <i style={{ background: "var(--yellow)" }} />
            Income tax, USC, PRSI <b>{eur(incTax)}</b>
          </span>
        </div>
        <p className="equiv">
          {totalTax < 25 ? (
            <>
              That tax pays for about <b>{num(totalTax / (55 / 60))} minutes</b> of a nurse&rsquo;s time.
            </>
          ) : (
            <>
              That tax covers about <b>{num(totalTax / 60)} subsidised GP visits</b>.
            </>
          )}
        </p>
      </div>
    </div>
  );
}
