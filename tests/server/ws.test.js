import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import WebSocket from "ws";
import request from "supertest";

const SERVER_PATH = new URL("../../server/server.js", import.meta.url).href;

let httpServer;
let baseUrl;
let wsUrl;
const openSockets = new Set();

beforeEach(async () => {
  vi.resetModules();
  process.env.LEMON_SQUEEZY_WEBHOOK_SECRET = "test-secret";
  const mod = await import(SERVER_PATH);
  httpServer = await mod.start(0);
  const port = httpServer.address().port;
  baseUrl = `http://127.0.0.1:${port}`;
  wsUrl = `ws://127.0.0.1:${port}/ws`;
});

afterEach(async () => {
  for (const ws of openSockets) {
    try { ws.close(); } catch {}
  }
  openSockets.clear();
  await new Promise((resolve) => httpServer.close(resolve));
  delete process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;
  vi.unstubAllGlobals();
});

async function createSession(presetMs = 300000) {
  const res = await request(baseUrl).post("/api/session").send({ presetMs });
  return res.body;
}

// A message queue that buffers every incoming message, so no message is ever
// lost between awaits (unlike one-off listeners, which drop events while no
// listener is attached).
function makeQueue() {
  const queue = [];
  const waiters = [];
  return {
    push(msg) {
      if (waiters.length > 0) {
        const waiter = waiters.shift();
        clearTimeout(waiter.timer);
        waiter.resolve(msg);
      } else {
        queue.push(msg);
      }
    },
    next(timeout = 3000) {
      if (queue.length > 0) return Promise.resolve(queue.shift());
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          reject(new Error(`timed out waiting for a message (queue size ${queue.length})`));
        }, timeout);
        waiters.push({ resolve, reject, timer });
      });
    },
  };
}

async function openWs() {
  const ws = new WebSocket(wsUrl);
  const queue = makeQueue();
  const closed = new Promise((resolve) => {
    ws.on("close", resolve);
    ws.on("error", () => resolve());
  });
  ws.on("message", (data) => queue.push(JSON.parse(data.toString())));
  await new Promise((resolve, reject) => {
    ws.on("open", resolve);
    ws.on("error", reject);
  });
  openSockets.add(ws);
  return { ws, queue, closed };
}

async function takeN(queue, n, timeout = 3000) {
  const msgs = [];
  for (let i = 0; i < n; i++) msgs.push(await queue.next(timeout));
  return msgs;
}

async function join(role, session, token, extra = {}) {
  const client = await openWs();
  client.ws.send(JSON.stringify({ type: "join", role, code: session.code, token, ...extra }));
  return client;
}

describe("WebSocket /ws", () => {
  it("rejects joining an unknown session", async () => {
    const client = await openWs();
    client.ws.send(JSON.stringify({ type: "join", role: "controller", code: "NOPE01", token: "x" }));
    const [msg] = await takeN(client.queue, 1);
    expect(msg).toMatchObject({ type: "error", message: "Session not found" });
  });

  it("rejects a controller with the wrong token", async () => {
    const session = await createSession();
    const client = await openWs();
    client.ws.send(JSON.stringify({ type: "join", role: "controller", code: session.code, token: "wrong" }));
    const [msg] = await takeN(client.queue, 1);
    expect(msg).toMatchObject({ type: "error", message: "Unauthorized" });
  });

  it("joins controller and display, broadcasting presence and state", async () => {
    const session = await createSession();
    const controller = await join("controller", session, session.controllerToken);
    const [joined, state, initialPresence] = await takeN(controller.queue, 3);
    expect(joined).toMatchObject({ type: "joined", role: "controller", code: session.code, counts: { controllers: 1, displays: 0 } });
    expect(state).toMatchObject({ type: "state", code: session.code, status: "idle", presetDurationMs: 300000 });
    expect(initialPresence).toMatchObject({ type: "presence", counts: { controllers: 1, displays: 0 } });

    const display = await join("display", session, session.displayToken);
    const [displayJoined, displayState, displayPresence] = await takeN(display.queue, 3);
    expect(displayJoined).toMatchObject({ type: "joined", role: "display", counts: { controllers: 1, displays: 1 } });
    expect(displayState).toMatchObject({ type: "state", code: session.code });
    expect(displayPresence).toMatchObject({ type: "presence", counts: { controllers: 1, displays: 1 } });

    const [controllerPresence] = await takeN(controller.queue, 1);
    expect(controllerPresence).toMatchObject({ type: "presence", counts: { controllers: 1, displays: 1 } });
  });

  it("broadcasts state changes to controller and display", async () => {
    const session = await createSession();
    const controller = await join("controller", session, session.controllerToken);
    const display = await join("display", session, session.displayToken);
    await takeN(controller.queue, 3);
    await takeN(display.queue, 3);
    await takeN(controller.queue, 1);

    controller.ws.send(JSON.stringify({ type: "action", action: "start" }));
    const [controllerState] = await takeN(controller.queue, 1);
    expect(controllerState).toMatchObject({ type: "state", status: "running", startTime: expect.any(Number) });

    const [displayState] = await takeN(display.queue, 1);
    expect(displayState).toMatchObject({ type: "state", status: "running", startTime: expect.any(Number) });
  });

  it("allows rejoining as controller with the same token", async () => {
    const session = await createSession();
    const first = await join("controller", session, session.controllerToken);
    await takeN(first.queue, 3);

    const second = await join("controller", session, session.controllerToken);
    const [secondMsg] = await takeN(second.queue, 1);
    expect(secondMsg).toMatchObject({ type: "joined", role: "controller", counts: { controllers: 2, displays: 0 } });
  });

  it("ignores actions from display sockets", async () => {
    const session = await createSession();
    const controller = await join("controller", session, session.controllerToken);
    const display = await join("display", session, session.displayToken);
    await takeN(controller.queue, 3);
    await takeN(display.queue, 3);
    await takeN(controller.queue, 1);

    display.ws.send(JSON.stringify({ type: "action", action: "start" }));

    // Display actions must be dropped silently: no message should arrive
    const outcome = await Promise.race([
      display.queue.next(1000).then(() => "message").catch(() => "message"),
      new Promise((resolve) => setTimeout(() => resolve("timeout"), 500)),
    ]);
    expect(outcome).toBe("timeout");

    // And the controller can still start the timer afterwards
    controller.ws.send(JSON.stringify({ type: "action", action: "start" }));
    const [state] = await takeN(controller.queue, 1);
    expect(state).toMatchObject({ type: "state", status: "running" });
  });

  it("ends the session and closes all sockets", async () => {
    const session = await createSession();
    const controller = await join("controller", session, session.controllerToken);
    const display = await join("display", session, session.displayToken);
    await takeN(controller.queue, 3);
    await takeN(display.queue, 3);
    await takeN(controller.queue, 1);

    controller.ws.send(JSON.stringify({ type: "action", action: "end" }));
    const [controllerMsg] = await takeN(controller.queue, 1);
    const [displayMsg] = await takeN(display.queue, 1);
    expect(controllerMsg).toMatchObject({ type: "error", message: "Session ended" });
    expect(displayMsg).toMatchObject({ type: "error", message: "Session ended" });

    await Promise.all([controller.closed, display.closed]);
  });
});
