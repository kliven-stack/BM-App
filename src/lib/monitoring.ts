import type { SupabaseClient } from "@supabase/supabase-js";
import type { WebsiteCheck } from "@/lib/types";

// Returns the most recent uptime check per website. Defensive: a missing
// website_checks table just yields an empty map (feature degrades gracefully).
export async function getLatestChecks(
  supabase: SupabaseClient,
  websiteIds: string[],
): Promise<Record<string, WebsiteCheck>> {
  if (!websiteIds.length) return {};
  const { data } = await supabase
    .from("website_checks")
    .select("*")
    .in("website_id", websiteIds)
    .order("checked_at", { ascending: false })
    .limit(300);

  const latest: Record<string, WebsiteCheck> = {};
  for (const c of (data as WebsiteCheck[]) ?? []) {
    if (!latest[c.website_id]) latest[c.website_id] = c;
  }
  return latest;
}

// Returns recent check history per website (ascending by time) for charting.
export async function getChecksHistory(
  supabase: SupabaseClient,
  websiteIds: string[],
  perSite = 30,
): Promise<Record<string, WebsiteCheck[]>> {
  if (!websiteIds.length) return {};
  const { data } = await supabase
    .from("website_checks")
    .select("*")
    .in("website_id", websiteIds)
    .order("checked_at", { ascending: false })
    .limit(websiteIds.length * (perSite + 10));

  const byId: Record<string, WebsiteCheck[]> = {};
  for (const c of (data as WebsiteCheck[]) ?? []) {
    (byId[c.website_id] ??= []).push(c);
  }
  for (const id of Object.keys(byId)) {
    // Stored desc → take the most recent `perSite`, then flip to ascending.
    byId[id] = byId[id].slice(0, perSite).reverse();
  }
  return byId;
}
