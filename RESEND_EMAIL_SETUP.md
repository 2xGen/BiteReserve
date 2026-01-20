# Resend Email Setup

## Overview

Resend is configured to send transactional emails for BiteReserve. All emails are sent automatically when certain events occur.

## Environment Variables

Add to `.env.local` and Vercel:

```env
RESEND_API_KEY=re_NyXeBwba_J4JL6AocHv8fA535pnqi2sae
```

Optional (for production with custom domain):
```env
RESEND_FROM_EMAIL=BiteReserve <hello@bitereserve.com>
RESEND_REPLY_TO=support@bitereserve.com
```

## Email Types

### 1. Welcome Email
**Trigger:** When a user claims a restaurant (via `/api/claim`)
**Recipients:** New users
**Content:**
- Welcome message
- Restaurant name
- Selected plan details (Free, Pro, or Business)
- Plan features
- Link to dashboard

**Function:** `sendWelcomeEmail()`
**Location:** `lib/resend.ts`

### 2. Transaction Confirmation Email
**Trigger:** When Stripe payment succeeds (`invoice.payment_succeeded` webhook)
**Recipients:** Users with successful payments
**Content:**
- Payment confirmation
- Plan name (Pro or Business)
- Billing cycle (Monthly or Annual)
- Amount paid
- Invoice link (if available)
- Link to dashboard

**Function:** `sendTransactionEmail()`
**Location:** `lib/resend.ts`
**Handled by:** `handlePaymentSuccessEmail()` in `app/api/stripe/webhook/route.ts`

## Email Coverage

Transaction emails are sent for **all 4 price combinations**:
- ✅ Pro Monthly ($29)
- ✅ Pro Annual ($290)
- ✅ Business Monthly ($99)
- ✅ Business Annual ($990)

The webhook automatically detects the plan and billing cycle from the Stripe price ID.

## Email Configuration

### Testing (Current)
- **From:** `BiteReserve <onboarding@resend.dev>` (Resend's default domain)
- **Reply-To:** `onboarding@resend.dev`

### Production (To Do)
1. Verify your domain in Resend Dashboard
2. Update environment variables:
   ```env
   RESEND_FROM_EMAIL=BiteReserve <hello@bitereserve.com>
   RESEND_REPLY_TO=support@bitereserve.com
   ```

## Integration Points

### Claim API (`app/api/claim/route.ts`)
- Sends welcome email after successful restaurant claim
- Includes plan information (Free, Pro, or Business)

### Stripe Webhook (`app/api/stripe/webhook/route.ts`)
- Listens for `invoice.payment_succeeded` events
- Determines plan type and billing cycle from price ID
- Sends transaction confirmation email
- Handles all 4 price combinations automatically

## Error Handling

- Email failures do **not** block the main operation
- Errors are logged to console
- Webhook processing continues even if email fails
- Claim submission succeeds even if welcome email fails

## Testing

### Local Testing
1. Add `RESEND_API_KEY` to `.env.local`
2. Test claim submission - should receive welcome email
3. Test Stripe payment - should receive transaction email

### Production Testing
1. Add `RESEND_API_KEY` to Vercel environment variables
2. Verify domain in Resend Dashboard (if using custom domain)
3. Test with real Stripe test payments
4. Check Resend Dashboard for email delivery status

## Email Templates

Both email templates use:
- HTML formatting
- Responsive design
- Brand colors (accent green)
- Clear call-to-action buttons
- Professional styling

Templates are defined inline in `lib/resend.ts` for simplicity. Can be moved to separate template files later if needed.

## Next Steps

1. ✅ Resend package installed
2. ✅ Email utility functions created
3. ✅ Welcome email integrated into claim flow
4. ✅ Transaction emails integrated into Stripe webhook
5. ⏳ Test email delivery
6. ⏳ Verify domain in Resend (for production)
7. ⏳ Update FROM_EMAIL and REPLY_TO for production
