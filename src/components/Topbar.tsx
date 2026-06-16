"use client";

import { Icon } from "./icons";
import ThemeToggle from "./ThemeToggle";
import NotificationBell, { type NotificationItem } from "./NotificationBell";

interface TopbarProps {
  userName: string;
  userEmail: string;
  onMenu: () => void;
  onSearch: () => void;
  notifications?: NotificationItem[];
}

function initials(name: string, email: string): string {
  const base = name?.trim() || email;
  const parts = base.split(/[\s@.]+/).filter(Boolean);
  return (parts[0]?.[0] ?? "U").toUpperCase() + (parts[1]?.[0] ?? "").toUpperCase();
}

export default function Topbar({
  userName,
  userEmail,
  onMenu,
  onSearch,
  notifications = [],
}: TopbarProps) {
  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-gray-200 bg-white/80 px-4 py-3 backdrop-blur dark:border-white/10 dark:bg-slate-900/80 sm:px-6">
      <button
        className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-50 dark:border-white/15 dark:text-gray-300 dark:hover:bg-white/10 lg:hidden"
        onClick={onMenu}
        aria-label="Open navigation"
      >
        <Icon name="menu" size={18} />
      </button>

      {/* Search (opens the ⌘K command palette) */}
      <button
        onClick={onSearch}
        className="hidden w-full max-w-md items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 py-2 pl-3 pr-2 text-sm text-gray-400 hover:bg-gray-100 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10 sm:flex"
      >
        <Icon name="search" size={17} />
        <span>Search clients, websites, tickets…</span>
        <kbd className="ml-auto rounded border border-gray-300 px-1.5 py-0.5 text-[10px] font-medium text-gray-400 dark:border-white/15">
          ⌘K
        </kbd>
      </button>

      {/* Mobile search icon */}
      <button
        onClick={onSearch}
        className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50 dark:border-white/15 dark:text-gray-300 dark:hover:bg-white/10 sm:hidden"
        aria-label="Search"
      >
        <Icon name="search" size={18} />
      </button>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <ThemeToggle />

        <NotificationBell items={notifications} />

        <div className="flex items-center gap-2.5 rounded-xl py-1 pl-1 pr-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-xs font-semibold text-white">
            {initials(userName, userEmail)}
          </div>
          <div className="hidden leading-tight sm:block">
            <p className="text-sm font-medium text-gray-900">
              {userName || "Account"}
            </p>
            <p className="max-w-[160px] truncate text-xs text-gray-400">
              {userEmail}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
