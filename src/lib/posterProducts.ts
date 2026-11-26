export type PosterOrder =
  | { status: "coming-soon" }
  | { status: "available"; price: number; currency: string; checkoutUrl: string };

export type PosterGalleryImage = {
  src: string;
  label: string;
  caption: string;
  padded?: boolean;
  background?: string;
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
    { src: `${base}/preview.webp`, label: "Whole poster", caption: "The complete design, shown as a small preview.", padded: true },
    { src: `${base}/room.webp`, label: "On the wall", caption: "Illustrative room mockup. Poster sold unframed." },
    { src: `${base}/detail-1.webp`, label: "Detail 01", caption: "A closer look at the names and connections." },
    { src: `${base}/detail-2.webp`, label: "Detail 02", caption: "A second detail from the design." },
  ];
}

export function printMockupGallery(base: string): GenealogyPosterVariant["gallery"] {
  const background = "#ececec";
  return [
    { src: `${base}/head-on.webp`, label: "Head-on", caption: "A2 print on 200 gsm enhanced matte art paper. Poster sold unframed.", background },
    { src: `${base}/angled.webp`, label: "Angled", caption: "Angled view of the unframed A2 matte art print.", background },
    { src: `${base}/rolled.webp`, label: "Rolled", caption: "Rolled sheet showing the 200 gsm enhanced matte paper finish.", background },
    { src: `${base}/close-up.webp`, label: "Close-up", caption: "Close-up showing paper texture and print detail.", background },
  ];
}
