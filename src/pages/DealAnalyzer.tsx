import React, { useState } from 'react';
import Layout from '@/components/Layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PropwireDeals from '@/components/DealAnalyzer/PropwireDeals';
import { Calculator, Upload, Zap, CheckCircle, TrendingUp, Home, DollarSign, Users, FileText, MessageSquare, Phone, Mail, MapPin, Star, Target, Building, Search, Download, Eye, Filter, BarChart3, PieChart, Calendar, Clock, AlertTriangle, RefreshCw, Bot, Settings, Camera, Send, Mic, Video, Globe, TrendingDown, Activity, AlertCircle, Award, Briefcase, ChartLine, Database, FileCheck, HandHeart, Image, Link, Lock, MailIcon, MessageCircle, PlusCircle, ShieldCheck, Smartphone, Timer, User, Wallet, Wrench } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@clerk/clerk-react';
import { useToast } from '@/hooks/use-toast';
import { useTokens, TOKEN_COSTS } from '@/contexts/TokenContext';

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
  notes: string | null;
  loi_pdf_url: string | null;
  contract_pdf_url: string | null;
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
  sellerMotivation?: string;
  listingAgent?: string;
  photoAnalysis?: {
    condition: string;
    features: string[];
    repairNeeds: string[];
  };
}

interface MarketData {
  averagePrice: number;
  medianPrice: number;
  pricePerSqft: number;
  daysOnMarket: number;
  soldLastMonth: number;
  activeListings: number;
  priceAppreciation: number;
  rentEstimate: number;
  capRate: number;
  walkScore: number;
  crimeRating: string;
  schoolRating: number;
}

interface PropertyAnalysis {
  arv: number;
  max_offer: number;
  repair_estimate: number;
  condition_score: number;
  ai_score: number;
  margin: number;
  roi: number;
  profitability: string;
  riskLevel: string;
  marketAnalysis: MarketData;
  comps: any[];
  photoAnalysis?: {
    condition: string;
    features: string[];
    repairNeeds: string[];
    estimatedRepairCost: number;
  };
  marketTrends: {
    trend: string;
    recommendation: string;
    confidence: number;
  };
}

const DealAnalyzer = () => {
  const { user } = useUser();
  const { toast } = useToast();
  const { deductTokens } = useTokens();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('analyzer');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isScraping, setIsScraping] = useState(false);
  const [isGeneratingLOI, setIsGeneratingLOI] = useState(false);
  const [isAnalyzingPhotos, setIsAnalyzingPhotos] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [scrapedListings, setScrapedListings] = useState<ScrapedListing[]>([]);
  const [analysisResults, setAnalysisResults] = useState<PropertyAnalysis | null>(null);
  const [uploadedPhotos, setUploadedPhotos] = useState<File[]>([]);
  
  // Enhanced form state with more fields
  const [formData, setFormData] = useState({
    address: '',
    city: '',
    state: '',
    zipCode: '',
    listPrice: '',
    propertyType: 'single-family',
    bedrooms: '',
    bathrooms: '',
    sqft: '',
    lotSize: '',
    yearBuilt: '',
    condition: 'fair',
    dealType: 'wholesale',
    sellerContact: '',
    sellerPhone: '',
    sellerEmail: '',
    sellerMotivation: '',
    timeframe: '',
    notes: '',
    photos: [] as File[],
    basement: false,
    garage: false,
    pool: false,
    fireplace: false,
    hvacAge: '',
    roofAge: '',
    foundationIssues: false,
    electricalUpdated: false,
    plumbingUpdated: false
  });

  // Advanced scraper filters
  const [scraperFilters, setScraperFilters] = useState({
    location: '',
    minPrice: '',
    maxPrice: '',
    propertyType: 'all',
    minBeds: '',
    maxBeds: '',
    keywords: 'motivated seller, must sell, cash only, fixer upper, handyman special, as-is',
    daysOnMarket: '30',
    radius: '25',
    includeForeclosures: true,
    includeAuctions: true,
    includeFSBO: true,
    includeInvestorKeywords: true,
    priceReductionOnly: false,
    ownerOccupied: false,
    distressedProperties: true
  });

  // Advanced analysis settings
  const [analysisSettings, setAnalysisSettings] = useState({
    includeComps: true,
    includeRentals: true,
    includeMarketTrends: true,
    includePhotoAnalysis: true,
    riskTolerance: 'medium',
    profitMargin: '20',
    holdingPeriod: '6',
    includeNeighborhoodData: true,
    includeSchoolData: true,
    includeCrimeData: true,
    rehabbingExperience: 'intermediate',
    financingType: 'cash',
    exitStrategy: 'wholesale'
  });

  // Outreach sequence settings
  const [outreachSettings, setOutreachSettings] = useState({
    autoSendLOI: false,
    followUpSequence: true,
    smsEnabled: false,
    emailEnabled: true,
    voiceCallEnabled: false,
    sequenceDelay: '2',
    maxFollowUps: '3',
    includeComps: true,
    personalizeMessages: true
  });

  // Fetch deals
  const { data: deals = [], isLoading: dealsLoading } = useQuery({
    queryKey: ['deals', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      // Get the profile to get the proper UUID
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('clerk_id', user.id)
        .single();
      
      if (!profile?.id) return [];
      
      const { data, error } = await supabase
        .from('deals')
        .select('*')
        .eq('owner_id', profile.id)
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
      
      // Get the profile to get the proper UUID
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('clerk_id', user.id)
        .single();
      
      if (!profile?.id) return [];
      
      const { data, error } = await supabase
        .from('buyers')
        .select('*')
        .eq('owner_id', profile.id)
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

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadedPhotos(prev => [...prev, ...files]);
    setFormData(prev => ({ ...prev, photos: [...prev.photos, ...files] }));
  };

  const analyzePhotos = async (photos: File[]) => {
    if (!photos.length) return null;
    
    setIsAnalyzingPhotos(true);
    
    try {
      // Simulate AI photo analysis
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const conditions = ['excellent', 'good', 'fair', 'poor'];
      const features = ['hardwood floors', 'granite counters', 'stainless appliances', 'crown molding', 'fireplace', 'updated bathroom'];
      const repairNeeds = ['paint', 'flooring', 'kitchen update', 'bathroom renovation', 'roof repair', 'HVAC service'];
      
      return {
        condition: conditions[Math.floor(Math.random() * conditions.length)],
        features: features.slice(0, Math.floor(Math.random() * 3) + 1),
        repairNeeds: repairNeeds.slice(0, Math.floor(Math.random() * 3) + 1),
        estimatedRepairCost: Math.floor(Math.random() * 30000) + 5000
      };
    } finally {
      setIsAnalyzingPhotos(false);
    }
  };

  const handleAdvancedAnalysis = async () => {
    if (!formData.address || !user?.id) {
      toast({
        title: "Error",
        description: "Please enter a property address.",
        variant: "destructive",
      });
      return;
    }

    // Check and deduct tokens before running analysis
    const tokenDeducted = await deductTokens(TOKEN_COSTS['AI Deal Analyzer'], 'AI Deal Analyzer');
    if (!tokenDeducted) {
      return; // Token deduction failed, user was notified
    }

    setIsAnalyzing(true);
    
    try {
      // Analyze photos first if available
      let photoAnalysis = null;
      if (formData.photos.length > 0) {
        photoAnalysis = await analyzePhotos(formData.photos);
      }

      // Simulate comprehensive AI analysis
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      const basePrice = parseInt(formData.listPrice) || 50000;
      const sqft = parseInt(formData.sqft) || 1200;
      const yearBuilt = parseInt(formData.yearBuilt) || 1990;
      
      // Advanced market analysis
      const marketMultiplier = formData.state === 'CA' ? 2.1 : formData.state === 'TX' ? 1.6 : formData.state === 'FL' ? 1.8 : 1.3;
      const conditionMultiplier = formData.condition === 'excellent' ? 1.15 : formData.condition === 'good' ? 1.0 : formData.condition === 'fair' ? 0.9 : 0.75;
      const ageMultiplier = yearBuilt > 2010 ? 1.1 : yearBuilt > 2000 ? 1.05 : yearBuilt > 1990 ? 1.0 : yearBuilt > 1980 ? 0.95 : 0.9;
      
      // Property amenities adjustments
      let amenityAdjustment = 1.0;
      if (formData.garage) amenityAdjustment += 0.05;
      if (formData.pool) amenityAdjustment += 0.08;
      if (formData.fireplace) amenityAdjustment += 0.03;
      if (formData.basement) amenityAdjustment += 0.06;
      
      const arv = Math.floor(sqft * 180 * marketMultiplier * conditionMultiplier * ageMultiplier * amenityAdjustment);
      
      // Repair estimate based on condition and photo analysis
      let repairBase = sqft * (formData.condition === 'poor' ? 65 : formData.condition === 'fair' ? 35 : formData.condition === 'good' ? 20 : 10);
      if (photoAnalysis) {
        repairBase = Math.max(repairBase, photoAnalysis.estimatedRepairCost);
      }
      if (formData.foundationIssues) repairBase += 15000;
      if (!formData.electricalUpdated && yearBuilt < 1990) repairBase += 8000;
      if (!formData.plumbingUpdated && yearBuilt < 1985) repairBase += 6000;
      
      const repairEstimate = Math.floor(repairBase);
      const maxOffer = Math.floor(arv * 0.75 - repairEstimate);
      const margin = maxOffer - basePrice - repairEstimate;
      const roi = basePrice > 0 ? ((margin / basePrice) * 100) : 0;
      
      // AI scoring with multiple factors
      const locationScore = ['CA', 'TX', 'FL', 'NY', 'WA'].includes(formData.state || '') ? 9 : ['CO', 'NC', 'GA', 'AZ'].includes(formData.state || '') ? 8 : 7;
      const sizeScore = sqft > 2000 ? 9 : sqft > 1500 ? 8 : sqft > 1200 ? 7 : sqft > 900 ? 6 : 5;
      const conditionScore = formData.condition === 'excellent' ? 9 : formData.condition === 'good' ? 8 : formData.condition === 'fair' ? 6 : 4;
      const priceScore = margin > 75000 ? 10 : margin > 50000 ? 9 : margin > 35000 ? 8 : margin > 20000 ? 7 : margin > 10000 ? 5 : 3;
      const ageScore = yearBuilt > 2010 ? 9 : yearBuilt > 2000 ? 8 : yearBuilt > 1990 ? 7 : yearBuilt > 1980 ? 6 : 5;
      
      const aiScore = Math.floor((locationScore + sizeScore + conditionScore + priceScore + ageScore) / 5);
      
      // Market data simulation
      const marketData: MarketData = {
        averagePrice: Math.floor(arv * (0.9 + Math.random() * 0.2)),
        medianPrice: Math.floor(arv * (0.85 + Math.random() * 0.3)),
        pricePerSqft: Math.floor(arv / sqft),
        daysOnMarket: Math.floor(Math.random() * 90) + 15,
        soldLastMonth: Math.floor(Math.random() * 50) + 10,
        activeListings: Math.floor(Math.random() * 200) + 50,
        priceAppreciation: Math.random() * 15 + 2,
        rentEstimate: Math.floor(arv * 0.012),
        capRate: Math.random() * 8 + 4,
        walkScore: Math.floor(Math.random() * 40) + 50,
        crimeRating: ['Low', 'Moderate', 'High'][Math.floor(Math.random() * 3)],
        schoolRating: Math.floor(Math.random() * 4) + 7
      };

      // Profitability and risk assessment
      const profitability = margin > 50000 ? 'Excellent' : margin > 30000 ? 'Good' : margin > 15000 ? 'Fair' : 'Poor';
      const riskLevel = aiScore >= 8 ? 'Low' : aiScore >= 6 ? 'Medium' : 'High';
      
      // Market trends
      const trendOptions = ['Rising', 'Stable', 'Declining'];
      const trend = trendOptions[Math.floor(Math.random() * trendOptions.length)];
      const confidence = Math.floor(Math.random() * 30) + 70;
      
      const recommendations = [
        'Consider quick wholesale to maximize profit',
        'Hold for rental income potential',
        'Light rehab could increase ARV significantly',
        'Market timing is favorable for this deal',
        'Negotiate seller financing for better terms'
      ];

      const analysisData: PropertyAnalysis = {
        arv,
        max_offer: maxOffer,
        repair_estimate: repairEstimate,
        condition_score: conditionScore,
        ai_score: aiScore,
        margin,
        roi,
        profitability,
        riskLevel,
        marketAnalysis: marketData,
        comps: [], // Would be populated with real comp data
        photoAnalysis,
        marketTrends: {
          trend,
          recommendation: recommendations[Math.floor(Math.random() * recommendations.length)],
          confidence
        }
      };

      setAnalysisResults(analysisData);

      const dealData = {
        address: formData.address,
        city: formData.city || null,
        state: formData.state || null,
        zip_code: formData.zipCode || null,
        list_price: basePrice,
        deal_type: formData.dealType,
        seller_contact: formData.sellerContact || null,
        seller_phone: formData.sellerPhone || null,
        seller_email: formData.sellerEmail || null,
        notes: formData.notes || null,
        arv,
        max_offer: maxOffer,
        repair_estimate: repairEstimate,
        condition_score: conditionScore,
        ai_score: aiScore,
        margin,
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

  const handleAdvancedScraping = async () => {
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
      // Simulate advanced scraping with more realistic data
      await new Promise(resolve => setTimeout(resolve, 4000));
      
      const motivationKeywords = ['motivated seller', 'must sell', 'cash only', 'as-is', 'handyman special', 'investor special', 'quick close'];
      const conditions = ['needs work', 'fixer upper', 'tlc needed', 'handyman special', 'as-is condition'];
      
      const mockListings: ScrapedListing[] = Array.from({ length: 8 }, (_, i) => ({
        address: `${123 + i * 100} ${['Oak', 'Pine', 'Maple', 'Cedar', 'Elm', 'Birch', 'Ash', 'Willow'][i]} ${['Street', 'Avenue', 'Drive', 'Lane'][i % 4]}, ${scraperFilters.location}`,
        price: Math.floor(Math.random() * 200000) + 50000,
        bedrooms: Math.floor(Math.random() * 4) + 2,
        bathrooms: Math.floor(Math.random() * 3) + 1,
        sqft: Math.floor(Math.random() * 1500) + 800,
        description: `${motivationKeywords[Math.floor(Math.random() * motivationKeywords.length)]}! ${conditions[Math.floor(Math.random() * conditions.length)]}. Great investment opportunity in desirable neighborhood.`,
        daysOnMarket: Math.floor(Math.random() * 120) + 10,
        propertyType: "Single Family",
        listingUrl: `https://zillow.com/example${i + 1}`,
        sellerMotivation: motivationKeywords[Math.floor(Math.random() * motivationKeywords.length)],
        listingAgent: i % 3 === 0 ? 'FSBO' : `Agent ${i + 1}`,
        images: [`/api/photo${i + 1}.jpg`]
      }));
      
      setScrapedListings(mockListings);
      
      toast({
        title: "Advanced Scraping Complete",
        description: `Found ${mockListings.length} high-potential deals with seller motivation indicators.`,
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

  const generateLOI = async (deal: Deal) => {
    setIsGeneratingLOI(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate LOI generation
      const loiUrl = '/api/generated-loi.pdf';
      
      // Update deal with LOI URL
      await supabase
        .from('deals')
        .update({ loi_pdf_url: loiUrl })
        .eq('id', deal.id);

      queryClient.invalidateQueries({ queryKey: ['deals'] });
      
      toast({
        title: "LOI Generated",
        description: "Letter of Intent has been generated and saved to the deal.",
      });
      
    } catch (error) {
      console.error('LOI generation error:', error);
      toast({
        title: "LOI Generation Failed",
        description: "There was an error generating the LOI. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingLOI(false);
    }
  };

  const startOutreachSequence = async (deal: Deal) => {
    try {
      // Create initial conversation record
      await supabase
        .from('conversations')
        .insert({
          deal_id: deal.id,
          contact_type: 'seller',
          channel: 'email',
          direction: 'outbound',
          message: `Initial outreach for ${deal.address}`,
          owner_id: user?.id
        });

      toast({
        title: "Outreach Sequence Started",
        description: "Automated follow-up sequence has been initiated for this seller.",
      });
      
    } catch (error) {
      console.error('Outreach sequence error:', error);
      toast({
        title: "Outreach Failed",
        description: "Failed to start outreach sequence. Please try again.",
        variant: "destructive",
      });
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
            score += 20;
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

  const getRiskColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'low': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'high': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Enhanced Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">AI-Powered Reverse Wholesaling Hub</h1>
            <p className="text-gray-600 mt-1">Complete deal analysis, buyer matching, and automated outreach system</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
              <Bot className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">AI Engine Active</span>
            </div>
            <div className="flex items-center space-x-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
              <Users className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">{buyers.length} Active Buyers</span>
            </div>
            <div className="flex items-center space-x-2 px-4 py-2 bg-purple-50 border border-purple-200 rounded-lg">
              <Search className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-700">{scrapedListings.length} Live Leads</span>
            </div>
            <div className="flex items-center space-x-2 px-4 py-2 bg-orange-50 border border-orange-200 rounded-lg">
              <TrendingUp className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-medium text-orange-700">{deals.length} Deals Tracked</span>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-1">
            <TabsTrigger value="analyzer" className="text-xs sm:text-sm">AI Analyzer</TabsTrigger>
            <TabsTrigger value="scraper" className="text-xs sm:text-sm">Smart Scraper</TabsTrigger>
            <TabsTrigger value="propwire" className="text-xs sm:text-sm hidden sm:block">Propwire Deals</TabsTrigger>
            <TabsTrigger value="pipeline" className="text-xs sm:text-sm hidden lg:block">Deal Pipeline</TabsTrigger>
            <TabsTrigger value="matching" className="text-xs sm:text-sm hidden lg:block">Buyer Matching</TabsTrigger>
            <TabsTrigger value="outreach" className="text-xs sm:text-sm hidden lg:block">Outreach Hub</TabsTrigger>
            <TabsTrigger value="analytics" className="text-xs sm:text-sm hidden lg:block">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="analyzer" className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
              {/* Enhanced Input Form */}
              <div className="xl:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Calculator className="w-5 h-5" />
                      <span>Advanced AI Property Analyzer</span>
                      <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                        <Bot className="w-3 h-3 mr-1" />
                        AI-Powered
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Property Address */}
                    <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                      <label className="block text-sm font-medium text-blue-800 mb-2">Property Address *</label>
                      <Input 
                        placeholder="123 Main Street, City, State, ZIP" 
                        value={formData.address}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                        className="border-blue-300 focus:border-blue-500"
                      />
                    </div>

                    {/* Basic Property Info */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
                        <Input 
                          placeholder="12345" 
                          value={formData.zipCode}
                          onChange={(e) => setFormData({...formData, zipCode: e.target.value})}
                        />
                      </div>
                    </div>

                    {/* Property Details */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Bedrooms</label>
                        <Input 
                          placeholder="3" 
                          value={formData.bedrooms}
                          onChange={(e) => setFormData({...formData, bedrooms: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Bathrooms</label>
                        <Input 
                          placeholder="2" 
                          value={formData.bathrooms}
                          onChange={(e) => setFormData({...formData, bathrooms: e.target.value})}
                        />
                      </div>
                    </div>

                    {/* Advanced Property Details */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Square Feet</label>
                        <Input 
                          placeholder="1200" 
                          value={formData.sqft}
                          onChange={(e) => setFormData({...formData, sqft: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Lot Size (acres)</label>
                        <Input 
                          placeholder="0.25" 
                          value={formData.lotSize}
                          onChange={(e) => setFormData({...formData, lotSize: e.target.value})}
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
                    </div>

                    {/* Property Features */}
                    <div className="border-t pt-4">
                      <h4 className="font-medium text-gray-900 mb-3">Property Features</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                          { key: 'garage', label: 'Garage' },
                          { key: 'basement', label: 'Basement' },
                          { key: 'pool', label: 'Pool' },
                          { key: 'fireplace', label: 'Fireplace' }
                        ].map(feature => (
                          <label key={feature.key} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={formData[feature.key as keyof typeof formData] as boolean}
                              onChange={(e) => setFormData({...formData, [feature.key]: e.target.checked})}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm font-medium text-gray-700">{feature.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* System Conditions */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">HVAC Age (years)</label>
                        <Input 
                          placeholder="5" 
                          value={formData.hvacAge}
                          onChange={(e) => setFormData({...formData, hvacAge: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Roof Age (years)</label>
                        <Input 
                          placeholder="10" 
                          value={formData.roofAge}
                          onChange={(e) => setFormData({...formData, roofAge: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        {[
                          { key: 'foundationIssues', label: 'Foundation Issues' },
                          { key: 'electricalUpdated', label: 'Electrical Updated' },
                          { key: 'plumbingUpdated', label: 'Plumbing Updated' }
                        ].map(item => (
                          <label key={item.key} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={formData[item.key as keyof typeof formData] as boolean}
                              onChange={(e) => setFormData({...formData, [item.key]: e.target.checked})}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm font-medium text-gray-700">{item.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Photo Upload */}
                    <div className="border-t pt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Property Photos (AI Analysis)</label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                        <div className="text-center">
                          <Camera className="mx-auto h-12 w-12 text-gray-400" />
                          <div className="mt-4">
                            <label htmlFor="photo-upload" className="cursor-pointer">
                              <span className="mt-2 block text-sm font-medium text-gray-900">
                                Upload property photos for AI analysis
                              </span>
                              <span className="mt-1 block text-sm text-gray-500">
                                {isAnalyzingPhotos ? 'AI analyzing photos...' : 'PNG, JPG, GIF up to 10MB each'}
                              </span>
                            </label>
                            <input
                              id="photo-upload"
                              name="photo-upload"
                              type="file"
                              multiple
                              accept="image/*"
                              className="sr-only"
                              onChange={handlePhotoUpload}
                            />
                          </div>
                        </div>
                        {uploadedPhotos.length > 0 && (
                          <div className="mt-4">
                            <p className="text-sm text-gray-600">{uploadedPhotos.length} photos uploaded</p>
                            {isAnalyzingPhotos && (
                              <div className="flex items-center mt-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                                <span className="text-sm text-blue-600">AI analyzing property condition...</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Deal Strategy */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">Seller Timeframe</label>
                        <Input 
                          placeholder="30 days, ASAP, flexible, etc." 
                          value={formData.timeframe}
                          onChange={(e) => setFormData({...formData, timeframe: e.target.value})}
                        />
                      </div>
                    </div>

                    {/* Seller Information */}
                    <div className="border-t pt-4">
                      <h4 className="font-medium text-gray-900 mb-3">Seller Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Seller Motivation</label>
                          <Input 
                            placeholder="Divorce, relocation, financial, etc." 
                            value={formData.sellerMotivation}
                            onChange={(e) => setFormData({...formData, sellerMotivation: e.target.value})}
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
                      <Textarea 
                        placeholder="Property condition details, seller situation, repair needs, neighborhood notes, etc." 
                        rows={3}
                        value={formData.notes}
                        onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      />
                    </div>

                    <Button 
                      onClick={handleAdvancedAnalysis}
                      disabled={isAnalyzing || !formData.address}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 h-12 text-lg font-semibold"
                    >
                      {isAnalyzing ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                          Running Advanced AI Analysis...
                        </>
                      ) : (
                        <>
                          <Bot className="w-5 h-5 mr-3" />
                          Run Advanced AI Analysis
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Enhanced Analysis Results */}
              <div className="space-y-6">
                {analysisResults && (
                  <>
                    {/* Main Results Card */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <BarChart3 className="w-5 h-5" />
                          <span>AI Analysis Results</span>
                          <Badge className={`${getRiskColor(analysisResults.riskLevel)} px-2 py-1`}>
                            {analysisResults.riskLevel} Risk
                          </Badge>
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
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-orange-50 rounded-lg p-3">
                            <p className="text-xs text-orange-600 font-medium">ROI</p>
                            <p className="text-lg font-bold text-orange-900">{analysisResults.roi.toFixed(1)}%</p>
                          </div>
                          <div className="bg-teal-50 rounded-lg p-3">
                            <p className="text-xs text-teal-600 font-medium">Profitability</p>
                            <p className="text-lg font-bold text-teal-900">{analysisResults.profitability}</p>
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

                        {analysisResults.photoAnalysis && (
                          <div className="border-t pt-3">
                            <h5 className="font-medium text-gray-900 mb-2 flex items-center">
                              <Camera className="w-4 h-4 mr-1" />
                              Photo Analysis
                            </h5>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Condition:</span>
                                <span className="font-medium capitalize">{analysisResults.photoAnalysis.condition}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Features:</span>
                                <span className="font-medium">{analysisResults.photoAnalysis.features.join(', ')}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Repair Needs:</span>
                                <span className="font-medium">{analysisResults.photoAnalysis.repairNeeds.join(', ')}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Market Analysis Card */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <TrendingUp className="w-5 h-5" />
                          <span>Market Intelligence</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Avg Price:</span>
                            <span className="font-medium">{formatCurrency(analysisResults.marketAnalysis.averagePrice)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Price/SqFt:</span>
                            <span className="font-medium">{formatCurrency(analysisResults.marketAnalysis.pricePerSqft)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Avg DOM:</span>
                            <span className="font-medium">{analysisResults.marketAnalysis.daysOnMarket} days</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Appreciation:</span>
                            <span className="font-medium text-green-600">+{analysisResults.marketAnalysis.priceAppreciation.toFixed(1)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Rent Est:</span>
                            <span className="font-medium">{formatCurrency(analysisResults.marketAnalysis.rentEstimate)}/mo</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Walk Score:</span>
                            <span className="font-medium">{analysisResults.marketAnalysis.walkScore}/100</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Schools:</span>
                            <span className="font-medium">{analysisResults.marketAnalysis.schoolRating}/10</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Crime:</span>
                            <span className={`font-medium ${analysisResults.marketAnalysis.crimeRating === 'Low' ? 'text-green-600' : analysisResults.marketAnalysis.crimeRating === 'High' ? 'text-red-600' : 'text-yellow-600'}`}>
                              {analysisResults.marketAnalysis.crimeRating}
                            </span>
                          </div>
                        </div>

                        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                          <div className="flex items-center space-x-2 mb-2">
                            <TrendingUp className="w-4 h-4 text-blue-600" />
                            <span className="font-medium text-blue-800">Market Trend</span>
                          </div>
                          <p className="text-sm text-blue-700">
                            {analysisResults.marketTrends.trend} market • {analysisResults.marketTrends.confidence}% confidence
                          </p>
                          <p className="text-sm text-blue-600 mt-1">
                            {analysisResults.marketTrends.recommendation}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Recent Deals */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Analysis</CardTitle>
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
              {/* Enhanced Scraper Controls */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Search className="w-5 h-5" />
                      <span>AI Smart Scraper</span>
                      <Badge className="bg-purple-100 text-purple-800">
                        <Bot className="w-3 h-3 mr-1" />
                        Enhanced
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Target Location *</label>
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
                        <option value="commercial">Commercial</option>
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
                        <option value="100">100 miles</option>
                      </select>
                    </div>

                    {/* Advanced Filters */}
                    <div className="border-t pt-4">
                      <h4 className="font-medium text-gray-900 mb-3">Advanced Filters</h4>
                      <div className="space-y-3">
                        {[
                          { key: 'includeForeclosures', label: 'Include Foreclosures' },
                          { key: 'includeAuctions', label: 'Include Auctions' },
                          { key: 'includeFSBO', label: 'FSBO Only' },
                          { key: 'includeInvestorKeywords', label: 'Investor Keywords' },
                          { key: 'priceReductionOnly', label: 'Price Reductions Only' },
                          { key: 'distressedProperties', label: 'Distressed Properties' }
                        ].map(filter => (
                          <label key={filter.key} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={scraperFilters[filter.key as keyof typeof scraperFilters] as boolean}
                              onChange={(e) => setScraperFilters({...scraperFilters, [filter.key]: e.target.checked})}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm font-medium text-gray-700">{filter.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Motivation Keywords</label>
                      <Textarea 
                        placeholder="motivated seller, must sell, cash only, fixer upper, handyman special, as-is, estate sale" 
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
                        <option value="180">180 days</option>
                      </select>
                    </div>

                    <Button 
                      onClick={handleAdvancedScraping}
                      disabled={isScraping || !scraperFilters.location}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                      {isScraping ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Smart Scraping...
                        </>
                      ) : (
                        <>
                          <Search className="w-4 h-4 mr-2" />
                          Start Smart Scraping
                        </>
                      )}
                    </Button>

                    {/* Scraping Sources */}
                    <div className="bg-gray-50 rounded-lg p-3">
                      <h5 className="font-medium text-gray-900 mb-2">Data Sources</h5>
                      <div className="space-y-1 text-xs text-gray-600">
                        <div className="flex items-center space-x-1">
                          <CheckCircle className="w-3 h-3 text-green-500" />
                          <span>Zillow FSBO</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <CheckCircle className="w-3 h-3 text-green-500" />
                          <span>Craigslist Housing</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <CheckCircle className="w-3 h-3 text-green-500" />
                          <span>Facebook Marketplace</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <CheckCircle className="w-3 h-3 text-green-500" />
                          <span>Foreclosure Sites</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <CheckCircle className="w-3 h-3 text-green-500" />
                          <span>Auction Platforms</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Enhanced Results */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Download className="w-5 h-5" />
                        <span>Smart Scraped Leads</span>
                      </div>
                      {scrapedListings.length > 0 && (
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">{scrapedListings.length} found</Badge>
                          <Button size="sm" variant="outline">
                            <Download className="w-3 h-3 mr-1" />
                            Export CSV
                          </Button>
                        </div>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {scrapedListings.length === 0 ? (
                      <div className="text-center py-12">
                        <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Listings Scraped Yet</h3>
                        <p className="text-gray-600 mb-6">Configure your search criteria and start intelligent scraping</p>
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-500 max-w-md mx-auto">
                          <div className="flex items-center space-x-2">
                            <Bot className="w-4 h-4 text-blue-500" />
                            <span>AI-Powered Filtering</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Target className="w-4 h-4 text-green-500" />
                            <span>Motivation Detection</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <TrendingUp className="w-4 h-4 text-purple-500" />
                            <span>Market Analysis</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <AlertTriangle className="w-4 h-4 text-orange-500" />
                            <span>Distress Signals</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {scrapedListings.map((listing, index) => (
                          <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900">{listing.address}</h4>
                                <p className="text-2xl font-bold text-green-600">{formatCurrency(listing.price)}</p>
                                {listing.sellerMotivation && (
                                  <Badge className="mt-1 bg-red-100 text-red-800">
                                    <AlertTriangle className="w-3 h-3 mr-1" />
                                    {listing.sellerMotivation}
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge variant="outline">{listing.propertyType}</Badge>
                                <Badge className="bg-orange-100 text-orange-800">{listing.daysOnMarket} DOM</Badge>
                                {listing.listingAgent === 'FSBO' && (
                                  <Badge className="bg-purple-100 text-purple-800">FSBO</Badge>
                                )}
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-4 gap-4 mb-3 text-sm">
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
                              <div className="flex items-center space-x-1">
                                <User className="w-4 h-4 text-gray-400" />
                                <span>{listing.listingAgent}</span>
                              </div>
                            </div>

                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{listing.description}</p>

                            <div className="flex items-center justify-between">
                              <div className="flex space-x-2">
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
                                      sqft: listing.sqft?.toString() || '',
                                      sellerMotivation: listing.sellerMotivation || ''
                                    });
                                    setActiveTab('analyzer');
                                  }}
                                >
                                  <Calculator className="w-3 h-3 mr-1" />
                                  Analyze
                                </Button>
                                <Button size="sm" variant="outline">
                                  <Eye className="w-3 h-3 mr-1" />
                                  View Listing
                                </Button>
                              </div>
                              <div className="flex space-x-2">
                                <Button size="sm" variant="outline">
                                  <MessageSquare className="w-3 h-3 mr-1" />
                                  Contact
                                </Button>
                                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                  <FileText className="w-3 h-3 mr-1" />
                                  Generate LOI
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

          <TabsContent value="propwire" className="space-y-6">
            <PropwireDeals />
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
                    <CardTitle className="flex items-center justify-between">
                      <span>Deal Pipeline</span>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Filter className="w-4 h-4 mr-1" />
                          Filter
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="w-4 h-4 mr-1" />
                          Export
                        </Button>
                      </div>
                    </CardTitle>
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
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => generateLOI(deal)}
                                  disabled={isGeneratingLOI}
                                >
                                  <FileText className="w-3 h-3 mr-1" />
                                  {deal.loi_pdf_url ? 'View LOI' : 'Generate LOI'}
                                </Button>
                                <Button size="sm" variant="outline">
                                  <Users className="w-3 h-3 mr-1" />
                                  Match ({matchBuyers(deal).length})
                                </Button>
                                <Button 
                                  size="sm" 
                                  className="bg-blue-600 hover:bg-blue-700"
                                  onClick={() => startOutreachSequence(deal)}
                                >
                                  <Send className="w-3 h-3 mr-1" />
                                  Outreach
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

          {/* New Outreach Hub Tab */}
          <TabsContent value="outreach" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Outreach Settings */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Send className="w-5 h-5" />
                      <span>Outreach Settings</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900">Auto-Sequence</h4>
                      {[
                        { key: 'autoSendLOI', label: 'Auto-send LOI' },
                        { key: 'followUpSequence', label: 'Follow-up sequence' },
                        { key: 'smsEnabled', label: 'SMS outreach' },
                        { key: 'emailEnabled', label: 'Email outreach' },
                        { key: 'voiceCallEnabled', label: 'Voice calls' },
                        { key: 'personalizeMessages', label: 'Personalize messages' }
                      ].map(setting => (
                        <label key={setting.key} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={outreachSettings[setting.key as keyof typeof outreachSettings] as boolean}
                            onChange={(e) => setOutreachSettings({...outreachSettings, [setting.key]: e.target.checked})}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm font-medium text-gray-700">{setting.label}</span>
                        </label>
                      ))}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Sequence Delay (days)</label>
                      <Input 
                        value={outreachSettings.sequenceDelay}
                        onChange={(e) => setOutreachSettings({...outreachSettings, sequenceDelay: e.target.value})}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Max Follow-ups</label>
                      <Input 
                        value={outreachSettings.maxFollowUps}
                        onChange={(e) => setOutreachSettings({...outreachSettings, maxFollowUps: e.target.value})}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button className="w-full justify-start" variant="outline">
                      <Send className="w-4 h-4 mr-2" />
                      Bulk Email Campaign
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Smartphone className="w-4 h-4 mr-2" />
                      SMS Blast
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Mic className="w-4 h-4 mr-2" />
                      Voice Call Queue
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <FileText className="w-4 h-4 mr-2" />
                      Generate LOI Batch
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Outreach Activity */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Outreach Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Outreach Activity Yet</h3>
                      <p className="text-gray-600 mb-6">Start your first outreach sequence to see activity here</p>
                      <Button onClick={() => setActiveTab('pipeline')}>
                        View Deals for Outreach
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Enhanced Key Metrics */}
              <div className="lg:col-span-3 grid grid-cols-2 lg:grid-cols-5 gap-4">
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

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-teal-100 rounded-lg">
                        <TrendingUp className="w-6 h-6 text-teal-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">
                          {deals.length > 0 ? ((deals.filter(d => d.status === 'closed').length / deals.length) * 100).toFixed(1) : 0}%
                        </p>
                        <p className="text-sm text-gray-600">Close Rate</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Performance Charts */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Deal Performance Dashboard</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <PieChart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Advanced performance charts coming soon</p>
                      <p className="text-sm text-gray-400">Track deal velocity, conversion rates, and profit trends</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Market Insights */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle>AI Market Insights</CardTitle>
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
                      <div className="border-l-4 border-orange-500 pl-4">
                        <p className="font-medium text-orange-700">Price Trends</p>
                        <p className="text-sm text-gray-600">Average ARV up 12% this quarter</p>
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
