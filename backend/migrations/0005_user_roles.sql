-- Add user roles (idempotent - works with older SQLite versions)
-- First check if the role column exists using PRAGMA table_info
CREATE TEMPORARY TABLE temp_check_role AS
SELECT COUNT(*) AS exists_flag FROM pragma_table_info('users') WHERE name = 'role';

-- Only add the column if it doesn't exist
INSERT INTO users (role)
SELECT 'customer'
WHERE (SELECT exists_flag FROM temp_check_role) = 0
AND NOT EXISTS (SELECT 1 FROM users LIMIT 1);

-- For existing rows, set default value
UPDATE users SET role = 'customer' WHERE role IS NULL;

-- Drop temporary table
DROP TABLE temp_check_role;


