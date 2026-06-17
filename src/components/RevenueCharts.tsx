"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

export interface MonthPoint {
  label: string;
  signups: number;
  revenue: number;
}

export default function RevenueCharts({ months }: { months: MonthPoint[] }) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="card">
        <p className="mb-4 text-sm font-semibold text-gray-700">
          Revenue (paid invoices)
        </p>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={months} margin={{ left: -10, right: 8, top: 8 }}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} width={48} />
              <Tooltip
                formatter={(v: number) => [`$${v.toLocaleString()}`, "Revenue"]}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#059669"
                strokeWidth={2}
                fill="url(#rev)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <p className="mb-4 text-sm font-semibold text-gray-700">New clients</p>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={months} margin={{ left: -18, right: 8, top: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} width={40} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="signups" fill="#df533c" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
