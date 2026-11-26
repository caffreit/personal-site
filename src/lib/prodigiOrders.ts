import { createHash } from "node:crypto";
import type { SubmitPoster } from "./posterFulfilment";

type Order = Parameters<SubmitPoster>[0];
type Shipping = { name?: string; address?: Record<string, string | null> };
export function orderKey(sessionId: string) {
  return createHash("sha256").update("poster:" + sessionId).digest("hex");
}
export function buildProdigiRequest(order: Order, artwork: string) {
  const shipping = order.shipping_address as Shipping;
  const a = shipping?.address;
  const supported = (order.poster_id === "greek-theogony" && order.variant_id === "translucent") ||
    (order.poster_id === "transit-theogony" && order.variant_id === "ring");
  if (!supported || !order.stripe_session_id.startsWith("cs_test_") || !shipping?.name || !a?.line1 ||
      !a.city || !a.postal_code || !a.country || !["IE","GB","DE","FR","US","CA","AU"].includes(a.country) ||
      !order.customer_email || new URL(artwork).protocol !== "https:") throw new Error("Invalid order configuration");
  return { merchantReference: order.stripe_session_id, idempotencyKey: orderKey(order.stripe_session_id), shippingMethod: "Standard", recipient: {
    name: shipping.name, email: order.customer_email, address: {
      line1: a.line1, line2: a.line2 || undefined, townOrCity: a.city,
      stateOrCounty: a.state || undefined, postalOrZipCode: a.postal_code || undefined, countryCode: a.country
    }
  }, items: [{sku:"GLOBAL-FAP-A2",copies:1,sizing:"fillPrintArea",assets:[{printArea:"default",url:artwork}]}] };
}
function sandboxKey() {
  const key = process.env.PRODIGI_API_KEY;
  if (process.env.VERCEL_ENV !== "preview" || process.env.PRODIGI_ENABLE_FULFILMENT !== "true" || !key?.startsWith("test_"))
    throw new Error("Sandbox fulfilment disabled");
  return key;
}
export function createProdigiSubmit(artwork: string, request: typeof fetch = fetch): SubmitPoster {
  return async (order) => {
    const key = sandboxKey();
    const body = buildProdigiRequest(order, artwork);
    try {
      const response = await request("https://api.sandbox.prodigi.com/v4.0/orders", {
        method:"POST", headers:{"X-API-Key":key,"Content-Type":"application/json"},
        body:JSON.stringify(body),cache:"no-store",signal:AbortSignal.timeout(15000)
      });
      if (response.status === 400) return {kind:"rejected"};
      if (!response.ok) return {kind:"uncertain"};
      const data = await response.json();
      const id = data?.order?.id;
      if (!["created","createdwithissues","onhold","alreadyexists"].includes(String(data?.outcome).toLowerCase())) return {kind:"uncertain"};
      if (String(data.outcome).toLowerCase() === "alreadyexists" && data.order.idempotencyKey !== body.idempotencyKey) return {kind:"uncertain"};
      if (typeof id !== "string" || !/^ord_\d+$/.test(id)) return {kind:"uncertain"};
      return {kind:"accepted",orderId:id};
    } catch { return {kind:"uncertain"}; }
  };
}
export async function readProdigiStatus(id: string, request: typeof fetch = fetch) {
  const key = sandboxKey();
  if (!/^ord_\d+$/.test(id)) throw new Error("Invalid order ID");
  const response = await request("https://api.sandbox.prodigi.com/v4.0/orders/"+encodeURIComponent(id), {
    headers:{"X-API-Key":key},cache:"no-store",signal:AbortSignal.timeout(15000)
  });
  if (!response.ok) throw new Error("Provider status unavailable");
  const data = await response.json();
  const order = data?.order;
  if (String(data?.outcome).toLowerCase() !== "ok" || order?.id !== id) throw new Error("Unexpected provider status");
  switch (order.status?.stage) {
    case "Complete": return "completed";
    case "Cancelled": return "cancelled";
    case "InProgress":
      if (order.status.issues?.length) return "on_hold";
      if (order.status.details?.shipping === "Complete") return "shipped";
      if (order.status.details?.inProduction === "InProgress" || order.status.details?.inProduction === "Complete") return "in_production";
      return "submitted";
    default: throw new Error("Unexpected provider status");
  }
}
