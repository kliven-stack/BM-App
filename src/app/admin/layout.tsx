import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/format";
import DashboardShell from "@/components/DashboardShell";
import type { NavGroup } from "@/components/Sidebar";
import type { NotificationItem } from "@/components/NotificationBell";

const GROUPS: NavGroup[] = [
  {
    label: "Workspace",
    items: [{ href: "/admin", label: "Overview", icon: "grid" }],
  },
  {
    label: "Manage",
    items: [
      { href: "/admin/clients", label: "Clients", icon: "users" },
      { href: "/admin/websites", label: "Websites", icon: "globe" },
    ],
  },
  {
    label: "Billing & Support",
    items: [
      { href: "/admin/subscriptions", label: "Subscriptions", icon: "card" },
      { href: "/admin/invoices", label: "Invoices", icon: "receipt" },
      { href: "/admin/tickets", label: "Tickets", icon: "ticket" },
    ],
  },
  {
    label: "Account",
    items: [
      { href: "/admin/activity", label: "Activity", icon: "bell" },
      { href: "/admin/settings", label: "Settings", icon: "settings" },
    ],
  },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireRole("admin");

  // Recent open tickets surface in the notification bell.
  const supabase = await createClient();
  const { data: tickets } = await supabase
    .from("tickets")
    .select("id, subject, created_at, clients(name)")
    .eq("status", "open")
    .order("created_at", { ascending: false })
    .limit(8);

  const notifications: NotificationItem[] = (
    (tickets as
      | { id: string; subject: string; created_at: string; clients?: { name?: string } }[]
      | null) ?? []
  ).map((t) => ({
    id: t.id,
    title: t.subject,
    detail: `New ticket${t.clients?.name ? ` · ${t.clients.name}` : ""}`,
    href: "/admin/tickets",
    time: formatDate(t.created_at),
  }));

  return (
    <DashboardShell
      groups={GROUPS}
      brandName="Portal"
      userName={profile.name ?? "Admin"}
      userEmail={profile.email ?? ""}
      notifications={notifications}
    >
      {children}
    </DashboardShell>
  );
}
