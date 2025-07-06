
-- Add role column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN role text DEFAULT 'admin';

-- Create organization_limits table for quotas
CREATE TABLE public.organization_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL,
  daily_tokens int DEFAULT 500,
  seat_limit int DEFAULT 5,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on organization_limits
ALTER TABLE public.organization_limits ENABLE ROW LEVEL SECURITY;

-- Create policy for organization_limits
CREATE POLICY "Users can view their organization limits" 
  ON public.organization_limits 
  FOR SELECT 
  USING (true);

-- Create buyer_comments table for collaboration
CREATE TABLE public.buyer_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id uuid REFERENCES public.buyers(id) ON DELETE CASCADE,
  author_id uuid NOT NULL,
  body text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on buyer_comments
ALTER TABLE public.buyer_comments ENABLE ROW LEVEL SECURITY;

-- Policies for buyer_comments
CREATE POLICY "Users can view comments on their buyers" 
  ON public.buyer_comments 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.buyers 
      WHERE id = buyer_id AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can create comments on their buyers" 
  ON public.buyer_comments 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.buyers 
      WHERE id = buyer_id AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own comments" 
  ON public.buyer_comments 
  FOR UPDATE 
  USING (author_id = auth.uid());

CREATE POLICY "Users can delete their own comments" 
  ON public.buyer_comments 
  FOR DELETE 
  USING (author_id = auth.uid());

-- Add featured_until column to deals table for marketplace features
ALTER TABLE public.deals 
ADD COLUMN featured_until timestamp with time zone;

-- Add indexes for performance
CREATE INDEX idx_buyer_comments_buyer_id ON public.buyer_comments(buyer_id);
CREATE INDEX idx_buyer_comments_created_at ON public.buyer_comments(created_at);
CREATE INDEX idx_deals_featured_until ON public.deals(featured_until) WHERE featured_until IS NOT NULL;
