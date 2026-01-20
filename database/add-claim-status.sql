-- Add claim_status column to restaurants table for manual review queue
-- Status values: 'pending' (awaiting review), 'approved' (verified and active), 'rejected' (denied)

ALTER TABLE restaurants
ADD COLUMN IF NOT EXISTS claim_status VARCHAR(20) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS claim_reviewed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS claim_reviewed_by UUID REFERENCES users(id);

-- Set existing claimed restaurants to 'approved'
UPDATE restaurants
SET claim_status = 'approved'
WHERE is_claimed = true AND claim_status IS NULL;

-- Create index for faster queries on pending claims
CREATE INDEX IF NOT EXISTS idx_restaurants_claim_status ON restaurants(claim_status);

-- Add comment
COMMENT ON COLUMN restaurants.claim_status IS 'Status of restaurant claim: pending (awaiting review), approved (verified), rejected (denied)';
