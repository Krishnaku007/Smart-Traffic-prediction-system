import { Card } from "@/components/ui/card";
import type { TrafficPoint } from "@/types";

interface AlertsPanelProps {
  traffic: TrafficPoint[];
  loading?: boolean;
}

export function AlertsPanel({ traffic, loading }: AlertsPanelProps) {
  const highAlerts = traffic.filter((item) => item.congestion_level === "High");
  const mediumAlerts = traffic.filter(
    (item) => item.congestion_level === "Medium"
  );

  return (
    <Card>
      <h3 className="font-display text-lg font-semibold">Traffic Alerts</h3>

      {loading && (
        <div className="mt-3 space-y-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-9 animate-pulse rounded-lg bg-slate-100" />
          ))}
        </div>
      )}

      {!loading && (
        <div className="mt-3 space-y-2 text-sm">
          {highAlerts.length === 0 && mediumAlerts.length === 0 && (
            <p className="text-slate-400">🟢 No congestion alerts right now.</p>
          )}
          {highAlerts.map((alert) => (
            <div
              key={alert.road_id}
              className="flex items-center justify-between rounded-lg bg-rose-50 px-3 py-2 text-rose-700"
            >
              <span className="font-medium">🔴 {alert.road_name}</span>
              <span className="text-xs">{alert.traffic_volume} veh</span>
            </div>
          ))}
          {mediumAlerts.map((alert) => (
            <div
              key={alert.road_id}
              className="flex items-center justify-between rounded-lg bg-amber-50 px-3 py-2 text-amber-700"
            >
              <span className="font-medium">🟡 {alert.road_name}</span>
              <span className="text-xs">{alert.traffic_volume} veh</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
