"use client";

import { Button } from "@/components/ui/button";

export type PaywallReason = "anonymous" | "unpaid";

interface PaywallDialogProps {
  open: boolean;
  reason: PaywallReason;
  limit: number;
  entitled: boolean;
  error?: string | null;
  onClose: () => void;
  onSignIn: () => void;
  onUpgrade: () => void | Promise<void>;
  onManage: () => void | Promise<void>;
}

export function PaywallDialog({
  open,
  reason,
  limit,
  entitled,
  error,
  onClose,
  onSignIn,
  onUpgrade,
  onManage,
}: PaywallDialogProps) {
  if (!open) return null;

  const anonymous = reason === "anonymous";

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
        aria-label="Free rooms used"
        className="relative w-full max-w-md rounded-2xl border border-foreground/10 bg-card text-card-foreground p-6 shadow-2xl ring-1 ring-foreground/10"
      >
        <span className="text-primary font-mono text-xs uppercase tracking-wider block mb-2">
          {anonymous ? "Free plan limit" : "Upgrade to continue"}
        </span>
        <h2 className="text-xl font-semibold tracking-tight text-foreground mb-2">
          {anonymous
            ? `You've used all ${limit} free rooms`
            : "Your free rooms are used up"}
        </h2>
        <p className="text-muted-foreground text-sm font-medium mb-6">
          {anonymous
            ? "Create a free account to keep going. When you're ready, unlock unlimited rooms, displays and features forever for a one-time $5."
            : "Unlock unlimited rooms, unlimited displays and every future feature forever with a single $5 payment. No subscription, ever."}
        </p>

        <div className="flex flex-col gap-3">
          {error && (
            <p className="text-sm font-medium text-red-600 dark:text-red-400">
              {error}
            </p>
          )}
          {entitled ? (
            <Button variant="primary" className="w-full" onClick={onManage}>
              Manage your purchase
            </Button>
          ) : (
            <Button
              variant="primary"
              className="w-full"
              onClick={anonymous ? onSignIn : onUpgrade}
            >
              {anonymous ? "Sign up / Sign in" : "Get lifetime access — $5"}
            </Button>
          )}

          {!anonymous && !entitled && (
            <button
              type="button"
              onClick={onClose}
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Maybe later
            </button>
          )}
          {anonymous && (
            <button
              type="button"
              onClick={onClose}
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Maybe later
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
