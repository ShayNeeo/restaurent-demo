CREATE TABLE IF NOT EXISTS gift_codes (
  code TEXT PRIMARY KEY,
  value_cents INTEGER NOT NULL,
  remaining_cents INTEGER NOT NULL,
  purchaser_email TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

