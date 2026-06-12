"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card } from "@/components/ui/card";
import type { AnalyticsResponse } from "@/types";

function toSeries(obj: Record<string, number>) {
  return Object.entries(obj)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => a.label.localeCompare(b.label, undefined, { numeric: true }));
}

function Skeleton() {
  return (
    <div className="mt-3 h-64 animate-pulse rounded-xl bg-slate-100" />
  );
}

interface AnalyticsChartsProps {
  analytics: AnalyticsResponse | undefined;
  loading?: boolean;
}

export function AnalyticsCharts({ analytics, loading }: AnalyticsChartsProps) {
  const hourlyData = toSeries(analytics?.hourly ?? {});
  const dailyData = toSeries(analytics?.daily ?? {});

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <h3 className="font-display text-lg font-semibold">Hourly Traffic Trend</h3>
        {loading ? (
          <Skeleton />
        ) : (
          <div className="mt-3 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) => `${v}h`}
                />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(v: number) => [`${v} veh`, "Avg Volume"]}
                  labelFormatter={(l) => `Hour ${l}`}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#1e7898"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      <Card>
        <h3 className="font-display text-lg font-semibold">Daily Traffic Trend</h3>
        {loading ? (
          <Skeleton />
        ) : (
          <div className="mt-3 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 9 }}
                  interval="preserveStartEnd"
                  tickFormatter={(v: string) => v.slice(5)} // MM-DD
                />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(v: number) => [`${v} veh`, "Avg Volume"]}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#ef8d16"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>
    </div>
  );
}
