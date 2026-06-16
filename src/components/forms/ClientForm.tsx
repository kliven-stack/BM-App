"use client";

import { useActionState, useEffect } from "react";
import {
  createClientAction,
  updateClientAction,
} from "@/app/admin/actions";
import type { ActionState } from "@/lib/action-state";
import SubmitButton from "@/components/SubmitButton";
import PasswordInput from "@/components/PasswordInput";
import FormFeedback from "./FormFeedback";

const initial: ActionState = {};

interface ClientFormProps {
  client?: { id: string; name: string; email: string };
  onDone?: () => void;
}

// Doubles as create + edit: pass `client` to edit an existing record.
export default function ClientForm({ client, onDone }: ClientFormProps) {
  const isEdit = Boolean(client);
  const [state, action] = useActionState(
    isEdit ? updateClientAction : createClientAction,
    initial,
  );

  useEffect(() => {
    if (state.success) onDone?.();
  }, [state.success, onDone]);

  return (
    <form action={action} className="space-y-4">
      {isEdit && <input type="hidden" name="id" value={client!.id} />}
      <div>
        <label className="label" htmlFor="name">
          Client name
        </label>
        <input
          id="name"
          name="name"
          className="input"
          defaultValue={client?.name}
          required
        />
      </div>
      <div>
        <label className="label" htmlFor="email">
          Client email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          className="input"
          defaultValue={client?.email}
          required
        />
        <p className="mt-1 text-xs text-gray-400">
          The client signs in with this email to see only their own data.
        </p>
      </div>
      {!isEdit && (
        <div>
          <label className="label" htmlFor="password">
            Password{" "}
            <span className="font-normal text-gray-400">(optional)</span>
          </label>
          <PasswordInput
            id="password"
            name="password"
            autoComplete="new-password"
            placeholder="Set a login password"
          />
          <p className="mt-1 text-xs text-gray-400">
            Set one to give the client immediate login access. Leave blank and
            they can sign up themselves later.
          </p>
        </div>
      )}
      <FormFeedback state={state} />
      <SubmitButton>{isEdit ? "Save changes" : "Create client"}</SubmitButton>
    </form>
  );
}
