
-- First, let's see your current profile (replace 'your-clerk-id' with your actual Clerk user ID)
-- You can find your Clerk ID in the Clerk dashboard or by checking your JWT token

-- To make yourself a super admin, update your role:
UPDATE profiles 
SET role = 'super_admin' 
WHERE clerk_id = 'your-clerk-id-here';

-- If you don't know your clerk_id, you can also update by email:
UPDATE profiles 
SET role = 'super_admin' 
WHERE email = 'your-email@example.com';

-- To see all current profiles and their roles:
SELECT id, clerk_id, email, first_name, last_name, role, created_at 
FROM profiles 
ORDER BY created_at DESC;
