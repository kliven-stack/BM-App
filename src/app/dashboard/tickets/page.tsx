import { createClient } from "@/lib/supabase/server";
import { getCurrentClient } from "@/lib/client-data";
import { PageHeader, EmptyState, StatusBadge } from "@/components/ui";
import TicketForm from "@/components/forms/TicketForm";
import { formatDate } from "@/lib/format";
import type { Ticket } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ClientTicketsPage() {
  const client = await getCurrentClient();

  if (!client) {
    return (
      <div>
        <PageHeader title="Support" />
        <EmptyState
          title="Your account isn't linked yet"
          description="An administrator needs to link your account before you can open tickets."
        />
      </div>
    );
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("tickets")
    .select("*")
    .eq("client_id", client.id)
    .order("created_at", { ascending: false });

  const tickets = (data as Ticket[]) ?? [];

  return (
    <div>
      <PageHeader
        title="Support"
        description="Open a ticket and track its status."
      />

      <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
        <div>
          <h2 className="mb-3 text-sm font-semibold text-gray-700">
            New ticket
          </h2>
          <TicketForm />
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold text-gray-700">
            Your tickets
          </h2>
          {tickets.length === 0 ? (
            <EmptyState
              title="No tickets yet"
              description="When you submit a ticket it will appear here."
            />
          ) : (
            <ul className="space-y-3">
              {tickets.map((t) => (
                <li key={t.id} className="card">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <a
                        href={`/dashboard/tickets/${t.id}`}
                        className="font-semibold text-gray-900 hover:text-brand-600 hover:underline"
                      >
                        {t.subject}
                      </a>
                      <p className="mt-1 text-sm text-gray-600">{t.message}</p>
                    </div>
                    <StatusBadge status={t.status} />
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-xs text-gray-400">
                      Opened {formatDate(t.created_at)}
                    </p>
                    <a
                      href={`/dashboard/tickets/${t.id}`}
                      className="text-xs font-medium text-brand-600 hover:underline"
                    >
                      View / reply →
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
