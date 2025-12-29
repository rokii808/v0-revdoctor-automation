-- Migration 05: Add subscription enforcement fields
-- Date: 2025-12-29
-- Purpose: Add payment_failed and other subscription fields to dealers table

-- Add payment_failed column to dealers table (if using dealers, not dealers_v2)
ALTER TABLE IF EXISTS dealers
ADD COLUMN IF NOT EXISTS payment_failed BOOLEAN DEFAULT false;

-- Add payment_failed column to dealers_v2 table
ALTER TABLE IF EXISTS dealers_v2
ADD COLUMN IF NOT EXISTS payment_failed BOOLEAN DEFAULT false;

-- Add subscription fields to dealers if they don't exist
ALTER TABLE IF EXISTS dealers
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'trial';

ALTER TABLE IF EXISTS dealers
ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '14 days');

ALTER TABLE IF EXISTS dealers
ADD COLUMN IF NOT EXISTS selected_plan TEXT DEFAULT 'trial';

-- Add subscription fields to dealers_v2 if they don't exist
ALTER TABLE IF EXISTS dealers_v2
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'trial';

ALTER TABLE IF EXISTS dealers_v2
ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '14 days');

ALTER TABLE IF EXISTS dealers_v2
ADD COLUMN IF NOT EXISTS selected_plan TEXT DEFAULT 'trial';

-- Create saved_searches table if it doesn't exist
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

-- Create index on dealer_id for faster queries
CREATE INDEX IF NOT EXISTS idx_saved_searches_dealer_id ON saved_searches(dealer_id);

-- Create index on is_active for filtering
CREATE INDEX IF NOT EXISTS idx_saved_searches_is_active ON saved_searches(is_active);

-- Enable Row Level Security on saved_searches
ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;

-- Create RLS policy: Users can only see their own saved searches
DROP POLICY IF EXISTS saved_searches_select_policy ON saved_searches;
CREATE POLICY saved_searches_select_policy ON saved_searches
  FOR SELECT
  USING (dealer_id IN (
    SELECT id FROM dealers WHERE user_id = auth.uid()
    UNION
    SELECT id FROM dealers_v2 WHERE id = auth.uid()
  ));

-- Create RLS policy: Users can only insert their own saved searches
DROP POLICY IF EXISTS saved_searches_insert_policy ON saved_searches;
CREATE POLICY saved_searches_insert_policy ON saved_searches
  FOR INSERT
  WITH CHECK (dealer_id IN (
    SELECT id FROM dealers WHERE user_id = auth.uid()
    UNION
    SELECT id FROM dealers_v2 WHERE id = auth.uid()
  ));

-- Create RLS policy: Users can only update their own saved searches
DROP POLICY IF EXISTS saved_searches_update_policy ON saved_searches;
CREATE POLICY saved_searches_update_policy ON saved_searches
  FOR UPDATE
  USING (dealer_id IN (
    SELECT id FROM dealers WHERE user_id = auth.uid()
    UNION
    SELECT id FROM dealers_v2 WHERE id = auth.uid()
  ));

-- Create RLS policy: Users can only delete their own saved searches
DROP POLICY IF EXISTS saved_searches_delete_policy ON saved_searches;
CREATE POLICY saved_searches_delete_policy ON saved_searches
  FOR DELETE
  USING (dealer_id IN (
    SELECT id FROM dealers WHERE user_id = auth.uid()
    UNION
    SELECT id FROM dealers_v2 WHERE id = auth.uid()
  ));

-- Add comments for documentation
COMMENT ON COLUMN dealers.payment_failed IS 'True when payment method fails, blocks all feature access';
COMMENT ON COLUMN dealers.subscription_status IS 'active, trial, expired, canceled, payment_failed';
COMMENT ON COLUMN dealers.subscription_expires_at IS 'When the current subscription period ends';
COMMENT ON COLUMN dealers.selected_plan IS 'trial, basic, startup, premium';

COMMENT ON TABLE saved_searches IS 'User-created search criteria for automated vehicle matching';
COMMENT ON COLUMN saved_searches.dealer_id IS 'FK to dealers table';
COMMENT ON COLUMN saved_searches.is_active IS 'Whether this search is currently active for alerts';
