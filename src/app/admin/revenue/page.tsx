import { createClient } from "@/lib/supabase/server";
import { PageHeader, StatCard } from "@/components/ui";
import RevenueCharts, { type MonthPoint } from "@/components/RevenueCharts";
import { formatCurrency } from "@/lib/format";

export const dynamic = "force-dynamic";

function lastMonths(n: number): { key: string; label: string }[] {
  const out: { key: string; label: string }[] = [];
  const base = new Date();
  base.setUTCDate(1);
  for (let i = n - 1; i >= 0; i--) {
    const dt = new Date(base);
    dt.setUTCMonth(dt.getUTCMonth() - i);
    out.push({
      key: dt.toISOString().slice(0, 7),
      label: dt.toLocaleString("en-US", { month: "short" }),
    });
  }
  return out;
}

export default async function AdminRevenuePage() {
  const supabase = await createClient();

  const [subsRes, clientsRes, invoicesRes] = await Promise.all([
    supabase.from("subscriptions").select("status, price, billing_cycle, created_at"),
    supabase.from("clients").select("created_at"),
    supabase.from("invoices").select("amount, status, created_at"),
  ]);

  const subs = (subsRes.data as
    | { status: string; price: number; billing_cycle: string; created_at: string }[]
    | null) ?? [];
  const clients = (clientsRes.data as { created_at: string }[] | null) ?? [];
  const invoices = (invoicesRes.data as
    | { amount: number; status: string; created_at: string }[]
    | null) ?? [];

  const active = subs.filter((s) => s.status === "active");
  const churned = subs.filter((s) =>
    ["canceled", "cancelled"].includes(s.status),
  );
  // Monthly recurring revenue (yearly normalized to a month).
  const mrr = active.reduce(
    (sum, s) =>
      sum + (s.billing_cycle === "yearly" ? Number(s.price) / 12 : Number(s.price)),
    0,
  );
  const paidRevenue = invoices
    .filter((i) => i.status === "paid")
    .reduce((s, i) => s + Number(i.amount), 0);

  const months = lastMonths(6);
  const series: MonthPoint[] = months.map((m) => ({
    label: m.label,
    signups: clients.filter((c) => c.created_at.startsWith(m.key)).length,
    revenue: invoices
      .filter((i) => i.status === "paid" && i.created_at.startsWith(m.key))
      .reduce((s, i) => s + Number(i.amount), 0),
  }));

  return (
    <div>
      <PageHeader
        title="Revenue"
        description="Subscriptions, MRR and growth at a glance."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="MRR" value={formatCurrency(mrr)} icon="card" />
        <StatCard label="Active subscriptions" value={active.length} icon="grid" />
        <StatCard label="Churned" value={churned.length} icon="flame" />
        <StatCard
          label="Collected (all time)"
          value={formatCurrency(paidRevenue)}
          icon="receipt"
        />
      </div>

      <RevenueCharts months={series} />
    </div>
  );
}
