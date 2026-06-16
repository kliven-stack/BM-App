"use client";

import Modal from "@/components/Modal";
import MetricForm from "./MetricForm";

export default function AddMetricButton({
  websiteId,
  websiteName,
}: {
  websiteId: string;
  websiteName: string;
}) {
  return (
    <Modal
      title={`Add metric — ${websiteName}`}
      trigger={(open) => (
        <button onClick={open} className="btn-secondary text-xs">
          + Metric
        </button>
      )}
    >
      {(close) => <MetricForm websiteId={websiteId} onDone={close} />}
    </Modal>
  );
}
