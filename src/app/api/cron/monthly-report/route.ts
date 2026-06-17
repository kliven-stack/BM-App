import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { sendEmail, emailLayout } from "@/lib/email";
import { recentDates } from "@/lib/metrics-generator";
import type { WebsiteMetric } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// GET /api/cron/monthly-report
// Emails each client a 30-day performance digest. No-ops without Resend.
// Triggered monthly by Vercel Cron. Protected by CRON_SECRET.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ skipped: "RESEND_API_KEY not set" });
  }

  const supabase = createAdminClient();
  const { data: clients } = await supabase.from("clients").select("id, name, email");
  const since = recentDates(30)[0];

  let sent = 0;
  for (const client of (clients as { id: string; name: string; email: string }[]) ?? []) {
    if (!client.email) continue;

    const { data: websites } = await supabase
      .from("websites")
      .select("id, name")
      .eq("client_id", client.id);
    const sites = (websites as { id: string; name: string }[]) ?? [];
    if (!sites.length) continue;

    const { data: metricsData } = await supabase
      .from("website_metrics")
      .select("*")
      .in(
        "website_id",
        sites.map((s) => s.id),
      )
      .gte("date", since);
    const metrics = (metricsData as WebsiteMetric[]) ?? [];

    const totalVisitors = metrics.reduce((s, m) => s + m.visitors, 0);
    const totalViews = metrics.reduce((s, m) => s + m.page_views, 0);

    const rows = sites
      .map((site) => {
        const m = metrics.filter((x) => x.website_id === site.id);
        const v = m.reduce((s, x) => s + x.visitors, 0);
        const p = m.reduce((s, x) => s + x.page_views, 0);
        return `<tr><td style="padding:6px 0">${site.name}</td><td style="padding:6px 0;text-align:right">${v.toLocaleString()}</td><td style="padding:6px 0;text-align:right">${p.toLocaleString()}</td></tr>`;
      })
      .join("");

    await sendEmail({
      to: client.email,
      subject: "Your monthly performance report",
      html: emailLayout(
        `${client.name} — last 30 days`,
        `<p><strong>${totalVisitors.toLocaleString()}</strong> visitors and <strong>${totalViews.toLocaleString()}</strong> page views across your sites.</p>
         <table style="width:100%;border-collapse:collapse;margin-top:12px;font-size:13px">
           <tr style="color:#9ca3af"><td>Website</td><td style="text-align:right">Visitors</td><td style="text-align:right">Views</td></tr>
           ${rows}
         </table>
         <p style="margin-top:16px">Sign in to your portal for charts, uptime and more.</p>`,
      ),
    });
    sent++;
  }

  return NextResponse.json({ sent });
}
