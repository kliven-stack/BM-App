import { createClient } from "@/lib/supabase/server";
import { getCurrentClient } from "@/lib/client-data";
import { PageHeader, Table, EmptyState, StatusBadge } from "@/components/ui";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Invoice, Subscription } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ClientInvoicesPage() {
  const client = await getCurrentClient();
  if (!client) {
    return (
      <div>
        <PageHeader title="Invoices" />
        <EmptyState title="No invoices" description="Your account isn't linked yet." />
      </div>
    );
  }

  const supabase = await createClient();

  // Invoices are linked to subscriptions, which are linked to the client.
  const { data: subs } = await supabase
    .from("subscriptions")
    .select("id")
    .eq("client_id", client.id);

  const subIds = ((subs as Pick<Subscription, "id">[]) ?? []).map((s) => s.id);

  const { data } = subIds.length
    ? await supabase
        .from("invoices")
        .select("*")
        .in("subscription_id", subIds)
        .order("created_at", { ascending: false })
    : { data: [] as Invoice[] };

  const invoices = (data as Invoice[]) ?? [];

  return (
    <div>
      <PageHeader
        title="Invoices"
        description="Your billing history. Open any invoice for a full receipt."
      />

      {invoices.length === 0 ? (
        <EmptyState
          title="No invoices yet"
          description="Invoices appear here automatically once Stripe charges your subscription."
        />
      ) : (
        <Table
          head={
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Invoice</th>
            </tr>
          }
        >
          {invoices.map((inv) => (
            <tr key={inv.id}>
              <td className="px-4 py-3 text-gray-600">
                {formatDate(inv.created_at)}
              </td>
              <td className="px-4 py-3 font-medium text-gray-900">
                {formatCurrency(Number(inv.amount))}
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={inv.status} />
              </td>
              <td className="px-4 py-3">
                {inv.hosted_invoice_url ? (
                  <a
                    href={inv.hosted_invoice_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-brand-600 hover:underline"
                  >
                    View →
                  </a>
                ) : (
                  <span className="text-gray-400">—</span>
                )}
              </td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
}
