import { posterGallery, type GenealogyPosterVariant } from "./posterProducts";

export const TRANSIT_THEOGONY_VARIANTS: [GenealogyPosterVariant, ...GenealogyPosterVariant[]] = [
  {
    id: "left-to-right",
    label: "Left to right",
    blurb: "Follow the lineages across the sheet, from Chaos to the Olympians. Generation bands give this landscape map its rhythm.",
    orientation: "landscape",
    gallery: posterGallery("/posters/transit-theogony/left-to-right"),
    order: { status: "coming-soon" },
  },
  {
    id: "ring",
    label: "Ring",
    blurb: "The same lineages arranged around a ring. A portrait layout with generations nested inside one another.",
    orientation: "portrait",
    gallery: posterGallery("/posters/transit-theogony/ring"),
    order: { status: "coming-soon" },
  },
];
