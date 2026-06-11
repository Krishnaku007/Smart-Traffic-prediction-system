import { Card } from "@/components/ui/card";
import type { TrafficPoint } from "@/types";

export function AlertsPanel({ traffic }: { traffic: TrafficPoint[] }) {
  const highAlerts = traffic.filter((item) => item.congestion_level === "High");

  return (
    <Card>
      <h3 className="font-display text-lg font-semibold">Traffic Alerts</h3>
      <div className="mt-3 space-y-2 text-sm">
        {highAlerts.length === 0 && <p className="text-slate-500">No high congestion alerts.</p>}
        {highAlerts.map((alert) => (
          <div key={alert.road_id} className="rounded-lg bg-rose-50 p-2 text-rose-700">
            High traffic on {alert.road_name} ({alert.traffic_volume} vehicles)
          </div>
        ))}
      </div>
    </Card>
  );
}
