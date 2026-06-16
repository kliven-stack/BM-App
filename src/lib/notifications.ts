import type { SupabaseClient } from "@supabase/supabase-js";
import { formatDate } from "@/lib/format";
import type { NotificationItem } from "@/components/NotificationBell";
import type { TicketMessage } from "@/lib/types";

function snippet(text: string, n = 70): string {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > n ? `${clean.slice(0, n)}…` : clean;
}

type TicketRow = {
  id: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
  clients?: { name?: string };
};

// Builds bell notifications from tickets + their latest reply, so the detail
// reflects the actual conversation (e.g. "Support replied: …") rather than just
// the status. `viewer` controls the wording and link target.
export async function getTicketNotifications(
  supabase: SupabaseClient,
  opts: { viewer: "admin" | "client"; clientId?: string; limit?: number },
): Promise<NotificationItem[]> {
  const limit = opts.limit ?? 8;

  let ticketQuery = supabase
    .from("tickets")
    .select(
      opts.viewer === "admin"
        ? "id, subject, message, status, created_at, clients(name)"
        : "id, subject, message, status, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (opts.viewer === "client" && opts.clientId) {
    ticketQuery = ticketQuery.eq("client_id", opts.clientId);
  }

  const { data: ticketsData } = await ticketQuery;
  const tickets = (ticketsData as TicketRow[] | null) ?? [];
  if (!tickets.length) return [];

  // Latest message per ticket (one query for all of them).
  const ids = tickets.map((t) => t.id);
  const { data: msgsData } = await supabase
    .from("ticket_messages")
    .select("*")
    .in("ticket_id", ids)
    .order("created_at", { ascending: false });
  const messages = (msgsData as TicketMessage[] | null) ?? [];

  const latestByTicket: Record<string, TicketMessage> = {};
  for (const m of messages) {
    if (!latestByTicket[m.ticket_id]) latestByTicket[m.ticket_id] = m;
  }

  const base = opts.viewer === "admin" ? "/admin/tickets" : "/dashboard/tickets";

  return tickets.map((t) => {
    const last = latestByTicket[t.id];
    let detail: string;

    if (last) {
      const who =
        opts.viewer === "admin"
          ? last.author_role === "client"
            ? "Client replied"
            : "You replied"
          : last.author_role === "admin"
            ? "Support replied"
            : "You replied";
      detail = `${who}: ${snippet(last.body)}`;
    } else {
      detail =
        opts.viewer === "admin"
          ? `New ticket${t.clients?.name ? ` · ${t.clients.name}` : ""}`
          : snippet(t.message);
    }

    return {
      id: t.id,
      title: t.subject,
      detail,
      href: `${base}/${t.id}`,
      time: formatDate(last?.created_at ?? t.created_at),
    };
  });
}
