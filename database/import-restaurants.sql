-- Import restaurants from TopTours to BiteReserve
-- This script imports restaurants with country_iso_code and bitereserve_code already assigned
-- 
-- IMPORTANT: Your data already has:
-- - country_iso_code (e.g., "BR", "AW", "NL")
-- - bitereserve_code (e.g., "09991", "00001")
--
-- These map directly to:
-- - country_code = country_iso_code
-- - restaurant_number = bitereserve_code (as integer)

-- ============================================================================
-- STEP 1: Create temp table to hold imported data
-- ============================================================================
CREATE TEMP TABLE temp_restaurants_import (
  id INTEGER,
  destination_id VARCHAR(100),
  google_place_id VARCHAR(255),
  slug VARCHAR(255),
  name VARCHAR(255),
  short_name VARCHAR(255),
  description TEXT,
  tagline VARCHAR(500),
  address TEXT,
  formatted_address TEXT,
  phone VARCHAR(50),
  formatted_phone VARCHAR(50),
  email VARCHAR(255),
  website VARCHAR(500),
  google_maps_url TEXT,
  latitude VARCHAR(50),
  longitude VARCHAR(50),
  google_rating VARCHAR(10),
  review_count INTEGER,
  cuisines TEXT, -- Can be JSON string, array string, or comma-separated
  price_level VARCHAR(10),
  price_range VARCHAR(50),
  opening_hours TEXT, -- JSON string
  address_components TEXT, -- JSON string
  country_iso_code VARCHAR(2), -- Your prepared field
  bitereserve_code VARCHAR(5), -- Your prepared field (5-digit string)
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

-- ============================================================================
-- STEP 2: Insert your exported data here
-- ============================================================================
-- IMPORTANT: You need to export from TopTours first!
-- 
-- In TopTours Supabase, run:
-- SELECT * FROM restaurants WHERE country_iso_code IS NOT NULL;
-- 
-- Then either:
-- A) Export as SQL INSERT statements and paste them here (change table name to temp_restaurants_import)
-- B) Export as CSV and use COPY command
-- C) Use a script to convert your data
--
-- Example format (uncomment and paste your data):
/*
INSERT INTO temp_restaurants_import (
  id, destination_id, google_place_id, slug, name, short_name, description, tagline,
  address, formatted_address, phone, formatted_phone, email, website, google_maps_url,
  latitude, longitude, google_rating, review_count, cuisines, price_level, price_range,
  opening_hours, address_components, country_iso_code, bitereserve_code, created_at, updated_at
) VALUES
  (3411, 'sao-paulo', 'ChIJSReWN-BXzpQRnczEqxxpsFY', 'banzeiro-restaurant-sao-paulo-sao-paulo', 
   'Banzeiro Restaurant - São Paulo', 'Banzeiro Restaurant', '...', '...', 
   'Rua Tabapuã, 830 - Itaim Bibi, São Paulo - SP, 04533-003, Brazil', 
   'Rua Tabapuã, 830 - Itaim Bibi, São Paulo - SP, 04533-003, Brazil',
   '(11) 2501-4777', '(11) 2501-4777', NULL, 'https://grupobanzeiro.com.br/banzeiro-sao-paulo/',
   'https://maps.google.com/?q=-23.5837516,-46.6786732', '-23.58375160', '-46.67867320',
   '4.70', 2065, '["Caribbean & Latin","Seafood"]', NULL, '$$', 
   '[{"days": "Monday", "time": "12:00 – 3:30 PM, 7:00 – 11:30 PM", "label": "Monday"}]',
   '[{"types": ["street_number"], "longText": "830"}]',
   'BR', '09991', NOW(), NOW());
*/

-- ============================================================================
-- STEP 3: Import into BiteReserve restaurants table
-- ============================================================================
INSERT INTO restaurants (
  slug,
  name,
  tagline,
  description,
  address,
  phone,
  website,
  google_place_id,
  google_maps_url,
  rating,
  review_count,
  price_level,
  cuisine,
  hours,
  country_code,
  restaurant_number,
  is_claimed,
  is_active,
  created_at,
  updated_at
)
SELECT 
  -- Generate slug: r/[country_code]/[5-digit-number]
  'r/' || LOWER(country_iso_code) || '/' || LPAD(bitereserve_code, 5, '0') as slug,
  name,
  NULLIF(TRIM(tagline), '') as tagline,
  NULLIF(TRIM(description), '') as description,
  address,
  phone,
  website,
  google_place_id,
  google_maps_url,
  -- Convert rating to decimal
  CASE 
    WHEN google_rating ~ '^[0-9]+\.?[0-9]*$' THEN google_rating::DECIMAL(2,1)
    ELSE NULL
  END as rating,
  review_count,
  price_level,
  -- Convert cuisines to array
  CASE 
    WHEN cuisines IS NULL OR cuisines = '' THEN ARRAY[]::TEXT[]
    WHEN cuisines LIKE '[%' THEN 
      -- JSON array string, parse it
      ARRAY(SELECT jsonb_array_elements_text(cuisines::jsonb))
    WHEN cuisines LIKE '{%' THEN
      -- JSON object (unlikely but handle it)
      ARRAY[]::TEXT[]
    ELSE 
      -- Comma-separated string or single value
      string_to_array(TRIM(cuisines), ',')
  END as cuisine,
  -- Convert opening_hours to JSONB
  CASE 
    WHEN opening_hours IS NULL OR opening_hours = '' THEN NULL
    WHEN opening_hours::TEXT LIKE '[%' OR opening_hours::TEXT LIKE '{%' THEN opening_hours::JSONB
    ELSE NULL
  END as hours,
  -- Use your prepared country code (convert to lowercase)
  LOWER(TRIM(country_iso_code)) as country_code,
  -- Use your prepared bitereserve_code (store as VARCHAR to preserve leading zeros - 1:1 match)
  LPAD(TRIM(bitereserve_code), 5, '0') as restaurant_number,
  false as is_claimed, -- All imported restaurants start unclaimed
  true as is_active,
  COALESCE(created_at, NOW()) as created_at,
  COALESCE(updated_at, NOW()) as updated_at
FROM temp_restaurants_import
WHERE country_iso_code IS NOT NULL 
  AND bitereserve_code IS NOT NULL
  AND TRIM(country_iso_code) != ''
  AND TRIM(bitereserve_code) != ''
ON CONFLICT (country_code, restaurant_number) DO UPDATE
SET
  name = EXCLUDED.name,
  tagline = EXCLUDED.tagline,
  description = EXCLUDED.description,
  address = EXCLUDED.address,
  phone = EXCLUDED.phone,
  website = EXCLUDED.website,
  rating = EXCLUDED.rating,
  review_count = EXCLUDED.review_count,
  updated_at = NOW();

-- ============================================================================
-- STEP 4: Verify import
-- ============================================================================
SELECT 
  country_code,
  COUNT(*) as imported_count,
  MIN(restaurant_number) as min_number,
  MAX(restaurant_number) as max_number
FROM restaurants
WHERE country_code IS NOT NULL
GROUP BY country_code
ORDER BY imported_count DESC;

-- Show example slugs
SELECT 
  name,
  country_code,
  restaurant_number,
  slug
FROM restaurants
WHERE country_code IS NOT NULL
ORDER BY country_code, restaurant_number
LIMIT 20;

-- Check for any issues
SELECT 
  COUNT(*) as total_imported,
  COUNT(DISTINCT country_code) as countries,
  COUNT(*) FILTER (WHERE country_code IS NULL) as missing_country_code,
  COUNT(*) FILTER (WHERE restaurant_number IS NULL) as missing_restaurant_number
FROM restaurants
WHERE country_code IS NOT NULL;

-- Clean up
DROP TABLE IF EXISTS temp_restaurants_import;
