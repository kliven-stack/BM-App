import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { toCsv, csvResponse } from "@/lib/csv";

// GET /api/export/clients — admin-only CSV of all clients.
export async function GET() {
  await requireRole("admin");
  const supabase = await createClient();
  const { data } = await supabase
    .from("clients")
    .select("name, email, status, created_at")
    .order("created_at", { ascending: false });

  const csv = toCsv((data as Record<string, unknown>[]) ?? [], [
    { key: "name", header: "Name" },
    { key: "email", header: "Email" },
    { key: "status", header: "Status" },
    { key: "created_at", header: "Created" },
  ]);
  return csvResponse(csv, "clients.csv");
}
