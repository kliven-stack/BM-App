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
    {
      role: "client" as const,
      body: ticket.message,
      at: ticket.created_at,
      attachmentPath: null as string | null,
      attachmentName: null as string | null,
    },
    ...messages.map((m) => ({
      role: m.author_role,
      body: m.body,
      at: m.created_at,
      attachmentPath: m.attachment_path,
      attachmentName: m.attachment_name,
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
              {m.attachmentPath && (
                <a
                  href={`/api/tickets/attachment?path=${encodeURIComponent(
                    m.attachmentPath,
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className={`mt-2 inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium ${
                    isAdmin
                      ? "bg-white/15 text-white hover:bg-white/25"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-white/10 dark:text-gray-100"
                  }`}
                >
                  📎 {m.attachmentName ?? "Attachment"}
                </a>
              )}
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
