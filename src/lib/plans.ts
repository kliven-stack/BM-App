// Marketing plans — the single source of truth shared by the pricing page and
// the Stripe Checkout route. The client only sends a planId + interval; the
// server reads the real amount from here so prices can't be tampered with.

export type PlanId = "launch" | "growth" | "dominate";
export type BillingInterval = "monthly" | "yearly";

export interface Plan {
  id: PlanId;
  name: string;
  tagline: string;
  /** Monthly price in whole dollars. Yearly bills 10× (2 months free). */
  monthly: number;
  features: string[];
  popular?: boolean;
  // Stripe identifiers (created via the API; see scripts/notes in README).
  stripeProductId: string;
  stripePriceMonthly: string;
  stripePriceYearly: string;
}

export const PLANS: Plan[] = [
  {
    id: "launch",
    name: "Launch",
    tagline: "For local businesses that want to get found on Google.",
    monthly: 499,
    stripeProductId: "prod_UiCaXGcWHtqzPa",
    stripePriceMonthly: "price_1TimB0PsWAvqzXzNpGBekX4W",
    stripePriceYearly: "price_1TimB1PsWAvqzXzN2uHJ8zlj",
    features: [
      "Technical SEO audit & fixes",
      "5 target keywords",
      "2 SEO content pieces / month",
      "Google Business Profile optimization",
      "Monthly performance report",
    ],
  },
  {
    id: "growth",
    name: "Growth",
    tagline: "Compounding traffic, leads and sales — month after month.",
    monthly: 999,
    popular: true,
    stripeProductId: "prod_UiCalDHDYKfm7I",
    stripePriceMonthly: "price_1TimB2PsWAvqzXzN0GZSTes8",
    stripePriceYearly: "price_1TimB3PsWAvqzXzNVh20LFMp",
    features: [
      "Everything in Launch",
      "20 target keywords",
      "Conversion-optimized landing pages",
      "Authority link building",
      "Lead & conversion tracking",
      "Bi-weekly strategy calls",
    ],
  },
  {
    id: "dominate",
    name: "Dominate",
    tagline: "Full-funnel domination across search, social and ads.",
    monthly: 1999,
    stripeProductId: "prod_UiCavyWRmHJl0m",
    stripePriceMonthly: "price_1TimB4PsWAvqzXzN9B5MeRCA",
    stripePriceYearly: "price_1TimB4PsWAvqzXzNyeIOTvqc",
    features: [
      "Everything in Growth",
      "Unlimited keywords",
      "Google Ads + Facebook Ads management",
      "Marketing automation & email flows",
      "Dedicated growth strategist",
      "Priority support",
    ],
  },
];

export function getPlan(id: string): Plan | undefined {
  return PLANS.find((p) => p.id === id);
}

// The Stripe Price id for a plan + interval.
export function priceIdFor(plan: Plan, interval: BillingInterval): string {
  return interval === "yearly" ? plan.stripePriceYearly : plan.stripePriceMonthly;
}

// Look a plan up from a Stripe price id (used in the webhook).
export function planByPriceId(
  priceId: string,
): { plan: Plan; interval: BillingInterval } | undefined {
  for (const plan of PLANS) {
    if (plan.stripePriceMonthly === priceId)
      return { plan, interval: "monthly" };
    if (plan.stripePriceYearly === priceId) return { plan, interval: "yearly" };
  }
  return undefined;
}

// Amount to charge (in cents) for a plan + interval. Yearly = 10 months.
export function planAmountCents(plan: Plan, interval: BillingInterval): number {
  const months = interval === "yearly" ? 10 : 1;
  return plan.monthly * months * 100;
}

export function displayPrice(plan: Plan, interval: BillingInterval): number {
  return interval === "yearly" ? plan.monthly * 10 : plan.monthly;
}
