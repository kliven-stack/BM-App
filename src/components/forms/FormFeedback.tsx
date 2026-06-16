"use client";

import type { ActionState } from "@/lib/action-state";

// Renders the success/error message returned by a Server Action.
export default function FormFeedback({ state }: { state: ActionState }) {
  if (state.error) {
    return (
      <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
        {state.error}
      </p>
    );
  }
  if (state.success) {
    return (
      <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
        {state.success}
      </p>
    );
  }
  return null;
}
