import Link from "next/link";
import { Suspense } from "react";
import { getStripe } from "@/lib/stripe";
import AuthShell from "@/components/AuthShell";
import WelcomeForm from "./WelcomeForm";

export const dynamic = "force-dynamic";

export default async function WelcomePage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;

  let email: string | null = null;
  if (session_id) {
    try {
      const session = await getStripe().checkout.sessions.retrieve(session_id);
      if (session.status === "complete" || session.payment_status === "paid") {
        email = session.customer_details?.email ?? session.customer_email ?? null;
      }
    } catch {
      // Invalid/expired session id — handled below.
    }
  }

  if (!email || !session_id) {
    return (
      <AuthShell
        title="Welcome"
        subtitle="We couldn't verify your checkout."
      >
        <div className="card text-center text-sm text-gray-500">
          <p>
            We couldn&apos;t find a completed checkout. If you just paid, wait a
            moment and refresh — or{" "}
            <Link
              href="/login"
              className="font-medium text-brand-600 hover:underline"
            >
              sign in
            </Link>{" "}
            if you already have an account.
          </p>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="You're almost in 🎉"
      subtitle="Set a password to finish creating your account."
    >
      <Suspense>
        <WelcomeForm sessionId={session_id} email={email} />
      </Suspense>
    </AuthShell>
  );
}
