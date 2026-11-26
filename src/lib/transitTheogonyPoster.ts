import { posterGallery, printMockupGallery, type GenealogyPosterVariant } from "./posterProducts";

export const TRANSIT_THEOGONY_VARIANTS: [GenealogyPosterVariant, ...GenealogyPosterVariant[]] = [
  {
    id: "ring",
    label: "Ring",
    blurb: "The Greek divine lineages arranged around a ring. A portrait A2 print with generations nested inside one another, on 200 gsm enhanced matte art paper.",
    orientation: "portrait",
    gallery: printMockupGallery("/posters/transit-theogony/ring"),
    order: { status: "coming-soon" },
  },
  {
    id: "left-to-right",
    label: "Left to right",
    blurb: "Follow the lineages across the sheet, from Chaos to the Olympians. Generation bands give this landscape map its rhythm.",
    orientation: "landscape",
    gallery: posterGallery("/posters/transit-theogony/left-to-right"),
    order: { status: "coming-soon" },
  },
];
