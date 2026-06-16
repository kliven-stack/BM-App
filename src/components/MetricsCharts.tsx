"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import type { WebsiteMetric } from "@/lib/types";
import { EmptyState } from "./ui";

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card">
      <p className="mb-4 text-sm font-semibold text-gray-700">{title}</p>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {children as React.ReactElement}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default function MetricsCharts({ metrics }: { metrics: WebsiteMetric[] }) {
  if (!metrics.length) {
    return (
      <EmptyState
        title="No metrics yet"
        description="Metrics will appear here once they have been recorded for this website."
      />
    );
  }

  // Recharts expects ascending chronological order.
  const data = [...metrics]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((m) => ({
      date: m.date.slice(5), // MM-DD
      visitors: m.visitors,
      page_views: m.page_views,
      bounce_rate: m.bounce_rate,
      avg_session: m.avg_session_duration,
    }));

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <ChartCard title="Visitors over time">
        <AreaChart data={data} margin={{ left: -20, right: 8, top: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="visitors"
            stroke="#4f46e5"
            fill="#e0e7ff"
            strokeWidth={2}
          />
        </AreaChart>
      </ChartCard>

      <ChartCard title="Page views">
        <BarChart data={data} margin={{ left: -20, right: 8, top: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Bar dataKey="page_views" fill="#6366f1" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ChartCard>

      <ChartCard title="Bounce rate (%)">
        <LineChart data={data} margin={{ left: -20, right: 8, top: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="bounce_rate"
            stroke="#ef4444"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ChartCard>

      <ChartCard title="Avg. session (seconds)">
        <LineChart data={data} margin={{ left: -20, right: 8, top: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="avg_session"
            stroke="#10b981"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ChartCard>
    </div>
  );
}
