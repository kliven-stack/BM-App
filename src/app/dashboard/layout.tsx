import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getCurrentClient } from "@/lib/client-data";
import { getTicketNotifications } from "@/lib/notifications";
import DashboardShell from "@/components/DashboardShell";
import type { NavGroup } from "@/components/Sidebar";
import type { NotificationItem } from "@/components/NotificationBell";

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
  {
    label: "Preferences",
    items: [
      { href: "/dashboard/settings", label: "Settings", icon: "settings" },
    ],
  },
];

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireRole("client");

  // Surface recent tickets + replies in the notification bell.
  const client = await getCurrentClient();
  let notifications: NotificationItem[] = [];
  if (client) {
    const supabase = await createClient();
    notifications = await getTicketNotifications(supabase, {
      viewer: "client",
      clientId: client.id,
    });
  }

  return (
    <DashboardShell
      groups={GROUPS}
      brandName="Portal"
      userName={profile.name ?? "Account"}
      userEmail={profile.email ?? ""}
      notifications={notifications}
    >
      {children}
    </DashboardShell>
  );
}
