"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { formatDuration } from "@/lib/time";
import { apiBase, wsBase, type ServerMessage, type TimerStatus } from "@/lib/wsClient";
import { QRCodeSVG } from "qrcode.react";
import { buildDisplayJoinUrl } from "@/lib/sessionLinks";

declare global {
  interface Window {
    __timer_ws?: WebSocket;
  }
}

export default function ControlPage() {
  const router = useRouter();
  const [presetMs, setPresetMs] = useState(5 * 60 * 1000);
  const [allowOvertime, setAllowOvertime] = useState(false);
  const [status, setStatus] = useState<TimerStatus>("idle");
  const [code, setCode] = useState<string | null>(null);
  const [counts, setCounts] = useState({ controllers: 1, displays: 0 });
  const [error, setError] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [pauseAccumulated, setPauseAccumulated] = useState(0);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [clockOffsetMs, setClockOffsetMs] = useState(0); // serverNow - clientNow
  const [sessionEnded, setSessionEnded] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [displayJoinUrl, setDisplayJoinUrl] = useState("");
  const [displayJoinToken, setDisplayJoinToken] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const [sessionKey, setSessionKey] = useState(0);

  // Create session on first render (or when sessionKey is bumped for a new one)
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(`${apiBase()}/api/session`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ presetMs, allowOvertime })
        });
        const json = await res.json();
        if (cancelled) return;
        setCode(json.code);
        setDisplayJoinToken(typeof json.displayToken === 'string' ? json.displayToken : null);
        // open WS and join as controller
        const ws = new WebSocket(wsBase());
        ws.onopen = () => {
          ws.send(JSON.stringify({ type: 'join', role: 'controller', code: json.code, token: json.controllerToken }));
        };
        ws.onmessage = (ev) => {
          const msg: ServerMessage = JSON.parse(ev.data);
          if (msg.type === 'error') {
            setError(msg.message);
            setSessionEnded(true);
            setStatus('idle');
            setStartTime(null);
            setPauseAccumulated(0);
            setRemaining(presetMs);
            setCode(null);
            setQrOpen(false);
            setDisplayJoinUrl("");
            setDisplayJoinToken(null);
            try { ws.close(); } catch {}
            return;
          }
          if (msg.type === 'state') {
            // compute server/client clock offset using serverNow timestamp
            const clientNow = Date.now();
            setClockOffsetMs(msg.serverNow - clientNow);
            setStatus(msg.status);
            setPresetMs(msg.presetDurationMs);
            setAllowOvertime(msg.allowOvertime);
            setStartTime(msg.startTime);
            setPauseAccumulated(msg.pauseAccumulatedMs);
            // recompute remaining on each authoritative state
            if (msg.startTime != null) {
              const nowServer = clientNow + (msg.serverNow - clientNow);
              const elapsed = nowServer - msg.startTime - msg.pauseAccumulatedMs;
              setRemaining(msg.presetDurationMs - elapsed);
            } else {
              setRemaining(msg.presetDurationMs);
            }
          } else if (msg.type === 'presence') {
            setCounts(msg.counts);
          }
        };
        // attach action helpers
        window.__timer_ws = ws;
        wsRef.current = ws;
      } catch (e) {
        console.error('Failed to create session', e);
      }
    })();

    return () => {
      cancelled = true;
      try {
        wsRef.current?.close();
      } catch {}
      wsRef.current = null;
      delete window.__timer_ws;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionKey]);

  // Animate remaining time like the display view
  const raf = useRef<number | null>(null);
  const last = useRef<number | null>(null);
  useEffect(() => {
    const tick = (t: number) => {
      if (last.current == null) last.current = t;
      last.current = t;
      if (status === 'running' && startTime != null) {
        setRemaining(() => {
          const nowServer = Date.now() + clockOffsetMs;
          const elapsed = nowServer - startTime - pauseAccumulated;
          return presetMs - elapsed;
        });
      }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [status, startTime, pauseAccumulated, presetMs, clockOffsetMs]);

  useEffect(() => {
    if (!code) {
      setDisplayJoinUrl("");
      return;
    }
    const origin = typeof window !== "undefined" ? window.location.origin : undefined;
    setDisplayJoinUrl(buildDisplayJoinUrl(code, origin, displayJoinToken ?? undefined));
  }, [code, displayJoinToken]);

  const safeRemaining = Math.max(0, remaining ?? presetMs);
  const minutes = Math.floor(safeRemaining / 60000);
  const seconds = Math.floor((safeRemaining % 60000) / 1000);
  const danger = safeRemaining <= 10_000; // last 10s
  const warn = !danger && safeRemaining <= 60_000; // last 60s

  return (
    <div className="min-h-screen bg-[#0E0F12] text-white p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">Controller</h1>
            <p className="text-white/60">Session code: <span className="font-mono tracking-[0.2em]">{code}</span></p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <button
              onClick={() => setQrOpen(true)}
              disabled={!code || sessionEnded}
              className="rounded-xl bg-white/10 border border-white/10 px-4 h-11 w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Show QR
            </button>
            <button onClick={() => window.__timer_ws?.send(JSON.stringify({ type: 'action', action: 'end' }))} className="rounded-xl bg-red-500/90 hover:bg-red-500 px-4 h-11 w-full sm:w-auto">End</button>
          </div>
        </header>

        {error && (
          <div className="rounded-xl border border-red-500/40 bg-red-500/10 text-red-300 p-3">
            {error}
          </div>
        )}

        <section className="rounded-2xl p-5 bg-white/5 border border-white/10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-6 w-full">
              <div className="flex flex-col items-center">
                <div className={`size-40 sm:size-56 md:size-72 lg:size-80 rounded-full border-4 sm:border-6 md:border-8 ${danger ? "border-red-500" : warn ? "border-amber-400" : "border-white/20"} flex items-center justify-center shrink-0`}>
                  <div className={`font-bold tabular-nums ${danger ? "text-red-500" : warn ? "text-amber-400" : "text-white"} text-4xl sm:text-5xl md:text-7xl lg:text-8xl leading-none select-none`}>
                    {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
                  </div>
                </div>
                <div className="mt-2 text-white/60 text-sm">Remaining</div>
              </div>
              <div className="flex-1 min-w-0 text-center sm:text-left">
                <div className="text-white/60 mt-2">Status: {status}</div>
                <div className="text-white/60 mt-2">Preset: {formatDuration(presetMs)}</div>
              </div>
            </div>
            <div className="text-white/70 self-start">Controllers: {counts.controllers} • Displays: {counts.displays}</div>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl p-5 bg-white/5 border border-white/10">
            <h2 className="font-medium mb-3">Presets</h2>
            <div className="flex flex-wrap gap-2">
              {[5, 10, 15, 20].map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    const ms = m * 60 * 1000;
                    setPresetMs(ms);
                    window.__timer_ws?.send(JSON.stringify({ type: 'action', action: 'setDuration', payload: { ms } }));
                  }}
                  className={`h-10 px-3 rounded-lg border ${presetMs === m * 60 * 1000 ? "bg-white text-black border-transparent" : "bg-white/5 border-white/10"}`}
                >
                  {m}m
                </button>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <input
                type="number"
                min={0}
                className="w-20 h-10 rounded-lg bg-white/10 border border-white/10 px-2"
                value={Math.floor(presetMs / 60000)}
                onChange={(e) => {
                  const minutesVal = Number(e.target.value || 0);
                  const secondsVal = Math.floor((presetMs % 60000) / 1000);
                  const clampedSeconds = Math.max(0, Math.min(59, secondsVal));
                  const ms = minutesVal * 60 * 1000 + clampedSeconds * 1000;
                  setPresetMs(ms);
                  window.__timer_ws?.send(JSON.stringify({ type: 'action', action: 'setDuration', payload: { ms } }));
                }}
              />
              <span className="text-white/60 mr-3">minutes</span>
              <input
                type="number"
                min={0}
                max={59}
                className="w-20 h-10 rounded-lg bg-white/10 border border-white/10 px-2"
                value={Math.floor((presetMs % 60000) / 1000)}
                onChange={(e) => {
                  const secondsRaw = Number(e.target.value || 0);
                  const secondsVal = isNaN(secondsRaw) ? 0 : secondsRaw;
                  const clampedSeconds = Math.max(0, Math.min(59, secondsVal));
                  const minutesVal = Math.floor(presetMs / 60000);
                  const ms = minutesVal * 60 * 1000 + clampedSeconds * 1000;
                  setPresetMs(ms);
                  window.__timer_ws?.send(JSON.stringify({ type: 'action', action: 'setDuration', payload: { ms } }));
                }}
              />
              <span className="text-white/60">seconds</span>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <input id="overtime" type="checkbox" checked={allowOvertime} onChange={(e) => {
                setAllowOvertime(e.target.checked);
                window.__timer_ws?.send(JSON.stringify({ type: 'action', action: 'setOvertime', payload: { value: e.target.checked } }));
              }} />
              <label htmlFor="overtime" className="text-white/80">Allow overtime</label>
            </div>
          </div>

          <div className="rounded-2xl p-5 bg-white/5 border border-white/10 md:col-span-2">
            <h2 className="font-medium mb-4">Controls</h2>
            <div className="flex flex-wrap gap-3 mb-4">
              {status !== "running" && (
                <button onClick={() => window.__timer_ws?.send(JSON.stringify({ type: 'action', action: 'start' }))} className="h-11 px-4 rounded-xl bg-[#3B82F6] hover:bg-[#2563EB]">Start</button>
              )}
              {status === "running" && (
                <button onClick={() => window.__timer_ws?.send(JSON.stringify({ type: 'action', action: 'pause' }))} className="h-11 px-4 rounded-xl bg-white/10 border border-white/10">Pause</button>
              )}
              {status === "paused" && (
                <button onClick={() => window.__timer_ws?.send(JSON.stringify({ type: 'action', action: 'resume' }))} className="h-11 px-4 rounded-xl bg-white/10 border border-white/10">Resume</button>
              )}
              <button onClick={() => window.__timer_ws?.send(JSON.stringify({ type: 'action', action: 'reset', payload: { presetMs } }))} className="h-11 px-4 rounded-xl bg-white/10 border border-white/10">Reset</button>
              <button onClick={() => window.__timer_ws?.send(JSON.stringify({ type: 'action', action: 'adjust', payload: { deltaMs: 30_000 } }))} className="h-11 px-4 rounded-xl bg-white/10 border border-white/10">+30s</button>
              <button onClick={() => window.__timer_ws?.send(JSON.stringify({ type: 'action', action: 'adjust', payload: { deltaMs: -30_000 } }))} className="h-11 px-4 rounded-xl bg-white/10 border border-white/10">-30s</button>
            </div>
          </div>
        </section>
      </div>
    {sessionEnded && (
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative w-full sm:w-auto max-w-sm rounded-2xl border border-white/10 bg-[#15171C] text-white p-4 shadow-xl">
          <div className="text-lg font-semibold mb-1">Session ended</div>
          <div className="text-white/70 mb-4">Would you like to start a new session or go back to home?</div>
          <div className="flex flex-col sm:flex-row gap-2">
            <button onClick={() => { setError(null); setSessionEnded(false); setSessionKey((k) => k + 1); }} className="h-10 px-4 rounded-xl bg-white text-black">Start new session</button>
            <button onClick={() => { router.push('/'); }} className="h-10 px-4 rounded-xl bg-white/10 border border-white/10">Home</button>
          </div>
        </div>
      </div>
    )}
    {qrOpen && (
      <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/60" onClick={() => setQrOpen(false)} />
        <div className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-[#15171C] p-5 shadow-2xl">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Join Display</h2>
            <button onClick={() => setQrOpen(false)} className="h-9 px-3 rounded-lg bg-white/10 border border-white/10">Close</button>
          </div>
          <p className="text-white/70 text-sm mb-4">Scan this QR from the display device to join the session instantly.</p>
          <div className="rounded-xl bg-white p-4 flex items-center justify-center mb-4">
            {displayJoinUrl ? (
              <QRCodeSVG
                value={displayJoinUrl}
                size={512}
                level="M"
                marginSize={4}
                title="Session join QR code"
                style={{ width: "100%", height: "auto", maxWidth: 260 }}
              />
            ) : (
              <div className="text-black/70 text-sm">Preparing QR...</div>
            )}
          </div>
          <div className="text-xs text-white/60 mb-2">Link</div>
          <a
            href={displayJoinUrl || "#"}
            target="_blank"
            rel="noreferrer"
            className="block text-sm text-blue-300 break-all underline-offset-2 hover:underline"
          >
            {displayJoinUrl || "Preparing link..."}
          </a>
        </div>
      </div>
    )}
    </div>
  );
}
