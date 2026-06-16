"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Icon } from "./icons";

export interface NotificationItem {
  id: string;
  title: string;
  detail?: string;
  href?: string;
  time?: string;
}

// Click-to-open notification dropdown. Closes on outside click or Escape.
export default function NotificationBell({
  items = [],
}: {
  items?: NotificationItem[];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Best-effort live updates: if Supabase Realtime is enabled for `tickets`,
  // refresh the page (re-running the layout's notification query) on changes.
  // Harmless no-op if Realtime isn't enabled for the table.
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("tickets-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tickets" },
        () => router.refresh(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [router]);

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const hasItems = items.length > 0;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative rounded-xl border border-gray-200 p-2 text-gray-500 hover:bg-gray-50 dark:border-white/15 dark:text-gray-300 dark:hover:bg-white/10"
        aria-label="Notifications"
        aria-expanded={open}
      >
        <Icon name="bell" size={18} />
        {hasItems && (
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-brand-500" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-30 mt-2 w-80 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg dark:border-white/10 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-white/10">
            <p className="text-sm font-semibold text-gray-900">Notifications</p>
            {hasItems && (
              <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
                {items.length} new
              </span>
            )}
          </div>

          {hasItems ? (
            <ul className="max-h-80 divide-y divide-gray-100 overflow-y-auto dark:divide-white/10">
              {items.map((n) => {
                const body = (
                  <div className="flex gap-3 px-4 py-3">
                    <span className="icon-chip h-8 w-8 shrink-0">
                      <Icon name="bell" size={15} />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-gray-900">
                        {n.title}
                      </p>
                      {n.detail && (
                        <p className="truncate text-xs text-gray-500">
                          {n.detail}
                        </p>
                      )}
                      {n.time && (
                        <p className="mt-0.5 text-xs text-gray-400">{n.time}</p>
                      )}
                    </div>
                  </div>
                );
                return (
                  <li
                    key={n.id}
                    className="hover:bg-gray-50 dark:hover:bg-white/5"
                  >
                    {n.href ? (
                      <a href={n.href} onClick={() => setOpen(false)}>
                        {body}
                      </a>
                    ) : (
                      body
                    )}
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="px-4 py-10 text-center">
              <p className="text-sm font-medium text-gray-900">
                You&apos;re all caught up
              </p>
              <p className="mt-1 text-xs text-gray-500">
                New activity will show up here.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
