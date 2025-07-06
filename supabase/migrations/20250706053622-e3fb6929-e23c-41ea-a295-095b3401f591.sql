
-- Update your role to super admin using your Clerk ID
UPDATE profiles 
SET role = 'super_admin' 
WHERE clerk_id = 'user_2zKkwM0wTI2cEsJNCCoEIEqim9P';

-- Verify the update worked
SELECT id, clerk_id, email, first_name, last_name, role, created_at 
FROM profiles 
WHERE clerk_id = 'user_2zKkwM0wTI2cEsJNCCoEIEqim9P';
