import { requireRole } from "@/lib/auth";
import DashboardShell from "@/components/DashboardShell";
import type { NavGroup } from "@/components/Sidebar";

const GROUPS: NavGroup[] = [
  {
    label: "Overview",
    items: [{ href: "/dashboard", label: "Dashboard", icon: "home" }],
  },
  {
    label: "Account",
    items: [
      { href: "/dashboard/websites", label: "Websites", icon: "globe" },
      { href: "/dashboard/subscription", label: "Subscription", icon: "card" },
      { href: "/dashboard/invoices", label: "Invoices", icon: "receipt" },
    ],
  },
  {
    label: "Help",
    items: [{ href: "/dashboard/tickets", label: "Support", icon: "lifebuoy" }],
  },
];

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireRole("client");

  return (
    <DashboardShell
      groups={GROUPS}
      brandName="Portal"
      userName={profile.name ?? "Account"}
      userEmail={profile.email ?? ""}
    >
      {children}
    </DashboardShell>
  );
}
