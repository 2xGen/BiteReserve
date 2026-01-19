# Pre-Import Checklist

## ✅ Before Running CSV Import

### Step 1: Run Schema (if not done)
```sql
-- In Supabase SQL Editor
-- Run: database/schema.sql
```
This creates the base `restaurants` table.

### Step 2: Add Slug System Columns (REQUIRED)
```sql
-- In Supabase SQL Editor  
-- Run: database/add-slug-system.sql
```
This adds:
- `country_code` column
- `restaurant_number` column
- Unique constraint on `(country_code, restaurant_number)`
- Indexes for fast lookups

### Step 3: Verify Everything is Ready
```sql
-- In Supabase SQL Editor
-- Run: database/pre-import-check.sql
```
This will:
- ✅ Check if `country_code` exists
- ✅ Check if `restaurant_number` exists
- ✅ Check if unique constraint exists
- ✅ Check if all required columns exist
- ✅ Show current table structure

**If any check fails, fix it before importing!**

### Step 4: Run CSV Import
```bash
npm run import:csv
```

## Quick Verification Query

Run this to see if columns exist:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'restaurants' 
AND column_name IN ('country_code', 'restaurant_number');
```

Should return 2 rows. If it returns 0 rows, run `database/add-slug-system.sql` first!
