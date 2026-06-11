"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";

import { Card } from "@/components/ui/card";
import { fetchRoute } from "@/services/api";

export function RoutePlanner() {
  const [source, setSource] = useState(1);
  const [destination, setDestination] = useState(6);

  const routeMutation = useMutation({
    mutationFn: ({ src, dst }: { src: number; dst: number }) => fetchRoute(src, dst),
  });

  return (
    <Card>
      <h3 className="font-display text-lg font-semibold">Route Optimization</h3>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <input
          className="rounded-lg border border-slate-200 px-3 py-2"
          type="number"
          value={source}
          onChange={(e) => setSource(Number(e.target.value))}
        />
        <input
          className="rounded-lg border border-slate-200 px-3 py-2"
          type="number"
          value={destination}
          onChange={(e) => setDestination(Number(e.target.value))}
        />
      </div>
      <button
        className="mt-4 rounded-xl bg-teal-700 px-4 py-2 font-semibold text-white"
        onClick={() => routeMutation.mutate({ src: source, dst: destination })}
      >
        Find Fastest Route
      </button>

      {routeMutation.data && (
        <div className="mt-3 rounded-lg bg-slate-50 p-3 text-sm">
          Distance: <b>{routeMutation.data.shortest_distance_km} km</b> | ETA: <b>{routeMutation.data.fastest_time_min} min</b> | Path: <b>{routeMutation.data.route_path.join(" -> ")}</b>
        </div>
      )}
    </Card>
  );
}
