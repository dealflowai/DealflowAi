-- Add plan_tokens column to profiles to store monthly token allowance
ALTER TABLE profiles 
ADD COLUMN plan_tokens INTEGER DEFAULT 25;

-- Add monthly_reset_date to user_tokens to track when tokens were last reset
ALTER TABLE user_tokens 
ADD COLUMN monthly_reset_date DATE DEFAULT CURRENT_DATE,
ADD COLUMN monthly_allowance INTEGER DEFAULT 25;

-- Update existing user_tokens records to have proper monthly allowance
UPDATE user_tokens 
SET monthly_allowance = 25, monthly_reset_date = CURRENT_DATE 
WHERE monthly_allowance IS NULL;

-- Create function to reset monthly tokens based on user's plan
CREATE OR REPLACE FUNCTION public.reset_monthly_tokens(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_plan_tokens INTEGER;
BEGIN
  -- Get user's plan token allowance
  SELECT COALESCE(plan_tokens, 25) INTO user_plan_tokens
  FROM profiles 
  WHERE id = p_user_id;
  
  -- Reset tokens for the month
  INSERT INTO public.user_tokens (user_id, total_tokens, used_tokens, monthly_allowance, monthly_reset_date)
  VALUES (p_user_id, user_plan_tokens, 0, user_plan_tokens, CURRENT_DATE)
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    total_tokens = user_plan_tokens,
    used_tokens = 0,
    monthly_allowance = user_plan_tokens,
    monthly_reset_date = CURRENT_DATE,
    updated_at = now();
    
  RETURN TRUE;
END;
$$;

-- Update get_user_tokens function to handle monthly resets automatically
CREATE OR REPLACE FUNCTION public.get_user_tokens(p_user_id uuid)
RETURNS TABLE(total_tokens integer, used_tokens integer, remaining_tokens integer)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_reset_date DATE;
  user_plan_tokens INTEGER;
BEGIN
  -- Get user's plan token allowance
  SELECT COALESCE(plan_tokens, 25) INTO user_plan_tokens
  FROM profiles 
  WHERE id = p_user_id;
  
  -- Check if we need to reset tokens for this month
  SELECT monthly_reset_date INTO current_reset_date
  FROM user_tokens
  WHERE user_id = p_user_id;
  
  -- If no record exists or it's a new month, reset tokens
  IF current_reset_date IS NULL OR current_reset_date < DATE_TRUNC('month', CURRENT_DATE) THEN
    PERFORM reset_monthly_tokens(p_user_id);
  END IF;
  
  -- Return current token status
  RETURN QUERY
  SELECT 
    COALESCE(ut.total_tokens, user_plan_tokens) as total_tokens,
    COALESCE(ut.used_tokens, 0) as used_tokens,
    COALESCE(ut.total_tokens - ut.used_tokens, user_plan_tokens) as remaining_tokens
  FROM public.user_tokens ut
  WHERE ut.user_id = p_user_id
  
  UNION ALL
  
  SELECT user_plan_tokens, 0, user_plan_tokens
  WHERE NOT EXISTS (SELECT 1 FROM public.user_tokens WHERE user_id = p_user_id);
END;
$$;

-- Update deduct_tokens function to work with monthly reset system
CREATE OR REPLACE FUNCTION public.deduct_tokens(p_user_id uuid, p_tokens integer)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_remaining INTEGER;
  user_plan_tokens INTEGER;
BEGIN
  -- Get user's plan token allowance
  SELECT COALESCE(plan_tokens, 25) INTO user_plan_tokens
  FROM profiles 
  WHERE id = p_user_id;
  
  -- Ensure tokens are reset for current month if needed
  PERFORM reset_monthly_tokens(p_user_id);
  
  -- Get current remaining tokens
  SELECT (total_tokens - used_tokens) INTO current_remaining
  FROM public.user_tokens
  WHERE user_id = p_user_id;
  
  -- If no record exists, create one
  IF current_remaining IS NULL THEN
    INSERT INTO public.user_tokens (user_id, total_tokens, used_tokens, monthly_allowance, monthly_reset_date)
    VALUES (p_user_id, user_plan_tokens, 0, user_plan_tokens, CURRENT_DATE);
    current_remaining := user_plan_tokens;
  END IF;
  
  -- Check if user has enough tokens
  IF current_remaining >= p_tokens THEN
    -- Deduct tokens
    UPDATE public.user_tokens
    SET used_tokens = used_tokens + p_tokens,
        updated_at = now()
    WHERE user_id = p_user_id;
    
    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
END;
$$;