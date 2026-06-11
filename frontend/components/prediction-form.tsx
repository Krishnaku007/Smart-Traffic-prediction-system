"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";

import { Card } from "@/components/ui/card";
import { predictTraffic } from "@/services/api";

export function PredictionForm() {
  const [roadId, setRoadId] = useState(1);
  const [date, setDate] = useState("2026-06-10");
  const [time, setTime] = useState("08:00:00");

  const mutation = useMutation({
    mutationFn: predictTraffic,
  });

  return (
    <Card>
      <h3 className="font-display text-lg font-semibold">Traffic Prediction</h3>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <input
          className="rounded-lg border border-slate-200 px-3 py-2"
          type="number"
          value={roadId}
          onChange={(e) => setRoadId(Number(e.target.value))}
        />
        <input
          className="rounded-lg border border-slate-200 px-3 py-2"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <input
          className="rounded-lg border border-slate-200 px-3 py-2"
          type="time"
          value={time}
          step={1}
          onChange={(e) => setTime(e.target.value)}
        />
      </div>
      <button
        className="mt-4 rounded-xl bg-sky-700 px-4 py-2 font-semibold text-white"
        onClick={() =>
          mutation.mutate({
            road_id: roadId,
            date,
            time,
            temperature: 28,
            holiday: 0,
            weekday: new Date(date).getDay(),
            weather: 1,
          })
        }
      >
        Predict Congestion
      </button>

      {mutation.data && (
        <div className="mt-3 rounded-lg bg-slate-50 p-3 text-sm">
          Predicted Volume: <b>{mutation.data.predicted_volume.toFixed(2)}</b> | Congestion: <b>{mutation.data.congestion_level}</b> | Travel Time: <b>{mutation.data.estimated_travel_time_min} min</b>
        </div>
      )}
    </Card>
  );
}
