import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getProfile } from "@/lib/auth";
import { getCurrentClient } from "@/lib/client-data";
import { createClient } from "@/lib/supabase/server";
import { PLANS } from "@/lib/plans";

// POST /api/stripe/portal
// Opens the Stripe Customer Billing Portal for the signed-in client so they can
// update their card, view invoices, or cancel — all managed by Stripe.
export async function POST(request: Request) {
  try {
    const profile = await getProfile();
    if (!profile) {
      return NextResponse.json({ error: "auth_required" }, { status: 401 });
    }

    const client = await getCurrentClient();
    if (!client) {
      return NextResponse.json(
        { error: "No client account is linked to your login." },
        { status: 400 },
      );
    }

    // Find the Stripe customer id from the client's most recent subscription.
    const supabase = await createClient();
    const { data: sub } = await supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("client_id", client.id)
      .not("stripe_customer_id", "is", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const customerId = sub?.stripe_customer_id;
    if (!customerId) {
      return NextResponse.json(
        { error: "No billing account yet — subscribe to a plan first." },
        { status: 400 },
      );
    }

    const origin =
      request.headers.get("origin") ??
      process.env.NEXT_PUBLIC_SITE_URL ??
      "http://localhost:3000";
    const returnUrl = `${origin}/dashboard/subscription`;
    const stripe = getStripe();

    let session;
    try {
      session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
      });
    } catch {
      // In test mode the portal has no default configuration until one is
      // created. Create a sensible default on the fly, then retry.
      const config = await stripe.billingPortal.configurations.create({
        business_profile: {
          headline: "Blend Mode — manage your subscription",
        },
        features: {
          invoice_history: { enabled: true },
          payment_method_update: { enabled: true },
          customer_update: {
            enabled: true,
            allowed_updates: ["email", "address", "phone"],
          },
          subscription_cancel: { enabled: true },
          // Let clients switch plans in-place (proration), no duplicate subs.
          subscription_update: {
            enabled: true,
            default_allowed_updates: ["price"],
            proration_behavior: "create_prorations",
            products: PLANS.map((p) => ({
              product: p.stripeProductId,
              prices: [p.stripePriceMonthly, p.stripePriceYearly],
            })),
          },
        },
      });
      session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
        configuration: config.id,
      });
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
