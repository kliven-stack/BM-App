import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, Table, EmptyState, StatusBadge } from "@/components/ui";
import AddClientButton from "@/components/forms/AddClientButton";
import ClientRowActions from "@/components/forms/ClientRowActions";
import { formatDate } from "@/lib/format";
import type { Client } from "@/lib/types";

export const dynamic = "force-dynamic";

const FILTERS = [
  { key: "", label: "All" },
  { key: "lead", label: "Leads" },
  { key: "active", label: "Active" },
  { key: "churned", label: "Churned" },
];

export default async function AdminClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("clients")
    .select("*")
    .order("created_at", { ascending: false });
  if (status && ["lead", "active", "churned"].includes(status)) {
    query = query.eq("status", status);
  }
  const { data } = await query;
  const clients = (data as Client[]) ?? [];

  return (
    <div>
      <PageHeader
        title="Clients"
        description="Every client account in the portal."
        action={
          <div className="flex items-center gap-2">
            <a href="/api/export/clients" className="btn-secondary">
              Export CSV
            </a>
            <AddClientButton />
          </div>
        }
      />

      {/* Status filter */}
      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const active = (status ?? "") === f.key;
          return (
            <Link
              key={f.key}
              href={f.key ? `/admin/clients?status=${f.key}` : "/admin/clients"}
              className={`rounded-full px-3 py-1 text-sm font-medium ${
                active
                  ? "bg-brand-500 text-white"
                  : "border border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-white/15 dark:text-gray-300 dark:hover:bg-white/10"
              }`}
            >
              {f.label}
            </Link>
          );
        })}
      </div>

      {clients.length === 0 ? (
        <EmptyState
          title="No clients"
          description="No clients match this filter."
        />
      ) : (
        <Table
          head={
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          }
        >
          {clients.map((c) => (
            <tr key={c.id}>
              <td className="px-4 py-3 font-medium">
                <Link
                  href={`/admin/clients/${c.id}`}
                  className="text-gray-900 hover:text-brand-600 hover:underline"
                >
                  {c.name}
                </Link>
                {c.tags?.length ? (
                  <span className="ml-2 text-xs text-gray-400">
                    {c.tags.slice(0, 3).join(", ")}
                  </span>
                ) : null}
              </td>
              <td className="px-4 py-3 text-gray-600">{c.email}</td>
              <td className="px-4 py-3">
                <StatusBadge status={c.status ?? "active"} />
              </td>
              <td className="px-4 py-3 text-gray-500">
                {formatDate(c.created_at)}
              </td>
              <td className="px-4 py-3 text-right">
                <ClientRowActions
                  client={{ id: c.id, name: c.name, email: c.email }}
                />
              </td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
}
