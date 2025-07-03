
-- Create contracts table for storing contract documents and their metadata
CREATE TABLE contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL,
  deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
  template_type TEXT NOT NULL,
  title TEXT NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending_signature', 'partially_signed', 'fully_signed', 'executed', 'expired')),
  property_address TEXT NOT NULL,
  buyer_name TEXT,
  buyer_email TEXT,
  seller_name TEXT,
  seller_email TEXT,
  purchase_price INTEGER,
  earnest_money INTEGER,
  closing_date DATE,
  special_terms TEXT,
  contract_content TEXT,
  sent_for_signature_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies for contracts table
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own contracts" 
  ON contracts 
  FOR SELECT 
  USING (owner_id = auth.uid());

CREATE POLICY "Users can create their own contracts" 
  ON contracts 
  FOR INSERT 
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update their own contracts" 
  ON contracts 
  FOR UPDATE 
  USING (owner_id = auth.uid());

CREATE POLICY "Users can delete their own contracts" 
  ON contracts 
  FOR DELETE 
  USING (owner_id = auth.uid());

-- Add indexes for better performance
CREATE INDEX idx_contracts_owner_id ON contracts(owner_id);
CREATE INDEX idx_contracts_status ON contracts(status);
CREATE INDEX idx_contracts_deal_id ON contracts(deal_id);
CREATE INDEX idx_contracts_created_at ON contracts(created_at);

-- Add update trigger for contracts
CREATE OR REPLACE FUNCTION update_contracts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER contracts_updated_at_trigger
  BEFORE UPDATE ON contracts
  FOR EACH ROW
  EXECUTE FUNCTION update_contracts_updated_at();
