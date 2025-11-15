#!/usr/bin/env bash
set -euo pipefail

# Install and start the project (frontend + backend) on a Linux server.
# If running on Debian (apt), this script will attempt to install prerequisites automatically:
# - Node.js 20.x + npm
# - Rust (stable) via rustup
# - SQLite3 + headers, build tools, OpenSSL CLI

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

# Determine frontend port based on setup type
# For domain deployments: use nginx on port 80 with Next.js on 3000 internally
# For local/direct installs: run Next.js directly on port 5173
if [ -n "${DOMAIN:-}" ]; then
  # Domain setup always runs behind nginx and uses an internal port
  INTERNAL_FRONTEND_PORT="${INTERNAL_FRONTEND_PORT:-3000}"
  NGINX_ENABLED=true
else
  # Local or direct setup
  INTERNAL_FRONTEND_PORT="${INTERNAL_FRONTEND_PORT:-${FRONTEND_PORT:-5173}}"
  NGINX_ENABLED=false
fi

echo "[install] Using root: $ROOT_DIR"
echo "[install] Frontend port (internal): $INTERNAL_FRONTEND_PORT"
if [ "$NGINX_ENABLED" = "true" ]; then
  echo "[install] Nginx will proxy to $INTERNAL_FRONTEND_PORT"
fi

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

# Determine backend URL based on DOMAIN
if [ -n "$DOMAIN" ]; then
  BACKEND_URL="https://$DOMAIN"
else
  BACKEND_URL="http://127.0.0.1:8080"
fi

# Update or create .env with Next.js variables
if [ ! -f .env ]; then
  cat > .env << EOF
PORT=$INTERNAL_FRONTEND_PORT
NEXT_PUBLIC_BACKEND_URL=$BACKEND_URL
EOF
else
  # Update existing .env with correct keys
  if grep -q "^BACKEND_URL=" .env; then
    sed -i "s|^BACKEND_URL=.*|NEXT_PUBLIC_BACKEND_URL=$BACKEND_URL|" .env
  elif ! grep -q "^NEXT_PUBLIC_BACKEND_URL=" .env; then
    echo "NEXT_PUBLIC_BACKEND_URL=$BACKEND_URL" >> .env
  else
    sed -i "s|^NEXT_PUBLIC_BACKEND_URL=.*|NEXT_PUBLIC_BACKEND_URL=$BACKEND_URL|" .env
  fi
  
  # Ensure PORT is set
  if grep -q "^PORT=" .env; then
    sed -i "s|^PORT=.*|PORT=$INTERNAL_FRONTEND_PORT|" .env
  else
    echo "PORT=$INTERNAL_FRONTEND_PORT" >> .env
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
  # Use absolute path for database (sqlite:/// + absolute path)
  echo "DATABASE_URL=sqlite:////$DATA_DIR/app.db" > .env
  echo "JWT_SECRET=$(openssl rand -hex 16 || echo dev_secret)" >> .env
  echo "APP_URL=http://localhost:$INTERNAL_FRONTEND_PORT" >> .env
  echo "BACKEND_PUBLIC_URL=$BACKEND_URL" >> .env
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
  # Normalize any sqlite URL to use absolute path
  if grep -Eq '^DATABASE_URL=sqlite://.*' .env; then
    sed -i "s|^DATABASE_URL=sqlite://.*$|DATABASE_URL=sqlite:////$DATA_DIR/app.db|" .env
  fi
  if grep -q "^BACKEND_PUBLIC_URL=" .env; then
    sed -i "s|^BACKEND_PUBLIC_URL=.*|BACKEND_PUBLIC_URL=$BACKEND_URL|" .env
  else
    echo "BACKEND_PUBLIC_URL=$BACKEND_URL" >> .env
  fi
fi
echo "[install] Building backend..."
cargo build --release

# If DOMAIN provided, set up Nginx reverse proxy and Let's Encrypt
if [ -n "${DOMAIN:-}" ] && [ "$APT_AVAILABLE" = true ]; then
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

  # Check if using Cloudflare (proxied) - check early to determine config type
  SETUP_CERTBOT="${SETUP_CERTBOT:-true}"
  
  # Write nginx site config (HTTP-only if certbot will run, SSL config if skipping certbot)
  SITE_PATH="/etc/nginx/sites-available/$PRIMARY_DOMAIN"
  WWW_DOMAIN="www.$PRIMARY_DOMAIN"
  
  if [ "$SETUP_CERTBOT" = "false" ]; then
    # Generate self-signed certificate for Cloudflare "Full" mode
    SSL_DIR="/etc/nginx/ssl/$PRIMARY_DOMAIN"
    $SUDO mkdir -p "$SSL_DIR"
    CERT_PATH="$SSL_DIR/cert.pem"
    KEY_PATH="$SSL_DIR/key.pem"
    
    if [ ! -f "$CERT_PATH" ] || [ ! -f "$KEY_PATH" ]; then
      echo "[install] 🔒 Generating self-signed SSL certificate for Cloudflare 'Full' mode..."
      $SUDO openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout "$KEY_PATH" \
        -out "$CERT_PATH" \
        -subj "/CN=$PRIMARY_DOMAIN" \
        -addext "subjectAltName=DNS:$PRIMARY_DOMAIN,DNS:$WWW_DOMAIN" 2>/dev/null || \
      $SUDO openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout "$KEY_PATH" \
        -out "$CERT_PATH" \
        -subj "/CN=$PRIMARY_DOMAIN"
      $SUDO chmod 600 "$KEY_PATH"
      $SUDO chmod 644 "$CERT_PATH"
      echo "[install] ✅ Self-signed certificate generated"
    fi
    
    # Generate SSL-enabled nginx config
    TMP_SITE="$(mktemp)"
    cat <<'NGINXSSLCONF' > "$TMP_SITE"
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name __DOMAIN__ __WWW_DOMAIN__ _;
    
    # Redirect HTTP to HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2 default_server;
    listen [::]:443 ssl http2 default_server;
    server_name __DOMAIN__ __WWW_DOMAIN__ _;
    
    ssl_certificate __CERT_PATH__;
    ssl_certificate_key __KEY_PATH__;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    
    location /api/ {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header CF-Connecting-IP $remote_addr;
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
NGINXSSLCONF
    sed -i "s/__DOMAIN__/$PRIMARY_DOMAIN/g" "$TMP_SITE"
    sed -i "s/__WWW_DOMAIN__/$WWW_DOMAIN/g" "$TMP_SITE"
    sed -i "s|__CERT_PATH__|$CERT_PATH|g" "$TMP_SITE"
    sed -i "s|__KEY_PATH__|$KEY_PATH|g" "$TMP_SITE"
    sed -i "s/__FRONTEND_PORT__/$INTERNAL_FRONTEND_PORT/g" "$TMP_SITE"
  else
    # Generate HTTP-only nginx config (certbot will add SSL)
    TMP_SITE="$(mktemp)"
    cat <<'NGINXCONF' > "$TMP_SITE"
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name __DOMAIN__ __WWW_DOMAIN__ _;

    location /api/ {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header CF-Connecting-IP $remote_addr;
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
    sed -i "s/__DOMAIN__/$PRIMARY_DOMAIN/g" "$TMP_SITE"
    sed -i "s/__WWW_DOMAIN__/$WWW_DOMAIN/g" "$TMP_SITE"
    sed -i "s/__FRONTEND_PORT__/$INTERNAL_FRONTEND_PORT/g" "$TMP_SITE"
  fi

  if [ ! -f "$SITE_PATH" ]; then
    echo "[install] Writing nginx config: $SITE_PATH"
    $SUDO mv "$TMP_SITE" "$SITE_PATH"
  else
    if ! cmp -s "$TMP_SITE" "$SITE_PATH" 2>/dev/null; then
      echo "[install] Updating nginx config: $SITE_PATH"
      $SUDO mv "$TMP_SITE" "$SITE_PATH"
    else
      echo "[install] nginx config unchanged at $SITE_PATH"
      rm -f "$TMP_SITE"
    fi
  fi

  # Enable site (force link to ensure it points to the latest config)
  $SUDO ln -sf "$SITE_PATH" "/etc/nginx/sites-enabled/$PRIMARY_DOMAIN"

  # Optionally disable default site
  if [ -f "/etc/nginx/sites-enabled/default" ]; then
    $SUDO rm -f "/etc/nginx/sites-enabled/default"
  fi

  if $SUDO nginx -t; then
    $SUDO systemctl reload nginx || echo "[install] Warning: nginx reload failed"
  else
    echo "[install] Warning: nginx configuration test failed; manual inspection required"
  fi

  if [ "$SETUP_CERTBOT" = "false" ]; then
    echo "[install] ⚠️  Certbot skipped (using Cloudflare proxy with self-signed certificate)"
    echo "[install] 📝 Cloudflare Usage:"
    echo "[install]    1. Go to https://dash.cloudflare.com"
    echo "[install]    2. Set DNS to 'Proxied' (🔒) for your domain"
    echo "[install]    3. Go to SSL/TLS → Overview → Set to 'Full' mode"
    echo "[install]    4. Cloudflare will use the self-signed certificate for origin connection"
    echo "[install]    ✅ Self-signed certificate configured - Cloudflare 'Full' mode ready!"
  else
    echo "[install] ⚠️  IMPORTANT: Ensure your domain is set to 'DNS only' (⚙️) in Cloudflare"
    echo "[install]    OR have certbot DNS validation set up for proxied domains"
    echo "[install] 🔒 Obtaining Let's Encrypt certificate for $DOMAIN"
    echo "[install] 📧 Note: You'll need to provide an email for certificate renewal notices."
    EMAIL="${ADMIN_EMAIL:-webmaster@${PRIMARY_DOMAIN}}"
    set +e
    $SUDO certbot --nginx --redirect --non-interactive --agree-tos -m "$EMAIL" $DOM_FLAGS
    CERTBOT_RC=$?
    set -e
    if [ $CERTBOT_RC -ne 0 ]; then
      echo "[install] ❌ Certbot failed (code $CERTBOT_RC). Nginx will serve HTTP only."
      echo "[install] 💡 If using Cloudflare proxy, you can safely ignore this error."
      echo "[install]    Cloudflare will provide HTTPS automatically."
    else
      echo "[install] ✅ Certificate obtained. Reloading nginx."
      $SUDO systemctl reload nginx || true
    fi
  fi
fi

echo "[install] Stopping any existing processes..."
# Kill processes by name and port
if command -v pkill >/dev/null 2>&1; then
  pkill -f "restaurent-backend" 2>/dev/null || true
  pkill -f "next start" 2>/dev/null || true
fi

# Kill by ports if pkill doesn't work
if command -v ss >/dev/null 2>&1; then
  # Kill on port 8080 (backend)
  PIDS=$(ss -lntp 2>/dev/null | awk '/:8080 /{print $7}' | sed 's/users:(//' | sed 's/)//' | sed 's/\"//g' | tr ',' '\n' | sed -n 's/^pid=\([0-9]\+\).*$/\1/p' | sort -u)
  for P in $PIDS; do
    kill "$P" 2>/dev/null || true
  done
  
  # Kill on INTERNAL_FRONTEND_PORT (default 5173 or 3000)
  PIDS=$(ss -lntp 2>/dev/null | awk -v port=":$INTERNAL_FRONTEND_PORT " '$0 ~ port {print $7}' | sed 's/users:(//' | sed 's/)//' | sed 's/\"//g' | tr ',' '\n' | sed -n 's/^pid=\([0-9]\+\).*$/\1/p' | sort -u)
  for P in $PIDS; do
    kill "$P" 2>/dev/null || true
  done
fi

# Ensure data directory exists and has proper permissions
echo "[install] Creating database directory with proper permissions..."
DATA_DIR="$ROOT_DIR/backend/data"
mkdir -p "$DATA_DIR"
chmod 755 "$DATA_DIR"

# Create database file if it doesn't exist
touch "$DATA_DIR/app.db"
chmod 644 "$DATA_DIR/app.db"

# Check if this is a first-time run (database is new)
IS_FIRST_RUN=false
if [ ! -s "$DATA_DIR/app.db" ] || [ $(stat -f%z "$DATA_DIR/app.db" 2>/dev/null || stat -c%s "$DATA_DIR/app.db" 2>/dev/null) -eq 0 ]; then
  IS_FIRST_RUN=true
fi

# Use absolute path for database URL to avoid any working directory issues
# Format: sqlite:/// + absolute path (4 slashes total: 3 for sqlite:// + 1 for root /)
DB_URL_ABS="sqlite:////$DATA_DIR/app.db"

echo "[install] Starting backend (detached)..."
(
  cd "$ROOT_DIR/backend"
  
  # Run migrations with absolute database URL
  # Note: Do NOT run schema.sql first - migrations will create all tables properly
  echo "[install] Running database migrations..."
  env DATABASE_URL="$DB_URL_ABS" sqlx migrate run || true
  
  # Start backend with absolute database URL
  nohup env DATABASE_URL="$DB_URL_ABS" ./target/release/restaurent-backend > "$ROOT_DIR/.backend.log" 2>&1 & echo $! > "$ROOT_DIR/.backend.pid"
)

# Wait for backend to start before setting up admin user
echo "[install] Waiting for backend to start..."
sleep 3

# If first run, prompt to create admin user
if [ "$IS_FIRST_RUN" = true ]; then
  echo ""
  echo "============================================"
  echo "⚙️  First-time setup detected!"
  echo "============================================"
  echo ""
  read -p "📧 Enter admin email: " ADMIN_USER_EMAIL
  
  # Validate email format (basic check)
  if [[ ! "$ADMIN_USER_EMAIL" =~ ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$ ]]; then
    echo "❌ Invalid email format. Skipping admin user creation."
  else
    read -sp "🔐 Enter admin password (min 6 characters): " ADMIN_USER_PASSWORD
    echo ""
    
    # Validate password length
    if [ ${#ADMIN_USER_PASSWORD} -lt 6 ]; then
      echo "❌ Password too short (minimum 6 characters). Skipping admin user creation."
    else
      # Get the backend port (default 8080)
      BACKEND_URL="${BACKEND_URL:-http://127.0.0.1:8080}"
      
      # Attempt to create admin user
      echo ""
      echo "[install] Creating admin user..."
      ADMIN_RESPONSE=$(curl -s -X POST "$BACKEND_URL/api/auth/setup-admin" \
        -H "Content-Type: application/json" \
        -d "{\"email\": \"$ADMIN_USER_EMAIL\", \"password\": \"$ADMIN_USER_PASSWORD\"}" 2>/dev/null)
      
      if echo "$ADMIN_RESPONSE" | grep -q "token"; then
        echo "✅ Admin user created successfully!"
        echo ""
        echo "Login credentials:"
        echo "  Email: $ADMIN_USER_EMAIL"
        echo "  Password: (as entered)"
        echo ""
      else
        echo "⚠️  Admin user creation may have failed. You can create it manually later:"
        echo "curl -X POST $BACKEND_URL/api/auth/setup-admin \\"
        echo "  -H 'Content-Type: application/json' \\"
        echo "  -d '{\"email\": \"admin@domain.com\", \"password\": \"YourPassword123\"}'"
      fi
    fi
  fi
  echo ""
fi

echo "[install] Starting frontend (detached)..."
cd "$ROOT_DIR/frontend"
echo "[install] Frontend starting on port $INTERNAL_FRONTEND_PORT..."
# Start frontend with explicit PORT environment variable
# The PORT variable is used by next start --port ${PORT:-5173} in package.json
export PORT="$INTERNAL_FRONTEND_PORT"
nohup npm start > "$ROOT_DIR/.frontend.log" 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > "$ROOT_DIR/.frontend.pid"
echo "[install] Frontend PID: $FRONTEND_PID (listening on port $INTERNAL_FRONTEND_PORT)"
sleep 3  # Give frontend time to start
cd "$ROOT_DIR"

echo ""
echo "============================================"
echo "✅ Installation Complete!"
echo "============================================"
echo ""
echo "📊 Service Status:"
echo "  Backend  (Rust):  http://127.0.0.1:8080/api"
echo "  Frontend (Next):  http://127.0.0.1:$INTERNAL_FRONTEND_PORT"
if [ "$NGINX_ENABLED" = "true" ]; then
  echo "  Nginx Proxy:      http://127.0.0.1:80 → :$INTERNAL_FRONTEND_PORT"
fi
echo ""
echo "📁 Logs:"
echo "  Backend:  $ROOT_DIR/.backend.log"
echo "  Frontend: $ROOT_DIR/.frontend.log"
echo ""
if [ -n "${DOMAIN:-}" ]; then
  echo "🌐 Domain: https://$DOMAIN"
  if [ "$SETUP_CERTBOT" = "false" ]; then
    echo "   ✅ Cloudflare Proxied (HTTPS handled by Cloudflare)"
    echo "   📍 Internal: http://127.0.0.1:80 (Nginx)"
  else
    echo "   🔒 Let's Encrypt Certificate (certbot)"
  fi
  echo ""
fi
echo "📝 Next steps:"
if [ "$NGINX_ENABLED" = "true" ]; then
  echo "  1. Access admin: https://$DOMAIN/admin"
  echo "  2. Cloudflare will proxy traffic to your server"
  echo "  3. Login with admin credentials"
else
  echo "  1. Access admin: http://127.0.0.1:$INTERNAL_FRONTEND_PORT/admin"
  echo "  2. Login with admin credentials"
fi
echo "  4. Configure menu items, manage orders, and more"
echo ""
echo "[install] Done. PIDs: backend=$(cat "$ROOT_DIR/.backend.pid"), frontend=$(cat "$ROOT_DIR/.frontend.pid")"
echo ""

