
-- Add new columns to the buyers table to match the Google Sheet
ALTER TABLE public.buyers 
ADD COLUMN IF NOT EXISTS location_focus TEXT,
ADD COLUMN IF NOT EXISTS property_type_interest TEXT[],
ADD COLUMN IF NOT EXISTS land_buyer BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS criteria_notes TEXT,
ADD COLUMN IF NOT EXISTS portfolio_summary TEXT,
ADD COLUMN IF NOT EXISTS equity_position NUMERIC,
ADD COLUMN IF NOT EXISTS last_contacted TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS contact_info TEXT,
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'MEDIUM',
ADD COLUMN IF NOT EXISTS tags_additional TEXT[],
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS state TEXT,
ADD COLUMN IF NOT EXISTS zip_code TEXT,
ADD COLUMN IF NOT EXISTS investment_criteria TEXT,
ADD COLUMN IF NOT EXISTS acquisition_timeline TEXT,
ADD COLUMN IF NOT EXISTS financing_type TEXT,
ADD COLUMN IF NOT EXISTS partnership_interest BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS referral_source TEXT,
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Add a check constraint for priority values
ALTER TABLE public.buyers 
ADD CONSTRAINT buyers_priority_check 
CHECK (priority IN ('HIGH', 'MEDIUM', 'LOW', 'VERY HIGH'));

-- Add a check constraint for status values to match your sheet
ALTER TABLE public.buyers 
DROP CONSTRAINT IF EXISTS buyers_status_check;

ALTER TABLE public.buyers 
ADD CONSTRAINT buyers_status_check 
CHECK (status IN ('new', 'active', 'warm', 'cold', 'not contacted', 'contacted', 'qualified', 'deal pending'));
