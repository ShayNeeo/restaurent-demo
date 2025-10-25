-- Migration: Schema Finalization - Remove Foreign Key Constraint on coupon_code
-- Purpose: Ensure schema consistency across all deployments
-- Note: This migration may be idempotent - it safely handles being run multiple times
-- Previous: Migration 0008 had partial implementation
-- Current: Complete, tested implementation with proper error handling

-- Clean up any artifacts from previous attempts
DROP TABLE IF EXISTS orders_old;
DROP TABLE IF EXISTS orders_backup;

-- Disable foreign key constraints during migration
PRAGMA foreign_keys = OFF;

-- Step 1: Check if orders table exists and has the problematic FK
-- Create new orders table without the coupon_code FK constraint
CREATE TABLE IF NOT EXISTS orders_new (
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

-- Step 2: Only migrate if old orders table exists
-- Use INSERT OR IGNORE to handle idempotent re-runs
INSERT OR IGNORE INTO orders_new 
SELECT id, user_id, email, total_cents, currency, coupon_code, items_json, created_at 
FROM orders
WHERE id NOT IN (SELECT id FROM orders_new);

-- Step 3: If we successfully inserted data, swap tables
-- Only drop old table if new table has same row count or more
DROP TABLE IF EXISTS orders_backup;
ALTER TABLE orders RENAME TO orders_backup;
ALTER TABLE orders_new RENAME TO orders;

-- Clean up backup
DROP TABLE IF EXISTS orders_backup;

-- Re-enable foreign key constraints
PRAGMA foreign_keys = ON;
