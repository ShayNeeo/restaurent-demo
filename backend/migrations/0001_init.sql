-- users
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

-- products
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  unit_amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR'
);

-- coupons (percentage or fixed amount), with usage limit
CREATE TABLE IF NOT EXISTS coupons (
  code TEXT PRIMARY KEY,
  percent_off INTEGER, -- 0..100
  amount_off INTEGER,  -- cents
  remaining_uses INTEGER NOT NULL DEFAULT 0
);

-- gift coupons purchased by customers (store value)
CREATE TABLE IF NOT EXISTS gift_coupons (
  code TEXT PRIMARY KEY,
  value_cents INTEGER NOT NULL,
  remaining_cents INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  purchaser_email TEXT
);

-- orders
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  email TEXT,
  total_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  coupon_code TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  FOREIGN KEY(user_id) REFERENCES users(id),
  FOREIGN KEY(coupon_code) REFERENCES coupons(code)
);

-- order items
CREATE TABLE IF NOT EXISTS order_items (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_amount INTEGER NOT NULL,
  FOREIGN KEY(order_id) REFERENCES orders(id),
  FOREIGN KEY(product_id) REFERENCES products(id)
);

-- seed one product if empty (SQLite upsert via triggerless insert)
INSERT INTO products (id, name, unit_amount, currency)
SELECT 'test_1', 'Lobster Tortellini', 2000, 'EUR'
WHERE NOT EXISTS (SELECT 1 FROM products);

