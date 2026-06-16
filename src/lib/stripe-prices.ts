import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";

export interface PriceOption {
  id: string;
  label: string;
  amount: number;
  interval: string;
}

// Lists active recurring prices from Stripe (with product names) for the admin
// "new subscription" dropdown. Returns [] if Stripe isn't configured.
export async function listStripePrices(): Promise<PriceOption[]> {
  try {
    const prices = await getStripe().prices.list({
      active: true,
      type: "recurring",
      limit: 100,
      expand: ["data.product"],
    });

    return prices.data
      .filter((p) => p.unit_amount != null)
      .map((p) => {
        const product = p.product as Stripe.Product | Stripe.DeletedProduct;
        const name =
          product && !("deleted" in product) ? product.name : "Plan";
        const amount = (p.unit_amount ?? 0) / 100;
        const interval = p.recurring?.interval ?? "month";
        return {
          id: p.id,
          label: `${name} — $${amount.toLocaleString()}/${interval}`,
          amount,
          interval,
          deleted: product && "deleted" in product,
        };
      })
      .filter((o) => !o.deleted)
      .map(({ deleted: _deleted, ...o }) => o)
      .sort((a, b) => a.amount - b.amount);
  } catch {
    return [];
  }
}
