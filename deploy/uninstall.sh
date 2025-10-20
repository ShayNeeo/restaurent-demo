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

echo "[uninstall] Done."

