"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";

import { AIAssistant } from "@/components/ai-assistant";
import { AlertsPanel } from "@/components/alerts-panel";
import { AnalyticsCharts } from "@/components/analytics-charts";
import { KpiCard } from "@/components/kpi-card";
import { PredictionForm } from "@/components/prediction-form";
import { RoutePlanner } from "@/components/route-planner";
import { useTrafficSocket } from "@/hooks/useTrafficSocket";
import { fetchAnalytics, fetchTraffic } from "@/services/api";

const TrafficMap = dynamic(
  () => import("@/components/traffic-map").then((m) => m.TrafficMap),
  { ssr: false, loading: () => <div className="flex h-[420px] items-center justify-center rounded-2xl bg-white/70 text-slate-400">Loading map…</div> }
);

function DashboardContent() {
  const router = useRouter();

  // Auth guard: redirect to /login if no token
  useEffect(() => {
    if (typeof window !== "undefined" && !localStorage.getItem("token")) {
      router.replace("/login");
    }
  }, [router]);

  const trafficQuery = useQuery({
    queryKey: ["traffic"],
    queryFn: fetchTraffic,
    refetchInterval: 10_000,
    retry: 2,
  });

  const analyticsQuery = useQuery({
    queryKey: ["analytics"],
    queryFn: fetchAnalytics,
    refetchInterval: 60_000,
    retry: 2,
  });

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
      roadCount: traffic.length,
    };
  }, [traffic]);

  function handleLogout() {
    localStorage.removeItem("token");
    router.push("/login");
  }

  return (
    <main className="mx-auto max-w-7xl space-y-5 px-4 py-6 md:px-6">
      <header className="animate-rise flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-slate-800 md:text-4xl">
            Smart Traffic Prediction
          </h1>
          <p className="mt-1 text-slate-500">
            Real-time intelligence for congestion forecasting, route planning, and travel decisions.
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="mt-1 rounded-xl border border-slate-200 bg-white/70 px-4 py-2 text-sm font-medium text-slate-600 shadow-sm backdrop-blur transition hover:bg-white hover:text-rose-600"
        >
          Sign Out
        </button>
      </header>

      {/* KPI Cards */}
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Avg Traffic Volume" value={`${stats.avgVolume} veh`} accent="#1e7898" />
        <KpiCard label="High Congestion Zones" value={`${stats.highCount} roads`} accent="#e3394f" />
        <KpiCard label="Avg Travel Time" value={`${stats.avgTravel} min`} accent="#ef8d16" />
        <KpiCard label="Roads Monitored" value={`${stats.roadCount}`} accent="#067647" />
      </section>

      {/* Error banners */}
      {trafficQuery.isError && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          ⚠️ Could not load traffic data. Make sure the backend is running.
        </div>
      )}

      {/* Main grid */}
      <section className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <TrafficMap traffic={traffic} />
          <AnalyticsCharts analytics={analyticsQuery.data} loading={analyticsQuery.isLoading} />
        </div>
        <div className="space-y-4">
          <AlertsPanel traffic={traffic} loading={trafficQuery.isLoading} />
          <PredictionForm />
          <RoutePlanner />
          <AIAssistant />
        </div>
      </section>
    </main>
  );
}

export function Dashboard() {
  // QueryClient must be created inside component scope (not at module level)
  // to avoid shared state across SSR requests.
  const queryClientRef = useRef<QueryClient | null>(null);
  if (!queryClientRef.current) {
    queryClientRef.current = new QueryClient({
      defaultOptions: {
        queries: { staleTime: 5_000 },
      },
    });
  }

  return (
    <QueryClientProvider client={queryClientRef.current}>
      <DashboardContent />
    </QueryClientProvider>
  );
}
