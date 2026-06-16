"use client";

import { useEffect, useState } from "react";
import { Icon } from "./icons";

// Toggles `.dark` on <html> and persists the choice. The initial class is set
// pre-paint by the inline script in the root layout, so this only needs to read
// the current state on mount.
export default function ThemeToggle() {
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {
      // ignore storage failures (private mode, etc.)
    }
  }

  return (
    <button
      onClick={toggle}
      className="rounded-xl border border-gray-200 p-2 text-gray-500 hover:bg-gray-50 dark:border-white/15 dark:text-gray-300 dark:hover:bg-white/10"
      aria-label="Toggle dark mode"
      title={dark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {/* Avoid hydration mismatch: render a stable icon until mounted. */}
      {mounted && dark ? (
        <Icon name="sun" size={18} />
      ) : (
        <Icon name="moon" size={18} />
      )}
    </button>
  );
}
