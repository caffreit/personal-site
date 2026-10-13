export type TransitTheogonyVariantId = "left-to-right" | "ring";

export type TransitTheogonyVariant = {
  id: TransitTheogonyVariantId;
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

const BASE = "/posters/transit-theogony";

export const TRANSIT_THEOGONY_VARIANTS: TransitTheogonyVariant[] = [
  {
    id: "left-to-right",
    label: "Left to right",
    blurb:
      "Lineages run across the sheet in generation bands — landscape A2, with a legend for the lines and how to read stations and interchanges.",
    width: 3215.002402020876,
    height: 2273.3500000000004,
    displaySrc: `${BASE}/transit_theogony_ltr.svg`,
    showTransparency: false,
    downloads: {
      pdf: {
        href: `${BASE}/transit_theogony_ltr_A2.pdf`,
        label: "PDF (A2 print)",
      },
      svg: {
        href: `${BASE}/transit_theogony_ltr.svg`,
        label: "SVG (vector)",
      },
      png: {
        href: `${BASE}/transit_theogony_ltr_A2_300dpi.png`,
        label: "PNG (300 DPI)",
      },
    },
  },
  {
    id: "ring",
    label: "Ring",
    blurb:
      "The same lineages closed into a ring — portrait A2, reading around the circle instead of left to right.",
    width: 2653.5,
    height: 3752.615687757008,
    displaySrc: `${BASE}/transit_theogony_ring.svg`,
    showTransparency: false,
    downloads: {
      pdf: {
        href: `${BASE}/transit_theogony_ring_A2.pdf`,
        label: "PDF (A2 print)",
      },
      svg: {
        href: `${BASE}/transit_theogony_ring.svg`,
        label: "SVG (vector)",
      },
      png: {
        href: `${BASE}/transit_theogony_ring_A2_300dpi.png`,
        label: "PNG (300 DPI)",
      },
    },
  },
];
