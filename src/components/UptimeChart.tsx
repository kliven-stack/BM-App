"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import type { WebsiteCheck } from "@/lib/types";

// Response-time + uptime chart for a single website's recent checks.
export default function UptimeChart({ checks }: { checks: WebsiteCheck[] }) {
  if (!checks.length) return null;

  const data = checks.map((c) => ({
    t: c.checked_at.slice(5, 16).replace("T", " "), // MM-DD HH:MM
    ms: c.response_ms ?? 0,
  }));

  const upPct = Math.round(
    (checks.filter((c) => c.ok).length / checks.length) * 100,
  );
  const avg = Math.round(
    checks.reduce((sum, c) => sum + (c.response_ms ?? 0), 0) / checks.length,
  );

  return (
    <div className="card">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-700">Response time</p>
        <div className="flex gap-4 text-xs text-gray-500">
          <span>
            Uptime <span className="font-semibold text-gray-900">{upPct}%</span>
          </span>
          <span>
            Avg <span className="font-semibold text-gray-900">{avg}ms</span>
          </span>
          <span>{checks.length} checks</span>
        </div>
      </div>
      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ left: -18, right: 8, top: 8 }}>
            <defs>
              <linearGradient id="rt" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#df533c" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#df533c" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
            <XAxis dataKey="t" tick={{ fontSize: 11 }} minTickGap={28} />
            <YAxis tick={{ fontSize: 11 }} unit="ms" width={48} />
            <Tooltip formatter={(v: number) => [`${v} ms`, "Response"]} />
            <Area
              type="monotone"
              dataKey="ms"
              stroke="#cb4530"
              strokeWidth={2}
              fill="url(#rt)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
