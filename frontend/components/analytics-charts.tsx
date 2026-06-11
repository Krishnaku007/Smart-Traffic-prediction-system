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
  return Object.entries(obj).map(([label, value]) => ({ label, value }));
}

export function AnalyticsCharts({ analytics }: { analytics: AnalyticsResponse | undefined }) {
  const hourlyData = toSeries(analytics?.hourly ?? {});
  const dailyData = toSeries(analytics?.daily ?? {});

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <h3 className="font-display text-lg font-semibold">Hourly Traffic Trends</h3>
        <div className="mt-3 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#1e7898" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card>
        <h3 className="font-display text-lg font-semibold">Daily Traffic Trends</h3>
        <div className="mt-3 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#ef8d16" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
