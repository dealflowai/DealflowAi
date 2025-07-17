-- Drop and recreate get_user_tokens function with correct return type
DROP FUNCTION IF EXISTS public.get_user_tokens(uuid);

-- Update reset_monthly_tokens to add tokens instead of resetting
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
  
  -- Add monthly tokens instead of resetting
  INSERT INTO public.user_tokens (user_id, total_tokens, used_tokens, monthly_allowance, monthly_reset_date)
  VALUES (p_user_id, user_plan_tokens, 0, user_plan_tokens, CURRENT_DATE)
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    total_tokens = user_tokens.total_tokens + user_plan_tokens,
    monthly_allowance = user_plan_tokens,
    monthly_reset_date = CURRENT_DATE,
    updated_at = now();
    
  RETURN TRUE;
END;
$function$;

-- Recreate get_user_tokens to handle additive monthly tokens
CREATE OR REPLACE FUNCTION public.get_user_tokens(p_user_id uuid)
 RETURNS TABLE(total_tokens integer, used_tokens integer, remaining_tokens integer)
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
  
  -- Check if we need to add monthly tokens
  SELECT monthly_reset_date INTO current_reset_date
  FROM user_tokens
  WHERE user_id = p_user_id;
  
  -- If no record exists or it's a new month, add monthly tokens
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
$function$;