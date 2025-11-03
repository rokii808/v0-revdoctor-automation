-- Create admin users table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  role VARCHAR(50) DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create system_stats table for tracking overall metrics
CREATE TABLE IF NOT EXISTS system_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  total_dealers INTEGER DEFAULT 0,
  active_dealers INTEGER DEFAULT 0,
  cars_screened INTEGER DEFAULT 0,
  healthy_cars_found INTEGER DEFAULT 0,
  emails_sent INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_stats ENABLE ROW LEVEL SECURITY;

-- Admin policies
CREATE POLICY "Only admins can view admin_users" ON admin_users
  FOR SELECT USING (
    auth.uid() IN (SELECT user_id FROM admin_users)
  );

CREATE POLICY "Only admins can view system_stats" ON system_stats
  FOR SELECT USING (
    auth.uid() IN (SELECT user_id FROM admin_users)
  );

-- Insert a default admin user (replace with your email)
INSERT INTO admin_users (user_id, email) 
SELECT id, email FROM auth.users WHERE email = 'admin@revdoctor.ai'
ON CONFLICT (email) DO NOTHING;
