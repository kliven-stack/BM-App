import Stripe from "stripe";

// Server-only Stripe client. The secret key must never reach the browser.
//
// Lazily instantiated: the Stripe constructor throws on an empty key, and we
// don't want that to break `next build` (which imports route modules without
// runtime env). Call getStripe() inside handlers, where the env is present.
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (_stripe) return _stripe;

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }

  _stripe = new Stripe(key, {
    apiVersion: "2025-02-24.acacia",
    typescript: true,
  });
  return _stripe;
}
