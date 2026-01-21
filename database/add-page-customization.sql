-- Add page customization fields for Pro/Business plans
-- Logo upload and cover banner color customization

ALTER TABLE restaurants 
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS cover_banner_color VARCHAR(7) DEFAULT '#1F2937'; -- Default dark gray

-- Update business_links structure to support ordering
-- business_links structure now supports:
-- {
--   "opentable": {"url": "https://...", "enabled": true, "label": "Book on OpenTable", "order": 1},
--   "whatsapp": {"url": "https://...", "enabled": true, "label": "Message on WhatsApp", "order": 2},
--   ...
-- }

COMMENT ON COLUMN restaurants.logo_url IS 'URL to restaurant logo image stored in Supabase Storage';
COMMENT ON COLUMN restaurants.cover_banner_color IS 'Hex color code for cover banner (e.g., #1F2937)';

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_restaurants_logo ON restaurants(logo_url) WHERE logo_url IS NOT NULL;
