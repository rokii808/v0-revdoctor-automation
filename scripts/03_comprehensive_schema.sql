-- Creating comprehensive database schema matching the RevDoctor specification

-- Profiles table for user basic info
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Updated dealers table with jsonb preferences and plan info
CREATE TABLE IF NOT EXISTS dealers_v2 (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT,
  prefs JSONB, -- Store preferences as JSON: {makes: [], max_mileage: 100000, min_year: 2015, max_bid: 15000, locations: []}
  plan TEXT DEFAULT 'trial', -- 'trial', 'basic', 'pro'
  status TEXT DEFAULT 'active' -- 'active', 'inactive', 'cancelled'
);

-- Subscriptions table for Stripe integration
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_sub_id TEXT,
  plan TEXT, -- 'basic', 'pro'
  status TEXT, -- 'active', 'cancelled', 'past_due'
  current_period_end TIMESTAMPTZ
);

-- Insights table for storing AI-analyzed cars
CREATE TABLE IF NOT EXISTS insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  make TEXT,
  year INTEGER,
  price INTEGER,
  url TEXT,
  verdict TEXT, -- 'HEALTHY', 'UNHEALTHY'
  minor_type TEXT, -- 'Battery', 'Tyre', 'Service', etc.
  risk INTEGER, -- 0-100 risk score
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Digests table for tracking email sends
CREATE TABLE IF NOT EXISTS digests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  run_id UUID,
  count INTEGER,
  sent_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE dealers_v2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE digests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for dealers_v2
CREATE POLICY "Users can view own dealer data" ON dealers_v2
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own dealer data" ON dealers_v2
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own dealer data" ON dealers_v2
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for subscriptions
CREATE POLICY "Users can view own subscriptions" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own subscriptions" ON subscriptions
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "System can manage subscriptions" ON subscriptions
  FOR ALL USING (true);

-- RLS Policies for insights
CREATE POLICY "Users can view own insights" ON insights
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can insert insights" ON insights
  FOR INSERT WITH CHECK (true);

-- RLS Policies for digests
CREATE POLICY "Users can view own digests" ON digests
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can insert digests" ON digests
  FOR INSERT WITH CHECK (true);
