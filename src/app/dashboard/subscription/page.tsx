import { createClient } from "@/lib/supabase/server";
import { getCurrentClient } from "@/lib/client-data";
import { PageHeader, EmptyState, StatusBadge } from "@/components/ui";
import CheckoutSuccessBanner from "@/components/CheckoutSuccessBanner";
import SubscriptionActions from "@/components/SubscriptionActions";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Subscription } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ClientSubscriptionPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string }>;
}) {
  const { checkout } = await searchParams;
  const client = await getCurrentClient();
  if (!client) {
    return (
      <div>
        <PageHeader title="Subscription" />
        <EmptyState title="No subscription" description="Your account isn't linked yet." />
      </div>
    );
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("client_id", client.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const sub = data as Subscription | null;

  return (
    <div>
      <CheckoutSuccessBanner show={checkout === "success"} />
      <PageHeader
        title="Subscription"
        description="Your current plan and billing details."
      />

      {!sub ? (
        <div className="max-w-xl space-y-5">
          <EmptyState
            title="No active subscription"
            description="You don't have a subscription on file yet. Choose a plan to get started."
          />
          <SubscriptionActions hasSubscription={false} />
        </div>
      ) : (
        <div className="card max-w-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Current plan</p>
              <p className="text-3xl font-bold text-gray-900">
                {formatCurrency(Number(sub.price))}
                <span className="text-base font-normal text-gray-500">
                  {" "}
                  / {sub.billing_cycle === "yearly" ? "year" : "month"}
                </span>
              </p>
            </div>
            <StatusBadge status={sub.status} />
          </div>

          <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-gray-100 pt-6 text-sm">
            <div>
              <dt className="text-gray-500">Billing cycle</dt>
              <dd className="font-medium capitalize text-gray-900">
                {sub.billing_cycle}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">Status</dt>
              <dd className="font-medium capitalize text-gray-900">
                {sub.status.replace(/_/g, " ")}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">Started</dt>
              <dd className="font-medium text-gray-900">
                {formatDate(sub.created_at)}
              </dd>
            </div>
          </dl>

          <div className="mt-6 border-t border-gray-100 pt-6">
            <SubscriptionActions hasSubscription />
          </div>
        </div>
      )}
    </div>
  );
}
