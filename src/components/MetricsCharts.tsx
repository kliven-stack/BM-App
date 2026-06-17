"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import type { WebsiteMetric } from "@/lib/types";
import { Icon, type IconName } from "./icons";
import { EmptyState } from "./ui";

function trendPct(curr: number, prev: number): number | null {
  if (!prev) return null;
  return Math.round(((curr - prev) / prev) * 100);
}

function fmtSession(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.round(s % 60);
  return m ? `${m}m ${sec}s` : `${sec}s`;
}

function Tile({
  label,
  value,
  icon,
  trend,
  trendGoodWhenDown = false,
}: {
  label: string;
  value: string;
  icon: IconName;
  trend: number | null;
  trendGoodWhenDown?: boolean;
}) {
  const up = trend != null && trend >= 0;
  const good = trend == null ? false : trendGoodWhenDown ? !up : up;
  return (
    <div className="card relative overflow-hidden">
      <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-brand-500/10 blur-2xl" />
      <div className="flex items-center gap-2">
        <span className="icon-chip h-8 w-8">
          <Icon name={icon} size={15} />
        </span>
        <p className="text-sm font-medium text-gray-500">{label}</p>
      </div>
      <div className="mt-3 flex items-end justify-between">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {trend != null && (
          <span
            className={`badge ${
              good
                ? "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300"
                : "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300"
            }`}
          >
            {up ? "▲" : "▼"} {Math.abs(trend)}%
          </span>
        )}
      </div>
    </div>
  );
}

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
      <div className="h-56 w-full">
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
        description="Metrics populate automatically each day — check back soon, or trigger the metrics job."
      />
    );
  }

  const data = [...metrics]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((m) => ({
      date: m.date.slice(5),
      visitors: m.visitors,
      page_views: m.page_views,
      bounce_rate: m.bounce_rate,
      avg_session: m.avg_session_duration,
    }));

  const sum = (k: keyof (typeof data)[number]) =>
    data.reduce((s, d) => s + (d[k] as number), 0);
  const totalVisitors = sum("visitors");
  const totalViews = sum("page_views");
  const avgBounce =
    data.reduce((s, d) => s + d.bounce_rate, 0) / data.length;
  const avgSession =
    data.reduce((s, d) => s + d.avg_session, 0) / data.length;

  // Trend = second half vs first half.
  const h = Math.floor(data.length / 2) || 1;
  const firstHalf = data.slice(0, h);
  const secondHalf = data.slice(h);
  const half = (arr: typeof data, k: keyof (typeof data)[number]) =>
    arr.reduce((s, d) => s + (d[k] as number), 0);
  const avgHalf = (arr: typeof data, k: keyof (typeof data)[number]) =>
    arr.length ? half(arr, k) / arr.length : 0;

  const visitorsTrend = trendPct(
    half(secondHalf, "visitors"),
    half(firstHalf, "visitors"),
  );
  const viewsTrend = trendPct(
    half(secondHalf, "page_views"),
    half(firstHalf, "page_views"),
  );
  const bounceTrend = trendPct(
    avgHalf(secondHalf, "bounce_rate"),
    avgHalf(firstHalf, "bounce_rate"),
  );
  const sessionTrend = trendPct(
    avgHalf(secondHalf, "avg_session"),
    avgHalf(firstHalf, "avg_session"),
  );

  return (
    <div className="space-y-6">
      {/* Summary tiles */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Tile
          label="Visitors"
          value={totalVisitors.toLocaleString()}
          icon="users"
          trend={visitorsTrend}
        />
        <Tile
          label="Page views"
          value={totalViews.toLocaleString()}
          icon="grid"
          trend={viewsTrend}
        />
        <Tile
          label="Bounce rate"
          value={`${avgBounce.toFixed(1)}%`}
          icon="flame"
          trend={bounceTrend}
          trendGoodWhenDown
        />
        <Tile
          label="Avg session"
          value={fmtSession(avgSession)}
          icon="star"
          trend={sessionTrend}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Visitors over time">
          <AreaChart data={data} margin={{ left: -18, right: 8, top: 8 }}>
            <defs>
              <linearGradient id="gv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#df533c" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#df533c" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} minTickGap={20} />
            <YAxis tick={{ fontSize: 11 }} width={40} />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="visitors"
              stroke="#cb4530"
              strokeWidth={2}
              fill="url(#gv)"
            />
          </AreaChart>
        </ChartCard>

        <ChartCard title="Page views">
          <BarChart data={data} margin={{ left: -18, right: 8, top: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} minTickGap={20} />
            <YAxis tick={{ fontSize: 11 }} width={40} />
            <Tooltip />
            <Bar dataKey="page_views" fill="#e67e64" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartCard>

        <ChartCard title="Bounce rate (%)">
          <LineChart data={data} margin={{ left: -18, right: 8, top: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} minTickGap={20} />
            <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} width={40} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="bounce_rate"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartCard>

        <ChartCard title="Avg. session (seconds)">
          <LineChart data={data} margin={{ left: -18, right: 8, top: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} minTickGap={20} />
            <YAxis tick={{ fontSize: 11 }} width={40} />
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
    </div>
  );
}
