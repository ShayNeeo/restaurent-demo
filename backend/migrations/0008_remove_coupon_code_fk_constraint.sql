-- Fix foreign key constraint on coupon_code
-- The coupon_code can be either a regular coupon OR a gift code
-- Since SQLite doesn't support DROP CONSTRAINT, we need to recreate the table

-- Disable foreign key constraints during migration
PRAGMA foreign_keys = OFF;

-- Create new orders table without the coupon_code foreign key constraint
CREATE TABLE orders_new (
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

-- Copy data from old orders table to new one
INSERT INTO orders_new SELECT id, user_id, email, total_cents, currency, coupon_code, items_json, created_at FROM orders;

-- Drop old table
DROP TABLE orders;

-- Rename new table to orders
ALTER TABLE orders_new RENAME TO orders;

-- Re-enable foreign key constraints
PRAGMA foreign_keys = ON;
