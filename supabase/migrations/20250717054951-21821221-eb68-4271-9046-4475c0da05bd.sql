-- Fix the deduct_tokens function logic to properly calculate token usage
CREATE OR REPLACE FUNCTION public.deduct_tokens(p_user_id uuid, p_tokens integer)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  current_monthly INTEGER;
  current_purchased INTEGER;
  current_used INTEGER;
  user_plan_tokens INTEGER;
  available_monthly INTEGER;
  available_purchased INTEGER;
  total_available INTEGER;
BEGIN
  -- Get user's plan token allowance
  SELECT COALESCE(plan_tokens, 25) INTO user_plan_tokens
  FROM profiles 
  WHERE id = p_user_id;
  
  -- Ensure tokens are reset for current month if needed
  PERFORM reset_monthly_tokens(p_user_id);
  
  -- Get current token status
  SELECT monthly_tokens, purchased_tokens, used_tokens 
  INTO current_monthly, current_purchased, current_used
  FROM public.user_tokens
  WHERE user_id = p_user_id;
  
  -- If no record exists, create one
  IF current_monthly IS NULL THEN
    INSERT INTO public.user_tokens (user_id, monthly_tokens, purchased_tokens, used_tokens, monthly_allowance, monthly_reset_date, total_tokens)
    VALUES (p_user_id, user_plan_tokens, 0, 0, user_plan_tokens, CURRENT_DATE, user_plan_tokens);
    current_monthly := user_plan_tokens;
    current_purchased := 0;
    current_used := 0;
  END IF;
  
  -- Calculate available tokens
  -- We use monthly tokens first, then purchased tokens
  available_monthly := GREATEST(0, current_monthly - current_used);
  available_purchased := current_purchased;
  total_available := available_monthly + available_purchased;
  
  -- Check if user has enough total tokens
  IF total_available >= p_tokens THEN
    -- Update used tokens
    UPDATE public.user_tokens
    SET used_tokens = used_tokens + p_tokens,
        total_tokens = monthly_tokens + purchased_tokens,
        updated_at = now()
    WHERE user_id = p_user_id;
    
    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
END;
$function$;