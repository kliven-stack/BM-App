import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { toCsv, csvResponse } from "@/lib/csv";

// GET /api/export/invoices — admin-only CSV of all invoices.
export async function GET() {
  await requireRole("admin");
  const supabase = await createClient();
  const { data } = await supabase
    .from("invoices")
    .select("amount, status, created_at, subscriptions(clients(name))")
    .order("created_at", { ascending: false });

  const rows = ((data as
    | { amount: number; status: string; created_at: string; subscriptions?: { clients?: { name?: string } } }[]
    | null) ?? []
  ).map((i) => ({
    client: i.subscriptions?.clients?.name ?? "",
    amount: i.amount,
    status: i.status,
    created_at: i.created_at,
  }));

  const csv = toCsv(rows, [
    { key: "client", header: "Client" },
    { key: "amount", header: "Amount" },
    { key: "status", header: "Status" },
    { key: "created_at", header: "Date" },
  ]);
  return csvResponse(csv, "invoices.csv");
}
