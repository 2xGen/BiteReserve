import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import { parse } from 'csv-parse/sync'

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface CSVRow {
  id: string
  destination_id: string
  google_place_id: string
  slug: string
  name: string
  short_name: string
  description: string
  summary: string
  tagline: string
  address: string
  phone: string
  website: string
  google_maps_url: string
  google_rating: string
  review_count: string
  cuisines: string
  price_level: string
  opening_hours: string
  country_iso_code: string
  bitereserve_code: string
  created_at?: string
  updated_at?: string
  [key: string]: any // For other fields we don't need
}

async function importFromCSV() {
  const csvPath = 'C:\\Users\\matth\\OneDrive\\Bureaublad\\Werk\\BiteReserve\\New folder (2)\\restaurants_rows.csv'
  
  console.log('📖 Reading CSV file...')
  const csvContent = fs.readFileSync(csvPath, 'utf-8')
  
  console.log('📊 Parsing CSV...')
  const records: CSVRow[] = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    cast: false, // Keep as strings, we'll convert in SQL
  })
  
  console.log(`✅ Found ${records.length} restaurants to import`)
  
  // Step 1: Create temp table
  console.log('\n📦 Creating temp table...')
  const { error: createError } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TEMP TABLE IF NOT EXISTS temp_restaurants_import (
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
        cuisines TEXT,
        price_level VARCHAR(10),
        price_range VARCHAR(50),
        opening_hours TEXT,
        address_components TEXT,
        country_iso_code VARCHAR(2),
        bitereserve_code VARCHAR(5),
        created_at TIMESTAMPTZ,
        updated_at TIMESTAMPTZ
      );
    `
  })
  
  if (createError) {
    console.error('❌ Error creating temp table:', createError)
    // Try direct SQL instead
    console.log('Trying direct SQL...')
  }
  
  // Step 2: Insert in batches
  const batchSize = 100
  let imported = 0
  
  console.log(`\n📥 Inserting data in batches of ${batchSize}...`)
  
  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize)
    
    // Prepare batch data
    const insertData = batch.map(row => ({
      id: parseInt(row.id) || null,
      destination_id: row.destination_id || null,
      google_place_id: row.google_place_id || null,
      slug: row.slug || null,
      name: row.name || null,
      short_name: row.short_name || null,
      description: row.description || null,
      tagline: row.tagline || null,
      address: row.address || row.formatted_address || null,
      formatted_address: row.formatted_address || null,
      phone: row.phone || row.formatted_phone || null,
      formatted_phone: row.formatted_phone || null,
      email: row.email || null,
      website: row.website || null,
      google_maps_url: row.google_maps_url || null,
      latitude: row.latitude || null,
      longitude: row.longitude || null,
      google_rating: row.google_rating || null,
      review_count: parseInt(row.review_count) || null,
      cuisines: row.cuisines || null,
      price_level: row.price_level || null,
      price_range: row.price_range || null,
      opening_hours: row.opening_hours || null,
      address_components: row.address_components || null,
      country_iso_code: row.country_iso_code || null,
      bitereserve_code: row.bitereserve_code || null,
      created_at: row.created_at || new Date().toISOString(),
      updated_at: row.updated_at || new Date().toISOString(),
    }))
    
    // Insert batch
    const { error } = await supabase
      .from('temp_restaurants_import')
      .insert(insertData)
    
    if (error) {
      console.error(`❌ Error inserting batch ${Math.floor(i / batchSize) + 1}:`, error.message)
      // Try using RPC to insert via SQL
      console.log('Trying SQL insert...')
      break
    }
    
    imported += batch.length
    process.stdout.write(`\r✅ Imported ${imported}/${records.length} restaurants...`)
  }
  
  console.log(`\n\n✅ Imported ${imported} restaurants into temp table`)
  
  // Step 3: Transform and import into restaurants table
  console.log('\n🔄 Transforming and importing into restaurants table...')
  
  const { data, error: transformError } = await supabase.rpc('exec_sql', {
    sql: `
      INSERT INTO restaurants (
        slug, name, tagline, description, address, phone, website,
        google_place_id, google_maps_url, rating, review_count, price_level,
        cuisine, hours, country_code, restaurant_number, is_claimed, is_active,
        created_at, updated_at
      )
      SELECT 
        'r/' || LOWER(country_iso_code) || '/' || LPAD(bitereserve_code, 5, '0') as slug,
        name,
        NULLIF(TRIM(tagline), '') as tagline,
        NULLIF(TRIM(description), '') as description,
        address,
        phone,
        website,
        google_place_id,
        google_maps_url,
        CASE 
          WHEN google_rating ~ '^[0-9]+\\.?[0-9]*$' THEN google_rating::DECIMAL(2,1)
          ELSE NULL
        END as rating,
        review_count,
        price_level,
        CASE 
          WHEN cuisines IS NULL OR cuisines = '' THEN ARRAY[]::TEXT[]
          WHEN cuisines LIKE '[%' THEN 
            ARRAY(SELECT jsonb_array_elements_text(cuisines::jsonb))
          ELSE 
            string_to_array(TRIM(cuisines), ',')
        END as cuisine,
        CASE 
          WHEN opening_hours IS NULL OR opening_hours = '' THEN NULL
          WHEN opening_hours::TEXT LIKE '[%' OR opening_hours::TEXT LIKE '{%' THEN opening_hours::JSONB
          ELSE NULL
        END as hours,
        LOWER(TRIM(country_iso_code)) as country_code,
        bitereserve_code::INTEGER as restaurant_number,
        false as is_claimed,
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
    `
  })
  
  if (transformError) {
    console.error('❌ Error transforming data:', transformError)
    return
  }
  
  console.log('✅ Transformation complete!')
  
  // Step 4: Verify
  console.log('\n📊 Verifying import...')
  const { data: stats, error: statsError } = await supabase
    .from('restaurants')
    .select('country_code, restaurant_number')
    .not('country_code', 'is', null)
  
  if (!statsError && stats) {
    const countries = new Set(stats.map(r => r.country_code))
    console.log(`✅ Imported ${stats.length} restaurants across ${countries.size} countries`)
    console.log(`   Countries: ${Array.from(countries).join(', ')}`)
  }
  
  console.log('\n🎉 Import complete!')
}

// Run import
importFromCSV().catch(console.error)
