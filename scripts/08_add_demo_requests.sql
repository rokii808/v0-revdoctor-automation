-- Add demo_requests table for lead capture
-- Part of scripts/07_fix_and_reconcile.sql or run separately

CREATE TABLE IF NOT EXISTS demo_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Contact info
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,

  -- Business info
  company_name TEXT,
  business_type TEXT, -- 'franchise', 'independent', 'multi-store', 'wholesaler', 'broker'
  monthly_volume TEXT, -- '1-25', '26-50', '51-100', '100+'

  -- Tracking
  source TEXT DEFAULT 'see_it_in_action', -- Where they came from
  status TEXT DEFAULT 'new', -- 'new', 'contacted', 'demo_scheduled', 'closed'

  -- Metadata
  ip_address TEXT,
  user_agent TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for querying
CREATE INDEX IF NOT EXISTS idx_demo_requests_email ON demo_requests(email);
CREATE INDEX IF NOT EXISTS idx_demo_requests_status ON demo_requests(status);
CREATE INDEX IF NOT EXISTS idx_demo_requests_created ON demo_requests(created_at DESC);

-- No RLS needed - this is a lead capture form (public)
-- Admins can view all demo requests

COMMENT ON TABLE demo_requests IS 'Lead capture from "See It In Action" and other demo forms';
COMMENT ON COLUMN demo_requests.status IS 'Lead status: new → contacted → demo_scheduled → closed';
