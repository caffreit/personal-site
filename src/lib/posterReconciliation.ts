import { neon } from "@neondatabase/serverless";
import { readProdigiOrder, orderKey } from "./prodigiOrders";

function database() {
  if (process.env.VERCEL_ENV !== "preview" || !process.env.DATABASE_URL) throw new Error("Sandbox only");
  return neon(process.env.DATABASE_URL);
}

// Invoke from a future authenticated worker, not a public endpoint.
export async function syncSubmittedOrders(readOrder = readProdigiOrder) {
  const sql = database();
  const rows = await sql`SELECT stripe_session_id, prodigi_order_id, status, updated_at FROM poster_orders
    WHERE prodigi_order_id IS NOT NULL AND status NOT IN ('completed','cancelled','failed')
    ORDER BY updated_at ASC LIMIT 3`;
  let updated = 0, errors = 0;
  for (const row of rows) {
    try {
      const snapshot = await readOrder(row.prodigi_order_id);
      if (snapshot.merchantReference !== row.stripe_session_id || snapshot.idempotencyKey !== orderKey(row.stripe_session_id)) throw new Error("Order identity mismatch");
      const changed = await sql`UPDATE poster_orders SET status = ${snapshot.status}, tracking_url = COALESCE(${snapshot.trackingUrl}, tracking_url), updated_at = now()
        WHERE stripe_session_id = ${row.stripe_session_id} AND prodigi_order_id = ${row.prodigi_order_id}
        AND status = ${row.status} AND updated_at = ${row.updated_at} RETURNING stripe_session_id`;
      updated += changed.length;
    } catch {
      errors++;
      // Rotate failed lookups so one unavailable order cannot starve the queue.
      await sql`UPDATE poster_orders SET updated_at = now() WHERE stripe_session_id = ${row.stripe_session_id} AND status = ${row.status} AND prodigi_order_id = ${row.prodigi_order_id}`;
    }
  }
  return {updated,errors};
}

// Requires independent verification of the provider order and its original checkout.
// Not exposed via HTTP; do not attach a guessed or manually unverified order ID.
export async function attachVerifiedProviderOrder(sessionId: string, providerId: string) {
  if (!sessionId.startsWith("cs_test_") || !providerId) throw new Error("Invalid identifiers");
  const sql = database();
  const rows = await sql`UPDATE poster_orders SET prodigi_order_id = ${providerId}, status = 'submitted', updated_at = now()
    WHERE stripe_session_id = ${sessionId} AND prodigi_order_id IS NULL
    AND status IN ('submitting','needs_reconciliation') RETURNING stripe_session_id`;
  return rows.length === 1;
}

export async function syncProviderOrder(id: string) {
  const sql = database();
  const rows = await sql`SELECT stripe_session_id, status, updated_at FROM poster_orders
    WHERE prodigi_order_id = ${id} AND stripe_session_id LIKE 'cs_test_%' LIMIT 2`;
  if (rows.length === 0) return "ignored";
  if (rows.length !== 1) throw new Error("Ambiguous order");
  const row = rows[0];
  const snapshot = await readProdigiOrder(id);
  if (snapshot.merchantReference !== row.stripe_session_id || snapshot.idempotencyKey !== orderKey(row.stripe_session_id)) throw new Error("Order identity mismatch");
  const changed = await sql`UPDATE poster_orders SET status = ${snapshot.status}, tracking_url = COALESCE(${snapshot.trackingUrl}, tracking_url), updated_at = now()
    WHERE stripe_session_id = ${row.stripe_session_id} AND prodigi_order_id = ${id} AND status = ${row.status} AND updated_at = ${row.updated_at} RETURNING stripe_session_id`;
  if (!changed.length) throw new Error("Concurrent update; retry");
  return "updated";
}
