-- Add user roles
ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'customer';


