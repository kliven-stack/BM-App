"use client";

import { useActionState, useEffect } from "react";
import { createWebsiteAction } from "@/app/admin/actions";
import type { ActionState } from "@/lib/action-state";
import SubmitButton from "@/components/SubmitButton";
import FormFeedback from "./FormFeedback";
import type { Client } from "@/lib/types";

const initial: ActionState = {};

export default function WebsiteForm({
  clients,
  onDone,
}: {
  clients: Pick<Client, "id" | "name">[];
  onDone?: () => void;
}) {
  const [state, action] = useActionState(createWebsiteAction, initial);

  useEffect(() => {
    if (state.success) onDone?.();
  }, [state.success, onDone]);

  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="label" htmlFor="client_id">
          Client
        </label>
        <select id="client_id" name="client_id" className="input" required>
          <option value="">Select a client…</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="label" htmlFor="name">
          Website name
        </label>
        <input id="name" name="name" className="input" required />
      </div>
      <div>
        <label className="label" htmlFor="url">
          URL
        </label>
        <input
          id="url"
          name="url"
          type="url"
          placeholder="https://example.com"
          className="input"
          required
        />
      </div>
      <div>
        <label className="label" htmlFor="plausible_domain">
          Plausible domain{" "}
          <span className="font-normal text-gray-400">(optional)</span>
        </label>
        <input
          id="plausible_domain"
          name="plausible_domain"
          placeholder="example.com"
          className="input"
        />
        <p className="mt-1 text-xs text-gray-400">
          Set this (and PLAUSIBLE_API_KEY) to pull real traffic instead of
          generated metrics.
        </p>
      </div>
      <FormFeedback state={state} />
      <SubmitButton>Add website</SubmitButton>
    </form>
  );
}
