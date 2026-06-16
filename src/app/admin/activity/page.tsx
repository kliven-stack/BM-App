import { createClient } from "@/lib/supabase/server";
import { PageHeader, EmptyState } from "@/components/ui";
import { Icon } from "@/components/icons";
import { formatDate } from "@/lib/format";
import type { ActivityLog } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminActivityPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("activity_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  const logs = (data as ActivityLog[]) ?? [];

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Activity"
        description="A log of actions taken across the portal."
      />

      {logs.length === 0 ? (
        <EmptyState
          title="No activity yet"
          description="Admin actions like creating clients or websites will appear here."
        />
      ) : (
        <ol className="relative space-y-4 border-l border-gray-200 pl-6 dark:border-white/10">
          {logs.map((log) => (
            <li key={log.id} className="relative">
              <span className="absolute -left-[31px] flex h-6 w-6 items-center justify-center rounded-full bg-brand-50 text-brand-600 ring-4 ring-white dark:bg-brand-500/15 dark:text-brand-300 dark:ring-slate-950">
                <Icon name="grid" size={12} />
              </span>
              <p className="text-sm text-gray-900">
                <span className="font-medium">
                  {log.actor_name ?? "Someone"}
                </span>{" "}
                {log.action}{" "}
                <span className="font-medium">{log.entity}</span>
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
  );
}
