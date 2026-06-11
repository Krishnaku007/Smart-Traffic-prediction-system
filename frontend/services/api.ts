import axios from "axios";

import type {
  AnalyticsResponse,
  PredictionResponse,
  RouteResponse,
  TrafficPoint,
} from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export const api = axios.create({
  baseURL: BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function fetchTraffic() {
  const { data } = await api.get<TrafficPoint[]>("/api/traffic");
  return data;
}

export async function fetchAnalytics() {
  const { data } = await api.get<AnalyticsResponse>("/api/analytics");
  return data;
}

export async function predictTraffic(payload: {
  road_id: number;
  date: string;
  time: string;
  temperature: number;
  holiday: number;
  weekday: number;
  weather: number;
}) {
  const { data } = await api.post<PredictionResponse>("/api/predict", payload);
  return data;
}

export async function fetchRoute(source_road_id: number, destination_road_id: number) {
  const { data } = await api.get<RouteResponse>(
    `/api/routes?source_road_id=${source_road_id}&destination_road_id=${destination_road_id}`
  );
  return data;
}

export async function askAssistant(question: string) {
  const { data } = await api.post<{ answer: string }>("/api/assistant", { question });
  return data.answer;
}
