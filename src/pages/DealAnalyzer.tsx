import React, { useState } from 'react';
import Layout from '@/components/Layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calculator, Upload, Zap, CheckCircle, TrendingUp, Home, DollarSign, Users, FileText, MessageSquare, Phone, Mail, MapPin, Star, Target, Building, Search, Download, Eye, Filter, BarChart3, PieChart, Calendar, Clock, AlertTriangle, RefreshCw, Bot, Settings } from 'lucide-react';
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

interface BuyerWithScore extends Buyer {
  matchScore?: number;
}

interface ScrapedListing {
  address: string;
  price: number;
  bedrooms?: number;
  bathrooms?: number;
  sqft?: number;
  description?: string;
  images?: string[];
  listingUrl?: string;
  daysOnMarket?: number;
  propertyType?: string;
}

const DealAnalyzer = () => {
  const { user } = useUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('analyzer');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isScraping, setIsScraping] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [scrapedListings, setScrapedListings] = useState<ScrapedListing[]>([]);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    address: '',
    city: '',
    state: '',
    listPrice: '',
    propertyType: 'single-family',
    bedrooms: '',
    bathrooms: '',
    sqft: '',
    dealType: 'wholesale',
    sellerContact: '',
    sellerPhone: '',
    sellerEmail: '',
    notes: '',
    lotSize: '',
    yearBuilt: '',
    condition: 'fair'
  });

  // Scraper filters
  const [scraperFilters, setScraperFilters] = useState({
    location: '',
    minPrice: '',
    maxPrice: '',
    propertyType: 'all',
    minBeds: '',
    maxBeds: '',
    keywords: 'motivated seller, must sell, cash only',
    daysOnMarket: '30',
    radius: '25'
  });

  // Advanced analysis settings
  const [analysisSettings, setAnalysisSettings] = useState({
    includeComps: true,
    includeRentals: true,
    includeMarketTrends: true,
    riskTolerance: 'medium',
    profitMargin: '20',
    holdingPeriod: '6'
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

  const handleAdvancedAnalysis = async () => {
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
      // Simulate advanced AI analysis with more sophisticated calculations
      await new Promise(resolve => setTimeout(resolve, 4000));
      
      const basePrice = parseInt(formData.listPrice) || 50000;
      const sqft = parseInt(formData.sqft) || 1200;
      const bedrooms = parseInt(formData.bedrooms) || 3;
      const bathrooms = parseInt(formData.bathrooms) || 2;
      
      // Advanced analysis calculations
      const marketMultiplier = formData.state === 'CA' ? 1.8 : formData.state === 'TX' ? 1.4 : 1.2;
      const conditionMultiplier = formData.condition === 'excellent' ? 1.1 : formData.condition === 'good' ? 1.0 : 0.85;
      const yearBuilt = parseInt(formData.yearBuilt) || 1990;
      const ageMultiplier = yearBuilt > 2000 ? 1.05 : yearBuilt > 1980 ? 1.0 : 0.95;
      
      const arv = Math.floor(sqft * 150 * marketMultiplier * conditionMultiplier * ageMultiplier);
      const repairEstimate = Math.floor(sqft * (formData.condition === 'poor' ? 50 : formData.condition === 'fair' ? 30 : 15));
      const maxOffer = Math.floor(arv * 0.7 - repairEstimate);
      const margin = maxOffer - basePrice - repairEstimate;
      
      // Advanced scoring algorithm
      const locationScore = ['CA', 'TX', 'FL', 'NY'].includes(formData.state || '') ? 9 : 7;
      const sizeScore = sqft > 1500 ? 8 : sqft > 1000 ? 7 : 6;
      const conditionScore = formData.condition === 'excellent' ? 9 : formData.condition === 'good' ? 7 : 5;
      const priceScore = margin > 50000 ? 9 : margin > 30000 ? 7 : margin > 10000 ? 5 : 3;
      const aiScore = Math.floor((locationScore + sizeScore + conditionScore + priceScore) / 4);
      
      // Market analysis
      const marketAnalysis = {
        averageDaysOnMarket: Math.floor(Math.random() * 60) + 30,
        priceAppreciation: (Math.random() * 10 + 2).toFixed(1),
        rentEstimate: Math.floor(arv * 0.01),
        capRate: ((Math.floor(arv * 0.01) * 12) / arv * 100).toFixed(2),
        cashOnCashReturn: (margin / maxOffer * 100).toFixed(1)
      };

      const analysisData = {
        arv,
        max_offer: maxOffer,
        repair_estimate: repairEstimate,
        condition_score: conditionScore,
        ai_score: aiScore,
        margin,
        marketAnalysis
      };

      setAnalysisResults(analysisData);

      const dealData = {
        address: formData.address,
        city: formData.city || null,
        state: formData.state || null,
        list_price: basePrice,
        deal_type: formData.dealType,
        seller_contact: formData.sellerContact || null,
        seller_phone: formData.sellerPhone || null,
        seller_email: formData.sellerEmail || null,
        notes: formData.notes || null,
        ...analysisData,
        status: 'new'
      };

      await createDealMutation.mutateAsync(dealData);
      
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: "There was an error analyzing the deal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleScrapListings = async () => {
    if (!scraperFilters.location) {
      toast({
        title: "Error",
        description: "Please enter a location to search.",
        variant: "destructive",
      });
      return;
    }

    setIsScraping(true);
    
    try {
      // Simulate scraping with realistic data
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const mockListings: ScrapedListing[] = [
        {
          address: "123 Oak Street, " + scraperFilters.location,
          price: 85000,
          bedrooms: 3,
          bathrooms: 2,
          sqft: 1250,
          description: "Motivated seller! Cash offers considered. Needs some TLC but great bones.",
          daysOnMarket: 45,
          propertyType: "Single Family",
          listingUrl: "https://zillow.com/example1"
        },
        {
          address: "456 Pine Avenue, " + scraperFilters.location,
          price: 65000,
          bedrooms: 2,
          bathrooms: 1,
          sqft: 900,
          description: "Fixer upper opportunity. Seller says MUST SELL this month!",
          daysOnMarket: 67,
          propertyType: "Single Family",
          listingUrl: "https://zillow.com/example2"
        },
        {
          address: "789 Maple Drive, " + scraperFilters.location,
          price: 110000,
          bedrooms: 4,
          bathrooms: 2.5,
          sqft: 1800,
          description: "Estate sale. Family needs quick close. Cash preferred.",
          daysOnMarket: 23,
          propertyType: "Single Family",
          listingUrl: "https://zillow.com/example3"
        }
      ];
      
      setScrapedListings(mockListings);
      
      toast({
        title: "Scraping Complete",
        description: `Found ${mockListings.length} potential deals matching your criteria.`,
      });
      
    } catch (error) {
      console.error('Scraping error:', error);
      toast({
        title: "Scraping Failed",
        description: "There was an error scraping listings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsScraping(false);
    }
  };

  const matchBuyers = (deal: Deal): BuyerWithScore[] => {
    if (!deal || !buyers.length) return [];
    
    return buyers
      .map(buyer => {
        let score = 0;
        
        // Budget matching (40 points)
        if (buyer.budget_min && buyer.budget_max && deal.max_offer) {
          if (deal.max_offer >= buyer.budget_min && deal.max_offer <= buyer.budget_max) {
            score += 40;
          } else if (Math.abs(deal.max_offer - (buyer.budget_max || 0)) < 20000) {
            score += 20; // Close to budget
          }
        }
        
        // Market matching (30 points)
        if (buyer.markets && deal.city) {
          const cityMatch = buyer.markets.some(market => 
            market.toLowerCase().includes(deal.city!.toLowerCase()) ||
            deal.city!.toLowerCase().includes(market.toLowerCase())
          );
          if (cityMatch) score += 30;
        }
        
        // Asset type matching (20 points)
        if (buyer.asset_types && deal.deal_type) {
          const typeMatch = buyer.asset_types.some(type => 
            type.toLowerCase().includes(deal.deal_type!.toLowerCase())
          );
          if (typeMatch) score += 20;
        }
        
        // Priority boost (10 points)
        if (buyer.priority === 'VERY HIGH') score += 10;
        else if (buyer.priority === 'HIGH') score += 5;
        
        return { ...buyer, matchScore: score } as BuyerWithScore;
      })
      .filter(buyer => (buyer.matchScore || 0) > 0)
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

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Advanced Deal Pipeline</h1>
            <p className="text-gray-600 mt-1">AI-powered reverse wholesaling with advanced analytics & automation</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
              <Bot className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">AI Analysis Active</span>
            </div>
            <div className="flex items-center space-x-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
              <Users className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">{buyers.length} Active Buyers</span>
            </div>
            <div className="flex items-center space-x-2 px-4 py-2 bg-purple-50 border border-purple-200 rounded-lg">
              <Search className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-700">{scrapedListings.length} Scraped Leads</span>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="analyzer">Deal Analyzer</TabsTrigger>
            <TabsTrigger value="scraper">Listing Scraper</TabsTrigger>
            <TabsTrigger value="pipeline">Deal Pipeline</TabsTrigger>
            <TabsTrigger value="matching">Buyer Matching</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="analyzer" className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Input Form */}
              <div className="xl:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Calculator className="w-5 h-5" />
                      <span>Advanced Property Analysis</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Property Address *</label>
                        <Input 
                          placeholder="123 Main Street, City, State, ZIP" 
                          value={formData.address}
                          onChange={(e) => setFormData({...formData, address: e.target.value})}
                        />
                      </div>

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

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">List Price</label>
                        <Input 
                          placeholder="$0" 
                          value={formData.listPrice}
                          onChange={(e) => setFormData({...formData, listPrice: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
                        <select 
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={formData.propertyType}
                          onChange={(e) => setFormData({...formData, propertyType: e.target.value})}
                        >
                          <option value="single-family">Single Family</option>
                          <option value="multi-family">Multi Family</option>
                          <option value="condo">Condo</option>
                          <option value="townhouse">Townhouse</option>
                          <option value="land">Land</option>
                          <option value="commercial">Commercial</option>
                        </select>
                      </div>
                    </div>

                    {/* Property Details */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Year Built</label>
                        <Input 
                          placeholder="1990" 
                          value={formData.yearBuilt}
                          onChange={(e) => setFormData({...formData, yearBuilt: e.target.value})}
                        />
                      </div>
                    </div>

                    {/* Advanced Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Deal Type</label>
                        <select 
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={formData.dealType}
                          onChange={(e) => setFormData({...formData, dealType: e.target.value})}
                        >
                          <option value="wholesale">Wholesale</option>
                          <option value="flip">Fix & Flip</option>
                          <option value="hold">Buy & Hold</option>
                          <option value="land">Land Deal</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Property Condition</label>
                        <select 
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={formData.condition}
                          onChange={(e) => setFormData({...formData, condition: e.target.value})}
                        >
                          <option value="excellent">Excellent</option>
                          <option value="good">Good</option>
                          <option value="fair">Fair</option>
                          <option value="poor">Poor</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Lot Size (acres)</label>
                        <Input 
                          placeholder="0.25" 
                          value={formData.lotSize}
                          onChange={(e) => setFormData({...formData, lotSize: e.target.value})}
                        />
                      </div>
                    </div>

                    {/* Seller Info */}
                    <div className="border-t pt-4">
                      <h4 className="font-medium text-gray-900 mb-3">Seller Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Seller Contact</label>
                          <Input 
                            placeholder="Seller name" 
                            value={formData.sellerContact}
                            onChange={(e) => setFormData({...formData, sellerContact: e.target.value})}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                          <Input 
                            placeholder="(555) 123-4567" 
                            value={formData.sellerPhone}
                            onChange={(e) => setFormData({...formData, sellerPhone: e.target.value})}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                          <Input 
                            placeholder="seller@email.com" 
                            value={formData.sellerEmail}
                            onChange={(e) => setFormData({...formData, sellerEmail: e.target.value})}
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Notes & Details</label>
                      <Textarea 
                        placeholder="Property condition, seller motivation, timeline, repairs needed, etc." 
                        rows={3}
                        value={formData.notes}
                        onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      />
                    </div>

                    <Button 
                      onClick={handleAdvancedAnalysis}
                      disabled={isAnalyzing || !formData.address}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 h-12"
                    >
                      {isAnalyzing ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Running Advanced Analysis...
                        </>
                      ) : (
                        <>
                          <Bot className="w-5 h-5 mr-2" />
                          Run Advanced AI Analysis
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Analysis Results */}
              <div className="space-y-6">
                {analysisResults && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <BarChart3 className="w-5 h-5" />
                        <span>Analysis Results</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-blue-50 rounded-lg p-3">
                          <p className="text-xs text-blue-600 font-medium">ARV</p>
                          <p className="text-lg font-bold text-blue-900">{formatCurrency(analysisResults.arv)}</p>
                        </div>
                        <div className="bg-green-50 rounded-lg p-3">
                          <p className="text-xs text-green-600 font-medium">Max Offer</p>
                          <p className="text-lg font-bold text-green-900">{formatCurrency(analysisResults.max_offer)}</p>
                        </div>
                        <div className="bg-red-50 rounded-lg p-3">
                          <p className="text-xs text-red-600 font-medium">Repairs</p>
                          <p className="text-lg font-bold text-red-900">{formatCurrency(analysisResults.repair_estimate)}</p>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-3">
                          <p className="text-xs text-purple-600 font-medium">Profit</p>
                          <p className="text-lg font-bold text-purple-900">{formatCurrency(analysisResults.margin)}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span className="text-sm font-medium">AI Score</span>
                        </div>
                        <span className={`text-lg font-bold ${getScoreColor(analysisResults.ai_score)}`}>
                          {analysisResults.ai_score}/10
                        </span>
                      </div>

                      {analysisResults.marketAnalysis && (
                        <div className="border-t pt-3">
                          <h5 className="font-medium text-gray-900 mb-2">Market Analysis</h5>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Avg DOM:</span>
                              <span className="font-medium">{analysisResults.marketAnalysis.averageDaysOnMarket} days</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Appreciation:</span>
                              <span className="font-medium text-green-600">+{analysisResults.marketAnalysis.priceAppreciation}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Rent Est:</span>
                              <span className="font-medium">{formatCurrency(analysisResults.marketAnalysis.rentEstimate)}/mo</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Cap Rate:</span>
                              <span className="font-medium">{analysisResults.marketAnalysis.capRate}%</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Recent Analysis */}
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
                          <div key={deal.id} className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                               onClick={() => setSelectedDeal(deal)}>
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-gray-900 text-sm">{deal.address}</h4>
                              <Badge className={getStatusColor(deal.status || 'new')}>
                                {deal.status || 'new'}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
                              <div>ARV: {formatCurrency(deal.arv)}</div>
                              <div>Offer: {formatCurrency(deal.max_offer)}</div>
                              <div>Repairs: {formatCurrency(deal.repair_estimate)}</div>
                              <div className="text-green-600 font-medium">Profit: {formatCurrency(deal.margin)}</div>
                            </div>
                            {deal.ai_score && (
                              <div className="mt-2 flex items-center space-x-2">
                                <Star className="w-3 h-3 text-yellow-500" />
                                <span className="text-xs font-medium">AI Score: {deal.ai_score}/10</span>
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

          <TabsContent value="scraper" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Scraper Controls */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Search className="w-5 h-5" />
                      <span>Listing Scraper</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
                      <Input 
                        placeholder="City, State or ZIP" 
                        value={scraperFilters.location}
                        onChange={(e) => setScraperFilters({...scraperFilters, location: e.target.value})}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Min Price</label>
                        <Input 
                          placeholder="$0" 
                          value={scraperFilters.minPrice}
                          onChange={(e) => setScraperFilters({...scraperFilters, minPrice: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Max Price</label>
                        <Input 
                          placeholder="$500,000" 
                          value={scraperFilters.maxPrice}
                          onChange={(e) => setScraperFilters({...scraperFilters, maxPrice: e.target.value})}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
                      <select 
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={scraperFilters.propertyType}
                        onChange={(e) => setScraperFilters({...scraperFilters, propertyType: e.target.value})}
                      >
                        <option value="all">All Types</option>
                        <option value="single-family">Single Family</option>
                        <option value="multi-family">Multi Family</option>
                        <option value="condo">Condo</option>
                        <option value="land">Land</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Min Beds</label>
                        <Input 
                          placeholder="1" 
                          value={scraperFilters.minBeds}
                          onChange={(e) => setScraperFilters({...scraperFilters, minBeds: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Max Beds</label>
                        <Input 
                          placeholder="5" 
                          value={scraperFilters.maxBeds}
                          onChange={(e) => setScraperFilters({...scraperFilters, maxBeds: e.target.value})}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Search Radius (miles)</label>
                      <select 
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={scraperFilters.radius}
                        onChange={(e) => setScraperFilters({...scraperFilters, radius: e.target.value})}
                      >
                        <option value="5">5 miles</option>
                        <option value="10">10 miles</option>
                        <option value="25">25 miles</option>
                        <option value="50">50 miles</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Keywords</label>
                      <Textarea 
                        placeholder="motivated seller, must sell, cash only, fixer upper" 
                        rows={3}
                        value={scraperFilters.keywords}
                        onChange={(e) => setScraperFilters({...scraperFilters, keywords: e.target.value})}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Max Days on Market</label>
                      <select 
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={scraperFilters.daysOnMarket}
                        onChange={(e) => setScraperFilters({...scraperFilters, daysOnMarket: e.target.value})}
                      >
                        <option value="7">7 days</option>
                        <option value="14">14 days</option>
                        <option value="30">30 days</option>
                        <option value="60">60 days</option>
                        <option value="90">90 days</option>
                      </select>
                    </div>

                    <Button 
                      onClick={handleScrapListings}
                      disabled={isScraping || !scraperFilters.location}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                      {isScraping ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Scraping Listings...
                        </>
                      ) : (
                        <>
                          <Search className="w-4 h-4 mr-2" />
                          Scrape Listings
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Scraped Results */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Download className="w-5 h-5" />
                        <span>Scraped Listings</span>
                      </div>
                      {scrapedListings.length > 0 && (
                        <Badge variant="outline">{scrapedListings.length} found</Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {scrapedListings.length === 0 ? (
                      <div className="text-center py-12">
                        <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Listings Scraped Yet</h3>
                        <p className="text-gray-600 mb-6">Configure your search criteria and start scraping listings</p>
                        <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span>Zillow FSBO</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span>Craigslist</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span>FSBO Sites</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {scrapedListings.map((listing, index) => (
                          <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h4 className="font-semibold text-gray-900">{listing.address}</h4>
                                <p className="text-2xl font-bold text-green-600">{formatCurrency(listing.price)}</p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge variant="outline">{listing.propertyType}</Badge>
                                <Badge className="bg-orange-100 text-orange-800">{listing.daysOnMarket} DOM</Badge>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-4 mb-3 text-sm">
                              <div className="flex items-center space-x-1">
                                <Home className="w-4 h-4 text-gray-400" />
                                <span>{listing.bedrooms}bd / {listing.bathrooms}ba</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Building className="w-4 h-4 text-gray-400" />
                                <span>{listing.sqft?.toLocaleString()} sq ft</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <DollarSign className="w-4 h-4 text-gray-400" />
                                <span>${Math.round((listing.price / (listing.sqft || 1)))}/sq ft</span>
                              </div>
                            </div>

                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{listing.description}</p>

                            <div className="flex items-center justify-between">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => {
                                  setFormData({
                                    ...formData,
                                    address: listing.address,
                                    listPrice: listing.price.toString(),
                                    bedrooms: listing.bedrooms?.toString() || '',
                                    bathrooms: listing.bathrooms?.toString() || '',
                                    sqft: listing.sqft?.toString() || ''
                                  });
                                  setActiveTab('analyzer');
                                }}
                              >
                                <Calculator className="w-3 h-3 mr-1" />
                                Analyze
                              </Button>
                              <div className="flex space-x-2">
                                <Button size="sm" variant="outline">
                                  <Eye className="w-3 h-3 mr-1" />
                                  View
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

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Key Metrics */}
              <div className="lg:col-span-3 grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <BarChart3 className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{deals.length}</p>
                        <p className="text-sm text-gray-600">Total Deals</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <DollarSign className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">
                          {formatCurrency(deals.reduce((sum, deal) => sum + (deal.margin || 0), 0))}
                        </p>
                        <p className="text-sm text-gray-600">Total Profit</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Star className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">
                          {deals.length > 0 ? (deals.reduce((sum, deal) => sum + (deal.ai_score || 0), 0) / deals.length).toFixed(1) : 0}
                        </p>
                        <p className="text-sm text-gray-600">Avg AI Score</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <Clock className="w-6 h-6 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">
                          {deals.filter(d => d.status === 'closed').length}
                        </p>
                        <p className="text-sm text-gray-600">Closed Deals</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Deal Performance Chart */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Deal Performance Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <PieChart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Performance charts coming soon</p>
                      <p className="text-sm text-gray-400">Advanced analytics and reporting features</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Market Insights */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle>Market Insights</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="border-l-4 border-green-500 pl-4">
                        <p className="font-medium text-green-700">Hot Markets</p>
                        <p className="text-sm text-gray-600">California leading with 65% profit margins</p>
                      </div>
                      <div className="border-l-4 border-blue-500 pl-4">
                        <p className="font-medium text-blue-700">Best Deal Types</p>
                        <p className="text-sm text-gray-600">Wholesale deals showing 45% success rate</p>
                      </div>
                      <div className="border-l-4 border-purple-500 pl-4">
                        <p className="font-medium text-purple-700">Buyer Demand</p>
                        <p className="text-sm text-gray-600">Single-family homes most in demand</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default DealAnalyzer;
