-- ============================================================================
-- DIAGNOSTIC SCRIPT: Check Current Database State
-- Run this first to see what exists
-- ============================================================================

-- 1. Check which tables exist
SELECT
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('dealers', 'dealers_v2', 'profiles', 'subscriptions', 'saved_searches', 'market_intelligence', 'inventory_turn_predictions')
ORDER BY table_name;

-- 2. Check dealers table structure (if it exists)
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'dealers'
ORDER BY ordinal_position;

-- 3. Check dealers_v2 table structure (if it exists)
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'dealers_v2'
ORDER BY ordinal_position;

-- 4. Check existing RLS policies
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 5. Check for missing columns we need
SELECT
  'dealers' as table_name,
  column_name,
  CASE
    WHEN column_name IN ('payment_failed', 'zip_code', 'state', 'subscription_status', 'subscription_expires_at', 'selected_plan')
    THEN 'REQUIRED FOR NEW FEATURES'
    ELSE 'existing'
  END as status
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'dealers'
ORDER BY
  CASE
    WHEN column_name IN ('payment_failed', 'zip_code', 'state', 'subscription_status', 'subscription_expires_at', 'selected_plan')
    THEN 1
    ELSE 2
  END,
  column_name;
