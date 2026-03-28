"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Home() {
  const router = useRouter();
  const [code, setCode] = useState("");

  const onJoin = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;
    router.push(`/display?code=${encodeURIComponent(trimmed)}`);
  };

  return (
    <div className="min-h-screen bg-[#0E0F12] text-white flex items-center justify-center p-6">
      <main className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl p-8 bg-white/5 backdrop-blur border border-white/10 shadow-lg hover:shadow-xl transition-shadow">
          <h1 className="text-2xl font-semibold mb-2">Create Control</h1>
          <p className="text-white/70 mb-6">Start a new session to control the presentation timer remotely.</p>
          <button
            onClick={() => router.push("/control")}
            className="inline-flex items-center justify-center rounded-xl bg-[#3B82F6] hover:bg-[#2563EB] transition-colors h-12 px-6 font-medium"
          >
            Create Session
          </button>
        </div>

        <div className="rounded-2xl p-8 bg-white/5 backdrop-blur border border-white/10 shadow-lg hover:shadow-xl transition-shadow">
          <h2 className="text-2xl font-semibold mb-2">Join Display</h2>
          <p className="text-white/70 mb-6">Enter the session code from the controller to connect your display.</p>
          <form onSubmit={onJoin} className="flex gap-3">
            <input
              aria-label="Session code"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\s/g, ""))}
              placeholder="ABC123"
              className="flex-1 h-12 rounded-xl bg-white/10 border border-white/10 px-4 placeholder-white/40 outline-none focus:border-white/30 tracking-[0.2em] uppercase"
            />
            <button
              type="submit"
              className="h-12 px-6 rounded-xl bg-white text-black font-medium hover:bg-white/90 transition-colors"
            >
              Join
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
