
-- First, let's see what profiles currently exist
SELECT id, clerk_id, email, first_name, last_name, role, created_at 
FROM profiles 
ORDER BY created_at DESC;

-- Update or insert your profile with the correct Clerk ID and super_admin role
INSERT INTO profiles (clerk_id, email, first_name, last_name, role) 
VALUES ('user_2zKkwM0wTI2cEsJNCCoEIEqim9P', '2345mjh@gmail.com', 'Admin', 'User', 'super_admin')
ON CONFLICT (clerk_id) 
DO UPDATE SET 
  role = 'super_admin',
  email = '2345mjh@gmail.com',
  updated_at = now();

-- Verify the profile was created/updated correctly
SELECT id, clerk_id, email, first_name, last_name, role, created_at 
FROM profiles 
WHERE clerk_id = 'user_2zKkwM0wTI2cEsJNCCoEIEqim9P';
