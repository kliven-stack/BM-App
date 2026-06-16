import type { WebsiteCheck } from "@/lib/types";

export default function UptimeBadge({ check }: { check?: WebsiteCheck }) {
  if (!check) {
    return (
      <span className="badge bg-gray-100 text-gray-500 dark:bg-white/10 dark:text-gray-400">
        Not checked
      </span>
    );
  }
  if (check.ok) {
    return (
      <span className="badge bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300">
        ● Up
        {check.response_ms != null ? ` · ${check.response_ms}ms` : ""}
      </span>
    );
  }
  return (
    <span className="badge bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300">
      ● Down{check.status_code ? ` · ${check.status_code}` : ""}
    </span>
  );
}
