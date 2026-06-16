import { createClient } from "@/lib/supabase/server";
import { PageHeader, Table, EmptyState } from "@/components/ui";
import TicketStatusSelect from "@/components/forms/TicketStatusSelect";
import { formatDate } from "@/lib/format";
import type { Ticket } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminTicketsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("tickets")
    .select("*, clients(name)")
    .order("created_at", { ascending: false });

  const tickets = (data as (Ticket & { clients?: { name?: string } })[]) ?? [];

  return (
    <div>
      <PageHeader
        title="Support tickets"
        description="All tickets from every client. Update status inline."
      />

      {tickets.length === 0 ? (
        <EmptyState title="No tickets" description="Client tickets will appear here." />
      ) : (
        <Table
          head={
            <tr>
              <th className="px-4 py-3">Subject</th>
              <th className="px-4 py-3">Client</th>
              <th className="px-4 py-3">Message</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          }
        >
          {tickets.map((t) => (
            <tr key={t.id} className="align-top">
              <td className="px-4 py-3 font-medium">
                <a
                  href={`/admin/tickets/${t.id}`}
                  className="text-gray-900 hover:text-brand-600 hover:underline"
                >
                  {t.subject}
                </a>
              </td>
              <td className="px-4 py-3 text-gray-600">
                {t.clients?.name ?? "—"}
              </td>
              <td className="max-w-xs px-4 py-3 text-gray-500">
                <span className="line-clamp-2">{t.message}</span>
              </td>
              <td className="px-4 py-3 text-gray-500">
                {formatDate(t.created_at)}
              </td>
              <td className="px-4 py-3">
                <TicketStatusSelect id={t.id} status={t.status} />
              </td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
}
