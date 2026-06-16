"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { replyTicketAdminAction } from "@/app/admin/actions";
import { replyTicketClientAction } from "@/app/dashboard/actions";
import type { ActionState } from "@/lib/action-state";
import SubmitButton from "@/components/SubmitButton";

const initial: ActionState = {};

export default function TicketReplyForm({
  ticketId,
  kind,
}: {
  ticketId: string;
  kind: "admin" | "client";
}) {
  const action =
    kind === "admin" ? replyTicketAdminAction : replyTicketClientAction;
  const [state, formAction] = useActionState(action, initial);
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      toast.success(state.success);
      ref.current?.reset();
    }
    if (state.error) toast.error(state.error);
  }, [state]);

  return (
    <form ref={ref} action={formAction} className="mt-4">
      <input type="hidden" name="ticket_id" value={ticketId} />
      <textarea
        name="body"
        rows={3}
        required
        placeholder="Write a reply…"
        className="input"
      />
      <div className="mt-2 flex justify-end">
        <SubmitButton>Send reply</SubmitButton>
      </div>
    </form>
  );
}
