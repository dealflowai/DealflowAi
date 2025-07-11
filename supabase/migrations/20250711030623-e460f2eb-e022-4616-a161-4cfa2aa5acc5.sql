-- Re-apply the RLS policy fix for admin access
-- Drop and recreate the admin profile policies to fix access issues

DROP POLICY IF EXISTS "Admin users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "System can insert profiles" ON public.profiles;

-- Create simple, non-recursive policies
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (clerk_id = (auth.jwt() ->> 'sub'));

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (clerk_id = (auth.jwt() ->> 'sub'));

CREATE POLICY "System can insert profiles" 
ON public.profiles 
FOR INSERT 
WITH CHECK (true);

-- Admin policy that doesn't cause recursion
CREATE POLICY "Admin users can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (
  clerk_id = (auth.jwt() ->> 'sub') OR 
  (auth.jwt() ->> 'sub') IN (
    SELECT clerk_id FROM public.profiles 
    WHERE role IN ('admin', 'super_admin') 
    AND clerk_id = (auth.jwt() ->> 'sub')
    LIMIT 1
  )
);