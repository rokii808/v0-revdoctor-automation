-- Track "See It In Action" email submissions for lead capture and rate limiting
-- This is separate from demo_requests which is for full demo form submissions

CREATE TABLE IF NOT EXISTS see_it_in_action_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  submission_count INTEGER DEFAULT 1,
  first_submitted_at TIMESTAMPTZ DEFAULT NOW(),
  last_submitted_at TIMESTAMPTZ DEFAULT NOW(),

  -- Email sending status
  last_email_status TEXT, -- 'pending', 'sent', 'failed'
  last_email_sent_at TIMESTAMPTZ,
  last_email_error TEXT,

  -- Tracking
  ip_address TEXT,
  user_agent TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for quick email lookup (for rate limiting)
CREATE UNIQUE INDEX IF NOT EXISTS idx_see_it_in_action_email ON see_it_in_action_submissions(email);
CREATE INDEX IF NOT EXISTS idx_see_it_in_action_submitted ON see_it_in_action_submissions(last_submitted_at DESC);

-- No RLS needed - this is for tracking only, no user access

COMMENT ON TABLE see_it_in_action_submissions IS 'Tracks "See It In Action" demo email submissions for rate limiting and lead capture';
COMMENT ON COLUMN see_it_in_action_submissions.submission_count IS 'Number of times this email has requested the demo (limit: 2)';
