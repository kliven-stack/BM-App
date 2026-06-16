"use client";

import { useState } from "react";

// Lightweight "button opens a dialog" wrapper. No portal dependency — the
// dialog is fixed-positioned over the page.
export default function Modal({
  trigger,
  title,
  children,
}: {
  trigger: (open: () => void) => React.ReactNode;
  title: string;
  children: (close: () => void) => React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <>
      {trigger(() => setOpen(true))}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={close}
            aria-hidden
          />
          <div className="relative z-10 w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
              <button
                onClick={close}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            {children(close)}
          </div>
        </div>
      )}
    </>
  );
}
