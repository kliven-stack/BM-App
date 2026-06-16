import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentClient } from "@/lib/client-data";
import { getChecksHistory } from "@/lib/monitoring";
import { EmptyState } from "@/components/ui";
import PrintButton from "@/components/PrintButton";
import { formatDate } from "@/lib/format";
import type { Website, WebsiteMetric } from "@/lib/types";

export const dynamic = "force-dynamic";

function avg(nums: number[]): number {
  if (!nums.length) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

export default async function ClientReportPage() {
  const client = await getCurrentClient();
  if (!client) {
    return <EmptyState title="No account linked" />;
  }

  const supabase = await createClient();
  const { data: websitesData } = await supabase
    .from("websites")
    .select("*")
    .eq("client_id", client.id);
  const websites = (websitesData as Website[]) ?? [];
  const ids = websites.map((w) => w.id);

  const { data: metricsData } = ids.length
    ? await supabase.from("website_metrics").select("*").in("website_id", ids)
    : { data: [] as WebsiteMetric[] };
  const metrics = (metricsData as WebsiteMetric[]) ?? [];
  const checks = await getChecksHistory(supabase, ids, 100);

  const byWebsite = metrics.reduce<Record<string, WebsiteMetric[]>>((acc, m) => {
    (acc[m.website_id] ??= []).push(m);
    return acc;
  }, {});

  const totalVisitors = metrics.reduce((s, m) => s + m.visitors, 0);
  const totalViews = metrics.reduce((s, m) => s + m.page_views, 0);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center justify-between print:hidden">
        <Link
          href="/dashboard/websites"
          className="text-sm text-brand-600 hover:underline"
        >
          ← Back
        </Link>
        <PrintButton />
      </div>

      <div className="card print:border-0 print:shadow-none">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-5 dark:border-white/10">
          <div>
            <p className="font-display text-2xl font-bold uppercase tracking-tight text-gray-900">
              Performance Report
            </p>
            <p className="text-sm text-gray-500">
              {client.name} · generated {formatDate(new Date())}
            </p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 text-sm font-bold text-white">
            BM
          </div>
        </div>

        {/* Totals */}
        <div className="mt-5 grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-400">
              Total visitors
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {totalVisitors.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-400">
              Total page views
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {totalViews.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-400">
              Websites
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {websites.length}
            </p>
          </div>
        </div>

        {/* Per-website */}
        <div className="mt-8 space-y-6">
          {websites.map((site) => {
            const m = byWebsite[site.id] ?? [];
            const siteChecks = checks[site.id] ?? [];
            const uptime = siteChecks.length
              ? Math.round(
                  (siteChecks.filter((c) => c.ok).length / siteChecks.length) *
                    100,
                )
              : null;
            return (
              <div
                key={site.id}
                className="border-t border-gray-100 pt-5 dark:border-white/10"
              >
                <p className="font-semibold text-gray-900">{site.name}</p>
                <p className="text-xs text-gray-400">{site.url}</p>
                <div className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-5">
                  <Stat label="Visitors" value={m.reduce((s, x) => s + x.visitors, 0)} />
                  <Stat label="Page views" value={m.reduce((s, x) => s + x.page_views, 0)} />
                  <Stat label="Avg bounce" value={`${avg(m.map((x) => x.bounce_rate)).toFixed(1)}%`} />
                  <Stat label="Avg session" value={`${avg(m.map((x) => x.avg_session_duration)).toFixed(0)}s`} />
                  <Stat label="Uptime" value={uptime != null ? `${uptime}%` : "—"} />
                </div>
              </div>
            );
          })}
          {!websites.length && (
            <p className="text-sm text-gray-500">No websites on file yet.</p>
          )}
        </div>

        <p className="mt-8 border-t border-gray-100 pt-4 text-xs text-gray-400 dark:border-white/10">
          Blend Mode · Confidential performance report for {client.name}.
        </p>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="font-semibold text-gray-900">{value}</p>
    </div>
  );
}
