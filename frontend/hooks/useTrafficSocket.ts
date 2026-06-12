"use client";

import { useEffect, useRef, useState } from "react";
import type { TrafficPoint } from "@/types";

const WS_URL =
  process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:8000/ws/traffic";

const MIN_RECONNECT_MS = 1_000;
const MAX_RECONNECT_MS = 30_000;

export function useTrafficSocket(initialTraffic: TrafficPoint[] = []) {
  const [traffic, setTraffic] = useState<TrafficPoint[]>(initialTraffic);
  const retryDelay = useRef(MIN_RECONNECT_MS);
  const socketRef = useRef<WebSocket | null>(null);
  const unmounted = useRef(false);

  useEffect(() => {
    unmounted.current = false;

    function connect() {
      if (unmounted.current) return;

      const socket = new WebSocket(WS_URL);
      socketRef.current = socket;

      socket.onopen = () => {
        retryDelay.current = MIN_RECONNECT_MS; // reset backoff on successful connect
        socket.send("subscribe");
      };

      socket.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data as string);
          if (Array.isArray(payload.traffic)) {
            setTraffic(payload.traffic as TrafficPoint[]);
          }
        } catch {
          // Ignore malformed payloads
        }
      };

      socket.onclose = () => {
        if (unmounted.current) return;
        // Exponential backoff reconnect
        const delay = retryDelay.current;
        retryDelay.current = Math.min(delay * 2, MAX_RECONNECT_MS);
        setTimeout(connect, delay);
      };

      socket.onerror = () => {
        // Let onclose handle reconnect
        socket.close();
      };
    }

    connect();

    return () => {
      unmounted.current = true;
      socketRef.current?.close();
    };
  }, []);

  // Keep traffic in sync with HTTP-fetched initial data when ws hasn't connected yet
  useEffect(() => {
    setTraffic((prev) => (prev.length === 0 ? initialTraffic : prev));
  }, [initialTraffic]);

  return traffic;
}
