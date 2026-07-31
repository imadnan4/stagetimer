"use client";

import { useEffect, useState } from "react";

declare global {
  interface Window {
    createLemonSqueezy?: () => void;
  }
}

const CHECKOUT_URL = process.env.NEXT_PUBLIC_LEMON_SQUEEZY_CHECKOUT_URL || "";

export default function SupportButton() {
  const [ready, setReady] = useState(!CHECKOUT_URL);

  useEffect(() => {
    if (!CHECKOUT_URL) return;
    const script = document.createElement("script");
    script.src = "https://assets.lemonsqueezy.com/lemon.js";
    script.onload = () => setReady(true);
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // lemon.js attaches click listeners to .lemonsqueezy-button anchors; run
  // after the button is mounted so the overlay intercepts clicks.
  useEffect(() => {
    if (!ready) return;
    try {
      window.createLemonSqueezy?.();
    } catch {}
  }, [ready]);

  if (!ready || !CHECKOUT_URL) return null;

  return (
    <a
      href={CHECKOUT_URL}
      className="lemonsqueezy-button inline-flex items-center justify-center rounded-xl bg-white/10 border border-white/10 px-5 h-11 font-medium hover:bg-white/15 transition-colors"
    >
      Support the Creator
    </a>
  );
}
