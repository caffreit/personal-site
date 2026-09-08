import Link from "next/link";
import { Info } from "lucide-react";
import type { ReactNode } from "react";

import {
  labBackLink,
  labEyebrow,
  labDisplayTitle,
  labFootnote,
  labLede,
  labMicroLabel,
  labRailLabel,
  labSectionHeading,
  labShell,
  labSubheading,
} from "./labTokens";

/**
 * Page container plus the back link every lab opens with. Lab content is laid
 * out directly against this measure - there is no card between the two.
 */
export function LabShell({ children }: { children: ReactNode }) {
  return (
    <div className={labShell}>
      <Link href="/labs" className={labBackLink}>
        ← Back to Labs
      </Link>
      {children}
    </div>
  );
}

export function LabHeader({
  eyebrow,
  title,
  lede,
}: {
  eyebrow: string;
  title: ReactNode;
  lede?: ReactNode;
}) {
  return (
    <header className="mb-12 border-b border-[color:var(--rule-color)] pb-10">
      <p className={`mb-4 ${labEyebrow}`}>{eyebrow}</p>
      <h1 className={`mb-5 ${labDisplayTitle}`}>{title}</h1>
      {lede ? <p className={labLede}>{lede}</p> : null}
    </header>
  );
}

/**
 * A section of the page. The leading rule is the only chrome; `action` sits on
 * the heading's baseline for controls that belong to the section itself.
 */
export function LabSection({
  heading,
  intro,
  action,
  className = "",
  children,
}: {
  heading?: ReactNode;
  intro?: ReactNode;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={`mt-9 border-t border-[color:var(--rule-color)] pt-7 ${className}`}>
      {heading ? (
        <div className="mb-5 flex flex-wrap items-baseline justify-between gap-4">
          <h2 className={labSectionHeading}>{heading}</h2>
          {action}
        </div>
      ) : null}
      {intro ? <p className={`-mt-2 mb-6 ${labFootnote}`}>{intro}</p> : null}
      {children}
    </section>
  );
}

/** The bordered left-hand column labs use for selector lists. */
export function LabRail({
  label,
  className = "",
  children,
}: {
  label: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <nav
      className={`border-[color:var(--rule-color)] lg:border-r lg:pr-8 ${className}`}
      aria-label={label}
    >
      <p className={`mb-3 ${labRailLabel}`}>{label}</p>
      {children}
    </nav>
  );
}

/**
 * Ledger table. Rows opt into the parent's column template with subgrid, so
 * every figure stays aligned without the row knowing the column widths.
 */
export function LabLedger({
  columns,
  headers,
  label,
  className = "",
  children,
}: {
  columns: string;
  headers?: ReactNode[];
  label: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`grid gap-x-3.5 border-t border-[color:var(--rule-color)] ${className}`}
      style={{ gridTemplateColumns: columns }}
      role="table"
      aria-label={label}
    >
      {headers ? (
        <div
          className={`col-span-full grid [grid-template-columns:subgrid] border-b border-[color:var(--rule-color)] pt-3.5 pb-2.5 ${labMicroLabel}`}
          role="row"
        >
          {headers.map((header, index) => (
            <span key={index} className={index === 0 ? undefined : "text-right"}>
              {header}
            </span>
          ))}
        </div>
      ) : null}
      {children}
    </div>
  );
}

export function LabLedgerRow({
  className = "",
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`col-span-full grid [grid-template-columns:subgrid] items-baseline border-b border-[color:var(--rule-color)] py-3.5 ${className}`}
      role="row"
    >
      {children}
    </div>
  );
}

/** Mono label over a light figure - the replacement for filled stat cards. */
export function LabStat({
  label,
  value,
  sub,
  className = "",
}: {
  label: ReactNode;
  value: ReactNode;
  sub?: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className={`mb-1.5 ${labMicroLabel}`}>{label}</div>
      <div className="text-[1.7rem] font-light tracking-[-0.02em] tabular-nums text-[color:var(--foreground)]">
        {value}
      </div>
      {sub ? <div className={`mt-1.5 ${labFootnote}`}>{sub}</div> : null}
    </div>
  );
}

/** Secondary detail, collapsed by default behind a mono Expand/Collapse. */
export function LabDetails({
  heading,
  summary,
  children,
}: {
  heading: string;
  summary?: string;
  children: ReactNode;
}) {
  return (
    <details className="group mt-16 border-t border-[color:var(--rule-color)]">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-7 [&::-webkit-details-marker]:hidden">
        <div>
          <h3 className={labSubheading}>{heading}</h3>
          {summary ? <p className={`mt-1.5 ${labFootnote}`}>{summary}</p> : null}
        </div>
        <span className="font-mono text-[0.58rem] uppercase tracking-[0.14em] text-[color:var(--text-muted)]">
          <span className="group-open:hidden">Expand</span>
          <span className="hidden group-open:inline">Collapse</span>
        </span>
      </summary>
      <div className="pb-10">{children}</div>
    </details>
  );
}

/** Caveat block, marked by the accent rule rather than a tinted panel. */
export function LabNote({
  heading,
  children,
  className = "",
}: {
  heading: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`border-t-2 border-[#F4CA16] pt-6 ${className}`}>
      <div className="flex gap-3">
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-[color:var(--foreground)]" aria-hidden="true" />
        <div className="min-w-0">
          <h3 className={labSubheading}>{heading}</h3>
          <div className="mt-2.5 max-w-[720px] text-[1rem] leading-[1.7] text-[color:var(--text-body-rgb)]">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}
