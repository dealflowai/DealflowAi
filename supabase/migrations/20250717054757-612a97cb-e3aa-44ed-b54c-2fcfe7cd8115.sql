-- Update add_tokens function to always keep total_tokens in sync
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
  INSERT INTO public.user_tokens (user_id, monthly_tokens, purchased_tokens, used_tokens, monthly_allowance, monthly_reset_date, total_tokens)
  VALUES (p_user_id, user_plan_tokens, p_tokens, 0, user_plan_tokens, CURRENT_DATE, user_plan_tokens + p_tokens)
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    purchased_tokens = user_tokens.purchased_tokens + p_tokens,
    total_tokens = user_tokens.monthly_tokens + user_tokens.purchased_tokens + p_tokens,
    updated_at = now();
    
  RETURN TRUE;
END;
$function$;

-- Update grant_monthly_tokens to keep total_tokens in sync
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
    INSERT INTO public.user_tokens (user_id, monthly_tokens, purchased_tokens, used_tokens, monthly_allowance, monthly_reset_date, total_tokens)
    VALUES (user_record.id, tokens_to_grant, 0, 0, tokens_to_grant, CURRENT_DATE, tokens_to_grant)
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