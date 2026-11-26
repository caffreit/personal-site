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
      !a.city || !a.country || !["IE","GB","DE","FR","US","CA","AU"].includes(a.country) ||
      !order.customer_email || new URL(artwork).protocol !== "https:") throw new Error("Invalid order configuration");
  return { submit: true, shippingMethod: "standard", recipient: {
    name: shipping.name, email: order.customer_email, address: {
      line1: a.line1, line2: a.line2 || undefined, townOrCity: a.city,
      stateOrCounty: a.state || undefined, postalOrZipCode: a.postal_code || undefined, countryCode: a.country
    }
  }, items: [{sku:"GLOBAL-FAP-A2",quantity:1,sizing:"fillPrintArea",assets:[{printArea:"default",url:artwork}]}] };
}
function sandboxKey() {
  const key = process.env.PRODIGI_V5_API_KEY;
  if (process.env.VERCEL_ENV !== "preview" || process.env.PRODIGI_ENABLE_FULFILMENT !== "true" || !key?.startsWith("sandbox_"))
    throw new Error("Sandbox fulfilment disabled");
  return key;
}
export function createProdigiSubmit(artwork: string, request: typeof fetch = fetch): SubmitPoster {
  return async (order) => {
    const key = sandboxKey();
    const body = buildProdigiRequest(order, artwork);
    try {
      const response = await request("https://api.prodigi.com/v5/orders", {
        method:"POST", headers:{"X-API-Key":key,"Content-Type":"application/json","Idempotency-Key":orderKey(order.stripe_session_id)},
        body:JSON.stringify(body),cache:"no-store",signal:AbortSignal.timeout(15000)
      });
      if (response.status === 400) return {kind:"rejected"};
      if (!response.ok) return {kind:"uncertain"};
      const data = await response.json();
      const id = data?.data?.id;
      if (typeof id !== "string" || !id) return {kind:"uncertain"};
      return {kind:"accepted",orderId:id};
    } catch { return {kind:"uncertain"}; }
  };
}
const stages = new Set(["draft","pending_submission","submitted","in_production","partially_shipped","shipped","completed","cancelled","failed","on_hold","paused"]);
export async function readProdigiStatus(id: string, request: typeof fetch = fetch) {
  const key = sandboxKey();
  const response = await request("https://api.prodigi.com/v5/orders/"+encodeURIComponent(id), {
    headers:{"X-API-Key":key},cache:"no-store",signal:AbortSignal.timeout(15000)
  });
  if (!response.ok) throw new Error("Provider status unavailable");
  const order = (await response.json())?.data;
  if (order?.id !== id || !stages.has(order.status)) throw new Error("Unexpected provider status");
  return order.status as string;
}
