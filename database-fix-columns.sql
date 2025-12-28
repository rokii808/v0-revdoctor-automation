-- RevvDoctor Database - Fix Missing Columns
-- Run this FIRST if you get "column does not exist" errors

-- ============================================
-- Add missing columns to vehicle_matches
-- ============================================
DO $$
BEGIN
    -- Add dealer_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'vehicle_matches'
        AND column_name = 'dealer_id'
    ) THEN
        ALTER TABLE vehicle_matches
        ADD COLUMN dealer_id UUID REFERENCES dealers(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added dealer_id column to vehicle_matches';
    END IF;

    -- Add auction_site column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'vehicle_matches'
        AND column_name = 'auction_site'
    ) THEN
        ALTER TABLE vehicle_matches
        ADD COLUMN auction_site TEXT NOT NULL DEFAULT 'RAW2K';
        RAISE NOTICE 'Added auction_site column to vehicle_matches';
    END IF;

    -- Add match_score column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'vehicle_matches'
        AND column_name = 'match_score'
    ) THEN
        ALTER TABLE vehicle_matches
        ADD COLUMN match_score INTEGER DEFAULT 0 CHECK (match_score >= 0 AND match_score <= 100);
        RAISE NOTICE 'Added match_score column to vehicle_matches';
    END IF;

    -- Add verdict column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'vehicle_matches'
        AND column_name = 'verdict'
    ) THEN
        ALTER TABLE vehicle_matches
        ADD COLUMN verdict TEXT;
        RAISE NOTICE 'Added verdict column to vehicle_matches';
    END IF;

    -- Add reason column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'vehicle_matches'
        AND column_name = 'reason'
    ) THEN
        ALTER TABLE vehicle_matches
        ADD COLUMN reason TEXT;
        RAISE NOTICE 'Added reason column to vehicle_matches';
    END IF;

    -- Add risk_level column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'vehicle_matches'
        AND column_name = 'risk_level'
    ) THEN
        ALTER TABLE vehicle_matches
        ADD COLUMN risk_level INTEGER;
        RAISE NOTICE 'Added risk_level column to vehicle_matches';
    END IF;

    -- Add profit_estimate column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'vehicle_matches'
        AND column_name = 'profit_estimate'
    ) THEN
        ALTER TABLE vehicle_matches
        ADD COLUMN profit_estimate INTEGER;
        RAISE NOTICE 'Added profit_estimate column to vehicle_matches';
    END IF;

    -- Add is_sent column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'vehicle_matches'
        AND column_name = 'is_sent'
    ) THEN
        ALTER TABLE vehicle_matches
        ADD COLUMN is_sent BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'Added is_sent column to vehicle_matches';
    END IF;

    -- Add sent_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'vehicle_matches'
        AND column_name = 'sent_at'
    ) THEN
        ALTER TABLE vehicle_matches
        ADD COLUMN sent_at TIMESTAMPTZ;
        RAISE NOTICE 'Added sent_at column to vehicle_matches';
    END IF;

    -- Add fuel_type column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'vehicle_matches'
        AND column_name = 'fuel_type'
    ) THEN
        ALTER TABLE vehicle_matches
        ADD COLUMN fuel_type TEXT;
        RAISE NOTICE 'Added fuel_type column to vehicle_matches';
    END IF;

    -- Add transmission column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'vehicle_matches'
        AND column_name = 'transmission'
    ) THEN
        ALTER TABLE vehicle_matches
        ADD COLUMN transmission TEXT;
        RAISE NOTICE 'Added transmission column to vehicle_matches';
    END IF;

    -- Add image_url column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'vehicle_matches'
        AND column_name = 'image_url'
    ) THEN
        ALTER TABLE vehicle_matches
        ADD COLUMN image_url TEXT;
        RAISE NOTICE 'Added image_url column to vehicle_matches';
    END IF;

    -- Add description column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'vehicle_matches'
        AND column_name = 'description'
    ) THEN
        ALTER TABLE vehicle_matches
        ADD COLUMN description TEXT;
        RAISE NOTICE 'Added description column to vehicle_matches';
    END IF;
END $$;

-- ============================================
-- Show all columns in vehicle_matches table
-- ============================================
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'vehicle_matches'
ORDER BY ordinal_position;

-- ============================================
-- Column Fix Complete! ✅
-- ============================================
-- After running this, run database-migrations-safe.sql
