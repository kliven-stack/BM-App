"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { subscriptionSchema } from "@/lib/validations";
import SubmitButton from "@/components/SubmitButton";
import type { Client } from "@/lib/types";

// Drives the Stripe subscription creation flow from the admin UI. It posts to
// /api/stripe/create-subscription, which creates the customer + subscription
// in Stripe and persists the IDs.
export default function SubscriptionForm({
  clients,
  onDone,
}: {
  clients: Pick<Client, "id" | "name" | "email">[];
  onDone?: () => void;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError(null);
    const clientId = String(formData.get("client_id"));
    const client = clients.find((c) => c.id === clientId);

    const payload = {
      client_id: clientId,
      email: client?.email ?? "",
      price: Number(formData.get("price")),
      billing_cycle: String(formData.get("billing_cycle")),
    };

    const parsed = subscriptionSchema.safeParse(payload);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/stripe/create-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Request failed");
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
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label" htmlFor="price">
            Price
          </label>
          <input
            id="price"
            name="price"
            type="number"
            step="0.01"
            min="0"
            className="input"
            defaultValue={49}
            required
          />
        </div>
        <div>
          <label className="label" htmlFor="billing_cycle">
            Billing cycle
          </label>
          <select
            id="billing_cycle"
            name="billing_cycle"
            className="input"
            defaultValue="monthly"
          >
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
      </div>

      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      <p className="text-xs text-gray-400">
        Uses the Stripe test customer + your <code>STRIPE_DEFAULT_PRICE_ID</code>.
        Invoices sync back automatically via the webhook.
      </p>
      <SubmitButton>
        {loading ? "Creating…" : "Create subscription"}
      </SubmitButton>
    </form>
  );
}
