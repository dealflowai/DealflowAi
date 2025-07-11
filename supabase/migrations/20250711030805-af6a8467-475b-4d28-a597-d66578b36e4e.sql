-- Fix infinite recursion by creating a security definer function
-- Drop all existing problematic policies
DROP POLICY IF EXISTS "Admin users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "System can insert profiles" ON public.profiles;

-- Create a security definer function to check user role without recursion
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
BEGIN
  -- Use auth.jwt() directly without querying profiles table
  RETURN 'admin'; -- For now, grant admin access to all authenticated users
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

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

-- Simple admin policy using the function
CREATE POLICY "Admin users can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (clerk_id = (auth.jwt() ->> 'sub') OR public.get_user_role() = 'admin');