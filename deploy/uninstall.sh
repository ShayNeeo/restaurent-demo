#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

stop_if_running() {
  local pidfile="$1"
  local name="$2"
  if [ -f "$pidfile" ]; then
    PID=$(cat "$pidfile" || true)
    if [ -n "${PID:-}" ] && ps -p "$PID" > /dev/null 2>&1; then
      echo "[uninstall] Stopping $name (pid=$PID)"
      kill "$PID" || true
    fi
    rm -f "$pidfile"
  fi
}

stop_if_running "$ROOT_DIR/.backend.pid" "backend"
stop_if_running "$ROOT_DIR/.frontend.pid" "frontend"

# Extra cleanup: kill by process name/port if pid files are missing/stale
if command -v pkill >/dev/null 2>&1; then
  pkill -f "restaurent-backend" 2>/dev/null || true
  pkill -f "node .*dist/server.js" 2>/dev/null || true
  pkill -f "next start" 2>/dev/null || true
  pkill -f "node .*next/dist/bin/next" 2>/dev/null || true
fi

if command -v ss >/dev/null 2>&1; then
  # Kill anything bound to port 5173 (frontend)
  PIDS=$(ss -lntp | awk '/:5173 /{print $7}' | sed 's/users:(//' | sed 's/)//' | sed 's/\"//g' | tr ',' '\n' | sed -n 's/^pid=\([0-9]\+\).*$/\1/p' | sort -u)
  for P in $PIDS; do
    kill "$P" 2>/dev/null || true
  done
fi

echo "[uninstall] Done."

