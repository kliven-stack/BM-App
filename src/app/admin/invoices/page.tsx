import { createClient } from "@/lib/supabase/server";
import { PageHeader, Table, EmptyState, StatusBadge, StatCard } from "@/components/ui";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Invoice } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminInvoicesPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("invoices")
    .select("*, subscriptions(clients(name))")
    .order("created_at", { ascending: false });

  const invoices = (data as (Invoice & {
    subscriptions?: { clients?: { name?: string } };
  })[]) ?? [];

  const paidTotal = invoices
    .filter((i) => i.status === "paid")
    .reduce((sum, i) => sum + Number(i.amount), 0);

  return (
    <div>
      <PageHeader
        title="Invoices"
        description="Every invoice synced from Stripe across all clients."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Invoices" value={invoices.length} icon="receipt" />
        <StatCard
          label="Collected"
          value={formatCurrency(paidTotal)}
          icon="card"
        />
        <StatCard
          label="Open / unpaid"
          value={invoices.filter((i) => i.status !== "paid").length}
          icon="ticket"
        />
      </div>

      {invoices.length === 0 ? (
        <EmptyState
          title="No invoices yet"
          description="Invoices appear here automatically once Stripe charges a subscription."
        />
      ) : (
        <Table
          head={
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Client</th>
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
                {inv.subscriptions?.clients?.name ?? "—"}
              </td>
              <td className="px-4 py-3 text-gray-600">
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
