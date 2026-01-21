-- Add business links and click counters to restaurants table
-- This allows restaurants to customize their business card with various links
-- and we can track clicks efficiently with counters in the restaurants table

ALTER TABLE restaurants 
ADD COLUMN IF NOT EXISTS business_links JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS click_counters JSONB DEFAULT '{}'::jsonb;

-- business_links structure example:
-- {
--   "opentable": {"url": "https://...", "enabled": true, "label": "Book on OpenTable"},
--   "resy": {"url": "https://...", "enabled": true, "label": "Reserve on Resy"},
--   "whatsapp": {"url": "https://wa.me/...", "enabled": true, "label": "Message on WhatsApp"},
--   "tripadvisor": {"url": "https://...", "enabled": true, "label": "View on TripAdvisor"},
--   "instagram": {"url": "https://...", "enabled": true, "label": "Follow on Instagram"},
--   "facebook": {"url": "https://...", "enabled": true, "label": "Follow on Facebook"},
--   "twitter": {"url": "https://...", "enabled": false, "label": "Follow on Twitter"},
--   "yelp": {"url": "https://...", "enabled": false, "label": "View on Yelp"},
--   "email": {"url": "mailto:...", "enabled": true, "label": "Email Us"},
--   "phone": {"url": "tel:...", "enabled": true, "label": "Call Us"},
--   "website": {"url": "https://...", "enabled": true, "label": "Visit Website"},
--   "maps": {"url": "https://maps.google.com/...", "enabled": true, "label": "View on Map"}
-- }

-- click_counters structure (optional, for fast dashboard queries):
-- {
--   "opentable_clicks": 0,
--   "resy_clicks": 0,
--   "whatsapp_clicks": 0,
--   "tripadvisor_clicks": 0,
--   "instagram_clicks": 0,
--   "facebook_clicks": 0,
--   "yelp_clicks": 0,
--   "website_clicks": 0,
--   "phone_clicks": 0,
--   "email_clicks": 0,
--   "maps_clicks": 0,
--   "total_clicks": 0
-- }

-- Index for faster queries on business_links
CREATE INDEX IF NOT EXISTS idx_restaurants_business_links ON restaurants USING GIN (business_links);

-- Remove reservation_form_enabled if it exists (we're removing the form feature)
-- ALTER TABLE restaurants DROP COLUMN IF EXISTS reservation_form_enabled;
-- ALTER TABLE restaurants DROP COLUMN IF EXISTS reservation_min_advance_hours;

COMMENT ON COLUMN restaurants.business_links IS 'JSONB object storing customizable business card links (opentable, resy, whatsapp, instagram, facebook, tripadvisor, yelp, email, phone, website, maps, etc.)';
COMMENT ON COLUMN restaurants.click_counters IS 'JSONB object storing click counts for each link type (optional performance optimization)';
