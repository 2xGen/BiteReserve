-- Pad existing restaurant_number values to 5 digits with leading zeros
-- This ensures slugs match: r/ph/07891 (not r/ph/7891)
-- Run this in Supabase SQL Editor

-- ============================================================================
-- STEP 1: Change column type to VARCHAR(5) if it's still INTEGER
-- ============================================================================
-- Check current type first
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'restaurants' 
    AND column_name = 'restaurant_number'
    AND data_type = 'integer'
  ) THEN
    -- Drop constraint temporarily
    DROP INDEX IF EXISTS idx_restaurants_country_number;
    
    -- Convert to VARCHAR
    ALTER TABLE restaurants 
      ALTER COLUMN restaurant_number TYPE VARCHAR(5) 
      USING LPAD(restaurant_number::TEXT, 5, '0');
    
    -- Recreate constraint
    CREATE UNIQUE INDEX idx_restaurants_country_number 
    ON restaurants(country_code, restaurant_number);
    
    RAISE NOTICE '✅ Changed restaurant_number from INTEGER to VARCHAR(5)';
  ELSE
    RAISE NOTICE '✅ restaurant_number is already VARCHAR';
  END IF;
END $$;

-- ============================================================================
-- STEP 2: Pad all existing values to 5 digits
-- ============================================================================
UPDATE restaurants
SET restaurant_number = LPAD(restaurant_number, 5, '0')
WHERE restaurant_number IS NOT NULL
  AND LENGTH(restaurant_number) < 5;

-- ============================================================================
-- STEP 3: Update slugs to match restaurant_number
-- ============================================================================
UPDATE restaurants
SET slug = 'r/' || country_code || '/' || restaurant_number
WHERE country_code IS NOT NULL
  AND restaurant_number IS NOT NULL
  AND slug != 'r/' || country_code || '/' || restaurant_number;

-- ============================================================================
-- STEP 4: Verify
-- ============================================================================
SELECT 
  name,
  country_code,
  restaurant_number,
  slug,
  CASE 
    WHEN slug = 'r/' || country_code || '/' || restaurant_number THEN '✅ Match'
    ELSE '❌ Mismatch: ' || slug || ' vs r/' || country_code || '/' || restaurant_number
  END as status
FROM restaurants
WHERE country_code IS NOT NULL
ORDER BY country_code, restaurant_number
LIMIT 20;

-- Summary
SELECT 
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE LENGTH(restaurant_number) = 5) as padded_5_digits,
  COUNT(*) FILTER (WHERE slug = 'r/' || country_code || '/' || restaurant_number) as slugs_match
FROM restaurants
WHERE country_code IS NOT NULL;
