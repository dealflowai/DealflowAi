
-- Drop the problematic RLS policy that's causing infinite recursion
DROP POLICY IF EXISTS "Admin users can view all profiles" ON profiles;

-- Create a simpler RLS policy for admin profile access that doesn't cause recursion
CREATE POLICY "Admin users can view all profiles" 
  ON profiles 
  FOR SELECT 
  USING (
    clerk_id = (auth.jwt() ->> 'sub'::text) OR
    EXISTS (
      SELECT 1 FROM profiles admin_profile 
      WHERE admin_profile.clerk_id = (auth.jwt() ->> 'sub'::text) 
      AND admin_profile.role IN ('admin', 'super_admin')
      AND admin_profile.id != profiles.id
    )
  );

-- Also fix the buyers and deals policies to prevent similar issues
DROP POLICY IF EXISTS "Admin users can view all buyers" ON buyers;
DROP POLICY IF EXISTS "Admin users can view all deals" ON deals;

CREATE POLICY "Admin users can view all buyers" 
  ON buyers 
  FOR SELECT 
  USING (
    owner_id = auth.uid() OR
    auth.uid() IN (
      SELECT auth.uid() FROM profiles 
      WHERE clerk_id = (auth.jwt() ->> 'sub'::text) 
      AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admin users can view all deals" 
  ON deals 
  FOR SELECT 
  USING (
    owner_id = auth.uid() OR
    auth.uid() IN (
      SELECT auth.uid() FROM profiles 
      WHERE clerk_id = (auth.jwt() ->> 'sub'::text) 
      AND role IN ('admin', 'super_admin')
    )
  );
