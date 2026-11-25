import Link from "next/link";
import { STRIPE_API_VERSION } from "@/lib/stripePosterCheckout";

export const dynamic = "force-dynamic";

export default async function CheckoutReturn({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id: sessionId } = await searchParams;
  let status: "paid" | "pending" | "unknown" = "unknown";

  if (sessionId && /^cs_(test|live)_[A-Za-z0-9_]+$/.test(sessionId) && process.env.STRIPE_SECRET_KEY) {
    try {
      const response = await fetch(
        "https://api.stripe.com/v1/checkout/sessions/" + encodeURIComponent(sessionId),
        {
          headers: {
            Authorization: "Bearer " + process.env.STRIPE_SECRET_KEY,
            "Stripe-Version": STRIPE_API_VERSION,
          },
          cache: "no-store",
        },
      );
      if (response.ok) {
        const session = (await response.json()) as { payment_status?: string };
        status = session.payment_status === "paid" ? "paid" : "pending";
      }
    } catch (error) {
      console.error("Unable to check Stripe checkout status:", error);
    }
  }

  return (
    <main className="mx-auto max-w-xl px-6 py-24">
      <h1 className="font-[family-name:var(--font-display)] text-4xl">
        {status === "paid" ? "Payment received" : status === "pending" ? "Payment processing" : "Checkout status unavailable"}
      </h1>
      <p className="mt-5 text-[var(--text-muted)]">
        {status === "paid"
          ? "Your payment was successful. Your order will be handled separately once fulfilment is configured."
          : status === "pending"
            ? "We have not yet confirmed payment. Please check again shortly before making another purchase."
            : "We could not verify this checkout. Check your payment history or contact us before retrying."}
      </p>
      <Link href="/greek-theogeny" className="mt-8 inline-block underline">
        Back to the posters
      </Link>
    </main>
  );
}
