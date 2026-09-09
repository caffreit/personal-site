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

/**
 * The one solid element the labs allow. An accent-underlined mono label is too
 * quiet for the action a whole form leads up to, so the primary commit is a
 * filled accent block that inverts to an outline on hover.
 */
export const labPrimaryButton =
  "inline-flex items-center justify-center gap-2.5 border border-[#F4CA16] bg-[#F4CA16] px-8 py-4 font-mono text-[0.8rem] uppercase tracking-[0.14em] text-[#0A0A0A] transition-colors hover:bg-transparent hover:text-[color:var(--foreground)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F4CA16] disabled:cursor-not-allowed disabled:opacity-40";

/** Quieter sibling of labTextButton for secondary actions such as "Back". */
export const labQuietButton =
  "border-b border-[color:var(--rule-color)] pb-0.5 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-[color:var(--text-muted)] transition-colors hover:border-[#F4CA16] hover:text-[color:var(--foreground)] disabled:cursor-not-allowed disabled:opacity-40";

/**
 * Form fields are the one place the labs draw a full enclosure: an underline
 * alone reads as just another hairline rule, so an editable box needs its own
 * outline to be findable. Kept to a hairline and an almost-invisible wash so it
 * still belongs to the ruled language.
 */
const labFieldBox =
  "border border-[color:color-mix(in_srgb,var(--foreground)_16%,transparent)] bg-[color:color-mix(in_srgb,var(--foreground)_3%,transparent)] transition-colors hover:border-[color:color-mix(in_srgb,var(--foreground)_32%,transparent)]";

/** Single-element field, e.g. a select. */
export const labField = `w-full appearance-none rounded-none px-3 py-2 text-[1rem] text-[color:var(--foreground)] focus:border-[#F4CA16] focus:outline-none ${labFieldBox}`;

/** Field box that hosts an input plus a unit affix. */
export const labFieldGroup = `flex items-center gap-2 rounded-none px-3 focus-within:border-[#F4CA16] ${labFieldBox}`;

/** The input inside a labFieldGroup; the group draws the border. */
export const labFieldInput =
  "w-full min-w-0 rounded-none border-0 bg-transparent py-2 text-[1rem] tabular-nums text-[color:var(--foreground)] focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none";

/** Unit marker sitting inside the field, e.g. EUR or %. */
export const labFieldAffix =
  "shrink-0 font-mono text-[0.75rem] text-[color:var(--text-muted)]";

export const labFieldLabel =
  "mb-1.5 block text-[0.82rem] tracking-[0.01em] text-[color:var(--text-muted)]";

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
