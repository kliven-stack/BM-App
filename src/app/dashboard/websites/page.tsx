import { createClient } from "@/lib/supabase/server";
import { getCurrentClient } from "@/lib/client-data";
import { PageHeader, EmptyState } from "@/components/ui";
import MetricsCharts from "@/components/MetricsCharts";
import UptimeBadge from "@/components/UptimeBadge";
import UptimeChart from "@/components/UptimeChart";
import { getChecksHistory } from "@/lib/monitoring";
import { Icon } from "@/components/icons";
import type { Website, WebsiteMetric } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ClientWebsitesPage() {
  const client = await getCurrentClient();
  if (!client) {
    return (
      <div>
        <PageHeader title="Websites" />
        <EmptyState title="No websites" description="Your account isn't linked yet." />
      </div>
    );
  }

  const supabase = await createClient();
  // RLS already restricts these to the client's own rows; the explicit filter
  // keeps the query efficient.
  const { data: websites } = await supabase
    .from("websites")
    .select("*")
    .eq("client_id", client.id)
    .order("created_at", { ascending: false });

  const sites = (websites as Website[]) ?? [];
  const ids = sites.map((w) => w.id);

  const { data: metricsData } = ids.length
    ? await supabase
        .from("website_metrics")
        .select("*")
        .in("website_id", ids)
        .order("date", { ascending: true })
    : { data: [] as WebsiteMetric[] };

  const metrics = (metricsData as WebsiteMetric[]) ?? [];
  const byWebsite = metrics.reduce<Record<string, WebsiteMetric[]>>((acc, m) => {
    (acc[m.website_id] ??= []).push(m);
    return acc;
  }, {});

  const checkHistory = await getChecksHistory(supabase, ids);

  return (
    <div>
      <PageHeader
        title="Your websites"
        description="Performance metrics for the websites we manage for you."
        action={
          sites.length > 0 ? (
            <div className="flex items-center gap-2">
              <a href="/api/export/metrics" className="btn-secondary">
                Export CSV
              </a>
              <a href="/dashboard/report" className="btn-primary">
                <Icon name="receipt" size={15} /> View report
              </a>
            </div>
          ) : null
        }
      />

      {sites.length === 0 ? (
        <EmptyState
          title="No websites yet"
          description="Once we add a website to your account it will show up here."
        />
      ) : (
        <div className="space-y-8">
          {sites.map((site) => (
            <section key={site.id}>
              <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold text-gray-900">
                      {site.name}
                    </h2>
                    <UptimeBadge check={checkHistory[site.id]?.at(-1)} />
                  </div>
                  <a
                    href={site.url}
                    target="_blank"
                    rel="noreferrer"
                    className="break-all text-sm text-brand-600 hover:underline"
                  >
                    {site.url}
                  </a>
                </div>
                <a
                  href={site.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary shrink-0"
                >
                  <Icon name="external" size={15} /> View site
                </a>
              </div>
              <MetricsCharts metrics={byWebsite[site.id] ?? []} />
              {checkHistory[site.id]?.length ? (
                <div className="mt-6">
                  <UptimeChart checks={checkHistory[site.id]} />
                </div>
              ) : null}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
