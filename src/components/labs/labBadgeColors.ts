import type { CSSProperties } from "react";

// One hue per badge, reused by the generated cover, the badge word in each
// caption, and the filter row - so the filter row reads as the key to the
// colours without having to label itself as one.
const BADGE_HUE: Record<string, number> = {
  "Data Viz": 202,
  Civics: 96,
  SaMD: 272,
  "Google Maps": 22,
};

const FALLBACK_HUE = 45;

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

export function getBadgeHue(badge: string): number {
  return BADGE_HUE[badge] ?? FALLBACK_HUE;
}

export function getBadgeAccentVars(badge: string): CSSProperties {
  const hue = getBadgeHue(badge);
  return {
    "--badge-accent": `hsl(${hue} 55% 34%)`,
    "--badge-accent-dark": `hsl(${hue} 60% 68%)`,
    "--badge-rule": `hsl(${hue} 55% 34% / 0.4)`,
    "--badge-rule-dark": `hsl(${hue} 60% 68% / 0.4)`,
  } as CSSProperties;
}

// The second stop is nudged by the href hash so two labs sharing a badge are
// still distinguishable without breaking the badge's colour identity.
export function getTileGradient(href: string, badge: string): string {
  const hash = hashString(href);
  const hue = getBadgeHue(badge);
  const shift = 18 + (hash % 26);
  const angle = 120 + (hash % 5) * 15;
  return `linear-gradient(${angle}deg, hsl(${hue} 42% 40%) 0%, hsl(${
    (hue + shift) % 360
  } 38% 20%) 100%)`;
}
