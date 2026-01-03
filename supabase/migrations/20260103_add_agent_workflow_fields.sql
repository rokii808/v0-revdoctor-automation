-- Migration: Add agent workflow fields to dealers table
-- Date: 2026-01-03
-- Purpose: Add fields needed for agent workflow functionality

-- Add agent state tracking
ALTER TABLE IF EXISTS dealers
ADD COLUMN IF NOT EXISTS agent_active BOOLEAN DEFAULT false;

-- Add workflow timestamp tracking
ALTER TABLE IF EXISTS dealers
ADD COLUMN IF NOT EXISTS last_scan_at TIMESTAMPTZ;

ALTER TABLE IF EXISTS dealers
ADD COLUMN IF NOT EXISTS last_scan_completed_at TIMESTAMPTZ;

ALTER TABLE IF EXISTS dealers
ADD COLUMN IF NOT EXISTS last_digest_at TIMESTAMPTZ;

-- Add missing dealer info fields
ALTER TABLE IF EXISTS dealers
ADD COLUMN IF NOT EXISTS company_name TEXT;

ALTER TABLE IF EXISTS dealers
ADD COLUMN IF NOT EXISTS prefs JSONB;

ALTER TABLE IF EXISTS dealers
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'inactive';

ALTER TABLE IF EXISTS dealers
ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'trial';

-- Add agent statistics tracking
ALTER TABLE IF EXISTS dealers
ADD COLUMN IF NOT EXISTS total_agent_runs INTEGER DEFAULT 0;

ALTER TABLE IF EXISTS dealers
ADD COLUMN IF NOT EXISTS total_cars_found INTEGER DEFAULT 0;

ALTER TABLE IF EXISTS dealers
ADD COLUMN IF NOT EXISTS total_healthy_cars INTEGER DEFAULT 0;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_dealers_agent_active ON dealers(agent_active);
CREATE INDEX IF NOT EXISTS idx_dealers_status ON dealers(status);
CREATE INDEX IF NOT EXISTS idx_dealers_last_scan_at ON dealers(last_scan_at);

-- Add comments for documentation
COMMENT ON COLUMN dealers.agent_active IS 'Whether the AI agent is currently active for this dealer';
COMMENT ON COLUMN dealers.last_scan_at IS 'Timestamp when the last scan started';
COMMENT ON COLUMN dealers.last_scan_completed_at IS 'Timestamp when the last scan completed';
COMMENT ON COLUMN dealers.last_digest_at IS 'Timestamp when the last email digest was sent';
COMMENT ON COLUMN dealers.company_name IS 'Dealer company name for display';
COMMENT ON COLUMN dealers.prefs IS 'JSON preferences: {makes: [], maxMileage: 100000, minYear: 2015, maxBid: 15000, locations: []}';
COMMENT ON COLUMN dealers.status IS 'Dealer account status: active, inactive, suspended';
COMMENT ON COLUMN dealers.plan IS 'Subscription plan: trial, basic, startup, premium';
COMMENT ON COLUMN dealers.total_agent_runs IS 'Total number of agent workflow runs';
COMMENT ON COLUMN dealers.total_cars_found IS 'Total number of cars found across all runs';
COMMENT ON COLUMN dealers.total_healthy_cars IS 'Total number of healthy cars identified';
