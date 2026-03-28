export type Role = 'controller' | 'display';
export type TimerStatus = 'idle' | 'running' | 'paused' | 'completed' | 'overtime';

export type ClientMessage =
  | { type: 'join'; role: Role; code: string; token?: string }
  | { type: 'action'; action: string; payload?: unknown };

export type ServerMessage =
  | { type: 'joined'; role: Role; code: string; counts: { controllers: number; displays: number } }
  | { type: 'state'; code: string; status: TimerStatus; presetDurationMs: number; startTime: number | null; pauseAccumulatedMs: number; allowOvertime: boolean; serverNow: number }
  | { type: 'presence'; counts: { controllers: number; displays: number } }
  | { type: 'error'; message: string };

export function connectWS(url: string, onMessage: (m: ServerMessage) => void) {
  const ws = new WebSocket(url);
  ws.onmessage = (ev) => {
    try {
      onMessage(JSON.parse(ev.data));
    } catch {}
  };
  return ws;
}

export function apiBase(): string {
  // Prefer explicit env, otherwise infer from current location
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  if (typeof window !== 'undefined' && window.location) {
    const host = window.location.hostname;
    // Assume API runs on 8787 on same host
    const proto = window.location.protocol === 'https:' ? 'https' : 'http';
    return `${proto}://${host}:8787`;
  }
  return 'http://localhost:8787';
}

export function wsBase(): string {
  if (process.env.NEXT_PUBLIC_WS_URL) return process.env.NEXT_PUBLIC_WS_URL;
  if (typeof window !== 'undefined' && window.location) {
    const host = window.location.hostname;
    const proto = window.location.protocol === 'https:' ? 'wss' : 'ws';
    return `${proto}://${host}:8787/ws`;
  }
  return 'ws://localhost:8787/ws';
}
