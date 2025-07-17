-- Update deduct_tokens to use monthly tokens first, then purchased tokens
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
  tokens_needed INTEGER;
  monthly_to_use INTEGER;
  purchased_to_use INTEGER;
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
    INSERT INTO public.user_tokens (user_id, monthly_tokens, purchased_tokens, used_tokens, monthly_allowance, monthly_reset_date)
    VALUES (p_user_id, user_plan_tokens, 0, 0, user_plan_tokens, CURRENT_DATE);
    current_monthly := user_plan_tokens;
    current_purchased := 0;
    current_used := 0;
  END IF;
  
  -- Calculate available tokens
  tokens_needed := p_tokens;
  
  -- Check if user has enough total tokens
  IF (current_monthly + current_purchased - current_used) >= tokens_needed THEN
    -- Use monthly tokens first
    monthly_to_use := LEAST(tokens_needed, current_monthly - LEAST(current_used, current_monthly));
    tokens_needed := tokens_needed - monthly_to_use;
    
    -- Use purchased tokens for remainder
    purchased_to_use := tokens_needed;
    
    -- Update used tokens
    UPDATE public.user_tokens
    SET used_tokens = used_tokens + p_tokens,
        updated_at = now()
    WHERE user_id = p_user_id;
    
    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
END;
$function$;

-- Update grant_monthly_tokens to only add monthly tokens
CREATE OR REPLACE FUNCTION public.grant_monthly_tokens()
 RETURNS TABLE(user_id uuid, tokens_granted integer, next_grant_date date)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
    
    -- Reset monthly tokens (purchased tokens remain untouched)
    INSERT INTO public.user_tokens (user_id, monthly_tokens, purchased_tokens, used_tokens, monthly_allowance, monthly_reset_date)
    VALUES (user_record.id, tokens_to_grant, 0, 0, tokens_to_grant, CURRENT_DATE)
    ON CONFLICT (user_id) 
    DO UPDATE SET 
      monthly_tokens = tokens_to_grant,
      monthly_allowance = tokens_to_grant,
      monthly_reset_date = CURRENT_DATE,
      total_tokens = tokens_to_grant + user_tokens.purchased_tokens,
      used_tokens = 0,
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
$function$;

-- Update grant_tokens_to_user function to add purchased tokens
CREATE OR REPLACE FUNCTION public.grant_tokens_to_user(p_user_id uuid, p_tokens integer DEFAULT NULL::integer)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
  
  -- Add to purchased tokens (these never expire)
  INSERT INTO public.user_tokens (user_id, monthly_tokens, purchased_tokens, used_tokens, monthly_allowance, monthly_reset_date)
  VALUES (p_user_id, user_plan_tokens, tokens_to_grant, 0, user_plan_tokens, CURRENT_DATE)
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    purchased_tokens = user_tokens.purchased_tokens + tokens_to_grant,
    total_tokens = user_tokens.monthly_tokens + user_tokens.purchased_tokens + tokens_to_grant,
    updated_at = now();
  
  -- Update the user's token grant tracking
  UPDATE profiles 
  SET last_token_grant_date = CURRENT_DATE,
      next_token_grant_date = CURRENT_DATE + INTERVAL '1 month',
      updated_at = now()
  WHERE id = p_user_id;
  
  RETURN TRUE;
END;
$function$;