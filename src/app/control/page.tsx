"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { formatDuration } from "@/lib/time";
import { apiBase, wsBase, type ServerMessage, type TimerStatus } from "@/lib/wsClient";
import { QRCodeSVG } from "qrcode.react";
import { buildDisplayJoinUrl } from "@/lib/sessionLinks";
import { Button } from "@/components/ui/button";
import { MoonIcon, SunIcon } from "@/components/icons";

declare global {
  interface Window {
    __timer_ws?: WebSocket;
  }
}

export default function ControlPage() {
  const router = useRouter();
  const [theme, setTheme] = useState<"quartz" | "dark">("quartz");
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

  // Restore theme preference if available (defaults to light/quartz)
  useEffect(() => {
    try {
      const saved = localStorage.getItem("stagetimer_theme");
      if (saved === "dark" || saved === "quartz") {
        setTheme(saved);
      }
    } catch {}
  }, []);

  useEffect(() => {
    document.title = code ? `StageTimer — Controller (${code})` : "StageTimer — Controller";
  }, [code]);

  const toggleTheme = () => {
    const next = theme === "dark" ? "quartz" : "dark";
    setTheme(next);
    try {
      localStorage.setItem("stagetimer_theme", next);
    } catch {}
  };

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
    <div data-theme={theme} className="min-h-screen bg-background text-foreground font-sans antialiased p-6 transition-colors duration-200">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <span className="text-primary font-mono text-xs uppercase tracking-wider block mb-1">
              StageTimer Studio
            </span>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
              Controller
            </h1>
            <p className="text-muted-foreground text-sm font-medium mt-1">
              Session code:{" "}
              <span className="font-mono tracking-[0.25em] text-foreground font-semibold px-2.5 py-0.5 rounded-[0.5em] bg-foreground/5 border border-foreground/10 text-sm">
                {code}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-3">
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
            <Button
              variant="secondary"
              onClick={() => setQrOpen(true)}
              disabled={!code || sessionEnded}
            >
              Show QR
            </Button>
            <Button
              variant="destructive"
              onClick={() => window.__timer_ws?.send(JSON.stringify({ type: 'action', action: 'end' }))}
            >
              End
            </Button>
          </div>
        </header>

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300 p-4 text-sm font-medium">
            {error}
          </div>
        )}

        <section className="rounded-2xl p-6 bg-card text-card-foreground border border-border/40 shadow-xl shadow-black/10 ring-1 ring-foreground/10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="flex flex-col sm:flex-row items-center gap-8 w-full">
              <div className="flex flex-col items-center">
                <div className={`size-48 sm:size-56 md:size-72 lg:size-80 rounded-full border-4 sm:border-6 md:border-8 ${danger ? "border-red-500 shadow-[0_0_35px_rgba(239,68,68,0.35)]" : warn ? "border-amber-400 shadow-[0_0_35px_rgba(251,191,36,0.3)]" : "border-foreground/15"} flex items-center justify-center shrink-0 transition-colors duration-300`}>
                  <div className={`font-mono font-bold tabular-nums tracking-tighter ${danger ? "text-red-500" : warn ? "text-amber-600 dark:text-amber-400" : "text-foreground"} text-5xl sm:text-6xl md:text-7xl lg:text-8xl leading-none select-none`}>
                    {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
                  </div>
                </div>
                <div className="mt-3 text-muted-foreground text-xs uppercase tracking-wider font-mono font-medium">Remaining Time</div>
              </div>
              <div className="flex-1 min-w-0 text-center sm:text-left space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-foreground/5 border border-foreground/10 text-xs font-mono font-medium">
                  <span className={`size-2 rounded-full ${status === 'running' ? 'bg-emerald-400 animate-pulse' : status === 'paused' ? 'bg-amber-400' : 'bg-muted-foreground'}`} />
                  Status: <span className="uppercase text-foreground font-semibold">{status}</span>
                </div>
                <div className="text-muted-foreground text-sm font-medium">
                  Preset: <span className="text-foreground font-semibold font-mono">{formatDuration(presetMs)}</span>
                </div>
              </div>
            </div>
            <div className="text-xs font-mono text-muted-foreground bg-foreground/5 border border-foreground/10 px-3.5 py-2 rounded-[0.5em] self-start sm:self-center lg:self-start">
              Controllers: <span className="text-foreground font-semibold">{counts.controllers}</span> • Displays: <span className="text-foreground font-semibold">{counts.displays}</span>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl p-6 bg-card text-card-foreground border border-border/40 shadow-xl shadow-black/10 ring-1 ring-foreground/10">
            <h2 className="text-base font-semibold tracking-tight mb-4 text-foreground">Presets</h2>
            <div className="flex flex-wrap gap-2">
              {[5, 10, 15, 20].map((m) => {
                const ms = m * 60 * 1000;
                const isActive = presetMs === ms;
                return (
                  <Button
                    key={m}
                    variant={isActive ? "primary" : "secondary"}
                    onClick={() => {
                      setPresetMs(ms);
                      window.__timer_ws?.send(JSON.stringify({ type: 'action', action: 'setDuration', payload: { ms } }));
                    }}
                  >
                    {m}m
                  </Button>
                );
              })}
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <input
                type="number"
                min={0}
                className="w-20 h-9 rounded-[0.5em] bg-card border border-border px-3 font-mono text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring shadow-xs"
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
              <span className="text-muted-foreground text-sm font-medium mr-3">min</span>
              <input
                type="number"
                min={0}
                max={59}
                className="w-20 h-9 rounded-[0.5em] bg-card border border-border px-3 font-mono text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring shadow-xs"
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
              <span className="text-muted-foreground text-sm font-medium">sec</span>
            </div>
            <div className="mt-5 flex items-center gap-2.5">
              <input
                id="overtime"
                type="checkbox"
                checked={allowOvertime}
                className="size-4 rounded-[0.25rem] border-border bg-card accent-sky-500 cursor-pointer"
                onChange={(e) => {
                  setAllowOvertime(e.target.checked);
                  window.__timer_ws?.send(JSON.stringify({ type: 'action', action: 'setOvertime', payload: { value: e.target.checked } }));
                }}
              />
              <label htmlFor="overtime" className="text-foreground text-sm font-medium cursor-pointer">
                Allow overtime
              </label>
            </div>
          </div>

          <div className="rounded-2xl p-6 bg-card text-card-foreground border border-border/40 shadow-xl shadow-black/10 ring-1 ring-foreground/10 md:col-span-2">
            <h2 className="text-base font-semibold tracking-tight mb-4 text-foreground">Controls</h2>
            <div className="flex flex-wrap gap-3 mb-4">
              {status !== "running" && (
                <Button
                  variant="primary"
                  onClick={() => window.__timer_ws?.send(JSON.stringify({ type: 'action', action: 'start' }))}
                >
                  Start
                </Button>
              )}
              {status === "running" && (
                <Button
                  variant="secondary"
                  onClick={() => window.__timer_ws?.send(JSON.stringify({ type: 'action', action: 'pause' }))}
                >
                  Pause
                </Button>
              )}
              {status === "paused" && (
                <Button
                  variant="primary"
                  onClick={() => window.__timer_ws?.send(JSON.stringify({ type: 'action', action: 'resume' }))}
                >
                  Resume
                </Button>
              )}
              <Button
                variant="secondary"
                onClick={() => window.__timer_ws?.send(JSON.stringify({ type: 'action', action: 'reset', payload: { presetMs } }))}
              >
                Reset
              </Button>
              <Button
                variant="secondary"
                onClick={() => window.__timer_ws?.send(JSON.stringify({ type: 'action', action: 'adjust', payload: { deltaMs: 30_000 } }))}
              >
                +30s
              </Button>
              <Button
                variant="secondary"
                onClick={() => window.__timer_ws?.send(JSON.stringify({ type: 'action', action: 'adjust', payload: { deltaMs: -30_000 } }))}
              >
                -30s
              </Button>
            </div>
          </div>
        </section>
      </div>

      {sessionEnded && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-full sm:w-auto max-w-sm rounded-2xl border border-foreground/10 bg-card text-card-foreground p-6 shadow-2xl ring-1 ring-foreground/10">
            <div className="text-lg font-semibold tracking-tight text-foreground mb-1">Session ended</div>
            <div className="text-muted-foreground text-sm font-medium mb-5">Would you like to start a new session or go back to home?</div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="primary"
                onClick={() => { setError(null); setSessionEnded(false); setSessionKey((k) => k + 1); }}
              >
                Start new session
              </Button>
              <Button
                variant="secondary"
                onClick={() => { router.push('/'); }}
              >
                Home
              </Button>
            </div>
          </div>
        </div>
      )}

      {qrOpen && (
        <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setQrOpen(false)} />
          <div className="relative w-full max-w-sm rounded-2xl border border-foreground/10 bg-card text-card-foreground p-6 shadow-2xl ring-1 ring-foreground/10">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold tracking-tight text-foreground">Join Display</h2>
              <Button variant="secondary" onClick={() => setQrOpen(false)}>Close</Button>
            </div>
            <p className="text-muted-foreground text-sm font-medium mb-4">Scan this QR from the display device to join the session instantly.</p>
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
                <div className="text-black/70 text-sm font-medium">Preparing QR...</div>
              )}
            </div>
            <div className="text-xs uppercase tracking-wider font-mono text-muted-foreground font-medium mb-1.5">Link</div>
            <a
              href={displayJoinUrl || "#"}
              target="_blank"
              rel="noreferrer"
              className="block text-sm text-sky-600 dark:text-sky-400 break-all underline-offset-2 hover:underline font-mono"
            >
              {displayJoinUrl || "Preparing link..."}
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
