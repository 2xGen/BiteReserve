# Stripe Integration Setup Guide

## Overview
BiteReserve uses Stripe for subscription management. This guide explains how to set up Stripe products, prices, and webhooks.

## Prerequisites
1. Stripe account (sign up at https://stripe.com)
2. Stripe API keys (from Stripe Dashboard)

## Step 1: Get Stripe API Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Developers** → **API keys**
3. Copy your **Publishable key** and **Secret key**
4. Add them to your `.env.local` file:

```env
STRIPE_SECRET_KEY=sk_test_... (or sk_live_... for production)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_... (or pk_live_... for production)
```

## Step 2: Create Stripe Products and Prices

### Option A: Create via Stripe Dashboard (Recommended)

1. Go to **Products** in Stripe Dashboard
2. Click **+ Add product**

#### Pro Plan (Monthly)
- **Name**: BiteReserve Pro (Monthly)
- **Description**: Unlimited actions, unlimited links, 90 days analytics
- **Pricing**: 
  - **Recurring**: Monthly
  - **Price**: $29.00 USD
- **Copy the Price ID** (starts with `price_...`)

#### Pro Plan (Annual)
- **Name**: BiteReserve Pro (Annual)
- **Description**: Unlimited actions, unlimited links, 90 days analytics - 2 months free
- **Pricing**: 
  - **Recurring**: Yearly
  - **Price**: $290.00 USD (saves $58/year = 2 months free)
- **Copy the Price ID** (starts with `price_...`)

3. Add Price IDs to `.env.local`:

```env
STRIPE_PRICE_ID_PRO_MONTHLY=price_xxxxx
STRIPE_PRICE_ID_PRO_ANNUAL=price_xxxxx
```

### Option B: Create via API (Alternative)

Run this script after setting up Stripe keys:

```typescript
// scripts/create-stripe-products.ts
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

async function createProducts() {
  // Create Pro product
  const product = await stripe.products.create({
    name: 'BiteReserve Pro',
    description: 'Unlimited actions, unlimited links, 90 days analytics',
  })

  // Create monthly price
  const monthlyPrice = await stripe.prices.create({
    product: product.id,
    unit_amount: 2900, // $29.00
    currency: 'usd',
    recurring: { interval: 'month' },
  })

  // Create annual price
  const annualPrice = await stripe.prices.create({
    product: product.id,
    unit_amount: 29000, // $290.00
    currency: 'usd',
    recurring: { interval: 'year' },
  })

  console.log('Product ID:', product.id)
  console.log('Monthly Price ID:', monthlyPrice.id)
  console.log('Annual Price ID:', annualPrice.id)
}

createProducts()
```

## Step 3: Set Up Webhook Endpoint

1. Go to **Developers** → **Webhooks** in Stripe Dashboard
2. Click **+ Add endpoint**
3. **Endpoint URL**: `https://your-domain.com/api/stripe/webhook`
   - For local testing: Use Stripe CLI (see below)
4. **Events to send**: Select these events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click **Add endpoint**
6. **Copy the Signing secret** (starts with `whsec_...`)
7. Add to `.env.local`:

```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

## Step 4: Local Testing with Stripe CLI

For local development, use Stripe CLI to forward webhooks:

1. Install [Stripe CLI](https://stripe.com/docs/stripe-cli)
2. Login: `stripe login`
3. Forward webhooks: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
4. Copy the webhook signing secret from the CLI output
5. Add to `.env.local` as `STRIPE_WEBHOOK_SECRET`

## Step 5: Environment Variables Summary

Add all these to your `.env.local`:

```env
# Stripe Keys
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Stripe Price IDs
STRIPE_PRICE_ID_PRO_MONTHLY=price_...
STRIPE_PRICE_ID_PRO_ANNUAL=price_...

# Stripe Webhook Secret
STRIPE_WEBHOOK_SECRET=whsec_...
```

## How It Works

### Claim Flow (Pro Trial)
1. User selects "14-Day Pro Trial" on claim page
2. Claim API creates user and restaurant
3. Claim API creates Stripe customer
4. Claim API creates Stripe subscription with 14-day trial
5. Subscription stored in database with `status: 'trialing'`
6. User gets full Pro features during trial

### Trial Expiration
1. After 14 days, Stripe automatically charges customer
2. Stripe sends `invoice.payment_succeeded` webhook
3. Webhook handler updates subscription `status: 'active'`
4. If payment fails, webhook updates `status: 'past_due'`
5. If customer cancels, webhook updates `status: 'canceled'` and downgrades to Free

### Subscription Management
- Users can view subscription status at `/dashboard/subscription`
- Users can cancel from Stripe Customer Portal (to be implemented)
- Webhooks keep database in sync with Stripe

## Testing

1. Use Stripe test cards: https://stripe.com/docs/testing
2. Test card for successful payment: `4242 4242 4242 4242`
3. Test card for declined payment: `4000 0000 0000 0002`
4. Use any future expiry date and any 3-digit CVC

## Production Checklist

- [ ] Switch to live Stripe keys
- [ ] Create production products/prices
- [ ] Set up production webhook endpoint
- [ ] Test subscription creation
- [ ] Test trial expiration
- [ ] Test payment failures
- [ ] Test cancellations
