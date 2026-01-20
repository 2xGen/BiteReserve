# Claim Flow Optimization

## Current Flow Issues
1. **High friction before payment** - User fills long form before committing
2. **Data collected but user waits** - All info gathered but user has to wait for email
3. **Delayed engagement** - User loses momentum after payment

## Optimized Two-Step Flow

### Step 1: Minimal Claim Form (Pre-Payment)
**Goal:** Get payment commitment with minimal friction

**Required Fields:**
- Restaurant name
- City & Country (for slug generation)
- Owner name
- Email (from auth)
- Plan selection

**What happens:**
- Creates restaurant with minimal data
- Creates subscription (pending status)
- Redirects to Stripe Checkout

### Step 2: Completion Form (Post-Payment)
**Goal:** Collect full details while user is engaged

**After Stripe Success:**
- Redirect to `/claim/complete?session_id=...&user_id=...&restaurant_id=...`
- Show form to collect:
  - Full address
  - Phone
  - Website
  - Cuisine types
  - Hours (optional)
  - Description (optional)
- Submit → Updates restaurant → Redirects to Dashboard

**Benefits:**
- ✅ Lower barrier to payment (minimal info)
- ✅ User is engaged after payment (completes form)
- ✅ Immediate dashboard access (no email wait)
- ✅ All data ready for fast publication
- ✅ Better UX flow

## Implementation Plan

1. **Simplify `/claim` form** - Only collect minimal required fields
2. **Create `/claim/complete` page** - Detailed form after payment
3. **Update claim API** - Handle two-step process
4. **Update success page** - Redirect to completion form
5. **Update dashboard** - Show pending restaurants immediately
