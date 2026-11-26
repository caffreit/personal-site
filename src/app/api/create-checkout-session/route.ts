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

  let input: { posterId?: unknown; variantId?: unknown; country?: unknown };
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

  const country = input.country;
  if (typeof country !== "string" || !["IE","GB","DE","FR","US","CA","AU"].includes(country)) {
    return NextResponse.json({ error: "Select a delivery country." }, { status: 400 });
  }
  const key = process.env.PRODIGI_API_KEY;
  if (process.env.VERCEL_ENV !== "preview" || !key?.startsWith("test_") || !secret.startsWith("sk_test_")) {
    return NextResponse.json({ error: "Sandbox shipping unavailable." }, { status: 503 });
  }
  let shippingCents: number;
  try {
    const response = await fetch("https://api.sandbox.prodigi.com/v4.0/quotes", {
      method: "POST", headers: { "X-API-Key": key, "Content-Type": "application/json" },
      body: JSON.stringify({ shippingMethod: "Standard", destinationCountryCode: country, currencyCode: "EUR", items: [{ sku: "GLOBAL-FAP-A2", copies: 1, assets: [{ printArea: "default" }] }] }),
      cache: "no-store", signal: AbortSignal.timeout(15000),
    });
    const data = await response.json();
    const q = data.quotes?.find((q: { shipmentMethod: string }) => q.shipmentMethod === "Standard");
    const money = (m: { amount: string; currency: string }) => {
      if (m?.currency !== "EUR" || !/^\d+(\.\d{1,2})?$/.test(m.amount)) throw new Error("Invalid quote amount");
      return Math.round(Number(m.amount) * 100);
    };
    if (!response.ok || !q || !["Created","CreatedWithIssues"].includes(data.outcome) ||
        (data.issues ?? []).some((i: {errorCode: string}) => i.errorCode !== "destinationCountryCode.UsSalesTaxWarning") ||
        !Array.isArray(q.shipments) || !q.shipments.length) throw new Error("Invalid quote");
    shippingCents = money(q.costSummary.shipping) + q.shipments.reduce((sum: number, s: {tax: {amount: string; currency: string}}) => sum + money(s.tax), 0);
    if (!Number.isSafeInteger(shippingCents) || shippingCents <= 0) throw new Error("Invalid shipping");
  } catch (error) {
    console.error("Prodigi shipping validation failed:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Unable to quote shipping. Please try again." }, { status: 502 });
  }

  // Preview payments must return to the deployed preview, not the live site.
  const origin = process.env.VERCEL_ENV === "preview" && process.env.VERCEL_URL
    ? "https://" + process.env.VERCEL_URL
    : process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.VERCEL_URL ? "https://" + process.env.VERCEL_URL : "http://localhost:3000");
  const params = new URLSearchParams({
    mode: "payment",
    ui_mode: "form",
    "line_items[0][price]": price.id,
    "line_items[0][quantity]": "1",
    "metadata[poster_id]": input.posterId,
    "metadata[variant_id]": input.variantId,
    billing_address_collection: "auto",
    "shipping_address_collection[allowed_countries][0]": country,
    "shipping_options[0][shipping_rate_data][display_name]": "Standard shipping",
    "shipping_options[0][shipping_rate_data][type]": "fixed_amount",
    "shipping_options[0][shipping_rate_data][fixed_amount][amount]": String(shippingCents),
    "shipping_options[0][shipping_rate_data][fixed_amount][currency]": "eur",
    "metadata[shipping_country]": country,
    "metadata[shipping_cents]": String(shippingCents),
    "phone_number_collection[enabled]": "false",
    "automatic_tax[enabled]": "false",
    submit_type: "auto",
    integration_identifier: "custom_embedded_web_0001",
    return_url: origin.replace(/\/$/, "") + "/checkout/return?session_id={CHECKOUT_SESSION_ID}",
  });
  // For one-time payments payment_method_collection must be omitted.
  // Automatic tax remains disabled pending live tax configuration.

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
    return NextResponse.json({ client_secret: session.client_secret, shipping_cents: shippingCents }, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json({ error: "Unable to start checkout. Please try again." }, { status: 502 });
  }
}
