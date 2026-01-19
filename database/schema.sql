-- BiteReserve Database Schema v2
-- Includes: Subscriptions, Usage Limits, Guest Actions
-- Run this in Supabase SQL Editor

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE (Restaurant Owners)
-- ============================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);

-- ============================================
-- SUBSCRIPTIONS TABLE
-- ============================================
-- Plan types: 'free', 'pro', 'business', 'enterprise'
-- Status: 'active', 'trialing', 'past_due', 'canceled', 'paused'
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan VARCHAR(20) NOT NULL DEFAULT 'free',
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  trial_ends_at TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,
  -- Plan limits (can override defaults for grandfathering)
  max_restaurants INTEGER DEFAULT 1,
  max_campaign_links INTEGER DEFAULT 3, -- NULL = unlimited
  max_actions_per_month INTEGER DEFAULT 25, -- NULL = unlimited
  analytics_retention_days INTEGER DEFAULT 14,
  -- Features
  remove_branding BOOLEAN DEFAULT FALSE,
  weekly_email_reports BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id);

-- ============================================
-- RESTAURANTS TABLE
-- ============================================
CREATE TABLE restaurants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  tagline VARCHAR(500),
  address TEXT,
  phone VARCHAR(50),
  website VARCHAR(500),
  google_place_id VARCHAR(255),
  google_maps_url TEXT,
  rating DECIMAL(2,1),
  review_count INTEGER DEFAULT 0,
  price_level VARCHAR(10),
  cuisine TEXT[],
  features TEXT[],
  description TEXT,
  hours JSONB,
  -- Booking integrations
  booking_url TEXT, -- OpenTable, Resy, etc.
  booking_platform VARCHAR(50), -- 'opentable', 'resy', 'direct', 'whatsapp', etc.
  whatsapp_number VARCHAR(50),
  -- Status
  is_claimed BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  -- Settings
  show_branding BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_restaurants_slug ON restaurants(slug);
CREATE INDEX idx_restaurants_user ON restaurants(user_id);
CREATE INDEX idx_restaurants_claimed ON restaurants(is_claimed);

-- ============================================
-- CAMPAIGN LINKS TABLE
-- ============================================
CREATE TABLE campaign_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL, -- hotel, influencer, social, email, qr, ads, other
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(restaurant_id, slug)
);

CREATE INDEX idx_campaign_links_restaurant ON campaign_links(restaurant_id);
CREATE INDEX idx_campaign_links_slug ON campaign_links(restaurant_id, slug);

-- ============================================
-- ANALYTICS EVENTS TABLE
-- ============================================
-- Event types:
--   page_view (not counted as action)
--   phone_reveal, address_reveal, website_reveal (counted as action)
--   reservation_click, opentable_click, resy_click, whatsapp_click (counted as action)
--   hours_view (not counted as action)

CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  is_action BOOLEAN DEFAULT FALSE, -- TRUE if this counts toward monthly action limit
  source VARCHAR(100),
  campaign VARCHAR(100),
  referrer TEXT,
  user_agent TEXT,
  ip_hash VARCHAR(64),
  country VARCHAR(2),
  city VARCHAR(100),
  device_type VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_events_restaurant_created ON analytics_events(restaurant_id, created_at DESC);
CREATE INDEX idx_events_restaurant_type ON analytics_events(restaurant_id, event_type);
CREATE INDEX idx_events_campaign ON analytics_events(campaign) WHERE campaign IS NOT NULL;
CREATE INDEX idx_events_actions ON analytics_events(restaurant_id, is_action, created_at DESC) WHERE is_action = TRUE;

-- ============================================
-- MONTHLY USAGE TABLE (For tracking action limits)
-- ============================================
CREATE TABLE monthly_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  month DATE NOT NULL, -- First day of month (e.g., 2026-01-01)
  action_count INTEGER DEFAULT 0,
  page_views INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(restaurant_id, month)
);

CREATE INDEX idx_monthly_usage_restaurant_month ON monthly_usage(restaurant_id, month DESC);

-- ============================================
-- DAILY STATS TABLE (For fast dashboard loads)
-- ============================================
CREATE TABLE analytics_daily_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  page_views INTEGER DEFAULT 0,
  phone_reveals INTEGER DEFAULT 0,
  address_reveals INTEGER DEFAULT 0,
  website_reveals INTEGER DEFAULT 0,
  reservation_clicks INTEGER DEFAULT 0,
  hours_views INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  total_actions INTEGER DEFAULT 0, -- Sum of all action types
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(restaurant_id, date)
);

CREATE INDEX idx_daily_stats_restaurant_date ON analytics_daily_stats(restaurant_id, date DESC);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_daily_stats ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Users can view their own subscription
CREATE POLICY "Users can view own subscription" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Public read access to restaurants (for restaurant pages)
CREATE POLICY "Public can view active restaurants" ON restaurants
  FOR SELECT USING (is_active = TRUE);

-- Users can manage their own restaurants
CREATE POLICY "Users can manage own restaurants" ON restaurants
  FOR ALL USING (auth.uid() = user_id);

-- Public can view campaign links (for URL resolution)
CREATE POLICY "Public can view active campaign links" ON campaign_links
  FOR SELECT USING (is_active = TRUE);

-- Allow anonymous inserts to analytics_events (for tracking)
CREATE POLICY "Anyone can insert analytics events" ON analytics_events
  FOR INSERT WITH CHECK (true);

-- Service role can read all analytics
CREATE POLICY "Service role can read analytics" ON analytics_events
  FOR SELECT USING (auth.role() = 'service_role');

-- Service role can manage all data
CREATE POLICY "Service role full access users" ON users
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access subscriptions" ON subscriptions
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access restaurants" ON restaurants
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access campaign_links" ON campaign_links
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access monthly_usage" ON monthly_usage
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access daily_stats" ON analytics_daily_stats
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- FUNCTIONS
-- ============================================

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER restaurants_updated_at BEFORE UPDATE ON restaurants FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER monthly_usage_updated_at BEFORE UPDATE ON monthly_usage FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER daily_stats_updated_at BEFORE UPDATE ON analytics_daily_stats FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Function to get current month start
CREATE OR REPLACE FUNCTION get_month_start(ts TIMESTAMPTZ DEFAULT NOW())
RETURNS DATE AS $$
BEGIN
  RETURN DATE_TRUNC('month', ts)::DATE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to check if restaurant has reached action limit
CREATE OR REPLACE FUNCTION check_action_limit(p_restaurant_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID;
  v_limit INTEGER;
  v_current_count INTEGER;
  v_month DATE;
BEGIN
  v_month := get_month_start();
  
  -- Get restaurant's user
  SELECT user_id INTO v_user_id FROM restaurants WHERE id = p_restaurant_id;
  
  -- Get subscription limit (NULL = unlimited)
  SELECT max_actions_per_month INTO v_limit
  FROM subscriptions
  WHERE user_id = v_user_id;
  
  -- If no subscription or unlimited, allow
  IF v_limit IS NULL THEN
    RETURN jsonb_build_object('allowed', true, 'limit', null, 'current', 0);
  END IF;
  
  -- Get current month usage
  SELECT COALESCE(action_count, 0) INTO v_current_count
  FROM monthly_usage
  WHERE restaurant_id = p_restaurant_id AND month = v_month;
  
  RETURN jsonb_build_object(
    'allowed', v_current_count < v_limit,
    'limit', v_limit,
    'current', v_current_count,
    'remaining', GREATEST(0, v_limit - v_current_count)
  );
END;
$$ LANGUAGE plpgsql;

-- Function to record an event and update usage
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
  
  -- Update daily stats
  INSERT INTO analytics_daily_stats (restaurant_id, date, total_actions, page_views)
  VALUES (p_restaurant_id, v_date, CASE WHEN p_is_action THEN 1 ELSE 0 END, CASE WHEN p_event_type = 'page_view' THEN 1 ELSE 0 END)
  ON CONFLICT (restaurant_id, date) DO UPDATE SET
    page_views = analytics_daily_stats.page_views + CASE WHEN p_event_type = 'page_view' THEN 1 ELSE 0 END,
    phone_reveals = analytics_daily_stats.phone_reveals + CASE WHEN p_event_type = 'phone_reveal' THEN 1 ELSE 0 END,
    address_reveals = analytics_daily_stats.address_reveals + CASE WHEN p_event_type = 'address_reveal' THEN 1 ELSE 0 END,
    website_reveals = analytics_daily_stats.website_reveals + CASE WHEN p_event_type = 'website_reveal' THEN 1 ELSE 0 END,
    reservation_clicks = analytics_daily_stats.reservation_clicks + CASE WHEN p_event_type IN ('reservation_click', 'opentable_click', 'resy_click', 'whatsapp_click') THEN 1 ELSE 0 END,
    hours_views = analytics_daily_stats.hours_views + CASE WHEN p_event_type = 'hours_view' THEN 1 ELSE 0 END,
    total_actions = analytics_daily_stats.total_actions + CASE WHEN p_is_action THEN 1 ELSE 0 END,
    updated_at = NOW();
  
  RETURN jsonb_build_object('success', true, 'event_type', p_event_type);
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- VIEWS
-- ============================================

-- View for restaurant dashboard data
CREATE OR REPLACE VIEW restaurant_dashboard AS
SELECT 
  r.id,
  r.slug,
  r.name,
  r.user_id,
  s.plan,
  s.status AS subscription_status,
  s.max_actions_per_month,
  s.analytics_retention_days,
  mu.action_count AS current_month_actions,
  CASE 
    WHEN s.max_actions_per_month IS NULL THEN NULL
    ELSE s.max_actions_per_month - COALESCE(mu.action_count, 0)
  END AS actions_remaining
FROM restaurants r
LEFT JOIN users u ON r.user_id = u.id
LEFT JOIN subscriptions s ON u.id = s.user_id
LEFT JOIN monthly_usage mu ON r.id = mu.restaurant_id AND mu.month = get_month_start();

-- ============================================
-- SEED DATA
-- ============================================

-- Test user
INSERT INTO users (id, email, name)
VALUES ('00000000-0000-0000-0000-000000000001', 'demo@bitereserve.com', 'Demo User');

-- Test subscription (Free plan)
INSERT INTO subscriptions (user_id, plan, status, max_restaurants, max_campaign_links, max_actions_per_month, analytics_retention_days)
VALUES ('00000000-0000-0000-0000-000000000001', 'free', 'active', 1, 3, 25, 14);

-- Test restaurant
INSERT INTO restaurants (user_id, slug, name, tagline, address, phone, website, google_maps_url, rating, review_count, price_level, cuisine, features, description, hours, is_claimed)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'la-terrazza-del-mare',
  'La Terrazza del Mare',
  'Authentic Italian Coastal Cuisine',
  '123 Ocean View Boulevard, Marina District, San Francisco, CA 94123',
  '+1 (415) 555-0123',
  'https://laterrazzadelmare.com',
  'https://maps.google.com/?q=La+Terrazza+del+Mare+San+Francisco',
  4.7,
  342,
  '$$$',
  ARRAY['Italian', 'Seafood', 'Mediterranean'],
  ARRAY['Outdoor Seating', 'Ocean View', 'Private Dining', 'Full Bar', 'Valet Parking'],
  'Experience the essence of Italian coastal dining at La Terrazza del Mare.',
  '{"monday": "5:00 PM – 10:00 PM", "tuesday": "5:00 PM – 10:00 PM", "wednesday": "5:00 PM – 10:00 PM", "thursday": "5:00 PM – 10:30 PM", "friday": "5:00 PM – 11:00 PM", "saturday": "12:00 PM – 3:00 PM, 5:30 PM – 11:00 PM", "sunday": "12:00 PM – 9:00 PM"}'::jsonb,
  TRUE
);

-- Test campaign links
INSERT INTO campaign_links (restaurant_id, name, slug, type)
SELECT id, 'Grand Hotel Lobby', 'grand-hotel', 'hotel' FROM restaurants WHERE slug = 'la-terrazza-del-mare';

INSERT INTO campaign_links (restaurant_id, name, slug, type)
SELECT id, 'Instagram Bio Link', 'instagram', 'social' FROM restaurants WHERE slug = 'la-terrazza-del-mare';

INSERT INTO campaign_links (restaurant_id, name, slug, type)
SELECT id, '@foodie_adventures', 'foodie-adventures', 'influencer' FROM restaurants WHERE slug = 'la-terrazza-del-mare';
