"use client";

import Modal from "@/components/Modal";
import ClientForm from "./ClientForm";
import { Icon } from "@/components/icons";

export default function AddClientButton() {
  return (
    <Modal
      title="New client"
      trigger={(open) => (
        <button onClick={open} className="btn-primary">
          <Icon name="plus" size={16} /> New client
        </button>
      )}
    >
      {(close) => <ClientForm onDone={close} />}
    </Modal>
  );
}
