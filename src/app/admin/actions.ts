"use server";

import { revalidatePath } from "next/cache";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import { sendEmail, emailLayout } from "@/lib/email";
import { uploadTicketAttachment } from "@/lib/attachments";
import {
  clientCreateSchema,
  clientUpdateSchema,
  clientCrmSchema,
  clientNoteSchema,
  idSchema,
  websiteSchema,
  metricSchema,
  ticketStatusSchema,
} from "@/lib/validations";
import type { ActionState } from "@/lib/action-state";

// All actions below re-check the admin role server-side. RLS is the final
// gate, but failing fast with a clear message is friendlier.

export async function createClientAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const profile = await requireRole("admin");
  const parsed = clientCreateSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message };
  }

  const { name, email, password } = parsed.data;

  // If a password was supplied, provision the client's login now (service-role
  // admin API). The DB trigger creates their `profiles` row with role 'client'.
  if (password) {
    const admin = createAdminClient();
    const { error: authError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, role: "client" },
    });
    if (authError) {
      return { error: `Could not create login: ${authError.message}` };
    }
  }

  const supabase = await createClient();
  const { error } = await supabase.from("clients").insert({
    name,
    email,
    created_by: profile.id,
  });
  if (error) return { error: error.message };

  await logActivity(supabase, {
    actor_id: profile.id,
    actor_name: profile.name,
    action: "created",
    entity: "client",
    detail: name,
  });

  revalidatePath("/admin/clients");
  return {
    success: password
      ? "Client created with login access"
      : "Client created",
  };
}

export async function updateClientAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole("admin");
  const parsed = clientUpdateSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
    email: formData.get("email"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message };
  }

  const { id, ...fields } = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase.from("clients").update(fields).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/clients");
  return { success: "Client updated" };
}

export async function deleteClientAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole("admin");
  const parsed = idSchema.safeParse({ id: formData.get("id") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message };
  }

  const supabase = await createClient();
  // ON DELETE CASCADE removes the client's websites, subscriptions and tickets.
  const { error } = await supabase
    .from("clients")
    .delete()
    .eq("id", parsed.data.id);
  if (error) return { error: error.message };

  revalidatePath("/admin/clients");
  return { success: "Client deleted" };
}

export async function updateClientCrmAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole("admin");
  const parsed = clientCrmSchema.safeParse({
    id: formData.get("id"),
    status: formData.get("status"),
    tags: formData.get("tags"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message };
  }

  const tags = (parsed.data.tags ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  const supabase = await createClient();
  const { error } = await supabase
    .from("clients")
    .update({ status: parsed.data.status, tags })
    .eq("id", parsed.data.id);
  if (error) return { error: error.message };

  revalidatePath(`/admin/clients/${parsed.data.id}`);
  revalidatePath("/admin/clients");
  return { success: "Client updated" };
}

export async function addClientNoteAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const profile = await requireRole("admin");
  const parsed = clientNoteSchema.safeParse({
    client_id: formData.get("client_id"),
    body: formData.get("body"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("client_notes").insert({
    client_id: parsed.data.client_id,
    author_id: profile.id,
    author_name: profile.name,
    body: parsed.data.body,
  });
  if (error) return { error: error.message };

  revalidatePath(`/admin/clients/${parsed.data.client_id}`);
  return { success: "Note added" };
}

export async function createWebsiteAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole("admin");
  const parsed = websiteSchema.safeParse({
    client_id: formData.get("client_id"),
    name: formData.get("name"),
    url: formData.get("url"),
    plausible_domain: formData.get("plausible_domain") ?? undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message };
  }

  const profile = await requireRole("admin");
  const supabase = await createClient();

  // Only include plausible_domain when provided, so inserts still work before
  // the 0004 migration adds the column.
  const { plausible_domain, ...rest } = parsed.data;
  const insertRow: Record<string, unknown> = { ...rest };
  if (plausible_domain && plausible_domain.trim()) {
    insertRow.plausible_domain = plausible_domain.trim();
  }

  const { error } = await supabase.from("websites").insert(insertRow);
  if (error) return { error: error.message };

  await logActivity(supabase, {
    actor_id: profile.id,
    actor_name: profile.name,
    action: "added",
    entity: "website",
    detail: parsed.data.name,
  });

  revalidatePath("/admin/websites");
  return { success: "Website added" };
}

export async function addMetricAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole("admin");
  const parsed = metricSchema.safeParse({
    website_id: formData.get("website_id"),
    date: formData.get("date"),
    visitors: formData.get("visitors"),
    page_views: formData.get("page_views"),
    bounce_rate: formData.get("bounce_rate"),
    avg_session_duration: formData.get("avg_session_duration"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message };
  }

  const supabase = await createClient();
  // Upsert so re-entering a date overwrites instead of erroring on the
  // (website_id, date) unique constraint.
  const { error } = await supabase
    .from("website_metrics")
    .upsert(parsed.data, { onConflict: "website_id,date" });
  if (error) return { error: error.message };

  revalidatePath("/admin/websites");
  return { success: "Metric saved" };
}

export async function updateTicketStatusAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole("admin");
  const parsed = ticketStatusSchema.safeParse({
    id: formData.get("id"),
    status: formData.get("status"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("tickets")
    .update({ status: parsed.data.status })
    .eq("id", parsed.data.id);
  if (error) return { error: error.message };

  revalidatePath("/admin/tickets");
  revalidatePath(`/admin/tickets/${parsed.data.id}`);
  return { success: "Ticket updated" };
}

export async function replyTicketAdminAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const profile = await requireRole("admin");
  const ticketId = String(formData.get("ticket_id") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  const file = formData.get("file") as File | null;
  if (!ticketId) return { error: "Missing ticket" };
  if (!body && (!file || file.size === 0)) {
    return { error: "Write a message or attach a file" };
  }

  let attachment: { path: string; name: string } | null = null;
  try {
    attachment = await uploadTicketAttachment(ticketId, file);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Upload failed" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("ticket_messages").insert({
    ticket_id: ticketId,
    author_id: profile.id,
    author_role: "admin",
    body: body || "(attachment)",
    attachment_path: attachment?.path ?? null,
    attachment_name: attachment?.name ?? null,
  });
  if (error) return { error: error.message };

  // Notify the client by email (no-op if Resend isn't configured).
  const { data: ticket } = await supabase
    .from("tickets")
    .select("subject, clients(email, name)")
    .eq("id", ticketId)
    .single();
  const client = (ticket as unknown as {
    subject?: string;
    clients?: { email?: string; name?: string };
  })?.clients;
  if (client?.email) {
    await sendEmail({
      to: client.email,
      subject: `Re: ${ticket?.subject ?? "your support ticket"}`,
      html: emailLayout(
        "New reply to your ticket",
        `<p>Hi ${client.name ?? "there"},</p><p>Our team replied to your ticket. Sign in to your portal to read it and continue the conversation.</p>`,
      ),
    });
  }

  revalidatePath(`/admin/tickets/${ticketId}`);
  return { success: "Reply sent" };
}
