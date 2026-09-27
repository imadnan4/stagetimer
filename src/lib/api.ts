"use client";

import { authClient } from "@/lib/auth-client";
import { getDeviceId } from "@/lib/device";
import { apiBase } from "@/lib/wsClient";

export interface ApiResult<T = unknown> {
  ok: boolean;
  status: number;
  data: T;
}

let cachedToken: { token: string; expiresAt: number } | null = null;
const TOKEN_TTL_MS = 60_000;

/** Fetch a short-lived JWT from Neon Auth to authenticate API calls. */
export async function getAuthToken(force = false): Promise<string | null> {
  if (!force && cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.token;
  }
  try {
    const res = await authClient.$fetch("/token", { method: "GET" });
    const token = (res?.data as { token?: string } | null)?.token ?? null;
    if (token) {
      cachedToken = { token, expiresAt: Date.now() + TOKEN_TTL_MS };
    } else {
      cachedToken = null;
    }
    return token;
  } catch {
    return null;
  }
}

export function clearAuthToken(): void {
  cachedToken = null;
}

export interface ApiOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  /** Attach the bearer token + device id (default true). */
  auth?: boolean;
  signal?: AbortSignal;
}

export async function apiFetch<T = unknown>(
  path: string,
  options: ApiOptions = {}
): Promise<ApiResult<T>> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const deviceId = getDeviceId();
  if (deviceId) headers["X-Device-Id"] = deviceId;

  if (options.auth !== false) {
    const token = await getAuthToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${apiBase()}${path}`, {
    method: options.method || "GET",
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    signal: options.signal,
  });

  let data: unknown = null;
  try {
    data = await res.json();
  } catch {}

  return { ok: res.ok, status: res.status, data: data as T };
}
