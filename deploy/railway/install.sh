#!/bin/sh
# One-shot setup for the StageTimer backend on a Railway linuxserver/webtop
# service. Run it INSIDE the container (after setting the service env vars):
#
#   railway link
#   railway ssh -- sh -s < deploy/railway/install.sh
#
# It installs Node 22 and the server code onto the /config volume and writes
# /config/stagetimer/.env from the service's environment variables, so secrets
# never live in the repository. Re-running it is safe.
set -e
REPO_URL="${REPO_URL:-https://github.com/imadnan4/stagetimer.git}"
BASE=/config/stagetimer
NODEBIN=/config/node/bin

# 1) Node 22 onto the volume (survives restarts and redeploys).
if [ ! -x "$NODEBIN/node" ]; then
  cd /tmp
  curl -fsSL https://nodejs.org/dist/latest-v22.x/ -o idx.html
  f=$(grep -oE 'node-v22\.[0-9]+\.[0-9]+-linux-x64\.tar\.gz' idx.html | head -1)
  curl -fsSL "https://nodejs.org/dist/latest-v22.x/$f" -o node.tgz
  rm -rf /config/node && mkdir -p /config/node
  tar -xzf node.tgz -C /config/node --strip-components=1
  rm -rf /config/node/include /config/node/share/doc /config/node/share/man
fi

# 2) Backend code + boot scripts.
rm -rf /tmp/stagetimer
git clone --depth 1 --quiet "$REPO_URL" /tmp/stagetimer
mkdir -p "$BASE"
rm -rf "$BASE/app"
cp -r /tmp/stagetimer/server "$BASE/app"
cp /tmp/stagetimer/deploy/railway/bootstrap.sh /tmp/stagetimer/deploy/railway/nginx-timer.conf "$BASE/"
chmod +x "$BASE/bootstrap.sh"

# 3) Dependencies.
PATH="$NODEBIN:$PATH" sh -c "cd '$BASE/app' && npm ci --omit=dev --no-audit --no-fund"

# 4) .env from the service's environment variables.
: > "$BASE/.env"
for k in NODE_ENV PUBLIC_ORIGIN CORS_ALLOW_ALL SESSION_TTL_MINUTES \
         SESSION_CODE_ALPHABET DATABASE_URL NEON_AUTH_BASE_URL NEON_AUTH_JWKS_URL \
         FREE_ROOM_LIMIT USAGE_HASH_SALT POLAR_SERVER POLAR_ACCESS_TOKEN \
         POLAR_PRODUCT_ID POLAR_ORGANIZATION_ID POLAR_WEBHOOK_SECRET; do
  v=$(printenv "$k" 2>/dev/null || true)
  [ -n "$v" ] && printf '%s=%s\n' "$k" "$v" >> "$BASE/.env"
done
printf 'PORT=8787\n' >> "$BASE/.env"
chmod 600 "$BASE/.env"

echo "Setup done. Set the service start command (see README) and redeploy."
