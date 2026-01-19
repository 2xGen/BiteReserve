-- Link "La Terrazza del Mare" restaurant to matthijs@2xgen.com user
-- Run this AFTER running sync-auth-user.sql
-- Run this in Supabase SQL Editor

UPDATE restaurants
SET user_id = '175bc039-1789-4c43-b74d-25ba9700e2f7',
    is_claimed = true
WHERE slug = 'la-terrazza-del-mare';

-- Verify the update
SELECT 
  r.id,
  r.name,
  r.slug,
  r.is_claimed,
  u.email as owner_email,
  u.name as owner_name
FROM restaurants r
LEFT JOIN users u ON r.user_id = u.id
WHERE r.slug = 'la-terrazza-del-mare';
