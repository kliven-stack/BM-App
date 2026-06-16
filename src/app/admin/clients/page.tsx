import { createClient } from "@/lib/supabase/server";
import { PageHeader, Table, EmptyState } from "@/components/ui";
import AddClientButton from "@/components/forms/AddClientButton";
import ClientRowActions from "@/components/forms/ClientRowActions";
import { formatDate } from "@/lib/format";
import type { Client } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminClientsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("clients")
    .select("*")
    .order("created_at", { ascending: false });

  const clients = (data as Client[]) ?? [];

  return (
    <div>
      <PageHeader
        title="Clients"
        description="Every client account in the portal."
        action={<AddClientButton />}
      />

      {clients.length === 0 ? (
        <EmptyState
          title="No clients yet"
          description="Create your first client to start adding websites and subscriptions."
        />
      ) : (
        <Table
          head={
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          }
        >
          {clients.map((c) => (
            <tr key={c.id}>
              <td className="px-4 py-3 font-medium text-gray-900">{c.name}</td>
              <td className="px-4 py-3 text-gray-600">{c.email}</td>
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
