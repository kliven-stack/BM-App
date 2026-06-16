import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getCurrentClient } from "@/lib/client-data";
import { formatDate } from "@/lib/format";
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

  // Surface the client's recent tickets in the notification bell.
  const client = await getCurrentClient();
  let notifications: NotificationItem[] = [];
  if (client) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("tickets")
      .select("id, subject, status, created_at")
      .eq("client_id", client.id)
      .order("created_at", { ascending: false })
      .limit(8);
    notifications = (
      (data as
        | { id: string; subject: string; status: string; created_at: string }[]
        | null) ?? []
    ).map((t) => ({
      id: t.id,
      title: t.subject,
      detail: `Status: ${t.status.replace(/_/g, " ")}`,
      href: "/dashboard/tickets",
      time: formatDate(t.created_at),
    }));
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
