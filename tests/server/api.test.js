import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { createHmac } from "node:crypto";
import request from "supertest";

const SERVER_PATH = new URL("../../server/server.js", import.meta.url).href;

let mod;

beforeEach(async () => {
  vi.resetModules();
  process.env.LEMON_SQUEEZY_WEBHOOK_SECRET = "test-secret";
  mod = await import(SERVER_PATH);
});

afterEach(() => {
  vi.unstubAllGlobals();
  delete process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;
});

describe("REST API", () => {
  it("GET /api/health returns ok", async () => {
    const res = await request(mod.app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });

  it("GET /api/donations starts empty", async () => {
    const res = await request(mod.app).get("/api/donations");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ count: 0, totalCents: 0 });
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

describe("POST /api/lemon/webhook", () => {
  const sign = (body, secret = "test-secret") =>
    createHmac("sha256", secret).update(body, "utf8").digest("hex");

  const webhook = (body, signature) =>
    request(mod.app)
      .post("/api/lemon/webhook")
      .set("Content-Type", "application/json")
      .set("X-Signature", signature)
      .send(body);

  it("accepts paid order_created and tallies donations", async () => {
    const body = JSON.stringify({
      meta: { event_name: "order_created" },
      data: { id: "ord_123", attributes: { status: "paid", total: 1234 } },
    });
    const res = await webhook(body, sign(body));
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });

    const donations = await request(mod.app).get("/api/donations");
    expect(donations.body).toEqual({ count: 1, totalCents: 1234 });
  });

  it("ignores unpaid orders", async () => {
    const body = JSON.stringify({
      meta: { event_name: "order_created" },
      data: { id: "ord_pending", attributes: { status: "pending", total: 999 } },
    });
    const res = await webhook(body, sign(body));
    expect(res.status).toBe(200);

    const donations = await request(mod.app).get("/api/donations");
    expect(donations.body).toEqual({ count: 0, totalCents: 0 });
  });

  it("deduplicates redelivered webhooks for the same order", async () => {
    const body = JSON.stringify({
      meta: { event_name: "order_created" },
      data: { id: "ord_same", attributes: { status: "paid", total: 500 } },
    });
    await webhook(body, sign(body));
    const second = await webhook(body, sign(body));
    expect(second.status).toBe(200);

    const donations = await request(mod.app).get("/api/donations");
    expect(donations.body).toEqual({ count: 1, totalCents: 500 });
  });

  it("subtracts refunds without going below zero", async () => {
    const created = JSON.stringify({
      meta: { event_name: "order_created" },
      data: { id: "ord_refundable", attributes: { status: "paid", total: 1000 } },
    });
    await webhook(created, sign(created));

    const refunded = JSON.stringify({
      meta: { event_name: "order_refunded" },
      data: { id: "ord_refundable", attributes: { total: 1000 } },
    });
    const res = await webhook(refunded, sign(refunded));
    expect(res.status).toBe(200);

    const donations = await request(mod.app).get("/api/donations");
    expect(donations.body).toEqual({ count: 1, totalCents: 0 });

    const overRefund = JSON.stringify({
      meta: { event_name: "order_refunded" },
      data: { id: "ord_refundable_2", attributes: { total: 5000 } },
    });
    await webhook(overRefund, sign(overRefund));
    const after = await request(mod.app).get("/api/donations");
    expect(after.body).toEqual({ count: 1, totalCents: 0 });
  });

  it("rejects invalid signature", async () => {
    const body = JSON.stringify({
      meta: { event_name: "order_created" },
      data: { id: "ord_1", attributes: { status: "paid", total: 100 } },
    });
    const res = await webhook(body, "deadbeef");
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ ok: false, error: "Invalid signature" });

    const donations = await request(mod.app).get("/api/donations");
    expect(donations.body).toEqual({ count: 0, totalCents: 0 });
  });

  it("rejects malformed total without mutating", async () => {
    const body = JSON.stringify({
      meta: { event_name: "order_created" },
      data: { id: "ord_2", attributes: { status: "paid", total: "not-a-number" } },
    });
    const res = await webhook(body, sign(body));
    expect(res.status).toBe(400);

    const donations = await request(mod.app).get("/api/donations");
    expect(donations.body).toEqual({ count: 0, totalCents: 0 });
  });

  it("returns 503 when no webhook secret is configured", async () => {
    delete process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;
    vi.resetModules();
    const fresh = await import(SERVER_PATH);

    const body = JSON.stringify({
      meta: { event_name: "order_created" },
      data: { attributes: { total: 100 } },
    });
    const res = await request(fresh.app)
      .post("/api/lemon/webhook")
      .set("Content-Type", "application/json")
      .set("X-Signature", "anything")
      .send(body);
    expect(res.status).toBe(503);
  });
});
