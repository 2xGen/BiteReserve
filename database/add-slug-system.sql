-- Add slug system for restaurants
-- Format: /r/[country-code]/[5-digit-number]
-- Example: /r/nl/04480
-- Run this in Supabase SQL Editor

-- Add columns for slug system
-- restaurant_number is VARCHAR(5) to preserve leading zeros (1:1 match with CSV)
ALTER TABLE restaurants 
  ADD COLUMN IF NOT EXISTS country_code VARCHAR(2),
  ADD COLUMN IF NOT EXISTS restaurant_number VARCHAR(5);

-- Create unique constraint on country_code + restaurant_number combination
CREATE UNIQUE INDEX IF NOT EXISTS idx_restaurants_country_number 
ON restaurants(country_code, restaurant_number);

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_restaurants_country_code ON restaurants(country_code);
CREATE INDEX IF NOT EXISTS idx_restaurants_number ON restaurants(restaurant_number);

-- Function to get next restaurant number for a country
-- Returns VARCHAR(5) to preserve leading zeros
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

-- Update existing restaurant (La Terrazza del Mare) - assuming it's in US
-- You'll need to update this based on actual country
UPDATE restaurants
SET 
  country_code = 'us',
  restaurant_number = '00001' -- VARCHAR, preserve leading zeros
WHERE slug = 'la-terrazza-del-mare'
AND country_code IS NULL;

-- Verify the update
SELECT 
  id,
  name,
  slug,
  country_code,
  restaurant_number,
  country_code || '/' || restaurant_number as full_slug -- Already padded in VARCHAR
FROM restaurants
WHERE slug = 'la-terrazza-del-mare';
