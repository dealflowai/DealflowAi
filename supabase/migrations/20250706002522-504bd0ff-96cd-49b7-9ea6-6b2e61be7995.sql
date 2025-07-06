
-- Add the has_completed_onboarding column to the profiles table
ALTER TABLE public.profiles 
ADD COLUMN has_completed_onboarding boolean DEFAULT false;
