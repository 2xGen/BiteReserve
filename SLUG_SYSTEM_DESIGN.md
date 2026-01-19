# Restaurant Slug System Design

## Current Challenge
- Restaurants can have duplicate names (e.g., "Joe's Pizza" in multiple cities)
- Need scalable system for future API/affiliate integrations
- SEO considerations (do slugs still matter in 2026?)

## SEO Reality Check (2026)
**Short answer: Slugs matter less, but still help**

- ✅ **Still matters:** User experience, clickability, sharing
- ✅ **Still matters:** Keywords in URL provide small ranking signal
- ❌ **Less critical:** Exact keyword matching in URL
- ✅ **More important:** Schema.org, content quality, user signals

**Conclusion:** Clean, readable URLs are good UX, but unique IDs are fine for SEO if content/schema is strong.

---

## Option 1: Viator-Style (Destination-Based)
**Format:** `/restaurants/[destination]/[restaurant-name]/[unique-id]`

**Example:**
- `/restaurants/san-francisco/la-terrazza-del-mare/d2f4663b-b6da-404a-ae93-358cd80fc6bf`
- `/restaurants/new-york/la-terrazza-del-mare/abc123-def456-ghi789`

**Pros:**
- ✅ SEO-friendly (location + name)
- ✅ Human-readable
- ✅ Handles duplicates naturally
- ✅ Good for sharing
- ✅ Scalable (unique ID for API)

**Cons:**
- ❌ Longer URLs
- ❌ More complex routing
- ❌ Need to handle destination changes

**Database:**
```sql
ALTER TABLE restaurants ADD COLUMN destination_slug VARCHAR(100);
ALTER TABLE restaurants ADD COLUMN unique_id VARCHAR(50) UNIQUE;
-- Index for fast lookups
CREATE INDEX idx_restaurants_unique_id ON restaurants(unique_id);
```

---

## Option 2: Simple with Unique ID
**Format:** `/restaurant/[unique-id]` or `/restaurant/[short-id]`

**Example:**
- `/restaurant/d2f4663b-b6da-404a-ae93-358cd80fc6bf` (full UUID)
- `/restaurant/la-terrazza-del-mare-abc123` (slug + short ID)
- `/restaurant/abc123` (short ID only)

**Pros:**
- ✅ Simple routing
- ✅ Guaranteed unique
- ✅ API-friendly
- ✅ No slug conflicts

**Cons:**
- ❌ Less SEO-friendly (no keywords in URL)
- ❌ Not human-readable
- ❌ Harder to share/remember

**Database:**
```sql
ALTER TABLE restaurants ADD COLUMN short_id VARCHAR(20) UNIQUE;
-- Generate: first 8 chars of UUID or custom short code
```

---

## Option 3: Hybrid (Recommended) ⭐
**Format:** `/restaurant/[slug]-[short-id]`

**Example:**
- `/restaurant/la-terrazza-del-mare-abc123`
- `/restaurant/joes-pizza-new-york-xyz789`
- `/restaurant/joes-pizza-chicago-def456`

**How it works:**
1. Generate slug from: `restaurant-name-city` (e.g., `la-terrazza-del-mare-san-francisco`)
2. Add short unique ID (first 8 chars of UUID or custom code)
3. If duplicate slug exists, append ID: `restaurant-name-city-abc123`

**Pros:**
- ✅ SEO-friendly (keywords in URL)
- ✅ Human-readable
- ✅ Guaranteed unique
- ✅ API-friendly (can parse ID)
- ✅ Handles duplicates
- ✅ Good for sharing

**Cons:**
- ⚠️ Slightly longer URLs
- ⚠️ Need slug generation logic

**Database:**
```sql
ALTER TABLE restaurants ADD COLUMN slug VARCHAR(255) UNIQUE;
ALTER TABLE restaurants ADD COLUMN short_id VARCHAR(20) UNIQUE;
-- Combined: slug + '-' + short_id = full URL path
```

**Slug Generation:**
```typescript
function generateSlug(name: string, city: string): string {
  return `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${city.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
    .replace(/^-|-$/g, '')
}

function generateShortId(): string {
  // Use first 8 chars of UUID or custom short code
  return uuid().substring(0, 8)
}

// Final URL: `/restaurant/${slug}-${shortId}`
```

---

## Option 4: Destination-Based Hybrid
**Format:** `/restaurants/[destination]/[restaurant-name]-[short-id]`

**Example:**
- `/restaurants/san-francisco/la-terrazza-del-mare-abc123`
- `/restaurants/new-york/joes-pizza-xyz789`

**Pros:**
- ✅ Best SEO (location + name)
- ✅ Organized by destination
- ✅ Handles duplicates
- ✅ Scalable

**Cons:**
- ❌ Most complex routing
- ❌ Longest URLs

---

## Recommendation: Option 3 (Hybrid) ⭐

**Why:**
1. **SEO:** Keywords in URL help, but content/schema matters more
2. **Scalability:** Unique ID ensures no conflicts, API-ready
3. **UX:** Human-readable, easy to share
4. **Simplicity:** Single route pattern, easy to implement
5. **Future-proof:** Can add destination later if needed

**Implementation:**
```typescript
// Slug: "la-terrazza-del-mare-san-francisco"
// Short ID: "abc12345"
// Final URL: "/restaurant/la-terrazza-del-mare-san-francisco-abc12345"

// For API/affiliate:
// Can parse: slug.split('-').pop() to get short_id
// Or store separately in DB
```

**Database Schema:**
```sql
ALTER TABLE restaurants 
  ADD COLUMN slug VARCHAR(255),
  ADD COLUMN short_id VARCHAR(20) UNIQUE,
  ADD COLUMN full_slug VARCHAR(300) GENERATED ALWAYS AS (slug || '-' || short_id) STORED;

CREATE INDEX idx_restaurants_slug ON restaurants(slug);
CREATE INDEX idx_restaurants_short_id ON restaurants(short_id);
CREATE INDEX idx_restaurants_full_slug ON restaurants(full_slug);
```

**Route:**
```typescript
// app/restaurant/[...slug]/page.tsx
// Handles: /restaurant/la-terrazza-del-mare-san-francisco-abc12345
// Parse: Extract short_id from end, lookup in DB
```

---

## Alternative: Short ID Only (If SEO Not Critical)

If you want maximum simplicity and don't care about keywords in URL:

**Format:** `/restaurant/[short-id]`

**Example:** `/restaurant/abc12345`

**Pros:**
- ✅ Simplest
- ✅ Guaranteed unique
- ✅ API-friendly
- ✅ Fast lookups

**Cons:**
- ❌ No SEO benefit from URL
- ❌ Not human-readable
- ❌ Harder to share

**But:** You can still get SEO from:
- Schema.org structured data
- Meta tags (title, description)
- Content quality
- Internal linking

---

## Decision Matrix

| Factor | Option 1 (Viator) | Option 2 (Simple) | Option 3 (Hybrid) | Option 4 (Dest Hybrid) |
|--------|-------------------|-------------------|-------------------|----------------------|
| SEO | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Scalability | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| UX/Sharing | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Simplicity | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ |
| API-Ready | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |

---

## My Recommendation

**Go with Option 3 (Hybrid):** `/restaurant/[slug]-[short-id]`

**Why:**
- Best balance of SEO, UX, and scalability
- Easy to implement
- Future-proof (can add destination prefix later)
- API-friendly (can extract ID)

**Example URLs:**
- `/restaurant/la-terrazza-del-mare-san-francisco-abc12345`
- `/restaurant/joes-pizza-new-york-xyz78901`
- `/restaurant/joes-pizza-chicago-def45678`

**For API/Affiliate:**
- Full URL: `bite.reserve/restaurant/la-terrazza-del-mare-san-francisco-abc12345`
- Can parse ID: `abc12345`
- Or query by short_id directly

---

## Next Steps

1. **Decide on format** (I recommend Option 3)
2. **Update database schema** (add slug, short_id columns)
3. **Create slug generation utility**
4. **Update restaurant creation/import** to generate slugs
5. **Create dynamic route** `/restaurant/[...slug]/page.tsx`
6. **Add redirect logic** for old URLs if needed
