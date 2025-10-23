-- Add indexes for frequently queried columns
CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(email);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_gift_codes_purchaser ON gift_codes(purchaser_email);
CREATE INDEX IF NOT EXISTS idx_pending_orders_created_at ON pending_orders(created_at);
CREATE INDEX IF NOT EXISTS idx_pending_gifts_created_at ON pending_gifts(created_at);

-- Drop redundant gift_coupons table (we use gift_codes instead)
DROP TABLE IF EXISTS gift_coupons;


