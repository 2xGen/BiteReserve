-- Add Google Business Profile link field for verification
ALTER TABLE restaurants
ADD COLUMN google_business_profile TEXT;
