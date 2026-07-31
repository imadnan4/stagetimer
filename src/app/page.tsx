"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { BrowserQRCodeReader, type IScannerControls } from "@zxing/browser";
import { buildDisplayJoinPathWithToken, parseScannedSession } from "@/lib/sessionLinks";
import SupportButton from "@/components/SupportButton";

export default function Home() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [scanStarting, setScanStarting] = useState(false);
  const previewRef = useRef<HTMLVideoElement | null>(null);
  const scannerControlsRef = useRef<IScannerControls | null>(null);
  const resolvedScanRef = useRef(false);

  const onJoin = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;
    router.push(buildDisplayJoinPathWithToken(trimmed));
  };

  useEffect(() => {
    if (!scannerOpen) {
      setScanStarting(false);
      setScanError(null);
      resolvedScanRef.current = false;
      scannerControlsRef.current?.stop();
      scannerControlsRef.current = null;
      if (previewRef.current?.srcObject instanceof MediaStream) {
        for (const track of previewRef.current.srcObject.getTracks()) {
          track.stop();
        }
        previewRef.current.srcObject = null;
      }
      return;
    }

    let cancelled = false;
    setScanError(null);
    setScanStarting(true);

    const reader = new BrowserQRCodeReader();

    (async () => {
      if (!previewRef.current) {
        setScanError("Scanner preview could not start. Try closing and opening scanner again.");
        setScanStarting(false);
        return;
      }
      try {
        const controls = await reader.decodeFromVideoDevice(undefined, previewRef.current, (result) => {
          if (!result || resolvedScanRef.current) return;

          const parsed = parseScannedSession(result.getText());
          if (!parsed) {
            setScanError("This QR code does not contain a valid session link.");
            return;
          }

          resolvedScanRef.current = true;
          controls.stop();
          setCode(parsed.code);
          setScannerOpen(false);
          router.push(buildDisplayJoinPathWithToken(parsed.code, parsed.joinToken));
        });

        if (cancelled) {
          controls.stop();
          return;
        }

        scannerControlsRef.current = controls;
      } catch {
        setScanError("Could not access camera. Allow camera permission, use HTTPS, or enter code manually.");
      } finally {
        if (!cancelled) {
          setScanStarting(false);
        }
      }
    })();

    return () => {
      cancelled = true;
      scannerControlsRef.current?.stop();
      scannerControlsRef.current = null;
      if (previewRef.current?.srcObject instanceof MediaStream) {
        for (const track of previewRef.current.srcObject.getTracks()) {
          track.stop();
        }
        previewRef.current.srcObject = null;
      }
    };
  }, [scannerOpen, router]);

  return (
    <div className="min-h-screen bg-[#0E0F12] text-white flex flex-col items-center justify-center p-4 sm:p-6">
      <main className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div className="rounded-2xl p-5 sm:p-8 bg-white/5 backdrop-blur border border-white/10 shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center gap-3 mb-2">
            <img
              src="/icon.svg"
              alt="Stage Timer logo"
              className="size-8 shrink-0"
            />
            <h1 className="text-xl sm:text-2xl font-semibold">Create Control</h1>
          </div>
          <p className="text-white/70 text-sm sm:text-base mb-5 sm:mb-6">Start a new session to control the presentation timer remotely.</p>
          <button
            onClick={() => router.push("/control")}
            className="inline-flex items-center justify-center rounded-xl bg-[#3B82F6] hover:bg-[#2563EB] transition-colors h-12 w-full sm:w-auto px-6 font-medium"
          >
            Create Session
          </button>
        </div>

        <div className="rounded-2xl p-5 sm:p-8 bg-white/5 backdrop-blur border border-white/10 shadow-lg hover:shadow-xl transition-shadow">
          <h2 className="text-xl sm:text-2xl font-semibold mb-2">Join Display</h2>
          <p className="text-white/70 text-sm sm:text-base mb-5 sm:mb-6">Enter the session code from the controller to connect your display.</p>
          <form onSubmit={onJoin} className="flex flex-col sm:flex-row gap-3">
            <input
              aria-label="Session code"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\s/g, ""))}
              placeholder="ABC123"
              className="w-full sm:flex-1 h-12 rounded-xl bg-white/10 border border-white/10 px-4 placeholder-white/40 outline-none focus:border-white/30 tracking-[0.2em] uppercase min-w-0"
            />
            <button
              type="submit"
              className="h-12 px-6 rounded-xl bg-white text-black font-medium hover:bg-white/90 transition-colors w-full sm:w-auto"
            >
              Join
            </button>
          </form>
          <button
            type="button"
            onClick={() => setScannerOpen(true)}
            className="mt-3 h-12 px-6 rounded-xl bg-white/10 border border-white/10 font-medium hover:bg-white/15 transition-colors w-full sm:w-auto"
          >
            Scan QR
          </button>
        </div>
      </main>

      {scannerOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setScannerOpen(false)} />
          <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#15171C] p-4 sm:p-5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">Scan Session QR</h3>
              <button
                type="button"
                onClick={() => setScannerOpen(false)}
                className="h-9 px-3 rounded-lg bg-white/10 border border-white/10"
              >
                Close
              </button>
            </div>
            <p className="text-white/70 text-sm mb-3">Point your camera at the QR code shown on the controller.</p>
            <div className="rounded-xl overflow-hidden border border-white/10 bg-black aspect-video flex items-center justify-center">
              <video ref={previewRef} className="w-full h-full object-cover" muted playsInline />
            </div>
            {scanStarting && <div className="text-white/60 text-sm mt-3">Starting camera...</div>}
            {scanError && <div className="text-red-300 text-sm mt-3">{scanError}</div>}
            <div className="text-white/50 text-xs mt-3">If camera fails, enter the session code manually.</div>
          </div>
        </div>
      )}

      <footer className="w-full flex items-center justify-center pt-6 pb-2">
        <SupportButton />
      </footer>
    </div>
  );
}
