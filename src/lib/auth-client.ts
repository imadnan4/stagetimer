"use client";

import { createAuthClient } from "better-auth/react";

/**
 * Neon runs Managed Better Auth; the hosted auth server speaks the standard
 * Better Auth protocol, so we use the upstream React client pointed at it.
 */
export const AUTH_BASE_URL = process.env.NEXT_PUBLIC_NEON_AUTH_URL || "";

export const authClient = createAuthClient({
  baseURL: AUTH_BASE_URL || undefined,
  fetchOptions: { credentials: "include" },
});
