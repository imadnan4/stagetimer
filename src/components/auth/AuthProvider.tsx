"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { authClient, AUTH_BASE_URL } from "@/lib/auth-client";
import { apiFetch, clearAuthToken } from "@/lib/api";
import { openCustomerPortal, startCheckout } from "@/lib/checkout";
import { SignInDialog } from "@/components/auth/SignInDialog";
import {
  PaywallDialog,
  type PaywallReason,
} from "@/components/paywall/PaywallDialog";

export interface AuthUser {
  id: string;
  email: string | null;
  name: string | null;
}

export interface EntitlementState {
  loading: boolean;
  authenticated: boolean;
  user: AuthUser | null;
  entitled: boolean;
  limit: number;
  used: number;
  remaining: number | null;
}

const INITIAL: EntitlementState = {
  loading: true,
  authenticated: false,
  user: null,
  entitled: false,
  limit: 5,
  used: 0,
  remaining: null,
};

interface AuthContextValue {
  isPending: boolean;
  user: { id: string; email: string; name?: string | null } | null;
  entitlement: EntitlementState;
  refreshEntitlement: () => Promise<EntitlementState | null>;
  signOut: () => Promise<void>;
  openSignIn: () => void;
  openPaywall: (reason: PaywallReason) => void;
  startUpgrade: () => Promise<void>;
  openPortal: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}

interface MeResponse {
  authenticated?: boolean;
  user?: AuthUser | null;
  entitled?: boolean;
  limit?: number;
  used?: number;
  remaining?: number | null;
}

function applyMe(data: MeResponse | null): EntitlementState {
  return {
    loading: false,
    authenticated: Boolean(data?.authenticated),
    user: data?.user ?? null,
    entitled: Boolean(data?.entitled),
    limit: typeof data?.limit === "number" ? data.limit : 5,
    used: typeof data?.used === "number" ? data.used : 0,
    remaining:
      data?.remaining === null || typeof data?.remaining === "number"
        ? data.remaining
        : null,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, isPending, refetch } = authClient.useSession();
  const [entitlement, setEntitlement] = useState<EntitlementState>(INITIAL);
  const [signInOpen, setSignInOpen] = useState(false);
  const [paywall, setPaywall] = useState<{ open: boolean; reason: PaywallReason }>(
    { open: false, reason: "anonymous" }
  );
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const confirmedCheckout = useRef(false);

  const refreshEntitlement = useCallback(async (): Promise<EntitlementState | null> => {
    const { ok, data } = await apiFetch<MeResponse>("/api/me");
    if (!ok) return null;
    const next = applyMe(data);
    setEntitlement(next);
    return next;
  }, []);

  // Neon completes OAuth by redirecting back with a one-time
  // `neon_auth_session_verifier`. Exchange it for a session cookie before
  // anything else reads the session.
  useEffect(() => {
    if (typeof window === "undefined" || !AUTH_BASE_URL) return;
    const url = new URL(window.location.href);
    const verifier = url.searchParams.get("neon_auth_session_verifier");
    if (!verifier) return;
    let cancelled = false;
    (async () => {
      try {
        await fetch(
          `${AUTH_BASE_URL}/get-session?neon_auth_session_verifier=${encodeURIComponent(verifier)}`,
          { credentials: "include" }
        );
      } catch {}
      if (cancelled) return;
      url.searchParams.delete("neon_auth_session_verifier");
      window.history.replaceState({}, "", url.toString());
      clearAuthToken();
      await refetch().catch(() => {});
      await refreshEntitlement();
    })();
    return () => {
      cancelled = true;
    };
  }, [refetch, refreshEntitlement]);

  // Refresh whenever the signed-in identity changes.
  useEffect(() => {
    if (isPending) return;
    refreshEntitlement();
  }, [isPending, session?.user?.id, refreshEntitlement]);

  // After a successful Polar checkout, poll until the webhook grants access.
  useEffect(() => {
    if (confirmedCheckout.current) return;
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    if (url.searchParams.get("checkout") !== "success") return;
    confirmedCheckout.current = true;
    clearAuthToken();

    let attempts = 0;
    const poll = async () => {
      const next = await refreshEntitlement();
      attempts += 1;
      if (next?.entitled || attempts >= 6) {
        url.searchParams.delete("checkout");
        window.history.replaceState({}, "", url.toString());
        return;
      }
      setTimeout(poll, 1500);
    };
    poll();
  }, [refreshEntitlement]);

  const signOut = useCallback(async () => {
    try {
      await authClient.signOut();
    } finally {
      clearAuthToken();
      await refetch().catch(() => {});
      await refreshEntitlement();
    }
  }, [refetch, refreshEntitlement]);

  const startUpgrade = useCallback(async () => {
    setCheckoutError(null);
    const result = await startCheckout();
    if (result.status === "entitled") {
      await refreshEntitlement();
    } else if (result.status === "needs_auth") {
      setPaywall((p) => ({ ...p, open: false }));
      setSignInOpen(true);
    } else if (result.status === "error") {
      setCheckoutError(
        "We couldn't start checkout just now. Please try again in a moment."
      );
    }
  }, [refreshEntitlement]);

  const openPortal = useCallback(async () => {
    const opened = await openCustomerPortal();
    if (!opened) {
      console.warn("No customer portal available for this account.");
    }
  }, []);

  const openSignIn = useCallback(() => {
    setPaywall((p) => ({ ...p, open: false }));
    setSignInOpen(true);
  }, []);

  const openPaywall = useCallback((reason: PaywallReason) => {
    setCheckoutError(null);
    setPaywall({ open: true, reason });
  }, []);

  const handleSignedIn = useCallback(async () => {
    clearAuthToken();
    await refetch().catch(() => {});
    await refreshEntitlement();
  }, [refetch, refreshEntitlement]);

  const value = useMemo<AuthContextValue>(
    () => ({
      isPending,
      user: session?.user ?? null,
      entitlement,
      refreshEntitlement,
      signOut,
      openSignIn,
      openPaywall,
      startUpgrade,
      openPortal,
    }),
    [
      isPending,
      session?.user,
      entitlement,
      refreshEntitlement,
      signOut,
      openSignIn,
      openPaywall,
      startUpgrade,
      openPortal,
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
      <SignInDialog
        open={signInOpen}
        onClose={() => setSignInOpen(false)}
        onSignedIn={handleSignedIn}
      />
      <PaywallDialog
        open={paywall.open}
        reason={paywall.reason}
        limit={entitlement.limit}
        entitled={entitlement.entitled}
        error={checkoutError}
        onClose={() => setPaywall((p) => ({ ...p, open: false }))}
        onSignIn={openSignIn}
        onUpgrade={async () => {
          await startUpgrade();
        }}
        onManage={openPortal}
      />
    </AuthContext.Provider>
  );
}
