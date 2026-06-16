"use client";

import { useState } from "react";
import { Icon } from "./icons";

// Small dismissible banner shown after a successful Stripe Checkout redirect
// (/dashboard/subscription?checkout=success).
export default function CheckoutSuccessBanner({ show }: { show: boolean }) {
  const [open, setOpen] = useState(show);
  if (!open) return null;

  return (
    <div className="mb-6 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-green-800 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-300">
      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-500/15 text-green-600 dark:text-green-300">
        <Icon name="star" size={14} />
      </span>
      <div className="flex-1 text-sm">
        <p className="font-semibold">Subscription activated 🎉</p>
        <p className="mt-0.5 opacity-90">
          Thanks for subscribing — your plan is now active. It may take a few
          seconds to appear below.
        </p>
      </div>
      <button
        onClick={() => setOpen(false)}
        aria-label="Dismiss"
        className="rounded-lg p-1 text-green-700/70 hover:bg-green-500/10 hover:text-green-800 dark:text-green-300/70 dark:hover:text-green-200"
      >
        ✕
      </button>
    </div>
  );
}
