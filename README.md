# Stagetimer Web

Stagetimer is a browser-based presentation timer with one controller and many displays, synchronized in real time.

## Architecture

- Frontend: Next.js app (routes: /, /control, /display)
- Backend: Express + WebSocket server in server/server.js
- Deployment model:
	- Frontend on Netlify (static export)
	- Backend on Heroku (Docker container)

This split is required because the app needs a persistent WebSocket backend.

## Donations

"Support the Creator" button (home page) uses a Lemon Squeezy checkout overlay (lemon.js). Backend exposes `POST /api/lemon/webhook` which verifies the `X-Signature` HMAC-SHA256 header against `LEMON_SQUEEZY_WEBHOOK_SECRET` and tallies `order_created`/`order_refunded` events in memory (`GET /api/donations`).

## Tech Stack

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS v4
- Express + ws
- pnpm

## Local Development

Prerequisites:

- Node.js 20+
- pnpm
- Free ports: 3000 (frontend) and 8787 (backend)

Install dependencies:

```bash
pnpm install
```

Run frontend and backend together:

```bash
pnpm run dev:all
```

Open:

- http://localhost:3000

## Environment Variables

Do not upload .env files to Netlify or Heroku.
Set variables in each platform dashboard (or via CLI).

Use .env.example as reference values.

Frontend variables (Netlify, Production context):

- NEXT_PUBLIC_API_URL=https://your-backend.herokuapp.com
- NEXT_PUBLIC_WS_URL=wss://your-backend.herokuapp.com/ws
- NEXT_PUBLIC_LEMON_SQUEEZY_CHECKOUT_URL=https://your-store.lemonsqueezy.com/checkout/buy/VARIANT_ID

Backend variables (Heroku):

- NODE_ENV=production
- PUBLIC_ORIGIN=https://your-site.netlify.app
- CORS_ALLOW_ALL=0
- SESSION_TTL_MINUTES=120
- SESSION_CODE_ALPHABET=23456789ABCDEFGHJKMNPQRSTUVWXYZ
- LEMON_SQUEEZY_WEBHOOK_SECRET=<signing secret from the Lemon Squeezy dashboard>
- PORT is injected automatically by Heroku

## Easy Deployment Guide

### Step 1: Deploy backend to Heroku

Prerequisites: Heroku CLI logged in (`heroku login`), Docker available.

1. Create the app (new apps get a hashed `https://<name>-<hash>.herokuapp.com` URL — use that URL everywhere):
   - `heroku create stage-timer-backend --region us`
2. Switch to the container stack:
   - `heroku stack:set container --app stage-timer-backend`
3. Set backend environment variables (from the list above).
4. Build and push the Docker image from server/:
   - `cd server && heroku container:push web --app stage-timer-backend`
5. Release:
   - `heroku container:release web --app stage-timer-backend`
6. Verify health endpoint:

```bash
curl https://your-app-<hash>.herokuapp.com/api/health
```

Expected response:

```json
{"ok":true}
```

Notes:

- The Docker daemon's containerd image store breaks `heroku container:push` with `error from registry: unsupported`. Workaround: `docker save` the image, then push with `crane push` (go-containerregistry) using the Heroku registry credentials from `~/.docker/config.json`, then `heroku container:release web`.
- The server is single-dyno / demo-oriented by design: sessions, donation totals, and webhook dedup state live in memory and reset on every restart. Do not scale to multiple dynos without moving this state to shared durable storage. Eco dynos sleep after ~30 minutes of inactivity, which also wakes the in-memory state fresh.
- The server sends a WebSocket ping every 30s so Heroku's router does not idle-drop connections.
- Webhooks registered in Lemon Squeezy must point to the hashed app URL, e.g. `https://stage-timer-backend-9a2d3f8dcbec.herokuapp.com/api/lemon/webhook`.

### Step 2: Deploy frontend to Netlify

1. Create a Netlify site from this GitHub repository.
2. Build settings:
	 - Build command: pnpm run build
	 - Publish directory: out
	 - Node version: 20
3. Add Netlify environment variable:
	 - NETLIFY_NEXT_PLUGIN_SKIP=true
4. Add frontend environment variables in Netlify Production context:
	 - NEXT_PUBLIC_API_URL=https://your-backend-<hash>.herokuapp.com
	 - NEXT_PUBLIC_WS_URL=wss://your-backend-<hash>.herokuapp.com/ws
	 - NEXT_PUBLIC_LEMON_SQUEEZY_CHECKOUT_URL=https://your-store.lemonsqueezy.com/checkout/buy/VARIANT_ID
5. Trigger a production deploy.

### Step 3: Final CORS alignment

1. Update Heroku backend variable:
	 - PUBLIC_ORIGIN=https://your-final-site.netlify.app
2. Redeploy backend service.
3. Redeploy frontend so all values are in sync.

### Step 4: End-to-end test

1. Open frontend home page.
2. Create a controller session.
3. Join display with session code.
4. Test start, pause, resume, reset, +30s, -30s, and end session.
5. Test the "Support the Creator" overlay checkout (use Lemon Squeezy test mode first).

## Optional CLI Commands

Netlify:

```bash
pnpm --package=netlify-cli dlx netlify login
pnpm --package=netlify-cli dlx netlify init
pnpm --package=netlify-cli dlx netlify env:set NETLIFY_NEXT_PLUGIN_SKIP true --context production
pnpm --package=netlify-cli dlx netlify env:set NEXT_PUBLIC_API_URL https://your-backend-<hash>.herokuapp.com --context production
pnpm --package=netlify-cli dlx netlify env:set NEXT_PUBLIC_WS_URL wss://your-backend-<hash>.herokuapp.com/ws --context production
pnpm --package=netlify-cli dlx netlify env:set NEXT_PUBLIC_LEMON_SQUEEZY_CHECKOUT_URL https://your-store.lemonsqueezy.com/checkout/buy/<id>?embed=1 --context production
NEXT_PUBLIC_API_URL=... NEXT_PUBLIC_WS_URL=... NEXT_PUBLIC_LEMON_SQUEEZY_CHECKOUT_URL=... pnpm run build
pnpm --package=netlify-cli dlx netlify deploy --prod --no-build --dir out
```

Heroku:

```bash
heroku create stage-timer-backend --region us
heroku stack:set container --app stage-timer-backend
heroku config:set NODE_ENV=production PUBLIC_ORIGIN=https://your-site.netlify.app CORS_ALLOW_ALL=0 SESSION_TTL_MINUTES=120 SESSION_CODE_ALPHABET=23456789ABCDEFGHJKMNPQRSTUVWXYZ --app stage-timer-backend
heroku config:set LEMON_SQUEEZY_WEBHOOK_SECRET --prompt --app stage-timer-backend
cd server && heroku container:push web --app stage-timer-backend && heroku container:release web --app stage-timer-backend
heroku logs --tail --app stage-timer-backend
```

## CodeRabbit (local reviews before commit)

The CodeRabbit CLI (`cr`) reviews local git changes before they are committed. It is already installed and authenticated (`coderabbit auth status`).

Quick usage:

```bash
cr review --agent -t uncommitted   # review staged + local edits, structured JSON
cr review --agent --base develop   # review everything vs the empty develop baseline
cr doctor                          # diagnose install/auth/git issues
```

For a full-repo review (baseline vs empty `develop` branch, which the CLI's
three-dot diff cannot do directly because there is no merge base), use a
worktree sandbox:

```bash
git worktree add /tmp/cr-wt develop
rsync -a --exclude node_modules --exclude .git --exclude out --exclude .next --exclude .netlify . /tmp/cr-wt/
cd /tmp/cr-wt
setsid nohup cr review --agent --include-untracked > /tmp/cr-review.json 2>/tmp/cr-review.err < /dev/null &
```

Reviews take 7-30+ minutes for a full repo; run them in the background.

## Testing (Vitest)

Unit + integration tests live in `tests/` (server tests in `tests/server/`,
frontend/component tests in `tests/frontend/`). Server tests boot the real
Express + WebSocket server on an ephemeral port (see `server/server.js`, which
exports `app`/`start` and only listens when run directly).

```bash
npm test            # run everything
npm run test:watch  # watch mode
npm run test:server   # REST + webhook HMAC + WebSocket flows
npm run test:frontend # libs + components (jsdom)
```

Covered so far: webhook HMAC validation (valid/invalid signatures, malformed
totals, missing secret), donation tallies and refunds, session creation,
WebSocket join/auth/role/end flows, `formatDuration`, session link building and
QR-scan parsing, API/WS URL fallbacks, and the Support (Lemon Squeezy) button
overlay lifecycle.

## Troubleshooting

- Netlify blocked Next.js due CVE policy
	- Upgrade next and eslint-config-next to a patched release, then redeploy.

- Frontend cannot connect to backend
	- Confirm NEXT_PUBLIC_API_URL and NEXT_PUBLIC_WS_URL on Netlify use the hashed Heroku app URL (new apps no longer resolve at `<name>.herokuapp.com`).
	- Confirm PUBLIC_ORIGIN on Heroku matches Netlify production URL.

- `error from registry: unsupported` on `heroku container:push`
	- Docker containerd image store incompatibility; push with `crane` instead (see notes in Step 1).

- Webhook returns 401 in Heroku logs
	- The X-Signature header must be computed with the exact same secret as LEMON_SQUEEZY_WEBHOOK_SECRET, over the raw request body.

- Lemon Squeezy webhooks not firing
	- Test-mode webhooks only fire for test-mode orders; recreate/update the webhook after disabling test mode.
	- `next/font` fails to fetch Google Fonts in some environments: the fonts are self-hosted in src/app/fonts/, so remove that workaround only if you have network access during builds.

## Notes

- Sessions are in-memory (no database): restarting backend clears active sessions.
- Donation tallies are in-memory too: restarting clears /api/donations.
- For production reliability, enable auto-restart and monitor Heroku logs.

