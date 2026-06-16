"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import SubmitButton from "@/components/SubmitButton";
import type { Client } from "@/lib/types";
import type { PriceOption } from "@/lib/stripe-prices";

// Drives the Stripe subscription creation flow from the admin UI. It posts to
// /api/stripe/create-subscription, which creates the customer + subscription
// in Stripe (using the chosen live price) and persists the IDs.
export default function SubscriptionForm({
  clients,
  prices,
  onDone,
}: {
  clients: Pick<Client, "id" | "name" | "email">[];
  prices: PriceOption[];
  onDone?: () => void;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError(null);
    const clientId = String(formData.get("client_id"));
    const priceId = String(formData.get("price_id"));
    const client = clients.find((c) => c.id === clientId);

    if (!clientId || !client) {
      setError("Select a client");
      return;
    }
    if (!priceId) {
      setError("Select a plan");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/stripe/create-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: clientId,
          email: client.email,
          price_id: priceId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Request failed");
      toast.success("Subscription created");
      router.refresh();
      onDone?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div>
        <label className="label" htmlFor="client_id">
          Client
        </label>
        <select id="client_id" name="client_id" className="input" required>
          <option value="">Select a client…</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.email})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="label" htmlFor="price_id">
          Plan
        </label>
        {prices.length === 0 ? (
          <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
            No Stripe plans found. Create products & prices in your Stripe
            dashboard, then reopen this form.
          </p>
        ) : (
          <select id="price_id" name="price_id" className="input" required>
            <option value="">Select a plan…</option>
            {prices.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        )}
      </div>

      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300">
          {error}
        </p>
      )}
      <p className="text-xs text-gray-400">
        Plans are pulled live from Stripe. The client is billed for the selected
        plan and invoices sync back to the portal automatically.
      </p>
      <SubmitButton>
        {loading ? "Creating…" : "Create subscription"}
      </SubmitButton>
    </form>
  );
}
