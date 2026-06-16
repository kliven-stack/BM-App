import { statusClasses } from "@/lib/format";
import { Icon, type IconName } from "./icons";

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: IconName;
}) {
  return (
    <div className="card">
      <div className="flex items-center gap-3">
        {icon && (
          <span className="icon-chip">
            <Icon name={icon} size={18} />
          </span>
        )}
        <p className="text-sm font-medium text-gray-500">{label}</p>
      </div>
      <p className="mt-3 text-3xl font-bold text-gray-900">{value}</p>
      {hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`badge ${statusClasses(status)}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
}

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="card flex flex-col items-center justify-center py-12 text-center">
      <p className="text-sm font-medium text-gray-900">{title}</p>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-gray-500">{description}</p>
      )}
    </div>
  );
}

export function Table({
  head,
  children,
}: {
  head: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
            {head}
          </thead>
          <tbody className="divide-y divide-gray-100">{children}</tbody>
        </table>
      </div>
    </div>
  );
}
