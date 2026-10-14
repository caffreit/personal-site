import { posterGallery, type GenealogyPosterVariant } from "./posterProducts";

export const GREEK_THEOGONY_VARIANTS: [GenealogyPosterVariant, ...GenealogyPosterVariant[]] = [
  {
    id: "outlines",
    label: "Outlines",
    blurb: "Crisp outlines trace the divine family, with colour grouping the gods and their lineages. Printed on a white background.",
    orientation: "portrait",
    gallery: posterGallery("/posters/greek-theogony/outlines"),
    order: { status: "coming-soon" },
  },
  {
    id: "translucent",
    label: "Translucent",
    blurb: "Soft translucent panels bring depth to the same family tree. Printed on a white background.",
    orientation: "portrait",
    gallery: posterGallery("/posters/greek-theogony/translucent"),
    order: { status: "coming-soon" },
  },
];
