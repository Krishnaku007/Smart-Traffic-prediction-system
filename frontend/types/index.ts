export type Congestion = "Low" | "Medium" | "High";

export interface TrafficPoint {
  road_id: number;
  road_name: string;
  latitude: number;
  longitude: number;
  traffic_volume: number;
  congestion_level: Congestion;
  timestamp: string;
}

export interface PredictionResponse {
  road_id: number;
  predicted_volume: number;
  congestion_level: Congestion;
  estimated_travel_time_min: number;
  prediction_time: string;
}

export interface AnalyticsResponse {
  hourly: Record<string, number>;
  daily: Record<string, number>;
  weekly: Record<string, number>;
  monthly: Record<string, number>;
}

export interface RouteResponse {
  shortest_distance_km: number;
  fastest_time_min: number;
  route_path: number[];
}
