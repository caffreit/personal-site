export type GreekTheogonyVariantId = "outlines" | "translucent";

export type GreekTheogonyVariant = {
  id: GreekTheogonyVariantId;
  label: string;
  blurb: string;
  /** A2 aspect ratio from export viewBox */
  width: number;
  height: number;
  displaySrc: string;
  downloads: {
    pdf: { href: string; label: string };
    svg: { href: string; label: string };
    png: { href: string; label: string };
  };
  /** Show a checkerboard behind the artwork */
  showTransparency: boolean;
};

const BASE = "/posters/greek-theogony";

const A2_WIDTH = 1424;
const A2_HEIGHT = 2013.8401128192875;

export const GREEK_THEOGONY_VARIANTS: GreekTheogonyVariant[] = [
  {
    id: "outlines",
    label: "Outlines",
    blurb:
      "Structure and lineage only — frameless A2 artboard, clean line work for reading the tree or home printing.",
    width: A2_WIDTH,
    height: A2_HEIGHT,
    displaySrc: `${BASE}/greek_theogony_frameless_outlines.svg`,
    showTransparency: false,
    downloads: {
      pdf: {
        href: `${BASE}/greek_theogony_frameless_outlines_A2.pdf`,
        label: "PDF (A2 print)",
      },
      svg: {
        href: `${BASE}/greek_theogony_frameless_outlines.svg`,
        label: "SVG (vector)",
      },
      png: {
        href: `${BASE}/greek_theogony_frameless_outlines_A2_300dpi.png`,
        label: "PNG (300 DPI)",
      },
    },
  },
  {
    id: "translucent",
    label: "Translucent",
    blurb:
      "Soft filled panels on a clear background — frameless crop with layers that read as depth without heavy ink.",
    width: A2_WIDTH,
    height: A2_HEIGHT,
    displaySrc: `${BASE}/greek_theogony_frameless.svg`,
    showTransparency: true,
    downloads: {
      pdf: {
        href: `${BASE}/greek_theogony_frameless_A2.pdf`,
        label: "PDF (A2 print)",
      },
      svg: {
        href: `${BASE}/greek_theogony_frameless.svg`,
        label: "SVG (vector)",
      },
      png: {
        href: `${BASE}/greek_theogony_frameless_A2_300dpi.png`,
        label: "PNG (300 DPI)",
      },
    },
  },
];
