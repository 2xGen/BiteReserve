-- Create increment_daily_stat function for updating daily stats
-- This is called by the tracking API after inserting events directly
CREATE OR REPLACE FUNCTION increment_daily_stat(
  p_restaurant_id UUID,
  p_event_type VARCHAR(50)
)
RETURNS VOID AS $$
DECLARE
  v_date DATE;
  v_is_action BOOLEAN;
BEGIN
  v_date := CURRENT_DATE;
  
  -- Determine if this is an action
  v_is_action := p_event_type IN (
    'phone_click', 'address_click', 'website_click', 'reservation_click',
    'opentable_click', 'resy_click', 'whatsapp_click', 'tripadvisor_click',
    'instagram_click', 'facebook_click', 'twitter_click', 'yelp_click',
    'email_click', 'maps_click'
  );
  
  -- Update daily stats
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
    CASE WHEN v_is_action THEN 1 ELSE 0 END, 
    CASE WHEN p_event_type = 'page_view' THEN 1 ELSE 0 END,
    CASE WHEN p_event_type = 'phone_reveal' THEN 1 ELSE 0 END,
    CASE WHEN p_event_type = 'address_reveal' THEN 1 ELSE 0 END,
    CASE WHEN p_event_type = 'website_reveal' THEN 1 ELSE 0 END,
    CASE WHEN p_event_type IN ('reservation_click', 'opentable_click', 'resy_click', 'whatsapp_click') THEN 1 ELSE 0 END,
    CASE WHEN p_event_type IN ('hours_click', 'hours_view') THEN 1 ELSE 0 END,
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
    address_reveals = analytics_daily_stats.address_reveals + CASE WHEN p_event_type IN ('address_click', 'address_reveal') THEN 1 ELSE 0 END,
    website_reveals = analytics_daily_stats.website_reveals + CASE WHEN p_event_type = 'website_reveal' THEN 1 ELSE 0 END,
    reservation_clicks = analytics_daily_stats.reservation_clicks + CASE WHEN p_event_type IN ('reservation_click', 'opentable_click', 'resy_click', 'whatsapp_click') THEN 1 ELSE 0 END,
    hours_views = analytics_daily_stats.hours_views + CASE WHEN p_event_type IN ('hours_click', 'hours_view') THEN 1 ELSE 0 END,
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
    total_actions = analytics_daily_stats.total_actions + CASE WHEN v_is_action THEN 1 ELSE 0 END,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;
