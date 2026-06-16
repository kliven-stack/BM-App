import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, StatusBadge } from "@/components/ui";
import TicketThread from "@/components/TicketThread";
import TicketReplyForm from "@/components/forms/TicketReplyForm";
import type { Ticket, TicketMessage } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ClientTicketDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // RLS ensures the client can only load their own ticket.
  const { data: ticketData } = await supabase
    .from("tickets")
    .select("*")
    .eq("id", id)
    .single();

  if (!ticketData) notFound();
  const ticket = ticketData as Ticket;

  const { data: msgs } = await supabase
    .from("ticket_messages")
    .select("*")
    .eq("ticket_id", id)
    .order("created_at", { ascending: true });
  const messages = (msgs as TicketMessage[]) ?? [];

  return (
    <div className="max-w-3xl">
      <Link
        href="/dashboard/tickets"
        className="text-sm text-brand-600 hover:underline"
      >
        ← All tickets
      </Link>

      <div className="mt-3">
        <PageHeader
          title={ticket.subject}
          action={<StatusBadge status={ticket.status} />}
        />
      </div>

      <div className="card">
        <TicketThread ticket={ticket} messages={messages} />
        <TicketReplyForm ticketId={ticket.id} kind="client" />
      </div>
    </div>
  );
}
