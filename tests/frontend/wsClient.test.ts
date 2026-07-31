import { describe, it, expect, afterEach, vi } from "vitest";
import { apiBase, wsBase, connectWS } from "@/lib/wsClient";

afterEach(() => {
  delete process.env.NEXT_PUBLIC_API_URL;
  delete process.env.NEXT_PUBLIC_WS_URL;
});

describe("apiBase", () => {
  it("prefers the explicit env var", () => {
    process.env.NEXT_PUBLIC_API_URL = "https://api.example.com";
    expect(apiBase()).toBe("https://api.example.com");
  });

  it("falls back to a localhost dev URL without env or window", () => {
    expect(apiBase()).toBe("http://localhost:8787");
  });
});

describe("wsBase", () => {
  it("prefers the explicit env var", () => {
    process.env.NEXT_PUBLIC_WS_URL = "wss://api.example.com/ws";
    expect(wsBase()).toBe("wss://api.example.com/ws");
  });

  it("falls back to a localhost dev URL without env or window", () => {
    expect(wsBase()).toBe("ws://localhost:8787/ws");
  });
});

describe("connectWS", () => {
  it("returns the underlying WebSocket and parses JSON messages", () => {
    const FakeWebSocket = vi.fn(function (this: any, url: string) {
      this.url = url;
      this.onmessage = null;
      this.onopen = null;
      this.send = vi.fn();
      this.close = vi.fn();
    });
    vi.stubGlobal("WebSocket", FakeWebSocket);

    const received: unknown[] = [];
    const ws = connectWS("ws://test.local/ws", (m) => received.push(m));
    ws.onmessage?.(new MessageEvent("message", { data: JSON.stringify({ type: "presence", counts: { controllers: 1, displays: 0 } }) }));
    expect(FakeWebSocket).toHaveBeenCalledWith("ws://test.local/ws");
    expect(received).toEqual([{ type: "presence", counts: { controllers: 1, displays: 0 } }]);
  });
});
