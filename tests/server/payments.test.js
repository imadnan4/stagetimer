import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { createHmac } from "node:crypto";
import request from "supertest";

const SERVER_PATH = new URL("../../server/server.js", import.meta.url).href;
const WEBHOOK_SECRET = "whsec_" + Buffer.from("stagetimer-webhook-test-secret").toString("base64");
const TEST_USER = { id: "user_test_1", email: "tester@example.com", name: "Tester" };

let mod;

beforeEach(async () => {
  vi.resetModules();
  process.env.POLAR_WEBHOOK_SECRET = WEBHOOK_SECRET;
  mod = await import(SERVER_PATH);
});

afterEach(() => {
  delete process.env.POLAR_WEBHOOK_SECRET;
  delete process.env.POLAR_ACCESS_TOKEN;
  delete process.env.POLAR_PRODUCT_ID;
  delete process.env.TEST_AUTH_USER;
  vi.unstubAllGlobals();
});

function signWebhook(body, { id = "msg_1", timestamp = Math.floor(Date.now() / 1000) } = {}) {
  const secretBytes = Buffer.from(WEBHOOK_SECRET.replace(/^whsec_/, ""), "base64");
  const signature = createHmac("sha256", secretBytes)
    .update(`${id}.${timestamp}.${body}`, "utf8")
    .digest("base64");
  return {
    id,
    timestamp: String(timestamp),
    signature: `v1,${signature}`,
  };
}

function paidOrder(userId, orderId = "order_1") {
  return {
    type: "order.paid",
    data: {
      id: orderId,
      status: "paid",
      paid: true,
      total_amount: 500,
      currency: "usd",
      product_id: "prod_1",
      customer_id: "cust_1",
      created_at: "2026-09-27T12:00:00.000Z",
      metadata: userId ? { user_id: userId } : {},
      customer: { id: "cust_1", email: "tester@example.com", external_id: userId || null },
    },
  };
}

async function deliver(event, deliveryId = "msg_1") {
  const body = JSON.stringify(event);
  const sig = signWebhook(body, { id: deliveryId });
  return request(mod.app)
    .post("/api/polar/webhook")
    .set("Content-Type", "application/json")
    .set("webhook-id", sig.id)
    .set("webhook-timestamp", sig.timestamp)
    .set("webhook-signature", sig.signature)
    .send(body);
}

describe("GET /api/me", () => {
  it("reports an anonymous visitor with the full free allowance", async () => {
    const res = await request(mod.app).get("/api/me");
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      ok: true,
      authenticated: false,
      user: null,
      entitled: false,
      limit: 5,
      used: 0,
      remaining: 5,
    });
  });
});

describe("free room limit", () => {
  it("allows 5 anonymous rooms then blocks with an anonymous reason", async () => {
    for (let i = 0; i < 5; i++) {
      const res = await request(mod.app).post("/api/session").send({});
      expect(res.status).toBe(200);
    }
    const blocked = await request(mod.app).post("/api/session").send({});
    expect(blocked.status).toBe(402);
    expect(blocked.body).toMatchObject({
      ok: false,
      error: "limit_reached",
      reason: "anonymous",
      limit: 5,
      used: 5,
    });

    const me = await request(mod.app).get("/api/me");
    expect(me.body).toMatchObject({ used: 5, remaining: 0 });
  });

  it("counts a signed-in unpaid user against the same limit", async () => {
    process.env.TEST_AUTH_USER = JSON.stringify(TEST_USER);
    for (let i = 0; i < 5; i++) {
      const res = await request(mod.app).post("/api/session").send({});
      expect(res.status).toBe(200);
    }
    const blocked = await request(mod.app).post("/api/session").send({});
    expect(blocked.status).toBe(402);
    expect(blocked.body.reason).toBe("unpaid");
  });
});

describe("POST /api/checkout", () => {
  it("requires authentication", async () => {
    const res = await request(mod.app).post("/api/checkout").send({});
    expect(res.status).toBe(401);
  });

  it("returns alreadyEntitled for lifetime users without calling Polar", async () => {
    process.env.TEST_AUTH_USER = JSON.stringify(TEST_USER);
    await deliver(paidOrder(TEST_USER.id));
    const res = await request(mod.app).post("/api/checkout").send({});
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true, alreadyEntitled: true });
  });

  it("retries without customer_email when Polar rejects the address", async () => {
    process.env.TEST_AUTH_USER = JSON.stringify(TEST_USER);
    process.env.POLAR_ACCESS_TOKEN = "polar_test_token";
    process.env.POLAR_PRODUCT_ID = "prod_test";

    const fetchMock = vi.fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 422,
        text: async () =>
          JSON.stringify({ error: "RequestValidationError", detail: [{ msg: "bad email" }] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 201,
        text: async () =>
          JSON.stringify({ id: "co_1", url: "https://polar.sh/checkout/co_1" }),
      });
    vi.stubGlobal("fetch", fetchMock);

    const res = await request(mod.app).post("/api/checkout").send({});
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true, id: "co_1", url: "https://polar.sh/checkout/co_1" });
    expect(fetchMock).toHaveBeenCalledTimes(2);

    const firstBody = JSON.parse(fetchMock.mock.calls[0][1].body);
    const secondBody = JSON.parse(fetchMock.mock.calls[1][1].body);
    expect(firstBody.customer_email).toBe(TEST_USER.email);
    expect(secondBody.customer_email).toBeUndefined();
    expect(secondBody.metadata).toEqual({ user_id: TEST_USER.id });
  });
});

describe("POST /api/polar/webhook", () => {
  it("rejects a missing secret with 503", async () => {
    delete process.env.POLAR_WEBHOOK_SECRET;
    vi.resetModules();
    const fresh = await import(SERVER_PATH);
    const res = await request(fresh.app).post("/api/polar/webhook").send({});
    expect(res.status).toBe(503);
  });

  it("rejects an invalid signature", async () => {
    const body = JSON.stringify(paidOrder(TEST_USER.id));
    const res = await request(mod.app)
      .post("/api/polar/webhook")
      .set("Content-Type", "application/json")
      .set("webhook-id", "msg_bad")
      .set("webhook-timestamp", String(Math.floor(Date.now() / 1000)))
      .set("webhook-signature", "v1,deadbeef")
      .send(body);
    expect(res.status).toBe(401);
  });

  it("grants lifetime access on a paid order and lifts the limit", async () => {
    process.env.TEST_AUTH_USER = JSON.stringify(TEST_USER);
    const res = await deliver(paidOrder(TEST_USER.id));
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);

    const me = await request(mod.app).get("/api/me");
    expect(me.body).toMatchObject({ authenticated: true, entitled: true, remaining: null });

    for (let i = 0; i < 12; i++) {
      const session = await request(mod.app).post("/api/session").send({});
      expect(session.status).toBe(200);
    }
  });

  it("revokes access when the order is refunded", async () => {
    process.env.TEST_AUTH_USER = JSON.stringify(TEST_USER);
    await deliver(paidOrder(TEST_USER.id));

    const refund = {
      type: "order.refunded",
      data: { id: "order_1", status: "refunded", metadata: { user_id: TEST_USER.id } },
    };
    const res = await deliver(refund, "msg_refund");
    expect(res.status).toBe(200);

    const me = await request(mod.app).get("/api/me");
    expect(me.body.entitled).toBe(false);
  });

  it("does not grant access when the order has no user metadata", async () => {
    process.env.TEST_AUTH_USER = JSON.stringify(TEST_USER);
    const res = await deliver(paidOrder(null, "order_nouser"));
    expect(res.status).toBe(200);
    const me = await request(mod.app).get("/api/me");
    expect(me.body.entitled).toBe(false);
  });

  it("marks a redelivered event as a duplicate", async () => {
    process.env.TEST_AUTH_USER = JSON.stringify(TEST_USER);
    const first = await deliver(paidOrder(TEST_USER.id), "msg_dup");
    expect(first.body).toEqual({ ok: true, duplicate: false });
    const second = await deliver(paidOrder(TEST_USER.id), "msg_dup");
    expect(second.body).toEqual({ ok: true, duplicate: true });
  });
});
