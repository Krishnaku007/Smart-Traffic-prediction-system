"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";

import { AIAssistant } from "@/components/ai-assistant";
import { AlertsPanel } from "@/components/alerts-panel";
import { AnalyticsCharts } from "@/components/analytics-charts";
import { KpiCard } from "@/components/kpi-card";
import { PredictionForm } from "@/components/prediction-form";
import { RoutePlanner } from "@/components/route-planner";
import { useTrafficSocket } from "@/hooks/useTrafficSocket";
import { fetchAnalytics, fetchTraffic } from "@/services/api";

const TrafficMap = dynamic(() => import("@/components/traffic-map").then((m) => m.TrafficMap), {
  ssr: false,
});

const queryClient = new QueryClient();

function DashboardContent() {
  const trafficQuery = useQuery({ queryKey: ["traffic"], queryFn: fetchTraffic, refetchInterval: 10000 });
  const analyticsQuery = useQuery({ queryKey: ["analytics"], queryFn: fetchAnalytics, refetchInterval: 60000 });
  const traffic = useTrafficSocket(trafficQuery.data ?? []);

  const stats = useMemo(() => {
    const avgVolume = traffic.length
      ? traffic.reduce((sum, item) => sum + item.traffic_volume, 0) / traffic.length
      : 0;
    const highCount = traffic.filter((item) => item.congestion_level === "High").length;
    const avgTravel = 10 + avgVolume / 50;
    return {
      avgVolume: avgVolume.toFixed(1),
      highCount,
      avgTravel: avgTravel.toFixed(1),
    };
  }, [traffic]);

  return (
    <main className="mx-auto max-w-7xl space-y-5 px-4 py-6 md:px-6">
      <header className="animate-rise">
        <h1 className="font-display text-3xl font-bold text-slate-800 md:text-4xl">Smart Traffic Prediction System</h1>
        <p className="mt-1 text-slate-600">Real-time intelligence for congestion forecasting, route planning, and travel decisions.</p>
      </header>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Current Traffic Status" value={`${stats.avgVolume} avg`} accent="#1e7898" />
        <KpiCard label="Predicted Congestion" value={`${stats.highCount} high zones`} accent="#e3394f" />
        <KpiCard label="Average Travel Time" value={`${stats.avgTravel} min`} accent="#ef8d16" />
        <KpiCard label="WebSocket Refresh" value="10 sec" accent="#067647" />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <TrafficMap traffic={traffic} />
          <AnalyticsCharts analytics={analyticsQuery.data} />
        </div>
        <div className="space-y-4">
          <AlertsPanel traffic={traffic} />
          <PredictionForm />
          <RoutePlanner />
          <AIAssistant />
        </div>
      </section>
    </main>
  );
}

export function Dashboard() {
  return (
    <QueryClientProvider client={queryClient}>
      <DashboardContent />
    </QueryClientProvider>
  );
}
