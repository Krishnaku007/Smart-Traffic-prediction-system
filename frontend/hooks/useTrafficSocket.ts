"use client";

import { useEffect, useState } from "react";

import type { TrafficPoint } from "@/types";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:8000/ws/traffic";

export function useTrafficSocket(initialTraffic: TrafficPoint[] = []) {
  const [traffic, setTraffic] = useState<TrafficPoint[]>(initialTraffic);

  useEffect(() => {
    const socket = new WebSocket(WS_URL);

    socket.onopen = () => {
      socket.send("subscribe");
    };

    socket.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (Array.isArray(payload.traffic)) {
          setTraffic(payload.traffic);
        }
      } catch {
        // Ignore malformed websocket payloads.
      }
    };

    return () => {
      socket.close();
    };
  }, []);

  return traffic;
}
