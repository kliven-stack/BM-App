"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { ticketSchema, ticketReplySchema } from "@/lib/validations";
import { sendEmail, emailLayout } from "@/lib/email";
import type { ActionState } from "@/lib/action-state";

// Lets a signed-in client open a support ticket against their own account.
export async function createTicketAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const profile = await requireRole("client");
  const parsed = ticketSchema.safeParse({
    subject: formData.get("subject"),
    message: formData.get("message"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message };
  }

  const supabase = await createClient();

  // Resolve the client row this user owns (RLS returns only their own).
  const { data: client } = await supabase
    .from("clients")
    .select("id")
    .eq("email", profile.email ?? "")
    .single();

  if (!client) {
    return {
      error:
        "No client record is linked to your account yet. Contact your administrator.",
    };
  }

  // RLS check (client_id = current_client_id()) re-validates this insert.
  const { error } = await supabase.from("tickets").insert({
    client_id: client.id,
    subject: parsed.data.subject,
    message: parsed.data.message,
    status: "open",
  });
  if (error) return { error: error.message };

  // Notify the team (no-op without ADMIN_NOTIFY_EMAIL / Resend key).
  const notify = process.env.ADMIN_NOTIFY_EMAIL;
  if (notify) {
    await sendEmail({
      to: notify,
      subject: `New support ticket: ${parsed.data.subject}`,
      html: emailLayout(
        "New support ticket",
        `<p><strong>${profile.name ?? profile.email}</strong> opened a ticket:</p><p><strong>${parsed.data.subject}</strong></p><blockquote style="border-left:3px solid #cb4530;padding-left:12px;color:#374151">${parsed.data.message}</blockquote>`,
      ),
    });
  }

  revalidatePath("/dashboard/tickets");
  return { success: "Ticket submitted" };
}

// Lets a client reply on one of their own tickets.
export async function replyTicketClientAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const profile = await requireRole("client");
  const parsed = ticketReplySchema.safeParse({
    ticket_id: formData.get("ticket_id"),
    body: formData.get("body"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message };
  }

  const supabase = await createClient();
  // RLS ensures the ticket belongs to this client.
  const { error } = await supabase.from("ticket_messages").insert({
    ticket_id: parsed.data.ticket_id,
    author_id: profile.id,
    author_role: "client",
    body: parsed.data.body,
  });
  if (error) return { error: error.message };

  revalidatePath(`/dashboard/tickets/${parsed.data.ticket_id}`);
  return { success: "Reply sent" };
}
