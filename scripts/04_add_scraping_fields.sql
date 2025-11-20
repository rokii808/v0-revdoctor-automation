-- Add fields needed for proper scraping and URL management
ALTER TABLE insights 
ADD COLUMN IF NOT EXISTS listing_id TEXT,
ADD COLUMN IF NOT EXISTS auction_site TEXT DEFAULT 'raw2k',
ADD COLUMN IF NOT EXISTS lot_number TEXT,
ADD COLUMN IF NOT EXISTS auction_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS auction_location TEXT,
ADD COLUMN IF NOT EXISTS mileage INTEGER,
ADD COLUMN IF NOT EXISTS condition_html TEXT,
ADD COLUMN IF NOT EXISTS images_json JSONB,
ADD COLUMN IF NOT EXISTS source_url TEXT,
ADD COLUMN IF NOT EXISTS scraped_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS url_verified_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Add index for faster lookups by listing_id
CREATE INDEX IF NOT EXISTS idx_insights_listing_id ON insights(listing_id);
CREATE INDEX IF NOT EXISTS idx_insights_auction_site ON insights(auction_site);
CREATE INDEX IF NOT EXISTS idx_insights_user_verdict ON insights(user_id, verdict);
CREATE INDEX IF NOT EXISTS idx_insights_is_active ON insights(is_active);

-- Add comment explaining the new fields
COMMENT ON COLUMN insights.listing_id IS 'Actual auction listing ID from the source site';
COMMENT ON COLUMN insights.lot_number IS 'Auction lot number for easy reference';
COMMENT ON COLUMN insights.source_url IS 'Original URL from auction site (may 404 if listing expires)';
COMMENT ON COLUMN insights.url IS 'Internal RevvDoctor detail page URL';
