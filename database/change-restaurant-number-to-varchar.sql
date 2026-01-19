-- Change restaurant_number from INTEGER to VARCHAR to preserve leading zeros
-- This ensures 1:1 match with bitereserve_code from CSV
-- Run this in Supabase SQL Editor

-- ============================================================================
-- STEP 1: Drop the unique constraint (it will be recreated)
-- ============================================================================
DROP INDEX IF EXISTS idx_restaurants_country_number;

-- ============================================================================
-- STEP 2: Convert existing integer values to VARCHAR with padding
-- ============================================================================
-- First, update existing values to be padded to 5 digits
UPDATE restaurants
SET restaurant_number = LPAD(restaurant_number::TEXT, 5, '0')
WHERE restaurant_number IS NOT NULL
  AND restaurant_number::TEXT::INTEGER < 10000; -- Only pad if less than 5 digits

-- ============================================================================
-- STEP 3: Change column type from INTEGER to VARCHAR(5)
-- ============================================================================
ALTER TABLE restaurants 
  ALTER COLUMN restaurant_number TYPE VARCHAR(5) 
  USING restaurant_number::TEXT;

-- ============================================================================
-- STEP 4: Recreate unique constraint
-- ============================================================================
CREATE UNIQUE INDEX idx_restaurants_country_number 
ON restaurants(country_code, restaurant_number);

-- ============================================================================
-- STEP 5: Update the get_next_restaurant_number function
-- ============================================================================
CREATE OR REPLACE FUNCTION get_next_restaurant_number(p_country_code VARCHAR(2))
RETURNS VARCHAR(5) AS $$
DECLARE
  v_max_number INTEGER;
  v_next_number VARCHAR(5);
BEGIN
  -- Get max number (convert VARCHAR to INTEGER for comparison)
  SELECT COALESCE(MAX(restaurant_number::INTEGER), 0) + 1
  INTO v_max_number
  FROM restaurants
  WHERE country_code = p_country_code;
  
  -- Pad to 5 digits
  v_next_number := LPAD(v_max_number::TEXT, 5, '0');
  
  RETURN v_next_number;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- STEP 6: Verify the change
-- ============================================================================
SELECT 
  column_name,
  data_type,
  character_maximum_length
FROM information_schema.columns
WHERE table_name = 'restaurants'
AND column_name = 'restaurant_number';

-- Show some examples
SELECT 
  name,
  country_code,
  restaurant_number,
  slug,
  CASE 
    WHEN slug = 'r/' || country_code || '/' || restaurant_number THEN '✅ Match'
    ELSE '❌ Mismatch'
  END as slug_match
FROM restaurants
WHERE country_code IS NOT NULL
ORDER BY country_code, restaurant_number
LIMIT 10;
