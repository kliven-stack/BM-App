"use client";

import Modal from "@/components/Modal";
import SubscriptionForm from "./SubscriptionForm";
import { Icon } from "@/components/icons";
import type { Client } from "@/lib/types";
import type { PriceOption } from "@/lib/stripe-prices";

export default function AddSubscriptionButton({
  clients,
  prices,
}: {
  clients: Pick<Client, "id" | "name" | "email">[];
  prices: PriceOption[];
}) {
  return (
    <Modal
      title="New subscription"
      trigger={(open) => (
        <button onClick={open} className="btn-primary">
          <Icon name="plus" size={16} /> New subscription
        </button>
      )}
    >
      {(close) => (
        <SubscriptionForm clients={clients} prices={prices} onDone={close} />
      )}
    </Modal>
  );
}
