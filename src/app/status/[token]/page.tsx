import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/server";
import { getLatestChecks } from "@/lib/monitoring";
import BrandMark from "@/components/BrandMark";
import { formatDate } from "@/lib/format";
import type { Website } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function PublicStatusPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  // Service role: this page is public, gated only by the unguessable token.
  const supabase = createAdminClient();

  const { data: client } = await supabase
    .from("clients")
    .select("id, name")
    .eq("public_token", token)
    .maybeSingle();
  if (!client) notFound();

  const { data: websitesData } = await supabase
    .from("websites")
    .select("id, name, url")
    .eq("client_id", client.id);
  const websites = (websitesData as Pick<Website, "id" | "name" | "url">[]) ?? [];
  const latest = await getLatestChecks(
    supabase,
    websites.map((w) => w.id),
  );

  const allUp = websites.every((w) => latest[w.id]?.ok);
  const anyChecked = websites.some((w) => latest[w.id]);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 text-white">
            <BrandMark size={18} />
          </span>
          <span className="text-lg font-bold">Blend Mode</span>
        </div>

        <h1 className="mt-8 font-display text-4xl font-bold uppercase tracking-tight">
          {client.name} status
        </h1>
        <div
          className={`mt-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold ${
            !anyChecked
              ? "bg-white/10 text-slate-300"
              : allUp
                ? "bg-green-500/15 text-green-400"
                : "bg-red-500/15 text-red-400"
          }`}
        >
          <span
            className={`h-2 w-2 rounded-full ${
              !anyChecked ? "bg-slate-400" : allUp ? "bg-green-400" : "bg-red-400"
            }`}
          />
          {!anyChecked
            ? "Awaiting first check"
            : allUp
              ? "All systems operational"
              : "Some systems are down"}
        </div>

        <ul className="mt-10 space-y-3">
          {websites.map((w) => {
            const c = latest[w.id];
            const up = c?.ok;
            return (
              <li
                key={w.id}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-5 py-4"
              >
                <div>
                  <p className="font-semibold">{w.name}</p>
                  <p className="text-xs text-slate-400">{w.url}</p>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-flex items-center gap-1.5 text-sm font-medium ${
                      !c ? "text-slate-400" : up ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${
                        !c ? "bg-slate-400" : up ? "bg-green-400" : "bg-red-400"
                      }`}
                    />
                    {!c ? "Unknown" : up ? "Operational" : "Down"}
                  </span>
                  {c?.response_ms != null && (
                    <p className="text-xs text-slate-500">{c.response_ms}ms</p>
                  )}
                </div>
              </li>
            );
          })}
          {websites.length === 0 && (
            <li className="text-sm text-slate-400">No websites monitored yet.</li>
          )}
        </ul>

        <p className="mt-10 text-xs text-slate-500">
          Last updated {formatDate(new Date())} · Powered by Blend Mode
        </p>
      </div>
    </main>
  );
}
