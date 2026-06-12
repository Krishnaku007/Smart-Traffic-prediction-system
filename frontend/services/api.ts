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
  timeout: 15_000,
});

// ─── Request interceptor: attach JWT token ────────────────────────────────────
api.interceptors.request.use((config) => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Response interceptor: redirect to login on 401 ──────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      typeof window !== "undefined" &&
      error?.response?.status === 401 &&
      !window.location.pathname.startsWith("/login")
    ) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function login(email: string, password: string): Promise<string> {
  const { data } = await api.post<{ access_token: string }>("/api/auth/login", {
    email,
    password,
  });
  return data.access_token;
}

export async function register(
  name: string,
  email: string,
  password: string
): Promise<string> {
  const { data } = await api.post<{ access_token: string }>(
    "/api/auth/register",
    { name, email, password }
  );
  return data.access_token;
}

// ─── Traffic ─────────────────────────────────────────────────────────────────

export async function fetchTraffic(): Promise<TrafficPoint[]> {
  const { data } = await api.get<TrafficPoint[]>("/api/traffic");
  return data;
}

// ─── Analytics ───────────────────────────────────────────────────────────────

export async function fetchAnalytics(): Promise<AnalyticsResponse> {
  const { data } = await api.get<AnalyticsResponse>("/api/analytics");
  return data;
}

// ─── Prediction ───────────────────────────────────────────────────────────────

export async function predictTraffic(payload: {
  road_id: number;
  date: string;
  time: string;
  temperature: number;
  holiday: number;
  weekday: number;
  weather: number;
}): Promise<PredictionResponse> {
  const { data } = await api.post<PredictionResponse>("/api/predict", payload);
  return data;
}

// ─── Routes ───────────────────────────────────────────────────────────────────

export async function fetchRoute(
  source_road_id: number,
  destination_road_id: number
): Promise<RouteResponse> {
  const { data } = await api.get<RouteResponse>(
    `/api/routes?source_road_id=${source_road_id}&destination_road_id=${destination_road_id}`
  );
  return data;
}

// ─── AI Assistant ─────────────────────────────────────────────────────────────

export async function askAssistant(question: string): Promise<string> {
  const { data } = await api.post<{ answer: string }>("/api/assistant", {
    question,
  });
  return data.answer;
}
