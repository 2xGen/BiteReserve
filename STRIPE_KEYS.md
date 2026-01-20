# Stripe Keys Configuration

## Environment Variables to Add

Add these to your `.env.local` file for local development and to Vercel environment variables for production:

### Required Stripe Keys

```env
# Stripe Secret Key (Test Mode)
# Get this from: https://dashboard.stripe.com/test/apikeys
STRIPE_SECRET_KEY=sk_test_...

# Stripe Webhook Secret
# Get this from: https://dashboard.stripe.com/test/webhooks
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Publishable Key (for client-side, if needed)
# Get this from: https://dashboard.stripe.com/test/apikeys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### Required for Subscriptions

```env
# Stripe Price IDs - Pro Plan
STRIPE_PRICE_ID_PRO_MONTHLY=price_1SrONnHk1FiurCHPFyFeMSBZ
STRIPE_PRICE_ID_PRO_ANNUAL=price_1SrOPYHk1FiurCHP1tPWui2m

# Stripe Price IDs - Business Plan
STRIPE_PRICE_ID_BUSINESS_MONTHLY=price_1SrOTcHk1FiurCHPK3PqkkLi
STRIPE_PRICE_ID_BUSINESS_ANNUAL=price_1SrOUdHk1FiurCHPIIm64yZx

# Resend API Key (for transactional emails)
# Get this from: https://resend.com/api-keys
RESEND_API_KEY=re_...
```

## Webhook Configuration

- **Endpoint URL:** `http://bitereserve.com/api/stripe/webhook`
- **API Version:** `2025-12-15.clover`
- **Events:** 5 events selected (see STRIPE_WEBHOOK_SETUP.md)

## Complete Environment Variables

Add ALL of these to `.env.local` and Vercel:

```env
# Stripe Secret Key (Test Mode)
# Get this from: https://dashboard.stripe.com/test/apikeys
STRIPE_SECRET_KEY=sk_test_...

# Stripe Webhook Secret
# Get this from: https://dashboard.stripe.com/test/webhooks
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Publishable Key (for client-side, if needed)
# Get this from: https://dashboard.stripe.com/test/apikeys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Stripe Price IDs - Pro Plan
# Get these from: https://dashboard.stripe.com/test/products
STRIPE_PRICE_ID_PRO_MONTHLY=price_...
STRIPE_PRICE_ID_PRO_ANNUAL=price_...

# Stripe Price IDs - Business Plan
# Get these from: https://dashboard.stripe.com/test/products
STRIPE_PRICE_ID_BUSINESS_MONTHLY=price_...
STRIPE_PRICE_ID_BUSINESS_ANNUAL=price_...

# Resend API Key (for transactional emails)
# Get this from: https://resend.com/api-keys
RESEND_API_KEY=re_...
```

## Next Steps

1. ✅ Add all keys to `.env.local` for local development
2. ✅ Add all keys to Vercel environment variables for production
3. ✅ Products and prices created in Stripe Dashboard
4. ⏳ Test webhook with Stripe CLI or test events
5. ⏳ Test subscription creation through claim page

## Testing

To test locally with Stripe CLI:

```bash
# Install Stripe CLI if not already installed
# Then run:
stripe listen --forward-to localhost:3000/api/stripe/webhook

# This will give you a different webhook secret for local testing
# Use that in your .env.local instead of the production one
```

## Production vs Test Mode

- **Current keys are TEST mode** (they start with `sk_test_` and `pk_test_`)
- When ready for production, switch to **LIVE mode keys** in Stripe Dashboard
- Update environment variables in Vercel with live keys
- Update webhook endpoint to use production URL
