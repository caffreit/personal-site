export type PosterOrder =
  | { status: "coming-soon" }
  | { status: "available"; price: number; currency: string; checkoutUrl: string };

export type PosterGalleryImage = {
  src: string;
  label: string;
  caption: string;
};

export type GenealogyPosterVariant = {
  id: string;
  label: string;
  blurb: string;
  orientation: "portrait" | "landscape";
  gallery: [PosterGalleryImage, ...PosterGalleryImage[]];
  order: PosterOrder;
};

export function posterGallery(base: string): GenealogyPosterVariant["gallery"] {
  return [
    { src: `${base}/preview.webp`, label: "Whole poster", caption: "The complete design, shown as a small preview." },
    { src: `${base}/room.webp`, label: "On the wall", caption: "Illustrative room mockup. Poster sold unframed." },
    { src: `${base}/detail-1.webp`, label: "Detail 01", caption: "A closer look at the names and connections." },
    { src: `${base}/detail-2.webp`, label: "Detail 02", caption: "A second detail from the design." },
  ];
}
