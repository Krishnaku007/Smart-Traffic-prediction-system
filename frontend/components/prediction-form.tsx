"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { predictTraffic } from "@/services/api";

// Convert JS getDay() (0=Sun, 1=Mon … 6=Sat) to ISO weekday (0=Mon … 6=Sun)
function jsWeekdayToISO(jsDay: number): number {
  return jsDay === 0 ? 6 : jsDay - 1;
}

const todayISO = new Date().toISOString().split("T")[0];

export function PredictionForm() {
  const [roadId, setRoadId] = useState(1);
  const [date, setDate] = useState(todayISO);
  const [time, setTime] = useState("08:00");
  const [temperature, setTemperature] = useState(28);

  const mutation = useMutation({ mutationFn: predictTraffic });

  function handlePredict() {
    const jsDay = new Date(date + "T12:00:00").getDay(); // noon to avoid TZ edge cases
    mutation.mutate({
      road_id: roadId,
      date,
      time: time.length === 5 ? time + ":00" : time, // ensure HH:MM:SS
      temperature,
      holiday: 0,
      weekday: jsWeekdayToISO(jsDay),
      weather: 1,
    });
  }

  return (
    <Card>
      <h3 className="font-display text-lg font-semibold">Traffic Prediction</h3>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">Road ID (1–6)</label>
          <input
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
            type="number"
            min={1}
            max={6}
            value={roadId}
            onChange={(e) => setRoadId(Number(e.target.value))}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">Temperature (°C)</label>
          <input
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
            type="number"
            value={temperature}
            onChange={(e) => setTemperature(Number(e.target.value))}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">Date</label>
          <input
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">Time</label>
          <input
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </div>
      </div>

      <button
        className="mt-4 w-full rounded-xl bg-sky-700 px-4 py-2.5 font-semibold text-white transition hover:bg-sky-800 disabled:opacity-60"
        onClick={handlePredict}
        disabled={mutation.isPending}
      >
        {mutation.isPending ? "Predicting…" : "Predict Congestion"}
      </button>

      {mutation.isError && (
        <p className="mt-2 text-sm text-rose-600">
          Prediction failed. Check that you are logged in and the backend is running.
        </p>
      )}

      {mutation.data && (
        <div className="mt-3 rounded-lg bg-slate-50 p-3 text-sm space-y-1">
          <div className="flex justify-between">
            <span className="text-slate-500">Predicted Volume</span>
            <strong>{mutation.data.predicted_volume.toFixed(0)} veh</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Congestion Level</span>
            <strong
              className={
                mutation.data.congestion_level === "High"
                  ? "text-rose-600"
                  : mutation.data.congestion_level === "Medium"
                  ? "text-amber-600"
                  : "text-emerald-600"
              }
            >
              {mutation.data.congestion_level}
            </strong>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Est. Travel Time</span>
            <strong>{mutation.data.estimated_travel_time_min} min</strong>
          </div>
        </div>
      )}
    </Card>
  );
}
