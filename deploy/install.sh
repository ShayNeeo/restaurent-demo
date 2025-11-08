#!/usr/bin/env bash
set -euo pipefail

# Install and start the project (frontend + backend) on a Linux server.
# If running on Debian (apt), this script will attempt to install prerequisites automatically:
# - Node.js 20.x + npm
# - Rust (stable) via rustup
# - SQLite3 + headers, build tools, OpenSSL CLI

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
FRONTEND_PORT="${FRONTEND_PORT:-5173}"

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
      openssl libssl-dev

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

  # Ensure sqlx-cli is installed for database migrations
  if ! command -v sqlx >/dev/null 2>&1; then
    echo "[install] Installing sqlx-cli for database migrations"
    cargo install sqlx-cli --no-default-features --features sqlite
  fi
}

ensure_prereqs

cd "$ROOT_DIR/frontend"
echo "[install] Setting up frontend .env..."

# Remove .env.local if it exists (so .env takes priority)
rm -f .env.local

# Update or create .env with Next.js variables
if [ ! -f .env ]; then
  cat > .env << EOF
PORT=$FRONTEND_PORT
NEXT_PUBLIC_BACKEND_URL=http://127.0.0.1:8080
EOF
else
  # Update existing .env with correct keys
  if grep -q "^BACKEND_URL=" .env; then
    sed -i 's|^BACKEND_URL=.*|NEXT_PUBLIC_BACKEND_URL=http://127.0.0.1:8080|' .env
  elif ! grep -q "^NEXT_PUBLIC_BACKEND_URL=" .env; then
    echo "NEXT_PUBLIC_BACKEND_URL=http://127.0.0.1:8080" >> .env
  fi
  
  # Ensure PORT is set
  if grep -q "^PORT=" .env; then
    sed -i "s|^PORT=.*|PORT=$FRONTEND_PORT|" .env
  else
    echo "PORT=$FRONTEND_PORT" >> .env
  fi
  
  # Remove old non-Next.js keys
  sed -i '/^FRONTEND_HTTPS=/d' .env
  sed -i '/^FRONTEND_SSL_CERT_PATH=/d' .env
  sed -i '/^FRONTEND_SSL_KEY_PATH=/d' .env
fi

echo "[install] Frontend .env ready"
echo "[install] Installing frontend deps (Next.js)..."

# Remove old lock file if it exists (ensures fresh install with new Next.js versions)
rm -f package-lock.json

echo "[install] Running npm install..."
npm install

echo "[install] Fixing npm vulnerabilities..."
npm audit fix --force --audit-level=moderate 2>/dev/null || true

echo "[install] Building Next.js frontend..."
npm run build

cd "$ROOT_DIR/backend"
if [ ! -f .env ]; then
  DATA_DIR="$ROOT_DIR/backend/data"
  mkdir -p "$DATA_DIR"
  echo "DATABASE_URL=sqlite://./data/app.db" > .env
  echo "JWT_SECRET=$(openssl rand -hex 16 || echo dev_secret)" >> .env
  echo "APP_URL=http://localhost:$FRONTEND_PORT" >> .env
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
else
  DATA_DIR="$ROOT_DIR/backend/data"
  mkdir -p "$DATA_DIR"
  # Normalize any sqlite URL to a relative path that works from backend CWD
  if grep -Eq '^DATABASE_URL=sqlite://.*' .env; then
    sed -i "s|^DATABASE_URL=sqlite://.*$|DATABASE_URL=sqlite://./data/app.db|" .env
  fi
fi
echo "[install] Building backend..."
cargo build --release

# If DOMAIN and ADMIN_EMAIL provided, set up Nginx reverse proxy and Let's Encrypt
if [ -n "${DOMAIN:-}" ] && [ -n "${ADMIN_EMAIL:-}" ] && [ "$APT_AVAILABLE" = true ]; then
  echo "[install] Setting up Nginx reverse proxy for $DOMAIN"
  $SUDO apt-get install -y nginx certbot python3-certbot-nginx > /dev/null

  # Build -d flags (support comma-separated domains)
  DOM_FLAGS=""
  IFS=',' read -ra DLIST <<< "$DOMAIN"
  for d in "${DLIST[@]}"; do
    d="${d// /}"
    d="${d#,}"
    d="${d%,}"
    if [ -n "$d" ]; then
      DOM_FLAGS="$DOM_FLAGS -d $d"
    fi
  done
  PRIMARY_DOMAIN_RAW="${DLIST[0]}"
  PRIMARY_DOMAIN="${PRIMARY_DOMAIN_RAW// /}"
  PRIMARY_DOMAIN="${PRIMARY_DOMAIN#,}"
  PRIMARY_DOMAIN="${PRIMARY_DOMAIN%,}"

  # Write nginx site config
  SITE_PATH="/etc/nginx/sites-available/$PRIMARY_DOMAIN"
  if [ ! -f "$SITE_PATH" ]; then
    echo "[install] Writing nginx config: $SITE_PATH"
    WWW_DOMAIN="www.$PRIMARY_DOMAIN"
    $SUDO tee "$SITE_PATH" > /dev/null <<'NGINXCONF'
server {
    listen 80 default_server;
    server_name __DOMAIN__ __WWW_DOMAIN__ _;

    location /api/ {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        proxy_pass http://127.0.0.1:__FRONTEND_PORT__;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
NGINXCONF
    $SUDO sed -i "s/__DOMAIN__/$PRIMARY_DOMAIN/g" "$SITE_PATH"
    $SUDO sed -i "s/__WWW_DOMAIN__/$WWW_DOMAIN/g" "$SITE_PATH"
    $SUDO sed -i "s/__FRONTEND_PORT__/$FRONTEND_PORT/g" "$SITE_PATH"
    # Enable site
    if [ ! -f "/etc/nginx/sites-enabled/$PRIMARY_DOMAIN" ]; then
      $SUDO ln -s "$SITE_PATH" "/etc/nginx/sites-enabled/$PRIMARY_DOMAIN"
    fi
    # Optionally disable default
    if [ -f "/etc/nginx/sites-enabled/default" ]; then
      $SUDO rm -f "/etc/nginx/sites-enabled/default"
    fi
    $SUDO nginx -t && $SUDO systemctl reload nginx || echo "[install] Warning: nginx reload failed"
  fi

  echo "[install] Obtaining Let's Encrypt certificate for $DOMAIN"
  set +e
  $SUDO certbot --nginx --redirect --non-interactive --agree-tos -m "$ADMIN_EMAIL" $DOM_FLAGS
  CERTBOT_RC=$?
  set -e
  if [ $CERTBOT_RC -ne 0 ]; then
    echo "[install] Certbot failed (code $CERTBOT_RC). Nginx will serve HTTP only."
  else
    echo "[install] Certificate obtained. Reloading nginx."
    $SUDO systemctl reload nginx || true
  fi
fi

echo "[install] Stopping any existing processes..."
if [ -x "$ROOT_DIR/deploy/uninstall.sh" ]; then
  "$ROOT_DIR/deploy/uninstall.sh" || true
fi

# Ensure data directory exists and has proper permissions
echo "[install] Creating database directory with proper permissions..."
DATA_DIR="$ROOT_DIR/backend/data"
mkdir -p "$DATA_DIR"
chmod 755 "$DATA_DIR"

# Create database file if it doesn't exist
touch "$DATA_DIR/app.db"
chmod 644 "$DATA_DIR/app.db"

# Use absolute path for database URL to avoid any working directory issues
DB_URL_ABS="sqlite:///$DATA_DIR/app.db"

echo "[install] Starting backend (detached)..."
(
  cd "$ROOT_DIR/backend"
  # Run migrations with absolute database URL
  echo "[install] Running database migrations..."
  env DATABASE_URL="$DB_URL_ABS" sqlx migrate run
  
  # Start backend with absolute database URL
  nohup env DATABASE_URL="$DB_URL_ABS" ./target/release/restaurent-backend > "$ROOT_DIR/.backend.log" 2>&1 & echo $! > "$ROOT_DIR/.backend.pid"
)

echo "[install] Starting frontend (detached)..."
# Ensure port $FRONTEND_PORT is free (kill any processes bound to it)
if command -v ss >/dev/null 2>&1; then
  PIDS=$(ss -lntp | awk -v port=":$FRONTEND_PORT " '$0 ~ port {print $7}' | sed 's/users:(//' | sed 's/)//' | sed 's/\"//g' | tr ',' '\n' | sed -n 's/^pid=\([0-9]\+\).*$/\1/p' | sort -u)
  for P in $PIDS; do
    kill "$P" 2>/dev/null || true
  done
fi
(
  cd "$ROOT_DIR/frontend"
  nohup env PORT="$FRONTEND_PORT" "$ROOT_DIR/frontend/node_modules/.bin/next" start --port "$FRONTEND_PORT" --hostname 0.0.0.0 > "$ROOT_DIR/.frontend.log" 2>&1 &
  echo $! > "$ROOT_DIR/.frontend.pid"
)

echo "[install] Done. PIDs: backend=$(cat "$ROOT_DIR/.backend.pid"), frontend=$(cat "$ROOT_DIR/.frontend.pid")"

