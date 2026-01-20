-- Add reservation form settings to restaurants table
-- These settings allow restaurants to enable/configure the reservation form

ALTER TABLE restaurants
ADD COLUMN IF NOT EXISTS reservation_form_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS reservation_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS reservation_email_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS reservation_whatsapp VARCHAR(50),
ADD COLUMN IF NOT EXISTS reservation_whatsapp_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS reservation_min_advance_hours INTEGER DEFAULT 24, -- Minimum hours in advance (24, 48, 72, 168)
ADD COLUMN IF NOT EXISTS reservation_delivery_method VARCHAR(20) DEFAULT 'email'; -- 'email', 'whatsapp', 'both'

-- Add comment
COMMENT ON COLUMN restaurants.reservation_form_enabled IS 'Whether the reservation form is enabled on the public page';
COMMENT ON COLUMN restaurants.reservation_email IS 'Email address to receive reservation requests (requires verification)';
COMMENT ON COLUMN restaurants.reservation_email_verified IS 'Whether the reservation email has been verified';
COMMENT ON COLUMN restaurants.reservation_whatsapp IS 'WhatsApp number to receive reservation requests (requires verification)';
COMMENT ON COLUMN restaurants.reservation_whatsapp_verified IS 'Whether the WhatsApp number has been verified';
COMMENT ON COLUMN restaurants.reservation_min_advance_hours IS 'Minimum hours in advance for bookings (24, 48, 72, 168)';
COMMENT ON COLUMN restaurants.reservation_delivery_method IS 'How to deliver reservation requests: email, whatsapp, or both';

-- Create table for reservation requests
CREATE TABLE IF NOT EXISTS reservation_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time TIME NOT NULL,
  party_size INTEGER NOT NULL,
  guest_name VARCHAR(255) NOT NULL,
  guest_email VARCHAR(255) NOT NULL,
  guest_phone VARCHAR(50),
  special_requests TEXT,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'confirmed', 'cancelled', 'declined'
  source VARCHAR(255), -- Campaign link source
  campaign VARCHAR(255), -- Campaign name
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reservation_requests_restaurant ON reservation_requests(restaurant_id);
CREATE INDEX idx_reservation_requests_status ON reservation_requests(status);
CREATE INDEX idx_reservation_requests_date ON reservation_requests(date);
