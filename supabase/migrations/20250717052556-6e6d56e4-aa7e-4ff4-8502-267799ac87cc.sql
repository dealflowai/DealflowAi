-- Drop and recreate the function with new return type
DROP FUNCTION IF EXISTS public.get_user_tokens(uuid);

-- Update user_tokens table to separate monthly and purchased tokens
ALTER TABLE public.user_tokens 
ADD COLUMN IF NOT EXISTS purchased_tokens INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS monthly_tokens INTEGER DEFAULT 0;

-- Update existing data to separate tokens
UPDATE public.user_tokens 
SET 
  monthly_tokens = COALESCE(monthly_allowance, 25),
  purchased_tokens = GREATEST(total_tokens - COALESCE(monthly_allowance, 25), 0)
WHERE monthly_tokens IS NULL OR purchased_tokens IS NULL;

-- Create the get_user_tokens function with new return type
CREATE OR REPLACE FUNCTION public.get_user_tokens(p_user_id uuid)
 RETURNS TABLE(total_tokens integer, used_tokens integer, remaining_tokens integer, monthly_tokens integer, purchased_tokens integer)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  current_reset_date DATE;
  user_plan_tokens INTEGER;
BEGIN
  -- Get user's plan token allowance (50 for pro, 25 for free)
  SELECT COALESCE(plan_tokens, 25) INTO user_plan_tokens
  FROM profiles 
  WHERE id = p_user_id;
  
  -- Check if we need to reset monthly tokens
  SELECT monthly_reset_date INTO current_reset_date
  FROM user_tokens
  WHERE user_id = p_user_id;
  
  -- If no record exists or it's a new month, reset monthly tokens
  IF current_reset_date IS NULL OR current_reset_date < DATE_TRUNC('month', CURRENT_DATE) THEN
    PERFORM reset_monthly_tokens(p_user_id);
  END IF;
  
  -- Return current token status
  RETURN QUERY
  SELECT 
    COALESCE(ut.monthly_tokens + ut.purchased_tokens, user_plan_tokens) as total_tokens,
    COALESCE(ut.used_tokens, 0) as used_tokens,
    COALESCE((ut.monthly_tokens + ut.purchased_tokens) - ut.used_tokens, user_plan_tokens) as remaining_tokens,
    COALESCE(ut.monthly_tokens, user_plan_tokens) as monthly_tokens,
    COALESCE(ut.purchased_tokens, 0) as purchased_tokens
  FROM public.user_tokens ut
  WHERE ut.user_id = p_user_id
  
  UNION ALL
  
  SELECT user_plan_tokens, 0, user_plan_tokens, user_plan_tokens, 0
  WHERE NOT EXISTS (SELECT 1 FROM public.user_tokens WHERE user_id = p_user_id);
END;
$function$;

-- Update reset_monthly_tokens to only reset monthly tokens, not purchased
CREATE OR REPLACE FUNCTION public.reset_monthly_tokens(p_user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  user_plan_tokens INTEGER;
BEGIN
  -- Get user's plan token allowance (50 for pro, 25 for free)
  SELECT COALESCE(plan_tokens, 25) INTO user_plan_tokens
  FROM profiles 
  WHERE id = p_user_id;
  
  -- Reset monthly tokens only, keep purchased tokens
  INSERT INTO public.user_tokens (user_id, monthly_tokens, purchased_tokens, used_tokens, monthly_allowance, monthly_reset_date)
  VALUES (p_user_id, user_plan_tokens, 0, 0, user_plan_tokens, CURRENT_DATE)
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    monthly_tokens = user_plan_tokens,
    monthly_allowance = user_plan_tokens,
    monthly_reset_date = CURRENT_DATE,
    -- Reset used_tokens for the new month but keep purchased_tokens
    used_tokens = 0,
    total_tokens = user_plan_tokens + user_tokens.purchased_tokens,
    updated_at = now();
    
  RETURN TRUE;
END;
$function$;

-- Update add_tokens to add to purchased tokens (these never expire)
CREATE OR REPLACE FUNCTION public.add_tokens(p_user_id uuid, p_tokens integer)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  user_plan_tokens INTEGER;
BEGIN
  -- Get user's plan token allowance
  SELECT COALESCE(plan_tokens, 25) INTO user_plan_tokens
  FROM profiles 
  WHERE id = p_user_id;
  
  -- Ensure monthly tokens are reset for current month if needed
  PERFORM reset_monthly_tokens(p_user_id);
  
  -- Add to purchased tokens (these never expire)
  INSERT INTO public.user_tokens (user_id, monthly_tokens, purchased_tokens, used_tokens, monthly_allowance, monthly_reset_date)
  VALUES (p_user_id, user_plan_tokens, p_tokens, 0, user_plan_tokens, CURRENT_DATE)
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    purchased_tokens = user_tokens.purchased_tokens + p_tokens,
    total_tokens = user_tokens.monthly_tokens + user_tokens.purchased_tokens + p_tokens,
    updated_at = now();
    
  RETURN TRUE;
END;
$function$;