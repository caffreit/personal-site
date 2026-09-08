// Shared class strings for the labs' editorial design language, distilled from
// the purchase-tax lab (src/components/tools/IrishPurchaseTaxTime2026.tsx),
// which remains the visual reference. Everything is expressed in the theme's
// CSS variables so a lab inherits dark mode without dark: variants, and chrome
// is drawn with hairline rules rather than cards, fills, or shadows.

export const LAB_ACCENT = "#F4CA16";

export const labShell = "mx-auto max-w-[1280px] px-6 pt-10 pb-28 sm:px-8 lg:px-12";

export const labBackLink =
  "mb-12 inline-block font-mono text-[0.62rem] uppercase tracking-[0.2em] text-[color:var(--text-muted)] transition-colors hover:text-[color:var(--foreground)]";

export const labEyebrow =
  "font-mono text-[0.62rem] uppercase tracking-[0.22em] text-[color:var(--text-muted)]";

export const labRailLabel =
  "font-mono text-[0.58rem] uppercase tracking-[0.2em] text-[color:var(--text-muted)]";

export const labMicroLabel =
  "font-mono text-[0.55rem] uppercase tracking-[0.16em] text-[color:var(--text-muted)]";

export const labDisplayTitle =
  "text-[clamp(3rem,6vw,5.2rem)] font-light leading-[0.94] tracking-[-0.02em] text-[color:var(--foreground)]";

export const labLede =
  "max-w-[640px] text-[1.1rem] font-light leading-[1.7] text-[color:var(--text-muted)] italic";

export const labSectionHeading =
  "text-[1.6rem] font-normal tracking-[-0.015em] text-[color:var(--foreground)]";

export const labSubheading = "text-[1.15rem] font-normal text-[color:var(--foreground)]";

export const labRule = "border-[color:var(--rule-color)]";

/** Sidebar-scale figure, e.g. a single headline number beside a slider. */
export const labFigure =
  "text-[2.4rem] font-light tracking-[-0.03em] text-[color:var(--foreground)]";

/** Hero-scale figure, used once per lab at most. */
export const labFigureLarge =
  "text-[clamp(3.2rem,6vw,5rem)] font-light leading-[0.9] tracking-[-0.04em] text-[color:var(--foreground)]";

/** Ledger-cell figure. */
export const labValue =
  "text-[1.15rem] font-medium tracking-tight tabular-nums text-[color:var(--foreground)]";

export const labBodyText = "text-[1.05rem] leading-[1.7] text-[color:var(--text-body-rgb)]";

export const labMutedText = "text-[0.92rem] leading-relaxed text-[color:var(--text-muted)]";

export const labFootnote = "text-[0.88rem] leading-relaxed text-[color:var(--text-muted)]";

/** Accent-underlined mono action, the replacement for the old filled pills. */
export const labTextButton =
  "border-b border-[#F4CA16] pb-0.5 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-[color:var(--foreground)] transition-opacity hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-40";

/** Quieter sibling of labTextButton for secondary actions such as "Back". */
export const labQuietButton =
  "border-b border-[color:var(--rule-color)] pb-0.5 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-[color:var(--text-muted)] transition-colors hover:border-[#F4CA16] hover:text-[color:var(--foreground)] disabled:cursor-not-allowed disabled:opacity-40";

/** Underline-only form field. */
export const labField =
  "w-full border-0 border-b border-[color:var(--rule-color)] bg-transparent py-1.5 text-[0.98rem] text-[color:var(--foreground)] transition-colors focus:border-[#F4CA16] focus:outline-none";

export const labFieldLabel =
  "block font-mono text-[0.55rem] uppercase tracking-[0.16em] text-[color:var(--text-muted)]";

export const labSlider = "w-full accent-[color:var(--foreground)]";

export const labLink =
  "border-b border-[color:var(--rule-color)] transition-colors hover:border-[#F4CA16]";

/** Mono tab label, selected state marked by the accent rule beneath it. */
export function labTab(active: boolean) {
  return `border-b pb-1 font-mono text-[0.6rem] uppercase tracking-[0.16em] transition-colors ${
    active
      ? "border-[#F4CA16] text-[color:var(--foreground)]"
      : "border-transparent text-[color:var(--text-muted)] hover:text-[color:var(--foreground)]"
  }`;
}

/**
 * Divider for a row of sibling columns: every column but the first carries the
 * rule, so the group reads as one ruled band with no outer border.
 */
export function labColumnRule(index: number) {
  return index > 0 ? "md:border-l md:border-[color:var(--rule-color)] md:pl-7" : "";
}
