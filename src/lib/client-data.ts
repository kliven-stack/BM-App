import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";
import type { Client } from "@/lib/types";

// Resolves the `clients` row that belongs to the currently signed-in client
// user. Relies on RLS: a client can only ever read their own row.
export async function getCurrentClient(): Promise<Client | null> {
  const profile = await getProfile();
  if (!profile?.email) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from("clients")
    .select("*")
    .eq("email", profile.email)
    .single();

  return (data as Client) ?? null;
}
