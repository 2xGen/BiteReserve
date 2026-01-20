# Database Flow Verification

## Claim Flow (Pro/Business Plans)

### Step 1: User Submits Claim Form
**Endpoint:** `POST /api/claim`

**Database Operations:**
1. ✅ **User Creation/Update**
   - Checks if user exists by email
   - If new: Creates Supabase Auth user + `users` table record
   - If exists: Updates name if provided
   - **Result:** `userId` is set

2. ✅ **Restaurant Creation/Linking**
   - If `restaurantId` provided: Updates existing restaurant with `user_id` and `is_claimed = true`
   - If no `restaurantId`: Creates new restaurant with:
     - `user_id` = userId
     - `slug` = generated from name + city
     - `country_code` = inferred from country name
     - `restaurant_number` = from `get_next_restaurant_number()` function
     - `is_claimed = true`
   - **Result:** `restaurantIdToLink` is set

3. ✅ **Subscription Creation**
   - Checks if subscription exists for user
   - Creates or updates subscription record with:
     - `user_id` = userId
     - `plan` = 'pro' or 'business'
     - `status` = 'trialing'
     - Plan-specific limits (max_restaurants, max_actions_per_month, etc.)
     - `trial_ends_at` = 14 days from now
   - **Result:** Subscription record exists in DB

4. ✅ **Stripe Checkout Session Creation**
   - Creates or gets Stripe customer (`stripe_customer_id`)
   - Creates Stripe Checkout Session with:
     - Customer ID
     - Price ID (Pro Monthly or Business Monthly)
     - 14-day trial period
     - Metadata: `{ userId: userId }`
     - Success URL: `/claim/success?session_id={CHECKOUT_SESSION_ID}&user_id={userId}`
   - Updates subscription record with `stripe_customer_id`
   - **Result:** Returns `checkoutUrl` to frontend

5. ✅ **User Redirected to Stripe Checkout**
   - User enters payment method
   - User completes checkout
   - Stripe redirects to success page

### Step 2: Stripe Checkout Completes
**Webhook Event:** `checkout.session.completed`

**Database Operations:**
1. ✅ **Subscription Retrieved from Stripe**
   - Gets subscription ID from checkout session
   - Retrieves full subscription object from Stripe

2. ✅ **Subscription Updated in Database**
   - Calls `handleSubscriptionUpdate()`
   - Tries to find subscription by `stripe_subscription_id` (won't find it yet)
   - Falls back to finding by `stripe_customer_id` ✅
   - Updates subscription with:
     - `stripe_subscription_id` = subscription.id
     - `status` = 'trialing'
     - `current_period_start` = from Stripe
     - `current_period_end` = from Stripe
     - `trial_ends_at` = from Stripe trial_end
     - `plan` = determined from price ID
     - Plan limits = set based on plan type
   - **Result:** Subscription fully linked to Stripe

3. ✅ **Welcome Email Sent**
   - Gets user data by `userId` from session metadata
   - Gets restaurant name from user's claimed restaurants
   - Determines plan from price ID
   - Sends welcome email

## Verification Checklist

### User Record
- [x] User created in Supabase Auth
- [x] User record created in `users` table
- [x] User ID matches between Auth and `users` table
- [x] User email stored correctly

### Restaurant Record
- [x] Restaurant linked to user (`user_id` set)
- [x] Restaurant marked as claimed (`is_claimed = true`)
- [x] Restaurant details updated (name, address, etc.)
- [x] Restaurant has `country_code` and `restaurant_number` if new

### Subscription Record
- [x] Subscription created for user
- [x] Subscription `user_id` matches user
- [x] Subscription `plan` set correctly ('pro' or 'business')
- [x] Subscription `status` set to 'trialing'
- [x] Subscription `stripe_customer_id` set (before checkout)
- [x] Subscription `stripe_subscription_id` set (after checkout via webhook)
- [x] Subscription `trial_ends_at` set correctly
- [x] Plan limits set correctly based on plan type

### Stripe Integration
- [x] Stripe customer created/linked
- [x] Stripe checkout session created
- [x] Stripe subscription created (by Stripe during checkout)
- [x] Subscription linked via webhook

## Potential Issues & Solutions

### Issue 1: Webhook can't find subscription
**Cause:** Subscription record doesn't have `stripe_subscription_id` yet
**Solution:** ✅ Webhook falls back to finding by `stripe_customer_id` (line 284-302)

### Issue 2: Plan limits not set during trial
**Cause:** Code only set limits when trial ended
**Solution:** ✅ Fixed - now sets plan and limits immediately based on price ID

### Issue 3: Multiple subscriptions for same user
**Cause:** User claims multiple restaurants or resubmits form
**Solution:** ✅ Code checks for existing subscription and updates it (line 245-317)

## Testing Flow

1. Submit claim form with Pro plan
2. Check database:
   ```sql
   -- Check user
   SELECT * FROM users WHERE email = 'test@example.com';
   
   -- Check restaurant
   SELECT * FROM restaurants WHERE user_id = '<user_id>';
   
   -- Check subscription (before checkout)
   SELECT * FROM subscriptions WHERE user_id = '<user_id>';
   -- Should have: stripe_customer_id, status='trialing', plan='pro'
   
   -- Complete Stripe Checkout
   
   -- Check subscription (after checkout webhook)
   SELECT * FROM subscriptions WHERE user_id = '<user_id>';
   -- Should have: stripe_subscription_id, stripe_customer_id, status='trialing'
   ```

## Summary

✅ **Everything should work correctly!**

The flow ensures:
1. User is created ✅
2. Restaurant is linked to user ✅
3. Subscription is created with correct plan and limits ✅
4. Stripe customer and checkout session created ✅
5. Webhook updates subscription with Stripe subscription ID ✅
6. All relationships maintained (user → restaurant, user → subscription) ✅
