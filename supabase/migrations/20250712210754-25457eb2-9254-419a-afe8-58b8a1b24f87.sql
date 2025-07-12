-- Add subscription tracking fields to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS subscription_start_date DATE,
ADD COLUMN IF NOT EXISTS last_token_grant_date DATE,
ADD COLUMN IF NOT EXISTS next_token_grant_date DATE;

-- Update existing core plan users to set their subscription start date to today if not set
UPDATE profiles 
SET subscription_start_date = CURRENT_DATE,
    last_token_grant_date = CURRENT_DATE,
    next_token_grant_date = CURRENT_DATE + INTERVAL '1 month'
WHERE selected_plan = 'core' 
AND subscription_start_date IS NULL;

-- Create function to grant monthly tokens to eligible users
CREATE OR REPLACE FUNCTION public.grant_monthly_tokens()
RETURNS TABLE(user_id uuid, tokens_granted integer, next_grant_date date)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_record RECORD;
  tokens_to_grant INTEGER;
BEGIN
  -- Loop through users who are due for monthly tokens
  FOR user_record IN 
    SELECT p.id, p.clerk_id, p.selected_plan, p.plan_tokens, 
           p.subscription_start_date, p.last_token_grant_date, p.next_token_grant_date
    FROM profiles p
    WHERE p.selected_plan IN ('core', 'pro')
    AND p.next_token_grant_date <= CURRENT_DATE
    AND p.subscription_start_date IS NOT NULL
  LOOP
    -- Determine tokens to grant based on plan
    tokens_to_grant := COALESCE(user_record.plan_tokens, 100);
    
    -- Add tokens to user's account
    INSERT INTO public.user_tokens (user_id, total_tokens, used_tokens, monthly_allowance, monthly_reset_date)
    VALUES (user_record.id, tokens_to_grant, 0, tokens_to_grant, CURRENT_DATE)
    ON CONFLICT (user_id) 
    DO UPDATE SET 
      total_tokens = user_tokens.total_tokens + tokens_to_grant,
      monthly_allowance = tokens_to_grant,
      monthly_reset_date = CURRENT_DATE,
      updated_at = now();
    
    -- Update the user's token grant tracking
    UPDATE profiles 
    SET last_token_grant_date = CURRENT_DATE,
        next_token_grant_date = CURRENT_DATE + INTERVAL '1 month',
        updated_at = now()
    WHERE id = user_record.id;
    
    -- Return the result
    RETURN QUERY SELECT user_record.id, tokens_to_grant, (CURRENT_DATE + INTERVAL '1 month')::date;
  END LOOP;
END;
$$;

-- Create function to manually grant tokens to a specific user (for admin use)
CREATE OR REPLACE FUNCTION public.grant_tokens_to_user(p_user_id uuid, p_tokens integer DEFAULT NULL)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_plan_tokens INTEGER;
  tokens_to_grant INTEGER;
BEGIN
  -- Get user's plan token allowance
  SELECT COALESCE(plan_tokens, 100) INTO user_plan_tokens
  FROM profiles 
  WHERE id = p_user_id;
  
  -- Use provided tokens or default to plan allowance
  tokens_to_grant := COALESCE(p_tokens, user_plan_tokens);
  
  -- Add tokens to user's account
  INSERT INTO public.user_tokens (user_id, total_tokens, used_tokens, monthly_allowance, monthly_reset_date)
  VALUES (p_user_id, tokens_to_grant, 0, tokens_to_grant, CURRENT_DATE)
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    total_tokens = user_tokens.total_tokens + tokens_to_grant,
    updated_at = now();
  
  -- Update the user's token grant tracking
  UPDATE profiles 
  SET last_token_grant_date = CURRENT_DATE,
      next_token_grant_date = CURRENT_DATE + INTERVAL '1 month',
      updated_at = now()
  WHERE id = p_user_id;
  
  RETURN TRUE;
END;
$$;