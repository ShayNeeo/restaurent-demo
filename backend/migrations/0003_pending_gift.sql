CREATE TABLE IF NOT EXISTS pending_gifts (
  order_id TEXT PRIMARY KEY,
  email TEXT,
  amount_cents INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

