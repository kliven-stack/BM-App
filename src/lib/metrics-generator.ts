// Deterministic, realistic daily metrics. Same (websiteId, date) always yields
// the same values, so the cron can re-run safely (idempotent) and each website
// has its own stable "personality".
//
// This is a self-contained generator so metrics are dynamic without manual
// entry. To use REAL analytics instead, replace generateMetric() with a fetch
// to your provider (e.g. Plausible/GA) keyed off a per-website domain.

export interface GeneratedMetric {
  website_id: string;
  date: string; // YYYY-MM-DD
  visitors: number;
  page_views: number;
  bounce_rate: number;
  avg_session_duration: number;
}

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function generateMetric(
  websiteId: string,
  dateStr: string,
): GeneratedMetric {
  const base = hash(websiteId);
  const day = hash(`${websiteId}:${dateStr}`);

  const baseVisitors = 180 + (base % 1400); // per-site baseline 180–1580
  const dow = new Date(`${dateStr}T00:00:00Z`).getUTCDay();
  const weekend = dow === 0 || dow === 6 ? 0.72 : 1; // quieter weekends
  const noise = 0.85 + ((day % 1000) / 1000) * 0.3; // ±15%
  const daysSinceEpoch = Math.floor(Date.parse(`${dateStr}T00:00:00Z`) / 86400000);
  const trend = 1 + ((daysSinceEpoch % 90) / 90) * 0.18; // gentle cyclical growth

  const visitors = Math.max(
    20,
    Math.round(baseVisitors * weekend * noise * trend),
  );
  const pagesPer = 2 + (base % 150) / 100; // 2.0–3.5 pages / visit
  const page_views = Math.round(visitors * pagesPer);
  const bounce_rate = Math.round((34 + (day % 32)) * 10) / 10; // 34–66 %
  const avg_session_duration = 60 + (day % 220); // 60–280 s

  return {
    website_id: websiteId,
    date: dateStr,
    visitors,
    page_views,
    bounce_rate,
    avg_session_duration,
  };
}

// Last `days` calendar dates (UTC), most recent last.
export function recentDates(days: number): string[] {
  const out: string[] = [];
  const today = new Date();
  for (let d = days - 1; d >= 0; d--) {
    const dt = new Date(today);
    dt.setUTCDate(dt.getUTCDate() - d);
    out.push(dt.toISOString().slice(0, 10));
  }
  return out;
}
