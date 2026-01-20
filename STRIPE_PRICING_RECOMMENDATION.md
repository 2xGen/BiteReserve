# Stripe Pricing Strategy - Business Plan & Addons

## Recommendation

### ✅ **Business Plan: Create Now**
- Already mentioned on homepage ($99/mo)
- Simple to set up in Stripe
- Features can be implemented later
- Users can subscribe even if features aren't ready yet

### ⏳ **Restaurant Addon: Do Later**
- More complex to implement
- Requires multi-restaurant UI/UX
- Not critical for MVP
- Can be added as Stripe addon/metadata when ready

---

## Business Plan Setup

### Stripe Product Creation

1. **Go to Stripe Dashboard → Products**
2. **Create Product:**
   - Name: `BiteReserve Business`
   - Description: `Multi-restaurant management, unlimited tracking, 365 days analytics`
   
3. **Create Prices:**
   - **Monthly:** $99/month → Copy Price ID
   - **Annual:** $990/year (or $990 = 10 months, effectively 2 months free) → Copy Price ID

4. **Add to Environment Variables:**
   ```env
   STRIPE_PRICE_ID_BUSINESS_MONTHLY=price_xxxxx
   STRIPE_PRICE_ID_BUSINESS_ANNUAL=price_xxxxx
   ```

### Business Plan Features (from schema)
- `max_restaurants`: NULL (unlimited) or specific number
- `max_campaign_links`: NULL (unlimited)
- `max_actions_per_month`: NULL (unlimited)
- `analytics_retention_days`: 365
- `remove_branding`: TRUE
- `weekly_email_reports`: TRUE
- Multi-restaurant linking (Phase 5 feature)

---

## Restaurant Addon Strategy (Later)

### Option 1: Stripe Addon Product
- Create a separate product: "Additional Restaurant"
- Price: $X per restaurant per month
- Add to subscription as addon item
- Update `max_restaurants` in database when addon is added/removed

### Option 2: Metadata-Based
- Use Stripe subscription metadata to track restaurant count
- Update `max_restaurants` via webhook when metadata changes
- Simpler but less flexible

### Option 3: Usage-Based Pricing
- Track restaurant count in database
- Charge based on actual usage
- More complex, requires usage reporting

**Recommendation:** Option 1 (Stripe Addon) - Most flexible and clear for users

---

## Current Status

### ✅ Implemented
- Free Plan (25 actions, 3 links, 14 days analytics)
- Pro Plan Monthly ($29/mo)
- Pro Plan Annual ($290/year)

### ⏳ To Do Now
- [ ] Create Business Plan product in Stripe
- [ ] Create Business Plan prices (monthly & annual)
- [ ] Add price IDs to environment variables
- [ ] Update claim page to show Business plan option
- [ ] Update webhook handler to set Business plan limits

### ⏳ To Do Later (Phase 5)
- [ ] Implement multi-restaurant UI
- [ ] Create restaurant addon product
- [ ] Build addon management in dashboard
- [ ] Update subscription management page

---

## Implementation Priority

**Now (MVP):**
1. ✅ Pro Plan (done)
2. ⏳ Business Plan (create in Stripe, basic support)

**Later (Phase 5):**
1. Multi-restaurant features
2. Restaurant addon product
3. Advanced Business plan features

---

## Environment Variables (Complete)

```env
# Pro Plan
STRIPE_PRICE_ID_PRO_MONTHLY=price_1SrONnHk1FiurCHPFyFeMSBZ
STRIPE_PRICE_ID_PRO_ANNUAL=price_1SrOPYHk1FiurCHP1tPWui2m

# Business Plan (to be created)
STRIPE_PRICE_ID_BUSINESS_MONTHLY=price_xxxxx
STRIPE_PRICE_ID_BUSINESS_ANNUAL=price_xxxxx

# Restaurant Addon (later)
STRIPE_PRICE_ID_RESTAURANT_ADDON=price_xxxxx
```
