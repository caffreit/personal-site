import { createHash, timingSafeEqual } from "node:crypto";
import { syncProviderOrder } from "@/lib/posterReconciliation";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;
const hash = (s: string) => createHash("sha256").update(s).digest();
export async function POST(request: Request) {
  const headers = {"Cache-Control":"no-store"};
  const secret = process.env.PRODIGI_WEBHOOK_SECRET;
  if (process.env.VERCEL_ENV !== "preview" || process.env.PRODIGI_ENABLE_FULFILMENT !== "true" || !secret || secret.length < 32)
    return new Response("Not available",{status:404,headers});
  if (!timingSafeEqual(hash(new URL(request.url).searchParams.get("token") ?? ""),hash(secret)))
    return new Response("Unauthorized",{status:401,headers});
  try {
    const raw = await request.text();
    if (raw.length > 262144) return new Response("Too large",{status:413,headers});
    let event;
    try { event = JSON.parse(raw); } catch { return new Response("Invalid JSON",{status:400,headers}); }
    const id = event?.subject;
    if (event?.specversion !== "1.0" || typeof event.type !== "string" || !event.type.startsWith("com.prodigi.order.") ||
      typeof id !== "string" || !/^ord_\d+$/.test(id) || event.data?.order?.id !== id)
      return new Response("Invalid event",{status:400,headers});
    // Event body is never used as authoritative order state.
    await syncProviderOrder(id);
    return new Response(null,{status:204,headers});
  } catch { return new Response("Retry later",{status:503,headers}); }
}
