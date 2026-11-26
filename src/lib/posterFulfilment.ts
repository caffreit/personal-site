import { neon } from "@neondatabase/serverless";

type SubmissionResult = { kind: "accepted"; orderId: string } | { kind: "rejected" } | { kind: "uncertain" };
type Order = { stripe_session_id: string; poster_id: string; variant_id: string; customer_email: string; shipping_address: unknown };
export type SubmitPoster = (order: Order, merchantReference: string) => Promise<SubmissionResult>;

// No provider adapter is wired until artwork and API contract are verified.
export async function fulfilPaidPoster(sessionId: string, submit?: SubmitPoster) {
  if (process.env.PRODIGI_ENABLE_FULFILMENT !== "true" || process.env.VERCEL_ENV !== "preview" ||
      !process.env.PRODIGI_API_KEY?.startsWith("test_") || !process.env.DATABASE_URL || !submit) return "disabled";
  if (!sessionId.startsWith("cs_test_")) throw new Error("Sandbox session required");
  const sql = neon(process.env.DATABASE_URL);
  // A single atomic UPDATE claims the order. No automatic reclaim after timeout:
  // a crash after the external request might have created a print order.
  const rows = await sql`UPDATE poster_orders SET status = 'submitting', updated_at = now()
    WHERE stripe_session_id = ${sessionId} AND status = 'paid' AND prodigi_order_id IS NULL
    RETURNING stripe_session_id, poster_id, variant_id, customer_email, shipping_address`;
  if (!rows.length) return "not_claimed";
  const row = rows[0] as Order;
  let result: SubmissionResult;
  try {
    result = await submit(row, sessionId);
  } catch {
    result = {kind:"uncertain"};
  }
  if (result.kind === "accepted" && result.orderId) {
    await sql`UPDATE poster_orders SET status = 'submitted', prodigi_order_id = ${result.orderId}, updated_at = now()
      WHERE stripe_session_id = ${sessionId} AND status = 'submitting'`;
    return "submitted";
  }
  const status = result.kind === "rejected" ? "submission_rejected" : "needs_reconciliation";
  await sql`UPDATE poster_orders SET status = ${status}, updated_at = now()
    WHERE stripe_session_id = ${sessionId} AND status = 'submitting'`;
  return status;
}
