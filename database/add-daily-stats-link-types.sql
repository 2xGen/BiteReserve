-- Add columns for new link click event types to analytics_daily_stats
-- This improves performance by aggregating at the daily level instead of querying events table

ALTER TABLE analytics_daily_stats
ADD COLUMN IF NOT EXISTS phone_clicks INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS maps_clicks INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS website_clicks INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS opentable_clicks INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS resy_clicks INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS whatsapp_clicks INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS tripadvisor_clicks INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS instagram_clicks INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS facebook_clicks INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS twitter_clicks INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS yelp_clicks INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS email_clicks INTEGER DEFAULT 0;

-- Update the record_event function to aggregate new event types
CREATE OR REPLACE FUNCTION record_event(
  p_restaurant_id UUID,
  p_event_type VARCHAR(50),
  p_is_action BOOLEAN DEFAULT FALSE,
  p_source VARCHAR(100) DEFAULT NULL,
  p_campaign VARCHAR(100) DEFAULT NULL,
  p_referrer TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_ip_hash VARCHAR(64) DEFAULT NULL,
  p_country VARCHAR(2) DEFAULT NULL,
  p_city VARCHAR(100) DEFAULT NULL,
  p_device_type VARCHAR(20) DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_month DATE;
  v_date DATE;
  v_limit_check JSONB;
BEGIN
  v_month := get_month_start();
  v_date := CURRENT_DATE;
  
  -- If it's an action, check the limit first
  IF p_is_action THEN
    v_limit_check := check_action_limit(p_restaurant_id);
    IF NOT (v_limit_check->>'allowed')::boolean THEN
      RETURN jsonb_build_object('success', false, 'reason', 'action_limit_reached', 'usage', v_limit_check);
    END IF;
  END IF;
  
  -- Insert the event
  INSERT INTO analytics_events (
    restaurant_id, event_type, is_action, source, campaign, 
    referrer, user_agent, ip_hash, country, city, device_type
  ) VALUES (
    p_restaurant_id, p_event_type, p_is_action, p_source, p_campaign,
    p_referrer, p_user_agent, p_ip_hash, p_country, p_city, p_device_type
  );
  
  -- Update monthly usage
  INSERT INTO monthly_usage (restaurant_id, month, action_count, page_views)
  VALUES (
    p_restaurant_id, 
    v_month, 
    CASE WHEN p_is_action THEN 1 ELSE 0 END,
    CASE WHEN p_event_type = 'page_view' THEN 1 ELSE 0 END
  )
  ON CONFLICT (restaurant_id, month) DO UPDATE SET
    action_count = monthly_usage.action_count + CASE WHEN p_is_action THEN 1 ELSE 0 END,
    page_views = monthly_usage.page_views + CASE WHEN p_event_type = 'page_view' THEN 1 ELSE 0 END,
    updated_at = NOW();
  
  -- Update daily stats with all event types
  INSERT INTO analytics_daily_stats (
    restaurant_id, 
    date, 
    total_actions, 
    page_views,
    phone_reveals,
    address_reveals,
    website_reveals,
    reservation_clicks,
    hours_views,
    phone_clicks,
    maps_clicks,
    website_clicks,
    opentable_clicks,
    resy_clicks,
    whatsapp_clicks,
    tripadvisor_clicks,
    instagram_clicks,
    facebook_clicks,
    twitter_clicks,
    yelp_clicks,
    email_clicks
  )
  VALUES (
    p_restaurant_id, 
    v_date, 
    CASE WHEN p_is_action THEN 1 ELSE 0 END, 
    CASE WHEN p_event_type = 'page_view' THEN 1 ELSE 0 END,
    CASE WHEN p_event_type = 'phone_reveal' THEN 1 ELSE 0 END,
    CASE WHEN p_event_type = 'address_reveal' THEN 1 ELSE 0 END,
    CASE WHEN p_event_type = 'website_reveal' THEN 1 ELSE 0 END,
    CASE WHEN p_event_type IN ('reservation_click', 'opentable_click', 'resy_click', 'whatsapp_click') THEN 1 ELSE 0 END,
    CASE WHEN p_event_type = 'hours_view' THEN 1 ELSE 0 END,
    CASE WHEN p_event_type = 'phone_click' THEN 1 ELSE 0 END,
    CASE WHEN p_event_type = 'maps_click' THEN 1 ELSE 0 END,
    CASE WHEN p_event_type = 'website_click' THEN 1 ELSE 0 END,
    CASE WHEN p_event_type = 'opentable_click' THEN 1 ELSE 0 END,
    CASE WHEN p_event_type = 'resy_click' THEN 1 ELSE 0 END,
    CASE WHEN p_event_type = 'whatsapp_click' THEN 1 ELSE 0 END,
    CASE WHEN p_event_type = 'tripadvisor_click' THEN 1 ELSE 0 END,
    CASE WHEN p_event_type = 'instagram_click' THEN 1 ELSE 0 END,
    CASE WHEN p_event_type = 'facebook_click' THEN 1 ELSE 0 END,
    CASE WHEN p_event_type = 'twitter_click' THEN 1 ELSE 0 END,
    CASE WHEN p_event_type = 'yelp_click' THEN 1 ELSE 0 END,
    CASE WHEN p_event_type = 'email_click' THEN 1 ELSE 0 END
  )
  ON CONFLICT (restaurant_id, date) DO UPDATE SET
    page_views = analytics_daily_stats.page_views + CASE WHEN p_event_type = 'page_view' THEN 1 ELSE 0 END,
    phone_reveals = analytics_daily_stats.phone_reveals + CASE WHEN p_event_type = 'phone_reveal' THEN 1 ELSE 0 END,
    address_reveals = analytics_daily_stats.address_reveals + CASE WHEN p_event_type = 'address_reveal' THEN 1 ELSE 0 END,
    website_reveals = analytics_daily_stats.website_reveals + CASE WHEN p_event_type = 'website_reveal' THEN 1 ELSE 0 END,
    reservation_clicks = analytics_daily_stats.reservation_clicks + CASE WHEN p_event_type IN ('reservation_click', 'opentable_click', 'resy_click', 'whatsapp_click') THEN 1 ELSE 0 END,
    hours_views = analytics_daily_stats.hours_views + CASE WHEN p_event_type = 'hours_view' THEN 1 ELSE 0 END,
    phone_clicks = analytics_daily_stats.phone_clicks + CASE WHEN p_event_type = 'phone_click' THEN 1 ELSE 0 END,
    maps_clicks = analytics_daily_stats.maps_clicks + CASE WHEN p_event_type = 'maps_click' THEN 1 ELSE 0 END,
    website_clicks = analytics_daily_stats.website_clicks + CASE WHEN p_event_type = 'website_click' THEN 1 ELSE 0 END,
    opentable_clicks = analytics_daily_stats.opentable_clicks + CASE WHEN p_event_type = 'opentable_click' THEN 1 ELSE 0 END,
    resy_clicks = analytics_daily_stats.resy_clicks + CASE WHEN p_event_type = 'resy_click' THEN 1 ELSE 0 END,
    whatsapp_clicks = analytics_daily_stats.whatsapp_clicks + CASE WHEN p_event_type = 'whatsapp_click' THEN 1 ELSE 0 END,
    tripadvisor_clicks = analytics_daily_stats.tripadvisor_clicks + CASE WHEN p_event_type = 'tripadvisor_click' THEN 1 ELSE 0 END,
    instagram_clicks = analytics_daily_stats.instagram_clicks + CASE WHEN p_event_type = 'instagram_click' THEN 1 ELSE 0 END,
    facebook_clicks = analytics_daily_stats.facebook_clicks + CASE WHEN p_event_type = 'facebook_click' THEN 1 ELSE 0 END,
    twitter_clicks = analytics_daily_stats.twitter_clicks + CASE WHEN p_event_type = 'twitter_click' THEN 1 ELSE 0 END,
    yelp_clicks = analytics_daily_stats.yelp_clicks + CASE WHEN p_event_type = 'yelp_click' THEN 1 ELSE 0 END,
    email_clicks = analytics_daily_stats.email_clicks + CASE WHEN p_event_type = 'email_click' THEN 1 ELSE 0 END,
    total_actions = analytics_daily_stats.total_actions + CASE WHEN p_is_action THEN 1 ELSE 0 END,
    updated_at = NOW();
  
  RETURN jsonb_build_object('success', true, 'event_type', p_event_type);
END;
$$ LANGUAGE plpgsql;

COMMENT ON COLUMN analytics_daily_stats.phone_clicks IS 'Count of phone_click events';
COMMENT ON COLUMN analytics_daily_stats.maps_clicks IS 'Count of maps_click events';
COMMENT ON COLUMN analytics_daily_stats.website_clicks IS 'Count of website_click events';
COMMENT ON COLUMN analytics_daily_stats.opentable_clicks IS 'Count of opentable_click events';
COMMENT ON COLUMN analytics_daily_stats.resy_clicks IS 'Count of resy_click events';
COMMENT ON COLUMN analytics_daily_stats.whatsapp_clicks IS 'Count of whatsapp_click events';
COMMENT ON COLUMN analytics_daily_stats.tripadvisor_clicks IS 'Count of tripadvisor_click events';
COMMENT ON COLUMN analytics_daily_stats.instagram_clicks IS 'Count of instagram_click events';
COMMENT ON COLUMN analytics_daily_stats.facebook_clicks IS 'Count of facebook_click events';
COMMENT ON COLUMN analytics_daily_stats.twitter_clicks IS 'Count of twitter_click events';
COMMENT ON COLUMN analytics_daily_stats.yelp_clicks IS 'Count of yelp_click events';
COMMENT ON COLUMN analytics_daily_stats.email_clicks IS 'Count of email_click events';
