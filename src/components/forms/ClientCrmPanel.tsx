"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import {
  updateClientCrmAction,
  addClientNoteAction,
} from "@/app/admin/actions";
import type { ActionState } from "@/lib/action-state";
import type { ClientNote, ClientStatus } from "@/lib/types";
import SubmitButton from "@/components/SubmitButton";
import { formatDate } from "@/lib/format";

const initial: ActionState = {};
const STATUSES: ClientStatus[] = ["lead", "active", "churned"];

export default function ClientCrmPanel({
  clientId,
  status,
  tags,
  notes,
}: {
  clientId: string;
  status: ClientStatus;
  tags: string[];
  notes: ClientNote[];
}) {
  const [crmState, crmAction] = useActionState(updateClientCrmAction, initial);
  const [noteState, noteAction] = useActionState(addClientNoteAction, initial);
  const noteRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (crmState.success) toast.success(crmState.success);
    if (crmState.error) toast.error(crmState.error);
  }, [crmState]);
  useEffect(() => {
    if (noteState.success) {
      toast.success(noteState.success);
      noteRef.current?.reset();
    }
    if (noteState.error) toast.error(noteState.error);
  }, [noteState]);

  return (
    <div className="space-y-6">
      {/* Status + tags */}
      <form action={crmAction} className="card space-y-4">
        <h2 className="text-base font-semibold text-gray-900">CRM</h2>
        <input type="hidden" name="id" value={clientId} />
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="status">
              Status
            </label>
            <select
              id="status"
              name="status"
              defaultValue={status}
              className="input capitalize"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="tags">
              Tags
            </label>
            <input
              id="tags"
              name="tags"
              defaultValue={tags.join(", ")}
              placeholder="seo, retainer, priority"
              className="input"
            />
            <p className="mt-1 text-xs text-gray-400">Comma-separated.</p>
          </div>
        </div>
        <SubmitButton>Save</SubmitButton>
      </form>

      {/* Notes */}
      <div className="card">
        <h2 className="text-base font-semibold text-gray-900">Internal notes</h2>
        <p className="text-sm text-gray-500">Only visible to admins.</p>
        <form ref={noteRef} action={noteAction} className="mt-4">
          <input type="hidden" name="client_id" value={clientId} />
          <textarea
            name="body"
            rows={2}
            required
            placeholder="Add a note…"
            className="input"
          />
          <div className="mt-2 flex justify-end">
            <SubmitButton>Add note</SubmitButton>
          </div>
        </form>

        <ul className="mt-4 space-y-3">
          {notes.length === 0 && (
            <li className="text-sm text-gray-400">No notes yet.</li>
          )}
          {notes.map((n) => (
            <li
              key={n.id}
              className="rounded-lg bg-gray-50 p-3 text-sm dark:bg-white/5"
            >
              <p className="whitespace-pre-wrap text-gray-800 dark:text-gray-100">
                {n.body}
              </p>
              <p className="mt-1 text-xs text-gray-400">
                {n.author_name ?? "Admin"} · {formatDate(n.created_at)}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
