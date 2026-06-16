"use server";

import { revalidatePath } from "next/cache";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import {
  clientCreateSchema,
  clientUpdateSchema,
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

export async function createWebsiteAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole("admin");
  const parsed = websiteSchema.safeParse({
    client_id: formData.get("client_id"),
    name: formData.get("name"),
    url: formData.get("url"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("websites").insert(parsed.data);
  if (error) return { error: error.message };

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
  return { success: "Ticket updated" };
}
