-- ============================================================================
-- Restaurant Demo - Initial Schema (Consolidated)
-- ============================================================================
-- This migration creates the complete, final database schema
-- Previous: Migrations 0001-0009 were redundant and caused conflicts
-- Reason: schema.sql and individual migrations were duplicating work
-- Solution: Consolidated into single migration for clarity and reliability
-- ============================================================================

-- USERS TABLE
-- Stores customer and admin user accounts
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'customer',
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

-- PRODUCTS TABLE
-- Menu items available for purchase
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  unit_amount INTEGER NOT NULL,    -- Price in cents
  currency TEXT NOT NULL DEFAULT 'EUR'
);

-- COUPONS TABLE
-- Regular discount coupons (percentage or fixed amount)
CREATE TABLE IF NOT EXISTS coupons (
  code TEXT PRIMARY KEY,
  percent_off INTEGER,              -- Percentage discount (0..100)
  amount_off INTEGER,               -- Fixed discount in cents
  remaining_uses INTEGER NOT NULL DEFAULT 0
);

-- GIFT CODES TABLE
-- Gift codes purchased and used as payment method
-- Note: Separate from coupons table to support both discount and payment use cases
CREATE TABLE IF NOT EXISTS gift_codes (
  code TEXT PRIMARY KEY,
  value_cents INTEGER NOT NULL,
  remaining_cents INTEGER NOT NULL,
  purchaser_email TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

-- ORDERS TABLE
-- Completed customer orders
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  email TEXT,
  total_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  coupon_code TEXT,                 -- Can reference coupons or gift_codes (no FK for flexibility)
  items_json TEXT,                  -- JSON: {cart: [...], coupon_code: "...", discount_cents: ...}
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  FOREIGN KEY(user_id) REFERENCES users(id)
  -- NOTE: coupon_code has NO FOREIGN KEY constraint
  -- Reason: Supports both coupons and gift_codes (different tables)
  -- Validation is handled at application level
);

-- ORDER ITEMS TABLE
-- Individual line items for each order
CREATE TABLE IF NOT EXISTS order_items (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_amount INTEGER NOT NULL,    -- Price in cents (denormalized for historical accuracy)
  FOREIGN KEY(order_id) REFERENCES orders(id),
  FOREIGN KEY(product_id) REFERENCES products(id)
);

-- PENDING ORDERS TABLE
-- Orders awaiting PayPal payment capture
CREATE TABLE IF NOT EXISTS pending_orders (
  order_id TEXT PRIMARY KEY,
  user_id TEXT,
  email TEXT,
  amount_cents INTEGER NOT NULL,
  items_json TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

-- PENDING GIFTS TABLE
-- Gift codes awaiting PayPal payment capture
CREATE TABLE IF NOT EXISTS pending_gifts (
  order_id TEXT PRIMARY KEY,
  email TEXT,
  amount_cents INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(email);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_gift_codes_purchaser ON gift_codes(purchaser_email);
CREATE INDEX IF NOT EXISTS idx_pending_orders_created_at ON pending_orders(created_at);
CREATE INDEX IF NOT EXISTS idx_pending_gifts_created_at ON pending_gifts(created_at);

-- ============================================================================
-- SEED DATA
-- ============================================================================

-- Insert default product if database is empty
INSERT INTO products (id, name, unit_amount, currency)
SELECT 'test_1', 'Lobster Tortellini', 2000, 'EUR'
WHERE NOT EXISTS (SELECT 1 FROM products);

