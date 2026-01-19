-- ⚠️  THIS FILE WON'T WORK AS-IS ⚠️
-- 
-- This file references columns (country_iso_code, bitereserve_code) that exist
-- in TopTours database, NOT in BiteReserve database.
--
-- You MUST export data from TopTours first, then use ONE of these approaches:
--
-- OPTION 1 (Recommended): Use import-restaurants.sql with temp table
--   1. Export from TopTours as SQL INSERT statements
--   2. Paste them into import-restaurants.sql (Step 2)
--   3. Run the script
--
-- OPTION 2: Modify your INSERT statements directly
--   1. Export from TopTours as SQL INSERT statements  
--   2. Change column names to match BiteReserve schema
--   3. Generate slug: 'r/' || LOWER(country_iso_code) || '/' || bitereserve_code
--   4. Insert directly into restaurants table
--
-- OPTION 3: Use database link (FDW) - only if same Supabase org
--   Requires setting up PostgreSQL Foreign Data Wrapper

-- Option 1: If you have a database link set up
-- CREATE EXTENSION IF NOT EXISTS postgres_fdw;
-- (Then create foreign server and user mapping)

-- Option 2: Direct INSERT from exported data
-- Just modify your INSERT statements to insert into BiteReserve restaurants table

-- Direct import template (adjust column order to match your INSERT statements):
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
  -- Generate slug: r/[country_code]/[5-digit-code]
  'r/' || LOWER(country_iso_code) || '/' || bitereserve_code as slug,
  
  -- Direct mappings
  name,
  NULLIF(tagline, '') as tagline,
  NULLIF(description, '') as description,
  address,
  phone,
  website,
  google_place_id,
  google_maps_url,
  
  -- Convert rating
  CASE 
    WHEN google_rating ~ '^[0-9]+\.?[0-9]*$' THEN google_rating::DECIMAL(2,1)
    ELSE NULL
  END as rating,
  
  review_count,
  price_level,
  
  -- Cuisines: already an array in TopTours, use directly
  cuisines::TEXT[] as cuisine,
  
  -- Opening hours: JSON string → JSONB
  CASE 
    WHEN opening_hours IS NULL OR opening_hours = '' THEN NULL
    ELSE opening_hours::JSONB
  END as hours,
  
  -- Your prepared fields
  LOWER(country_iso_code) as country_code,
  bitereserve_code::INTEGER as restaurant_number,
  
  -- Defaults
  false as is_claimed,
  true as is_active,
  COALESCE(created_at, NOW()) as created_at,
  COALESCE(updated_at, NOW()) as updated_at

-- FROM your_source_table
-- Replace this with your actual source:
-- Option A: If using database link
-- FROM toptours_restaurants@toptours_server

-- Option B: If importing from exported SQL
-- Just paste your INSERT statements here, but change:
-- INSERT INTO restaurants (...) VALUES (...)
-- Instead of: INSERT INTO toptours_restaurants (...) VALUES (...)

WHERE country_iso_code IS NOT NULL 
  AND bitereserve_code IS NOT NULL
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

-- Verification
SELECT 
  country_code,
  COUNT(*) as imported_count,
  MIN(restaurant_number) as min_number,
  MAX(restaurant_number) as max_number
FROM restaurants
WHERE country_code IS NOT NULL
GROUP BY country_code
ORDER BY imported_count DESC;
