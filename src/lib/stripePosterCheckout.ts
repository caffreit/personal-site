// Server-side Stripe poster catalogue. Never accept Price IDs or amounts from a browser.
export type PosterId = "greek-theogony" | "transit-theogony";
export type PosterPrice = { amount: number; currency: string };

export const STRIPE_API_VERSION = "2026-11-18.endive";

const PRICE_IDS: Record<PosterId, Record<string, string | undefined>> = {
  "greek-theogony": {
    outlines: process.env.STRIPE_PRICE_GREEK_THEOGONY_OUTLINES,
    translucent: process.env.STRIPE_PRICE_GREEK_THEOGONY_TRANSLUCENT,
  },
  "transit-theogony": {
    "left-to-right": process.env.STRIPE_PRICE_TRANSIT_THEOGONY_LEFT_TO_RIGHT,
    ring: process.env.STRIPE_PRICE_TRANSIT_THEOGONY_RING,
  },
};

export function isPosterId(value: unknown): value is PosterId {
  return value === "greek-theogony" || value === "transit-theogony";
}

export async function getPosterPrice(
  posterId: PosterId,
  variantId: string,
): Promise<(PosterPrice & { id: string }) | null> {
  const priceId = Object.prototype.hasOwnProperty.call(PRICE_IDS[posterId], variantId)
    ? PRICE_IDS[posterId][variantId]
    : undefined;
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret || !priceId || !/^price_[A-Za-z0-9_]+$/.test(priceId)) return null;

  try {
    const response = await fetch(
      "https://api.stripe.com/v1/prices/" + encodeURIComponent(priceId),
      {
        headers: {
          Authorization: "Bearer " + secret,
          "Stripe-Version": STRIPE_API_VERSION,
        },
        cache: "no-store",
      },
    );
    if (!response.ok) {
      console.error("Unable to load configured Stripe poster price:", response.status);
      return null;
    }
    const price = (await response.json()) as {
      id?: string;
      active?: boolean;
      currency?: string;
      unit_amount?: number | null;
      type?: string;
    };
    if (
      price.id !== priceId ||
      price.active !== true ||
      price.type !== "one_time" ||
      price.currency !== "eur" ||
      !Number.isSafeInteger(price.unit_amount) ||
      (price.unit_amount ?? 0) <= 0
    ) return null;
    return { id: priceId, amount: price.unit_amount as number, currency: "EUR" };
  } catch (error) {
    console.error("Stripe price lookup failed:", error);
    return null;
  }
}

export async function getPosterPrices(posterId: PosterId): Promise<Record<string, PosterPrice>> {
  const entries = await Promise.all(
    Object.keys(PRICE_IDS[posterId]).map(async (variantId) => ({
      variantId,
      price: await getPosterPrice(posterId, variantId),
    })),
  );
  return Object.fromEntries(
    entries
      .filter(({ price }) => price !== null)
      .map(({ variantId, price }) => [variantId, { amount: price!.amount, currency: price!.currency }]),
  );
}
