import type { Metadata } from "next";
import { GreekTheogenyPosterView } from "@/components/posters/GreekTheogenyPosterView";
import { getPosterPrices } from "@/lib/stripePosterCheckout";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Greek Theogony Poster",
  description:
    "Explore the Greek Theogony A2 poster in frameless and frameless outlines editions, with detail previews and an illustrative room view.",
};

export default async function GreekTheogenyPage() {
  const stripePrices = await getPosterPrices("greek-theogony");
  return <GreekTheogenyPosterView stripePrices={stripePrices} stripePublishableKey={process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ""} />;
}
