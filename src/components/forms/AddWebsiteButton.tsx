"use client";

import Modal from "@/components/Modal";
import WebsiteForm from "./WebsiteForm";
import { Icon } from "@/components/icons";
import type { Client } from "@/lib/types";

export default function AddWebsiteButton({
  clients,
}: {
  clients: Pick<Client, "id" | "name">[];
}) {
  return (
    <Modal
      title="Add website"
      trigger={(open) => (
        <button onClick={open} className="btn-primary">
          <Icon name="plus" size={16} /> Add website
        </button>
      )}
    >
      {(close) => <WebsiteForm clients={clients} onDone={close} />}
    </Modal>
  );
}
