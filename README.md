# Stagetimer Web

Stagetimer is a browser-based presentation timer with one controller and many
displays, synchronized in real time.

## Architecture

- **Frontend**: Next.js static export (routes: `/`, `/control`, `/display`),
  deployed to Netlify.
- **Backend**: Express + WebSocket server (`server/server.js`), deployed to
  Heroku as a Docker container. This split is required because the app needs a
  persistent WebSocket backend.
- **Database**: Neon Postgres (`app` schema) stores free-tier usage counters and
  lifetime entitlements.
- **Auth**: Neon Managed Better Auth (hosted Better Auth) with Google and
  email/password sign-in. The backend verifies the JWT against the branch JWKS.
- **Payments**: Polar hosts the one-time `$5` "Professional" lifetime product.
  Checkout sessions are created server-side; a signed webhook grants access.

### Access model

Visitors can create **5 free rooms** without an account. Usage is counted
server-side against hashed identities (IP + an anonymous device id, and the user
id once signed in), so clearing local storage or signing in with a fresh account
does not reset the allowance. Once the limit is reached:

- Anonymous users are asked to sign up / sign in.
- Signed-in but unpaid users are asked to buy the one-time lifetime upgrade.
- Users with a lifetime entitlement get unlimited rooms.

The gate lives on `POST /api/session` (the single place a room is created), and
the UI surfaces it on `/control` and every "Start Timer" entry point.

## Tech Stack

- Next.js 15, React 19, TypeScript, Tailwind CSS v4
- Express + `ws`, `pg`, `jose`
- Better Auth (client) + Polar
- Vitest (server + jsdom frontend)
- npm (single package manager — only `package-lock.json` is tracked)

## Local Development

Prerequisites: Node.js 20+, npm, free ports 3000 (frontend) and 8787 (backend).

```bash
npm install
cp .env.example .env.local   # then fill in the values
npm run dev:all              # backend + frontend together
```

`npm run dev:all` loads `.env.local` into the backend automatically (see
`scripts/run-server.js`). Without `DATABASE_URL` the backend falls back to an
in-memory store, so the frontend runs even before you connect Neon.

Open http://localhost:3000.

## Environment Variables

Never commit real values. Set them in the Netlify and Heroku dashboards (or via
CLI); `.env.example` lists the full set.

Frontend (Netlify, Production context) — inlined into the public bundle:

- `NEXT_PUBLIC_API_URL=https://<backend>.herokuapp.com`
- `NEXT_PUBLIC_WS_URL=wss://<backend>.herokuapp.com/ws`
- `NEXT_PUBLIC_NEON_AUTH_URL=https://<branch>.neonauth.<region>.aws.neon.tech/neondb/auth`

Backend (Heroku) — secrets, server-side only:

- `NODE_ENV=production`
- `PUBLIC_ORIGIN=https://<site>.netlify.app`
- `CORS_ALLOW_ALL=0`
- `SESSION_TTL_MINUTES=120`
- `SESSION_CODE_ALPHABET=23456789ABCDEFGHJKMNPQRSTUVWXYZ`
- `DATABASE_URL` — Neon pooled connection string
- `NEON_AUTH_BASE_URL`, `NEON_AUTH_JWKS_URL` — from `neon env pull`
- `FREE_ROOM_LIMIT=5`
- `USAGE_HASH_SALT` — long random string used to hash identities
- `POLAR_SERVER=production`
- `POLAR_ACCESS_TOKEN`, `POLAR_PRODUCT_ID`, `POLAR_ORGANIZATION_ID`
- `POLAR_WEBHOOK_SECRET`
- `PORT` is injected automatically by Heroku

## Neon Auth setup

The project is linked to a Neon branch via `neon.ts` + `.neon` (both safe to
commit). Enable Managed Better Auth and trusted domains from the CLI:

```bash
neon link --project-id <project> --branch production -y
neon neon-auth domain add https://<site>.netlify.app
neon neon-auth oauth-provider add --provider-id google
neon config apply            # applies neon.ts (auth: true)
```

`neon env pull` writes `DATABASE_URL`, `NEON_AUTH_BASE_URL` and
`NEON_AUTH_JWKS_URL` into `.env` (git-ignored).

## Polar setup

1. Create the one-time `$5` product in the Polar dashboard.
2. Create an **organization access token** with `checkouts:write`,
   `customers:read/write`, `customer_sessions:write`, `orders:read`,
   `products:read`, `subscriptions:read`, `benefits:read`.
3. Create a webhook pointing at `https://<backend>.herokuapp.com/api/polar/webhook`
   subscribed to `order.paid`, `order.created` and `order.refunded` (Raw format).
4. Put the token, product id, organization id and webhook secret in the Heroku
   config.

Webhooks are verified with the Standard Webhooks scheme (`webhook-id`,
`webhook-timestamp`, `webhook-signature`) and are idempotent.

## Deployment

### Backend (Heroku, container stack)

```bash
heroku config:set \
  DATABASE_URL=... NEON_AUTH_BASE_URL=... NEON_AUTH_JWKS_URL=... \
  USAGE_HASH_SALT=... POLAR_ACCESS_TOKEN=... POLAR_PRODUCT_ID=... \
  POLAR_WEBHOOK_SECRET=... --app stage-timer-backend
cd server && heroku container:push web --app stage-timer-backend
heroku container:release web --app stage-timer-backend
```

The server runs SQL migrations from `server/migrations/` on startup. Grants and
usage live in Neon, so they survive restarts and scale beyond a single dyno.

> **Docker containerd workaround.** On engines using the containerd image store,
> `heroku container:push` fails with `error from registry: unsupported`. Build
> and save locally, then push with `crane`:
>
> ```bash
> docker build -t registry.heroku.com/stage-timer-backend/web ./server
> docker save registry.heroku.com/stage-timer-backend/web -o /tmp/app.tar
> crane push /tmp/app.tar registry.heroku.com/stage-timer-backend/web
> heroku container:release web --app stage-timer-backend
> ```

### Frontend (Netlify)

Netlify builds `npm run build` and publishes `out/`; the site auto-deploys from
`main`. Production env vars: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_WS_URL`,
`NEXT_PUBLIC_NEON_AUTH_URL`.

## Testing

```bash
npm test              # everything
npm run test:server   # REST, auth gating, Polar webhook verification
npm run test:frontend # libs + components (jsdom)
npx tsc --noEmit
npm run lint
```

Server tests boot the real Express + WebSocket server on an ephemeral port.
Without `DATABASE_URL` they exercise the in-memory store; each test re-imports
the module so state is isolated.

## Troubleshooting

- **Frontend cannot reach the backend** — confirm `NEXT_PUBLIC_API_URL` /
  `NEXT_PUBLIC_WS_URL` use the hashed Heroku URL and `PUBLIC_ORIGIN` matches the
  Netlify production URL.
- **Google sign-in redirects fail** — add the Netlify domain as a Neon Auth
  trusted domain (`neon neon-auth domain list`).
- **Checkout returns 401** — the request must include a valid Neon Auth JWT
  (`Authorization: Bearer`); the frontend fetches it from `/token`.
- **Webhook returns 401** — the signature must be computed with
  `POLAR_WEBHOOK_SECRET` over `${webhook-id}.${webhook-timestamp}.${body}`.

## Notes

- Active timer sessions are in-memory on the backend (restart clears them).
  Usage counters and entitlements are durable in Neon.
- The server sends a WebSocket ping every 30s so Heroku's router does not
  idle-drop connections.
