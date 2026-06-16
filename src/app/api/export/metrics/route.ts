import { createClient } from "@/lib/supabase/server";
import { getCurrentClient } from "@/lib/client-data";
import { toCsv, csvResponse } from "@/lib/csv";

// GET /api/export/metrics — the signed-in client's website metrics as CSV.
export async function GET() {
  const client = await getCurrentClient();
  if (!client) return new Response("No client account", { status: 403 });

  const supabase = await createClient();
  const { data: websites } = await supabase
    .from("websites")
    .select("id, name")
    .eq("client_id", client.id);

  const nameById = new Map(
    ((websites as { id: string; name: string }[] | null) ?? []).map((w) => [
      w.id,
      w.name,
    ]),
  );
  const ids = [...nameById.keys()];

  const { data: metrics } = ids.length
    ? await supabase
        .from("website_metrics")
        .select("*")
        .in("website_id", ids)
        .order("date", { ascending: false })
    : { data: [] };

  const rows = ((metrics as
    | {
        website_id: string;
        date: string;
        visitors: number;
        page_views: number;
        bounce_rate: number;
        avg_session_duration: number;
      }[]
    | null) ?? []
  ).map((m) => ({
    website: nameById.get(m.website_id) ?? "",
    date: m.date,
    visitors: m.visitors,
    page_views: m.page_views,
    bounce_rate: m.bounce_rate,
    avg_session_duration: m.avg_session_duration,
  }));

  const csv = toCsv(rows, [
    { key: "website", header: "Website" },
    { key: "date", header: "Date" },
    { key: "visitors", header: "Visitors" },
    { key: "page_views", header: "Page Views" },
    { key: "bounce_rate", header: "Bounce Rate" },
    { key: "avg_session_duration", header: "Avg Session (s)" },
  ]);
  return csvResponse(csv, "metrics.csv");
}
