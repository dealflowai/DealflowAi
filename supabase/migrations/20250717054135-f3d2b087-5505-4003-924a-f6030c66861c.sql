-- Fix inconsistent token data where monthly_tokens and purchased_tokens are not set properly
UPDATE public.user_tokens 
SET 
  monthly_tokens = CASE 
    WHEN monthly_tokens = 0 AND total_tokens > 0 THEN COALESCE(monthly_allowance, 25)
    ELSE monthly_tokens
  END,
  purchased_tokens = CASE 
    WHEN purchased_tokens = 0 AND total_tokens > COALESCE(monthly_allowance, 25) 
    THEN total_tokens - COALESCE(monthly_allowance, 25)
    ELSE purchased_tokens
  END
WHERE monthly_tokens = 0 OR purchased_tokens = 0;

-- Update total_tokens to be the sum of monthly_tokens + purchased_tokens
UPDATE public.user_tokens 
SET total_tokens = monthly_tokens + purchased_tokens
WHERE total_tokens != (monthly_tokens + purchased_tokens);

-- Update the reset_monthly_tokens function to ensure total_tokens is always correctly calculated
CREATE OR REPLACE FUNCTION public.reset_monthly_tokens(p_user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  user_plan_tokens INTEGER;
  current_purchased INTEGER;
BEGIN
  -- Get user's plan token allowance (50 for pro, 25 for free)
  SELECT COALESCE(plan_tokens, 25) INTO user_plan_tokens
  FROM profiles 
  WHERE id = p_user_id;
  
  -- Get current purchased tokens to preserve them
  SELECT COALESCE(purchased_tokens, 0) INTO current_purchased
  FROM user_tokens
  WHERE user_id = p_user_id;
  
  -- Reset monthly tokens only, keep purchased tokens
  INSERT INTO public.user_tokens (user_id, monthly_tokens, purchased_tokens, used_tokens, monthly_allowance, monthly_reset_date, total_tokens)
  VALUES (p_user_id, user_plan_tokens, current_purchased, 0, user_plan_tokens, CURRENT_DATE, user_plan_tokens + current_purchased)
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