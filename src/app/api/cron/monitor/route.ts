import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { sendEmail, emailLayout } from "@/lib/email";

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
    .select("id, url, name, clients(email)");
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const sites = (websites as {
    id: string;
    url: string;
    name: string;
    clients?: { email?: string };
  }[]) ?? [];

  // Previous status per site, so we can alert only on up→down transitions.
  const { data: prevChecks } = await supabase
    .from("website_checks")
    .select("website_id, ok, checked_at")
    .order("checked_at", { ascending: false })
    .limit(500);
  const prevOk: Record<string, boolean> = {};
  for (const c of (prevChecks as { website_id: string; ok: boolean }[]) ?? []) {
    if (!(c.website_id in prevOk)) prevOk[c.website_id] = c.ok;
  }

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
    .map(
      (c) =>
        (c as PromiseFulfilledResult<{
          website_id: string;
          ok: boolean;
          status_code: number | null;
          response_ms: number;
        }>).value,
    );

  if (rows.length) {
    await supabase.from("website_checks").insert(rows);
  }

  // Alert on sites that just went down (were up before, now failing).
  const notify = process.env.ADMIN_NOTIFY_EMAIL;
  let alerts = 0;
  for (const row of rows) {
    const wasUp = prevOk[row.website_id];
    if (wasUp === true && row.ok === false) {
      const site = sites.find((s) => s.id === row.website_id);
      if (!site) continue;
      const recipients = [notify, site.clients?.email].filter(
        (e): e is string => Boolean(e),
      );
      for (const to of recipients) {
        await sendEmail({
          to,
          subject: `🔴 ${site.name} is down`,
          html: emailLayout(
            "Website downtime detected",
            `<p><strong>${site.name}</strong> (${site.url}) appears to be down${
              row.status_code ? ` (HTTP ${row.status_code})` : ""
            }.</p><p>Our monitor will keep checking and you'll see it recover in the portal.</p>`,
          ),
        });
        alerts++;
      }
    }
  }

  return NextResponse.json({ checked: rows.length, alerts });
}
