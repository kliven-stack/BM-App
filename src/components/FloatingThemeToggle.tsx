"use client";

import { useEffect, useState } from "react";
import { Icon } from "./icons";

// Floating dark/light toggle, pinned bottom-right. Used on the public marketing
// pages where there's no top bar to host it.
export default function FloatingThemeToggle() {
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
      // ignore storage failures
    }
  }

  return (
    <button
      onClick={toggle}
      aria-label="Toggle dark mode"
      title={dark ? "Switch to light mode" : "Switch to dark mode"}
      className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-lg transition hover:scale-105 hover:shadow-xl dark:border-white/15 dark:bg-slate-800 dark:text-gray-100"
    >
      {mounted && dark ? <Icon name="sun" size={20} /> : <Icon name="moon" size={20} />}
    </button>
  );
}
