"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "./icons";

// Action row on the client subscription page:
//  • Change plan  → /pricing (reuses Stripe Checkout)
//  • Manage billing → Stripe Customer Billing Portal
export default function SubscriptionActions({
  hasSubscription,
}: {
  hasSubscription: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function openPortal() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      if (res.status === 401) {
        window.location.href =
          "/login?redirectedFrom=/dashboard/subscription";
        return;
      }
      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error ?? "Could not open the billing portal");
      }
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {hasSubscription ? (
          <>
            {/* Portal handles plan switching (proration), card + cancel. */}
            <button
              onClick={openPortal}
              disabled={loading}
              className="btn-primary"
            >
              <Icon name="card" size={15} />
              {loading ? "Opening…" : "Manage plan & billing"}
            </button>
            <Link href="/pricing" className="btn-secondary">
              <Icon name="star" size={15} />
              Compare plans
            </Link>
          </>
        ) : (
          <Link href="/pricing" className="btn-primary">
            <Icon name="star" size={15} />
            View plans
          </Link>
        )}
      </div>
      {error && (
        <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}
