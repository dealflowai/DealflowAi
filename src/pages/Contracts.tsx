import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUserSync } from '@/hooks/useUserSync';
import { useProfileData } from '@/hooks/useProfileData';
import { useToast } from '@/hooks/use-toast';
import { 
  FileText, 
  Plus, 
  Download, 
  Send, 
  CheckCircle,
  Clock,
  AlertCircle,
  BarChart3,
  Users,
  DollarSign,
  Calendar,
  Loader2
} from 'lucide-react';

export default function Contracts() {
  const { user, isLoaded } = useUserSync();
  const { data: profile, isLoading: profileLoading } = useProfileData();
  const [activeTab, setActiveTab] = useState('contracts');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [contractData, setContractData] = useState({
    title: '',
    property_address: '',
    buyer_name: '',
    buyer_email: '',
    seller_name: '',
    seller_email: '',
    purchase_price: '',
    earnest_money: '',
    closing_date: '',
    special_terms: ''
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  console.log('User loaded:', isLoaded, 'User:', user?.id);
  console.log('Profile loading:', profileLoading, 'Profile:', profile);

  // Show loading state while authentication and profile are loading
  if (!isLoaded || profileLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show error if user is not authenticated
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Please sign in to access contracts.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Fetch contracts using user.id directly since profile might not exist yet
  const { data: contracts = [], isLoading: contractsLoading } = useQuery({
    queryKey: ['contracts', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      console.log('Fetching contracts for user:', user.id);
      
      const { data, error } = await supabase
        .from('contracts')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching contracts:', error);
        return [];
      }
      
      console.log('Fetched contracts:', data);
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch deals for contract creation using user.id directly
  const { data: deals = [] } = useQuery({
    queryKey: ['deals', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('deals')
        .select('*')
        .eq('owner_id', user.id)
        .eq('status', 'contracted');

      if (error) {
        console.error('Error fetching deals:', error);
        return [];
      }
      return data;
    },
    enabled: !!user?.id,
  });

  // Create contract mutation
  const createContractMutation = useMutation({
    mutationFn: async (contractInfo: any) => {
      if (!user?.id) throw new Error('No user found');
      
      const { data, error } = await supabase
        .from('contracts')
        .insert({ 
          ...contractInfo, 
          owner_id: user.id,
          template_type: selectedTemplate,
          purchase_price: contractInfo.purchase_price ? parseInt(contractInfo.purchase_price) : null,
          earnest_money: contractInfo.earnest_money ? parseInt(contractInfo.earnest_money) : null,
          status: 'draft'
        });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      setContractData({
        title: '',
        property_address: '',
        buyer_name: '',
        buyer_email: '',
        seller_name: '',
        seller_email: '',
        purchase_price: '',
        earnest_money: '',
        closing_date: '',
        special_terms: ''
      });
      setSelectedTemplate('');
      toast({
        title: "Contract Created",
        description: "Contract has been successfully created.",
      });
    },
  });

  // Update contract status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data, error } = await supabase
        .from('contracts')
        .update({ 
          status,
          sent_for_signature_at: status === 'pending_signature' ? new Date().toISOString() : undefined
        })
        .eq('id', id);

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      toast({
        title: "Status Updated",
        description: "Contract status has been updated.",
      });
    },
  });

  const handleCreateContract = () => {
    if (!selectedTemplate || !contractData.title) {
      toast({
        title: "Missing Information",
        description: "Please select a template and enter a title.",
        variant: "destructive",
      });
      return;
    }

    createContractMutation.mutate(contractData);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'pending_signature': return 'bg-yellow-100 text-yellow-800';
      case 'partially_signed': return 'bg-blue-100 text-blue-800';
      case 'fully_signed': return 'bg-green-100 text-green-800';
      case 'executed': return 'bg-emerald-100 text-emerald-800';
      case 'expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'fully_signed':
      case 'executed':
        return <CheckCircle className="h-4 w-4" />;
      case 'pending_signature':
      case 'partially_signed':
        return <Clock className="h-4 w-4" />;
      case 'expired':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const contractTemplates = [
    { id: 'purchase_agreement', name: 'Purchase Agreement', description: 'Standard real estate purchase contract' },
    { id: 'wholesale_contract', name: 'Wholesale Contract', description: 'Assignment contract for wholesale deals' },
    { id: 'lease_option', name: 'Lease Option', description: 'Lease with option to purchase agreement' },
    { id: 'seller_financing', name: 'Seller Financing', description: 'Owner-financed purchase agreement' }
  ];

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Contracts</h1>
        <p className="text-muted-foreground">Generate, manage, and track your real estate contracts</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <FileText className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{contracts.length}</p>
                <p className="text-xs text-muted-foreground">Total Contracts</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">
                  {contracts.filter(c => c.status === 'pending_signature').length}
                </p>
                <p className="text-xs text-muted-foreground">Pending Signature</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">
                  {contracts.filter(c => c.status === 'executed').length}
                </p>
                <p className="text-xs text-muted-foreground">Executed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">
                  ${contracts.reduce((sum, contract) => sum + (contract.purchase_price || 0), 0).toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">Total Contract Value</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="contracts">Contracts</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="signatures">E-Signatures</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="contracts" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Contract Management</CardTitle>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Contract
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create New Contract</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="template">Contract Template</Label>
                      <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a template" />
                        </SelectTrigger>
                        <SelectContent>
                          {contractTemplates.map((template) => (
                            <SelectItem key={template.id} value={template.id}>
                              {template.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="title">Contract Title</Label>
                        <Input
                          id="title"
                          value={contractData.title}
                          onChange={(e) => setContractData({...contractData, title: e.target.value})}
                          placeholder="Enter contract title"
                        />
                      </div>
                      <div>
                        <Label htmlFor="property_address">Property Address</Label>
                        <Input
                          id="property_address"
                          value={contractData.property_address}
                          onChange={(e) => setContractData({...contractData, property_address: e.target.value})}
                          placeholder="Property address"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="buyer_name">Buyer Name</Label>
                        <Input
                          id="buyer_name"
                          value={contractData.buyer_name}
                          onChange={(e) => setContractData({...contractData, buyer_name: e.target.value})}
                          placeholder="Buyer name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="buyer_email">Buyer Email</Label>
                        <Input
                          id="buyer_email"
                          type="email"
                          value={contractData.buyer_email}
                          onChange={(e) => setContractData({...contractData, buyer_email: e.target.value})}
                          placeholder="buyer@email.com"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="seller_name">Seller Name</Label>
                        <Input
                          id="seller_name"
                          value={contractData.seller_name}
                          onChange={(e) => setContractData({...contractData, seller_name: e.target.value})}
                          placeholder="Seller name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="seller_email">Seller Email</Label>
                        <Input
                          id="seller_email"
                          type="email"
                          value={contractData.seller_email}
                          onChange={(e) => setContractData({...contractData, seller_email: e.target.value})}
                          placeholder="seller@email.com"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="purchase_price">Purchase Price</Label>
                        <Input
                          id="purchase_price"
                          type="number"
                          value={contractData.purchase_price}
                          onChange={(e) => setContractData({...contractData, purchase_price: e.target.value})}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label htmlFor="earnest_money">Earnest Money</Label>
                        <Input
                          id="earnest_money"
                          type="number"
                          value={contractData.earnest_money}
                          onChange={(e) => setContractData({...contractData, earnest_money: e.target.value})}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label htmlFor="closing_date">Closing Date</Label>
                        <Input
                          id="closing_date"
                          type="date"
                          value={contractData.closing_date}
                          onChange={(e) => setContractData({...contractData, closing_date: e.target.value})}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="special_terms">Special Terms</Label>
                      <Textarea
                        id="special_terms"
                        value={contractData.special_terms}
                        onChange={(e) => setContractData({...contractData, special_terms: e.target.value})}
                        placeholder="Any special terms or conditions..."
                        rows={3}
                      />
                    </div>
                    
                    <Button 
                      onClick={handleCreateContract} 
                      className="w-full"
                      disabled={createContractMutation.isPending}
                    >
                      {createContractMutation.isPending ? 'Creating...' : 'Create Contract'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {contractsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="ml-2">Loading contracts...</span>
                </div>
              ) : contracts.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No contracts created yet. Start by creating your first contract!
                </p>
              ) : (
                <div className="space-y-4">
                  {contracts.map((contract) => (
                    <Card key={contract.id} className="border-l-4 border-l-blue-500">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold flex items-center gap-2">
                              {getStatusIcon(contract.status)}
                              {contract.title}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {contract.property_address}
                            </p>
                          </div>
                          <Badge className={getStatusColor(contract.status)}>
                            {contract.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                          <div>
                            <p className="text-muted-foreground">Purchase Price</p>
                            <p className="font-semibold">
                              ${contract.purchase_price?.toLocaleString() || 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Template</p>
                            <p className="font-semibold">
                              {contractTemplates.find(t => t.id === contract.template_type)?.name || contract.template_type}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Buyer</p>
                            <p className="font-semibold">{contract.buyer_name || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Created</p>
                            <p className="font-semibold">
                              {new Date(contract.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => updateStatusMutation.mutate({ 
                              id: contract.id, 
                              status: 'pending_signature' 
                            })}
                            disabled={contract.status === 'pending_signature'}
                          >
                            <Send className="h-4 w-4 mr-2" />
                            Send for Signature
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contract Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {contractTemplates.map((template) => (
                  <Card key={template.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <FileText className="h-8 w-8 text-blue-600 mt-1" />
                        <div className="flex-1">
                          <h3 className="font-semibold mb-2">{template.name}</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            {template.description}
                          </p>
                          <Button variant="outline" size="sm">
                            Use Template
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="signatures" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>E-Signature Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contracts.filter(c => c.status === 'pending_signature' || c.status === 'partially_signed').map((contract) => (
                  <Card key={contract.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-semibold">{contract.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            Sent to: {contract.buyer_email}, {contract.seller_email}
                          </p>
                        </div>
                        <Badge className={getStatusColor(contract.status)}>
                          {contract.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {contracts.filter(c => c.status === 'pending_signature' || c.status === 'partially_signed').length === 0 && (
                  <p className="text-muted-foreground text-center py-8">
                    No contracts pending signature
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Contract Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Completion Rate</span>
                    <span className="font-semibold">
                      {contracts.length > 0 
                        ? Math.round((contracts.filter(c => c.status === 'executed').length / contracts.length) * 100)
                        : 0}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Average Days to Execute</span>
                    <span className="font-semibold">12 days</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Most Used Template</span>
                    <span className="font-semibold">Purchase Agreement</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Party Engagement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Quick Signers</span>
                    <span className="font-semibold">85%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Email Open Rate</span>
                    <span className="font-semibold">92%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Document Views</span>
                    <span className="font-semibold">156</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
