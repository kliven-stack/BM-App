import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { askClaude, aiEnabled } from "@/lib/ai";
import type { TicketMessage } from "@/lib/types";

// POST /api/ai/suggest-reply  { ticket_id }
// Drafts a professional support reply for an admin to review/edit.
export async function POST(request: Request) {
  await requireRole("admin");
  if (!aiEnabled()) {
    return NextResponse.json({ error: "AI is not configured." }, { status: 503 });
  }

  const { ticket_id } = (await request.json()) as { ticket_id?: string };
  if (!ticket_id) {
    return NextResponse.json({ error: "Missing ticket_id" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: ticket } = await supabase
    .from("tickets")
    .select("subject, message")
    .eq("id", ticket_id)
    .maybeSingle();
  if (!ticket) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data: msgs } = await supabase
    .from("ticket_messages")
    .select("*")
    .eq("ticket_id", ticket_id)
    .order("created_at", { ascending: true });
  const messages = (msgs as TicketMessage[]) ?? [];

  const convo = [
    `Client: ${ticket.message}`,
    ...messages.map(
      (m) => `${m.author_role === "admin" ? "Support" : "Client"}: ${m.body}`,
    ),
  ].join("\n");

  const prompt = `You are a friendly, professional support agent for Blend Mode, a digital marketing agency. Draft a concise, helpful reply to the client's latest message in this support thread (subject: "${ticket.subject}"). Be warm and solution-oriented. Return only the reply text, no preamble.\n\nThread:\n${convo}`;

  const draft = await askClaude(prompt, 400);
  if (!draft) {
    return NextResponse.json(
      { error: "Could not draft a reply right now." },
      { status: 502 },
    );
  }
  return NextResponse.json({ draft });
}
