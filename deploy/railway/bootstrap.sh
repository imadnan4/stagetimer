#!/bin/sh
# StageTimer bootstrap for the Railway "desktop" (linuxserver/webtop) service.
# It is injected into the service start command, so it runs before /init on
# every container boot. All state lives on the /config volume.
BASE=/config/stagetimer
NODEBIN=/config/node/bin
mkdir -p "$BASE/logs"

# 1) Add the /timer proxy locations to the webtop nginx *template*. The template
#    is regenerated on every boot (that is how the base command adds the
#    /railway-healthz route), so mirroring that keeps /timer durable too.
D=/defaults/default.conf
if [ -f "$D" ] && ! grep -q "location /timer" "$D" 2>/dev/null; then
  sed -i '\|listen \[::\]:3000 default_server;|r '"$BASE"'/nginx-timer.conf' "$D"
fi

# 2) Start the backend (background; restarts on exit).
if [ -x "$NODEBIN/node" ] && [ -f "$BASE/.env" ]; then
  (
    cd "$BASE/app" || exit 0
    set -a
    . "$BASE/.env"
    set +a
    export PATH="$NODEBIN:$PATH"
    while true; do
      "$NODEBIN/node" server.js >> "$BASE/logs/backend.log" 2>&1
      echo "[boot] backend exited, restarting in 5s" >> "$BASE/logs/backend.log"
      sleep 5
    done
  ) &
fi
