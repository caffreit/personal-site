import { createHash, timingSafeEqual } from "node:crypto";
import { neon } from "@neondatabase/serverless";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const headers = {
  "Cache-Control": "private, no-store, max-age=0",
  "X-Robots-Tag": "noindex, nofollow",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
  "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'",
};
const digest = (s: string) => createHash("sha256").update(s).digest();
function authorized(request: Request, password: string) {
  const value = request.headers.get("authorization") ?? "";
  if (!value.startsWith("Basic ")) return false;
  return timingSafeEqual(digest(Buffer.from(value.slice(6), "base64").toString("utf8")), digest("admin:" + password));
}
function escapeHtml(value: unknown) {
  return String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c] ?? c));
}
const money = (cents: number) => new Intl.NumberFormat("en-IE", {style:"currency",currency:"EUR"}).format(cents / 100);
export async function GET(request: Request) {
  const password = process.env.POSTER_ADMIN_PASSWORD;
  if (process.env.VERCEL_ENV !== "preview" || !password || password.length < 24 || !process.env.DATABASE_URL) {
    return new Response("Not available", {status:404,headers});
  }
  if (!authorized(request,password)) {
    return new Response("Authentication required", {status:401,headers:{...headers,"WWW-Authenticate":'Basic realm="Poster orders", charset="UTF-8"'}});
  }
  try {
    const sql = neon(process.env.DATABASE_URL);
    const orders = await sql`SELECT stripe_session_id, poster_id, variant_id, customer_email, shipping_address, amount_paid, shipping_amount, status, prodigi_order_id, tracking_url, created_at FROM poster_orders ORDER BY created_at DESC, stripe_session_id DESC LIMIT 100`;
    const rows = orders.map(o => {
      const shipping = o.shipping_address ?? {};
      const a = shipping.address ?? {};
      const address = [shipping.name,a.line1,a.line2,a.city,a.state,a.postal_code,a.country].filter(Boolean).map(escapeHtml).join("<br>");
      return '<tr><td>'+escapeHtml(new Date(o.created_at).toLocaleString("en-IE",{timeZone:"Europe/Dublin"}))+'<details><summary>Session ID</summary><small>'+escapeHtml(o.stripe_session_id)+'</small></details></td><td>'+escapeHtml(o.poster_id)+'<br><small>'+escapeHtml(o.variant_id)+'</small></td><td>'+escapeHtml(o.customer_email)+'<details><summary>Delivery address</summary>'+address+'</details></td><td>'+money(o.amount_paid)+'</td><td>'+money(o.shipping_amount)+'</td><td><span class="status">'+escapeHtml(o.status)+'</span><br><small>'+escapeHtml(o.prodigi_order_id ?? "Not submitted")+'</small>'+(o.tracking_url?'<details><summary>Tracking</summary>'+escapeHtml(o.tracking_url)+'</details>':'')+'</td></tr>';
    }).join("");
    const html = '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Poster orders</title><style>body{font:15px system-ui,sans-serif;background:#f6f5f1;color:#202020;margin:0;padding:32px}main{max-width:1250px;margin:auto}h1{font-size:32px;margin:12px 0}p,small{color:#626262}header{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap}.tag,.status{display:inline-block;background:#eee8d5;padding:5px 9px;border-radius:5px;font-size:12px}.summary{display:flex;gap:16px;flex-wrap:wrap;margin:24px 0}.metric{background:white;border:1px solid #ddd;padding:18px;min-width:160px;border-radius:8px}.metric strong{display:block;font-size:26px;margin-top:8px}.table{overflow:auto;background:white;border:1px solid #ddd;border-radius:8px}table{border-collapse:collapse;width:100%;text-align:left}th,td{padding:15px;vertical-align:top;border-bottom:1px solid #eee}th{font-size:12px;text-transform:uppercase;letter-spacing:.04em;background:#fafafa}details{margin-top:8px;max-width:240px;overflow-wrap:anywhere}summary{cursor:pointer;color:#555}a{color:inherit}@media(max-width:600px){body{padding:16px}}</style></head><body><main><header><div><span class="tag">SANDBOX · READ ONLY</span><h1>Poster orders</h1><p>Latest 100 recorded orders · no print submissions from this page</p></div><a href="/admin/orders">Refresh</a></header><section class="summary"><div class="metric">Displayed orders<strong>'+orders.length+'</strong></div><div class="metric">Recorded payments<strong>'+money(orders.reduce((sum,o)=>sum+Number(o.amount_paid),0))+'</strong></div><div class="metric">Shipping collected<strong>'+money(orders.reduce((sum,o)=>sum+Number(o.shipping_amount),0))+'</strong></div></section><div class="table"><table><thead><tr><th>Order date</th><th>Poster</th><th>Customer</th><th>Paid</th><th>Shipping</th><th>Fulfilment</th></tr></thead><tbody>'+(rows||'<tr><td colspan="6">No orders yet.</td></tr>')+'</tbody></table></div></main></body></html>';
    return new Response(html,{headers:{...headers,"Content-Type":"text/html; charset=utf-8"}});
  } catch {
    return new Response("Unable to load orders", {status:503,headers});
  }
}
