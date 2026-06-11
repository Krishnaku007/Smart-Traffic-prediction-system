"use client";

import "leaflet/dist/leaflet.css";

import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";

import { Card } from "@/components/ui/card";
import type { TrafficPoint } from "@/types";

function color(level: string) {
  if (level === "Low") return "#18b27a";
  if (level === "Medium") return "#f2b72d";
  return "#e3394f";
}

export function TrafficMap({ traffic }: { traffic: TrafficPoint[] }) {
  return (
    <Card>
      <h3 className="font-display text-lg font-semibold">Interactive Traffic Map</h3>
      <div className="mt-3 h-[420px] overflow-hidden rounded-xl">
        <MapContainer center={[12.9716, 77.5946]} zoom={12} style={{ height: "100%", width: "100%" }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {traffic.map((point) => (
            <Marker key={point.road_id} position={[point.latitude, point.longitude]}>
              <Popup>
                <div>
                  <p className="font-semibold">{point.road_name}</p>
                  <p style={{ color: color(point.congestion_level) }}>{point.congestion_level} Traffic</p>
                  <p>Volume: {point.traffic_volume}</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
      <div className="mt-3 flex gap-4 text-xs">
        <span className="rounded bg-emerald-50 px-2 py-1 text-emerald-700">Green = Low</span>
        <span className="rounded bg-amber-50 px-2 py-1 text-amber-700">Yellow = Medium</span>
        <span className="rounded bg-rose-50 px-2 py-1 text-rose-700">Red = High</span>
      </div>
    </Card>
  );
}
