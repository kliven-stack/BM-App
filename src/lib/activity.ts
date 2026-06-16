import type { SupabaseClient } from "@supabase/supabase-js";

// Records an admin-visible activity entry. Never throws — a missing table or
// insert error must not break the action that triggered it.
export async function logActivity(
  supabase: SupabaseClient,
  entry: {
    actor_id?: string | null;
    actor_name?: string | null;
    action: string;
    entity: string;
    detail?: string | null;
  },
): Promise<void> {
  try {
    await supabase.from("activity_logs").insert(entry);
  } catch {
    // ignore — activity logging is best-effort
  }
}
