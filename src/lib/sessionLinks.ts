const SESSION_CODE_RE = /^[A-Z0-9]{4,16}$/;
const JOIN_TOKEN_RE = /^[a-zA-Z0-9_-]{8,128}$/;

export type ParsedScannedSession = {
  code: string;
  joinToken?: string;
};

function sanitizeCode(input: string): string | null {
  const normalized = input.trim().toUpperCase();
  if (!normalized) return null;
  if (!SESSION_CODE_RE.test(normalized)) return null;
  return normalized;
}

export function buildDisplayJoinPath(code: string): string {
  const normalized = sanitizeCode(code);
  if (!normalized) return "/display";
  return `/display?code=${encodeURIComponent(normalized)}`;
}

function sanitizeJoinToken(input: string | null): string | undefined {
  if (!input) return undefined;
  const normalized = input.trim();
  if (!normalized) return undefined;
  if (!JOIN_TOKEN_RE.test(normalized)) return undefined;
  return normalized;
}

export function buildDisplayJoinPathWithToken(code: string, joinToken?: string): string {
  const normalized = sanitizeCode(code);
  if (!normalized) return "/display";

  const params = new URLSearchParams({ code: normalized });
  const safeToken = sanitizeJoinToken(joinToken ?? null);
  if (safeToken) {
    params.set("join", safeToken);
  }

  return `/display?${params.toString()}`;
}

export function buildDisplayJoinUrl(code: string, origin?: string, joinToken?: string): string {
  const path = buildDisplayJoinPathWithToken(code, joinToken);
  if (!origin) return path;
  try {
    return new URL(path, origin).toString();
  } catch {
    return path;
  }
}

export function extractSessionCodeFromScan(rawValue: string): string | null {
  const parsed = parseScannedSession(rawValue);
  return parsed?.code ?? null;
}

export function parseScannedSession(rawValue: string): ParsedScannedSession | null {
  const trimmed = rawValue.trim();
  if (!trimmed) return null;

  const direct = sanitizeCode(trimmed.replace(/\s/g, ""));
  if (direct) return { code: direct };

  try {
    const parsed = new URL(trimmed, "https://stage-timer.local");
    const fromQuery = parsed.searchParams.get("code");
    const safeCode = fromQuery ? sanitizeCode(fromQuery) : null;
    if (!safeCode) return null;

    return {
      code: safeCode,
      joinToken: sanitizeJoinToken(parsed.searchParams.get("join")),
    };
  } catch {
    return null;
  }
}
