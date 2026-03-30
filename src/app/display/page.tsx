"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { formatDuration } from "@/lib/time";
import { wsBase, type ServerMessage } from "@/lib/wsClient";

function DisplayPageContent() {
  const params = useSearchParams();
  const router = useRouter();
  const rawCode = params.get("code");
  const joinToken = params.get("join");
  const code = rawCode ? rawCode.toUpperCase() : null;

  const [status, setStatus] = useState<"idle" | "running" | "paused" | "completed" | "overtime" | "disconnected">("disconnected");
  const [presetMs, setPresetMs] = useState(5 * 60 * 1000);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [pauseAccumulated, setPauseAccumulated] = useState(0);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [clockOffsetMs, setClockOffsetMs] = useState(0); // serverNow - clientNow

  const raf = useRef<number | null>(null);
  const last = useRef<number | null>(null);

  // Enforce having a code
  useEffect(() => {
    if (!code) router.replace("/");
  }, [code, router]);

  // Connect to WS and render based on authoritative state
  useEffect(() => {
    if (!code) return;
    const ws = new WebSocket(wsBase());
    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'join', role: 'display', code, ...(joinToken ? { token: joinToken } : {}) }));
    };
    ws.onmessage = (ev) => {
      const msg: ServerMessage = JSON.parse(ev.data);
      if (msg.type === 'error') {
        setError(msg.message);
        setStatus('disconnected');
        return;
      }
      if (msg.type === 'state') {
        const clientNow = Date.now();
        setClockOffsetMs(msg.serverNow - clientNow);
        setStatus(msg.status);
        setPresetMs(msg.presetDurationMs);
        setStartTime(msg.startTime);
        setPauseAccumulated(msg.pauseAccumulatedMs);
        if (msg.startTime != null) {
          const nowServer = clientNow + (msg.serverNow - clientNow);
          const elapsed = nowServer - msg.startTime - msg.pauseAccumulatedMs;
          setRemaining(msg.presetDurationMs - elapsed);
        } else {
          setRemaining(msg.presetDurationMs);
        }
      }
    };
    ws.onclose = () => setStatus('disconnected');
    return () => ws.close();
  }, [code, joinToken]);

  // Animate only when running
  useEffect(() => {
    const tick = (t: number) => {
      if (last.current == null) last.current = t;
      last.current = t;
      if (status === 'running' && startTime != null) {
        setRemaining(() => {
          const nowMs = Date.now() + clockOffsetMs;
          const elapsed = nowMs - startTime - pauseAccumulated;
          const rem = presetMs - elapsed;
          return rem;
        });
      }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [status, startTime, pauseAccumulated, presetMs, clockOffsetMs]);

  const safeRemaining = Math.max(0, remaining ?? presetMs);
  const minutes = Math.floor(safeRemaining / 60000);
  const seconds = Math.floor((safeRemaining % 60000) / 1000);
  const danger = safeRemaining <= 10_000; // last 10s
  const warn = !danger && safeRemaining <= 60_000; // last 60s

  return (
    <div className="min-h-screen bg-[#0E0F12] text-white flex items-center justify-center p-6">
      {code && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/50 font-mono text-sm tracking-[0.2em]">{code}</div>
      )}
      <div className="text-center">
        {!code && (
          <div className="text-white/70">Invalid or missing session code. Redirecting…</div>
        )}
        {error && (
          <div className="mb-6 text-red-400">{error}. <button onClick={() => router.push('/')} className="underline">Go back</button></div>
        )}
        <div className={`mx-auto w-[60vmin] h-[60vmin] rounded-full border-8 ${danger ? "border-red-500" : warn ? "border-amber-400" : "border-white/20"} flex items-center justify-center mb-6` }>
          <div className={`text-[16vmin] font-bold tabular-nums ${danger ? "text-red-500" : warn ? "text-amber-400" : "text-white"}`}>
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </div>
        </div>
        <div className="text-white/60">
          {status === 'disconnected' ? 'Connecting…' : `Remaining: ${formatDuration(safeRemaining)}`}
        </div>
      </div>
    </div>
  );
}

export default function DisplayPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0E0F12] text-white flex items-center justify-center p-6">Loading display...</div>}>
      <DisplayPageContent />
    </Suspense>
  );
}
