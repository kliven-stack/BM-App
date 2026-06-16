"use client";

import { useEffect, useState } from "react";
import Sidebar, { type NavGroup } from "./Sidebar";
import Topbar from "./Topbar";
import type { NotificationItem } from "./NotificationBell";

interface DashboardShellProps {
  groups: NavGroup[];
  brandName: string;
  userName: string;
  userEmail: string;
  notifications?: NotificationItem[];
  children: React.ReactNode;
}

const COLLAPSE_KEY = "sidebar-collapsed";

export default function DashboardShell({
  groups,
  brandName,
  userName,
  userEmail,
  notifications = [],
  children,
}: DashboardShellProps) {
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // Restore the persisted collapse preference on mount.
  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(COLLAPSE_KEY) === "1");
    } catch {
      // ignore
    }
  }, []);

  function toggleCollapse() {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");
      } catch {
        // ignore
      }
      return next;
    });
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar
        groups={groups}
        brandName={brandName}
        open={open}
        collapsed={collapsed}
        onClose={() => setOpen(false)}
        onToggleCollapse={toggleCollapse}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          userName={userName}
          userEmail={userEmail}
          onMenu={() => setOpen(true)}
          notifications={notifications}
        />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
