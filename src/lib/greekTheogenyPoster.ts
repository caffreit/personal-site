import { posterGallery, printMockupGallery, type GenealogyPosterVariant } from "./posterProducts";

export const GREEK_THEOGONY_VARIANTS: [GenealogyPosterVariant, ...GenealogyPosterVariant[]] = [
  {
    id: "translucent",
    label: "Frameless",
    blurb: "Soft translucent panels bring depth to the divine family tree. Printed on 200 gsm enhanced matte art paper.",
    orientation: "portrait",
    gallery: printMockupGallery("/posters/greek-theogony/translucent"),
    order: { status: "coming-soon" },
  },
  {
    id: "outlines",
    label: "Frameless outlines",
    blurb: "Crisp outlines trace the divine family, with colour grouping the gods and their lineages. Printed on a white background.",
    orientation: "portrait",
    gallery: posterGallery("/posters/greek-theogony/outlines"),
    order: { status: "coming-soon" },
  },
];
