"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";

/**
 * Recharts chrome for the labs.
 *
 * Recharts forwards colour props straight through as SVG presentation
 * attributes, where `var(--rule-color)` is not resolved. So rather than pass
 * the variables through, resolve them off the document once and re-resolve
 * whenever the theme class on <html> changes.
 */

const LIGHT_THEME = {
  rule: "#d4d0c8",
  foreground: "#0A0A0A",
  muted: "rgba(0,0,0,0.45)",
  background: "#FFFFFF",
};

export type LabChartTheme = typeof LIGHT_THEME;

const TOKENS: Array<[keyof LabChartTheme, string]> = [
  ["rule", "--rule-color"],
  ["foreground", "--foreground"],
  ["muted", "--text-muted"],
  ["background", "--background"],
];

function readTheme(): LabChartTheme {
  const styles = getComputedStyle(document.documentElement);
  const resolved = { ...LIGHT_THEME };

  for (const [key, variable] of TOKENS) {
    const value = styles.getPropertyValue(variable).trim();
    if (value) {
      resolved[key] = value;
    }
  }

  return resolved;
}

export function useLabChartTheme(): LabChartTheme {
  // Light values are the server-rendered fallback; the first client effect
  // swaps in whatever the document actually resolves to.
  const [theme, setTheme] = useState<LabChartTheme>(LIGHT_THEME);

  useEffect(() => {
    const sync = () => setTheme(readTheme());
    sync();

    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "style"],
    });

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    media.addEventListener("change", sync);

    return () => {
      observer.disconnect();
      media.removeEventListener("change", sync);
    };
  }, []);

  return theme;
}

export const LAB_CHART_FONT_SIZE = 10;

export function labGridProps(theme: LabChartTheme) {
  return {
    stroke: theme.rule,
    strokeDasharray: "0",
    vertical: false,
  } as const;
}

export function labAxisProps(theme: LabChartTheme) {
  return {
    stroke: theme.rule,
    tickLine: false,
    tick: {
      fill: theme.muted,
      fontSize: LAB_CHART_FONT_SIZE,
      fontFamily: "var(--font-mono)",
      letterSpacing: "0.08em",
    },
  } as const;
}

/** Square-cornered tooltip drawn with a hairline rule, no shadow. */
export function LabTooltip({
  label,
  rows,
  note,
}: {
  label?: ReactNode;
  rows: Array<{ key: string; name: ReactNode; value: ReactNode; color?: string }>;
  note?: ReactNode;
}) {
  return (
    <div className="max-w-xs border border-[color:var(--rule-color)] bg-[color:var(--background)] px-3.5 py-3">
      {label ? (
        <p className="font-mono text-[0.55rem] uppercase tracking-[0.16em] text-[color:var(--text-muted)]">
          {label}
        </p>
      ) : null}
      <div className={label ? "mt-2 space-y-1.5" : "space-y-1.5"}>
        {rows.map((row) => (
          <div key={row.key} className="flex items-baseline justify-between gap-5">
            <span className="flex items-baseline gap-2 text-[0.9rem] text-[color:var(--foreground)]">
              {row.color ? (
                <span
                  className="mt-[0.3em] h-2 w-2 shrink-0 self-start rounded-full"
                  style={{ background: row.color }}
                  aria-hidden="true"
                />
              ) : null}
              {row.name}
            </span>
            <span className="shrink-0 text-[0.9rem] font-medium tabular-nums text-[color:var(--foreground)]">
              {row.value}
            </span>
          </div>
        ))}
      </div>
      {note ? (
        <p className="mt-2.5 border-t border-[color:var(--rule-color)] pt-2.5 text-[0.78rem] leading-relaxed text-[color:var(--text-muted)]">
          {note}
        </p>
      ) : null}
    </div>
  );
}

/** Mono legend row, used in place of the default Recharts legend. */
export function LabLegend({
  items,
  className = "",
  onSelect,
}: {
  items: Array<{ key: string; label: ReactNode; color: string; dimmed?: boolean }>;
  className?: string;
  onSelect?: (key: string) => void;
}) {
  return (
    <ul className={`flex flex-wrap gap-x-6 gap-y-2.5 ${className}`}>
      {items.map((item) => {
        const content = (
          <>
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ background: item.color, opacity: item.dimmed ? 0.35 : 1 }}
              aria-hidden="true"
            />
            <span
              className={`font-mono text-[0.58rem] uppercase tracking-[0.14em] ${
                item.dimmed ? "text-[color:var(--text-muted)]" : "text-[color:var(--foreground)]"
              }`}
            >
              {item.label}
            </span>
          </>
        );

        return (
          <li key={item.key}>
            {onSelect ? (
              <button
                type="button"
                onClick={() => onSelect(item.key)}
                className="flex items-center gap-2 transition-opacity hover:opacity-70"
              >
                {content}
              </button>
            ) : (
              <span className="flex items-center gap-2">{content}</span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
