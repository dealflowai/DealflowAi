-- Create function to update timestamps (if it doesn't exist)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create table for storing Gmail OAuth tokens
CREATE TABLE public.gmail_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  scope TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.gmail_tokens ENABLE ROW LEVEL SECURITY;

-- Create policies for Gmail tokens
CREATE POLICY "Users can view their own Gmail tokens" 
ON public.gmail_tokens 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own Gmail tokens" 
ON public.gmail_tokens 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own Gmail tokens" 
ON public.gmail_tokens 
FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own Gmail tokens" 
ON public.gmail_tokens 
FOR DELETE 
USING (user_id = auth.uid());

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_gmail_tokens_updated_at
BEFORE UPDATE ON public.gmail_tokens
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();