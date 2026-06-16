"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import Modal from "@/components/Modal";
import ClientForm from "./ClientForm";
import { deleteClientAction } from "@/app/admin/actions";
import type { ActionState } from "@/lib/action-state";
import { Icon } from "@/components/icons";

const initial: ActionState = {};

interface Client {
  id: string;
  name: string;
  email: string;
}

export default function ClientRowActions({ client }: { client: Client }) {
  const [state, action] = useActionState(deleteClientAction, initial);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.error) toast.error(state.error);
    if (state.success) toast.success(state.success);
  }, [state.error, state.success]);

  return (
    <div className="flex items-center justify-end gap-1">
      {/* Edit */}
      <Modal
        title={`Edit ${client.name}`}
        trigger={(open) => (
          <button
            onClick={open}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-white/10"
            aria-label="Edit client"
            title="Edit"
          >
            <Icon name="edit" size={17} />
          </button>
        )}
      >
        {(close) => <ClientForm client={client} onDone={close} />}
      </Modal>

      {/* Delete */}
      <form
        ref={formRef}
        action={action}
        onSubmit={(e) => {
          if (
            !confirm(
              `Delete "${client.name}"? This also removes their websites, subscriptions, invoices and tickets. This cannot be undone.`,
            )
          ) {
            e.preventDefault();
          }
        }}
      >
        <input type="hidden" name="id" value={client.id} />
        <button
          type="submit"
          className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10"
          aria-label="Delete client"
          title="Delete"
        >
          <Icon name="trash" size={17} />
        </button>
      </form>
    </div>
  );
}
