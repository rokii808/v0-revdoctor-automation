# 🚨 IMPORTANT: Apply Database Migration

The "See It In Action" demo requires a database table that doesn't exist yet.

## Quick Fix (2 minutes)

1. **Go to Supabase SQL Editor:**
   https://supabase.com/dashboard/project/fycvbkmgssdutumjpodz/sql/new

2. **Copy and paste this SQL:**

\`\`\`sql
-- Track "See It In Action" email submissions for lead capture and rate limiting
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

COMMENT ON TABLE see_it_in_action_submissions IS 'Tracks "See It In Action" demo email submissions for rate limiting and lead capture';
COMMENT ON COLUMN see_it_in_action_submissions.submission_count IS 'Number of times this email has requested the demo (limit: 2)';
\`\`\`

3. **Click "Run" (or press Cmd/Ctrl + Enter)**

4. **Verify it worked:**
   \`\`\`sql
   SELECT * FROM see_it_in_action_submissions;
   \`\`\`

   Should return: "Success. No rows returned" (empty table)

## What This Table Does

- **Tracks** every demo email submission
- **Enforces** max 2 submissions per email address
- **Collects** email addresses for lead generation
- **Records** IP address and user agent for analytics
- **Logs** email sending status (pending/sent/failed)

## After Applying

Your "See It In Action" demo will work with:
- ✅ Email tracking
- ✅ Rate limiting (max 2 per email)
- ✅ Lead capture
- ✅ 5-second countdown auto-refresh
- ✅ Status tracking (sent/failed)
