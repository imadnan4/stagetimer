// StageTimer backend: REST (auth-gated sessions, entitlements, Polar webhooks)
// and the synchronized WebSocket timer on /ws.
const express = require('express');
const http = require('http');
const cors = require('cors');
const { WebSocketServer } = require('ws');

const { getPool, runMigrations } = require('./lib/db');
const { createMemoryStore, createPgStore } = require('./lib/store');
const { identityEntries } = require('./lib/identity');
const { getUser } = require('./lib/auth');
const polar = require('./lib/polar');

const PORT = process.env.PORT || 8787;
const PUBLIC_ORIGIN = process.env.PUBLIC_ORIGIN || 'http://localhost:3000';
const CORS_ALLOW_ALL = process.env.CORS_ALLOW_ALL === '1' || process.env.NODE_ENV !== 'production';
const SESSION_TTL_MINUTES = Number(process.env.SESSION_TTL_MINUTES || 120);
const ALPHABET = (process.env.SESSION_CODE_ALPHABET || '23456789ABCDEFGHJKMNPQRSTUVWXYZ').split('');
const FREE_ROOM_LIMIT = Number(process.env.FREE_ROOM_LIMIT || 5);
const WS_HEARTBEAT_MS = 30_000;

// Usage/entitlement storage: Postgres when DATABASE_URL is set, otherwise an
// in-process store so local dev and the test suite run without a database.
function initStore() {
  const pool = getPool();
  if (pool) return createPgStore(pool);
  if (process.env.NODE_ENV === 'production') {
    throw new Error('DATABASE_URL is required in production');
  }
  return createMemoryStore();
}

const store = initStore();

// Test-only seam: lets the suite exercise authenticated flows without minting
// real Neon JWTs. Never honored outside NODE_ENV=test.
function resolveUser(req) {
  if (process.env.NODE_ENV === 'test' && process.env.TEST_AUTH_USER) {
    try {
      return Promise.resolve(JSON.parse(process.env.TEST_AUTH_USER));
    } catch {
      return Promise.resolve(null);
    }
  }
  return getUser(req);
}

/** @typedef {Object} Session */
const sessions = new Map(); // code -> session

function genCode(len = 6) {
  let out = '';
  for (let i = 0; i < len; i++) out += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  if (sessions.has(out)) return genCode(len);
  return out;
}
const { randomBytes } = require('crypto');
function genToken() {
  return randomBytes(16).toString('hex');
}
function now() { return Date.now(); }

/** Create server */
const app = express();
app.set('trust proxy', true);
app.use(cors({ origin: CORS_ALLOW_ALL ? true : PUBLIC_ORIGIN, credentials: false }));
app.options('*', cors({ origin: CORS_ALLOW_ALL ? true : PUBLIC_ORIGIN, credentials: false }));
app.use(express.json({
  verify: (req, _res, buf) => { req.rawBody = buf; },
}));

app.get('/api/health', (_req, res) => res.json({ ok: true }));

/** Extract the entitlement carried by a Polar order. */
function toOrderEntitlement(order) {
  const safe = order && typeof order === 'object' ? order : {};
  const meta = safe.metadata && typeof safe.metadata === 'object' ? safe.metadata : {};
  const customer = safe.customer && typeof safe.customer === 'object' ? safe.customer : {};
  const product = safe.product && typeof safe.product === 'object' ? safe.product : {};
  return {
    userId: meta.user_id || customer.external_id || null,
    email: customer.email || safe.customer_email || null,
    orderId: safe.id,
    customerId: safe.customer_id || customer.id || null,
    productId: safe.product_id || product.id || null,
    amount: typeof safe.total_amount === 'number' ? safe.total_amount : null,
    currency: safe.currency || null,
    purchasedAt: safe.created_at || new Date().toISOString(),
  };
}

function isPaidOrder(order) {
  if (!order || typeof order !== 'object') return false;
  return order.paid === true || order.status === 'paid' || order.status === 'succeeded';
}

app.get('/api/me', async (req, res) => {
  try {
    const user = await resolveUser(req);
    const entitled = user ? await store.isEntitled(user.id) : false;
    let used = 0;
    if (!entitled) {
      const keys = identityEntries(req, user && user.id).map((e) => e.key);
      used = (await store.getUsage(keys)).used;
    }
    res.json({
      ok: true,
      authenticated: Boolean(user),
      user: user ? { id: user.id, email: user.email, name: user.name } : null,
      entitled,
      limit: FREE_ROOM_LIMIT,
      used,
      remaining: entitled ? null : Math.max(0, FREE_ROOM_LIMIT - used),
    });
  } catch (err) {
    console.error('[api/me]', err.message);
    res.status(500).json({ ok: false, error: 'server_error' });
  }
});

app.post('/api/session', async (req, res) => {
  try {
    // Lifetime access is unlimited; everyone else is metered against their
    // user / device / IP identities.
    const user = await resolveUser(req);
    const entitled = user ? await store.isEntitled(user.id) : false;
    if (!entitled) {
      const entries = identityEntries(req, user && user.id);
      const { allowed, used } = await store.reserveRoom(entries, FREE_ROOM_LIMIT);
      if (!allowed) {
        return res.status(402).json({
          ok: false,
          error: 'limit_reached',
          reason: user ? 'unpaid' : 'anonymous',
          limit: FREE_ROOM_LIMIT,
          used,
        });
      }
    }

    const presetMs = typeof req.body?.presetMs === 'number' ? req.body.presetMs : 5 * 60 * 1000;
    const allowOvertime = !!req.body?.allowOvertime;
    const code = genCode(6);
    const controllerToken = genToken();
    const displayToken = genToken();
    const session = {
      code,
      controllerToken,
      displayToken,
      activeControllerToken: null,
      status: 'idle',
      presetDurationMs: presetMs,
      startTime: null,
      pauseAccumulatedMs: 0,
      lastPausedAt: null,
      allowOvertime,
      clients: { controllers: new Set(), displays: new Set() },
      createdAt: now(),
      expiresAt: now() + SESSION_TTL_MINUTES * 60 * 1000,
    };
    sessions.set(code, session);
    res.json({
      code,
      controllerToken,
      displayToken,
      controlUrl: `/control?code=${code}&token=${controllerToken}`,
      displayUrl: `/display?code=${code}&join=${displayToken}`,
    });
  } catch (err) {
    console.error('[api/session]', err.message);
    res.status(500).json({ ok: false, error: 'server_error' });
  }
});

app.post('/api/checkout', async (req, res) => {
  try {
    const user = await resolveUser(req);
    if (!user) return res.status(401).json({ ok: false, error: 'unauthorized' });
    if (await store.isEntitled(user.id)) {
      return res.json({ ok: true, alreadyEntitled: true });
    }
    const origin = PUBLIC_ORIGIN.replace(/\/$/, '');
    const checkout = await polar.createCheckout({
      user,
      successUrl: `${origin}/control?checkout=success`,
      returnUrl: origin,
    });
    res.json({ ok: true, id: checkout.id, url: checkout.url });
  } catch (err) {
    console.error('[api/checkout]', err.message);
    res.status(502).json({ ok: false, error: 'checkout_unavailable' });
  }
});

app.post('/api/polar/portal', async (req, res) => {
  try {
    const user = await resolveUser(req);
    if (!user) return res.status(401).json({ ok: false, error: 'unauthorized' });
    const customerId = await store.getPolarCustomerId(user.id);
    if (!customerId) return res.status(404).json({ ok: false, error: 'no_customer' });
    const origin = PUBLIC_ORIGIN.replace(/\/$/, '');
    const portal = await polar.createPortalSession({ customerId, returnUrl: origin });
    res.json({ ok: true, url: portal.url });
  } catch (err) {
    console.error('[api/polar/portal]', err.message);
    res.status(502).json({ ok: false, error: 'portal_unavailable' });
  }
});

app.post('/api/polar/webhook', async (req, res) => {
  const secret = process.env.POLAR_WEBHOOK_SECRET || '';
  if (!secret) {
    return res.status(503).json({ ok: false, error: 'Webhook secret not configured' });
  }
  const event = polar.verifyWebhook(req.rawBody, req.headers, secret);
  if (!event) return res.status(401).json({ ok: false, error: 'Invalid signature' });

  const deliveryId = req.get('webhook-id') || event.id || '';
  const type = event.type || 'unknown';
  const data = event.data || {};
  try {
    if (type === 'order.paid' || (type === 'order.created' && isPaidOrder(data))) {
      const entitlement = toOrderEntitlement(data);
      if (!entitlement.userId) {
        console.warn(`[polar] paid order ${entitlement.orderId} is missing user_id metadata`);
      } else {
        await store.grantFromOrder(entitlement);
        console.log(`[polar] granted lifetime access to user ${entitlement.userId} (order ${entitlement.orderId})`);
      }
    } else if (type === 'order.refunded' || (type === 'order.updated' && data.status === 'refunded')) {
      await store.revokeOrder(data.id);
      console.log(`[polar] revoked access for order ${data.id}`);
    }
    const duplicate = deliveryId ? !(await store.recordWebhook(deliveryId, type)) : false;
    res.json({ ok: true, duplicate });
  } catch (err) {
    console.error('[polar] webhook handling failed:', err.message);
    res.status(500).json({ ok: false, error: 'Webhook handling failed' });
  }
});

const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

function send(ws, obj) {
  try { ws.send(JSON.stringify(obj)); } catch {}
}
function broadcast(session, obj) {
  const payload = JSON.stringify(obj);
  for (const id of [...session.clients.controllers, ...session.clients.displays]) {
    const ws = clients.get(id);
    if (ws && ws.readyState === ws.OPEN) {
      try { ws.send(payload); } catch {}
    }
  }
}

const clients = new Map(); // socketId -> ws
let nextId = 1;

function computeState(s) {
  return {
    type: 'state',
    code: s.code,
    status: s.status,
    presetDurationMs: s.presetDurationMs,
    startTime: s.startTime,
    pauseAccumulatedMs: s.pauseAccumulatedMs,
    allowOvertime: s.allowOvertime,
    serverNow: now(),
  };
}

function terminateSession(s) {
  broadcast({ clients: s.clients }, { type: 'error', message: 'Session ended' });
  for (const id of [...s.clients.controllers, ...s.clients.displays]) {
    const ws = clients.get(id);
    if (ws) {
      try { ws.terminate(); } catch {}
    }
  }
}

// Sweep expired sessions so they don't accumulate in memory forever
const ttlSweep = setInterval(() => {
  const cutoff = now();
  for (const [code, s] of sessions) {
    if (s.expiresAt < cutoff) {
      sessions.delete(code);
      terminateSession(s);
    }
  }
}, 60 * 1000);
ttlSweep.unref();

// Clean up intervals on shutdown
server.on('close', () => clearInterval(ttlSweep));

wss.on('connection', (ws) => {
  const socketId = String(nextId++);
  clients.set(socketId, ws);
  let joined = null; // { code, role }

  ws.isAlive = true;
  // Keep the connection alive through proxies (Heroku router drops idle sockets)
  const heartbeat = setInterval(() => {
    if (ws.isAlive === false) {
      ws.terminate();
      return;
    }
    ws.isAlive = false;
    if (ws.readyState === ws.OPEN) ws.ping();
  }, WS_HEARTBEAT_MS);

  ws.on('pong', () => { ws.isAlive = true; });
  ws.on('error', () => {});

  ws.on('message', (data) => {
    let msg;
    try { msg = JSON.parse(data); } catch { return; }
    if (!msg || typeof msg !== 'object') return;

    if (msg.type === 'join') {
      const { role, code, token } = msg;
      const s = sessions.get(String(code || '').toUpperCase());
      if (!s) return send(ws, { type: 'error', message: 'Session not found' });
      if (role === 'controller') {
        if (token !== s.controllerToken) return send(ws, { type: 'error', message: 'Unauthorized' });
        // Allow only one active controller at a time; permit rejoin with the same token
        if (s.activeControllerToken == null || s.clients.controllers.size === 0) {
          s.activeControllerToken = token;
        } else if (token !== s.activeControllerToken) {
          return send(ws, { type: 'error', message: 'Another controller is already connected' });
        }
        s.clients.controllers.add(socketId);
      } else {
        // If a join token is provided (QR flow), it must match this specific session.
        // This prevents stale QR links from attaching if a code is ever reused later.
        if (typeof token === 'string' && token.length > 0 && token !== s.displayToken) {
          return send(ws, { type: 'error', message: 'Invalid or expired QR link' });
        }
        s.clients.displays.add(socketId);
      }
      joined = { code: s.code, role };
      send(ws, { type: 'joined', role, code: s.code, counts: { controllers: s.clients.controllers.size, displays: s.clients.displays.size } });
      send(ws, computeState(s));
      broadcast(s, { type: 'presence', counts: { controllers: s.clients.controllers.size, displays: s.clients.displays.size } });
      return;
    }

    if (msg.type === 'action') {
      if (!joined) return;
      const s = sessions.get(joined.code);
      if (!s) return;
      if (joined.role !== 'controller') return; // read-only displays

      const a = msg.action;
      const p = msg.payload || {};
      const nowMs = now();

      switch (a) {
        case 'start':
          s.status = 'running';
          s.startTime = nowMs;
          s.pauseAccumulatedMs = 0;
          s.lastPausedAt = null;
          break;
        case 'pause':
          if (s.status === 'running') {
            s.status = 'paused';
            s.lastPausedAt = nowMs;
          }
          break;
        case 'resume':
          if (s.status === 'paused' && s.lastPausedAt) {
            s.status = 'running';
            s.pauseAccumulatedMs += nowMs - s.lastPausedAt;
            s.lastPausedAt = null;
          }
          break;
        case 'reset':
          s.status = 'idle';
          s.startTime = null;
          s.pauseAccumulatedMs = 0;
          s.lastPausedAt = null;
          if (typeof p.presetMs === 'number') s.presetDurationMs = p.presetMs;
          break;
        case 'adjust':
          if (typeof p.deltaMs === 'number') s.presetDurationMs = Math.max(0, s.presetDurationMs + p.deltaMs);
          break;
        case 'setDuration':
          if (typeof p.ms === 'number') s.presetDurationMs = Math.max(0, p.ms);
          break;
        case 'setOvertime':
          if (typeof p.value === 'boolean') s.allowOvertime = p.value;
          break;
        case 'end':
          sessions.delete(s.code);
          terminateSession(s);
          return;
        default:
          return;
      }
      if (sessions.has(joined.code)) {
        broadcast(s, computeState(s));
      } else {
        // notify clients session ended
        broadcast({ clients: s.clients }, { type: 'error', message: 'Session ended' });
      }
    }
  });

  ws.on('close', () => {
    clearInterval(heartbeat);
    clients.delete(socketId);
    if (joined) {
      const s = sessions.get(joined.code);
      if (s) {
        s.clients.controllers.delete(socketId);
        s.clients.displays.delete(socketId);
        if (s.clients.controllers.size === 0) {
          s.activeControllerToken = null;
        }
        broadcast(s, { type: 'presence', counts: { controllers: s.clients.controllers.size, displays: s.clients.displays.size } });
      }
    }
  });
});

if (require.main === module) {
  start(PORT)
    .then(() => {
      console.log(`WS/REST server listening on http://localhost:${PORT}`);
    })
    .catch((err) => {
      console.error(`Failed to start server: ${err.message}`);
      process.exit(1);
    });
}

module.exports = { app, server, start, store, FREE_ROOM_LIMIT };

function start(port = PORT) {
  return runMigrations()
    .catch((err) => {
      throw new Error(`database migrations failed: ${err.message}`);
    })
    .then(
      () =>
        new Promise((resolve, reject) => {
          const onError = (err) => {
            server.off('listening', onListening);
            reject(err);
          };
          const onListening = () => {
            server.off('error', onError);
            resolve(server);
          };
          server.once('error', onError);
          server.once('listening', onListening);
          server.listen(port);
        })
    );
}
