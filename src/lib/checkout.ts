"use client";

import { apiFetch } from "@/lib/api";

export type CheckoutOutcome =
  | { status: "redirecting" }
  | { status: "entitled" }
  | { status: "needs_auth" }
  | { status: "error"; message?: string };

/** Start Polar checkout for the current user and redirect when possible. */
export async function startCheckout(): Promise<CheckoutOutcome> {
  const { ok, status, data } = await apiFetch<{
    alreadyEntitled?: boolean;
    url?: string;
    error?: string;
  }>("/api/checkout", {
    method: "POST",
    body: {},
  });
  if (ok && data?.alreadyEntitled) return { status: "entitled" };
  if (ok && data?.url) {
    window.location.href = data.url;
    return { status: "redirecting" };
  }
  if (status === 401) return { status: "needs_auth" };
  return { status: "error", message: data?.error };
}

/** Open the Polar customer portal (returns false when there is no customer). */
export async function openCustomerPortal(): Promise<boolean> {
  const { ok, data } = await apiFetch<{ url?: string }>("/api/polar/portal", {
    method: "POST",
    body: {},
  });
  if (ok && data?.url) {
    window.location.href = data.url;
    return true;
  }
  return false;
}
