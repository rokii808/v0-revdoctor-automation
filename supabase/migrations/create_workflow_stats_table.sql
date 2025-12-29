-- Create workflow_stats table to track daily scraper performance
-- This table stores metrics from the enhanced AI-powered workflow

CREATE TABLE IF NOT EXISTS workflow_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_id TEXT NOT NULL, -- Inngest event ID
  run_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  duration_minutes DECIMAL(10, 2),
  dealers_processed INTEGER DEFAULT 0,
  vehicles_scraped INTEGER DEFAULT 0,
  vehicles_classified INTEGER DEFAULT 0,
  healthy_vehicles INTEGER DEFAULT 0,
  total_matches INTEGER DEFAULT 0,
  dealers_with_matches INTEGER DEFAULT 0,
  emails_sent INTEGER DEFAULT 0,
  emails_failed INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for querying by date
CREATE INDEX IF NOT EXISTS idx_workflow_stats_run_date
  ON workflow_stats(run_date DESC);

-- Index for querying by workflow_id
CREATE INDEX IF NOT EXISTS idx_workflow_stats_workflow_id
  ON workflow_stats(workflow_id);

-- Comment
COMMENT ON TABLE workflow_stats IS 'Stores daily workflow execution statistics for monitoring and analytics';
COMMENT ON COLUMN workflow_stats.workflow_id IS 'Inngest event ID for this workflow run';
COMMENT ON COLUMN workflow_stats.duration_minutes IS 'Total workflow execution time in minutes';
COMMENT ON COLUMN workflow_stats.dealers_processed IS 'Number of active dealers processed';
COMMENT ON COLUMN workflow_stats.vehicles_scraped IS 'Total vehicles scraped from all sites';
COMMENT ON COLUMN workflow_stats.vehicles_classified IS 'Vehicles classified by OpenAI';
COMMENT ON COLUMN workflow_stats.healthy_vehicles IS 'Vehicles classified as HEALTHY';
COMMENT ON COLUMN workflow_stats.total_matches IS 'Total vehicle matches across all dealers';
COMMENT ON COLUMN workflow_stats.dealers_with_matches IS 'Number of dealers who received matches';
COMMENT ON COLUMN workflow_stats.emails_sent IS 'Successful email digests sent';
COMMENT ON COLUMN workflow_stats.emails_failed IS 'Failed email digests';
