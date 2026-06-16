import { requireRole } from "@/lib/auth";
import DashboardShell from "@/components/DashboardShell";
import type { NavGroup } from "@/components/Sidebar";

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
      { href: "/admin/tickets", label: "Tickets", icon: "ticket" },
    ],
  },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireRole("admin");

  return (
    <DashboardShell
      groups={GROUPS}
      brandName="Portal"
      userName={profile.name ?? "Admin"}
      userEmail={profile.email ?? ""}
    >
      {children}
    </DashboardShell>
  );
}
