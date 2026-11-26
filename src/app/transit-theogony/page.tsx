import type { Metadata } from "next";
import { TransitTheogonyPosterView } from "@/components/posters/TransitTheogonyPosterView";
import { getPosterPrices } from "@/lib/stripePosterCheckout";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Transit Theogony",
  description:
    "Explore A2 transit maps of the Greek divine family in left-to-right and ring layouts, with detail previews and illustrative room views.",
};

export default async function TransitTheogonyPage() {
  const stripePrices = await getPosterPrices("transit-theogony");
  return <TransitTheogonyPosterView stripePrices={stripePrices} stripePublishableKey={process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ""} />;
}
