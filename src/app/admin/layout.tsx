import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getTicketNotifications } from "@/lib/notifications";
import DashboardShell from "@/components/DashboardShell";
import type { NavGroup } from "@/components/Sidebar";

const GROUPS: NavGroup[] = [
  {
    label: "Workspace",
    items: [
      { href: "/admin", label: "Overview", icon: "grid" },
      { href: "/admin/revenue", label: "Revenue", icon: "star" },
    ],
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

  // Recent tickets + latest reply surface in the notification bell.
  const supabase = await createClient();
  const notifications = await getTicketNotifications(supabase, {
    viewer: "admin",
  });

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
