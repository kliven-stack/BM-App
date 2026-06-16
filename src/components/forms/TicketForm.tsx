"use client";

import { useActionState, useEffect, useRef } from "react";
import { createTicketAction } from "@/app/dashboard/actions";
import type { ActionState } from "@/lib/action-state";
import SubmitButton from "@/components/SubmitButton";
import FormFeedback from "./FormFeedback";

const initial: ActionState = {};

export default function TicketForm() {
  const [state, action] = useActionState(createTicketAction, initial);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success]);

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
      <FormFeedback state={state} />
      <SubmitButton>Submit ticket</SubmitButton>
    </form>
  );
}
