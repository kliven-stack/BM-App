import { createClient } from "@/lib/supabase/server";
import { PageHeader, Table, EmptyState, StatusBadge } from "@/components/ui";
import AddSubscriptionButton from "@/components/forms/AddSubscriptionButton";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Client, Subscription } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminSubscriptionsPage() {
  const supabase = await createClient();

  const [clientsRes, subsRes] = await Promise.all([
    supabase.from("clients").select("id, name, email").order("name"),
    supabase
      .from("subscriptions")
      .select("*, clients(name)")
      .order("created_at", { ascending: false }),
  ]);

  const clients = (clientsRes.data as Pick<Client, "id" | "name" | "email">[]) ?? [];
  const subs = (subsRes.data as (Subscription & {
    clients?: { name?: string };
  })[]) ?? [];

  return (
    <div>
      <PageHeader
        title="Subscriptions"
        description="Stripe subscriptions per client."
        action={<AddSubscriptionButton clients={clients} />}
      />

      {subs.length === 0 ? (
        <EmptyState
          title="No subscriptions yet"
          description="Create a subscription to bill a client through Stripe."
        />
      ) : (
        <Table
          head={
            <tr>
              <th className="px-4 py-3">Client</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Cycle</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Stripe sub</th>
              <th className="px-4 py-3">Created</th>
            </tr>
          }
        >
          {subs.map((s) => (
            <tr key={s.id}>
              <td className="px-4 py-3 font-medium text-gray-900">
                {s.clients?.name ?? "—"}
              </td>
              <td className="px-4 py-3 text-gray-600">
                {formatCurrency(Number(s.price))}
              </td>
              <td className="px-4 py-3 capitalize text-gray-600">
                {s.billing_cycle}
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={s.status} />
              </td>
              <td className="px-4 py-3 font-mono text-xs text-gray-400">
                {s.stripe_subscription_id ?? "—"}
              </td>
              <td className="px-4 py-3 text-gray-500">
                {formatDate(s.created_at)}
              </td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
}
