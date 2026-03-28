# Stagetimer Web

Stagetimer is a browser-based presentation timer with one controller and many displays, synchronized in real time.

## Architecture

- Frontend: Next.js app (routes: /, /control, /display)
- Backend: Express + WebSocket server in server/server.js
- Deployment model:
	- Frontend on Netlify
	- Backend on Railway

This split is required because the app needs a persistent WebSocket backend.

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

Do not upload .env files to Netlify or Railway.
Set variables in each platform dashboard (or via CLI).

Use .env.example as reference values.

Frontend variables (Netlify, Production context):

- NEXT_PUBLIC_API_URL=https://your-backend.railway.app
- NEXT_PUBLIC_WS_URL=wss://your-backend.railway.app/ws

Backend variables (Railway service variables):

- NODE_ENV=production
- PUBLIC_ORIGIN=https://your-site.netlify.app
- CORS_ALLOW_ALL=0
- SESSION_TTL_MINUTES=120
- SESSION_CODE_ALPHABET=23456789ABCDEFGHJKMNPQRSTUVWXYZ
- PORT=8787 (local fallback; Railway may inject PORT automatically)

## Easy Deployment Guide (Open Source Friendly)

### Step 1: Deploy backend to Railway

1. Create a new Railway project.
2. Add a service connected to this GitHub repository.
3. In service settings, set:
	 - Build Command: echo "skip frontend build for backend service"
	 - Start Command: pnpm run server
4. Add backend environment variables listed above.
5. Generate a public Railway domain for the service.
6. Verify health endpoint:

```bash
curl https://your-backend.railway.app/api/health
```

Expected response:

```json
{"ok":true}
```

### Step 2: Deploy frontend to Netlify

1. Create a Netlify site from this GitHub repository.
2. Build settings:
	 - Build command: pnpm run build
	 - Publish directory: .next
	 - Node version: 20
3. Add frontend environment variables in Netlify Production context:
	 - NEXT_PUBLIC_API_URL=https://your-backend.railway.app
	 - NEXT_PUBLIC_WS_URL=wss://your-backend.railway.app/ws
4. Trigger a production deploy.

### Step 3: Final CORS alignment

After Netlify gives you the final production URL:

1. Update Railway backend variable:
	 - PUBLIC_ORIGIN=https://your-final-site.netlify.app
2. Redeploy backend service.
3. Redeploy frontend so all values are in sync.

### Step 4: End-to-end test

1. Open frontend home page.
2. Create a controller session.
3. Join display with session code.
4. Test start, pause, resume, reset, +30s, -30s, and end session.

## Optional CLI Commands

Netlify:

```bash
pnpm --package=netlify-cli dlx netlify login
pnpm --package=netlify-cli dlx netlify init
pnpm --package=netlify-cli dlx netlify env:set NEXT_PUBLIC_API_URL https://your-backend.railway.app --context production
pnpm --package=netlify-cli dlx netlify env:set NEXT_PUBLIC_WS_URL wss://your-backend.railway.app/ws --context production
pnpm --package=netlify-cli dlx netlify deploy --trigger --prod
```

Railway:

```bash
pnpm --package=@railway/cli dlx railway login
pnpm --package=@railway/cli dlx railway init -n stagetimer-backend
pnpm --package=@railway/cli dlx railway variable set NODE_ENV=production PUBLIC_ORIGIN=https://your-site.netlify.app CORS_ALLOW_ALL=0 SESSION_TTL_MINUTES=120 SESSION_CODE_ALPHABET=23456789ABCDEFGHJKMNPQRSTUVWXYZ
pnpm --package=@railway/cli dlx railway domain
```

## Troubleshooting

- Error: Cannot install with frozen lockfile
	- Run pnpm install locally and commit updated pnpm-lock.yaml.

- Netlify blocked Next.js due CVE policy
	- Upgrade next and eslint-config-next to a patched release, then redeploy.

- Frontend cannot connect to backend
	- Confirm NEXT_PUBLIC_API_URL and NEXT_PUBLIC_WS_URL on Netlify.
	- Confirm PUBLIC_ORIGIN on Railway matches Netlify production URL.

## Notes

- Sessions are in-memory (no database): restarting backend clears active sessions.
- For production reliability, enable auto-restart and monitor Railway logs.

