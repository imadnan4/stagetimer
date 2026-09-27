"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";

export function AccountControl() {
  const { isPending, entitlement, user, openSignIn, signOut, openPortal, startUpgrade } =
    useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [menuOpen]);

  if (isPending && !entitlement.authenticated) return null;

  if (!entitlement.authenticated || !user) {
    return (
      <Button variant="secondary" size="sm" onClick={openSignIn}>
        Sign in
      </Button>
    );
  }

  const label = user.name || user.email || "Account";
  const initial = label.trim().charAt(0).toUpperCase() || "A";

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setMenuOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        className="inline-flex h-8 items-center gap-2 rounded-[0.5em] border border-transparent bg-card px-2 text-sm font-medium text-foreground shadow-sm shadow-black/15 ring ring-foreground/10 transition-colors hover:bg-muted/50"
      >
        <span className="grid size-5 place-items-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
          {initial}
        </span>
        {entitlement.entitled ? (
          <span className="hidden sm:inline text-[10px] font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Pro
          </span>
        ) : (
          <span className="hidden sm:inline">Account</span>
        )}
      </button>

      {menuOpen && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-60 overflow-hidden rounded-xl border border-foreground/10 bg-card p-1.5 shadow-xl ring-1 ring-foreground/10"
        >
          <div className="px-3 py-2">
            <p className="truncate text-sm font-medium text-foreground">{label}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          </div>
          <div className="my-1 h-px bg-foreground/10" />
          {entitlement.entitled ? (
            <button
              type="button"
              role="menuitem"
              className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground hover:bg-foreground/5"
              onClick={() => {
                setMenuOpen(false);
                openPortal();
              }}
            >
              Manage billing
            </button>
          ) : (
            <button
              type="button"
              role="menuitem"
              className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground hover:bg-foreground/5"
              onClick={() => {
                setMenuOpen(false);
                startUpgrade();
              }}
            >
              Upgrade for $5
            </button>
          )}
          <button
            type="button"
            role="menuitem"
            className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground hover:bg-foreground/5"
            onClick={async () => {
              setMenuOpen(false);
              await signOut();
            }}
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
