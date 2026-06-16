"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "./icons";
import type { NavGroup } from "./Sidebar";
import type { SearchResult } from "@/app/api/search/route";

// ⌘K / Ctrl+K command palette: quick-navigate the app and search entities.
export default function CommandPalette({
  open,
  setOpen,
  groups,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
  groups: NavGroup[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const navItems = useMemo(
    () => groups.flatMap((g) => g.items),
    [groups],
  );

  // Global shortcut + Escape.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(!open);
      }
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  // Focus the input when opened; reset when closed.
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 20);
    } else {
      setQuery("");
      setResults([]);
    }
  }, [open]);

  // Debounced entity search.
  useEffect(() => {
    if (!open) return;
    const q = query.trim();
    if (q.length < 1) {
      setResults([]);
      return;
    }
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        setResults(data.results ?? []);
      } catch {
        setResults([]);
      }
    }, 200);
    return () => clearTimeout(t);
  }, [query, open]);

  if (!open) return null;

  const filteredNav = navItems.filter((n) =>
    n.label.toLowerCase().includes(query.trim().toLowerCase()),
  );

  function go(href: string) {
    setOpen(false);
    router.push(href);
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center p-4 pt-24">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => setOpen(false)}
        aria-hidden
      />
      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl dark:border-white/10 dark:bg-slate-900">
        <div className="flex items-center gap-2 border-b border-gray-100 px-4 dark:border-white/10">
          <Icon name="search" size={18} className="text-gray-400" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search or jump to…"
            className="w-full bg-transparent py-3.5 text-sm outline-none placeholder:text-gray-400 dark:text-gray-100"
          />
          <kbd className="rounded border border-gray-200 px-1.5 py-0.5 text-[10px] text-gray-400 dark:border-white/15">
            ESC
          </kbd>
        </div>

        <div className="max-h-80 overflow-y-auto p-2">
          {/* Quick navigation */}
          {filteredNav.length > 0 && (
            <div className="mb-1">
              <p className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                Navigate
              </p>
              {filteredNav.map((n) => (
                <button
                  key={n.href}
                  onClick={() => go(n.href)}
                  className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-white/5"
                >
                  <Icon name={n.icon} size={16} className="text-gray-400" />
                  {n.label}
                </button>
              ))}
            </div>
          )}

          {/* Entity results */}
          {results.length > 0 && (
            <div>
              <p className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                Results
              </p>
              {results.map((r, i) => (
                <button
                  key={`${r.type}-${i}`}
                  onClick={() => go(r.href)}
                  className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-gray-50 dark:hover:bg-white/5"
                >
                  <span className="rounded bg-brand-50 px-1.5 py-0.5 text-[10px] font-medium text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
                    {r.type}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm text-gray-900">
                      {r.label}
                    </span>
                    {r.sub && (
                      <span className="block truncate text-xs text-gray-400">
                        {r.sub}
                      </span>
                    )}
                  </span>
                </button>
              ))}
            </div>
          )}

          {query.trim() && filteredNav.length === 0 && results.length === 0 && (
            <p className="px-2 py-6 text-center text-sm text-gray-500">
              No matches for “{query}”.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
