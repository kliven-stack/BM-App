import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, StatCard, Table, StatusBadge } from "@/components/ui";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminOverview() {
  const supabase = await createClient();

  // Admin RLS grants full read access, so these counts span all tenants.
  const [clients, websites, subs, openTickets, recentTickets] =
    await Promise.all([
      supabase.from("clients").select("id", { count: "exact", head: true }),
      supabase.from("websites").select("id", { count: "exact", head: true }),
      supabase
        .from("subscriptions")
        .select("id", { count: "exact", head: true })
        .eq("status", "active"),
      supabase
        .from("tickets")
        .select("id", { count: "exact", head: true })
        .eq("status", "open"),
      supabase
        .from("tickets")
        .select("id, subject, status, created_at, clients(name)")
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

  return (
    <div>
      <PageHeader
        title="Overview"
        description="A snapshot across every client in the portal."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Clients" value={clients.count ?? 0} icon="users" />
        <StatCard label="Websites" value={websites.count ?? 0} icon="globe" />
        <StatCard
          label="Active subscriptions"
          value={subs.count ?? 0}
          icon="card"
        />
        <StatCard
          label="Open tickets"
          value={openTickets.count ?? 0}
          icon="ticket"
        />
      </div>

      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Recent tickets</h2>
          <Link href="/admin/tickets" className="text-sm text-brand-600 hover:underline">
            View all →
          </Link>
        </div>
        <Table
          head={
            <tr>
              <th className="px-4 py-3">Subject</th>
              <th className="px-4 py-3">Client</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Created</th>
            </tr>
          }
        >
          {(recentTickets.data ?? []).map((t) => {
            // Supabase types the joined relation loosely; narrow it here.
            const client = (t as unknown as { clients?: { name?: string } })
              .clients;
            return (
              <tr key={t.id}>
                <td className="px-4 py-3 font-medium text-gray-900">
                  {t.subject}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {client?.name ?? "—"}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={t.status} />
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {formatDate(t.created_at)}
                </td>
              </tr>
            );
          })}
          {!recentTickets.data?.length && (
            <tr>
              <td colSpan={4} className="px-4 py-6 text-center text-gray-500">
                No tickets yet.
              </td>
            </tr>
          )}
        </Table>
      </div>
    </div>
  );
}
