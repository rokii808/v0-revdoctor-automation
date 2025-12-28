-- Create dealers table for storing dealer information and preferences
CREATE TABLE IF NOT EXISTS dealers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  dealer_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  makes_csv TEXT, -- Comma-separated list of preferred car makes
  max_mileage INTEGER,
  min_year INTEGER,
  max_bid INTEGER,
  locations_csv TEXT, -- Comma-separated list of preferred locations
  subscription_status VARCHAR(50) DEFAULT 'trial',
  subscription_expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create leads table for logging sent cars
CREATE TABLE IF NOT EXISTS leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  dealer_id UUID REFERENCES dealers(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  number_sent INTEGER NOT NULL,
  first_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies
ALTER TABLE dealers ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Dealers can only see their own data
CREATE POLICY "Users can view own dealer data" ON dealers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own dealer data" ON dealers
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own dealer data" ON dealers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Leads policies
CREATE POLICY "Users can view own leads" ON leads
  FOR SELECT USING (
    dealer_id IN (SELECT id FROM dealers WHERE user_id = auth.uid())
  );

CREATE POLICY "System can insert leads" ON leads
  FOR INSERT WITH CHECK (true);
