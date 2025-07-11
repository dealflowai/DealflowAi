-- Create usage tracking table
CREATE TABLE public.user_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  month_year TEXT NOT NULL, -- Format: "2025-01" for tracking monthly usage
  ai_analyzer_runs INTEGER DEFAULT 0,
  ai_matching_runs INTEGER DEFAULT 0,
  ai_discovery_runs INTEGER DEFAULT 0,
  contracts_created INTEGER DEFAULT 0,
  buyer_contacts INTEGER DEFAULT 0,
  seller_contacts INTEGER DEFAULT 0,
  marketplace_listings INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, month_year)
);

-- Enable RLS
ALTER TABLE public.user_usage ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own usage" 
ON public.user_usage 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can update their own usage" 
ON public.user_usage 
FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own usage" 
ON public.user_usage 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

-- Create function to get current month usage
CREATE OR REPLACE FUNCTION get_current_month_usage(p_user_id UUID)
RETURNS TABLE(
  ai_analyzer_runs INTEGER,
  ai_matching_runs INTEGER,
  ai_discovery_runs INTEGER,
  contracts_created INTEGER,
  buyer_contacts INTEGER,
  seller_contacts INTEGER,
  marketplace_listings INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_month TEXT;
BEGIN
  current_month := to_char(now(), 'YYYY-MM');
  
  RETURN QUERY
  SELECT 
    COALESCE(u.ai_analyzer_runs, 0)::INTEGER,
    COALESCE(u.ai_matching_runs, 0)::INTEGER,
    COALESCE(u.ai_discovery_runs, 0)::INTEGER,
    COALESCE(u.contracts_created, 0)::INTEGER,
    COALESCE(u.buyer_contacts, 0)::INTEGER,
    COALESCE(u.seller_contacts, 0)::INTEGER,
    COALESCE(u.marketplace_listings, 0)::INTEGER
  FROM public.user_usage u
  WHERE u.user_id = p_user_id 
    AND u.month_year = current_month;
    
  -- If no record exists, return zeros
  IF NOT FOUND THEN
    RETURN QUERY SELECT 0, 0, 0, 0, 0, 0, 0;
  END IF;
END;
$$;

-- Create function to increment usage
CREATE OR REPLACE FUNCTION increment_usage(
  p_user_id UUID,
  p_usage_type TEXT,
  p_increment INTEGER DEFAULT 1
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_month TEXT;
  sql_query TEXT;
BEGIN
  current_month := to_char(now(), 'YYYY-MM');
  
  -- Validate usage type
  IF p_usage_type NOT IN ('ai_analyzer_runs', 'ai_matching_runs', 'ai_discovery_runs', 
                          'contracts_created', 'buyer_contacts', 'seller_contacts', 
                          'marketplace_listings') THEN
    RAISE EXCEPTION 'Invalid usage type: %', p_usage_type;
  END IF;
  
  -- Insert or update usage record
  sql_query := format('
    INSERT INTO public.user_usage (user_id, month_year, %I)
    VALUES ($1, $2, $3)
    ON CONFLICT (user_id, month_year)
    DO UPDATE SET %I = user_usage.%I + $3, updated_at = now()
  ', p_usage_type, p_usage_type, p_usage_type);
  
  EXECUTE sql_query USING p_user_id, current_month, p_increment;
  
  RETURN TRUE;
END;
$$;