-- Create table for storing user session tokens for scraping platforms
CREATE TABLE public.scraping_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  platform TEXT NOT NULL, -- 'facebook', 'linkedin', 'propwire'
  session_token TEXT NOT NULL, -- encrypted session data
  cookies JSONB, -- browser cookies
  local_storage JSONB, -- localStorage data
  session_storage JSONB, -- sessionStorage data
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  last_used TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.scraping_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own scraping sessions" 
ON public.scraping_sessions 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own scraping sessions" 
ON public.scraping_sessions 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own scraping sessions" 
ON public.scraping_sessions 
FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own scraping sessions" 
ON public.scraping_sessions 
FOR DELETE 
USING (user_id = auth.uid());

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_scraping_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_scraping_sessions_updated_at
BEFORE UPDATE ON public.scraping_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_scraping_sessions_updated_at();

-- Create table for scraping preferences and controls
CREATE TABLE public.scraping_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  platform TEXT NOT NULL,
  auto_scrape_enabled BOOLEAN DEFAULT false,
  scrape_frequency_hours INTEGER DEFAULT 48, -- every 48 hours by default
  facebook_groups TEXT[], -- specific groups to scrape
  linkedin_groups TEXT[], -- specific groups to scrape
  propwire_categories TEXT[], -- specific categories to scrape
  last_scrape_at TIMESTAMP WITH TIME ZONE,
  next_scrape_at TIMESTAMP WITH TIME ZONE,
  scrape_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, platform)
);

-- Enable RLS
ALTER TABLE public.scraping_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own scraping preferences" 
ON public.scraping_preferences 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own scraping preferences" 
ON public.scraping_preferences 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own scraping preferences" 
ON public.scraping_preferences 
FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own scraping preferences" 
ON public.scraping_preferences 
FOR DELETE 
USING (user_id = auth.uid());

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_scraping_preferences_updated_at
BEFORE UPDATE ON public.scraping_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_scraping_sessions_updated_at();