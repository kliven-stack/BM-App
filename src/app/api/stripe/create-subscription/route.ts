import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { subscriptionCreateSchema } from "@/lib/validations";

// POST /api/stripe/create-subscription
// Admin-only. Creates (or reuses) a Stripe customer, opens a subscription for
// the selected Stripe price, and persists the IDs against the client. Invoice
// rows are populated later by the webhook.
export async function POST(request: Request) {
  try {
    await requireRole("admin");

    const json = await request.json();
    const parsed = subscriptionCreateSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message },
        { status: 400 },
      );
    }
    const { client_id, email, price_id } = parsed.data;

    const stripe = getStripe();

    // Look up the chosen price to record amount + interval locally.
    const stripePrice = await stripe.prices.retrieve(price_id);
    const amount = (stripePrice.unit_amount ?? 0) / 100;
    const billing_cycle =
      stripePrice.recurring?.interval === "year" ? "yearly" : "monthly";

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
      items: [{ price: price_id }],
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
      price: amount,
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
