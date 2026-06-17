import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { generateMetric, recentDates } from "@/lib/metrics-generator";

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
  const { data: websites, error } = await supabase
    .from("websites")
    .select("id");
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const dates = recentDates(30);
  const rows = ((websites as { id: string }[]) ?? []).flatMap((w) =>
    dates.map((d) => generateMetric(w.id, d)),
  );

  if (rows.length) {
    // ignoreDuplicates keeps any existing (incl. manually-entered) rows.
    await supabase
      .from("website_metrics")
      .upsert(rows, { onConflict: "website_id,date", ignoreDuplicates: true });
  }

  return NextResponse.json({ websites: websites?.length ?? 0, rows: rows.length });
}
