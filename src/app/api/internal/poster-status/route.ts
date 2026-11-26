import { createHash, timingSafeEqual } from "node:crypto";
import { syncSubmittedOrders } from "@/lib/posterReconciliation";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;
const hash = (s: string) => createHash("sha256").update(s).digest();
export async function POST(request: Request) {
  const secret = process.env.POSTER_WORKER_SECRET;
  const headers = {"Cache-Control":"no-store"};
  if (process.env.VERCEL_ENV !== "preview" || process.env.PRODIGI_ENABLE_FULFILMENT !== "true" || !secret || secret.length < 32)
    return new Response("Not available",{status:404,headers});
  if (!timingSafeEqual(hash(request.headers.get("authorization") ?? ""),hash("Bearer "+secret)))
    return new Response("Unauthorized",{status:401,headers});
  try {
    return Response.json(await syncSubmittedOrders(),{headers});
  } catch {
    return new Response("Status synchronisation failed",{status:503,headers});
  }
}
