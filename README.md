# Stagetimer Web

Stagetimer is a browser-based presentation timer with one controller and many displays, synchronized in real time.

## Architecture

- Frontend: Next.js app (routes: /, /control, /display)
- Backend: Express + WebSocket server in server/server.js
- Deployment model:
	- Frontend on Netlify (static export)
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

1. Login and create/link a Railway project from this repo.
2. Create and link a backend service (required before setting variables):
	 - `pnpm --package=@railway/cli dlx railway add --service stagetimer-backend-api`
	 - Choose `Empty Service` when prompted.
3. Set backend environment variables listed above.
4. Deploy only the backend folder:
	 - `pnpm --package=@railway/cli dlx railway up server --path-as-root -d`
5. Generate a public Railway domain for the linked service.
6. Verify health endpoint:

```bash
curl https://your-backend.railway.app/api/health
```

Expected response:

```json
{"ok":true}
```

Notes:

- If you use Railway CLI through `pnpm dlx`, continue using `pnpm --package=@railway/cli dlx railway ...` for all commands. Running plain `railway ...` will fail unless Railway is globally installed.
- `railway variable set` requires a linked service. If you see `No service linked`, run `railway add --service ...` (or `railway service link ...`) first.
- Deploying with `railway up server --path-as-root` avoids building the frontend in Railway.

### Step 2: Deploy frontend to Netlify

1. Create a Netlify site from this GitHub repository.
2. Build settings:
	 - Build command: pnpm run build
	 - Publish directory: out
	 - Node version: 20
3. Add Netlify environment variable:
	 - NETLIFY_NEXT_PLUGIN_SKIP=true
4. Add frontend environment variables in Netlify Production context:
	 - NEXT_PUBLIC_API_URL=https://your-backend.railway.app
	 - NEXT_PUBLIC_WS_URL=wss://your-backend.railway.app/ws
5. Trigger a production deploy.

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
pnpm --package=netlify-cli dlx netlify env:set NETLIFY_NEXT_PLUGIN_SKIP true --context production
pnpm --package=netlify-cli dlx netlify env:set NEXT_PUBLIC_API_URL https://your-backend.railway.app --context production
pnpm --package=netlify-cli dlx netlify env:set NEXT_PUBLIC_WS_URL wss://your-backend.railway.app/ws --context production
NEXT_PUBLIC_API_URL=https://your-backend.railway.app NEXT_PUBLIC_WS_URL=wss://your-backend.railway.app/ws pnpm run build
pnpm --package=netlify-cli dlx netlify deploy --prod --no-build --dir out
```

Railway:

```bash
pnpm --package=@railway/cli dlx railway login
pnpm --package=@railway/cli dlx railway init -n stagetimer-backend
pnpm --package=@railway/cli dlx railway add --service stagetimer-backend-api
pnpm --package=@railway/cli dlx railway service link stagetimer-backend-api
pnpm --package=@railway/cli dlx railway variable set NODE_ENV=production PUBLIC_ORIGIN=https://your-site.netlify.app CORS_ALLOW_ALL=0 SESSION_TTL_MINUTES=120 SESSION_CODE_ALPHABET=23456789ABCDEFGHJKMNPQRSTUVWXYZ
pnpm --package=@railway/cli dlx railway up server --path-as-root -d
pnpm --package=@railway/cli dlx railway service status
pnpm --package=@railway/cli dlx railway domain
curl https://your-backend.railway.app/api/health
```

If `railway up server --path-as-root` fails with a Dockerfile parse error from a Windows-mounted path (`/mnt/c/...`), deploy from a Linux temp directory:

```bash
TMP_DIR=/tmp/stagetimer-backend-deploy
rm -rf "$TMP_DIR" && mkdir -p "$TMP_DIR"
cp /mnt/c/Users/<you>/path/to/repo/server/Dockerfile /mnt/c/Users/<you>/path/to/repo/server/package.json /mnt/c/Users/<you>/path/to/repo/server/server.js "$TMP_DIR"/
cd "$TMP_DIR"
pnpm --package=@railway/cli dlx railway up . --path-as-root -d -p <PROJECT_ID> -e production -s stagetimer-backend-api
```

## Troubleshooting

- Error: Cannot install with frozen lockfile
	- Run pnpm install locally and commit updated pnpm-lock.yaml.

- Netlify blocked Next.js due CVE policy
	- Upgrade next and eslint-config-next to a patched release, then redeploy.

- Frontend cannot connect to backend
	- Confirm NEXT_PUBLIC_API_URL and NEXT_PUBLIC_WS_URL on Netlify.
	- Confirm PUBLIC_ORIGIN on Railway matches Netlify production URL.

- Railway error: `No service linked`
	- Create/link a service first: `pnpm --package=@railway/cli dlx railway add --service stagetimer-backend-api`.
	- Then rerun `pnpm --package=@railway/cli dlx railway variable set ...`.

- Shell error: `zsh: command not found: railway`
	- Use `pnpm --package=@railway/cli dlx railway ...` unless Railway CLI is installed globally.

- Railway build error: `Dockerfile parse error on line 1: unknown instruction`
	- If deploying from `/mnt/c/...`, retry from a Linux temp directory using the fallback commands above.

- Site returns "Internal Server Error" on Netlify
	- If the site was deployed as SSR/runtime and crashes in `___netlify-server-handler`, switch to static export deployment (`out`) and deploy that output.
	- Ensure `NETLIFY_NEXT_PLUGIN_SKIP=true` in production environment.

## Notes

- Sessions are in-memory (no database): restarting backend clears active sessions.
- For production reliability, enable auto-restart and monitor Railway logs.

