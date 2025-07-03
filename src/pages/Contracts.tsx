
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  FileText, Plus, Download, Edit, Eye, Clock, Send, Users, 
  CheckCircle, AlertTriangle, Zap, FileSignature, Copy,
  Calendar, DollarSign, MapPin, User
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useUserSync } from '@/hooks/useUserSync';

const Contracts = () => {
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [isGeneratingContract, setIsGeneratingContract] = useState(false);
  const [contractForm, setContractForm] = useState({
    dealId: '',
    templateType: '',
    buyerName: '',
    buyerEmail: '',
    sellerName: '',
    sellerEmail: '',
    propertyAddress: '',
    purchasePrice: '',
    earnestMoney: '',
    closingDate: '',
    specialTerms: ''
  });
  
  const { user } = useUserSync();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch contracts
  const { data: contracts = [], isLoading: contractsLoading } = useQuery({
    queryKey: ['contracts'],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('contracts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch deals for contract generation
  const { data: deals = [] } = useQuery({
    queryKey: ['deals-for-contracts'],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('deals')
        .select('id, address, city, state, list_price, status')
        .in('status', ['new', 'contacted', 'offer_sent']);
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Generate contract mutation
  const generateContractMutation = useMutation({
    mutationFn: async (contractData: any) => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('clerk_id', user?.id)
        .single();

      const { data, error } = await supabase
        .from('contracts')
        .insert({
          ...contractData,
          owner_id: profile?.id,
          status: 'draft'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      toast({
        title: "Contract Generated",
        description: "Your contract has been created successfully!",
      });
      setContractForm({
        dealId: '',
        templateType: '',
        buyerName: '',
        buyerEmail: '',
        sellerName: '',
        sellerEmail: '',
        propertyAddress: '',
        purchasePrice: '',
        earnestMoney: '',
        closingDate: '',
        specialTerms: ''
      });
    },
  });

  // Send for signature mutation
  const sendForSignatureMutation = useMutation({
    mutationFn: async (contractId: string) => {
      const { error } = await supabase
        .from('contracts')
        .update({ 
          status: 'pending_signature',
          sent_for_signature_at: new Date().toISOString()
        })
        .eq('id', contractId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      toast({
        title: "Sent for Signature",
        description: "Contract has been sent to all parties for signature.",
      });
    },
  });

  const contractTemplates = [
    {
      id: 'purchase_agreement',
      title: 'Purchase Agreement',
      description: 'Standard real estate purchase agreement for wholesale deals',
      icon: FileText,
      category: 'Primary'
    },
    {
      id: 'assignment_contract',
      title: 'Assignment Contract',
      description: 'Assignment of purchase agreement to end buyer',
      icon: FileText,
      category: 'Primary'
    },
    {
      id: 'loi',
      title: 'Letter of Intent',
      description: 'Non-binding offer letter for initial negotiations',
      icon: FileText,
      category: 'Preliminary'
    },
    {
      id: 'seller_disclosure',
      title: 'Seller Disclosure',
      description: 'Property condition disclosure form',
      icon: FileText,
      category: 'Supporting'
    },
    {
      id: 'inspection_addendum',
      title: 'Inspection Addendum',
      description: 'Property inspection terms and conditions',
      icon: FileText,
      category: 'Supporting'
    },
    {
      id: 'financing_contingency',
      title: 'Financing Contingency',
      description: 'Buyer financing terms and deadlines',
      icon: FileText,
      category: 'Supporting'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'pending_signature':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'partially_signed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'fully_signed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'executed':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'expired':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return <Edit className="w-3 h-3" />;
      case 'pending_signature':
        return <Clock className="w-3 h-3" />;
      case 'partially_signed':
        return <FileSignature className="w-3 h-3" />;
      case 'fully_signed':
        return <CheckCircle className="w-3 h-3" />;
      case 'executed':
        return <CheckCircle className="w-3 h-3" />;
      case 'expired':
        return <AlertTriangle className="w-3 h-3" />;
      default:
        return <FileText className="w-3 h-3" />;
    }
  };

  const handleGenerateContract = () => {
    if (!contractForm.templateType || !contractForm.propertyAddress) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    generateContractMutation.mutate({
      template_type: contractForm.templateType,
      deal_id: contractForm.dealId || null,
      property_address: contractForm.propertyAddress,
      buyer_name: contractForm.buyerName,
      buyer_email: contractForm.buyerEmail,
      seller_name: contractForm.sellerName,
      seller_email: contractForm.sellerEmail,
      purchase_price: parseFloat(contractForm.purchasePrice) || null,
      earnest_money: parseFloat(contractForm.earnestMoney) || null,
      closing_date: contractForm.closingDate || null,
      special_terms: contractForm.specialTerms,
      title: `${contractTemplates.find(t => t.id === contractForm.templateType)?.title} - ${contractForm.propertyAddress}`
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Smart Contracts</h1>
          <p className="text-gray-600 mt-1">AI-powered contract generation and e-signature workflow</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700">
              <Plus className="w-4 h-4 mr-2" />
              Generate Contract
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Generate New Contract</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Contract Template *</Label>
                  <Select value={contractForm.templateType} onValueChange={(value) => setContractForm({...contractForm, templateType: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select template" />
                    </SelectTrigger>
                    <SelectContent>
                      {contractTemplates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Link to Deal (Optional)</Label>
                  <Select value={contractForm.dealId} onValueChange={(value) => setContractForm({...contractForm, dealId: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select deal" />
                    </SelectTrigger>
                    <SelectContent>
                      {deals.map((deal) => (
                        <SelectItem key={deal.id} value={deal.id}>
                          {deal.address} - ${deal.list_price?.toLocaleString()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Property Address *</Label>
                <Input 
                  value={contractForm.propertyAddress}
                  onChange={(e) => setContractForm({...contractForm, propertyAddress: e.target.value})}
                  placeholder="123 Main Street, City, State 12345"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Buyer Name</Label>
                  <Input 
                    value={contractForm.buyerName}
                    onChange={(e) => setContractForm({...contractForm, buyerName: e.target.value})}
                    placeholder="John Buyer"
                  />
                </div>
                <div>
                  <Label>Buyer Email</Label>
                  <Input 
                    type="email"
                    value={contractForm.buyerEmail}
                    onChange={(e) => setContractForm({...contractForm, buyerEmail: e.target.value})}
                    placeholder="buyer@email.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Seller Name</Label>
                  <Input 
                    value={contractForm.sellerName}
                    onChange={(e) => setContractForm({...contractForm, sellerName: e.target.value})}
                    placeholder="Jane Seller"
                  />
                </div>
                <div>
                  <Label>Seller Email</Label>
                  <Input 
                    type="email"
                    value={contractForm.sellerEmail}
                    onChange={(e) => setContractForm({...contractForm, sellerEmail: e.target.value})}
                    placeholder="seller@email.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Purchase Price</Label>
                  <Input 
                    type="number"
                    value={contractForm.purchasePrice}
                    onChange={(e) => setContractForm({...contractForm, purchasePrice: e.target.value})}
                    placeholder="150000"
                  />
                </div>
                <div>
                  <Label>Earnest Money</Label>
                  <Input 
                    type="number"
                    value={contractForm.earnestMoney}
                    onChange={(e) => setContractForm({...contractForm, earnestMoney: e.target.value})}
                    placeholder="5000"
                  />
                </div>
                <div>
                  <Label>Closing Date</Label>
                  <Input 
                    type="date"
                    value={contractForm.closingDate}
                    onChange={(e) => setContractForm({...contractForm, closingDate: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <Label>Special Terms</Label>
                <Textarea 
                  value={contractForm.specialTerms}
                  onChange={(e) => setContractForm({...contractForm, specialTerms: e.target.value})}
                  placeholder="Any special terms or conditions..."
                  rows={3}
                />
              </div>

              <Button 
                onClick={handleGenerateContract}
                disabled={generateContractMutation.isPending}
                className="w-full"
              >
                <Zap className="w-4 h-4 mr-2" />
                {generateContractMutation.isPending ? 'Generating...' : 'Generate Contract'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="contracts" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="contracts">Active Contracts</TabsTrigger>
          <TabsTrigger value="templates">Template Library</TabsTrigger>
          <TabsTrigger value="analytics">Contract Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="contracts" className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Contracts</p>
                    <p className="text-2xl font-bold text-gray-900">{contracts.length}</p>
                  </div>
                  <FileText className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending Signature</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {contracts.filter(c => c.status === 'pending_signature').length}
                    </p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Fully Signed</p>
                    <p className="text-2xl font-bold text-green-600">
                      {contracts.filter(c => c.status === 'fully_signed').length}
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Executed</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {contracts.filter(c => c.status === 'executed').length}
                    </p>
                  </div>
                  <Badge className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center">
                    ✓
                  </Badge>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Value</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${contracts.reduce((sum, c) => sum + (c.purchase_price || 0), 0).toLocaleString()}
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contracts List */}
          <div className="space-y-4">
            {contractsLoading ? (
              <div className="text-center py-8">Loading contracts...</div>
            ) : contracts.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No contracts yet</h3>
                  <p className="text-gray-600 mb-4">Generate your first contract to get started</p>
                </CardContent>
              </Card>
            ) : (
              contracts.map((contract) => (
                <Card key={contract.id} className="hover:shadow-md transition-all duration-200">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900">{contract.title}</h3>
                          <Badge className={getStatusColor(contract.status)}>
                            {getStatusIcon(contract.status)}
                            <span className="ml-1 capitalize">{contract.status.replace('_', ' ')}</span>
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {contract.property_address}
                          </div>
                          {contract.purchase_price && (
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-3 h-3" />
                              ${contract.purchase_price.toLocaleString()}
                            </div>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          {contract.buyer_name && (
                            <div className="flex items-center gap-2">
                              <User className="w-3 h-3 text-gray-400" />
                              <span className="text-gray-500">Buyer:</span>
                              <span className="font-medium text-gray-900">{contract.buyer_name}</span>
                            </div>
                          )}
                          {contract.seller_name && (
                            <div className="flex items-center gap-2">
                              <User className="w-3 h-3 text-gray-400" />
                              <span className="text-gray-500">Seller:</span>
                              <span className="font-medium text-gray-900">{contract.seller_name}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="text-sm text-gray-500">
                        Created: {new Date(contract.created_at).toLocaleDateString()}
                        {contract.sent_for_signature_at && (
                          <span> • Sent: {new Date(contract.sent_for_signature_at).toLocaleDateString()}</span>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-3 h-3 mr-1" />
                          Preview
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        {contract.status === 'draft' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => sendForSignatureMutation.mutate(contract.id)}
                            disabled={sendForSignatureMutation.isPending}
                          >
                            <Send className="w-3 h-3 mr-1" />
                            Send for Signature
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          <Download className="w-3 h-3 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {['Primary', 'Preliminary', 'Supporting'].map((category) => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="text-lg">{category} Documents</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {contractTemplates
                    .filter(template => template.category === category)
                    .map((template) => (
                      <div
                        key={template.id}
                        className="p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group cursor-pointer"
                      >
                        <div className="flex items-start space-x-3">
                          <template.icon className="w-5 h-5 text-gray-600 group-hover:text-blue-600 mt-0.5" />
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900 group-hover:text-blue-900">{template.title}</h3>
                            <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                            <div className="flex space-x-2 mt-2">
                              <Button variant="outline" size="sm">
                                <Eye className="w-3 h-3 mr-1" />
                                Preview
                              </Button>
                              <Button variant="outline" size="sm">
                                <Copy className="w-3 h-3 mr-1" />
                                Use Template
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Contract Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Average Time to Signature</span>
                    <span className="font-semibold">3.2 days</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Signature Rate</span>
                    <span className="font-semibold text-green-600">87%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Most Used Template</span>
                    <span className="font-semibold">Purchase Agreement</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Contract Volume</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">This Month</span>
                    <span className="font-semibold">{contracts.length} contracts</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Value</span>
                    <span className="font-semibold">
                      ${contracts.reduce((sum, c) => sum + (c.purchase_price || 0), 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Growth</span>
                    <span className="font-semibold text-green-600">+23%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Contracts;
