-- Import restaurants from TopTours SQL export to BiteReserve
-- This script should be run in BiteReserve Supabase SQL Editor
-- 
-- BEFORE RUNNING:
-- 1. Export your TopTours restaurants table as SQL INSERT statements
-- 2. Copy the INSERT statements below (or reference them)
-- 3. Update the destination_id → country_code mapping
-- 4. Run this script

-- Step 1: Create a temporary table to hold the imported data
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
  cuisines TEXT[], -- or JSON
  price_level VARCHAR(10),
  price_range VARCHAR(50),
  opening_hours TEXT, -- JSON string
  address_components TEXT, -- JSON string
  -- Add other fields as needed
);

-- Step 2: Insert your exported data into temp table
-- Copy your INSERT statements here, but change the table name to temp_restaurants_import
-- Example:
-- INSERT INTO temp_restaurants_import (id, destination_id, name, ...) VALUES (...);

-- Step 3: Map destination_id to country_code and assign restaurant numbers
WITH country_mapping AS (
  SELECT 
    id,
    destination_id,
    CASE 
      WHEN destination_id = 'aruba' THEN 'aw'
      WHEN destination_id = 'barbados' THEN 'bb'
      WHEN destination_id = 'bahamas' THEN 'bs'
      WHEN destination_id = 'jamaica' THEN 'jm'
      WHEN destination_id = 'netherlands' OR destination_id = 'amsterdam' THEN 'nl'
      WHEN destination_id = 'france' OR destination_id = 'paris' THEN 'fr'
      WHEN destination_id = 'spain' OR destination_id = 'barcelona' OR destination_id = 'madrid' THEN 'es'
      WHEN destination_id = 'italy' OR destination_id = 'rome' THEN 'it'
      WHEN destination_id = 'united-states' OR destination_id = 'usa' OR destination_id = 'us' THEN 'us'
      WHEN destination_id = 'canada' THEN 'ca'
      WHEN destination_id = 'mexico' THEN 'mx'
      -- Add more mappings as needed
      ELSE 'us' -- Default
    END as country_code
  FROM temp_restaurants_import
),
numbered_restaurants AS (
  SELECT 
    t.*,
    cm.country_code,
    ROW_NUMBER() OVER (PARTITION BY cm.country_code ORDER BY t.id) as restaurant_number
  FROM temp_restaurants_import t
  JOIN country_mapping cm ON t.id = cm.id
)

-- Step 4: Insert into BiteReserve restaurants table
INSERT INTO restaurants (
  slug,
  name,
  tagline,
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
  -- Generate slug from country_code + restaurant_number
  'r/' || country_code || '/' || LPAD(restaurant_number::TEXT, 5, '0') as slug,
  name,
  NULLIF(tagline, '') as tagline,
  address,
  phone,
  website,
  google_place_id,
  google_maps_url,
  CASE 
    WHEN google_rating ~ '^[0-9]+\.?[0-9]*$' THEN google_rating::DECIMAL(2,1)
    ELSE NULL
  END as rating,
  review_count,
  price_level,
  CASE 
    WHEN cuisines IS NULL THEN ARRAY[]::TEXT[]
    WHEN cuisines::TEXT LIKE '[%' THEN cuisines::TEXT[] -- Already an array
    ELSE ARRAY[cuisines::TEXT] -- Single value
  END as cuisine,
  CASE 
    WHEN opening_hours IS NULL OR opening_hours = '' THEN NULL
    ELSE opening_hours::JSONB
  END as hours,
  country_code,
  restaurant_number,
  false as is_claimed, -- All imported restaurants start unclaimed
  true as is_active,
  NOW() as created_at,
  NOW() as updated_at
FROM numbered_restaurants
ON CONFLICT (country_code, restaurant_number) DO NOTHING; -- Skip duplicates

-- Step 5: Verify import
SELECT 
  country_code,
  COUNT(*) as imported_count,
  MIN(restaurant_number) as min_number,
  MAX(restaurant_number) as max_number
FROM restaurants
WHERE country_code IS NOT NULL
GROUP BY country_code
ORDER BY imported_count DESC;

-- Step 6: Show some examples
SELECT 
  name,
  country_code,
  restaurant_number,
  '/r/' || country_code || '/' || LPAD(restaurant_number::TEXT, 5, '0') as bitereserve_slug
FROM restaurants
WHERE country_code IS NOT NULL
ORDER BY country_code, restaurant_number
LIMIT 20;

-- Clean up temp table
DROP TABLE IF EXISTS temp_restaurants_import;
