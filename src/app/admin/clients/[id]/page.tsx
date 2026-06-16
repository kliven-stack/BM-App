import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, Table, StatusBadge, StatCard } from "@/components/ui";
import ClientCrmPanel from "@/components/forms/ClientCrmPanel";
import { formatCurrency, formatDate } from "@/lib/format";
import type {
  Client,
  ClientNote,
  Subscription,
  Ticket,
  Website,
} from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminClientDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: clientData } = await supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .single();
  if (!clientData) notFound();
  const client = clientData as Client;

  const [websitesRes, subRes, ticketsRes, notesRes] = await Promise.all([
    supabase.from("websites").select("*").eq("client_id", id),
    supabase
      .from("subscriptions")
      .select("*")
      .eq("client_id", id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("tickets")
      .select("*")
      .eq("client_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("client_notes")
      .select("*")
      .eq("client_id", id)
      .order("created_at", { ascending: false }),
  ]);

  const websites = (websitesRes.data as Website[]) ?? [];
  const sub = subRes.data as Subscription | null;
  const tickets = (ticketsRes.data as Ticket[]) ?? [];
  const notes = (notesRes.data as ClientNote[]) ?? [];

  return (
    <div className="max-w-4xl">
      <Link
        href="/admin/clients"
        className="text-sm text-brand-600 hover:underline"
      >
        ← All clients
      </Link>

      <div className="mt-3">
        <PageHeader
          title={client.name}
          description={client.email}
          action={<StatusBadge status={client.status} />}
        />
      </div>

      {client.tags.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {client.tags.map((t) => (
            <span
              key={t}
              className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-600 dark:bg-brand-500/15 dark:text-brand-300"
            >
              {t}
            </span>
          ))}
        </div>
      )}

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Websites" value={websites.length} icon="globe" />
        <StatCard
          label="Subscription"
          value={sub ? formatCurrency(Number(sub.price)) : "None"}
          hint={sub ? sub.status : undefined}
          icon="card"
        />
        <StatCard label="Tickets" value={tickets.length} icon="ticket" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          {/* Websites */}
          <div>
            <h2 className="mb-3 text-sm font-semibold text-gray-700">
              Websites
            </h2>
            {websites.length === 0 ? (
              <p className="text-sm text-gray-400">No websites.</p>
            ) : (
              <Table head={<tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">URL</th></tr>}>
                {websites.map((w) => (
                  <tr key={w.id}>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {w.name}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{w.url}</td>
                  </tr>
                ))}
              </Table>
            )}
          </div>

          {/* Tickets */}
          <div>
            <h2 className="mb-3 text-sm font-semibold text-gray-700">Tickets</h2>
            {tickets.length === 0 ? (
              <p className="text-sm text-gray-400">No tickets.</p>
            ) : (
              <ul className="space-y-2">
                {tickets.map((t) => (
                  <li key={t.id}>
                    <Link
                      href={`/admin/tickets/${t.id}`}
                      className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-2.5 text-sm hover:bg-gray-50 dark:border-white/10 dark:hover:bg-white/5"
                    >
                      <span className="font-medium text-gray-900">
                        {t.subject}
                      </span>
                      <span className="flex items-center gap-3">
                        <StatusBadge status={t.status} />
                        <span className="text-xs text-gray-400">
                          {formatDate(t.created_at)}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* CRM sidebar */}
        <ClientCrmPanel
          clientId={client.id}
          status={client.status}
          tags={client.tags}
          notes={notes}
        />
      </div>
    </div>
  );
}
