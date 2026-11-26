import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
const countries = new Set(["IE", "GB", "DE", "FR", "US", "CA", "AU"]);

export async function GET(request: Request) {
  const country = new URL(request.url).searchParams.get("country")?.toUpperCase() ?? "IE";
  if (!countries.has(country)) return NextResponse.json({ error: "Unsupported destination" }, { status: 400 });
  const key = process.env.PRODIGI_API_KEY;
  if (process.env.VERCEL_ENV !== "preview" || !key?.startsWith("test_")) {
    return NextResponse.json({ error: "Sandbox quotation unavailable" }, { status: 503 });
  }
  try {
    const response = await fetch("https://api.sandbox.prodigi.com/v4.0/quotes", {
      method: "POST",
      headers: { "X-API-Key": key, "Content-Type": "application/json" },
      body: JSON.stringify({
        shippingMethod: "Standard",
        destinationCountryCode: country,
        currencyCode: "EUR",
        items: [{ sku: "GLOBAL-FAP-A2", copies: 1, assets: [{ printArea: "default" }] }]
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(15000)
    });
    if (!response.ok) return NextResponse.json({ error: "Prodigi quote failed", upstreamStatus: response.status }, { status: 502 });
    const quote = await response.json();
    return NextResponse.json({ country, sku: "GLOBAL-FAP-A2", quote }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Prodigi quote request failed" }, { status: 502 });
  }
}
