-- Sync user from auth.users to users table
-- Run this in Supabase SQL Editor

-- Insert user record if it doesn't exist
INSERT INTO users (id, email, name, created_at, updated_at)
SELECT 
  id,
  email,
  raw_user_meta_data->>'full_name' as name,
  created_at,
  updated_at
FROM auth.users
WHERE id = '175bc039-1789-4c43-b74d-25ba9700e2f7'
AND NOT EXISTS (
  SELECT 1 FROM users WHERE id = '175bc039-1789-4c43-b74d-25ba9700e2f7'
);

-- Verify the user was created
SELECT * FROM users WHERE id = '175bc039-1789-4c43-b74d-25ba9700e2f7';
