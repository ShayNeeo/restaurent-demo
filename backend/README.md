Backend (Axum + SQLx)

Run locally

1. Install Rust (stable) and SQLite.
2. Copy env: `cp .env.example .env` and adjust.
3. Run: `cargo run`.

API endpoints (initial)
- GET `/api/health` → `{ ok: true }`
- GET `/api/products` → one demo product
- POST `/api/coupons/apply` → validate coupon (demo: CODE10)
- POST `/api/checkout` → returns placeholder URL (replace with Stripe session)

Next steps
- Add SQLx models, migrations, JWT auth, Stripe sessions/webhooks, Brevo SMTP.

