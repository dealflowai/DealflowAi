
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PropertyScraper } from '@/components/PropertyScraper';
import { DealAnalysis } from '@/components/DealAnalysis';
import { useUserSync } from '@/hooks/useUserSync';
import { useProfileData } from '@/hooks/useProfileData';
import { useToast } from '@/hooks/use-toast';
import { 
  Home, 
  TrendingUp, 
  Users, 
  DollarSign,
  Calendar,
  MapPin,
  Phone,
  Mail
} from 'lucide-react';

interface Property {
  id: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  propertyType: string;
  daysOnMarket: number;
  images: string[];
  description: string;
  listingUrl: string;
}

export default function DealAnalyzer() {
  useUserSync();
  const { data: profile } = useProfileData();
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [activeTab, setActiveTab] = useState('scraper');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch deals
  const { data: deals = [], isLoading: dealsLoading } = useQuery({
    queryKey: ['deals', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      
      const { data, error } = await supabase
        .from('deals')
        .select('*')
        .eq('owner_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!profile?.id,
  });

  // Fetch buyers
  const { data: buyers = [] } = useQuery({
    queryKey: ['buyers', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      
      const { data, error } = await supabase
        .from('buyers')
        .select('*')
        .eq('owner_id', profile.id)
        .eq('status', 'active');

      if (error) throw error;
      return data;
    },
    enabled: !!profile?.id,
  });

  // Save deal mutation
  const saveDealMutation = useMutation({
    mutationFn: async (dealData: any) => {
      if (!profile?.id) throw new Error('No profile found');
      
      const { data, error } = await supabase
        .from('deals')
        .insert({ ...dealData, owner_id: profile.id });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      setActiveTab('pipeline');
    },
  });

  const handlePropertySelect = (property: Property) => {
    setSelectedProperty(property);
    setActiveTab('analysis');
  };

  const handleSaveDeal = (dealData: any) => {
    saveDealMutation.mutate(dealData);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'contacted': return 'bg-yellow-100 text-yellow-800';
      case 'offer_sent': return 'bg-purple-100 text-purple-800';
      case 'contracted': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-emerald-100 text-emerald-800';
      case 'dead': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Loading your profile...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Deal Analyzer</h1>
        <p className="text-muted-foreground">Find, analyze, and manage wholesale deals</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Home className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{deals.length}</p>
                <p className="text-xs text-muted-foreground">Total Deals</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">
                  {deals.filter(d => d.status === 'contracted').length}
                </p>
                <p className="text-xs text-muted-foreground">Under Contract</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{buyers.length}</p>
                <p className="text-xs text-muted-foreground">Active Buyers</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-8 w-8 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">
                  ${deals.reduce((sum, deal) => sum + (deal.margin || 0), 0).toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">Total Projected Profit</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="scraper">Property Search</TabsTrigger>
          <TabsTrigger value="analysis">Deal Analysis</TabsTrigger>
          <TabsTrigger value="pipeline">Deal Pipeline</TabsTrigger>
        </TabsList>
        
        <TabsContent value="scraper" className="space-y-6">
          <PropertyScraper onPropertySelect={handlePropertySelect} />
        </TabsContent>
        
        <TabsContent value="analysis" className="space-y-6">
          {selectedProperty ? (
            <DealAnalysis 
              property={selectedProperty} 
              onSaveDeal={handleSaveDeal}
            />
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">
                  Select a property from the search tab to analyze
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="pipeline" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Deal Pipeline</CardTitle>
            </CardHeader>
            <CardContent>
              {dealsLoading ? (
                <p>Loading deals...</p>
              ) : deals.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No deals in your pipeline yet. Start by searching for properties!
                </p>
              ) : (
                <div className="space-y-4">
                  {deals.map((deal) => (
                    <Card key={deal.id} className="border-l-4 border-l-blue-500">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              {deal.address}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {deal.city}, {deal.state}
                            </p>
                          </div>
                          <Badge className={getStatusColor(deal.status || 'new')}>
                            {deal.status || 'new'}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">List Price</p>
                            <p className="font-semibold">
                              ${deal.list_price?.toLocaleString() || 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Max Offer</p>
                            <p className="font-semibold">
                              ${deal.max_offer?.toLocaleString() || 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Profit</p>
                            <p className="font-semibold text-green-600">
                              ${deal.margin?.toLocaleString() || 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">AI Score</p>
                            <p className="font-semibold">
                              {deal.ai_score || 'N/A'}/10
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          Added {new Date(deal.created_at).toLocaleDateString()}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
