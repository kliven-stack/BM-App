import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/server";

// Stripe must be able to send the raw, unparsed body for signature verification.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/stripe/webhook
// Verifies the signature, then reconciles subscription + invoice state into the
// database using the service-role client (bypasses RLS — this is trusted code).
export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !secret) {
    return NextResponse.json(
      { error: "Missing signature or webhook secret" },
      { status: 400 },
    );
  }

  const payload = await request.text();

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(payload, signature, secret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const supabase = createAdminClient();

  try {
    switch (event.type) {
      case "invoice.payment_succeeded":
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await upsertInvoice(supabase, invoice);
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await supabase
          .from("subscriptions")
          .update({ status: subscription.status })
          .eq("stripe_subscription_id", subscription.id);
        break;
      }

      case "checkout.session.completed": {
        // A self-serve subscription from the pricing page. Record it against
        // the client (resolved at checkout time via metadata.client_id).
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === "subscription") {
          await recordCheckoutSubscription(supabase, session);
        }
        break;
      }

      default:
        // Unhandled event types are acknowledged so Stripe stops retrying.
        break;
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Handler error";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

// Map a Stripe invoice onto our local subscription, then upsert the invoice row.
async function upsertInvoice(
  supabase: ReturnType<typeof createAdminClient>,
  invoice: Stripe.Invoice,
) {
  const stripeSubscriptionId =
    typeof invoice.subscription === "string"
      ? invoice.subscription
      : invoice.subscription?.id ?? null;

  let subscriptionId: string | null = null;
  if (stripeSubscriptionId) {
    const { data: sub } = await supabase
      .from("subscriptions")
      .select("id")
      .eq("stripe_subscription_id", stripeSubscriptionId)
      .maybeSingle();
    subscriptionId = sub?.id ?? null;
  }

  await supabase.from("invoices").upsert(
    {
      subscription_id: subscriptionId,
      stripe_invoice_id: invoice.id,
      amount: (invoice.amount_paid || invoice.amount_due || 0) / 100,
      status: invoice.status ?? "open",
      hosted_invoice_url: invoice.hosted_invoice_url ?? null,
    },
    { onConflict: "stripe_invoice_id" },
  );
}

// Persist a subscription created through self-serve Checkout. In the
// checkout-first flow there may be no account yet, so we find-or-create the
// client by email here. The login itself is created later on /welcome.
// Idempotent: existing client/subscription rows are reused, not duplicated.
async function recordCheckoutSubscription(
  supabase: ReturnType<typeof createAdminClient>,
  session: Stripe.Checkout.Session,
) {
  const email =
    session.customer_details?.email ?? session.customer_email ?? null;
  const name = session.customer_details?.name ?? null;

  // Resolve the client: prefer the linked id (signed-in flow), else match or
  // create by email (guest checkout-first flow).
  let clientId = session.metadata?.client_id || null;

  if (!clientId && email) {
    const { data: found } = await supabase
      .from("clients")
      .select("id")
      .ilike("email", email)
      .maybeSingle();

    if (found?.id) {
      clientId = found.id;
    } else {
      const { data: created } = await supabase
        .from("clients")
        .insert({
          name: name || email.split("@")[0],
          email,
        })
        .select("id")
        .single();
      clientId = created?.id ?? null;
    }
  }

  if (!clientId) return; // Nothing we can safely attach to.

  const subscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id ?? null;
  const customerId =
    typeof session.customer === "string"
      ? session.customer
      : session.customer?.id ?? null;

  let status = "active";
  if (subscriptionId) {
    try {
      const sub = await getStripe().subscriptions.retrieve(subscriptionId);
      status = sub.status;
    } catch {
      // Keep the optimistic default if the lookup fails.
    }
  }

  const row = {
    client_id: clientId,
    stripe_customer_id: customerId,
    stripe_subscription_id: subscriptionId,
    status,
    price: Number(session.metadata?.price ?? 0),
    billing_cycle: session.metadata?.billing_cycle ?? "monthly",
  };

  const { data: existing } = subscriptionId
    ? await supabase
        .from("subscriptions")
        .select("id")
        .eq("stripe_subscription_id", subscriptionId)
        .maybeSingle()
    : { data: null };

  if (existing?.id) {
    await supabase.from("subscriptions").update(row).eq("id", existing.id);
  } else {
    await supabase.from("subscriptions").insert(row);
  }
}
