import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { subscriptionSchema } from "@/lib/validations";

// POST /api/stripe/create-subscription
// Admin-only. Creates (or reuses) a Stripe customer, opens a subscription for
// the configured price, and persists the IDs against the client. Invoice rows
// are populated later by the webhook.
export async function POST(request: Request) {
  try {
    await requireRole("admin");

    const json = await request.json();
    const parsed = subscriptionSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message },
        { status: 400 },
      );
    }
    const { client_id, email, price, billing_cycle } = parsed.data;

    const priceId = process.env.STRIPE_DEFAULT_PRICE_ID;
    if (!priceId) {
      return NextResponse.json(
        { error: "STRIPE_DEFAULT_PRICE_ID is not configured" },
        { status: 500 },
      );
    }

    const stripe = getStripe();
    const supabase = await createClient();

    // Reuse an existing Stripe customer for this client if we have one.
    const { data: existing } = await supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("client_id", client_id)
      .not("stripe_customer_id", "is", null)
      .limit(1)
      .maybeSingle();

    let customerId = existing?.stripe_customer_id ?? null;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email,
        metadata: { client_id },
      });
      customerId = customer.id;
    }

    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: "default_incomplete",
      collection_method: "charge_automatically",
      expand: ["latest_invoice"],
      metadata: { client_id },
    });

    // Persist the subscription. The webhook keeps status/price in sync later.
    const { error } = await supabase.from("subscriptions").insert({
      client_id,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscription.id,
      status: subscription.status,
      price,
      billing_cycle,
    });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      subscription_id: subscription.id,
      customer_id: customerId,
      status: subscription.status,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
