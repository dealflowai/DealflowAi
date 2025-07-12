-- Check current constraint on user_role
SELECT conname, pg_get_constraintdef(c.oid) as definition
FROM pg_constraint c 
JOIN pg_class t ON c.conrelid = t.oid 
WHERE t.relname = 'profiles' AND conname LIKE '%user_role%';