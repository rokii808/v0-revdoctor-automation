-- RevvDoctor Database Migrations (Safe Version - Handles Existing Objects)
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

-- ============================================
-- STEP 1: Create dealers table if it doesn't exist
-- ============================================
CREATE TABLE IF NOT EXISTS dealers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  dealer_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  address TEXT,
  subscription_status TEXT DEFAULT 'trial' CHECK (subscription_status IN ('trial', 'active', 'cancelled', 'expired')),
  subscription_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- STEP 2: Create user_preferences table
-- ============================================
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id UUID NOT NULL REFERENCES dealers(id) ON DELETE CASCADE,
  preferred_makes TEXT[] DEFAULT '{}',
  preferred_models TEXT[] DEFAULT '{}',
  min_year INTEGER DEFAULT 2010,
  max_year INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER,
  min_price INTEGER DEFAULT 0,
  max_price INTEGER DEFAULT 50000,
  max_mileage INTEGER DEFAULT 100000,
  preferred_condition TEXT[] DEFAULT ARRAY['Excellent', 'Good'],
  preferred_fuel_type TEXT[] DEFAULT '{}',
  preferred_transmission TEXT[] DEFAULT '{}',
  enabled_auction_sites TEXT[] DEFAULT ARRAY['RAW2K'],
  email_frequency TEXT DEFAULT 'daily' CHECK (email_frequency IN ('daily', 'weekly', 'instant')),
  min_vehicles_to_send INTEGER DEFAULT 3,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- STEP 3: Verify vehicle_matches table exists
-- ============================================
CREATE TABLE IF NOT EXISTS vehicle_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id UUID REFERENCES dealers(id) ON DELETE CASCADE,
  auction_site TEXT NOT NULL,
  make TEXT NOT NULL,
  model TEXT,
  year INTEGER,
  price DECIMAL(10, 2),
  mileage INTEGER,
  condition TEXT,
  fuel_type TEXT,
  transmission TEXT,
  listing_url TEXT,
  image_url TEXT,
  description TEXT,
  match_score INTEGER DEFAULT 0 CHECK (match_score >= 0 AND match_score <= 100),
  verdict TEXT,
  reason TEXT,
  risk_level INTEGER,
  profit_estimate INTEGER,
  is_sent BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- STEP 4: Create other required tables
-- ============================================

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  status TEXT NOT NULL CHECK (status IN ('active', 'cancelled', 'past_due', 'trialing', 'incomplete')),
  plan TEXT NOT NULL CHECK (plan IN ('starter', 'professional', 'enterprise')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leads table
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id UUID REFERENCES dealers(id) ON DELETE CASCADE,
  vehicle_id UUID REFERENCES vehicle_matches(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'won', 'lost')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Car alerts table
CREATE TABLE IF NOT EXISTS car_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id UUID REFERENCES dealers(id) ON DELETE CASCADE,
  vehicle_id UUID REFERENCES vehicle_matches(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('price_drop', 'new_match', 'expiring_soon')),
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Saved searches table
CREATE TABLE IF NOT EXISTS saved_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id UUID REFERENCES dealers(id) ON DELETE CASCADE,
  search_name TEXT NOT NULL,
  search_criteria JSONB NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insights table (legacy - for backward compatibility)
CREATE TABLE IF NOT EXISTS insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id UUID REFERENCES dealers(id) ON DELETE CASCADE,
  auction_site TEXT,
  make TEXT,
  model TEXT,
  year INTEGER,
  price DECIMAL(10, 2),
  mileage INTEGER,
  condition TEXT,
  listing_url TEXT,
  verdict TEXT,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Healthy cars table (legacy - for backward compatibility)
CREATE TABLE IF NOT EXISTS healthy_cars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id UUID REFERENCES dealers(id) ON DELETE CASCADE,
  auction_site TEXT,
  make TEXT,
  model TEXT,
  year INTEGER,
  price DECIMAL(10, 2),
  mileage INTEGER,
  condition TEXT,
  listing_url TEXT,
  verdict TEXT,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- STEP 5: Enable Row Level Security (RLS)
-- ============================================
ALTER TABLE dealers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE car_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE healthy_cars ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 6: Drop ALL existing policies
-- ============================================
DO $$
DECLARE
    r RECORD;
BEGIN
    -- Drop all policies on dealers
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'dealers') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON dealers';
    END LOOP;

    -- Drop all policies on user_preferences
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'user_preferences') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON user_preferences';
    END LOOP;

    -- Drop all policies on vehicle_matches
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'vehicle_matches') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON vehicle_matches';
    END LOOP;

    -- Drop all policies on subscriptions
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'subscriptions') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON subscriptions';
    END LOOP;

    -- Drop all policies on leads
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'leads') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON leads';
    END LOOP;

    -- Drop all policies on car_alerts
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'car_alerts') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON car_alerts';
    END LOOP;

    -- Drop all policies on saved_searches
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'saved_searches') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON saved_searches';
    END LOOP;

    -- Drop all policies on insights
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'insights') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON insights';
    END LOOP;

    -- Drop all policies on healthy_cars
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'healthy_cars') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON healthy_cars';
    END LOOP;
END $$;

-- ============================================
-- STEP 7: Create NEW RLS Policies
-- ============================================

-- Dealers policies
CREATE POLICY "Users can view own dealer profile"
  ON dealers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own dealer profile"
  ON dealers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own dealer profile"
  ON dealers FOR UPDATE
  USING (auth.uid() = user_id);

-- User preferences policies
CREATE POLICY "Users can view own preferences"
  ON user_preferences FOR SELECT
  USING (dealer_id IN (SELECT id FROM dealers WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert own preferences"
  ON user_preferences FOR INSERT
  WITH CHECK (dealer_id IN (SELECT id FROM dealers WHERE user_id = auth.uid()));

CREATE POLICY "Users can update own preferences"
  ON user_preferences FOR UPDATE
  USING (dealer_id IN (SELECT id FROM dealers WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete own preferences"
  ON user_preferences FOR DELETE
  USING (dealer_id IN (SELECT id FROM dealers WHERE user_id = auth.uid()));

-- Vehicle matches policies
CREATE POLICY "Users can view own vehicle matches"
  ON vehicle_matches FOR SELECT
  USING (dealer_id IN (SELECT id FROM dealers WHERE user_id = auth.uid()) OR dealer_id IS NULL);

-- Service role can insert (for scraper jobs)
CREATE POLICY "Service role can insert vehicle matches"
  ON vehicle_matches FOR INSERT
  WITH CHECK (true);

-- Subscriptions policies
CREATE POLICY "Users can view own subscriptions"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Leads policies
CREATE POLICY "Users can view own leads"
  ON leads FOR SELECT
  USING (dealer_id IN (SELECT id FROM dealers WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert own leads"
  ON leads FOR INSERT
  WITH CHECK (dealer_id IN (SELECT id FROM dealers WHERE user_id = auth.uid()));

CREATE POLICY "Users can update own leads"
  ON leads FOR UPDATE
  USING (dealer_id IN (SELECT id FROM dealers WHERE user_id = auth.uid()));

-- Alerts policies
CREATE POLICY "Users can view own alerts"
  ON car_alerts FOR SELECT
  USING (dealer_id IN (SELECT id FROM dealers WHERE user_id = auth.uid()));

CREATE POLICY "Users can update own alerts"
  ON car_alerts FOR UPDATE
  USING (dealer_id IN (SELECT id FROM dealers WHERE user_id = auth.uid()));

-- Saved searches policies
CREATE POLICY "Users can view own searches"
  ON saved_searches FOR SELECT
  USING (dealer_id IN (SELECT id FROM dealers WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert own searches"
  ON saved_searches FOR INSERT
  WITH CHECK (dealer_id IN (SELECT id FROM dealers WHERE user_id = auth.uid()));

CREATE POLICY "Users can update own searches"
  ON saved_searches FOR UPDATE
  USING (dealer_id IN (SELECT id FROM dealers WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete own searches"
  ON saved_searches FOR DELETE
  USING (dealer_id IN (SELECT id FROM dealers WHERE user_id = auth.uid()));

-- Legacy tables policies
CREATE POLICY "Users can view own insights"
  ON insights FOR SELECT
  USING (dealer_id IN (SELECT id FROM dealers WHERE user_id = auth.uid()) OR dealer_id IS NULL);

CREATE POLICY "Users can view own healthy cars"
  ON healthy_cars FOR SELECT
  USING (dealer_id IN (SELECT id FROM dealers WHERE user_id = auth.uid()) OR dealer_id IS NULL);

-- ============================================
-- STEP 8: Create Indexes (if not exist)
-- ============================================

-- Create indexes only if they don't exist
DO $$
BEGIN
    -- Dealers indexes
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_dealers_user_id') THEN
        CREATE INDEX idx_dealers_user_id ON dealers(user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_dealers_email') THEN
        CREATE INDEX idx_dealers_email ON dealers(email);
    END IF;

    -- User preferences indexes
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_user_preferences_dealer') THEN
        CREATE INDEX idx_user_preferences_dealer ON user_preferences(dealer_id);
    END IF;

    -- Vehicle matches indexes
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_vehicle_matches_dealer_date') THEN
        CREATE INDEX idx_vehicle_matches_dealer_date ON vehicle_matches(dealer_id, created_at DESC);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_vehicle_matches_sent') THEN
        CREATE INDEX idx_vehicle_matches_sent ON vehicle_matches(is_sent, sent_at);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_vehicle_matches_auction_site') THEN
        CREATE INDEX idx_vehicle_matches_auction_site ON vehicle_matches(auction_site);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_vehicle_matches_match_score') THEN
        CREATE INDEX idx_vehicle_matches_match_score ON vehicle_matches(match_score DESC);
    END IF;

    -- Subscriptions indexes
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_subscriptions_user_id') THEN
        CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
    END IF;

    -- Leads indexes
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_leads_dealer_id') THEN
        CREATE INDEX idx_leads_dealer_id ON leads(dealer_id);
    END IF;

    -- Alerts indexes
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_alerts_dealer_id') THEN
        CREATE INDEX idx_alerts_dealer_id ON car_alerts(dealer_id);
    END IF;

    -- Searches indexes
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_searches_dealer_id') THEN
        CREATE INDEX idx_searches_dealer_id ON saved_searches(dealer_id);
    END IF;
END $$;

-- ============================================
-- STEP 9: Create Updated At Triggers
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_dealers_updated_at ON dealers;
DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON user_preferences;
DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
DROP TRIGGER IF EXISTS update_leads_updated_at ON leads;
DROP TRIGGER IF EXISTS update_searches_updated_at ON saved_searches;

-- Create triggers
CREATE TRIGGER update_dealers_updated_at
  BEFORE UPDATE ON dealers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_searches_updated_at
  BEFORE UPDATE ON saved_searches
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- STEP 10: Verify All Tables Created Successfully
-- ============================================

SELECT 'dealers created' as status, COUNT(*) as row_count FROM dealers
UNION ALL
SELECT 'user_preferences created' as status, COUNT(*) as row_count FROM user_preferences
UNION ALL
SELECT 'vehicle_matches created' as status, COUNT(*) as row_count FROM vehicle_matches
UNION ALL
SELECT 'subscriptions created' as status, COUNT(*) as row_count FROM subscriptions
UNION ALL
SELECT 'leads created' as status, COUNT(*) as row_count FROM leads
UNION ALL
SELECT 'car_alerts created' as status, COUNT(*) as row_count FROM car_alerts
UNION ALL
SELECT 'saved_searches created' as status, COUNT(*) as row_count FROM saved_searches
UNION ALL
SELECT 'insights created' as status, COUNT(*) as row_count FROM insights
UNION ALL
SELECT 'healthy_cars created' as status, COUNT(*) as row_count FROM healthy_cars;

-- ============================================
-- Migration Complete! 🎉
-- ============================================
