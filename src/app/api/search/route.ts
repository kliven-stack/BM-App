import { NextResponse } from "next/server";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export interface SearchResult {
  type: string;
  label: string;
  sub?: string;
  href: string;
}

// GET /api/search?q=…  — role-aware quick search over clients/websites/tickets.
// RLS scopes results automatically (clients only see their own).
export async function GET(request: Request) {
  const profile = await getProfile();
  if (!profile) return NextResponse.json({ results: [] });

  const raw = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  // Strip characters that would break the PostgREST `or` filter.
  const q = raw.replace(/[%,()]/g, " ").trim();
  if (q.length < 1) return NextResponse.json({ results: [] });

  const supabase = await createClient();
  const like = `%${q}%`;
  const results: SearchResult[] = [];
  const isAdmin = profile.role === "admin";

  if (isAdmin) {
    const [clients, websites, tickets] = await Promise.all([
      supabase
        .from("clients")
        .select("id,name,email")
        .or(`name.ilike.${like},email.ilike.${like}`)
        .limit(5),
      supabase
        .from("websites")
        .select("id,name,url")
        .or(`name.ilike.${like},url.ilike.${like}`)
        .limit(5),
      supabase.from("tickets").select("id,subject").ilike("subject", like).limit(5),
    ]);
    (clients.data ?? []).forEach((c) =>
      results.push({ type: "Client", label: c.name, sub: c.email, href: "/admin/clients" }),
    );
    (websites.data ?? []).forEach((w) =>
      results.push({ type: "Website", label: w.name, sub: w.url, href: "/admin/websites" }),
    );
    (tickets.data ?? []).forEach((t) =>
      results.push({ type: "Ticket", label: t.subject, href: "/admin/tickets" }),
    );
  } else {
    const [websites, tickets] = await Promise.all([
      supabase
        .from("websites")
        .select("id,name,url")
        .or(`name.ilike.${like},url.ilike.${like}`)
        .limit(5),
      supabase.from("tickets").select("id,subject").ilike("subject", like).limit(5),
    ]);
    (websites.data ?? []).forEach((w) =>
      results.push({ type: "Website", label: w.name, sub: w.url, href: "/dashboard/websites" }),
    );
    (tickets.data ?? []).forEach((t) =>
      results.push({ type: "Ticket", label: t.subject, href: "/dashboard/tickets" }),
    );
  }

  return NextResponse.json({ results });
}
