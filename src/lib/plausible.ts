import type { GeneratedMetric } from "@/lib/metrics-generator";

// Pulls real daily metrics from Plausible for a website domain. Returns null
// when Plausible isn't configured or the request fails, so callers can fall
// back to the generator.
export async function fetchPlausibleMetrics(
  websiteId: string,
  domain: string,
): Promise<GeneratedMetric[] | null> {
  const key = process.env.PLAUSIBLE_API_KEY;
  if (!key || !domain) return null;

  const host = process.env.PLAUSIBLE_HOST ?? "https://plausible.io";
  const url =
    `${host}/api/v1/stats/timeseries?site_id=${encodeURIComponent(domain)}` +
    `&period=30d&metrics=visitors,pageviews,bounce_rate,visit_duration`;

  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${key}` },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      results?: {
        date: string;
        visitors: number;
        pageviews: number;
        bounce_rate: number;
        visit_duration: number;
      }[];
    };
    if (!data.results?.length) return null;

    return data.results.map((r) => ({
      website_id: websiteId,
      date: r.date,
      visitors: Math.round(r.visitors ?? 0),
      page_views: Math.round(r.pageviews ?? 0),
      bounce_rate: Math.round((r.bounce_rate ?? 0) * 10) / 10,
      avg_session_duration: Math.round(r.visit_duration ?? 0),
    }));
  } catch {
    return null;
  }
}
