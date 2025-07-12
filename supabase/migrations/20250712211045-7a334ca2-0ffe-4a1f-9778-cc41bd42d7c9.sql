-- Fix RLS policies for profiles table to allow system operations
CREATE POLICY "System can update profiles for token grants" ON public.profiles
FOR UPDATE
USING (true);

-- Test grant function by simulating a user due for tokens
SELECT * FROM public.grant_monthly_tokens();