import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";
import { PageHeader, StatCard, StatusBadge } from "@/components/ui";
import WelcomeHero from "@/components/WelcomeHero";
import { Icon } from "@/components/icons";
import { formatDate } from "@/lib/format";
import type { ActivityLog } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminOverview() {
  const supabase = await createClient();
  const profile = await getProfile();

  const [clients, websites, subs, openTickets, recentTickets, activity] =
    await Promise.all([
      supabase.from("clients").select("id", { count: "exact", head: true }),
      supabase.from("websites").select("id", { count: "exact", head: true }),
      supabase
        .from("subscriptions")
        .select("id", { count: "exact", head: true })
        .eq("status", "active"),
      supabase
        .from("tickets")
        .select("id", { count: "exact", head: true })
        .eq("status", "open"),
      supabase
        .from("tickets")
        .select("id, subject, status, created_at, clients(name)")
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("activity_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(6),
    ]);

  const activities = (activity.data as ActivityLog[]) ?? [];

  return (
    <div className="space-y-8">
      <WelcomeHero
        title={`Welcome back, ${profile?.name ?? "Admin"}`}
        subtitle="A snapshot across every client in your portal — clients, sites, revenue and support, all in one place."
        ctaHref="/admin/revenue"
        ctaLabel="View revenue"
        ctaIcon="star"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Clients" value={clients.count ?? 0} icon="users" />
        <StatCard label="Websites" value={websites.count ?? 0} icon="globe" />
        <StatCard
          label="Active subscriptions"
          value={subs.count ?? 0}
          icon="card"
        />
        <StatCard
          label="Open tickets"
          value={openTickets.count ?? 0}
          icon="ticket"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        {/* Recent tickets */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent tickets
            </h2>
            <Link
              href="/admin/tickets"
              className="text-sm text-brand-600 hover:underline"
            >
              View all →
            </Link>
          </div>
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-slate-900">
            {(recentTickets.data ?? []).length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-gray-500">
                No tickets yet.
              </p>
            ) : (
              <ul className="divide-y divide-gray-100 dark:divide-white/5">
                {(recentTickets.data ?? []).map((t) => {
                  const client = (
                    t as unknown as { clients?: { name?: string } }
                  ).clients;
                  return (
                    <li key={t.id}>
                      <Link
                        href={`/admin/tickets/${t.id}`}
                        className="flex items-center justify-between gap-3 px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-white/5"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-gray-900">
                            {t.subject}
                          </p>
                          <p className="text-xs text-gray-400">
                            {client?.name ?? "—"} · {formatDate(t.created_at)}
                          </p>
                        </div>
                        <StatusBadge status={t.status} />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        {/* Recent activity */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Activity</h2>
            <Link
              href="/admin/activity"
              className="text-sm text-brand-600 hover:underline"
            >
              View all →
            </Link>
          </div>
          <div className="card">
            {activities.length === 0 ? (
              <p className="py-4 text-center text-sm text-gray-500">
                No activity yet.
              </p>
            ) : (
              <ol className="relative space-y-4 border-l border-gray-200 pl-5 dark:border-white/10">
                {activities.map((log) => (
                  <li key={log.id} className="relative">
                    <span className="absolute -left-[27px] flex h-5 w-5 items-center justify-center rounded-full bg-brand-50 text-brand-600 ring-4 ring-white dark:bg-brand-500/15 dark:text-brand-300 dark:ring-slate-900">
                      <Icon name="grid" size={10} />
                    </span>
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">
                        {log.actor_name ?? "Someone"}
                      </span>{" "}
                      {log.action} {log.entity}
                      {log.detail ? ` · ${log.detail}` : ""}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatDate(log.created_at)}
                    </p>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
