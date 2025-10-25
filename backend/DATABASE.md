# Restaurant Demo - Database Documentation

## Overview

This project uses **SQLite** for data persistence with a comprehensive migration-based schema evolution system.

## Schema Files

### Complete Schema
- **`schema.sql`** - Comprehensive merged schema file (all migrations combined)
  - Use for: Fresh installations, documentation, backups
  - Contains all tables, indexes, and seed data in one file
  - Includes detailed comments explaining each table's purpose

### Migration Files
Individual migration files for version control and tracking schema changes:

| File | Purpose |
|------|---------|
| `0001_init.sql` | Core tables: users, products, coupons, orders, order_items |
| `0002_gift_codes.sql` | Gift code system (separate from coupons) |
| `0003_pending_gift.sql` | Track gift code purchases awaiting payment |
| `0004_pending_orders.sql` | Track orders awaiting payment |
| `0005_user_roles.sql` | Add user role system (admin/customer) |
| `0006_pending_orders_userid.sql` | Add user_id to pending orders |
| `0007_optimizations.sql` | Add indexes and drop redundant tables |
| `0008_remove_coupon_code_fk_constraint.sql` | Fix: Support both coupons and gift codes |
| `0009_schema_finalization.sql` | Finalize schema with tested, idempotent implementation |

## Database Tables

### Users
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'customer'
);
```
- Stores customer and admin accounts
- Email is unique identifier for authentication
- Role: 'customer' or 'admin'

### Products
```sql
CREATE TABLE products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  unit_amount INTEGER NOT NULL,    -- Cents
  currency TEXT DEFAULT 'EUR'
);
```
- Menu items
- Prices stored in cents (e.g., €20.00 = 2000)

### Coupons (Discount Codes)
```sql
CREATE TABLE coupons (
  code TEXT PRIMARY KEY,
  percent_off INTEGER,              -- 0-100%
  amount_off INTEGER,               -- Cents
  remaining_uses INTEGER
);
```
- Percentage-based OR fixed-amount discounts
- Track remaining uses
- Example: SAVE10 (10% off) or EURO5 (€5 off)

### Gift Codes (Payment Method)
```sql
CREATE TABLE gift_codes (
  code TEXT PRIMARY KEY,
  value_cents INTEGER NOT NULL,
  remaining_cents INTEGER NOT NULL,
  purchaser_email TEXT
);
```
- Purchased like gift cards
- Can be used as payment method
- Includes 10% bonus (€50 purchased = €55 value)
- Tracks remaining balance

### Orders
```sql
CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  email TEXT,
  total_cents INTEGER,
  coupon_code TEXT,                 -- No FK (supports both coupons & gift_codes)
  items_json TEXT                   -- {cart: [...], coupon_code: "...", discount_cents: ...}
);
```
- Completed purchases
- `items_json` stores full transaction details (JSON)
- `coupon_code` can reference either coupons or gift_codes table
- No FK constraint on `coupon_code` for flexibility

### Order Items
```sql
CREATE TABLE order_items (
  id TEXT PRIMARY KEY,
  order_id TEXT,
  product_id TEXT,
  quantity INTEGER,
  unit_amount INTEGER              -- Stored for historical accuracy
);
```
- Individual line items
- `unit_amount` denormalized (product price may change over time)

### Pending Orders
```sql
CREATE TABLE pending_orders (
  order_id TEXT PRIMARY KEY,
  user_id TEXT,
  email TEXT,
  amount_cents INTEGER,
  items_json TEXT
);
```
- Orders awaiting PayPal payment capture
- Cleaned up after successful capture

### Pending Gifts
```sql
CREATE TABLE pending_gifts (
  order_id TEXT PRIMARY KEY,
  email TEXT,
  amount_cents INTEGER
);
```
- Gift code purchases awaiting PayPal capture
- Cleaned up after successful capture

## Important Design Decisions

### Why No FK on coupon_code?
The `orders.coupon_code` field has **NO FOREIGN KEY constraint** because:
- Can reference `coupons(code)` (discount codes)
- Can reference `gift_codes(code)` (payment codes)
- Can't have FK to multiple tables in SQLite
- Validation handled at application level (safer)

### Why items_json?
The `items_json` field stores the complete transaction:
```json
{
  "cart": [
    {"productId": "test_1", "name": "Item", "unitAmount": 2000, "quantity": 1}
  ],
  "coupon_code": "SAVE10",
  "discount_cents": 200
}
```
Benefits:
- Historical accuracy (product names/prices may change)
- Discount calculation stored (not recalculated)
- Fallback if order_items table has issues
- Full transaction audit trail

## Indexes

Performance indexes on frequently queried columns:
```sql
idx_orders_email              -- Find orders by customer email
idx_orders_user_id            -- Find orders by user
idx_orders_created_at         -- Date range queries
idx_order_items_order_id      -- Get items for order
idx_order_items_product_id    -- Product usage analysis
idx_gift_codes_purchaser      -- Find gift codes by buyer
idx_pending_orders_created_at -- Monitor pending orders
idx_pending_gifts_created_at  -- Monitor pending gifts
```

## Fresh Installation

To set up a fresh database:

```bash
# Option 1: Use individual migrations (recommended for version control)
sqlx migrate run

# Option 2: Use merged schema (for quick setup)
sqlite3 database.db < schema.sql
```

## Backup

To backup database schema:
```bash
# Export schema
sqlite3 database.db ".schema" > backup_schema.sql

# Export data
sqlite3 database.db ".mode csv" ".headers on"
sqlite3 database.db "SELECT * FROM orders;" > backup_orders.csv
```

## Troubleshooting

### "Foreign Key Constraint Failed" on orders insert
- Check migration 0008: Removes bad coupon_code FK
- Run: `sqlite3 database.db < migrations/0008_remove_coupon_code_fk_constraint.sql`

### Order items not appearing
- Check if `order_items` table is empty
- OrderDetails API falls back to `items_json` as backup
- Verify payment webhook captured successfully

### Duplicate product IDs
- Products should have unique IDs
- Check seed data in 0001_init.sql

## Performance Tips

1. **Keep indexes up to date**
   - Especially on frequently filtered columns

2. **Monitor pending_orders cleanup**
   - Should be deleted after successful payment capture

3. **Archive old orders**
   - Consider archiving orders older than 1-2 years

4. **JSON query performance**
   - SQLite 3.38+ supports JSON functions
   - For large datasets, consider normalizing frequently accessed JSON fields

## License

See LICENSE file
