## Stagetimer (Web)

Problem: Live talks and rehearsals slip without a simple, shared clock.
Solution: A zero-setup, browser-based stage timer with one controller and unlimited displays, synchronized in real time.

### What this is
Stagetimer Web is a Next.js app backed by a tiny Express + WebSocket server. A presenter or stage manager creates a session (controller) and others join as displays using a short code. The controller starts/pauses/resets the clock, adjusts time, and toggles overtime while all connected displays stay perfectly in sync.

### Highlights
- Real-time sync via WebSockets 
- One active controller per session; many displays
- 6-character session codes; no accounts, no DB
- Presets, manual minute/second inputs, ±30s adjust
- Overtime toggle and presence counts
- Tailwind CSS v4 styles, React 19, Next.js 15 (App Router)

---

## Quick start

Prerequisites:
- Node.js 18+ (or Bun latest)
- Free ports: 3000 (web) and 8787 (API/WS)
## Stagetimer (Web)

Stagetimer is a browser-based presentation timer with one controller and many displays, synchronized in real time.

## What this app includes
- Next.js 15 app (App Router) for UI routes:
  - `/` create or join
  - `/control` controller view
  - `/display?code=ABC123` display view
- Express + WebSocket backend in `server/server.js`
- Real-time session state sync via WebSocket messages (`join`, `action`, `state`, `presence`, `error`)

## Tech stack
- Next.js 15, React 19, TypeScript
- Tailwind CSS v4
- Express + `ws`

## Local development

Prerequisites:
- Node.js 18+
- Free ports: `3000` (web) and `8787` (API/WS)

Install dependencies:

```bash
npm install
```

Run frontend and backend together:

```bash
npm run dev:all
```

Open `http://localhost:3000`.

## Scripts
- `dev`: Next.js dev server (Turbopack)
- `server`: backend server (`node server/server.js`)
- `dev:all`: run both frontend and backend
- `build`: Next.js production build
- `start`: run Next.js production server

## Environment variables

Use `.env.example` as the source of truth.

Frontend (Netlify build env):
- `NEXT_PUBLIC_API_URL` example: `https://your-backend.railway.app`
- `NEXT_PUBLIC_WS_URL` example: `wss://your-backend.railway.app/ws`

Backend (Railway runtime env):
- `NODE_ENV=production`
- `PUBLIC_ORIGIN=https://your-site.netlify.app`
- `CORS_ALLOW_ALL=0`
- `SESSION_TTL_MINUTES=120`
- `SESSION_CODE_ALPHABET=23456789ABCDEFGHJKMNPQRSTUVWXYZ`
- `PORT=8787` (local fallback; Railway may inject its own `PORT`)

If frontend env vars are not set, the app infers API/WS endpoint from browser host + port `8787`.

## Deployment architecture

This project requires a persistent WebSocket server.

- Frontend: deploy to Netlify
- Backend (`server/server.js`): deploy to Railway

## Deployment runbook (Railway + Netlify CLI)

### 1. Deploy backend to Railway

1. Create a Railway service from this repo.
2. Set start command:

```bash
node server/server.js
```

3. Set Railway variables:
	- `NODE_ENV=production`
	- `PUBLIC_ORIGIN` temporary value (replace after Netlify production URL is final)
	- `CORS_ALLOW_ALL=0`
	- Optional: `SESSION_TTL_MINUTES`, `SESSION_CODE_ALPHABET`
4. Deploy and copy backend URL, for example:
	- `https://your-backend.railway.app`
5. Validate backend:

```bash
curl https://your-backend.railway.app/api/health
```

Expected response includes `{"ok":true}`.

### 2. Install and authenticate Netlify CLI

```bash
npm install -g netlify-cli
netlify login
```

### 3. Initialize and link Netlify site

Run from project root:

```bash
netlify init
```

This links the local project and creates `.netlify/state.json`.

### 4. Set Netlify environment variables

```bash
netlify env:set NEXT_PUBLIC_API_URL https://your-backend.railway.app --context production
netlify env:set NEXT_PUBLIC_WS_URL wss://your-backend.railway.app/ws --context production
```

### 5. Dry-run build and real build

```bash
netlify build --dry
netlify build
```

### 6. Draft deploy first

```bash
netlify deploy --build --alias stagetimer-draft
```

Test full flow on the draft URL:
- create session
- open controller and display
- start/pause/resume/reset/+30s/-30s/end

### 7. Production deploy

```bash
netlify deploy --build --prod
```

### 8. Final CORS alignment

Update Railway backend variable:
- `PUBLIC_ORIGIN=<your-final-netlify-production-url>`

Redeploy Railway (if required by Railway environment update), then re-test one full session.

## Netlify config

The repo includes `netlify.toml` with:
- build command
- Node version for build environment
- local `netlify dev` mapping

## Notes
- This project uses in-memory sessions (no database). Active sessions are lost on backend restart.
- For reliability, use Railway auto-restart and monitor backend logs.

## License
Add your project license (for example MIT). If unspecified, all rights reserved.

