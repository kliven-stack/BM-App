import { NextResponse } from "next/server";
import { z } from "zod";
import { getStripe } from "@/lib/stripe";
import { getProfile } from "@/lib/auth";
import { getCurrentClient } from "@/lib/client-data";
import { getPlan, priceIdFor } from "@/lib/plans";

const bodySchema = z.object({
  plan: z.enum(["launch", "growth", "dominate"]),
  interval: z.enum(["monthly", "yearly"]),
});

// POST /api/stripe/checkout
// Public, checkout-first subscription. No sign-in required — Stripe collects the
// email and the account is provisioned afterwards (webhook + /welcome page).
// Signed-in clients keep their account linked and return to the portal.
export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message },
        { status: 400 },
      );
    }

    const plan = getPlan(parsed.data.plan);
    if (!plan) {
      return NextResponse.json({ error: "Unknown plan" }, { status: 400 });
    }
    const { interval } = parsed.data;
    const priceId = priceIdFor(plan, interval);

    const origin =
      request.headers.get("origin") ??
      process.env.NEXT_PUBLIC_SITE_URL ??
      "http://localhost:3000";

    // Optional: if a client is already signed in, keep the link + skip /welcome.
    const profile = await getProfile();
    const client = profile ? await getCurrentClient() : null;
    const isGuest = !profile;

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      // Signed-in users reuse their email; guests enter it on Stripe's page.
      customer_email: profile?.email ?? undefined,
      success_url: isGuest
        ? `${origin}/welcome?session_id={CHECKOUT_SESSION_ID}`
        : `${origin}/dashboard/subscription?checkout=success`,
      cancel_url: `${origin}/pricing?checkout=cancelled`,
      metadata: {
        plan: plan.id,
        interval,
        client_id: client?.id ?? "",
        billing_cycle: interval === "yearly" ? "yearly" : "monthly",
        price: String(plan.monthly),
      },
      subscription_data: {
        metadata: { plan: plan.id, client_id: client?.id ?? "" },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
