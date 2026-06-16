// Small presentation helpers shared across the dashboards.

export function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

export function formatDate(value: string | Date): string {
  const d = typeof value === "string" ? new Date(value) : value;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const STATUS_STYLES: Record<string, string> = {
  open: "bg-blue-100 text-blue-700",
  in_progress: "bg-amber-100 text-amber-700",
  closed: "bg-gray-100 text-gray-600",
  active: "bg-green-100 text-green-700",
  trialing: "bg-indigo-100 text-indigo-700",
  past_due: "bg-red-100 text-red-700",
  canceled: "bg-gray-100 text-gray-600",
  paid: "bg-green-100 text-green-700",
  unpaid: "bg-red-100 text-red-700",
  lead: "bg-amber-100 text-amber-700",
  churned: "bg-gray-100 text-gray-600",
};

export function statusClasses(status: string): string {
  return STATUS_STYLES[status] ?? "bg-gray-100 text-gray-600";
}
