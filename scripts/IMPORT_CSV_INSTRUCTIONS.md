# Import Restaurants from CSV

## Quick Start

1. **Make sure slug system columns exist:**
   - Run `database/add-slug-system.sql` in Supabase SQL Editor first
   - This adds `country_code` and `restaurant_number` columns

2. **Run the import script:**
   ```bash
   npm run import:csv
   ```

## What It Does

- ✅ Reads CSV file from: `C:\Users\matth\OneDrive\Bureaublad\Werk\BiteReserve\New folder (2)\restaurants_rows.csv`
- ✅ Parses all rows
- ✅ Filters rows with valid `country_iso_code` and `bitereserve_code`
- ✅ Generates slugs: `r/[country_code]/[5-digit-number]`
- ✅ Converts data types (cuisines → array, hours → JSONB, rating → decimal)
- ✅ Inserts in batches of 50 (to avoid timeouts)
- ✅ Uses upsert (updates if exists, inserts if new)
- ✅ Shows progress and final statistics

## Expected Output

```
📖 Reading CSV file...
📊 Parsing CSV...
✅ Found 3200 restaurants
✅ 3200 restaurants have valid country_iso_code and bitereserve_code

📥 Inserting into restaurants table in batches...
✅ Imported 3200/3200 restaurants...

✅ Successfully imported 3200 restaurants

📊 Verifying import...
✅ Total restaurants in database: 3200
✅ Countries: aw, br, jm, nl, us, ...

🎉 Import complete!
```

## Troubleshooting

**Error: "column country_code does not exist"**
- Run `database/add-slug-system.sql` first!

**Error: "relation restaurants does not exist"**
- Run `database/schema.sql` first to create all tables

**Import is slow**
- This is normal for 3200+ restaurants
- The script shows progress as it imports

**Some rows fail**
- Check the error messages
- Common issues: invalid JSON in `opening_hours` or `cuisines`
- The script continues even if some batches fail
