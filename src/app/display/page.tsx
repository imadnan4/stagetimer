"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { formatDuration } from "@/lib/time";
import { wsBase, type ServerMessage } from "@/lib/wsClient";
import { Button } from "@/components/ui/button";
import { MoonIcon, SunIcon } from "@/components/icons";

function DisplayPageContent() {
  const params = useSearchParams();
  const router = useRouter();
  const rawCode = params.get("code");
  const joinToken = params.get("join");
  const code = rawCode ? rawCode.toUpperCase() : null;
  const [theme, setTheme] = useState<"quartz" | "dark">("quartz");

  // Restore theme preference (defaults to light/quartz)
  useEffect(() => {
    try {
      const saved = localStorage.getItem("stagetimer_theme");
      if (saved === "dark" || saved === "quartz") {
        setTheme(saved);
      }
    } catch {}
  }, []);

  useEffect(() => {
    document.title = code ? `StageTimer — Display (${code})` : "StageTimer — Display";
  }, [code]);

  const toggleTheme = () => {
    const next = theme === "dark" ? "quartz" : "dark";
    setTheme(next);
    try {
      localStorage.setItem("stagetimer_theme", next);
    } catch {}
  };

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
    <div data-theme={theme} className="min-h-screen bg-background text-foreground flex items-center justify-center p-6 font-sans antialiased relative transition-colors duration-200">
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10">
        <Button
          variant="secondary"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
          title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
        >
          {theme === "dark" ? (
            <>
              <SunIcon className="size-4" />
              <span className="hidden sm:inline">Light</span>
            </>
          ) : (
            <>
              <MoonIcon className="size-4" />
              <span className="hidden sm:inline">Dark</span>
            </>
          )}
        </Button>
      </div>

      {code && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 text-muted-foreground/80 font-mono text-sm tracking-[0.25em] px-3.5 py-1 rounded-[0.5em] bg-foreground/5 border border-foreground/10 font-semibold select-none">
          {code}
        </div>
      )}
      <div className="text-center">
        {!code && (
          <div className="text-muted-foreground text-sm font-medium">Invalid or missing session code. Redirecting…</div>
        )}
        {error && (
          <div className="mb-6 text-red-600 dark:text-red-400 text-sm font-medium flex items-center justify-center gap-2">
            <span>{error}.</span>
            <Button variant="secondary" onClick={() => router.push('/')}>
              Go back
            </Button>
          </div>
        )}
        <div className={`mx-auto w-[60vmin] h-[60vmin] rounded-full border-8 ${danger ? "border-red-500 shadow-[0_0_60px_rgba(239,68,68,0.35)]" : warn ? "border-amber-400 shadow-[0_0_60px_rgba(251,191,36,0.3)]" : "border-foreground/15"} flex items-center justify-center mb-6 transition-colors duration-300`}>
          <div className={`text-[16vmin] font-mono font-bold tabular-nums tracking-tighter ${danger ? "text-red-500" : warn ? "text-amber-600 dark:text-amber-400" : "text-foreground"} leading-none select-none`}>
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </div>
        </div>
        <div className="text-muted-foreground font-mono text-sm uppercase tracking-wider font-medium">
          {status === 'disconnected' ? 'Connecting…' : `Remaining: ${formatDuration(safeRemaining)}`}
        </div>
      </div>
    </div>
  );
}

export default function DisplayPage() {
  return (
    <Suspense fallback={<div data-theme="quartz" className="min-h-screen bg-background text-foreground flex items-center justify-center p-6 font-sans antialiased">Loading display...</div>}>
      <DisplayPageContent />
    </Suspense>
  );
}
