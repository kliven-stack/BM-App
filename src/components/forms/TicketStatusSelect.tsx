"use client";

import { useActionState } from "react";
import { updateTicketStatusAction } from "@/app/admin/actions";
import type { ActionState } from "@/lib/action-state";
import type { TicketStatus } from "@/lib/types";

const initial: ActionState = {};
const OPTIONS: TicketStatus[] = ["open", "in_progress", "closed"];

// Inline status dropdown that submits on change.
export default function TicketStatusSelect({
  id,
  status,
}: {
  id: string;
  status: TicketStatus;
}) {
  const [, action, pending] = useActionState(
    updateTicketStatusAction,
    initial,
  );

  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <select
        name="status"
        defaultValue={status}
        disabled={pending}
        className="input py-1 text-xs"
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
      >
        {OPTIONS.map((s) => (
          <option key={s} value={s}>
            {s.replace(/_/g, " ")}
          </option>
        ))}
      </select>
    </form>
  );
}
