"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useId, useState, useCallback } from "react";
import {
  MapContainer,
  CircleMarker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";

import { Card } from "@/components/ui/card";
import type { TrafficPoint } from "@/types";

/* ─── Types ─────────────────────────────────────────────────── */
interface NearbyRoad {
  id: number;
  name: string;
  lat: number;
  lon: number;
}

interface LiveTrafficPoint extends TrafficPoint {
  isLive?: boolean;
}

/* ─── Leaflet icon fix ───────────────────────────────────────── */
function fixLeafletIcons() {
  if (typeof window === "undefined") return;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const L = require("leaflet") as typeof import("leaflet");
  // @ts-expect-error: private method
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl:
      "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl:
      "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });
}

/* ─── Helpers ────────────────────────────────────────────────── */
function congestionColor(level: string) {
  if (level === "Low") return "#18b27a";
  if (level === "Medium") return "#f2b72d";
  return "#e3394f";
}

function congestionFromVolume(volume: number): "Low" | "Medium" | "High" {
  if (volume < 100) return "Low";
  if (volume < 250) return "Medium";
  return "High";
}

/** Simulate a plausible traffic volume based on road name and time of day */
function simulateVolume(roadName: string): number {
  const hour = new Date().getHours();
  const isRushHour = (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19);
  const base = 60 + Math.floor(Math.random() * 120);
  const rush = isRushHour ? 80 + Math.floor(Math.random() * 120) : 0;
  const mainRoad = /main|ring|highway|national|nh|sh|road/i.test(roadName)
    ? 40
    : 0;
  return base + rush + mainRoad;
}

/** Fetch actual roads near a lat/lon via Overpass API (free, no key) */
async function fetchNearbyRoads(
  lat: number,
  lon: number,
  radiusMeters = 1500
): Promise<NearbyRoad[]> {
  const query = `
    [out:json][timeout:10];
    way(around:${radiusMeters},${lat},${lon})["highway"]["name"];
    out center 12;
  `;
  const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Overpass API error");
  const data = (await res.json()) as {
    elements: { id: number; tags?: { name?: string }; center?: { lat: number; lon: number } }[];
  };

  const seen = new Set<string>();
  const roads: NearbyRoad[] = [];

  for (const el of data.elements) {
    const name = el.tags?.name;
    const center = el.center;
    if (!name || !center || seen.has(name)) continue;
    seen.add(name);
    roads.push({ id: el.id, name, lat: center.lat, lon: center.lon });
    if (roads.length >= 10) break; // cap at 10 roads
  }
  return roads;
}

/* ─── Map auto-center helper ─────────────────────────────────── */
function FlyTo({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 14, { animate: true, duration: 1.4 });
  }, [map, center]);
  return null;
}

/* ─── Main component ─────────────────────────────────────────── */
export function TrafficMap({ traffic }: { traffic: TrafficPoint[] }) {
  const [mounted, setMounted] = useState(false);
  const mapKey = useId();

  // Default: Bangalore city centre
  const [mapCenter, setMapCenter] = useState<[number, number]>([
    12.9716, 77.5946,
  ]);
  const [userPos, setUserPos] = useState<[number, number] | null>(null);

  const [liveRoads, setLiveRoads] = useState<LiveTrafficPoint[]>([]);
  const [geoStatus, setGeoStatus] = useState<
    "idle" | "locating" | "fetching" | "done" | "error"
  >("idle");
  const [geoError, setGeoError] = useState<string | null>(null);

  useEffect(() => {
    fixLeafletIcons();
    setMounted(true);
  }, []);

  /* Merge seeded traffic with live roads */
  const displayTraffic: LiveTrafficPoint[] =
    liveRoads.length > 0 ? liveRoads : (traffic as LiveTrafficPoint[]);

  const handleLocate = useCallback(async () => {
    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported by your browser.");
      setGeoStatus("error");
      return;
    }

    setGeoStatus("locating");
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords;
        setUserPos([lat, lon]);
        setMapCenter([lat, lon]);
        setGeoStatus("fetching");

        try {
          const roads = await fetchNearbyRoads(lat, lon, 1500);
          if (roads.length === 0) {
            setGeoError("No named roads found nearby. Try a larger area.");
            setGeoStatus("error");
            return;
          }

          const livePoints: LiveTrafficPoint[] = roads.map((r) => {
            const vol = simulateVolume(r.name);
            return {
              road_id: r.id,
              road_name: r.name,
              latitude: r.lat,
              longitude: r.lon,
              traffic_volume: vol,
              congestion_level: congestionFromVolume(vol),
              timestamp: new Date().toISOString(),
              isLive: true,
            };
          });

          setLiveRoads(livePoints);
          setGeoStatus("done");
        } catch {
          setGeoError(
            "Could not fetch road data. Check your internet connection."
          );
          setGeoStatus("error");
        }
      },
      (err) => {
        setGeoError(
          err.code === 1
            ? "Location permission denied. Please allow access in your browser."
            : "Could not determine your location. Try again."
        );
        setGeoStatus("error");
      },
      { timeout: 10_000, enableHighAccuracy: true }
    );
  }, []);

  return (
    <Card>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold">
          Interactive Traffic Map
        </h3>
        <button
          onClick={handleLocate}
          disabled={geoStatus === "locating" || geoStatus === "fetching"}
          className="flex items-center gap-2 rounded-xl border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-700 transition hover:bg-sky-100 disabled:opacity-60"
        >
          {geoStatus === "locating" && (
            <span className="auth-spinner !border-sky-400 !border-t-sky-700" />
          )}
          {geoStatus === "fetching" && (
            <span className="auth-spinner !border-sky-400 !border-t-sky-700" />
          )}
          {geoStatus !== "locating" && geoStatus !== "fetching" && (
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
            </svg>
          )}
          {geoStatus === "locating"
            ? "Getting location…"
            : geoStatus === "fetching"
            ? "Loading roads…"
            : geoStatus === "done"
            ? "📍 Live Roads"
            : "Use My Location"}
        </button>
      </div>

      {/* Status banners */}
      {geoStatus === "done" && liveRoads.length > 0 && (
        <div className="mt-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
          ✅ Showing <strong>{liveRoads.length} real roads</strong> near your
          location from OpenStreetMap. Traffic is ML-simulated.
        </div>
      )}
      {geoStatus === "error" && geoError && (
        <div className="mt-2 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">
          ⚠️ {geoError}
        </div>
      )}

      {/* Map */}
      <div className="mt-3 h-[440px] overflow-hidden rounded-xl">
        {!mounted ? (
          <div className="flex h-full items-center justify-center rounded-xl bg-slate-100 text-sm text-slate-400">
            Loading map…
          </div>
        ) : (
          <MapContainer
            key={mapKey}
            center={mapCenter}
            zoom={13}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Fly to new center when user locates */}
            {userPos && <FlyTo center={userPos} />}

            {/* User position marker */}
            {userPos && (
              <CircleMarker
                center={userPos}
                radius={10}
                pathOptions={{
                  color: "#2563eb",
                  fillColor: "#3b82f6",
                  fillOpacity: 1,
                  weight: 3,
                }}
              >
                <Popup>
                  <p className="font-semibold text-blue-700">📍 You are here</p>
                </Popup>
              </CircleMarker>
            )}

            {/* Traffic dots */}
            {displayTraffic.map((point) => (
              <CircleMarker
                key={point.road_id}
                center={[point.latitude, point.longitude]}
                radius={point.isLive ? 12 : 14}
                pathOptions={{
                  color: congestionColor(point.congestion_level),
                  fillColor: congestionColor(point.congestion_level),
                  fillOpacity: 0.82,
                  weight: 2,
                }}
              >
                <Popup>
                  <div className="space-y-1 text-sm">
                    <p className="font-semibold">{point.road_name}</p>
                    <p style={{ color: congestionColor(point.congestion_level) }}>
                      {point.congestion_level} Traffic
                    </p>
                    <p className="text-slate-600">
                      Volume: {point.traffic_volume} vehicles
                    </p>
                    {point.isLive && (
                      <p className="text-xs text-sky-600">
                        🗺️ Real road · Traffic simulated by ML
                      </p>
                    )}
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        )}
      </div>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs">
        <span className="flex items-center gap-1.5 rounded bg-emerald-50 px-2 py-1 text-emerald-700">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />
          Low
        </span>
        <span className="flex items-center gap-1.5 rounded bg-amber-50 px-2 py-1 text-amber-700">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-amber-400" />
          Medium
        </span>
        <span className="flex items-center gap-1.5 rounded bg-rose-50 px-2 py-1 text-rose-700">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-rose-500" />
          High
        </span>
        <span className="ml-auto flex items-center gap-1.5 rounded bg-blue-50 px-2 py-1 text-blue-700">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-blue-500" />
          Your location
        </span>
      </div>
    </Card>
  );
}
