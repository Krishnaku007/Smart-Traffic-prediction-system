"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { fetchRoute } from "@/services/api";

const ROAD_NAMES: Record<number, string> = {
  1: "Main St",
  2: "Ring Rd",
  3: "Airport Rd",
  4: "Market Rd",
  5: "Lake Rd",
  6: "Tech Park Rd",
};

export function RoutePlanner() {
  const [source, setSource] = useState(1);
  const [destination, setDestination] = useState(6);

  const routeMutation = useMutation({
    mutationFn: ({ src, dst }: { src: number; dst: number }) =>
      fetchRoute(src, dst),
  });

  return (
    <Card>
      <h3 className="font-display text-lg font-semibold">Route Optimisation</h3>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">From Road</label>
          <select
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-100"
            value={source}
            onChange={(e) => setSource(Number(e.target.value))}
          >
            {Object.entries(ROAD_NAMES).map(([id, name]) => (
              <option key={id} value={id}>
                {id}. {name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">To Road</label>
          <select
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-100"
            value={destination}
            onChange={(e) => setDestination(Number(e.target.value))}
          >
            {Object.entries(ROAD_NAMES).map(([id, name]) => (
              <option key={id} value={id}>
                {id}. {name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        className="mt-4 w-full rounded-xl bg-teal-700 px-4 py-2.5 font-semibold text-white transition hover:bg-teal-800 disabled:opacity-60"
        onClick={() => routeMutation.mutate({ src: source, dst: destination })}
        disabled={routeMutation.isPending || source === destination}
      >
        {routeMutation.isPending ? "Finding route…" : "Find Fastest Route"}
      </button>

      {routeMutation.isError && (
        <p className="mt-2 text-sm text-rose-600">Could not find route. Please try again.</p>
      )}

      {routeMutation.data && (
        <div className="mt-3 rounded-lg bg-slate-50 p-3 text-sm space-y-1">
          <div className="flex justify-between">
            <span className="text-slate-500">Distance</span>
            <strong>{routeMutation.data.shortest_distance_km} km</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">ETA</span>
            <strong>{routeMutation.data.fastest_time_min} min</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Path</span>
            <strong className="text-xs">
              {routeMutation.data.route_path
                .map((id) => ROAD_NAMES[id] ?? `Road ${id}`)
                .join(" → ")}
            </strong>
          </div>
        </div>
      )}
    </Card>
  );
}
