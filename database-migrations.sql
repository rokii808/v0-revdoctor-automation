-- RevvDoctor Database Migrations
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

-- ============================================
-- 1. Create user_preferences table
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
-- 2. Create vehicle_matches table
-- ============================================
CREATE TABLE IF NOT EXISTS vehicle_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id UUID NOT NULL REFERENCES dealers(id) ON DELETE CASCADE,
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
-- 3. Enable Row Level Security (RLS)
-- ============================================
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_matches ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 4. Create RLS Policies for user_preferences
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can insert own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can update own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can delete own preferences" ON user_preferences;

-- Create new policies
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

-- ============================================
-- 5. Create RLS Policies for vehicle_matches
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own vehicle matches" ON vehicle_matches;

-- Create new policies
CREATE POLICY "Users can view own vehicle matches"
  ON vehicle_matches FOR SELECT
  USING (dealer_id IN (SELECT id FROM dealers WHERE user_id = auth.uid()));

-- Service role can insert (for scraper jobs)
CREATE POLICY "Service role can insert vehicle matches"
  ON vehicle_matches FOR INSERT
  WITH CHECK (true);

-- ============================================
-- 6. Create Indexes for Performance
-- ============================================

-- Drop existing indexes if they exist
DROP INDEX IF EXISTS idx_user_preferences_dealer;
DROP INDEX IF EXISTS idx_vehicle_matches_dealer_date;
DROP INDEX IF EXISTS idx_vehicle_matches_sent;
DROP INDEX IF EXISTS idx_vehicle_matches_auction_site;
DROP INDEX IF EXISTS idx_vehicle_matches_match_score;

-- Create new indexes
CREATE INDEX idx_user_preferences_dealer ON user_preferences(dealer_id);
CREATE INDEX idx_vehicle_matches_dealer_date ON vehicle_matches(dealer_id, created_at DESC);
CREATE INDEX idx_vehicle_matches_sent ON vehicle_matches(is_sent, sent_at);
CREATE INDEX idx_vehicle_matches_auction_site ON vehicle_matches(auction_site);
CREATE INDEX idx_vehicle_matches_match_score ON vehicle_matches(match_score DESC);

-- ============================================
-- 7. Create Updated At Trigger
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON user_preferences;

-- Create trigger for user_preferences
CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 8. Verify Tables Created Successfully
-- ============================================

-- Check user_preferences table
SELECT
  'user_preferences created' as status,
  COUNT(*) as row_count
FROM user_preferences;

-- Check vehicle_matches table
SELECT
  'vehicle_matches created' as status,
  COUNT(*) as row_count
FROM vehicle_matches;

-- ============================================
-- Migration Complete! 🎉
-- ============================================
-- Next steps:
-- 1. Verify no errors above
-- 2. Test local scraper: npm run dev
-- 3. Start Inngest dev server: npx inngest-cli@latest dev
-- 4. Trigger manual scrape from Inngest dashboard
