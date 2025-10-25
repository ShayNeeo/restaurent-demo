-- Fix foreign key constraint on coupon_code
-- The coupon_code can be either a regular coupon OR a gift code
-- Since SQLite doesn't support DROP CONSTRAINT, we need to recreate the table

-- Rename old orders table
ALTER TABLE orders RENAME TO orders_old;

-- Create new orders table WITHOUT the coupon_code foreign key constraint
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  email TEXT,
  total_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  coupon_code TEXT,
  items_json TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  FOREIGN KEY(user_id) REFERENCES users(id)
);

-- Copy data from old table
INSERT INTO orders (id, user_id, email, total_cents, currency, coupon_code, items_json, created_at)
SELECT id, user_id, email, total_cents, currency, coupon_code, items_json, created_at FROM orders_old;

-- Drop old table
DROP TABLE orders_old;
