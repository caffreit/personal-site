"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import type { PosterId } from "@/lib/stripePosterCheckout";

type StripeForm = {
  mount: (selector: string) => void;
  unmount?: () => void;
  on: (event: "confirm", listener: (event: unknown) => void) => void;
};
type FormActions = { confirm: (options: { formConfirmEvent: unknown }) => Promise<unknown> };
type CheckoutFormSdk = {
  createForm: (options: { layout: "expanded" }) => StripeForm;
  loadActions: () => Promise<{ type: string; actions?: FormActions }>;
};

declare global {
  interface Window {
    Stripe?: (publishableKey: string) => {
      initCheckoutFormSdk: (options: {
        clientSecret: string;
        appearance: Record<string, unknown>;
      }) => CheckoutFormSdk;
    };
  }
}

const appearance = {
  theme: "stripe",
  labels: "auto",
  inputs: "spaced",
  variables: {
    borderRadius: "4px",
    colorBackground: "#ffffff",
    colorDanger: "#df1b41",
    colorPrimary: "#0570de",
    colorSuccess: "#00c853",
    colorText: "#30313d",
    fontFamily: "default",
    fontSizeBase: "16px",
    spacingUnit: "4px",
  },
};

export default function StripePosterForm({
  posterId,
  variantId,
  publishableKey,
}: {
  posterId: PosterId;
  variantId: string;
  publishableKey: string;
}) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [stripeReady, setStripeReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formId = "stripe-checkout-form-" + posterId + "-" + variantId;

  useEffect(() => {
    const controller = new AbortController();
    async function startCheckout() {
      try {
        const response = await fetch("/api/create-checkout-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ posterId, variantId }),
          signal: controller.signal,
          cache: "no-store",
        });
        const data = (await response.json()) as { client_secret?: string; error?: string };
        if (!response.ok || !data.client_secret) {
          throw new Error(data.error || "Could not start checkout.");
        }
        if (!controller.signal.aborted) setClientSecret(data.client_secret);
      } catch (reason) {
        if (!controller.signal.aborted) {
          setError(reason instanceof Error ? reason.message : "Could not start checkout.");
        }
      }
    }
    void startCheckout();
    return () => controller.abort();
  }, [posterId, variantId]);

  useEffect(() => {
    if (!clientSecret || !stripeReady) return;
    const stripe = window.Stripe?.(publishableKey);
    if (!stripe) {
      setError("The secure payment form could not be loaded.");
      return;
    }

    let active = true;
    const checkout = stripe.initCheckoutFormSdk({ clientSecret, appearance });
    const form = checkout.createForm({ layout: "expanded" });
    try {
      form.mount("#" + formId);
    } catch {
      setError("The secure payment form could not be displayed.");
      return;
    }

    void checkout.loadActions().then((result) => {
      if (!active) return;
      if (result.type !== "success" || !result.actions) {
        setError("Unable to initialise the payment form.");
        return;
      }
      form.on("confirm", async (event) => {
        try {
          await result.actions!.confirm({ formConfirmEvent: event });
        } catch {
          if (active) setError("The payment could not be confirmed. Please try again.");
        }
      });
    }).catch(() => {
      if (active) setError("Unable to initialise the payment form.");
    });

    return () => {
      active = false;
      form.unmount?.();
    };
  }, [clientSecret, stripeReady, publishableKey, formId]);

  return (
    <div className="mt-5 border border-[var(--rule-color)] bg-white p-4 text-[#30313d] sm:p-6">
      <Script
        src="https://js.stripe.com/dahlia/stripe.js"
        strategy="afterInteractive"
        onReady={() => setStripeReady(true)}
        onError={() => setError("Stripe could not load. Please refresh and try again.")}
      />
      {!clientSecret && !error && <p role="status" className="text-sm">Preparing secure checkout…</p>}
      {error && <p role="alert" className="mb-3 text-sm text-red-700">{error}</p>}
      <div id={formId} aria-label="Stripe secure payment form" />
      <p className="mt-4 text-xs text-neutral-600">
        Secure payment powered by Stripe. This is a sandbox integration until live keys are configured.
      </p>
    </div>
  );
}
