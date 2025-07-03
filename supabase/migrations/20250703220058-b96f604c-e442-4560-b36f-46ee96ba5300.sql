
-- Create deals table for tracking properties and analysis
CREATE TABLE deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  address TEXT NOT NULL,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  lat FLOAT,
  lon FLOAT,
  list_price INTEGER,
  arv INTEGER,
  max_offer INTEGER,
  condition_score INTEGER,
  ai_score INTEGER,
  repair_estimate INTEGER,
  margin INTEGER,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'offer_sent', 'contracted', 'closed', 'dead')),
  deal_type TEXT CHECK (deal_type IN ('wholesale', 'flip', 'hold', 'land')),
  loi_pdf_url TEXT,
  contract_pdf_url TEXT,
  top_buyer_ids UUID[],
  seller_contact TEXT,
  seller_phone TEXT,
  seller_email TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  owner_id UUID NOT NULL
);

-- Create conversations table for tracking all communications
CREATE TABLE conversations (
  id BIGSERIAL PRIMARY KEY,
  deal_id UUID REFERENCES deals(id),
  contact_id UUID,
  contact_type TEXT CHECK (contact_type IN ('buyer', 'seller')),
  channel TEXT CHECK (channel IN ('sms', 'email', 'voice', 'in_person')),
  direction TEXT CHECK (direction IN ('inbound', 'outbound')),
  message TEXT,
  response_received BOOLEAN DEFAULT false,
  scheduled_followup TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  owner_id UUID NOT NULL
);

-- Add RLS policies for deals table
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own deals" 
  ON deals 
  FOR SELECT 
  USING (owner_id = auth.uid());

CREATE POLICY "Users can create their own deals" 
  ON deals 
  FOR INSERT 
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update their own deals" 
  ON deals 
  FOR UPDATE 
  USING (owner_id = auth.uid());

CREATE POLICY "Users can delete their own deals" 
  ON deals 
  FOR DELETE 
  USING (owner_id = auth.uid());

-- Add RLS policies for conversations table
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own conversations" 
  ON conversations 
  FOR SELECT 
  USING (owner_id = auth.uid());

CREATE POLICY "Users can create their own conversations" 
  ON conversations 
  FOR INSERT 
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update their own conversations" 
  ON conversations 
  FOR UPDATE 
  USING (owner_id = auth.uid());

-- Add indexes for better performance
CREATE INDEX idx_deals_status ON deals(status);
CREATE INDEX idx_deals_owner_id ON deals(owner_id);
CREATE INDEX idx_deals_created_at ON deals(created_at);
CREATE INDEX idx_conversations_deal_id ON conversations(deal_id);
CREATE INDEX idx_conversations_owner_id ON conversations(owner_id);
CREATE INDEX idx_conversations_created_at ON conversations(created_at);

-- Add update trigger for deals
CREATE OR REPLACE FUNCTION update_deals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER deals_updated_at_trigger
  BEFORE UPDATE ON deals
  FOR EACH ROW
  EXECUTE FUNCTION update_deals_updated_at();
