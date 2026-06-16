"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { ticketSchema } from "@/lib/validations";
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

  revalidatePath("/dashboard/tickets");
  return { success: "Ticket submitted" };
}
