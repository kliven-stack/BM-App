"use server";

import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/server";
import { sendEmail, emailLayout } from "@/lib/email";

type Result = { ok?: boolean; error?: string };

// Called from the /welcome page after a successful Checkout. Verifies the
// Stripe session server-side, then provisions the client's login with the
// password they chose. The subscription itself is recorded by the webhook.
export async function completeSignup(
  sessionId: string,
  password: string,
): Promise<Result> {
  if (!sessionId) return { error: "Missing checkout session." };
  if (!password || password.length < 6) {
    return { error: "Password must be at least 6 characters." };
  }

  const stripe = getStripe();
  let session;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId);
  } catch {
    return { error: "Could not verify your checkout session." };
  }

  if (session.status !== "complete" && session.payment_status !== "paid") {
    return { error: "This checkout isn't completed yet. Try again shortly." };
  }

  const email = session.customer_details?.email ?? session.customer_email;
  if (!email) {
    return { error: "No email was found on this checkout." };
  }
  const name = session.customer_details?.name ?? email.split("@")[0];

  const admin = createAdminClient();

  // Create the login. The DB trigger creates the matching profile (role client).
  const { error: authError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name, role: "client" },
  });

  if (authError) {
    if (/already|registered|exists/i.test(authError.message)) {
      return {
        error: "An account already exists for this email — please sign in.",
      };
    }
    return { error: authError.message };
  }

  // Ensure a clients row exists (the webhook usually creates it first).
  const { data: existing } = await admin
    .from("clients")
    .select("id")
    .ilike("email", email)
    .maybeSingle();
  if (!existing) {
    await admin.from("clients").insert({ name, email });
  }

  await sendEmail({
    to: email,
    subject: "Welcome to Blend Mode 🎉",
    html: emailLayout(
      "Your account is ready",
      `<p>Hi ${name},</p><p>Thanks for subscribing! Your client portal is ready — sign in any time to track your websites, metrics, invoices and support.</p>`,
    ),
  });

  return { ok: true };
}
