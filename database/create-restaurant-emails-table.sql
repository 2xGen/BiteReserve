-- Create restaurant_emails table for storing restaurant contact emails
-- This allows admins to manage restaurant email addresses separately from user accounts

CREATE TABLE IF NOT EXISTS restaurant_emails (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  notes TEXT, -- Optional notes about the email (e.g., "owner", "manager", "marketing")
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(restaurant_id, email) -- One email per restaurant (can add multiple rows for multiple emails)
);

CREATE INDEX idx_restaurant_emails_restaurant ON restaurant_emails(restaurant_id);
CREATE INDEX idx_restaurant_emails_email ON restaurant_emails(email);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_restaurant_emails_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER restaurant_emails_updated_at
  BEFORE UPDATE ON restaurant_emails
  FOR EACH ROW
  EXECUTE FUNCTION update_restaurant_emails_updated_at();

COMMENT ON TABLE restaurant_emails IS 'Stores email addresses for restaurants, managed by admins';
COMMENT ON COLUMN restaurant_emails.restaurant_id IS 'Reference to the restaurant';
COMMENT ON COLUMN restaurant_emails.email IS 'Email address for the restaurant';
COMMENT ON COLUMN restaurant_emails.notes IS 'Optional notes about the email (e.g., owner, manager, marketing)';
