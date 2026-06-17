import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentClient } from "@/lib/client-data";
import { PageHeader, StatCard, EmptyState, StatusBadge } from "@/components/ui";
import WelcomeHero from "@/components/WelcomeHero";
import { Icon } from "@/components/icons";
import { formatDate } from "@/lib/format";
import type { Ticket } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ClientOverview() {
  const client = await getCurrentClient();

  if (!client) {
    return (
      <div>
        <PageHeader title="Welcome" />
        <EmptyState
          title="Your account isn't linked yet"
          description="An administrator needs to create a client record using your email address. Once that's done, your websites, subscription and invoices will appear here."
        />
      </div>
    );
  }

  const supabase = await createClient();
  const [websites, openTickets, sub, recentTickets] = await Promise.all([
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
      .select("status, price, billing_cycle")
      .eq("client_id", client.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("tickets")
      .select("id, subject, status, created_at")
      .eq("client_id", client.id)
      .order("created_at", { ascending: false })
      .limit(4),
  ]);

  const tickets = (recentTickets.data as Ticket[]) ?? [];

  return (
    <div className="space-y-8">
      <WelcomeHero
        title={`Welcome, ${client.name}`}
        subtitle="Track your websites' performance, manage your subscription, and reach support — all in one place."
        ctaHref="/dashboard/websites"
        ctaLabel="View metrics"
        ctaIcon="globe"
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

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Quick actions */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Quick actions</h2>
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
                Visitors, page views, bounce rate and uptime over time.
              </p>
            </div>
          </Link>
          <Link
            href="/dashboard/report"
            className="card flex items-start gap-3 transition-colors hover:border-brand-300"
          >
            <span className="icon-chip">
              <Icon name="receipt" size={18} />
            </span>
            <div>
              <p className="font-semibold text-gray-900">Performance report</p>
              <p className="mt-1 text-sm text-gray-500">
                A clean summary you can print or save as PDF.
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

        {/* Recent tickets */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent tickets
            </h2>
            <Link
              href="/dashboard/tickets"
              className="text-sm text-brand-600 hover:underline"
            >
              View all →
            </Link>
          </div>
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-slate-900">
            {tickets.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-gray-500">
                No tickets yet. Reach out any time.
              </p>
            ) : (
              <ul className="divide-y divide-gray-100 dark:divide-white/5">
                {tickets.map((t) => (
                  <li key={t.id}>
                    <Link
                      href={`/dashboard/tickets/${t.id}`}
                      className="flex items-center justify-between gap-3 px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-white/5"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-gray-900">
                          {t.subject}
                        </p>
                        <p className="text-xs text-gray-400">
                          {formatDate(t.created_at)}
                        </p>
                      </div>
                      <StatusBadge status={t.status} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
