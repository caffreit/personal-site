import { getAvailablePrints } from "@/lib/photos";
import { PrintsListingView, type PrintListingItem } from "@/components/prints/PrintsListingView";

export const metadata = {
  title: "The Print Room — Limited Edition Prints",
  description:
    "A curated selection of limited-edition fine art prints. Archival materials, meticulous reproduction, enduring beauty.",
};

export default function PrintsPage() {
  const prints = getAvailablePrints();

  const items: PrintListingItem[] = prints.map(
    ({ id, album, image, print, remaining }) => ({
      id,
      title: image.caption || image.filename.replace(/\.[^.]+$/, ""),
      albumTitle: album.title,
      albumId: album.id,
      imageSrc: `/photos/${encodeURIComponent(album.id)}/${encodeURIComponent(image.filename)}`,
      width: image.width,
      height: image.height,
      quote: print.quote,
      editionSold: print.sold,
      editionSize: print.editionSize,
      remaining,
      price: print.price,
      currency: print.currency,
      sizes: print.sizes,
    }),
  );

  return <PrintsListingView prints={items} />;
}
