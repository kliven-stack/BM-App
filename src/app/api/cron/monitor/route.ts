import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// GET /api/cron/monitor
// Pings every client website and records an uptime check. Triggered by Vercel
// Cron (see vercel.json). Protected by CRON_SECRET when set.
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
    .select("id, url");
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const sites = (websites as { id: string; url: string }[]) ?? [];

  const checks = await Promise.allSettled(
    sites.map(async (site) => {
      const started = Date.now();
      let ok = false;
      let status_code: number | null = null;
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 8000);
        const res = await fetch(site.url, {
          method: "GET",
          redirect: "follow",
          signal: controller.signal,
          headers: { "user-agent": "BlendMode-Monitor/1.0" },
        });
        clearTimeout(timer);
        status_code = res.status;
        ok = res.status < 400;
      } catch {
        ok = false;
      }
      return {
        website_id: site.id,
        ok,
        status_code,
        response_ms: Date.now() - started,
      };
    }),
  );

  const rows = checks
    .filter((c) => c.status === "fulfilled")
    .map((c) => (c as PromiseFulfilledResult<unknown>).value);

  if (rows.length) {
    await supabase.from("website_checks").insert(rows);
  }

  return NextResponse.json({ checked: rows.length });
}
