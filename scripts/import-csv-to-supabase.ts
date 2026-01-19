import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import { parse } from 'csv-parse/sync'

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  process.exit(1)
}

// Use service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

interface CSVRow {
  id: string
  name: string
  tagline: string
  description: string
  address: string
  phone: string
  website: string
  google_place_id: string
  google_maps_url: string
  google_rating: string
  review_count: string
  cuisines: string
  price_level: string
  opening_hours: string
  country_iso_code: string
  bitereserve_code: string
  [key: string]: any
}

async function importFromCSV() {
  const csvPath = 'C:\\Users\\matth\\OneDrive\\Bureaublad\\Werk\\BiteReserve\\New folder (2)\\restaurants_rows.csv'
  
  console.log('📖 Reading CSV file...')
  const csvContent = fs.readFileSync(csvPath, 'utf-8')
  
  console.log('📊 Parsing CSV...')
  const records: CSVRow[] = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    relax_quotes: true,
    escape: '"',
  })
  
  console.log(`✅ Found ${records.length} restaurants`)
  
  // Filter out rows without country_iso_code or bitereserve_code
  const validRecords = records.filter(r => 
    r.country_iso_code && r.bitereserve_code && 
    r.country_iso_code.trim() !== '' && r.bitereserve_code.trim() !== ''
  )
  
  console.log(`✅ ${validRecords.length} restaurants have valid country_iso_code and bitereserve_code`)
  
  try {
    // Insert directly into restaurants table in batches
    console.log('\n📥 Inserting into restaurants table in batches...')
    
    const batchSize = 50 // Smaller batches for reliability
    let imported = 0
    let errors = 0
    
    for (let i = 0; i < validRecords.length; i += batchSize) {
      const batch = validRecords.slice(i, i + batchSize)
      
      const insertData = batch.map(row => {
        // Parse cuisines
        let cuisineArray: string[] = []
        if (row.cuisines) {
          try {
            if (row.cuisines.startsWith('[')) {
              const parsed = JSON.parse(row.cuisines)
              cuisineArray = Array.isArray(parsed) ? parsed : []
            } else {
              cuisineArray = row.cuisines.split(',').map((c: string) => c.trim()).filter(Boolean)
            }
          } catch {
            cuisineArray = []
          }
        }
        
        // Parse rating
        let rating: number | null = null
        if (row.google_rating) {
          const parsed = parseFloat(row.google_rating)
          if (!isNaN(parsed)) rating = parsed
        }
        
        // Parse opening hours to JSONB (Supabase expects object/array, not string)
        let hours: any = null
        if (row.opening_hours && row.opening_hours.trim() !== '') {
          try {
            if (row.opening_hours.startsWith('[') || row.opening_hours.startsWith('{')) {
              hours = JSON.parse(row.opening_hours)
            }
          } catch (e) {
            // Invalid JSON, skip
            console.warn(`Invalid JSON in opening_hours for ${row.name}: ${row.opening_hours.substring(0, 50)}...`)
          }
        }
        
        // Generate slug and restaurant number (preserve leading zeros)
        const countryCode = row.country_iso_code.toLowerCase().trim()
        const restaurantNum = row.bitereserve_code.trim().padStart(5, '0') // Ensure 5 digits
        const slug = `r/${countryCode}/${restaurantNum}`
        
        return {
          slug,
          name: row.name || null,
          tagline: row.tagline || null,
          description: row.description || null,
          address: row.address || null,
          phone: row.phone || null,
          website: row.website || null,
          google_place_id: row.google_place_id || null,
          google_maps_url: row.google_maps_url || null,
          rating,
          review_count: parseInt(row.review_count) || null,
          price_level: row.price_level || null,
          cuisine: cuisineArray.length > 0 ? cuisineArray : null,
          hours: hours, // JSON object/array, Supabase converts to JSONB
          country_code: countryCode,
          restaurant_number: restaurantNum, // Store as string to preserve leading zeros (1:1 match with CSV)
          is_claimed: false,
          is_active: true,
        }
      })
      
      // Insert batch using upsert
      // Note: Supabase upsert uses the primary key or unique constraint
      // Since we have unique index on (country_code, restaurant_number), we need to use that
      const { data, error } = await supabase
        .from('restaurants')
        .upsert(insertData, {
          onConflict: 'country_code,restaurant_number',
        })
      
      if (error) {
        console.error(`\n❌ Error in batch ${Math.floor(i / batchSize) + 1}:`, error.message)
        console.error(`   First restaurant in batch: ${batch[0]?.name || 'unknown'}`)
        errors++
        // Continue with next batch
      } else {
        imported += batch.length
        process.stdout.write(`\r✅ Imported ${imported}/${validRecords.length} restaurants...`)
      }
    }
    
    console.log(`\n\n✅ Successfully imported ${imported} restaurants`)
    if (errors > 0) {
      console.log(`⚠️  ${errors} batches had errors`)
    }
    
    // Verify
    console.log('\n📊 Verifying import...')
    const { data: stats, error: statsError } = await supabase
      .from('restaurants')
      .select('country_code')
      .not('country_code', 'is', null)
    
    if (!statsError && stats) {
      const countries = new Set(stats.map((r: any) => r.country_code))
      const total = stats.length
      console.log(`✅ Total restaurants in database: ${total}`)
      console.log(`✅ Countries: ${Array.from(countries).sort().join(', ')}`)
    }
    
    console.log('\n🎉 Import complete!')
    
  } catch (error: any) {
    console.error('\n❌ Import failed:', error.message)
    process.exit(1)
  }
}

// Run import
importFromCSV().catch(console.error)
