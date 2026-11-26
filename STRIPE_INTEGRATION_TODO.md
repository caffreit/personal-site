# Stripe embedded-form integration: remaining setup

**Status: sandbox integration only; NOT READY FOR LIVE SALES.**

This implements the specific Checkout Studio **Embedded form**, with Stripe.js loaded from https://js.stripe.com/dahlia/stripe.js and `ui_mode=form`. It does not use the hosted Checkout redirect or the distinct full-page embedded Checkout product.

Two sandbox products now exist at €20 each: Greek Theogony and Transit Theogony – Ring. Both Price IDs are configured in Vercel Preview; sandbox API keys are still required. Both Greek gallery variants share the Greek product price for sandbox testing; confirm the exact printable artwork before enabling live sales.

## Values to Replace

**Files containing configuration placeholders:**
- [.env.example](.env.example) — example values only; actual values belong in local `.env.local` and Vercel environment variables.
- [src/lib/stripePosterCheckout.ts](src/lib/stripePosterCheckout.ts) — reads two configured Price IDs, never hardcodes amounts.
- [src/app/api/create-checkout-session/route.ts](src/app/api/create-checkout-session/route.ts) — server-side session creation.

| Field | Current value | What to set |
| --- | --- | --- |
| `STRIPE_SECRET_KEY` | blank | Sandbox secret key (`sk_test_...`). **Server-side only**, not in git or `NEXT_PUBLIC_`. |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | blank | Matching sandbox publishable key (`pk_test_...`). |
| `STRIPE_ENABLE_LIVE_PAYMENTS` | blank | Leave blank for sandbox; set to `true` only after the complete go-live review and when using matching live keys. |
| `STRIPE_WEBHOOK_SECRET` | blank | Signing secret (`whsec_...`) for the configured webhook endpoint. |
| `STRIPE_PRICE_GREEK_THEOGONY` | configured in Preview | One-time EUR Price ID for Greek Theogony (A2). |
| `STRIPE_PRICE_TRANSIT_THEOGONY_RING` | configured in Preview | Active one-time EUR Price ID for Transit Theogony / Ring (A2). |
| `NEXT_PUBLIC_SITE_URL` | blank | Canonical origin, e.g. `https://drdimg.com` in production; Vercel preview origin for preview deployments. |

The payment mode is intentionally `payment` for one-time physical-poster orders. Quantity defaults to **1**, per Checkout Studio; a quantity selector is not yet implemented. The amount comes from your Stripe Price, not browser input.

Create poster products and Prices in the **same sandbox** as your test keys (Stripe Dashboard > Product catalogue); use one one-time EUR Price per purchasable product. A variant is displayed as buyable only if its Price ID resolves to an active one-time EUR Stripe Price. The existing external-checkout / coming-soon behaviour remains for unconfigured variants.

## Configured Parameters

**Files:** [src/app/api/create-checkout-session/route.ts](src/app/api/create-checkout-session/route.ts), [src/components/posters/StripePosterForm.tsx](src/components/posters/StripePosterForm.tsx)

| Parameter | Value |
| --- | --- |
| `mode` | `payment` (one-time poster purchase) |
| `ui_mode` | `form` |
| `billing_address_collection` | `auto` |
| `phone_number_collection.enabled` | `false` |
| `automatic_tax.enabled` | `false` — **go-live blocker** |
| `submit_type` | `auto` |
| `integration_identifier` | `custom_embedded_web_0001` |
| `line_items[0].price` | Server-side configured Stripe Price ID |
| `line_items[0].quantity` | `1` |
| `payment_method_collection` | omitted for `payment` mode, per Studio instructions |
| API header | `Stripe-Version: 2026-11-18.endive` (Dahlia or later) |
| Stripe.js | `https://js.stripe.com/dahlia/stripe.js` |
| Form appearance | Stripe Studio-provided theme/spacing/colors; expanded form |
| `return_url` | Your site at `/checkout/return?session_id={CHECKOUT_SESSION_ID}` |

**Not configured:** `shipping_address_collection`, `shipping_options`, shipping rates, or an automatic tax registration. The Checkout Studio prompt did not include them; this PR deliberately preserves that configuration.

## Setup and Next Steps

1. **Configure sandbox environment.** Copy the names from `.env.example` to `.env.local` (never commit it). Add the matching variables under **Vercel > Project > Settings > Environment Variables**, selecting the appropriate Preview environment. Redeploy after updating build-time publishable-key configuration.
2. **Verify Stripe products and Prices** using the two products above; their active sandbox Price IDs are already configured in Preview. Do not invent or hardcode a product amount in the browser.
3. **Run locally:** `npm install && npm run dev`. Open `/greek-theogeny` and `/transit-theogony`, select a configured edition and click *Buy this poster*. The secure Stripe form should open **inside the page**. Run `npm run lint` and `npm run build`.
4. **Sandbox payment test:** Use Stripe's test card `4242 4242 4242 4242`, any future expiry date and any CVC. Confirm that returning to `/checkout/return` displays a server-verified paid/pending state. Also test declined payments, cancellation, form close/reopen, and each edition.
5. **Webhook:** Register `https://<your-domain>/api/stripe-webhook` as a Stripe event destination with `checkout.session.completed` and `checkout.session.async_payment_succeeded`. Store its signing secret in `STRIPE_WEBHOOK_SECRET`. The route checks the signed *raw request body* using HMAC-SHA256, a five-minute tolerance, and timing-safe comparison. For now it **only logs paid session IDs**; it does not send orders to a printing provider.
6. **Fulfilment — REQUIRED before live payments:** Decide how to produce/ship the posters (e.g. a print-on-demand service). Confirm the exact Greek artwork corresponding to the Prodigi product and disable any unfulfillable design selection before live sales. Add persistent order records, idempotent webhook processing keyed by Checkout Session or PaymentIntent, shipping details, customer communication and a refund/cancellation process. Do **not** rely on the success/return page for fulfilment, and don't process duplicate webhook deliveries twice.
7. **Delivery details — REQUIRED before live payments:** Return to Checkout Studio and configure `shipping_address_collection[allowed_countries]`, shipping rates/options and any phone requirements based on where you actually deliver. Re-export the Studio prompt and update session parameters accordingly. Without this, the current sandbox checkout does not gather a shipping address.
8. **VAT/tax — REQUIRED before live payments:** Confirm Irish VAT registration status, price tax behaviour and where posters are printed/shipped from. Configure Stripe Tax registrations and appropriate physical-goods and shipping tax codes; decide on EU OSS/IOSS treatment if applicable. Prodigi is the intended print-on-demand provider, so check its print/dispatch locations and VAT treatment. Change `automatic_tax.enabled` to true **only when the Stripe Tax account and your obligations are ready**; update Checkout Studio / code together. Currently it is explicitly false.
9. **Go-live review:** Only after steps 6–8 and successful tests, replace sandbox credentials and Price IDs with matching live-mode values, use a live webhook destination/secret, set `STRIPE_ENABLE_LIVE_PAYMENTS=true`, test with a small live transaction, then enable public sale. Never share `sk_` or `whsec_` secrets in a chat or commit.

## New Files / Flow

- [src/lib/stripePosterCheckout.ts](src/lib/stripePosterCheckout.ts): Server-side allow-list of two product Price IDs; fetches Stripe Prices to display accurate prices.
- [src/app/api/create-checkout-session/route.ts](src/app/api/create-checkout-session/route.ts): Validates poster/edition, creates a one-time Checkout Session from a server-controlled Price ID, and returns `{client_secret}`.
- [src/components/posters/StripePosterForm.tsx](src/components/posters/StripePosterForm.tsx): Loads Stripe.js from Stripe's domain, mounts the embedded form, wires the `confirm` event to the SDK action.
- [src/app/api/stripe-webhook/route.ts](src/app/api/stripe-webhook/route.ts): Signature-verifying webhook receiver; currently logging only.
- [src/app/checkout/return/page.tsx](src/app/checkout/return/page.tsx): Checks session status with Stripe before displaying a result.
- Modified existing poster pages and shared purchase UI to show the embedded form only for fully configured variants.

**Resources:** [Embedded form quickstart](https://docs.stripe.com/checkout/form/quickstart), [Stripe Tax for physical goods](https://docs.stripe.com/tax/physical-goods), [Shipping-address collection](https://docs.stripe.com/payments/collect-addresses?ui=checkout-form), [Stripe webhook guide](https://docs.stripe.com/webhooks), [Stripe developer support](https://support.stripe.com), [Stripe MCP](https://docs.stripe.com/mcp).
