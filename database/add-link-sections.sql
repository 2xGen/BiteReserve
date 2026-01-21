-- Add support for link sections and custom links
-- Section 1: Call, Map, Web, Book (max 4)
-- Section 2: Other links (max 8, can include custom links)

-- Update business_links structure to support sections and custom links
-- business_links structure now supports:
-- {
--   "phone": {"url": "tel:...", "enabled": true, "label": "Call Us", "order": 1, "section": 1},
--   "maps": {"url": "https://...", "enabled": true, "label": "View on Map", "order": 2, "section": 1},
--   "website": {"url": "https://...", "enabled": true, "label": "Visit Website", "order": 3, "section": 1},
--   "opentable": {"url": "https://...", "enabled": true, "label": "Book on OpenTable", "order": 4, "section": 1},
--   "whatsapp": {"url": "https://...", "enabled": true, "label": "Message on WhatsApp", "order": 1, "section": 2},
--   "custom_1": {"url": "https://...", "enabled": true, "label": "Custom Link", "order": 2, "section": 2, "icon": "link", "is_custom": true}
-- }

COMMENT ON COLUMN restaurants.business_links IS 'JSONB object storing customizable business card links with section grouping (section 1: max 4, section 2: max 8). Supports custom links with icon and label (max 20 chars).';
