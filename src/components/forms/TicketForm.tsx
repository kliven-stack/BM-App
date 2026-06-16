"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { createTicketAction } from "@/app/dashboard/actions";
import type { ActionState } from "@/lib/action-state";
import SubmitButton from "@/components/SubmitButton";
import FormFeedback from "./FormFeedback";

const initial: ActionState = {};

export default function TicketForm() {
  const [state, action] = useActionState(createTicketAction, initial);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      toast.success(state.success);
      formRef.current?.reset();
    }
    if (state.error) toast.error(state.error);
  }, [state]);

  return (
    <form ref={formRef} action={action} className="card space-y-4">
      <div>
        <label className="label" htmlFor="subject">
          Subject
        </label>
        <input id="subject" name="subject" className="input" required />
      </div>
      <div>
        <label className="label" htmlFor="message">
          How can we help?
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          className="input"
          required
        />
      </div>
      <div>
        <label className="label" htmlFor="file">
          Attachment{" "}
          <span className="font-normal text-gray-400">(optional)</span>
        </label>
        <input
          id="file"
          type="file"
          name="file"
          className="text-xs text-gray-500 file:mr-3 file:rounded-md file:border-0 file:bg-brand-50 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-brand-600 dark:file:bg-brand-500/15 dark:file:text-brand-300"
        />
      </div>
      <FormFeedback state={state} />
      <SubmitButton>Submit ticket</SubmitButton>
    </form>
  );
}
