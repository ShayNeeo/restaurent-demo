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
  
  # Kill anything bound to port 8080 (backend)
  PIDS=$(ss -lntp | awk '/:8080 /{print $7}' | sed 's/users:(//' | sed 's/)//' | sed 's/\"//g' | tr ',' '\n' | sed -n 's/^pid=\([0-9]\+\).*$/\1/p' | sort -u)
  for P in $PIDS; do
    kill "$P" 2>/dev/null || true
  done
  
  # Kill anything bound to port 3000 (alternative frontend)
  PIDS=$(ss -lntp | awk '/:3000 /{print $7}' | sed 's/users:(//' | sed 's/)//' | sed 's/\"//g' | tr ',' '\n' | sed -n 's/^pid=\([0-9]\+\).*$/\1/p' | sort -u)
  for P in $PIDS; do
    kill "$P" 2>/dev/null || true
  done
fi

# Clean up build artifacts
echo "[uninstall] Cleaning up build artifacts..."
if [ -d "$ROOT_DIR/backend/target" ]; then
  echo "[uninstall] Removing backend target directory..."
  rm -rf "$ROOT_DIR/backend/target"
fi

if [ -d "$ROOT_DIR/frontend/.next" ]; then
  echo "[uninstall] Removing frontend .next directory..."
  rm -rf "$ROOT_DIR/frontend/.next"
fi

if [ -d "$ROOT_DIR/frontend/node_modules" ]; then
  echo "[uninstall] Removing frontend node_modules..."
  rm -rf "$ROOT_DIR/frontend/node_modules"
fi

if [ -d "$ROOT_DIR/backend/node_modules" ]; then
  echo "[uninstall] Removing backend node_modules..."
  rm -rf "$ROOT_DIR/backend/node_modules"
fi

# Clean up database (optional - ask for confirmation)
if [ -d "$ROOT_DIR/backend/data" ]; then
  read -p "[uninstall] Remove database files? (y/N) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "[uninstall] Removing database directory..."
    rm -rf "$ROOT_DIR/backend/data"
  fi
fi

# Clean up environment files (optional - ask for confirmation)
if [ -f "$ROOT_DIR/backend/.env" ]; then
  read -p "[uninstall] Remove backend .env file? (y/N) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "[uninstall] Removing backend .env file..."
    rm -f "$ROOT_DIR/backend/.env"
  fi
fi

if [ -f "$ROOT_DIR/frontend/.env.local" ]; then
  read -p "[uninstall] Remove frontend .env.local file? (y/N) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "[uninstall] Removing frontend .env.local file..."
    rm -f "$ROOT_DIR/frontend/.env.local"
  fi
fi

echo ""
echo "✅ [uninstall] Uninstall complete!"
echo ""
echo "📝 To reinstall, run:"
echo "  bash deploy/setup.sh"
