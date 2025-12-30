-- ============================================================================
-- MIGRATION 07: Fix and Reconcile Database Schema
-- Date: 2025-12-29
-- Purpose: Idempotent migration that fixes errors and adds missing columns
-- Safe to run multiple times
-- ============================================================================

-- ============================================================================
-- SECTION 1: Drop and recreate RLS policies (to avoid "already exists" errors)
-- ============================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own dealer data" ON dealers;
DROP POLICY IF EXISTS "Users can view own dealer data" ON dealers_v2;
DROP POLICY IF EXISTS "Only admins can view system_stats" ON system_stats;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "saved_searches_select_policy" ON saved_searches;
DROP POLICY IF EXISTS "saved_searches_insert_policy" ON saved_searches;
DROP POLICY IF EXISTS "saved_searches_update_policy" ON saved_searches;
DROP POLICY IF EXISTS "saved_searches_delete_policy" ON saved_searches;

-- ============================================================================
-- SECTION 2: Add missing columns to dealers table (if they don't exist)
-- ============================================================================

-- Add subscription-related columns to dealers
DO $$
BEGIN
  -- payment_failed
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'dealers' AND column_name = 'payment_failed'
  ) THEN
    ALTER TABLE dealers ADD COLUMN payment_failed BOOLEAN DEFAULT false;
  END IF;

  -- subscription_status
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'dealers' AND column_name = 'subscription_status'
  ) THEN
    ALTER TABLE dealers ADD COLUMN subscription_status TEXT DEFAULT 'trial';
  END IF;

  -- subscription_expires_at
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'dealers' AND column_name = 'subscription_expires_at'
  ) THEN
    ALTER TABLE dealers ADD COLUMN subscription_expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '14 days');
  END IF;

  -- selected_plan
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'dealers' AND column_name = 'selected_plan'
  ) THEN
    ALTER TABLE dealers ADD COLUMN selected_plan TEXT DEFAULT 'trial';
  END IF;

  -- zip_code (for market intelligence)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'dealers' AND column_name = 'zip_code'
  ) THEN
    ALTER TABLE dealers ADD COLUMN zip_code VARCHAR(10);
  END IF;

  -- state (for market intelligence)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'dealers' AND column_name = 'state'
  ) THEN
    ALTER TABLE dealers ADD COLUMN state VARCHAR(2);
  END IF;

  -- city (for market intelligence)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'dealers' AND column_name = 'city'
  ) THEN
    ALTER TABLE dealers ADD COLUMN city VARCHAR(100);
  END IF;

  -- market_radius_miles
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'dealers' AND column_name = 'market_radius_miles'
  ) THEN
    ALTER TABLE dealers ADD COLUMN market_radius_miles INTEGER DEFAULT 50;
  END IF;

  -- avg_days_to_turn
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'dealers' AND column_name = 'avg_days_to_turn'
  ) THEN
    ALTER TABLE dealers ADD COLUMN avg_days_to_turn INTEGER;
  END IF;

  -- target_turn_days
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'dealers' AND column_name = 'target_turn_days'
  ) THEN
    ALTER TABLE dealers ADD COLUMN target_turn_days INTEGER DEFAULT 30;
  END IF;

  -- company_name (CRITICAL - code expects this!)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'dealers' AND column_name = 'company_name'
  ) THEN
    ALTER TABLE dealers ADD COLUMN company_name TEXT;
  END IF;
END $$;

-- ============================================================================
-- SECTION 3: Create saved_searches table (if doesn't exist)
-- ============================================================================

CREATE TABLE IF NOT EXISTS saved_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id UUID NOT NULL,
  name TEXT NOT NULL,
  make TEXT NOT NULL,
  max_mileage INTEGER,
  max_price INTEGER,
  min_year INTEGER,
  fuel_type TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_saved_searches_dealer_id ON saved_searches(dealer_id);
CREATE INDEX IF NOT EXISTS idx_saved_searches_is_active ON saved_searches(is_active);

-- ============================================================================
-- SECTION 4: Create market intelligence tables (if don't exist)
-- ============================================================================

CREATE TABLE IF NOT EXISTS market_intelligence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  make VARCHAR(50) NOT NULL,
  model VARCHAR(100) NOT NULL,
  year INTEGER NOT NULL,
  trim VARCHAR(100),
  zip_code VARCHAR(10) NOT NULL,
  state VARCHAR(2) NOT NULL,
  market_radius_miles INTEGER DEFAULT 50,
  avg_days_to_sell INTEGER,
  median_days_to_sell INTEGER,
  active_listings_count INTEGER DEFAULT 0,
  sold_last_30_days INTEGER DEFAULT 0,
  avg_retail_price INTEGER,
  median_retail_price INTEGER,
  price_trend_7d DECIMAL(5,2),
  price_trend_30d DECIMAL(5,2),
  search_volume_7d INTEGER DEFAULT 0,
  search_volume_30d INTEGER DEFAULT 0,
  demand_score INTEGER,
  seasonality_factor DECIMAL(5,2),
  lowest_comp_price INTEGER,
  highest_comp_price INTEGER,
  avg_comp_mileage INTEGER,
  competitive_intensity VARCHAR(20),
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  data_freshness_hours INTEGER,
  confidence_score INTEGER,
  CONSTRAINT unique_market_snapshot UNIQUE (make, model, year, zip_code, market_radius_miles)
);

CREATE INDEX IF NOT EXISTS idx_market_intelligence_location ON market_intelligence(zip_code, state);
CREATE INDEX IF NOT EXISTS idx_market_intelligence_vehicle ON market_intelligence(make, model, year);
CREATE INDEX IF NOT EXISTS idx_market_intelligence_updated ON market_intelligence(last_updated);

CREATE TABLE IF NOT EXISTS inventory_turn_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_match_id UUID,
  dealer_id UUID NOT NULL,
  market_fit_score INTEGER NOT NULL,
  predicted_days_to_sell_min INTEGER NOT NULL,
  predicted_days_to_sell_max INTEGER NOT NULL,
  confidence_level VARCHAR(20),
  estimated_retail_price INTEGER,
  estimated_recon_cost INTEGER,
  estimated_holding_cost_per_day DECIMAL(10,2),
  true_profit_estimate INTEGER,
  capital_roi_monthly DECIMAL(5,2),
  local_demand_level VARCHAR(20),
  competitive_listings_count INTEGER,
  price_position VARCHAR(20),
  seasonality_impact VARCHAR(20),
  is_fast_mover BOOLEAN DEFAULT false,
  is_slow_mover BOOLEAN DEFAULT false,
  risk_flags JSONB,
  opportunity_flags JSONB,
  recommendation VARCHAR(20),
  recommendation_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  model_version VARCHAR(50)
);

CREATE INDEX IF NOT EXISTS idx_turn_predictions_dealer ON inventory_turn_predictions(dealer_id);
CREATE INDEX IF NOT EXISTS idx_turn_predictions_score ON inventory_turn_predictions(market_fit_score DESC);
CREATE INDEX IF NOT EXISTS idx_turn_predictions_recommendation ON inventory_turn_predictions(recommendation);

-- ============================================================================
-- SECTION 5: Recreate RLS policies (safe, we dropped them above)
-- ============================================================================

-- Enable RLS on tables
ALTER TABLE dealers ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;

-- Dealers policies
CREATE POLICY "Users can view own dealer data" ON dealers
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own dealer data" ON dealers
  FOR UPDATE
  USING (user_id = auth.uid());

-- Saved searches policies
CREATE POLICY "saved_searches_select_policy" ON saved_searches
  FOR SELECT
  USING (dealer_id IN (
    SELECT id FROM dealers WHERE user_id = auth.uid()
  ));

CREATE POLICY "saved_searches_insert_policy" ON saved_searches
  FOR INSERT
  WITH CHECK (dealer_id IN (
    SELECT id FROM dealers WHERE user_id = auth.uid()
  ));

CREATE POLICY "saved_searches_update_policy" ON saved_searches
  FOR UPDATE
  USING (dealer_id IN (
    SELECT id FROM dealers WHERE user_id = auth.uid()
  ));

CREATE POLICY "saved_searches_delete_policy" ON saved_searches
  FOR DELETE
  USING (dealer_id IN (
    SELECT id FROM dealers WHERE user_id = auth.uid()
  ));

-- Profiles policy (if profiles table exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_name = 'profiles'
  ) THEN
    EXECUTE 'ALTER TABLE profiles ENABLE ROW LEVEL SECURITY';
    EXECUTE 'CREATE POLICY "Users can view own profile" ON profiles
      FOR SELECT
      USING (id = auth.uid())';
  END IF;
END $$;

-- System stats policy (if table exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_name = 'system_stats'
  ) THEN
    EXECUTE 'ALTER TABLE system_stats ENABLE ROW LEVEL SECURITY';
    EXECUTE 'CREATE POLICY "Only admins can view system_stats" ON system_stats
      FOR SELECT
      USING (auth.jwt() ->> ''role'' = ''admin'')';
  END IF;
END $$;

-- ============================================================================
-- SECTION 6: Insert sample market intelligence data
-- ============================================================================

INSERT INTO market_intelligence (
  make, model, year, zip_code, state, market_radius_miles,
  avg_days_to_sell, median_days_to_sell, active_listings_count, sold_last_30_days,
  avg_retail_price, median_retail_price, search_volume_30d, demand_score,
  seasonality_factor, competitive_intensity, confidence_score
) VALUES (
  'Honda', 'Accord', 2023, '21201', 'MD', 50,
  18, 16, 5, 12,
  28995, 28500, 47, 87,
  1.15, 'medium', 85
) ON CONFLICT (make, model, year, zip_code, market_radius_miles) DO NOTHING;

INSERT INTO market_intelligence (
  make, model, year, zip_code, state, market_radius_miles,
  avg_days_to_sell, median_days_to_sell, active_listings_count, sold_last_30_days,
  avg_retail_price, median_retail_price, search_volume_30d, demand_score,
  seasonality_factor, competitive_intensity, confidence_score
) VALUES (
  'Toyota', 'Camry', 2023, '21201', 'MD', 50,
  42, 38, 8, 6,
  27495, 27200, 28, 62,
  1.05, 'high', 78
) ON CONFLICT (make, model, year, zip_code, market_radius_miles) DO NOTHING;

-- ============================================================================
-- SECTION 7: Verify everything worked
-- ============================================================================

-- Check critical columns exist
DO $$
DECLARE
  missing_columns TEXT[];
BEGIN
  SELECT ARRAY_AGG(col)
  INTO missing_columns
  FROM (
    VALUES
      ('payment_failed'),
      ('subscription_status'),
      ('zip_code'),
      ('state'),
      ('company_name')
  ) AS required_cols(col)
  WHERE NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'dealers'
      AND column_name = required_cols.col
  );

  IF missing_columns IS NOT NULL AND array_length(missing_columns, 1) > 0 THEN
    RAISE NOTICE 'WARNING: Missing columns in dealers table: %', array_to_string(missing_columns, ', ');
  ELSE
    RAISE NOTICE '✅ All required columns exist in dealers table';
  END IF;
END $$;

-- Check tables exist
DO $$
DECLARE
  missing_tables TEXT[];
BEGIN
  SELECT ARRAY_AGG(tbl)
  INTO missing_tables
  FROM (
    VALUES
      ('dealers'),
      ('saved_searches'),
      ('market_intelligence'),
      ('inventory_turn_predictions')
  ) AS required_tables(tbl)
  WHERE NOT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_name = required_tables.tbl
  );

  IF missing_tables IS NOT NULL AND array_length(missing_tables, 1) > 0 THEN
    RAISE NOTICE 'WARNING: Missing tables: %', array_to_string(missing_tables, ', ');
  ELSE
    RAISE NOTICE '✅ All required tables exist';
  END IF;
END $$;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  RAISE NOTICE '✅ Migration 07 Complete!';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Update your test dealer account with location:';
  RAISE NOTICE '   UPDATE dealers SET zip_code = ''21201'', state = ''MD'', city = ''Baltimore''';
  RAISE NOTICE '   WHERE user_id = (SELECT id FROM auth.users WHERE email = ''your@email.com'');';
  RAISE NOTICE '';
  RAISE NOTICE '2. Deploy to v0.app with environment variables';
  RAISE NOTICE '3. Test login and market intelligence';
  RAISE NOTICE '';
END $$;
