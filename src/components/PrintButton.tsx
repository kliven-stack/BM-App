"use client";

import { Icon } from "./icons";

// Triggers the browser print dialog (used for "Save as PDF").
export default function PrintButton() {
  return (
    <button onClick={() => window.print()} className="btn-primary print:hidden">
      <Icon name="receipt" size={15} /> Print / Save as PDF
    </button>
  );
}
