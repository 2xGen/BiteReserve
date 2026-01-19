# Migrate restaurant_number from INTEGER to VARCHAR

## Why?
To preserve leading zeros and have a 1:1 match with `bitereserve_code` from CSV.
- Before: `7891` (integer, loses leading zero)
- After: `07891` (VARCHAR, preserves leading zero)

## Steps

### Step 1: Run the Migration
```sql
-- In Supabase SQL Editor
-- Run: database/change-restaurant-number-to-varchar.sql
```

This will:
- ✅ Convert existing integer values to VARCHAR with padding
- ✅ Change column type from INTEGER to VARCHAR(5)
- ✅ Recreate unique constraint
- ✅ Update the `get_next_restaurant_number()` function
- ✅ Verify the changes

### Step 2: Verify
```sql
-- Check column type
SELECT column_name, data_type, character_maximum_length
FROM information_schema.columns
WHERE table_name = 'restaurants'
AND column_name = 'restaurant_number';

-- Should show: VARCHAR(5)
```

### Step 3: Check Examples
```sql
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
LIMIT 10;
```

All should show "✅ Match" - slug and restaurant_number should be identical.

## What Changed

### Database
- `restaurant_number`: INTEGER → VARCHAR(5)
- Preserves leading zeros (e.g., "07891" instead of 7891)

### Code
- ✅ `scripts/import-csv-to-supabase.ts` - Stores as string
- ✅ `lib/slug-utils.ts` - Handles string or number
- ✅ `database/add-slug-system.sql` - Uses VARCHAR(5)
- ✅ `database/import-restaurants.sql` - Uses LPAD to preserve zeros

## After Migration

When importing new restaurants:
- `restaurant_number` will be stored as "07891" (string)
- Slug will be `r/ph/07891`
- Perfect 1:1 match with CSV `bitereserve_code`
