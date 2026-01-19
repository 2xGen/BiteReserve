-- Pre-Import Check: Verify restaurants table is ready for CSV import
-- Run this BEFORE running the CSV import script
-- This checks if all required columns and constraints exist

-- ============================================================================
-- CHECK 1: Verify slug system columns exist
-- ============================================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'restaurants' 
    AND column_name = 'country_code'
  ) THEN
    RAISE EXCEPTION '❌ MISSING: country_code column does not exist. Run database/add-slug-system.sql first!';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'restaurants' 
    AND column_name = 'restaurant_number'
  ) THEN
    RAISE EXCEPTION '❌ MISSING: restaurant_number column does not exist. Run database/add-slug-system.sql first!';
  END IF;
  
  RAISE NOTICE '✅ CHECK 1 PASSED: country_code and restaurant_number columns exist';
END $$;

-- ============================================================================
-- CHECK 2: Verify unique constraint exists
-- ============================================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'restaurants' 
    AND indexname = 'idx_restaurants_country_number'
  ) THEN
    RAISE EXCEPTION '❌ MISSING: Unique constraint on (country_code, restaurant_number) does not exist. Run database/add-slug-system.sql first!';
  END IF;
  
  RAISE NOTICE '✅ CHECK 2 PASSED: Unique constraint exists';
END $$;

-- ============================================================================
-- CHECK 3: Verify all required columns exist
-- ============================================================================
DO $$
DECLARE
  required_columns TEXT[] := ARRAY[
    'slug', 'name', 'tagline', 'description', 'address', 'phone', 'website',
    'google_place_id', 'google_maps_url', 'rating', 'review_count', 'price_level',
    'cuisine', 'hours', 'is_claimed', 'is_active'
  ];
  missing_columns TEXT[];
BEGIN
  SELECT ARRAY_AGG(col)
  INTO missing_columns
  FROM unnest(required_columns) AS col
  WHERE NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'restaurants' 
    AND column_name = col
  );
  
  IF missing_columns IS NOT NULL AND array_length(missing_columns, 1) > 0 THEN
    RAISE EXCEPTION '❌ MISSING COLUMNS: % - Run database/schema.sql first!', array_to_string(missing_columns, ', ');
  END IF;
  
  RAISE NOTICE '✅ CHECK 3 PASSED: All required columns exist';
END $$;

-- ============================================================================
-- CHECK 4: Show current table structure
-- ============================================================================
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'restaurants'
ORDER BY ordinal_position;

-- ============================================================================
-- CHECK 5: Show indexes
-- ============================================================================
SELECT 
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'restaurants'
ORDER BY indexname;

-- ============================================================================
-- SUMMARY
-- ============================================================================
SELECT 
  '✅ All checks passed! Ready to import CSV.' as status,
  COUNT(*) as total_restaurants,
  COUNT(DISTINCT country_code) as countries
FROM restaurants
WHERE country_code IS NOT NULL;
