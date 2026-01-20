# Manual Review Queue Setup

## Overview

Restaurant claims now require manual verification before activation. All claims start in "pending" status and must be approved by an admin.

## Database Changes

Run this SQL in Supabase to add the claim status fields:

```sql
-- See database/add-claim-status.sql
```

This adds:
- `claim_status` - 'pending', 'approved', or 'rejected'
- `claim_reviewed_at` - Timestamp when reviewed
- `claim_reviewed_by` - Admin user ID (for future use)

## How It Works

### 1. User Submits Claim
- User fills out claim form on `/claim`
- Sees message: "Manual Verification Required - We'll verify within 24 hours using Google Business Profile data"
- Claim is created with `claim_status = 'pending'` and `is_claimed = false`
- User sees success page explaining verification process

### 2. Admin Reviews Claim
- Navigate to `/admin/claims` (protected route, requires login)
- See list of pending claims with all restaurant details
- Click "Approve" or "Reject" for each claim
- On approval: `claim_status = 'approved'`, `is_claimed = true`
- On rejection: `claim_status = 'rejected'`, `is_claimed = false`

### 3. Verification Process
- Check restaurant information against Google Business Profile
- Verify URLs, booking links, and contact details match
- Approve if everything matches
- Reject if information doesn't match or is suspicious

## Admin Dashboard

**URL:** `/admin/claims`

**Features:**
- View all pending claims
- Filter by status (Pending / All)
- See restaurant details: name, address, website, phone, cuisine, booking platform
- See user info: name, email
- Approve/Reject buttons
- Shows submission timestamp

## API Endpoints

- `GET /api/admin/claims?status=pending` - Fetch claims
- `POST /api/admin/claims/approve` - Approve a claim
- `POST /api/admin/claims/reject` - Reject a claim

## Email Notifications

**Current:** Manual (you send emails manually for MVP)

**Future:** Can add automated emails:
- Approval email with dashboard login
- Rejection email with reason

## Next Steps

1. ✅ Run database migration (`database/add-claim-status.sql`)
2. ✅ Test claim submission flow
3. ✅ Test admin review dashboard
4. ⏳ Set up admin authentication (for production)
5. ⏳ Add automated approval emails (optional)

## Notes

- All existing claimed restaurants are automatically set to 'approved'
- New claims default to 'pending'
- Restaurant pages are only visible when `is_claimed = true` AND `claim_status = 'approved'`
