"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getAccessToken } from "@/lib/auth-context";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AIChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface UseAIChatOptions {
  siteId: string;
  onSiteUpdate: (siteData: Record<string, unknown>) => void;
  enabled: boolean;
}

interface UseAIChatReturn {
  messages: AIChatMessage[];
  sendMessage: (content: string) => void;
  isConnected: boolean;
  isStreaming: boolean;
  streamingContent: string;
  error: string | null;
  reconnect: () => void;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const HEARTBEAT_INTERVAL = 30_000; // 30s
const RECONNECT_BASE_DELAY = 1_000;
const RECONNECT_MAX_DELAY = 30_000;

function getWsUrl(siteId: string, token: string): string {
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
  const wsBase = apiUrl
    .replace(/^https:/, "wss:")
    .replace(/^http:/, "ws:");
  return `${wsBase}/ws/ai-chat/${siteId}?token=${encodeURIComponent(token)}`;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useAIChat({
  siteId,
  onSiteUpdate,
  enabled,
}: UseAIChatOptions): UseAIChatReturn {
  const [messages, setMessages] = useState<AIChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [error, setError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const reconnectAttemptRef = useRef(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const enabledRef = useRef(enabled);
  const onSiteUpdateRef = useRef(onSiteUpdate);
  const streamingContentRef = useRef("");

  // Keep refs in sync
  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);
  useEffect(() => {
    onSiteUpdateRef.current = onSiteUpdate;
  }, [onSiteUpdate]);

  const cleanup = useCallback(() => {
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    }
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.onclose = null; // prevent reconnect on intentional close
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
    setIsStreaming(false);
    setStreamingContent("");
    streamingContentRef.current = "";
  }, []);

  const connect = useCallback(() => {
    if (!enabledRef.current) return;

    const token = getAccessToken();
    if (!token) {
      setError("Inte inloggad");
      return;
    }

    cleanup();

    const url = getWsUrl(siteId, token);
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      setError(null);
      reconnectAttemptRef.current = 0;

      // Start heartbeat
      heartbeatRef.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: "ping" }));
        }
      }, HEARTBEAT_INTERVAL);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        switch (data.type) {
          case "history":
            setMessages(
              (data.messages ?? []).map(
                (m: { id: string; role: string; content: string; timestamp: string }) => ({
                  id: m.id,
                  role: m.role as "user" | "assistant",
                  content: m.content,
                  timestamp: m.timestamp,
                })
              )
            );
            break;

          case "chunk":
            setIsStreaming(true);
            streamingContentRef.current += data.content;
            setStreamingContent(streamingContentRef.current);
            break;

          case "message_complete":
            setIsStreaming(false);
            streamingContentRef.current = "";
            setStreamingContent("");
            setMessages((prev) => [
              ...prev,
              {
                id: data.message_id ?? crypto.randomUUID(),
                role: "assistant",
                content: data.content,
                timestamp: new Date().toISOString(),
              },
            ]);
            break;

          case "site_update":
            if (data.site_data) {
              onSiteUpdateRef.current(data.site_data);
            }
            break;

          case "error":
            setError(data.message ?? "Ett fel uppstod");
            setIsStreaming(false);
            streamingContentRef.current = "";
            setStreamingContent("");
            break;

          case "pong":
            // heartbeat ack — nothing to do
            break;
        }
      } catch {
        // ignore parse errors
      }
    };

    ws.onclose = (event) => {
      setIsConnected(false);
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
        heartbeatRef.current = null;
      }

      // Don't reconnect on auth/permission errors
      if (event.code >= 4001 && event.code <= 4004) {
        setError(event.reason || "Anslutning nekad");
        return;
      }

      // Auto-reconnect with exponential backoff
      if (enabledRef.current) {
        const attempt = reconnectAttemptRef.current;
        const delay = Math.min(
          RECONNECT_BASE_DELAY * 2 ** attempt,
          RECONNECT_MAX_DELAY
        );
        reconnectAttemptRef.current = attempt + 1;
        reconnectTimerRef.current = setTimeout(connect, delay);
      }
    };

    ws.onerror = () => {
      // onclose will fire after this — reconnect handled there
    };
  }, [siteId, cleanup]);

  // Connect on mount / enabled change
  useEffect(() => {
    if (enabled) {
      connect();
    } else {
      cleanup();
    }
    return cleanup;
  }, [enabled, connect, cleanup]);

  const sendMessage = useCallback(
    (content: string) => {
      const ws = wsRef.current;
      if (!ws || ws.readyState !== WebSocket.OPEN) return;

      const trimmed = content.trim();
      if (!trimmed) return;

      // Optimistically add user message to list
      const userMsg: AIChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: trimmed,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setError(null);

      ws.send(JSON.stringify({ type: "message", content: trimmed }));
    },
    []
  );

  const reconnect = useCallback(() => {
    reconnectAttemptRef.current = 0;
    connect();
  }, [connect]);

  return {
    messages,
    sendMessage,
    isConnected,
    isStreaming,
    streamingContent,
    error,
    reconnect,
  };
}
