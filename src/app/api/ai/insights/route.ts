import { NextResponse } from "next/server";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { askClaude, aiEnabled } from "@/lib/ai";
import type { WebsiteMetric } from "@/lib/types";

// GET /api/ai/insights?website_id=…  — a short Claude-written summary of a
// website's recent metrics. RLS scopes which websites the user can read.
export async function GET(request: Request) {
  const profile = await getProfile();
  if (!profile) return NextResponse.json({ error: "auth" }, { status: 401 });
  if (!aiEnabled()) {
    return NextResponse.json({ error: "AI is not configured." }, { status: 503 });
  }

  const websiteId = new URL(request.url).searchParams.get("website_id");
  if (!websiteId) {
    return NextResponse.json({ error: "Missing website_id" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: site } = await supabase
    .from("websites")
    .select("name, url")
    .eq("id", websiteId)
    .maybeSingle();
  if (!site) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data } = await supabase
    .from("website_metrics")
    .select("*")
    .eq("website_id", websiteId)
    .order("date", { ascending: true })
    .limit(60);
  const metrics = (data as WebsiteMetric[]) ?? [];
  if (metrics.length < 3) {
    return NextResponse.json({
      insight: "Not enough data yet to generate insights.",
    });
  }

  const rows = metrics
    .map(
      (m) =>
        `${m.date}: ${m.visitors} visitors, ${m.page_views} views, ${m.bounce_rate}% bounce, ${m.avg_session_duration}s avg session`,
    )
    .join("\n");

  const prompt = `You are a digital marketing analyst. Based on this daily website analytics data for "${site.name}", write a concise insight (2-3 sentences) highlighting the most important trend, then one short actionable recommendation. Be specific with numbers. Plain text, no markdown headings.\n\nData:\n${rows}`;

  const insight = await askClaude(prompt, 350);
  if (!insight) {
    return NextResponse.json(
      { error: "Could not generate an insight right now." },
      { status: 502 },
    );
  }
  return NextResponse.json({ insight });
}
