# Stripe Webhook Setup Guide

## Step-by-Step Configuration

### 1. Webhook Destination Settings

**Events from:**
- ✅ **Your account** - Select this (we're only handling events from your main account)

**API version:**
- ✅ **2025-12-15.clover** - This matches your Stripe package version

### 2. Events to Select

Based on our webhook handler, you need to select these **6 specific events**:

#### Checkout Events:
1. ✅ `checkout.session.completed` - When user completes Stripe Checkout (trial starts)

#### Subscription Events:
2. ✅ `customer.subscription.created` - When a new subscription is created
3. ✅ `customer.subscription.updated` - When subscription status changes (trial ends, plan changes, etc.)
4. ✅ `customer.subscription.deleted` - When a subscription is canceled

#### Invoice Events:
5. ✅ `invoice.payment_succeeded` - When a payment succeeds (trial ends, renewal, etc.)
6. ✅ `invoice.payment_failed` - When a payment fails (card declined, etc.)

### 3. How to Select Events

1. In the Stripe webhook configuration, click **"Selected events"**
2. Click **"Find event by name or description…"**
3. Search for and select each event one by one:
   - Type: `checkout.session.completed` → Select it
   - Type: `customer.subscription.created` → Select it
   - Type: `customer.subscription.updated` → Select it
   - Type: `customer.subscription.deleted` → Select it
   - Type: `invoice.payment_succeeded` → Select it
   - Type: `invoice.payment_failed` → Select it

### 4. Webhook Endpoint URL

**For Development (Stripe CLI):**
```
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

**For Production (Vercel):**
```
https://your-domain.com/api/stripe/webhook
```

### 5. What Each Event Does

| Event | What It Does |
|-------|-------------|
| `checkout.session.completed` | When user completes Stripe Checkout - updates subscription, sends welcome email |
| `customer.subscription.created` | Creates subscription record in database, sets status to "trialing" |
| `customer.subscription.updated` | Updates subscription status, trial dates, period dates when subscription changes |
| `customer.subscription.deleted` | Downgrades user to Free plan, sets limits back to free tier |
| `invoice.payment_succeeded` | Updates subscription when payment succeeds (trial → active, renewal, etc.), sends transaction email |
| `invoice.payment_failed` | Sets subscription status to "past_due" when payment fails |

### 6. Environment Variables Needed

Make sure you have these set in your Vercel environment:

```env
STRIPE_SECRET_KEY=sk_live_... (or sk_test_... for testing)
STRIPE_WEBHOOK_SECRET=whsec_... (from Stripe webhook settings)
```

### 7. Testing the Webhook

1. **Using Stripe CLI (Local):**
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
   This will give you a webhook signing secret starting with `whsec_`

2. **Test Events:**
   ```bash
   stripe trigger customer.subscription.created
   stripe trigger invoice.payment_succeeded
   ```

3. **Check Logs:**
   - Check your terminal/console for webhook processing logs
   - Check Vercel function logs for production

### 8. Important Notes

- ✅ **Don't select "All events"** - Only select the 5 events listed above
- ✅ **Use "Your account"** - Not connected accounts (unless you're using Stripe Connect)
- ✅ **Save the webhook secret** - You'll need `STRIPE_WEBHOOK_SECRET` for production
- ✅ **Test in test mode first** - Set up webhooks in Stripe test mode before going live

### 9. Verification

After setting up, test by:
1. Creating a test subscription through your claim page
2. Checking that the subscription appears in your database
3. Triggering test events via Stripe CLI or Dashboard
4. Verifying database updates match the events

---

**Next Steps:**
1. Set up the webhook endpoint in Stripe Dashboard
2. Copy the webhook signing secret
3. Add it to your Vercel environment variables
4. Test with Stripe CLI or test events
