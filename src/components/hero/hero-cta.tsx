"use client";

import { useRef, useState, type ClipboardEvent, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { Button, ButtonAnchor } from "@/components/ui/button";

export function HeroCta() {
  const router = useRouter();
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [errorHint, setErrorHint] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const code = digits.join("");

  const handleRedirect = (targetCode: string) => {
    const trimmed = targetCode.trim().toUpperCase();
    if (trimmed.length === 6) {
      router.push(`/display?code=${encodeURIComponent(trimmed)}`);
    }
  };

  const handleChange = (index: number, val: string) => {
    const char = val.replace(/[^a-zA-Z0-9]/g, "").slice(-1).toUpperCase();
    const next = [...digits];
    next[index] = char;
    setDigits(next);

    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    const fullCode = next.join("");
    if (fullCode.length === 6 && next.every((d) => d.length === 1)) {
      handleRedirect(fullCode);
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!digits[index] && index > 0) {
        e.preventDefault();
        const next = [...digits];
        next[index - 1] = "";
        setDigits(next);
        inputRefs.current[index - 1]?.focus();
      } else {
        const next = [...digits];
        next[index] = "";
        setDigits(next);
      }
      return;
    }

    if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
      return;
    }

    if (e.key === "ArrowRight" && index < 5) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();
      if (code.length === 6) {
        handleRedirect(code);
      } else {
        const firstEmpty = digits.findIndex((d) => !d);
        const idx = firstEmpty === -1 ? 0 : firstEmpty;
        inputRefs.current[idx]?.focus();
        setErrorHint("Enter 6-character code");
        setTimeout(() => setErrorHint(null), 3000);
      }
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const rawText = e.clipboardData.getData("text").trim();
    const urlMatch = rawText.match(/[?&]code=([a-zA-Z0-9]{6})/i);
    const clean = urlMatch
      ? urlMatch[1]
      : rawText.replace(/[^a-zA-Z0-9]/g, "").slice(0, 6);
    const upper = clean.toUpperCase();

    if (upper.length > 0) {
      const next = [...digits];
      for (let i = 0; i < 6; i++) {
        next[i] = upper[i] || "";
      }
      setDigits(next);

      if (upper.length === 6) {
        handleRedirect(upper);
      } else {
        inputRefs.current[Math.min(5, upper.length)]?.focus();
      }
    }
  };

  const handleJoinClick = () => {
    if (code.length === 6) {
      handleRedirect(code);
    } else {
      const firstEmpty = digits.findIndex((d) => !d);
      const idx = firstEmpty === -1 ? 0 : firstEmpty;
      inputRefs.current[idx]?.focus();
      setErrorHint("Enter 6-character code");
      setTimeout(() => setErrorHint(null), 3000);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="flex justify-center gap-3">
        <ButtonAnchor href="/control" variant="primary" size="md">
          Start Timer
        </ButtonAnchor>
        <Button
          variant="secondary"
          size="md"
          type="button"
          onClick={handleJoinClick}
        >
          Join Screen
        </Button>
      </div>

      <div className="mt-5 flex flex-col items-center">
        <div
          className="flex items-center gap-1.5 sm:gap-2"
          role="group"
          aria-label="Enter 6-character session code"
        >
          {digits.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => {
                inputRefs.current[idx] = el;
              }}
              type="text"
              inputMode="text"
              autoCapitalize="characters"
              autoComplete="off"
              spellCheck={false}
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              onPaste={handlePaste}
              onFocus={(e) => e.target.select()}
              aria-label={`Digit ${idx + 1} of 6`}
              className="size-8 sm:size-9 rounded-[0.4em] bg-card text-foreground border border-border ring-1 ring-foreground/10 text-center font-mono text-base font-semibold uppercase shadow-xs transition-all focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/25 selection:bg-transparent"
            />
          ))}
        </div>
        <p className="mt-2 text-xs font-mono text-muted-foreground">
          {errorHint ? (
            <span className="text-amber-500 font-medium">{errorHint}</span>
          ) : (
            "Enter 6-character code to join display"
          )}
        </p>
      </div>
    </div>
  );
}
