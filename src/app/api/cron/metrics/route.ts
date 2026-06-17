import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import {
  generateMetric,
  recentDates,
  type GeneratedMetric,
} from "@/lib/metrics-generator";
import { fetchPlausibleMetrics } from "@/lib/plausible";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// GET /api/cron/metrics
// Auto-populates daily website metrics so they're never entered by hand.
// Idempotent: only inserts dates that don't exist yet (manual rows are kept).
// Triggered by Vercel Cron (see vercel.json). Protected by CRON_SECRET.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const supabase = createAdminClient();
  // plausible_domain may not exist pre-migration; select("*") is safe.
  const { data: websites, error } = await supabase.from("websites").select("*");
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const sites = (websites as { id: string; plausible_domain?: string }[]) ?? [];
  const dates = recentDates(30);
  const rows: GeneratedMetric[] = [];
  let plausibleSites = 0;

  for (const w of sites) {
    // Use real Plausible data when configured; otherwise generate.
    let real: GeneratedMetric[] | null = null;
    if (w.plausible_domain) {
      real = await fetchPlausibleMetrics(w.id, w.plausible_domain);
      if (real?.length) plausibleSites++;
    }
    if (real?.length) {
      // Real rows should overwrite generated ones → upsert without ignore.
      await supabase
        .from("website_metrics")
        .upsert(real, { onConflict: "website_id,date" });
    } else {
      rows.push(...dates.map((d) => generateMetric(w.id, d)));
    }
  }

  if (rows.length) {
    // ignoreDuplicates keeps any existing (incl. manual or real) rows.
    await supabase
      .from("website_metrics")
      .upsert(rows, { onConflict: "website_id,date", ignoreDuplicates: true });
  }

  return NextResponse.json({
    websites: sites.length,
    plausible: plausibleSites,
    generated: rows.length,
  });
}
