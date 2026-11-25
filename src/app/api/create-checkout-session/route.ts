import { NextResponse } from "next/server";
import {
  getPosterPrice,
  isPosterId,
  STRIPE_API_VERSION,
  stripeKeysReady,
} from "@/lib/stripePosterCheckout";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret || !stripeKeysReady()) {
    return NextResponse.json({ error: "Checkout is not configured." }, { status: 503 });
  }

  let input: { posterId?: unknown; variantId?: unknown };
  try {
    input = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (!input || !isPosterId(input.posterId) || typeof input.variantId !== "string") {
    return NextResponse.json({ error: "Invalid poster selection." }, { status: 400 });
  }

  // Price is resolved from an allow-list of server-side environment variables.
  const price = await getPosterPrice(input.posterId, input.variantId);
  if (!price) {
    return NextResponse.json({ error: "This poster is not yet available." }, { status: 404 });
  }

  const origin = process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? "https://" + process.env.VERCEL_URL : "http://localhost:3000");
  const params = new URLSearchParams({
    mode: "payment",
    ui_mode: "form",
    "line_items[0][price]": price.id,
    "line_items[0][quantity]": "1",
    billing_address_collection: "auto",
    "phone_number_collection[enabled]": "false",
    "automatic_tax[enabled]": "false",
    submit_type: "auto",
    integration_identifier: "custom_embedded_web_0001",
    return_url: origin.replace(/\/$/, "") + "/checkout/return?session_id={CHECKOUT_SESSION_ID}",
  });
  // For one-time payments payment_method_collection must be omitted.
  // Shipping and automatic tax remain disabled until configured in Checkout Studio.

  try {
    const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + secret,
        "Stripe-Version": STRIPE_API_VERSION,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
      cache: "no-store",
    });
    const session = (await response.json()) as {
      client_secret?: string | null;
      error?: { message?: string };
    };
    if (!response.ok || !session.client_secret) {
      console.error("Stripe session creation failed:", response.status, session.error?.message);
      return NextResponse.json({ error: "Unable to start checkout. Please try again." }, { status: 502 });
    }
    return NextResponse.json({ client_secret: session.client_secret }, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json({ error: "Unable to start checkout. Please try again." }, { status: 502 });
  }
}
