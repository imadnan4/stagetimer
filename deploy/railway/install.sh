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
  tmp=$(mktemp -d)
  cd "$tmp"
  curl -fsSL https://nodejs.org/dist/latest-v22.x/ -o idx.html
  f=$(grep -oE 'node-v22\.[0-9]+\.[0-9]+-linux-x64\.tar\.gz' idx.html | head -1)
  curl -fsSL "https://nodejs.org/dist/latest-v22.x/$f" -o node.tgz
  rm -rf /config/node && mkdir -p /config/node
  tar -xzf node.tgz -C /config/node --strip-components=1
  rm -rf /config/node/include /config/node/share/doc /config/node/share/man
  cd / && rm -rf "$tmp"
fi

# 2) Backend code + boot scripts. Stage into app.new so a failed install cannot
#    break the copy that the running backend boots from.
src=$(mktemp -d)
git clone --depth 1 --quiet "$REPO_URL" "$src"
mkdir -p "$BASE"
rm -rf "$BASE/app.new"
cp -r "$src/server" "$BASE/app.new"
cp "$src/deploy/railway/bootstrap.sh" "$src/deploy/railway/nginx-timer.conf" "$BASE/"
chmod +x "$BASE/bootstrap.sh"

# 3) Dependencies, installed against the staged copy; swap it in only on success.
PATH="$NODEBIN:$PATH" sh -c "cd '$BASE/app.new' && npm ci --omit=dev --no-audit --no-fund"
rm -rf "$BASE/app"
mv "$BASE/app.new" "$BASE/app"
rm -rf "$src"

# 4) .env from the service's environment variables. Values are single-quoted
#    because bootstrap.sh sources this file as shell code; values containing a
#    newline cannot be represented safely and are skipped.
: > "$BASE/.env"
for k in NODE_ENV PUBLIC_ORIGIN CORS_ALLOW_ALL SESSION_TTL_MINUTES \
         SESSION_CODE_ALPHABET DATABASE_URL NEON_AUTH_BASE_URL NEON_AUTH_JWKS_URL \
         FREE_ROOM_LIMIT USAGE_HASH_SALT POLAR_SERVER POLAR_ACCESS_TOKEN \
         POLAR_PRODUCT_ID POLAR_ORGANIZATION_ID POLAR_WEBHOOK_SECRET; do
  v=$(printenv "$k" 2>/dev/null || true)
  [ -n "$v" ] || continue
  if [ "$(printf '%s' "$v" | wc -l)" -ne 0 ]; then
    echo "install.sh: skipping $k (value contains a newline)" >&2
    continue
  fi
  esc=$(printf '%s' "$v" | sed "s/'/'\\\\''/g")
  printf "%s='%s'\n" "$k" "$esc" >> "$BASE/.env"
done
printf 'PORT=8787\n' >> "$BASE/.env"
chmod 600 "$BASE/.env"

echo "Setup done. Set the service start command (see README) and redeploy."
