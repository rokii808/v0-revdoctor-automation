-- Migration: Add dealer interaction tracking and learned preferences
-- Date: 2026-01-05
-- Purpose: Enable personalized vehicle recommendations based on dealer behavior

-- Dealer interactions table for tracking behavior
CREATE TABLE IF NOT EXISTS dealer_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vehicle_match_id UUID,
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('VIEW', 'SAVE', 'SKIP', 'CONTACT_SELLER', 'SHARE')),
  duration_seconds INTEGER,
  metadata JSONB, -- Additional context: {search_query, filters_active, etc.}
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dealer learned preferences table
CREATE TABLE IF NOT EXISTS dealer_learned_preferences (
  dealer_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  learned_makes JSONB, -- {"BMW": 0.8, "Audi": 0.6, "Mercedes": 0.5}
  learned_models JSONB, -- {"3 Series": 0.9, "A4": 0.7}
  learned_price_range JSONB, -- {"min": 10000, "max": 25000, "preferred": 18000}
  learned_mileage_range JSONB, -- {"max": 60000, "preferred_max": 45000}
  learned_years JSONB, -- {"min": 2018, "preferred_min": 2020}
  learned_conditions JSONB, -- {"HEALTHY": 0.9, "MINOR_ISSUES": 0.3}
  total_interactions INTEGER DEFAULT 0,
  total_saves INTEGER DEFAULT 0,
  total_skips INTEGER DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vehicle matches table (enhanced version tracking personalization scores)
CREATE TABLE IF NOT EXISTS vehicle_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  insight_id UUID REFERENCES insights(id) ON DELETE CASCADE,

  -- Vehicle data (denormalized for quick access)
  make TEXT,
  model TEXT,
  year INTEGER,
  price INTEGER,
  mileage INTEGER,
  url TEXT,
  verdict TEXT,
  risk INTEGER,

  -- Match scoring
  base_score INTEGER DEFAULT 0, -- Original match score (0-100)
  personalization_boost INTEGER DEFAULT 0, -- Added based on learned preferences (-20 to +30)
  final_score INTEGER DEFAULT 0, -- base_score + personalization_boost

  -- Scoring breakdown for transparency
  score_breakdown JSONB, -- {"make_match": 15, "price_range": 10, "year_pref": 5}

  -- Engagement tracking
  viewed BOOLEAN DEFAULT false,
  saved BOOLEAN DEFAULT false,
  skipped BOOLEAN DEFAULT false,
  contacted_seller BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_dealer_interactions_dealer_id ON dealer_interactions(dealer_id);
CREATE INDEX IF NOT EXISTS idx_dealer_interactions_type ON dealer_interactions(interaction_type);
CREATE INDEX IF NOT EXISTS idx_dealer_interactions_created_at ON dealer_interactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_dealer_interactions_vehicle ON dealer_interactions(vehicle_match_id);

CREATE INDEX IF NOT EXISTS idx_vehicle_matches_dealer_id ON vehicle_matches(dealer_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_matches_final_score ON vehicle_matches(final_score DESC);
CREATE INDEX IF NOT EXISTS idx_vehicle_matches_created_at ON vehicle_matches(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_vehicle_matches_saved ON vehicle_matches(saved) WHERE saved = true;
CREATE INDEX IF NOT EXISTS idx_vehicle_matches_verdict ON vehicle_matches(verdict);

-- Enable RLS on new tables
ALTER TABLE dealer_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE dealer_learned_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_matches ENABLE ROW LEVEL SECURITY;

-- RLS Policies for dealer_interactions
CREATE POLICY "Dealers can view own interactions" ON dealer_interactions
  FOR SELECT USING (auth.uid() = dealer_id);
CREATE POLICY "Dealers can insert own interactions" ON dealer_interactions
  FOR INSERT WITH CHECK (auth.uid() = dealer_id);
CREATE POLICY "System can manage interactions" ON dealer_interactions
  FOR ALL USING (true);

-- RLS Policies for dealer_learned_preferences
CREATE POLICY "Dealers can view own preferences" ON dealer_learned_preferences
  FOR SELECT USING (auth.uid() = dealer_id);
CREATE POLICY "System can manage preferences" ON dealer_learned_preferences
  FOR ALL USING (true);

-- RLS Policies for vehicle_matches
CREATE POLICY "Dealers can view own matches" ON vehicle_matches
  FOR SELECT USING (auth.uid() = dealer_id);
CREATE POLICY "Dealers can update own matches" ON vehicle_matches
  FOR UPDATE USING (auth.uid() = dealer_id);
CREATE POLICY "System can insert matches" ON vehicle_matches
  FOR INSERT WITH CHECK (true);

-- Add comments for documentation
COMMENT ON TABLE dealer_interactions IS 'Tracks dealer interactions with vehicle matches for learning preferences';
COMMENT ON TABLE dealer_learned_preferences IS 'Stores learned preferences derived from dealer behavior';
COMMENT ON TABLE vehicle_matches IS 'Vehicle recommendations with personalized scoring';

COMMENT ON COLUMN dealer_interactions.interaction_type IS 'Type: VIEW, SAVE, SKIP, CONTACT_SELLER, SHARE';
COMMENT ON COLUMN dealer_interactions.duration_seconds IS 'How long dealer viewed the vehicle';
COMMENT ON COLUMN dealer_interactions.metadata IS 'Additional context about the interaction';

COMMENT ON COLUMN dealer_learned_preferences.learned_makes IS 'Preference scores for vehicle makes (0-1 scale)';
COMMENT ON COLUMN dealer_learned_preferences.learned_models IS 'Preference scores for specific models';
COMMENT ON COLUMN dealer_learned_preferences.learned_price_range IS 'Inferred price preferences';
COMMENT ON COLUMN dealer_learned_preferences.total_interactions IS 'Total number of tracked interactions';
COMMENT ON COLUMN dealer_learned_preferences.total_saves IS 'Number of vehicles saved';
COMMENT ON COLUMN dealer_learned_preferences.total_skips IS 'Number of vehicles explicitly skipped';

COMMENT ON COLUMN vehicle_matches.base_score IS 'Original matching score before personalization';
COMMENT ON COLUMN vehicle_matches.personalization_boost IS 'Score adjustment based on learned preferences';
COMMENT ON COLUMN vehicle_matches.final_score IS 'Total score (base + boost)';
COMMENT ON COLUMN vehicle_matches.score_breakdown IS 'Detailed breakdown of how score was calculated';

-- Function to update learned preferences based on interactions
CREATE OR REPLACE FUNCTION update_learned_preferences()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert or update learned preferences when dealer interacts with vehicles
  INSERT INTO dealer_learned_preferences (dealer_id, total_interactions)
  VALUES (NEW.dealer_id, 1)
  ON CONFLICT (dealer_id) DO UPDATE
  SET
    total_interactions = dealer_learned_preferences.total_interactions + 1,
    total_saves = dealer_learned_preferences.total_saves + CASE WHEN NEW.interaction_type = 'SAVE' THEN 1 ELSE 0 END,
    total_skips = dealer_learned_preferences.total_skips + CASE WHEN NEW.interaction_type = 'SKIP' THEN 1 ELSE 0 END,
    last_updated = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update preferences on new interactions
CREATE TRIGGER trigger_update_learned_preferences
  AFTER INSERT ON dealer_interactions
  FOR EACH ROW
  EXECUTE FUNCTION update_learned_preferences();

-- Function to calculate personalization boost for a vehicle
CREATE OR REPLACE FUNCTION calculate_personalization_boost(
  p_dealer_id UUID,
  p_make TEXT,
  p_model TEXT,
  p_price INTEGER,
  p_year INTEGER,
  p_mileage INTEGER
) RETURNS INTEGER AS $$
DECLARE
  v_boost INTEGER := 0;
  v_prefs RECORD;
  v_make_score NUMERIC;
BEGIN
  -- Get learned preferences
  SELECT * INTO v_prefs FROM dealer_learned_preferences WHERE dealer_id = p_dealer_id;

  -- If no preferences yet, return 0
  IF v_prefs IS NULL THEN
    RETURN 0;
  END IF;

  -- Boost for preferred makes
  IF v_prefs.learned_makes IS NOT NULL THEN
    v_make_score := COALESCE((v_prefs.learned_makes->>p_make)::NUMERIC, 0);
    v_boost := v_boost + (v_make_score * 20)::INTEGER; -- Up to +20 points
  END IF;

  -- Boost for preferred models
  IF v_prefs.learned_models IS NOT NULL THEN
    v_boost := v_boost + (COALESCE((v_prefs.learned_models->>p_model)::NUMERIC, 0) * 10)::INTEGER;
  END IF;

  -- Penalty for out-of-range price
  IF v_prefs.learned_price_range IS NOT NULL THEN
    IF p_price < COALESCE((v_prefs.learned_price_range->>'min')::INTEGER, 0) THEN
      v_boost := v_boost - 5;
    ELSIF p_price > COALESCE((v_prefs.learned_price_range->>'max')::INTEGER, 999999) THEN
      v_boost := v_boost - 10;
    END IF;
  END IF;

  -- Cap boost between -20 and +30
  v_boost := GREATEST(-20, LEAST(30, v_boost));

  RETURN v_boost;
END;
$$ LANGUAGE plpgsql;

-- Function to get aggregate match statistics for a dealer
CREATE OR REPLACE FUNCTION get_dealer_match_stats(p_dealer_id UUID)
RETURNS TABLE (
  total_matches BIGINT,
  avg_base_score NUMERIC,
  avg_personalization_boost NUMERIC,
  avg_final_score NUMERIC,
  total_saved BIGINT,
  total_viewed BIGINT,
  total_skipped BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total_matches,
    COALESCE(AVG(base_score), 0)::NUMERIC as avg_base_score,
    COALESCE(AVG(personalization_boost), 0)::NUMERIC as avg_personalization_boost,
    COALESCE(AVG(final_score), 0)::NUMERIC as avg_final_score,
    COUNT(*) FILTER (WHERE saved = true)::BIGINT as total_saved,
    COUNT(*) FILTER (WHERE viewed = true)::BIGINT as total_viewed,
    COUNT(*) FILTER (WHERE skipped = true)::BIGINT as total_skipped
  FROM vehicle_matches
  WHERE dealer_id = p_dealer_id;
END;
$$ LANGUAGE plpgsql;
