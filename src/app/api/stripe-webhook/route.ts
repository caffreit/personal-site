import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { recordPaidPosterOrder, type PaidPosterSession } from "@/lib/posterOrders";

export const runtime = "nodejs";

function verifyStripeSignature(body: string, header: string, secret: string): boolean {
  const pairs = header.split(",").map((part) => part.trim().split("=", 2));
  const timestamp = pairs.find(([key]) => key === "t")?.[1];
  const signatures = pairs.filter(([key]) => key === "v1").map(([, value]) => value);
  if (!timestamp || !/^\d+$/.test(timestamp) || signatures.length === 0) return false;
  const seconds = Number(timestamp);
  if (!Number.isSafeInteger(seconds) || Math.abs(Date.now() / 1000 - seconds) > 300) return false;

  const expected = createHmac("sha256", secret)
    .update(timestamp + "." + body, "utf8")
    .digest();
  return signatures.some((signature) => {
    if (!signature || !/^[0-9a-f]{64}$/i.test(signature)) return false;
    return timingSafeEqual(Buffer.from(signature, "hex"), expected);
  });
}

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get("stripe-signature");
  if (!secret || !signature) return new Response("Webhook not configured", { status: 400 });

  const rawBody = await request.text();
  if (!verifyStripeSignature(rawBody, signature, secret)) {
    return new Response("Invalid signature", { status: 400 });
  }

  let event: { id?: string; type?: string; livemode?: boolean; data?: { object?: PaidPosterSession } };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return new Response("Invalid payload", { status: 400 });
  }

  if (
    event.type === "checkout.session.completed" ||
    event.type === "checkout.session.async_payment_succeeded"
  ) {
    const session = event.data?.object;
    if (session?.payment_status === "paid") {
      if (event.livemode !== false) return new Response("Sandbox only", { status: 400 });
      if (!session.metadata?.poster_id) return NextResponse.json({ received: true });
      try {
        const created = await recordPaidPosterOrder(session);
        console.info(created ? "Poster order recorded" : "Duplicate poster order ignored", session.id);
      } catch {
        console.error("Poster order persistence failed", session.id);
        return new Response("Order persistence failed", { status: 503 });
      }
    }
  }
  return NextResponse.json({ received: true });
}
