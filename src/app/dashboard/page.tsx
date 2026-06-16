import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentClient } from "@/lib/client-data";
import { PageHeader, StatCard, EmptyState } from "@/components/ui";
import { Icon } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function ClientOverview() {
  const client = await getCurrentClient();

  if (!client) {
    return (
      <div>
        <PageHeader title={`Welcome`} />
        <EmptyState
          title="Your account isn't linked yet"
          description="An administrator needs to create a client record using your email address. Once that's done, your websites, subscription and invoices will appear here."
        />
      </div>
    );
  }

  const supabase = await createClient();
  const [websites, openTickets, sub] = await Promise.all([
    supabase
      .from("websites")
      .select("id", { count: "exact", head: true })
      .eq("client_id", client.id),
    supabase
      .from("tickets")
      .select("id", { count: "exact", head: true })
      .eq("client_id", client.id)
      .neq("status", "closed"),
    supabase
      .from("subscriptions")
      .select("status")
      .eq("client_id", client.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  return (
    <div>
      <PageHeader
        title={`Welcome, ${client.name}`}
        description="Here's a quick look at your account."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Websites" value={websites.count ?? 0} icon="globe" />
        <StatCard
          label="Open tickets"
          value={openTickets.count ?? 0}
          icon="ticket"
        />
        <StatCard
          label="Subscription"
          value={sub.data?.status ? String(sub.data.status) : "None"}
          icon="card"
        />
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link
          href="/dashboard/websites"
          className="card flex items-start gap-3 transition-colors hover:border-brand-300"
        >
          <span className="icon-chip">
            <Icon name="globe" size={18} />
          </span>
          <div>
            <p className="font-semibold text-gray-900">View website metrics</p>
            <p className="mt-1 text-sm text-gray-500">
              Visitors, page views and bounce rate over time.
            </p>
          </div>
        </Link>
        <Link
          href="/dashboard/tickets"
          className="card flex items-start gap-3 transition-colors hover:border-brand-300"
        >
          <span className="icon-chip">
            <Icon name="lifebuoy" size={18} />
          </span>
          <div>
            <p className="font-semibold text-gray-900">Need help?</p>
            <p className="mt-1 text-sm text-gray-500">
              Open a support ticket and track its status.
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
