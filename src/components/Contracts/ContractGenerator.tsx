
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Wand2, FileText, Send } from 'lucide-react';
import { useTokens, TOKEN_COSTS } from '@/contexts/TokenContext';
import { useContracts } from '@/hooks/useContracts';
import { supabase } from '@/integrations/supabase/client';

interface ContractGeneratorProps {
}

const ContractGenerator = ({}: ContractGeneratorProps) => {
  const [templateType, setTemplateType] = useState('');
  const [dealId, setDealId] = useState('');
  const [formData, setFormData] = useState({
    propertyAddress: '',
    buyerName: '',
    buyerEmail: '',
    sellerName: '',
    sellerEmail: '',
    purchasePrice: '',
    earnestMoney: '',
    closingDate: '',
    specialTerms: ''
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const { deductTokens } = useTokens();
  const { createContract } = useContracts();

  const handleGenerateContract = async () => {
    if (!templateType) {
      toast({
        title: "Template Required",
        description: "Please select a contract template type.",
        variant: "destructive"
      });
      return;
    }

    // Check and deduct tokens before generating contract
    const tokenDeducted = await deductTokens(TOKEN_COSTS['Contract Generator'], 'Contract Generator');
    if (!tokenDeducted) {
      return; // Token deduction failed, user was notified
    }

    setIsGenerating(true);
    
    try {
      // Call the AI contract generator edge function
      const { data, error } = await supabase.functions.invoke('ai-contract-generator', {
        body: {
          templateType,
          dealId: dealId || null,
          propertyAddress: formData.propertyAddress,
          buyerName: formData.buyerName,
          buyerEmail: formData.buyerEmail,
          sellerName: formData.sellerName,
          sellerEmail: formData.sellerEmail,
          purchasePrice: parseInt(formData.purchasePrice) || null,
          earnestMoney: parseInt(formData.earnestMoney) || null,
          closingDate: formData.closingDate || null,
          specialTerms: formData.specialTerms
        }
      });

      if (error) {
        throw error;
      }

      // Create the contract in the database
      const contractData = {
        title: `${templateType} - ${formData.propertyAddress || 'New Property'}`,
        template_type: templateType,
        property_address: formData.propertyAddress,
        buyer_name: formData.buyerName,
        buyer_email: formData.buyerEmail,
        seller_name: formData.sellerName,
        seller_email: formData.sellerEmail,
        purchase_price: parseInt(formData.purchasePrice) || null,
        earnest_money: parseInt(formData.earnestMoney) || null,
        closing_date: formData.closingDate || null,
        special_terms: formData.specialTerms,
        status: 'draft',
        contract_content: data.content,
        deal_id: dealId || null
      };

      await createContract(contractData);
      
      toast({
        title: "Contract Generated",
        description: "Your contract has been successfully generated with AI.",
      });

      // Reset form
      setFormData({
        propertyAddress: '',
        buyerName: '',
        buyerEmail: '',
        sellerName: '',
        sellerEmail: '',
        purchasePrice: '',
        earnestMoney: '',
        closingDate: '',
        specialTerms: ''
      });
      setTemplateType('');
      setDealId('');
      
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate contract. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Wand2 className="w-5 h-5 text-blue-600" />
          <span>AI Contract Generator</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="template-type">Contract Type</Label>
            <Select value={templateType} onValueChange={setTemplateType}>
              <SelectTrigger>
                <SelectValue placeholder="Select contract type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Purchase Agreement">Purchase Agreement</SelectItem>
                <SelectItem value="Assignment">Assignment Contract</SelectItem>
                <SelectItem value="Letter of Intent">Letter of Intent</SelectItem>
                <SelectItem value="Seller Disclosure">Seller Disclosure</SelectItem>
                <SelectItem value="Option Contract">Option Contract</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="deal-id">Link to Deal (Optional)</Label>
            <Input
              id="deal-id"
              placeholder="Deal ID"
              value={dealId}
              onChange={(e) => setDealId(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="property-address">Property Address</Label>
            <Input
              id="property-address"
              placeholder="123 Main St, City, State"
              value={formData.propertyAddress}
              onChange={(e) => setFormData({...formData, propertyAddress: e.target.value})}
            />
          </div>

          <div>
            <Label htmlFor="purchase-price">Purchase Price</Label>
            <Input
              id="purchase-price"
              type="number"
              placeholder="50000"
              value={formData.purchasePrice}
              onChange={(e) => setFormData({...formData, purchasePrice: e.target.value})}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="buyer-name">Buyer Name</Label>
            <Input
              id="buyer-name"
              placeholder="John Smith"
              value={formData.buyerName}
              onChange={(e) => setFormData({...formData, buyerName: e.target.value})}
            />
          </div>

          <div>
            <Label htmlFor="buyer-email">Buyer Email</Label>
            <Input
              id="buyer-email"
              type="email"
              placeholder="buyer@email.com"
              value={formData.buyerEmail}
              onChange={(e) => setFormData({...formData, buyerEmail: e.target.value})}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="seller-name">Seller Name</Label>
            <Input
              id="seller-name"
              placeholder="Jane Doe"
              value={formData.sellerName}
              onChange={(e) => setFormData({...formData, sellerName: e.target.value})}
            />
          </div>

          <div>
            <Label htmlFor="seller-email">Seller Email</Label>
            <Input
              id="seller-email"
              type="email"
              placeholder="seller@email.com"
              value={formData.sellerEmail}
              onChange={(e) => setFormData({...formData, sellerEmail: e.target.value})}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="earnest-money">Earnest Money</Label>
            <Input
              id="earnest-money"
              type="number"
              placeholder="1000"
              value={formData.earnestMoney}
              onChange={(e) => setFormData({...formData, earnestMoney: e.target.value})}
            />
          </div>

          <div>
            <Label htmlFor="closing-date">Closing Date</Label>
            <Input
              id="closing-date"
              type="date"
              value={formData.closingDate}
              onChange={(e) => setFormData({...formData, closingDate: e.target.value})}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="special-terms">Special Terms</Label>
          <Textarea
            id="special-terms"
            placeholder="Any special terms or conditions..."
            value={formData.specialTerms}
            onChange={(e) => setFormData({...formData, specialTerms: e.target.value})}
            rows={3}
          />
        </div>

        <Button 
          onClick={handleGenerateContract} 
          disabled={isGenerating}
          className="w-full bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Generating Contract...
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4 mr-2" />
              Generate Contract with AI
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ContractGenerator;
