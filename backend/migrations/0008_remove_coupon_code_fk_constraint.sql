-- Migration: Remove Foreign Key Constraint on coupon_code
-- Purpose: Support both regular coupons and gift codes (which are stored in different tables)
-- Issue: Original schema had FOREIGN KEY(coupon_code) REFERENCES coupons(code)
--        This prevented gift codes (stored in gift_codes table) from being used
-- Solution: Remove the problematic FK constraint since validation is handled at application level

-- Clean up any artifacts from previous attempts
DROP TABLE IF EXISTS orders_old;
DROP TABLE IF EXISTS orders_backup;

-- Disable foreign key constraints during migration
PRAGMA foreign_keys = OFF;

-- Step 1: Create new orders table without the problematic coupon_code FK
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

-- Step 2: Migrate existing data
INSERT INTO orders_new 
SELECT id, user_id, email, total_cents, currency, coupon_code, items_json, created_at 
FROM orders;

-- Step 3: Drop old table and rename new one
DROP TABLE orders;
ALTER TABLE orders_new RENAME TO orders;

-- Re-enable foreign key constraints
PRAGMA foreign_keys = ON;
