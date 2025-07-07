
-- First, let's see what profiles exist and check your specific one
SELECT id, clerk_id, email, first_name, last_name, role, created_at 
FROM profiles 
ORDER BY created_at DESC;

-- Check if there are any profiles with your potential Clerk ID patterns
SELECT id, clerk_id, email, first_name, last_name, role, created_at 
FROM profiles 
WHERE clerk_id LIKE 'user_%' OR email IS NOT NULL;

-- Let's also ensure your specific profile exists and has the right role
-- Replace this with your actual Clerk ID if you know it
INSERT INTO profiles (clerk_id, email, first_name, last_name, role) 
VALUES ('user_2zKkwM0wTI2cEsJNCCoEIEqim9P', 'your-email@example.com', 'Admin', 'User', 'super_admin')
ON CONFLICT (clerk_id) 
DO UPDATE SET role = 'super_admin';

-- Also create a simple function to help debug auth issues
CREATE OR REPLACE FUNCTION debug_current_user()
RETURNS TABLE(
  jwt_sub text,
  auth_uid uuid,
  profile_exists boolean,
  profile_role text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    auth.jwt() ->> 'sub' as jwt_sub,
    auth.uid() as auth_uid,
    EXISTS(SELECT 1 FROM profiles WHERE clerk_id = auth.jwt() ->> 'sub') as profile_exists,
    COALESCE((SELECT role FROM profiles WHERE clerk_id = auth.jwt() ->> 'sub'), 'none') as profile_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
