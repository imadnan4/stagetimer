"use client";

import { useEffect, useState, type FormEvent } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

type Mode = "signin" | "signup";

interface SignInDialogProps {
  open: boolean;
  onClose: () => void;
  onSignedIn: () => void | Promise<void>;
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M21.35 11.1H12v3.2h5.35c-.23 1.4-1.66 4.1-5.35 4.1a5.9 5.9 0 0 1 0-11.8c1.68 0 2.8.72 3.44 1.34l2.34-2.26A9.3 9.3 0 0 0 12 2.4a9.6 9.6 0 1 0 0 19.2c5.54 0 9.2-3.9 9.2-9.38 0-.63-.07-1.1-.15-1.12Z"
      />
    </svg>
  );
}

export function SignInDialog({ open, onClose, onSignedIn }: SignInDialogProps) {
  const [mode, setMode] = useState<Mode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) {
      setError(null);
      setBusy(false);
    }
  }, [open, mode]);

  if (!open) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res =
        mode === "signin"
          ? await authClient.signIn.email({ email, password })
          : await authClient.signUp.email({
              email,
              password,
              name: name.trim() || email.split("@")[0],
            });
      if (res.error) {
        setError(res.error.message || "Authentication failed. Please try again.");
        return;
      }
      await onSignedIn();
      onClose();
    } catch {
      setError("Authentication failed. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const handleGoogle = async () => {
    setBusy(true);
    setError(null);
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: window.location.href,
      });
    } catch {
      setError("Google sign-in failed. Please try again.");
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={mode === "signin" ? "Sign in" : "Create account"}
        className="relative w-full max-w-sm rounded-2xl border border-foreground/10 bg-card text-card-foreground p-6 shadow-2xl ring-1 ring-foreground/10"
      >
        <div className="flex items-start justify-between gap-4 mb-1">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            {mode === "signin" ? "Welcome back" : "Create your account"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-muted-foreground hover:text-foreground text-sm font-medium"
          >
            Close
          </button>
        </div>
        <p className="text-muted-foreground text-sm font-medium mb-5">
          {mode === "signin"
            ? "Sign in to unlock unlimited rooms."
            : "It only takes a moment. Email or Google both work."}
        </p>

        <Button variant="secondary" className="w-full" onClick={handleGoogle} disabled={busy}>
          <GoogleIcon />
          Continue with Google
        </Button>

        <div className="flex items-center gap-3 my-5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
          <div className="flex-1 h-px bg-foreground/10" />
          or
          <div className="flex-1 h-px bg-foreground/10" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === "signup" && (
            <label className="block">
              <span className="text-xs font-medium text-muted-foreground">Name</span>
              <input
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full h-9 rounded-[0.5em] bg-card border border-border px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </label>
          )}
          <label className="block">
            <span className="text-xs font-medium text-muted-foreground">Email</span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full h-9 rounded-[0.5em] bg-card border border-border px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-muted-foreground">Password</span>
            <input
              type="password"
              required
              minLength={8}
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full h-9 rounded-[0.5em] bg-card border border-border px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </label>

          {error && (
            <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>
          )}

          <Button type="submit" variant="primary" className="w-full" disabled={busy}>
            {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
          </Button>
        </form>

        <p className="text-center text-xs text-muted-foreground mt-5">
          {mode === "signin" ? "New to StageTimer?" : "Already have an account?"}{" "}
          <button
            type="button"
            className="text-sky-600 dark:text-sky-400 font-medium underline-offset-2 hover:underline"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          >
            {mode === "signin" ? "Create an account" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}
