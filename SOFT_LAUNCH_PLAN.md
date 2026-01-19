# BiteReserve Soft Launch Plan

## Overview
This document outlines the roadmap to soft launch BiteReserve with core features for restaurant owners to claim, manage, and track their listings.

---

## Phase 1: Foundation (Critical Path)

### 1. User Authentication System
**Priority: CRITICAL** | **Dependencies: None** | **Est. Time: 2-3 days**

**Tasks:**
- [ ] Set up Supabase Auth configuration
- [ ] Create sign up page (`/signup`)
- [ ] Create login page (`/login`)
- [ ] Create password reset flow (`/reset-password`)
- [ ] Implement email verification
- [ ] Add protected route middleware
- [ ] Create auth context/hooks for client-side
- [ ] Update claim page to create account after submission

**Technical Notes:**
- Use Supabase Auth (already configured)
- Store user metadata in `users` table (already in schema)
- Implement Row Level Security (RLS) policies for user data
- Add session management with refresh tokens

---

### 2. Restaurant Slug System Design
**Priority: CRITICAL** | **Dependencies: None** | **Est. Time: 1 day**

**Requirements:**
- SEO-friendly URLs: `/restaurant/[slug]`
- Unique, scalable, API-ready
- Handle duplicates (e.g., "Joe's Pizza" in multiple cities)
- Support future API access

**Slug Format Options:**
1. **Simple**: `restaurant-name` (e.g., `la-terrazza-del-mare`)
2. **With Location**: `restaurant-name-city` (e.g., `la-terrazza-del-mare-san-francisco`)
3. **With ID**: `restaurant-name-[id]` (e.g., `la-terrazza-del-mare-abc123`)

**Recommendation:** Use format 2 (with city) for SEO, but store both `slug` and `unique_slug` (with ID fallback for duplicates)

**Tasks:**
- [ ] Define slug generation rules
- [ ] Create slug validation function
- [ ] Add `unique_slug` field to restaurants table
- [ ] Create slug collision detection
- [ ] Update schema to ensure unique slugs

**Database Changes:**
```sql
ALTER TABLE restaurants ADD COLUMN unique_slug VARCHAR(255) UNIQUE;
CREATE INDEX idx_restaurants_unique_slug ON restaurants(unique_slug);
```

---

### 3. Database Migration: Import 3200 Restaurants
**Priority: HIGH** | **Dependencies: Slug system (#2)** | **Est. Time: 1-2 days**

**Tasks:**
- [ ] Export data from existing database
- [ ] Create migration script (Node.js/Python)
- [ ] Map existing fields to BiteReserve schema
- [ ] Generate slugs for all restaurants
- [ ] Handle duplicates and conflicts
- [ ] Import into Supabase
- [ ] Verify data integrity

**Script Location:** `scripts/import-restaurants.ts` or `scripts/import-restaurants.py`

**Data Mapping:**
- Map existing fields to BiteReserve schema
- Set `is_claimed = false` for all imported restaurants
- Generate slugs using defined rules
- Handle missing data gracefully

---

## Phase 2: Core Pages

### 4. Unclaimed Restaurant Page
**Priority: HIGH** | **Dependencies: Slug system (#2)** | **Est. Time: 1 day**

**Route:** `/restaurant/[slug]` (when `is_claimed = false`)

**Features:**
- Display restaurant information (name, address, phone, hours, etc.)
- Show "Claim Your Restaurant" CTA button
- No reservation form
- No tracking dashboard
- Basic SEO meta tags
- Schema.org structured data

**Tasks:**
- [ ] Create dynamic route `app/restaurant/[slug]/page.tsx`
- [ ] Fetch restaurant data from Supabase
- [ ] Handle 404 for non-existent restaurants
- [ ] Display restaurant info (no form)
- [ ] Add "Claim Your Restaurant" button linking to `/claim?slug=[slug]`
- [ ] Implement schema.org JSON-LD

---

### 5. Claimed Restaurant Page
**Priority: HIGH** | **Dependencies: Auth (#1), Slug system (#2)** | **Est. Time: 2 days**

**Route:** `/restaurant/[slug]` (when `is_claimed = true`)

**Features:**
- All current example page features
- Reservation form (if owner configured)
- Tracking integration
- Owner can customize via edit page
- Full analytics tracking

**Tasks:**
- [ ] Migrate current example page to dynamic route
- [ ] Connect to real Supabase data
- [ ] Implement tracking API calls
- [ ] Add owner customization support
- [ ] Handle subscription limits (hide form after 25 actions on Free plan)

---

### 6. Schema.org Structured Data (SEO)
**Priority: MEDIUM** | **Dependencies: Restaurant pages (#4, #5)** | **Est. Time: 1 day**

**Requirements:**
- LocalBusiness schema
- Restaurant schema
- AggregateRating (if available)
- OpeningHoursSpecification
- Address, geo coordinates

**Tasks:**
- [ ] Create schema.org component/utility
- [ ] Generate JSON-LD for restaurant pages
- [ ] Add to both claimed and unclaimed pages
- [ ] Test with Google Rich Results Test
- [ ] Validate structured data

**File:** `components/SchemaOrg.tsx` or `lib/schema-org.ts`

---

## Phase 3: Payment & Subscriptions

### 7. Stripe Integration
**Priority: HIGH** | **Dependencies: Auth (#1)** | **Est. Time: 3-4 days**

**Features:**
- Create Stripe products (Free, Pro, Business)
- Subscription management
- 14-day trial handling
- Webhook endpoints for subscription events
- Upgrade/downgrade flows
- Payment method management

**Tasks:**
- [ ] Set up Stripe account and get API keys
- [ ] Create Stripe products and prices
- [ ] Install `@stripe/stripe-js` and `stripe` packages
- [ ] Create subscription API routes:
  - `POST /api/stripe/create-subscription`
  - `POST /api/stripe/webhook`
  - `GET /api/stripe/subscription-status`
- [ ] Update claim page to create Stripe customer on Pro trial
- [ ] Create subscription management page (`/dashboard/subscription`)
- [ ] Handle webhook events (subscription.created, subscription.updated, etc.)
- [ ] Update database `subscriptions` table on webhook events
- [ ] Implement trial expiration logic

**Webhook Events to Handle:**
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

**Files:**
- `app/api/stripe/webhook/route.ts`
- `app/api/stripe/create-subscription/route.ts`
- `lib/stripe.ts`

---

### 8. Resend Transactional Emails
**Priority: MEDIUM** | **Dependencies: Auth (#1), Stripe (#7)** | **Est. Time: 1-2 days**

**Email Types:**
1. Welcome email (after signup)
2. Restaurant claimed confirmation
3. Pro trial started
4. Trial ending reminder (3 days before)
5. Trial expired / downgraded to Free
6. Subscription activated
7. Payment failed
8. Password reset

**Tasks:**
- [ ] Set up Resend account and API key
- [ ] Install `resend` package
- [ ] Create email templates (React Email or HTML)
- [ ] Create email utility functions
- [ ] Integrate with auth flow
- [ ] Integrate with Stripe webhooks
- [ ] Test all email flows

**Files:**
- `lib/emails.ts`
- `emails/welcome.tsx` (if using React Email)
- `app/api/send-email/route.ts` (if needed)

---

## Phase 4: Management & Editing

### 9. Edit Listing Page
**Priority: HIGH** | **Dependencies: Auth (#1), Claimed page (#5)** | **Est. Time: 2-3 days**

**Concept:** Use restaurant page layout with inline editing capabilities

**Features:**
- Toggle between "View" and "Edit" modes
- Edit restaurant info inline (name, address, phone, hours, description, etc.)
- Save/Discard buttons
- Real-time preview
- Image upload (future)
- Validation

**Route:** `/dashboard/restaurant/[slug]/edit` or `/restaurant/[slug]/edit`

**Tasks:**
- [ ] Create edit page component
- [ ] Implement inline editing UI
- [ ] Add form validation
- [ ] Create save API endpoint (`PUT /api/restaurants/[slug]`)
- [ ] Add discard/undo functionality
- [ ] Show success/error messages
- [ ] Add loading states

**UI Approach:**
- Option A: Separate edit page with form
- Option B: Same page with edit mode toggle (recommended for UX)

---

### 10. Master Admin Dashboard
**Priority: MEDIUM** | **Dependencies: Auth (#1), All pages** | **Est. Time: 2-3 days**

**Route:** `/admin/dashboard` (protected, admin-only)

**Features:**
- View all restaurants (paginated)
- Filter by restaurant name
- Search functionality
- See aggregate metrics:
  - Total restaurants
  - Claimed vs unclaimed
  - Total users
  - Total subscriptions
  - Revenue metrics
- User management
- Restaurant management (edit, delete, claim status)

**Tasks:**
- [ ] Create admin role in database
- [ ] Add admin check middleware
- [ ] Create admin dashboard layout
- [ ] Build restaurant list with filters
- [ ] Add search functionality
- [ ] Create metrics cards
- [ ] Add user management section
- [ ] Add bulk actions (if needed)

**Database:**
```sql
ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;
```

---

## Phase 5: Business Plan Features

### 11. Multi-Restaurant Linking (Business Plan)
**Priority: MEDIUM** | **Dependencies: Auth (#1), Restaurant pages (#5)** | **Est. Time: 2-3 days**

**Feature:** Allow Business plan users to link multiple restaurants on their reservation page

**Requirements:**
- Only for Business plan subscribers
- Show restaurant selector on reservation page
- Allow users to switch between restaurants
- Track which restaurant was selected

**Tasks:**
- [ ] Create `restaurant_groups` table (or use existing relationships)
- [ ] Add restaurant selector component
- [ ] Update restaurant page to show selector (if Business plan)
- [ ] Add API endpoint to fetch user's restaurants
- [ ] Update tracking to include selected restaurant
- [ ] Add to Business plan features list

**Database Schema:**
```sql
-- Already have owner_id in restaurants table
-- For groups, we can use a junction table if needed:
CREATE TABLE restaurant_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  restaurant_id UUID REFERENCES restaurants(id),
  display_order INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 12. Update Pricing Page
**Priority: LOW** | **Dependencies: Multi-restaurant feature (#11)** | **Est. Time: 0.5 days**

**Tasks:**
- [ ] Add "Link multiple restaurants" to Business plan features
- [ ] Update homepage pricing section
- [ ] Update claim page pricing display

---

### 13. Database Schema Updates for Multi-Restaurant
**Priority: MEDIUM** | **Dependencies: None** | **Est. Time: 0.5 days**

**Tasks:**
- [ ] Review current schema for multi-restaurant support
- [ ] Add `restaurant_groups` table if needed (see #11)
- [ ] Update RLS policies for multi-restaurant access
- [ ] Test queries for fetching user's restaurants

---

## Phase 6: Testing & Deployment

### 14. End-to-End Testing
**Priority: HIGH** | **Dependencies: All above** | **Est. Time: 2-3 days**

**Test Scenarios:**
- [ ] User signs up → claims restaurant → edits → views dashboard
- [ ] Free plan: 25 actions limit → form hides after limit
- [ ] Pro trial: starts → converts to paid → cancels
- [ ] Business plan: links multiple restaurants → switches between them
- [ ] Admin: views dashboard → filters → manages restaurants
- [ ] Email flows: all transactional emails sent correctly
- [ ] Stripe: subscription creation → webhook handling → payment processing
- [ ] SEO: schema.org validates, pages indexable

---

### 15. Production Deployment
**Priority: CRITICAL** | **Dependencies: All above** | **Est. Time: 1 day**

**Tasks:**
- [ ] Set up production Supabase project
- [ ] Configure production environment variables
- [ ] Set up Vercel production deployment
- [ ] Configure custom domain
- [ ] Set up Stripe webhook endpoint (production URL)
- [ ] Configure Resend (production)
- [ ] Run database migrations in production
- [ ] Import restaurants to production
- [ ] Test production environment
- [ ] Set up monitoring/error tracking (Sentry?)

---

## Technical Decisions Needed

### 1. Slug Format
**Decision:** Use `restaurant-name-city` format with `unique_slug` fallback for duplicates
**Rationale:** SEO-friendly, scalable, handles duplicates gracefully

### 2. Edit Page Approach
**Decision:** Same page with edit mode toggle (better UX)
**Rationale:** Users see changes in context, less navigation

### 3. Multi-Restaurant Storage
**Decision:** Use existing `owner_id` relationship + optional `restaurant_groups` for display order
**Rationale:** Simple, leverages existing schema

### 4. Admin Access
**Decision:** Add `is_admin` boolean to users table
**Rationale:** Simple, sufficient for MVP

---

## Estimated Timeline

**Total Estimated Time: 20-25 days**

- Phase 1 (Foundation): 4-6 days
- Phase 2 (Core Pages): 4-5 days
- Phase 3 (Payment & Emails): 4-6 days
- Phase 4 (Management): 4-6 days
- Phase 5 (Business Features): 2-3 days
- Phase 6 (Testing & Deploy): 3-4 days

**Recommended Approach:**
1. Complete Phase 1 first (critical path)
2. Then Phase 2 (get pages working)
3. Then Phase 3 (enable monetization)
4. Then Phase 4 (enable management)
5. Then Phase 5 (premium features)
6. Finally Phase 6 (polish and launch)

---

## Next Steps

1. **Start with User Authentication** - This unlocks everything else
2. **Design slug system** - Critical for scalability
3. **Import restaurants** - Get data in the system
4. **Build pages** - Get basic functionality working
5. **Add payments** - Enable revenue
6. **Polish and test** - Ready for launch

---

## Notes

- All tasks should be tracked in the TODO list
- Mark tasks as "in_progress" when starting
- Update this document as decisions are made
- Test each phase before moving to the next
- Keep database migrations versioned and reversible
