import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

const fetchMock = vi.fn();

vi.mock("@/lib/auth-client", () => ({
  authClient: { $fetch: vi.fn() },
}));

beforeEach(() => {
  vi.resetModules();
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
  window.localStorage.clear();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

async function loadApi() {
  const { authClient } = await import("@/lib/auth-client");
  vi.mocked(authClient.$fetch).mockResolvedValue({
    data: { token: "jwt-123" },
    error: null,
  } as never);
  return import("@/lib/api");
}

describe("apiFetch", () => {
  it("attaches the bearer token and device id", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ ok: true }),
    });
    const { apiFetch } = await loadApi();

    const result = await apiFetch("/api/me");
    expect(result.ok).toBe(true);

    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toContain("/api/me");
    expect(init.headers.Authorization).toBe("Bearer jwt-123");
    expect(init.headers["X-Device-Id"]).toMatch(/^[A-Za-z0-9_-]{8,64}$/);
  });

  it("skips auth when auth is false", async () => {
    fetchMock.mockResolvedValue({ ok: true, status: 200, json: async () => ({}) });
    const { apiFetch } = await loadApi();

    await apiFetch("/api/health", { auth: false });
    const [, init] = fetchMock.mock.calls[0];
    expect(init.headers.Authorization).toBeUndefined();
  });

  it("surfaces a non-2xx status and body", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 402,
      json: async () => ({ error: "limit_reached", reason: "anonymous" }),
    });
    const { apiFetch } = await loadApi();

    const result = await apiFetch("/api/session", { method: "POST" });
    expect(result.ok).toBe(false);
    expect(result.status).toBe(402);
    expect(result.data).toMatchObject({ error: "limit_reached" });
  });
});
