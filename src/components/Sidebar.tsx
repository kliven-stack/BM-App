"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "./icons";
import BrandMark from "./BrandMark";

export interface NavItem {
  href: string;
  label: string;
  icon: IconName;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

interface SidebarProps {
  groups: NavGroup[];
  brandName: string;
  open: boolean;
  collapsed: boolean;
  onClose: () => void;
  onToggleCollapse: () => void;
}

const EXACT = new Set(["/admin", "/dashboard"]);

export default function Sidebar({
  groups,
  brandName,
  open,
  collapsed,
  onClose,
  onToggleCollapse,
}: SidebarProps) {
  const pathname = usePathname();

  // `collapsed` only takes effect at lg+ (mobile slide-over is always full).
  const hideOnCollapse = collapsed ? "lg:hidden" : "";

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex h-screen w-64 flex-col border-r border-gray-200 bg-white transition-[width,transform] dark:border-white/10 dark:bg-slate-900 lg:sticky lg:top-0 lg:translate-x-0 ${
          collapsed ? "lg:w-20" : "lg:w-64"
        } ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Floating collapse/expand toggle, centered on the sidebar↔content edge */}
        <button
          onClick={onToggleCollapse}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="absolute right-0 top-6 z-50 hidden h-7 w-7 translate-x-1/2 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-md ring-1 ring-black/5 transition hover:scale-110 hover:border-brand-300 hover:text-brand-600 dark:border-white/15 dark:bg-slate-800 dark:text-gray-300 dark:ring-white/10 dark:hover:text-brand-400 lg:flex"
        >
          <Icon name={collapsed ? "chevronRight" : "chevronLeft"} size={16} />
        </button>

        {/* Brand */}
        <div
          className={`flex items-center gap-2.5 px-5 py-5 ${
            collapsed ? "lg:justify-center lg:px-0" : ""
          }`}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 text-white shadow-sm">
            <BrandMark size={18} />
          </div>
          <span
            className={`text-lg font-semibold tracking-tight text-gray-900 ${hideOnCollapse}`}
          >
            {brandName}
          </span>
        </div>

        {/* Grouped nav */}
        <nav className="flex-1 space-y-6 overflow-y-auto px-3 pb-4">
          {groups.map((group) => (
            <div key={group.label}>
              <p
                className={`px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400 ${hideOnCollapse}`}
              >
                {group.label}
              </p>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const active = EXACT.has(item.href)
                    ? pathname === item.href
                    : pathname === item.href ||
                      pathname.startsWith(`${item.href}/`);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      title={item.label}
                      className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                        collapsed ? "lg:justify-center lg:px-0" : ""
                      } ${
                        active
                          ? "bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300"
                          : "text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:hover:bg-white/5"
                      }`}
                    >
                      <Icon
                        name={item.icon}
                        size={19}
                        className={
                          active
                            ? "text-brand-600 dark:text-brand-400"
                            : "text-gray-400 group-hover:text-gray-600"
                        }
                      />
                      <span className={hideOnCollapse}>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Sign out */}
        <div className="border-t border-gray-100 p-3 dark:border-white/10">
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              title="Log Out"
              className={`group flex w-full items-center gap-3 rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-white/10 dark:text-gray-200 dark:hover:border-red-500/40 dark:hover:bg-red-500/10 dark:hover:text-red-400 ${
                collapsed
                  ? "lg:justify-center lg:border-0 lg:px-0"
                  : "justify-between"
              }`}
            >
              <span className={hideOnCollapse}>Log Out</span>
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm transition-colors group-hover:border-red-200 group-hover:bg-red-50 group-hover:text-red-600 dark:border-white/10 dark:bg-white/10 dark:text-gray-200 dark:group-hover:border-red-500/40 dark:group-hover:text-red-400">
                <Icon name="logout" size={15} />
              </span>
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
