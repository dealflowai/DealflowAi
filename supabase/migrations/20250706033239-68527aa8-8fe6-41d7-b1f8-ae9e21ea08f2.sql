
-- Create admin dashboard views and functions
CREATE OR REPLACE VIEW admin_user_stats AS
SELECT 
  COUNT(*) as total_users,
  COUNT(CASE WHEN profiles.created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as active_users_7d,
  COUNT(CASE WHEN profiles.created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as new_users_30d
FROM profiles;

-- Create admin deals stats view
CREATE OR REPLACE VIEW admin_deals_stats AS
SELECT 
  COUNT(*) as total_deals,
  COUNT(CASE WHEN deals.created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as deals_7d,
  COUNT(CASE WHEN deals.created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as deals_30d,
  AVG(deals.margin) as avg_margin
FROM deals;

-- Create admin token usage view (placeholder for now)
CREATE OR REPLACE VIEW admin_token_stats AS
SELECT 
  COALESCE(SUM(daily_tokens), 0) as total_tokens_used,
  COUNT(DISTINCT org_id) as active_orgs
FROM organization_limits;

-- Add admin role to profiles table if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'role'
  ) THEN
    ALTER TABLE profiles ADD COLUMN role TEXT DEFAULT 'user';
  END IF;
END $$;

-- Update existing profiles to have admin role for current user
UPDATE profiles SET role = 'admin' WHERE role IS NULL OR role = 'user';

-- Create RLS policy for admin dashboard access
CREATE POLICY "Admin users can view all profiles" 
  ON profiles 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.clerk_id = (auth.jwt() ->> 'sub'::text) 
      AND p.role IN ('admin', 'super_admin')
    )
  );

-- Create RLS policy for admin to view all buyers
CREATE POLICY "Admin users can view all buyers" 
  ON buyers 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.clerk_id = (auth.jwt() ->> 'sub'::text) 
      AND p.role IN ('admin', 'super_admin')
    )
  );

-- Create RLS policy for admin to view all deals
CREATE POLICY "Admin users can view all deals" 
  ON deals 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.clerk_id = (auth.jwt() ->> 'sub'::text) 
      AND p.role IN ('admin', 'super_admin')
    )
  );
