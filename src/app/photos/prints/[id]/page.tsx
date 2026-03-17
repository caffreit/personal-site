import { notFound } from "next/navigation";
import { Metadata } from "next";
import {
  getAllPrintIds,
  getPrintById,
  getAvailablePrints,
} from "@/lib/photos";
import {
  PrintDetailView,
  type PrintDetailData,
} from "@/components/prints/PrintDetailView";

export function generateStaticParams() {
  return getAllPrintIds().map((id) => ({ id }));
}

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const entry = getPrintById(id);
  if (!entry) return { title: "Print Not Found" };

  const title =
    entry.image.caption || entry.image.filename.replace(/\.[^.]+$/, "");

  return {
    title: `${title} — Limited Edition Print`,
    description:
      entry.print.description ??
      `Limited-edition fine art print from the ${entry.album.title} collection. Edition of ${entry.print.editionSize}.`,
    openGraph: {
      images: [
        {
          url: `/photos/${encodeURIComponent(entry.album.id)}/${encodeURIComponent(entry.image.filename)}`,
          width: entry.image.width,
          height: entry.image.height,
        },
      ],
    },
  };
}

export default async function PrintDetailPage({ params }: Props) {
  const { id } = await params;
  const entry = getPrintById(id);
  if (!entry) notFound();

  const allPrints = getAvailablePrints();
  const currentIdx = allPrints.findIndex((p) => p.id === id);

  const prevEntry = currentIdx > 0 ? allPrints[currentIdx - 1] : null;
  const nextEntry =
    currentIdx < allPrints.length - 1 ? allPrints[currentIdx + 1] : null;

  const titleFor = (e: typeof entry) =>
    e.image.caption || e.image.filename.replace(/\.[^.]+$/, "");

  const data: PrintDetailData = {
    id: entry.id,
    title: titleFor(entry),
    albumTitle: entry.album.title,
    albumId: entry.album.id,
    imageSrc: `/photos/${encodeURIComponent(entry.album.id)}/${encodeURIComponent(entry.image.filename)}`,
    width: entry.image.width,
    height: entry.image.height,
    quote: entry.print.quote,
    description: entry.print.description,
    editionSold: entry.print.sold,
    editionSize: entry.print.editionSize,
    remaining: entry.remaining,
    price: entry.print.price,
    currency: entry.print.currency,
    sizes: entry.print.sizes,
    paper: entry.print.paper,
    signed: entry.print.signed,
    leadTime: entry.print.leadTime,
    requestUrl: entry.print.requestUrl,
    prevPrint: prevEntry
      ? { id: prevEntry.id, title: titleFor(prevEntry) }
      : null,
    nextPrint: nextEntry
      ? { id: nextEntry.id, title: titleFor(nextEntry) }
      : null,
  };

  return <PrintDetailView data={data} />;
}
