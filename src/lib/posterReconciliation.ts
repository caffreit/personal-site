import { neon } from "@neondatabase/serverless";
import { readProdigiStatus } from "./prodigiOrders";

function database() {
  if (process.env.VERCEL_ENV !== "preview" || !process.env.DATABASE_URL) throw new Error("Sandbox only");
  return neon(process.env.DATABASE_URL);
}

// Invoke from a future authenticated worker, not a public endpoint.
export async function syncSubmittedOrders(readStatus = readProdigiStatus) {
  const sql = database();
  const rows = await sql`SELECT stripe_session_id, prodigi_order_id, status FROM poster_orders
    WHERE prodigi_order_id IS NOT NULL AND status NOT IN ('completed','cancelled','failed')
    ORDER BY updated_at ASC LIMIT 3`;
  let updated = 0, errors = 0;
  for (const row of rows) {
    try {
      const status = await readStatus(row.prodigi_order_id);
      const changed = await sql`UPDATE poster_orders SET status = ${status}, updated_at = now()
        WHERE stripe_session_id = ${row.stripe_session_id} AND prodigi_order_id = ${row.prodigi_order_id}
        AND status = ${row.status} RETURNING stripe_session_id`;
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
