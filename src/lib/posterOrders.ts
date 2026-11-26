import { neon } from "@neondatabase/serverless";

export type PaidPosterSession = {
  id?: string;
  payment_status?: string;
  mode?: string;
  currency?: string;
  amount_total?: number;
  payment_intent?: string;
  metadata?: Record<string, string>;
  total_details?: { amount_shipping?: number };
  customer_details?: { email?: string };
  collected_information?: { shipping_details?: { name?: string; address?: Record<string, string | null> } };
  shipping_details?: { name?: string; address?: Record<string, string | null> };
};

export async function recordPaidPosterOrder(s: PaidPosterSession) {
  if (process.env.VERCEL_ENV !== "preview" || !process.env.DATABASE_URL) throw new Error("Sandbox database unavailable");
  const m = s.metadata;
  const shipping = s.collected_information?.shipping_details ?? s.shipping_details;
  const amount = s.amount_total;
  const postage = s.total_details?.amount_shipping;
  if (!s.id?.startsWith("cs_test_") || s.mode !== "payment" || s.currency !== "eur" ||
      !s.payment_intent || !m?.poster_id || !m.variant_id ||
      !shipping?.name || !shipping.address?.line1 || !shipping.address.country ||
      shipping.address.country !== m.shipping_country ||
      !s.customer_details?.email || typeof amount !== "number" || typeof postage !== "number" ||
      !Number.isSafeInteger(amount) || !Number.isSafeInteger(postage) ||
      postage <= 0 || amount <= postage || String(postage) !== m.shipping_cents) {
    throw new Error("Invalid paid poster session");
  }
  const sql = neon(process.env.DATABASE_URL);
  // Sandbox bootstrap only; production should use explicit migrations.
  await sql`CREATE TABLE IF NOT EXISTS poster_orders (
    stripe_session_id text PRIMARY KEY,
    stripe_payment_intent_id text NOT NULL,
    poster_id text NOT NULL,
    variant_id text NOT NULL,
    customer_email text NOT NULL,
    shipping_address jsonb NOT NULL,
    amount_paid integer NOT NULL CHECK (amount_paid > 0),
    shipping_amount integer NOT NULL CHECK (shipping_amount >= 0),
    currency text NOT NULL,
    status text NOT NULL DEFAULT 'paid',
    prodigi_order_id text UNIQUE,
    tracking_url text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
  )`;
  const rows = await sql`INSERT INTO poster_orders
    (stripe_session_id, stripe_payment_intent_id, poster_id, variant_id, customer_email, shipping_address, amount_paid, shipping_amount, currency)
    VALUES (${s.id}, ${s.payment_intent}, ${m.poster_id}, ${m.variant_id}, ${s.customer_details.email}, ${JSON.stringify(shipping)}::jsonb, ${amount}, ${postage}, ${s.currency})
    ON CONFLICT (stripe_session_id) DO NOTHING RETURNING stripe_session_id`;
  return rows.length === 1;
}
