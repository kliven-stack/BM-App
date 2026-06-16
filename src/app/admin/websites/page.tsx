import { createClient } from "@/lib/supabase/server";
import { PageHeader, EmptyState } from "@/components/ui";
import AddWebsiteButton from "@/components/forms/AddWebsiteButton";
import AddMetricButton from "@/components/forms/AddMetricButton";
import MetricsCharts from "@/components/MetricsCharts";
import UptimeBadge from "@/components/UptimeBadge";
import UptimeChart from "@/components/UptimeChart";
import { getChecksHistory } from "@/lib/monitoring";
import type { Client, Website, WebsiteMetric } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminWebsitesPage() {
  const supabase = await createClient();

  const [clientsRes, websitesRes, metricsRes] = await Promise.all([
    supabase.from("clients").select("id, name").order("name"),
    supabase
      .from("websites")
      .select("*, clients(name)")
      .order("created_at", { ascending: false }),
    supabase
      .from("website_metrics")
      .select("*")
      .order("date", { ascending: true }),
  ]);

  const clients = (clientsRes.data as Pick<Client, "id" | "name">[]) ?? [];
  const websites = (websitesRes.data as (Website & {
    clients?: { name?: string };
  })[]) ?? [];
  const metrics = (metricsRes.data as WebsiteMetric[]) ?? [];

  const metricsByWebsite = metrics.reduce<Record<string, WebsiteMetric[]>>(
    (acc, m) => {
      (acc[m.website_id] ??= []).push(m);
      return acc;
    },
    {},
  );

  const checkHistory = await getChecksHistory(
    supabase,
    websites.map((w) => w.id),
  );

  return (
    <div>
      <PageHeader
        title="Websites"
        description="Websites assigned to clients, with their recorded metrics."
        action={<AddWebsiteButton clients={clients} />}
      />

      {websites.length === 0 ? (
        <EmptyState
          title="No websites yet"
          description="Add a website and assign it to a client to start tracking metrics."
        />
      ) : (
        <div className="space-y-8">
          {websites.map((site) => (
            <section key={site.id}>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold text-gray-900">
                      {site.name}
                    </h2>
                    <UptimeBadge check={checkHistory[site.id]?.at(-1)} />
                  </div>
                  <p className="text-sm text-gray-500">
                    {site.clients?.name ?? "Unassigned"} ·{" "}
                    <a
                      href={site.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-brand-600 hover:underline"
                    >
                      {site.url}
                    </a>
                  </p>
                </div>
                <AddMetricButton websiteId={site.id} websiteName={site.name} />
              </div>
              <MetricsCharts metrics={metricsByWebsite[site.id] ?? []} />
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
