// Simple no-DB server: REST (+/api/session) and WebSocket (/ws)
const express = require('express');
const http = require('http');
const cors = require('cors');
const { WebSocketServer } = require('ws');

const PORT = process.env.PORT || 8787;
const PUBLIC_ORIGIN = process.env.PUBLIC_ORIGIN || 'http://localhost:3000';
const CORS_ALLOW_ALL = process.env.CORS_ALLOW_ALL === '1' || process.env.NODE_ENV !== 'production';
const SESSION_TTL_MINUTES = Number(process.env.SESSION_TTL_MINUTES || 120);
const ALPHABET = (process.env.SESSION_CODE_ALPHABET || '23456789ABCDEFGHJKMNPQRSTUVWXYZ').split('');

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
app.use(cors({ origin: CORS_ALLOW_ALL ? true : PUBLIC_ORIGIN, credentials: false }));
app.options('*', cors({ origin: CORS_ALLOW_ALL ? true : PUBLIC_ORIGIN, credentials: false }));
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.post('/api/session', (req, res) => {
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

wss.on('connection', (ws) => {
  const socketId = String(nextId++);
  clients.set(socketId, ws);
  let joined = null; // { code, role }

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
          break;
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

server.listen(PORT, () => {
  console.log(`WS/REST server listening on http://localhost:${PORT}`);
});
