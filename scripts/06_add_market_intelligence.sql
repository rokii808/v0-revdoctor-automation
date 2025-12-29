-- Migration 06: Add Market Intelligence & Inventory Turn Prediction
-- Date: 2025-12-29
-- Purpose: RevvDoctor's USP - Predictive Inventory Turn Score

-- ============================================================================
-- DEALER LOCATION & MARKET DATA
-- ============================================================================

-- Add location fields to dealers table
ALTER TABLE IF EXISTS dealers
ADD COLUMN IF NOT EXISTS zip_code VARCHAR(10),
ADD COLUMN IF NOT EXISTS city VARCHAR(100),
ADD COLUMN IF NOT EXISTS state VARCHAR(2),
ADD COLUMN IF NOT EXISTS market_radius_miles INTEGER DEFAULT 50,
ADD COLUMN IF NOT EXISTS avg_days_to_turn INTEGER,
ADD COLUMN IF NOT EXISTS target_turn_days INTEGER DEFAULT 30;

ALTER TABLE IF EXISTS dealers_v2
ADD COLUMN IF NOT EXISTS zip_code VARCHAR(10),
ADD COLUMN IF NOT EXISTS city VARCHAR(100),
ADD COLUMN IF NOT EXISTS state VARCHAR(2),
ADD COLUMN IF NOT EXISTS market_radius_miles INTEGER DEFAULT 50,
ADD COLUMN IF NOT EXISTS avg_days_to_turn INTEGER,
ADD COLUMN IF NOT EXISTS target_turn_days INTEGER DEFAULT 30;

-- ============================================================================
-- MARKET INTELLIGENCE TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS market_intelligence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Vehicle identification
  make VARCHAR(50) NOT NULL,
  model VARCHAR(100) NOT NULL,
  year INTEGER NOT NULL,
  trim VARCHAR(100),

  -- Location
  zip_code VARCHAR(10) NOT NULL,
  state VARCHAR(2) NOT NULL,
  market_radius_miles INTEGER DEFAULT 50,

  -- Market metrics
  avg_days_to_sell INTEGER,
  median_days_to_sell INTEGER,
  active_listings_count INTEGER DEFAULT 0,
  sold_last_30_days INTEGER DEFAULT 0,
  avg_retail_price INTEGER,
  median_retail_price INTEGER,
  price_trend_7d DECIMAL(5,2), -- % change
  price_trend_30d DECIMAL(5,2),

  -- Demand signals
  search_volume_7d INTEGER DEFAULT 0,
  search_volume_30d INTEGER DEFAULT 0,
  demand_score INTEGER, -- 0-100
  seasonality_factor DECIMAL(5,2), -- Multiplier for current month

  -- Competitive intelligence
  lowest_comp_price INTEGER,
  highest_comp_price INTEGER,
  avg_comp_mileage INTEGER,
  competitive_intensity VARCHAR(20), -- 'low', 'medium', 'high'

  -- Metadata
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  data_freshness_hours INTEGER,
  confidence_score INTEGER, -- 0-100, data quality indicator

  -- Indexes for fast lookups
  CONSTRAINT unique_market_snapshot UNIQUE (make, model, year, zip_code, market_radius_miles)
);

CREATE INDEX IF NOT EXISTS idx_market_intelligence_location ON market_intelligence(zip_code, state);
CREATE INDEX IF NOT EXISTS idx_market_intelligence_vehicle ON market_intelligence(make, model, year);
CREATE INDEX IF NOT EXISTS idx_market_intelligence_updated ON market_intelligence(last_updated);

-- ============================================================================
-- INVENTORY TURN PREDICTIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS inventory_turn_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Link to vehicle match
  vehicle_match_id UUID REFERENCES vehicle_matches(id) ON DELETE CASCADE,
  dealer_id UUID NOT NULL,

  -- Core prediction
  market_fit_score INTEGER NOT NULL, -- 0-100, THE KEY METRIC
  predicted_days_to_sell_min INTEGER NOT NULL,
  predicted_days_to_sell_max INTEGER NOT NULL,
  confidence_level VARCHAR(20), -- 'low', 'medium', 'high', 'very_high'

  -- Financial projections
  estimated_retail_price INTEGER,
  estimated_recon_cost INTEGER,
  estimated_holding_cost_per_day DECIMAL(10,2),
  true_profit_estimate INTEGER, -- After ALL costs
  capital_roi_monthly DECIMAL(5,2), -- Percentage return per month

  -- Market context
  local_demand_level VARCHAR(20), -- 'very_low', 'low', 'medium', 'high', 'very_high'
  competitive_listings_count INTEGER,
  price_position VARCHAR(20), -- 'below_market', 'at_market', 'above_market'
  seasonality_impact VARCHAR(20), -- 'negative', 'neutral', 'positive'

  -- Insights & flags
  is_fast_mover BOOLEAN DEFAULT false, -- Expected <21 days
  is_slow_mover BOOLEAN DEFAULT false, -- Expected >60 days
  risk_flags JSONB, -- Array of warning strings
  opportunity_flags JSONB, -- Array of positive signals

  -- Recommendation
  recommendation VARCHAR(20), -- 'strong_buy', 'buy', 'consider', 'pass'
  recommendation_reason TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  model_version VARCHAR(50), -- Track which prediction model was used

  CONSTRAINT unique_vehicle_prediction UNIQUE (vehicle_match_id)
);

CREATE INDEX IF NOT EXISTS idx_turn_predictions_dealer ON inventory_turn_predictions(dealer_id);
CREATE INDEX IF NOT EXISTS idx_turn_predictions_score ON inventory_turn_predictions(market_fit_score DESC);
CREATE INDEX IF NOT EXISTS idx_turn_predictions_recommendation ON inventory_turn_predictions(recommendation);
CREATE INDEX IF NOT EXISTS idx_turn_predictions_created ON inventory_turn_predictions(created_at DESC);

-- ============================================================================
-- DEALER INVENTORY PERFORMANCE TRACKING
-- ============================================================================

CREATE TABLE IF NOT EXISTS dealer_inventory_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id UUID NOT NULL,

  -- Time period
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  period_type VARCHAR(20), -- 'weekly', 'monthly', 'quarterly'

  -- Performance metrics
  avg_days_to_sell DECIMAL(5,2),
  median_days_to_sell INTEGER,
  total_vehicles_sold INTEGER,
  total_vehicles_purchased INTEGER,

  -- Financial performance
  avg_profit_per_unit INTEGER,
  total_profit INTEGER,
  avg_holding_cost_per_unit INTEGER,
  capital_velocity_score DECIMAL(5,2), -- Higher = better

  -- Prediction accuracy (for ML improvement)
  avg_prediction_accuracy DECIMAL(5,2), -- How close were we?
  vehicles_tracked INTEGER,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_dealer_period UNIQUE (dealer_id, period_start, period_end, period_type)
);

CREATE INDEX IF NOT EXISTS idx_dealer_performance_dealer ON dealer_inventory_performance(dealer_id);
CREATE INDEX IF NOT EXISTS idx_dealer_performance_period ON dealer_inventory_performance(period_start, period_end);

-- ============================================================================
-- LOCAL MARKET SNAPSHOTS (Daily aggregates)
-- ============================================================================

CREATE TABLE IF NOT EXISTS local_market_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Location
  zip_code VARCHAR(10) NOT NULL,
  state VARCHAR(2) NOT NULL,
  snapshot_date DATE NOT NULL,

  -- Overall market health
  total_active_listings INTEGER,
  total_sold_last_7d INTEGER,
  total_sold_last_30d INTEGER,
  avg_days_on_market DECIMAL(5,2),
  market_temperature VARCHAR(20), -- 'cold', 'cool', 'warm', 'hot'

  -- Price trends
  avg_listing_price INTEGER,
  avg_sold_price INTEGER,
  price_momentum VARCHAR(20), -- 'falling', 'stable', 'rising'

  -- Top movers (JSONB for flexibility)
  fastest_selling_segments JSONB, -- [{make, model, avg_days}, ...]
  slowest_selling_segments JSONB,
  most_competitive_segments JSONB,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_market_snapshot_date UNIQUE (zip_code, snapshot_date)
);

CREATE INDEX IF NOT EXISTS idx_market_snapshots_location ON local_market_snapshots(zip_code, state);
CREATE INDEX IF NOT EXISTS idx_market_snapshots_date ON local_market_snapshots(snapshot_date DESC);

-- ============================================================================
-- SUBSCRIPTION FEATURE GATING
-- ============================================================================

-- Update plan limits to include market intelligence features
COMMENT ON COLUMN dealers.selected_plan IS 'Plan tiers with market intelligence access:
  - trial: Basic turn estimates only (no local data)
  - basic: Full turn predictions + local demand signals
  - startup: + Competitive intelligence + market snapshots
  - premium: + Custom ML model + predictive analytics dashboard';

-- ============================================================================
-- VIEWS FOR EASY QUERYING
-- ============================================================================

-- View: Top opportunities for a dealer (combines vehicle matches + predictions)
CREATE OR REPLACE VIEW v_dealer_top_opportunities AS
SELECT
  vm.id as vehicle_match_id,
  vm.dealer_id,
  vm.make,
  vm.model,
  vm.year,
  vm.price,
  vm.mileage,
  vm.listing_url,
  vm.auction_site,
  itp.market_fit_score,
  itp.predicted_days_to_sell_min,
  itp.predicted_days_to_sell_max,
  itp.true_profit_estimate,
  itp.capital_roi_monthly,
  itp.recommendation,
  itp.is_fast_mover,
  itp.local_demand_level,
  itp.competitive_listings_count
FROM vehicle_matches vm
INNER JOIN inventory_turn_predictions itp ON vm.id = itp.vehicle_match_id
WHERE itp.recommendation IN ('strong_buy', 'buy')
  AND itp.market_fit_score >= 70
ORDER BY itp.market_fit_score DESC, itp.true_profit_estimate DESC;

-- View: Dealer market performance summary
CREATE OR REPLACE VIEW v_dealer_market_performance AS
SELECT
  d.id as dealer_id,
  d.company_name,
  d.zip_code,
  d.avg_days_to_turn,
  d.target_turn_days,
  COUNT(DISTINCT itp.id) as active_predictions,
  AVG(itp.market_fit_score) as avg_market_fit_score,
  SUM(CASE WHEN itp.is_fast_mover THEN 1 ELSE 0 END) as fast_mover_count,
  SUM(CASE WHEN itp.recommendation = 'strong_buy' THEN 1 ELSE 0 END) as strong_buy_count,
  SUM(itp.true_profit_estimate) as total_potential_profit
FROM dealers d
LEFT JOIN inventory_turn_predictions itp ON d.id = itp.dealer_id
GROUP BY d.id, d.company_name, d.zip_code, d.avg_days_to_turn, d.target_turn_days;

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE market_intelligence IS 'Local market data for make/model/year by zip code - powers turn predictions';
COMMENT ON TABLE inventory_turn_predictions IS 'THE CORE USP - Predictive inventory turn scores for each vehicle match';
COMMENT ON TABLE dealer_inventory_performance IS 'Tracks actual dealer performance to improve ML predictions over time';
COMMENT ON TABLE local_market_snapshots IS 'Daily market health snapshots for competitive intelligence';

COMMENT ON COLUMN inventory_turn_predictions.market_fit_score IS 'PRIMARY METRIC (0-100): How well this car fits the dealers market';
COMMENT ON COLUMN inventory_turn_predictions.true_profit_estimate IS 'Profit AFTER recon, holding costs, and all expenses';
COMMENT ON COLUMN inventory_turn_predictions.capital_roi_monthly IS 'Monthly return on capital - key dealer metric';
COMMENT ON COLUMN inventory_turn_predictions.is_fast_mover IS 'Expected to sell in <21 days - highlight these!';

-- ============================================================================
-- SAMPLE DATA FOR DEVELOPMENT
-- ============================================================================

-- Insert sample market intelligence (Baltimore, MD - 2023 Honda Accord)
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

-- Insert sample market intelligence (Baltimore, MD - 2023 Toyota Camry)
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
