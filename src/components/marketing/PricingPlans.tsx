"use client";

import { useState } from "react";
import { Icon } from "@/components/icons";
import {
  PLANS,
  displayPrice,
  type BillingInterval,
  type PlanId,
} from "@/lib/plans";

export default function PricingPlans() {
  const [interval, setInterval] = useState<BillingInterval>("monthly");
  const [loading, setLoading] = useState<PlanId | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function checkout(plan: PlanId) {
    setError(null);
    setLoading(plan);
    try {
      // No sign-in required — Stripe collects the email and the account is
      // created after payment on the /welcome page.
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, interval }),
      });

      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error ?? "Could not start checkout");
      }
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(null);
    }
  }

  return (
    <div>
      {/* Billing toggle */}
      <div className="mt-8 flex items-center justify-center gap-3">
        <span
          className={`text-sm font-medium ${
            interval === "monthly" ? "text-gray-900" : "text-gray-400"
          }`}
        >
          Monthly
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={interval === "yearly"}
          onClick={() =>
            setInterval((i) => (i === "monthly" ? "yearly" : "monthly"))
          }
          className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 ${
            interval === "yearly"
              ? "bg-brand-500"
              : "bg-gray-300 dark:bg-white/20"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
              interval === "yearly" ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
        <span
          className={`text-sm font-medium ${
            interval === "yearly" ? "text-gray-900" : "text-gray-400"
          }`}
        >
          Yearly
        </span>
        <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
          2 months free
        </span>
      </div>

      {error && (
        <p className="mx-auto mt-6 max-w-md rounded-md bg-red-50 px-3 py-2 text-center text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300">
          {error}
        </p>
      )}

      {/* Plan cards */}
      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        {PLANS.map((plan) => {
          const price = displayPrice(plan, interval);
          return (
            <div
              key={plan.id}
              className={`card relative flex h-full flex-col ${
                plan.popular ? "ring-2 ring-brand-500" : ""
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-500 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                  Most popular
                </span>
              )}

              <h3 className="font-display text-2xl font-bold uppercase tracking-tight text-gray-900">
                {plan.name}
              </h3>
              <p className="mt-1 min-h-[2.5rem] text-sm text-gray-500">
                {plan.tagline}
              </p>

              <div className="mt-6 flex items-end gap-1">
                <span className="font-display text-5xl font-bold text-gray-900">
                  ${price.toLocaleString()}
                </span>
                <span className="mb-1.5 text-sm text-gray-500">
                  /{interval === "yearly" ? "year" : "month"}
                </span>
              </div>

              <button
                onClick={() => checkout(plan.id)}
                disabled={loading !== null}
                className={`mt-6 w-full rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors disabled:opacity-60 ${
                  plan.popular
                    ? "bg-brand-500 text-white hover:bg-brand-600"
                    : "border border-gray-300 text-gray-800 hover:bg-gray-50 dark:border-white/15 dark:text-gray-100 dark:hover:bg-white/10"
                }`}
              >
                {loading === plan.id ? "Redirecting…" : "Get started"}
              </button>

              <ul className="mt-8 space-y-3 text-sm">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-gray-600">
                    <span className="mt-0.5 text-brand-500">
                      <Icon name="star" size={15} />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
