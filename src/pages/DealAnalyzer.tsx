
import React, { useState } from 'react';
import Layout from '@/components/Layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calculator, Upload, Zap, CheckCircle, TrendingUp, Home, DollarSign, Users, FileText, MessageSquare, Phone, Mail, MapPin, Star, Target, Building } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@clerk/clerk-react';
import { useToast } from '@/hooks/use-toast';

interface Deal {
  id: string;
  address: string;
  city: string | null;
  state: string | null;
  list_price: number | null;
  arv: number | null;
  max_offer: number | null;
  condition_score: number | null;
  ai_score: number | null;
  repair_estimate: number | null;
  margin: number | null;
  status: string | null;
  deal_type: string | null;
  top_buyer_ids: string[] | null;
  seller_contact: string | null;
  seller_phone: string | null;
  seller_email: string | null;
  created_at: string | null;
}

interface Buyer {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  markets: string[] | null;
  budget_min: number | null;
  budget_max: number | null;
  asset_types: string[] | null;
  status: string | null;
  priority: string | null;
}

const DealAnalyzer = () => {
  const { user } = useUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('analyzer');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    address: '',
    city: '',
    state: '',
    listPrice: '',
    propertyType: '',
    bedrooms: '',
    bathrooms: '',
    sqft: '',
    dealType: 'wholesale',
    sellerContact: '',
    sellerPhone: '',
    sellerEmail: '',
    notes: ''
  });

  // Fetch deals
  const { data: deals = [], isLoading: dealsLoading } = useQuery({
    queryKey: ['deals', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('deals')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching deals:', error);
        return [];
      }
      
      return data as Deal[];
    },
    enabled: !!user?.id,
  });

  // Fetch buyers for matching
  const { data: buyers = [] } = useQuery({
    queryKey: ['buyers', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('buyers')
        .select('*')
        .eq('owner_id', user.id)
        .eq('status', 'active');
      
      if (error) {
        console.error('Error fetching buyers:', error);
        return [];
      }
      
      return data as Buyer[];
    },
    enabled: !!user?.id,
  });

  // Create deal mutation
  const createDealMutation = useMutation({
    mutationFn: async (dealData: any) => {
      const { data, error } = await supabase
        .from('deals')
        .insert({
          ...dealData,
          owner_id: user?.id
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      toast({
        title: "Deal Created",
        description: "Your deal has been analyzed and saved successfully.",
      });
    },
    onError: (error) => {
      console.error('Error creating deal:', error);
      toast({
        title: "Error",
        description: "Failed to create deal. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleAnalyze = async () => {
    if (!formData.address || !user?.id) {
      toast({
        title: "Error",
        description: "Please enter a property address.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    
    try {
      // Simulate AI analysis with realistic data
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const mockAnalysis = {
        arv: 185000,
        max_offer: parseInt(formData.listPrice) ? Math.floor(parseInt(formData.listPrice) * 0.65) : 45000,
        repair_estimate: 35000,
        condition_score: Math.floor(Math.random() * 10) + 1,
        ai_score: Math.floor(Math.random() * 10) + 1,
        margin: 0,
      };
      
      mockAnalysis.margin = mockAnalysis.arv - mockAnalysis.max_offer - mockAnalysis.repair_estimate;

      const dealData = {
        address: formData.address,
        city: formData.city || null,
        state: formData.state || null,
        list_price: formData.listPrice ? parseInt(formData.listPrice) : null,
        deal_type: formData.dealType,
        seller_contact: formData.sellerContact || null,
        seller_phone: formData.sellerPhone || null,
        seller_email: formData.sellerEmail || null,
        notes: formData.notes || null,
        ...mockAnalysis,
        status: 'new'
      };

      await createDealMutation.mutateAsync(dealData);
      
      // Reset form
      setFormData({
        address: '',
        city: '',
        state: '',
        listPrice: '',
        propertyType: '',
        bedrooms: '',
        bathrooms: '',
        sqft: '',
        dealType: 'wholesale',
        sellerContact: '',
        sellerPhone: '',
        sellerEmail: '',
        notes: ''
      });
      
    } catch (error) {
      console.error('Analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const matchBuyers = (deal: Deal): Buyer[] => {
    if (!deal || !buyers.length) return [];
    
    return buyers
      .map(buyer => {
        let score = 0;
        
        // Budget matching
        if (buyer.budget_min && buyer.budget_max && deal.max_offer) {
          if (deal.max_offer >= buyer.budget_min && deal.max_offer <= buyer.budget_max) {
            score += 40;
          }
        }
        
        // Market matching
        if (buyer.markets && deal.city) {
          const cityMatch = buyer.markets.some(market => 
            market.toLowerCase().includes(deal.city!.toLowerCase()) ||
            deal.city!.toLowerCase().includes(market.toLowerCase())
          );
          if (cityMatch) score += 30;
        }
        
        // Asset type matching
        if (buyer.asset_types && deal.deal_type) {
          const typeMatch = buyer.asset_types.some(type => 
            type.toLowerCase().includes(deal.deal_type!.toLowerCase())
          );
          if (typeMatch) score += 20;
        }
        
        // Priority boost
        if (buyer.priority === 'VERY HIGH') score += 10;
        else if (buyer.priority === 'HIGH') score += 5;
        
        return { ...buyer, matchScore: score };
      })
      .filter(buyer => buyer.matchScore > 0)
      .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
      .slice(0, 5);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'contacted': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'offer_sent': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'contracted': return 'bg-green-100 text-green-800 border-green-200';
      case 'closed': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'dead': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatCurrency = (amount: number | null) => {
    if (!amount) return '$0';
    return `$${amount.toLocaleString()}`;
  };

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Deal Pipeline</h1>
            <p className="text-gray-600 mt-1">Reverse wholesaling pipeline with AI-powered analysis</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
              <Zap className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">AI Analysis Active</span>
            </div>
            <div className="flex items-center space-x-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
              <Users className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">{buyers.length} Active Buyers</span>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="analyzer">Deal Analyzer</TabsTrigger>
            <TabsTrigger value="pipeline">Deal Pipeline</TabsTrigger>
            <TabsTrigger value="matching">Buyer Matching</TabsTrigger>
          </TabsList>

          <TabsContent value="analyzer" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Input Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calculator className="w-5 h-5" />
                    <span>Property Analysis</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Property Address *</label>
                    <Input 
                      placeholder="123 Main Street, City, State, ZIP" 
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                      <Input 
                        placeholder="City" 
                        value={formData.city}
                        onChange={(e) => setFormData({...formData, city: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                      <Input 
                        placeholder="State" 
                        value={formData.state}
                        onChange={(e) => setFormData({...formData, state: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">List Price</label>
                      <Input 
                        placeholder="$0" 
                        value={formData.listPrice}
                        onChange={(e) => setFormData({...formData, listPrice: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Deal Type</label>
                      <select 
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={formData.dealType}
                        onChange={(e) => setFormData({...formData, dealType: e.target.value})}
                      >
                        <option value="wholesale">Wholesale</option>
                        <option value="flip">Flip</option>
                        <option value="hold">Hold</option>
                        <option value="land">Land</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Bedrooms</label>
                      <Input 
                        placeholder="0" 
                        value={formData.bedrooms}
                        onChange={(e) => setFormData({...formData, bedrooms: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Bathrooms</label>
                      <Input 
                        placeholder="0" 
                        value={formData.bathrooms}
                        onChange={(e) => setFormData({...formData, bathrooms: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Sq Ft</label>
                      <Input 
                        placeholder="0" 
                        value={formData.sqft}
                        onChange={(e) => setFormData({...formData, sqft: e.target.value})}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Seller Contact</label>
                    <Input 
                      placeholder="Seller name" 
                      value={formData.sellerContact}
                      onChange={(e) => setFormData({...formData, sellerContact: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Seller Phone</label>
                      <Input 
                        placeholder="(555) 123-4567" 
                        value={formData.sellerPhone}
                        onChange={(e) => setFormData({...formData, sellerPhone: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Seller Email</label>
                      <Input 
                        placeholder="seller@email.com" 
                        value={formData.sellerEmail}
                        onChange={(e) => setFormData({...formData, sellerEmail: e.target.value})}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                    <Textarea 
                      placeholder="Property condition, motivation, timeline, etc." 
                      rows={3}
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    />
                  </div>

                  <Button 
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || !formData.address}
                    className="w-full bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
                  >
                    {isAnalyzing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Calculator className="w-4 h-4 mr-2" />
                        Analyze Deal
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Analysis Results */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Analyses</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {deals.length === 0 ? (
                      <div className="text-center py-8">
                        <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">No deals analyzed yet</p>
                        <p className="text-sm text-gray-400">Enter property details to get started</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {deals.slice(0, 3).map((deal) => (
                          <div key={deal.id} className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                               onClick={() => setSelectedDeal(deal)}>
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-gray-900">{deal.address}</h4>
                              <Badge className={getStatusColor(deal.status || 'new')}>
                                {deal.status || 'new'}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                              <div>ARV: {formatCurrency(deal.arv)}</div>
                              <div>Max Offer: {formatCurrency(deal.max_offer)}</div>
                              <div>Repairs: {formatCurrency(deal.repair_estimate)}</div>
                              <div>Margin: {formatCurrency(deal.margin)}</div>
                            </div>
                            {deal.ai_score && (
                              <div className="mt-2 flex items-center space-x-2">
                                <Star className="w-4 h-4 text-yellow-500" />
                                <span className="text-sm font-medium">AI Score: {deal.ai_score}/10</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="pipeline" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Pipeline Stats */}
              <div className="lg:col-span-4 grid grid-cols-2 lg:grid-cols-6 gap-4">
                {[
                  { label: 'New', count: deals.filter(d => d.status === 'new').length, color: 'bg-blue-500' },
                  { label: 'Contacted', count: deals.filter(d => d.status === 'contacted').length, color: 'bg-yellow-500' },
                  { label: 'Offer Sent', count: deals.filter(d => d.status === 'offer_sent').length, color: 'bg-purple-500' },
                  { label: 'Contracted', count: deals.filter(d => d.status === 'contracted').length, color: 'bg-green-500' },
                  { label: 'Closed', count: deals.filter(d => d.status === 'closed').length, color: 'bg-emerald-500' },
                  { label: 'Dead', count: deals.filter(d => d.status === 'dead').length, color: 'bg-gray-500' },
                ].map((stat) => (
                  <Card key={stat.label}>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${stat.color}`}></div>
                        <div>
                          <p className="text-2xl font-bold text-gray-900">{stat.count}</p>
                          <p className="text-sm text-gray-600">{stat.label}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Deals List */}
              <div className="lg:col-span-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Deal Pipeline</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {deals.length === 0 ? (
                      <div className="text-center py-8">
                        <Building className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">No deals in pipeline</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {deals.map((deal) => (
                          <div key={deal.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h4 className="font-semibold text-gray-900">{deal.address}</h4>
                                <p className="text-sm text-gray-600">
                                  {deal.city && deal.state && `${deal.city}, ${deal.state}`}
                                </p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge className={getStatusColor(deal.status || 'new')}>
                                  {deal.status || 'new'}
                                </Badge>
                                {deal.deal_type && (
                                  <Badge variant="outline">{deal.deal_type}</Badge>
                                )}
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-3">
                              <div>
                                <p className="text-xs text-gray-500">List Price</p>
                                <p className="font-medium">{formatCurrency(deal.list_price)}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">ARV</p>
                                <p className="font-medium">{formatCurrency(deal.arv)}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Max Offer</p>
                                <p className="font-medium">{formatCurrency(deal.max_offer)}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Margin</p>
                                <p className="font-medium text-green-600">{formatCurrency(deal.margin)}</p>
                              </div>
                            </div>

                            {deal.ai_score && (
                              <div className="flex items-center space-x-4 mb-3">
                                <div className="flex items-center space-x-2">
                                  <Star className="w-4 h-4 text-yellow-500" />
                                  <span className="text-sm">AI Score: {deal.ai_score}/10</span>
                                </div>
                                {deal.condition_score && (
                                  <div className="flex items-center space-x-2">
                                    <Home className="w-4 h-4 text-blue-500" />
                                    <span className="text-sm">Condition: {deal.condition_score}/10</span>
                                  </div>
                                )}
                              </div>
                            )}

                            <div className="flex items-center justify-between">
                              <div className="text-xs text-gray-500">
                                {deal.created_at && new Date(deal.created_at).toLocaleDateString()}
                              </div>
                              <div className="flex space-x-2">
                                <Button size="sm" variant="outline">
                                  <FileText className="w-3 h-3 mr-1" />
                                  LOI
                                </Button>
                                <Button size="sm" variant="outline">
                                  <Users className="w-3 h-3 mr-1" />
                                  Match ({matchBuyers(deal).length})
                                </Button>
                                <Button size="sm" variant="outline">
                                  <MessageSquare className="w-3 h-3 mr-1" />
                                  Contact
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="matching" className="space-y-6">
            {selectedDeal ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Deal Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle>Deal Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold text-lg">{selectedDeal.address}</h3>
                        <p className="text-gray-600">{selectedDeal.city}, {selectedDeal.state}</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-sm text-gray-600">ARV</p>
                          <p className="text-xl font-bold">{formatCurrency(selectedDeal.arv)}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-sm text-gray-600">Max Offer</p>
                          <p className="text-xl font-bold">{formatCurrency(selectedDeal.max_offer)}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-sm text-gray-600">Repairs</p>
                          <p className="text-xl font-bold">{formatCurrency(selectedDeal.repair_estimate)}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-sm text-gray-600">Margin</p>
                          <p className="text-xl font-bold text-green-600">{formatCurrency(selectedDeal.margin)}</p>
                        </div>
                      </div>

                      <Button className="w-full" onClick={() => setSelectedDeal(null)}>
                        <Target className="w-4 h-4 mr-2" />
                        Find Different Deal
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Matched Buyers */}
                <Card>
                  <CardHeader>
                    <CardTitle>Top Buyer Matches</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {matchBuyers(selectedDeal).length === 0 ? (
                      <div className="text-center py-8">
                        <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">No matching buyers found</p>
                        <p className="text-sm text-gray-400">Try adding more active buyers to your CRM</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {matchBuyers(selectedDeal).map((buyer) => (
                          <div key={buyer.id} className="border rounded-lg p-4 hover:bg-gray-50">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h4 className="font-medium">{buyer.name || 'Unnamed Buyer'}</h4>
                                <p className="text-sm text-gray-600">{buyer.email}</p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                                  {buyer.matchScore}% Match
                                </div>
                                <Badge className="text-xs">
                                  {buyer.priority || 'MEDIUM'}
                                </Badge>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                              <div>Budget: {formatCurrency(buyer.budget_min)} - {formatCurrency(buyer.budget_max)}</div>
                              <div>Markets: {buyer.markets?.join(', ') || 'N/A'}</div>
                            </div>

                            <div className="flex space-x-2">
                              {buyer.phone && (
                                <Button size="sm" variant="outline">
                                  <Phone className="w-3 h-3 mr-1" />
                                  Call
                                </Button>
                              )}
                              {buyer.email && (
                                <Button size="sm" variant="outline">
                                  <Mail className="w-3 h-3 mr-1" />
                                  Email
                                </Button>
                              )}
                              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                <FileText className="w-3 h-3 mr-1" />
                                Send Deal
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Deal to Match Buyers</h3>
                  <p className="text-gray-600 mb-6">Choose a deal from the pipeline to see the best buyer matches</p>
                  <Button onClick={() => setActiveTab('pipeline')}>
                    View Deal Pipeline
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default DealAnalyzer;
