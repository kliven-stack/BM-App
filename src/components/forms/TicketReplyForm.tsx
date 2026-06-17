"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { replyTicketAdminAction } from "@/app/admin/actions";
import { replyTicketClientAction } from "@/app/dashboard/actions";
import type { ActionState } from "@/lib/action-state";
import SubmitButton from "@/components/SubmitButton";
import { Icon } from "@/components/icons";

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
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [suggesting, setSuggesting] = useState(false);

  useEffect(() => {
    if (state.success) {
      toast.success(state.success);
      ref.current?.reset();
    }
    if (state.error) toast.error(state.error);
  }, [state]);

  async function suggest() {
    setSuggesting(true);
    try {
      const res = await fetch("/api/ai/suggest-reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticket_id: ticketId }),
      });
      if (res.status === 503) {
        toast.info("AI isn't configured. Add ANTHROPIC_API_KEY to enable it.");
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      if (textareaRef.current) {
        textareaRef.current.value = data.draft;
        textareaRef.current.focus();
      }
      toast.success("Draft inserted — review before sending");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not draft");
    } finally {
      setSuggesting(false);
    }
  }

  return (
    <form ref={ref} action={formAction} className="mt-4">
      <input type="hidden" name="ticket_id" value={ticketId} />
      <textarea
        ref={textareaRef}
        name="body"
        rows={3}
        placeholder="Write a reply…"
        className="input"
      />
      <div className="mt-2 flex items-center justify-between gap-3">
        <input
          type="file"
          name="file"
          className="text-xs text-gray-500 file:mr-3 file:rounded-md file:border-0 file:bg-brand-50 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-brand-600 dark:file:bg-brand-500/15 dark:file:text-brand-300"
        />
        <div className="flex items-center gap-2">
          {kind === "admin" && (
            <button
              type="button"
              onClick={suggest}
              disabled={suggesting}
              className="btn-secondary text-xs"
            >
              <Icon name="star" size={14} />
              {suggesting ? "Drafting…" : "Suggest reply"}
            </button>
          )}
          <SubmitButton>Send reply</SubmitButton>
        </div>
      </div>
    </form>
  );
}
