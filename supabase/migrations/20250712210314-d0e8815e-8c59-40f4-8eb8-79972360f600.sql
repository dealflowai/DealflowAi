-- Update default plan tokens for core plan from 25 to 100
UPDATE profiles 
SET plan_tokens = 100 
WHERE selected_plan = 'core' AND plan_tokens = 25;

-- Update default plan tokens for any profiles that might have pro plan mapped to core
UPDATE profiles 
SET plan_tokens = 100 
WHERE selected_plan = 'pro' AND plan_tokens = 25;