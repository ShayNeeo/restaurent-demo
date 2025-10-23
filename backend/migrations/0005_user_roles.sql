-- Add user roles (idempotent - only add if column doesn't exist)
ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'customer';


