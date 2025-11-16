# restaurent-demo
```mermaid
graph TD
    subgraph "User's Device"
        U["<i class='fa fa-user'></i> User's Browser"]
    end

    subgraph "Cloud Infrastructure"
        LB["<i class='fa fa-network-wired'></i> Load Balancer /<br>API Gateway"]
        
        subgraph "Web Server / Frontend"
            FE["<i class='fa fa-window-maximize'></i> Web App <br>(React/Vue/Angular)"]
        end

        subgraph "Backend Services (Private Network)"
            API["<i class='fa fa-server'></i> API Server <br>(Handles Logic)"]
            DB[("<i class='fa fa-database'></i> Database <br>(Stores Data)")]
        end
    end

    subgraph "External Services"
        PG["<i class='fa fa-credit-card'></i> Payment Gateway API<br>(Stripe, PayPal, etc.)"]
    end

    %% --- Connections ---
    U -- HTTPS Request --> LB
    LB --> FE
    LB -- /api/* --> API
    
    FE -- Loads in Browser --> U
    
    API -- Reads/Writes Data --> DB
    API -- Secure API Call --> PG

    %% --- Styling for Dark Mode ---
    style U fill:#1e40af,stroke:#60a5fa
    style FE fill:#047857,stroke:#34d399
    style API fill:#7c2d12,stroke:#fb923c
    style DB fill:#86198f,stroke:#e879f9
    style PG fill:#374151,stroke:#9ca3af
    style LB fill:#5b21b6,stroke:#a78bfa
```

#Quick start (local dev)

1. Frontend (Express + TypeScript)
   - `cd frontend && cp .env.example .env && npm i && npm run dev`
2. Backend (Rust)
   - `cd backend && cp .env.example .env && cargo run`
3. Open the app at `http://localhost:5173` (frontend will proxy API to backend).

Quick start (production deployment with Cloudflare)

**One-liner deployment:**
```bash
export DOMAIN=nguyenrestaurant.de SETUP_CERTBOT=false ADMIN_EMAIL=admin@nguyenrestaurant.de && bash deploy/install.sh
```

**Or step-by-step:**
```bash
# 1. Set configuration
export DOMAIN=nguyenrestaurant.de
export SETUP_CERTBOT=false              # Skip certbot - Cloudflare handles SSL
export ADMIN_EMAIL=admin@nguyenrestaurant.de     # For certificates & admin setup
export INTERNAL_FRONTEND_PORT=3000      # (optional, defaults to 3000)

# 2. Run installer (will prompt for admin password interactively)
bash deploy/install.sh

# 3. View logs
tail -f .backend.log
tail -f .frontend.log
```

**What the script does:**
1. ✅ Installs dependencies (Node.js 20+, Rust, SQLite)
2. ✅ Builds backend and frontend
3. ✅ Configures Nginx reverse proxy (port 80 → internal port 3000)
4. ✅ Initializes database with migrations
5. ✅ **Prompts for admin email + password** (first-time only)
6. ✅ Starts services:
   - Backend on port 8080 (internal, not exposed)
   - Frontend on port 3000 (internal, not exposed)
   - Nginx on port 80 (receives Cloudflare traffic)

**Then configure Cloudflare DNS:**
1. Go to https://dash.cloudflare.com
2. Add DNS record:
   - Type: **A**
   - Name: **@** (or your subdomain)
   - Content: **your.server.ip.address**
   - TTL: **Auto**
   - Status: **Proxied** (🔒) ← Important!
3. Go to SSL/TLS → Overview
4. Set mode to **"Full"** (not "Flexible")
5. Done! Cloudflare handles all HTTPS

**Port mapping (Cloudflare Proxied):**
```
Client Request
    ↓ HTTPS
Cloudflare Proxy (yourdomain.com)
    ↓ HTTP (decrypted)
Nginx (port 80)
    ├─ /api/* → Rust Backend (port 8080)
    └─ / → Next.js Frontend (port 3000)
```

**Environment variables:**
- `DOMAIN` - Your domain name (required for Cloudflare setup)
- `SETUP_CERTBOT=false` - Skip certbot (Cloudflare handles SSL)
- `ADMIN_EMAIL` - Email for Cloudflare certificate notifications
- `INTERNAL_FRONTEND_PORT` - Internal Next.js port (default: 3000)

**Useful commands:**
```bash
# Check service status
ps aux | grep restaurent-backend
ps aux | grep "next start"

# View logs
cat .backend.log
cat .frontend.log

# Restart services
bash deploy/uninstall.sh
bash deploy/install.sh

# Remove everything (data + config)
SETUP_CERTBOT=false bash deploy/uninstall.sh
```

Notes
- Static site under `Restaurent/` is served as-is; client enhancements go in `Restaurent/assets/js/app.js`.
- Payment uses PayPal by default (Sandbox). Set `PAYPAL_CLIENT_ID`, `PAYPAL_SECRET`, `PAYPAL_API_BASE` (default sandbox). Stripe stubs remain and can be re-enabled by adding keys.
- SMTP via Brevo; add credentials in backend `.env`.
- **Database Migrations**: Consolidated from 9 redundant migrations into a single `0001_initial_schema.sql` for clarity and to prevent migration conflicts on fresh installations.

Deploy scripts
- `deploy/install.sh`: installs deps, builds, and starts backend and frontend (detached). Creates `.env` defaults if missing.
  - **First-time run**: Automatically detects fresh database and prompts to create admin user interactively
  - Optional: set `DOMAIN` env to configure Nginx reverse proxy
  - Optional: set `SETUP_CERTBOT=false` to skip certbot (use with Cloudflare proxied mode)
  - Optional: set `ADMIN_EMAIL` for certbot renewal notices
- `deploy/uninstall.sh`: stops running backend/frontend using stored PIDs, cleans up build artifacts, optionally removes database and config files.

Environment
- Frontend `.env`: `PORT`, `NEXT_PUBLIC_BACKEND_URL`.
- Backend `.env`: `DATABASE_URL`, `JWT_SECRET`, `APP_URL`, `BACKEND_PUBLIC_URL`, PayPal: `PAYPAL_CLIENT_ID`, `PAYPAL_SECRET`, optional `PAYPAL_API_BASE`, `PAYPAL_WEBHOOK_ID`; Stripe (optional): `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`; Email: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD`, `SMTP_FROM`.

`APP_URL` should point to the public frontend (used in emails and redirects), while `BACKEND_PUBLIC_URL` must be the publicly accessible origin of the Rust API (used for PayPal callbacks). In simple single-domain setups you can set both to the same base URL.

Cloudflare Proxied Setup (Recommended - No Certbot Needed!)
- When using Cloudflare proxy (🔒), **certbot cannot validate** because your IP is masked
- Solution: Let Cloudflare handle SSL automatically instead
- Set `SETUP_CERTBOT=false` to skip certbot
- Example deployment:
  ```bash
  export DOMAIN=yourdomain.com
  export SETUP_CERTBOT=false      # Skip certbot - not needed with Cloudflare!
  export ADMIN_EMAIL=admin@yourdomain.com
  bash deploy/install.sh
  ```
- Then in Cloudflare dashboard:
  - Add DNS A record pointing to your server IP
  - Set to "Proxied" (🔒) status (not "DNS only")
  - Go to SSL/TLS → Overview
  - Set mode to **"Full"** (not "Flexible")
  - Cloudflare automatically issues & manages certificates for you

Why skip certbot with Cloudflare?
- Your IP is hidden by Cloudflare proxy (IP-based validation fails)
- Cloudflare automatically issues SSL certificates
- Zero management needed - certificates auto-renew
- Your backend runs on plain HTTP internally, Cloudflare encrypts external traffic

SSL Certificate Options Comparison:

| Setup | Certbot? | Cloudflare Mode | Validation | Best For |
|-------|----------|-----------------|-----------|----------|
| **Cloudflare + Proxied** | ❌ No | Proxied (🔒) | Cloudflare handles it | Production with Cloudflare |
| **Cloudflare + DNS only** | ✅ Yes | DNS only (⚙️) | HTTP/DNS validation | Mix of proxied & direct traffic |
| **No Cloudflare** | ✅ Yes | N/A | HTTP/DNS validation | Direct domain management |

For most users: **Use Cloudflare Proxied + skip certbot** ✅

For Brevo SMTP:
- `SMTP_HOST=smtp-relay.brevo.com`
- `SMTP_PORT=587`
- `SMTP_USERNAME=88af27002@smtp-brevo.com` (your login)
- `SMTP_PASSWORD=<your_smtp_key>`
- `SMTP_FROM=Your Restaurant Name <no-reply@yourdomain.com>` (replace with your actual domain)
    
```mermaid
graph TD
    subgraph "Entry Points"
        A["🏠 Online Customer"]
        B["🍽️ Walk-in Customer"]
    end
    
    A -->|Buy Gift Code| A1["Get QR Code"]
    A1 -->|Later| A2["Come to Restaurant"]
    A2 -->|Show QR| M["Manager<br/>Scan QR"]
    
    B -->|At Restaurant| B1["Customer Uses<br/>Phone/Website"]
    B1 -->|Place Web Order| B2["Manager Gets<br/>Notification"]
    B2 -->|Ask for QR| M
    
    M -->|Scan & Pay| C["Deduct from<br/>Gift Code"]
    C -->|Create Order| D["Kitchen<br/>Prepares"]
    D -->|Ready| E["Customer<br/>Picks Up"]
    
    style A fill:#1e40af,stroke:#60a5fa
    style B fill:#047857,stroke:#34d399
    style M fill:#7c2d12,stroke:#fb923c
    style C fill:#86198f,stroke:#e879f9
    style D fill:#7c2d12,stroke:#fb923c
    style E fill:#047857,stroke:#34d399
```
