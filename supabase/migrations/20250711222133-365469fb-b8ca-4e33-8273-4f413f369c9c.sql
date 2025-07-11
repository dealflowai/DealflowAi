-- Create table to track user tokens
CREATE TABLE public.user_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  total_tokens INTEGER NOT NULL DEFAULT 0,
  used_tokens INTEGER NOT NULL DEFAULT 0,
  remaining_tokens INTEGER GENERATED ALWAYS AS (total_tokens - used_tokens) STORED,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_tokens ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own tokens" ON public.user_tokens
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own tokens" ON public.user_tokens
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "System can insert tokens" ON public.user_tokens
  FOR INSERT WITH CHECK (true);

-- Create table for token transactions/purchases
CREATE TABLE public.token_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  tokens_purchased INTEGER NOT NULL,
  amount_paid INTEGER NOT NULL, -- amount in cents
  stripe_session_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS for token purchases
ALTER TABLE public.token_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own purchases" ON public.token_purchases
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can insert purchases" ON public.token_purchases
  FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update purchases" ON public.token_purchases
  FOR UPDATE USING (true);

-- Create function to deduct tokens
CREATE OR REPLACE FUNCTION public.deduct_tokens(p_user_id UUID, p_tokens INTEGER)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_remaining INTEGER;
BEGIN
  -- Get current remaining tokens
  SELECT remaining_tokens INTO current_remaining
  FROM public.user_tokens
  WHERE user_id = p_user_id;
  
  -- If no record exists, create one with 25 free tokens
  IF current_remaining IS NULL THEN
    INSERT INTO public.user_tokens (user_id, total_tokens, used_tokens)
    VALUES (p_user_id, 25, 0);
    current_remaining := 25;
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

-- Create function to add tokens (for purchases)
CREATE OR REPLACE FUNCTION public.add_tokens(p_user_id UUID, p_tokens INTEGER)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert or update tokens
  INSERT INTO public.user_tokens (user_id, total_tokens, used_tokens)
  VALUES (p_user_id, p_tokens, 0)
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    total_tokens = user_tokens.total_tokens + p_tokens,
    updated_at = now();
    
  RETURN TRUE;
END;
$$;

-- Create function to get user token balance
CREATE OR REPLACE FUNCTION public.get_user_tokens(p_user_id UUID)
RETURNS TABLE(total_tokens INTEGER, used_tokens INTEGER, remaining_tokens INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(ut.total_tokens, 25) as total_tokens,
    COALESCE(ut.used_tokens, 0) as used_tokens,
    COALESCE(ut.remaining_tokens, 25) as remaining_tokens
  FROM public.user_tokens ut
  WHERE ut.user_id = p_user_id
  
  UNION ALL
  
  SELECT 25, 0, 25
  WHERE NOT EXISTS (SELECT 1 FROM public.user_tokens WHERE user_id = p_user_id);
END;
$$;