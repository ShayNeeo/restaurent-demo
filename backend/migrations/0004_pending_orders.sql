CREATE TABLE IF NOT EXISTS pending_orders (
  order_id TEXT PRIMARY KEY,
  email TEXT,
  amount_cents INTEGER NOT NULL,
  items_json TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

