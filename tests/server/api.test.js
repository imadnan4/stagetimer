import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import request from "supertest";

const SERVER_PATH = new URL("../../server/server.js", import.meta.url).href;

let mod;

beforeEach(async () => {
  vi.resetModules();
  mod = await import(SERVER_PATH);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("REST API", () => {
  it("GET /api/health returns ok", async () => {
    const res = await request(mod.app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });

  it("POST /api/session creates a session with tokens and urls", async () => {
    const res = await request(mod.app)
      .post("/api/session")
      .send({ presetMs: 300000, allowOvertime: true });
    expect(res.status).toBe(200);
    expect(res.body.code).toMatch(/^[2-9A-HJKMNP-Z]{6}$/);
    expect(res.body.controllerToken).toMatch(/^[0-9a-f]{32}$/);
    expect(res.body.displayToken).toMatch(/^[0-9a-f]{32}$/);
    expect(res.body.controlUrl).toBe(`/control?code=${res.body.code}&token=${res.body.controllerToken}`);
    expect(res.body.displayUrl).toBe(`/display?code=${res.body.code}&join=${res.body.displayToken}`);
  });

  it("POST /api/session generates unique codes", async () => {
    const a = await request(mod.app).post("/api/session").send({});
    const b = await request(mod.app).post("/api/session").send({});
    expect(a.body.code).not.toBe(b.body.code);
  });
});
