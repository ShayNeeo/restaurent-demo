#!/usr/bin/env bash
set -euo pipefail

# Install and start the project (frontend + backend) on a Linux server.
# If running on Debian (apt), this script will attempt to install prerequisites automatically:
# - Node.js 20.x + npm
# - Rust (stable) via rustup
# - SQLite3 + headers, build tools, OpenSSL CLI

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo "[install] Using root: $ROOT_DIR"

APT_AVAILABLE=false
if command -v apt-get >/dev/null 2>&1; then
  APT_AVAILABLE=true
fi

# Use sudo if not root for apt actions
SUDO=""
if [ "$(id -u)" -ne 0 ]; then
  if command -v sudo >/dev/null 2>&1; then
    SUDO="sudo"
  fi
fi

ensure_prereqs() {
  if [ "$APT_AVAILABLE" = true ]; then
    echo "[install] apt detected - installing prerequisites"
    $SUDO apt-get update -y
    DEBIAN_FRONTEND=noninteractive $SUDO apt-get install -y \
      ca-certificates curl gnupg \
      build-essential pkg-config \
      sqlite3 libsqlite3-dev \
      openssl

    # Ensure Node.js 20.x
    NODE_OK=false
    if command -v node >/dev/null 2>&1; then
      NODE_MAJ="$(node -v | sed 's/^v//' | cut -d. -f1)"
      if [ "${NODE_MAJ:-0}" -ge 20 ]; then NODE_OK=true; fi
    fi
    if [ "$NODE_OK" = false ]; then
      echo "[install] Installing Node.js 20.x from NodeSource"
      $SUDO bash -c "curl -fsSL https://deb.nodesource.com/setup_20.x | bash -"
      DEBIAN_FRONTEND=noninteractive $SUDO apt-get install -y nodejs
    fi
  else
    echo "[install] apt not detected - please ensure Node 20+, Rust, SQLite3, OpenSSL are installed"
  fi

  # Ensure Rust toolchain
  if ! command -v cargo >/dev/null 2>&1; then
    echo "[install] Installing Rust (rustup)"
    curl https://sh.rustup.rs -sSf | sh -s -- -y
    # shellcheck disable=SC1090
    source "$HOME/.cargo/env"
    export PATH="$HOME/.cargo/bin:$PATH"
  else
    # shellcheck disable=SC1090
    source "$HOME/.cargo/env" 2>/dev/null || true
    export PATH="$HOME/.cargo/bin:$PATH"
  fi
}

ensure_prereqs

cd "$ROOT_DIR/frontend"
if [ ! -f .env ]; then
  echo "PORT=5173" > .env
  echo "BACKEND_URL=http://127.0.0.1:8080" >> .env
  # HTTPS envs optionally filled later if certs generated
  # FRONTEND_HTTPS=1
  # FRONTEND_SSL_CERT_PATH=
  # FRONTEND_SSL_KEY_PATH=
fi
echo "[install] Installing frontend deps..."
npm install
echo "[install] Building client bundle..."
npm run build

cd "$ROOT_DIR/backend"
if [ ! -f .env ]; then
  echo "DATABASE_URL=sqlite://./app.db" > .env
  echo "JWT_SECRET=$(openssl rand -hex 16 || echo dev_secret)" >> .env
  echo "APP_URL=http://localhost:5173" >> .env
  echo "# STRIPE_SECRET_KEY=sk_test_xxx" >> .env
  echo "# STRIPE_WEBHOOK_SECRET=whsec_xxx" >> .env
  echo "SMTP_HOST=smtp-relay.brevo.com" >> .env
  echo "SMTP_PORT=587" >> .env
  echo "# SMTP_USERNAME=your_brevo_username" >> .env
  echo "# SMTP_PASSWORD=your_brevo_password" >> .env
  echo "SMTP_FROM=Your Name <no-reply@example.com>" >> .env
  echo "# PayPal (Sandbox by default)" >> .env
  echo "# PAYPAL_CLIENT_ID=your_paypal_client_id" >> .env
  echo "# PAYPAL_SECRET=your_paypal_secret" >> .env
  echo "# PAYPAL_API_BASE=https://api-m.sandbox.paypal.com" >> .env
  echo "# PAYPAL_WEBHOOK_ID=your_paypal_webhook_id" >> .env
fi
echo "[install] Building backend..."
cargo build --release

CERT_DIR="$ROOT_DIR/certs"
if [ -n "${DOMAIN:-}" ] && [ -n "${ADMIN_EMAIL:-}" ]; then
  mkdir -p "$CERT_DIR"
  CRT="$CERT_DIR/${DOMAIN}.crt"
  KEY="$CERT_DIR/${DOMAIN}.key"
  if [ ! -f "$CRT" ] || [ ! -f "$KEY" ]; then
    echo "[install] Generating self-signed cert for $DOMAIN"
    openssl req -x509 -nodes -days 825 -newkey rsa:2048 \
      -keyout "$KEY" -out "$CRT" \
      -subj "/C=US/ST=State/L=City/O=SelfSigned/OU=IT/CN=$DOMAIN/emailAddress=$ADMIN_EMAIL" \
      -addext "subjectAltName=DNS:$DOMAIN,IP:127.0.0.1"
  fi
  # Update frontend env for HTTPS
  if ! grep -q '^FRONTEND_HTTPS=' "$ROOT_DIR/frontend/.env" 2>/dev/null; then
    echo "FRONTEND_HTTPS=1" >> "$ROOT_DIR/frontend/.env"
    echo "FRONTEND_SSL_CERT_PATH=$CRT" >> "$ROOT_DIR/frontend/.env"
    echo "FRONTEND_SSL_KEY_PATH=$KEY" >> "$ROOT_DIR/frontend/.env"
  fi
fi

echo "[install] Starting backend (detached)..."
nohup "$ROOT_DIR/backend/target/release/restaurent-backend" > "$ROOT_DIR/.backend.log" 2>&1 & echo $! > "$ROOT_DIR/.backend.pid"

echo "[install] Starting frontend (detached)..."
nohup node "$ROOT_DIR/frontend/dist/server.js" > "$ROOT_DIR/.frontend.log" 2>&1 & echo $! > "$ROOT_DIR/.frontend.pid"

echo "[install] Done. PIDs: backend=$(cat "$ROOT_DIR/.backend.pid"), frontend=$(cat "$ROOT_DIR/.frontend.pid")"

