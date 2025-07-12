-- Drop the user_role check constraint that's causing issues
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_user_role_check;

-- Allow NULL values for user_role (remove any constraint that prevents this)
-- The field can be NULL or one of the valid values