import { formatDate } from "@/lib/format";
import type { Ticket, TicketMessage } from "@/lib/types";

// Renders a ticket as a conversation: the original message first, then replies.
export default function TicketThread({
  ticket,
  messages,
}: {
  ticket: Ticket;
  messages: TicketMessage[];
}) {
  const items = [
    { role: "client" as const, body: ticket.message, at: ticket.created_at },
    ...messages.map((m) => ({
      role: m.author_role,
      body: m.body,
      at: m.created_at,
    })),
  ];

  return (
    <div className="space-y-3">
      {items.map((m, i) => {
        const isAdmin = m.role === "admin";
        return (
          <div
            key={i}
            className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                isAdmin
                  ? "bg-brand-500 text-white"
                  : "bg-gray-100 text-gray-800 dark:bg-white/10 dark:text-gray-100"
              }`}
            >
              <p className="whitespace-pre-wrap">{m.body}</p>
              <p
                className={`mt-1 text-[10px] ${
                  isAdmin ? "text-white/70" : "text-gray-400"
                }`}
              >
                {isAdmin ? "Support" : "You / Client"} · {formatDate(m.at)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
