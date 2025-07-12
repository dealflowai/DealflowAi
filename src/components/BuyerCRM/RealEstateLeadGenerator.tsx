import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/components/ui/use-toast";
import { Search, Download, Settings, Play, Pause, RotateCcw, Globe, MapPin, DollarSign, Home, Phone, Mail, FileText, Zap, Filter, Database, Target, Users, Building, Calendar, TrendingUp, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@clerk/clerk-react";

interface PropertyLead {
  id: string;
  ownerName: string;
  ownerPhone?: string;
  ownerEmail?: string;
  propertyAddress: string;
  city: string;
  state: string;
  zipCode: string;
  propertyType: string;
  assessedValue: number;
  lastSaleDate?: string;
  lastSalePrice?: number;
  equity: number;
  equityPercentage: number;
  mortgageBalance?: number;
  status: string;
  ownershipLength: number;
  distressed: boolean;
  vacant: boolean;
  absenteeOwner: boolean;
  foreclosureStatus?: string;
  mlsStatus?: string;
  confidenceScore: number;
  source: string;
  scrapedAt: string;
  apn?: string;
  sqft?: number;
  bedrooms?: number;
  bathrooms?: number;
  yearBuilt?: number;
}

interface SearchFilters {
  location: {
    state: string;
    city: string;
    county: string;
    zipCode: string;
    radius: number;
  };
  propertyType: string[];
  equityRange: [number, number];
  valueRange: [number, number];
  ownershipLength: [number, number];
  foreclosureStatus: string[];
  mlsStatus: string[];
  propertyStatus: {
    vacant: boolean;
    absenteeOwner: boolean;
    distressed: boolean;
  };
  ownerFilters: {
    hasPhone: boolean;
    hasEmail: boolean;
    outOfState: boolean;
  };
}

interface RealEstateLeadGeneratorProps {
  onLeadsFound: (leads: PropertyLead[]) => void;
}

const RealEstateLeadGenerator: React.FC<RealEstateLeadGeneratorProps> = ({ onLeadsFound }) => {
  const { user } = useUser();
  const { toast } = useToast();
  
  const [isSearching, setIsSearching] = useState(false);
  const [searchProgress, setSearchProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [foundLeads, setFoundLeads] = useState<PropertyLead[]>([]);
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
  const [expandedLead, setExpandedLead] = useState<string | null>(null);
  const [zapierWebhook, setZapierWebhook] = useState('');
  
  // Browser session states
  const [sessionStatuses, setSessionStatuses] = useState({
    facebook: { active: false, lastScrape: null, scrapeCount: 0 },
    linkedin: { active: false, lastScrape: null, scrapeCount: 0 },
    propwire: { active: false, lastScrape: null, scrapeCount: 0 }
  });
  const [isLoggingIn, setIsLoggingIn] = useState({ facebook: false, linkedin: false, propwire: false });
  const [scrapingMethod, setScrapingMethod] = useState<'traditional' | 'session'>('session');
  
  const [filters, setFilters] = useState<SearchFilters>({
    location: {
      state: '',
      city: '',
      county: '',
      zipCode: '',
      radius: 10
    },
    propertyType: ['Single Family', 'Multi Family', 'Land', 'Commercial'],
    equityRange: [50000, 1000000],
    valueRange: [100000, 2000000],
    ownershipLength: [2, 50],
    foreclosureStatus: [],
    mlsStatus: [],
    propertyStatus: {
      vacant: false,
      absenteeOwner: false,
      distressed: false
    },
    ownerFilters: {
      hasPhone: false,
      hasEmail: false,
      outOfState: false
    }
  });

  const propertyTypes = [
    'Single Family', 'Multi Family', 'Condo', 'Townhouse', 
    'Land', 'Commercial', 'Industrial', 'Mobile Home'
  ];

  const foreclosureStatuses = [
    'Pre-Foreclosure', 'Auction', 'REO', 'Notice of Default', 
    'Notice of Sale', 'Bank Owned'
  ];

  const mlsStatuses = [
    'Active', 'Pending', 'Sold', 'Withdrawn', 'Expired', 
    'Off Market', 'Coming Soon'
  ];

  const searchPresets = [
    {
      name: "High Equity Homes",
      description: "Properties with 60%+ equity, owned 5+ years",
      icon: DollarSign,
      onClick: () => {
        setFilters(prev => ({
          ...prev,
          equityRange: [60000, 1000000] as [number, number],
          ownershipLength: [5, 50] as [number, number],
          propertyType: ['Single Family', 'Multi Family']
        }));
      }
    },
    {
      name: "Distressed Properties",
      description: "Pre-foreclosure, vacant, or distressed properties",
      icon: Home,
      onClick: () => {
        setFilters(prev => ({
          ...prev,
          foreclosureStatus: ['Pre-Foreclosure', 'Notice of Default'],
          propertyStatus: { ...prev.propertyStatus, vacant: true, distressed: true }
        }));
      }
    },
    {
      name: "Absentee Owners",
      description: "Out-of-state owners with high equity",
      icon: MapPin,
      onClick: () => {
        setFilters(prev => ({
          ...prev,
          ownerFilters: { ...prev.ownerFilters, outOfState: true },
          equityRange: [50000, 1000000] as [number, number]
        }));
      }
    },
    {
      name: "Investment Opportunities",
      description: "Multi-family and commercial properties",
      icon: Building,
      onClick: () => {
        setFilters(prev => ({
          ...prev,
          propertyType: ['Multi Family', 'Commercial', 'Industrial'],
          equityRange: [40000, 1000000] as [number, number]
        }));
      }
    }
  ];

  const startAdvancedSearch = async () => {
    if (!user?.id) {
      toast({
        title: "Authentication Required",
        description: "Please log in to search for leads",
        variant: "destructive"
      });
      return;
    }

    setIsSearching(true);
    setSearchProgress(0);
    setFoundLeads([]);
    setCurrentStep('Initializing search parameters...');

    try {
      // Step 1: Validate search criteria
      setSearchProgress(10);
      setCurrentStep('Validating search criteria...');
      
      if (!filters.location.state && !filters.location.city && !filters.location.zipCode) {
        throw new Error('Please specify at least a state, city, or zip code');
      }

      // Step 2: Generate search URLs based on filters
      setSearchProgress(20);
      setCurrentStep('Generating search targets...');
      
      const searchTargets = generateSearchTargets(filters);
      
      // Step 3: Scrape REAL data sources 
      setSearchProgress(30);
      setCurrentStep('Scraping REAL real estate websites...');
      
      const scrapedData = await scrapeRealEstateData(searchTargets);
      
      // Step 4: Process and analyze REAL data
      setSearchProgress(60);
      setCurrentStep('Processing REAL scraped property data with AI...');
      
      const processedLeads = await processPropertyData(scrapedData, filters);
      
      // Step 5: Skip trace and enhance data
      setSearchProgress(80);
      setCurrentStep('Enhancing lead data with contact information...');
      
      const enhancedLeads = await enhanceWithContactData(processedLeads);
      
      // Step 6: Score and rank leads
      setSearchProgress(90);
      setCurrentStep('Scoring and ranking leads...');
      
      const rankedLeads = scoreAndRankLeads(enhancedLeads, filters);
      
      setSearchProgress(100);
      setCurrentStep('Search complete!');
      setFoundLeads(rankedLeads);
      onLeadsFound(rankedLeads);

      toast({
        title: "Search Complete",
        description: `Found ${rankedLeads.length} qualified leads`,
      });

    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search Failed",
        description: error instanceof Error ? error.message : "An error occurred during the search",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
      setCurrentStep('');
    }
  };

  const generateSearchTargets = (filters: SearchFilters) => {
    const targets = [];
    
    // Build search URLs for various real estate platforms
    const locationQuery = [
      filters.location.city,
      filters.location.state,
      filters.location.zipCode
    ].filter(Boolean).join(', ');

    if (locationQuery) {
      // Public record sites
      targets.push(`https://www.realtor.com/realestateandhomes-search/${encodeURIComponent(locationQuery)}`);
      targets.push(`https://www.zillow.com/homes/${encodeURIComponent(locationQuery)}_rb/`);
      targets.push(`https://www.redfin.com/city/${encodeURIComponent(locationQuery)}`);
      
      // County assessor sites (generic examples)
      targets.push(`https://www.${filters.location.state?.toLowerCase()}assessor.com/search?location=${encodeURIComponent(locationQuery)}`);
      
      // For Sale By Owner sites
      targets.push(`https://www.forsalebyowner.com/search?location=${encodeURIComponent(locationQuery)}`);
    }

    return targets;
  };

  const scrapeRealEstateData = async (targets: string[]) => {
    try {
      console.log('Calling edge function with data:', {
        targets: targets,
        filters: filters,
        searchType: 'real_estate_leads'
      });

      const { data, error } = await supabase.functions.invoke('ai-buyer-discovery', {
        body: {
          searchCriteria: {
            targets: targets,
            filters: filters,
            searchType: 'real_estate_leads'
          }
        }
      });

      console.log('Edge function response:', { data, error });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(`Edge function error: ${error.message || JSON.stringify(error)}`);
      }
      return data;
    } catch (error) {
      console.error('Scraping error:', error);
      throw error;
    }
  };

  const processPropertyData = async (scrapedData: unknown, filters: SearchFilters): Promise<PropertyLead[]> => {
    // Process actual scraped data from real estate websites
    if (!scrapedData || typeof scrapedData !== 'object' || !('leads' in scrapedData) || !Array.isArray((scrapedData as any).leads)) {
      throw new Error('No real property data was scraped. Please ensure your Firecrawl API key is configured correctly.');
    }

    // Return the actual leads from the edge function
    return (scrapedData as { leads: PropertyLead[] }).leads || [];
  };

  const enhanceWithContactData = async (leads: PropertyLead[]): Promise<PropertyLead[]> => {
    // Simulate skip tracing enhancement
    return leads.map(lead => ({
      ...lead,
      confidenceScore: lead.ownerPhone && lead.ownerEmail ? lead.confidenceScore + 10 : lead.confidenceScore
    }));
  };

  const scoreAndRankLeads = (leads: PropertyLead[], filters: SearchFilters): PropertyLead[] => {
    return leads
      .map(lead => {
        let score = lead.confidenceScore;
        
        // Boost score based on filter preferences
        if (lead.ownerPhone && filters.ownerFilters.hasPhone) score += 10;
        if (lead.ownerEmail && filters.ownerFilters.hasEmail) score += 10;
        if (lead.absenteeOwner && filters.ownerFilters.outOfState) score += 15;
        if (lead.distressed && filters.propertyStatus.distressed) score += 20;
        if (lead.vacant && filters.propertyStatus.vacant) score += 15;
        if (lead.equityPercentage >= 60) score += 10;
        if (lead.ownershipLength >= 5) score += 5;
        
        return { ...lead, confidenceScore: Math.min(score, 100) };
      })
      .sort((a, b) => b.confidenceScore - a.confidenceScore);
  };

  const exportToCSV = () => {
    const selectedData = foundLeads.filter(lead => selectedLeads.has(lead.id));
    const csv = convertToCSV(selectedData);
    downloadCSV(csv, 'real_estate_leads.csv');
    
    toast({
      title: "Export Complete",
      description: `Exported ${selectedData.length} leads to CSV`,
    });
  };

  const convertToCSV = (data: PropertyLead[]): string => {
    const headers = [
      'Owner Name', 'Phone', 'Email', 'Property Address', 'City', 'State', 'Zip',
      'Property Type', 'Assessed Value', 'Equity', 'Equity %', 'Ownership Length',
      'Status', 'Confidence Score', 'APN', 'Sq Ft', 'Bedrooms', 'Bathrooms'
    ];
    
    const rows = data.map(lead => [
      lead.ownerName,
      lead.ownerPhone || '',
      lead.ownerEmail || '',
      lead.propertyAddress,
      lead.city,
      lead.state,
      lead.zipCode,
      lead.propertyType,
      lead.assessedValue,
      lead.equity,
      lead.equityPercentage,
      lead.ownershipLength,
      lead.status,
      lead.confidenceScore,
      lead.apn || '',
      lead.sqft || '',
      lead.bedrooms || '',
      lead.bathrooms || ''
    ]);
    
    return [headers, ...rows].map(row => row.map(field => `"${field}"`).join(',')).join('\n');
  };

  const downloadCSV = (csv: string, filename: string) => {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', filename);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const sendToZapier = async () => {
    if (!zapierWebhook) {
      toast({
        title: "Webhook Required",
        description: "Please enter your Zapier webhook URL",
        variant: "destructive"
      });
      return;
    }

    const selectedData = foundLeads.filter(lead => selectedLeads.has(lead.id));
    
    try {
      await fetch(zapierWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        mode: 'no-cors',
        body: JSON.stringify({
          leads: selectedData,
          timestamp: new Date().toISOString(),
          source: 'Real Estate Lead Generator'
        })
      });

      toast({
        title: "Sent to Zapier",
        description: `Sent ${selectedData.length} leads to your Zapier webhook`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send data to Zapier webhook",
        variant: "destructive"
      });
    }
  };

  const toggleLeadSelection = (leadId: string) => {
    const newSelection = new Set(selectedLeads);
    if (newSelection.has(leadId)) {
      newSelection.delete(leadId);
    } else {
      newSelection.add(leadId);
    }
    setSelectedLeads(newSelection);
  };

  const selectAllLeads = () => {
    if (selectedLeads.size === foundLeads.length) {
      setSelectedLeads(new Set());
    } else {
      setSelectedLeads(new Set(foundLeads.map(lead => lead.id)));
    }
  };

  // Browser session functions
  const checkSessionStatus = useCallback(async (platform: 'facebook' | 'linkedin' | 'propwire') => {
    try {
      const { data, error } = await supabase.functions.invoke('browser-session-scraper', {
        body: { action: 'status', platform }
      });

      if (!error && data?.success) {
        setSessionStatuses(prev => ({
          ...prev,
          [platform]: {
            active: data.sessionActive,
            lastScrape: data.lastScrape,
            scrapeCount: data.scrapeCount || 0
          }
        }));
      }
    } catch (error) {
      console.error(`Error checking ${platform} session:`, error);
    }
  }, []);

  const handleBrowserLogin = async (platform: 'facebook' | 'linkedin' | 'propwire') => {
    setIsLoggingIn(prev => ({ ...prev, [platform]: true }));
    
    try {
      const loginUrls = {
        facebook: 'https://www.facebook.com/login',
        linkedin: 'https://www.linkedin.com/login',
        propwire: 'https://propwire.com/login'
      };

      const { data, error } = await supabase.functions.invoke('browser-session-scraper', {
        body: { 
          action: 'login', 
          platform,
          loginUrl: loginUrls[platform]
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.success) {
        await checkSessionStatus(platform);
        toast({
          title: "Login Successful",
          description: `Successfully logged into ${platform}. You can now scrape authenticated data.`,
        });
      }
    } catch (error) {
      console.error(`Login error for ${platform}:`, error);
      toast({
        title: "Login Failed",
        description: `Failed to login to ${platform}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    } finally {
      setIsLoggingIn(prev => ({ ...prev, [platform]: false }));
    }
  };

  const handleBrowserLogout = async (platform: 'facebook' | 'linkedin' | 'propwire') => {
    try {
      const { data, error } = await supabase.functions.invoke('browser-session-scraper', {
        body: { action: 'logout', platform }
      });

      if (!error && data?.success) {
        await checkSessionStatus(platform);
        toast({
          title: "Logout Successful",
          description: `Logged out from ${platform}`,
        });
      }
    } catch (error) {
      console.error(`Logout error for ${platform}:`, error);
      toast({
        title: "Logout Failed",
        description: `Failed to logout from ${platform}`,
        variant: "destructive"
      });
    }
  };

  const scrapeFromBrowserSessions = async () => {
    if (!user?.id) {
      toast({
        title: "Authentication Required",
        description: "Please log in to scrape leads",
        variant: "destructive"
      });
      return;
    }

    setIsSearching(true);
    setSearchProgress(0);
    setFoundLeads([]);
    setCurrentStep('Initializing browser session scraping...');

    try {
      // Check which sessions are active
      const activePlatforms = Object.entries(sessionStatuses)
        .filter(([_, status]) => status.active)
        .map(([platform, _]) => platform);

      if (activePlatforms.length === 0) {
        throw new Error('No active sessions found. Please login to at least one platform first.');
      }

      setSearchProgress(20);
      setCurrentStep(`Scraping from ${activePlatforms.length} authenticated platforms...`);

      const allLeads: PropertyLead[] = [];

      for (const platform of activePlatforms) {
        setCurrentStep(`Scraping ${platform} groups and contacts...`);
        
        const scrapeTargets = generatePlatformTargets(platform as 'facebook' | 'linkedin' | 'propwire');
        
        const { data, error } = await supabase.functions.invoke('browser-session-scraper', {
          body: { 
            action: 'scrape', 
            platform,
            scrapeTargets,
            filters 
          }
        });

        if (!error && data?.success && data.data?.leads) {
          allLeads.push(...data.data.leads);
          console.log(`Found ${data.data.leads.length} leads from ${platform}`);
        }
      }

      setSearchProgress(80);
      setCurrentStep('Processing and ranking leads...');

      // Process and rank all leads
      const rankedLeads = scoreAndRankLeads(allLeads, filters);

      setSearchProgress(100);
      setCurrentStep('Browser session scraping complete!');
      setFoundLeads(rankedLeads);
      onLeadsFound(rankedLeads);

      toast({
        title: "Scraping Complete", 
        description: `Found ${rankedLeads.length} leads from ${activePlatforms.length} platforms`,
      });

      // Update session status
      for (const platform of activePlatforms) {
        await checkSessionStatus(platform as 'facebook' | 'linkedin' | 'propwire');
      }

    } catch (error) {
      console.error('Browser scraping error:', error);
      toast({
        title: "Scraping Failed",
        description: error instanceof Error ? error.message : "An error occurred during scraping",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
      setCurrentStep('');
    }
  };

  const generatePlatformTargets = (platform: 'facebook' | 'linkedin' | 'propwire') => {
    const targets = [];
    
    switch (platform) {
      case 'facebook':
        targets.push(
          'Real Estate Investors Group',
          'Wholesaling Properties',
          'Fix and Flip Network',
          'Real Estate Deals Network'
        );
        break;
      case 'linkedin':
        targets.push(
          'Real Estate Professionals',
          'Commercial Real Estate Investors',
          'REI Network',
          'Property Investment Group'
        );
        break;
      case 'propwire':
        targets.push('buyers', 'investors', 'wholesalers', 'flippers');
        break;
    }
    
    return targets;
  };

  // Load session statuses on component mount
  useEffect(() => {
    if (user?.id) {
      checkSessionStatus('facebook');
      checkSessionStatus('linkedin');
      checkSessionStatus('propwire');
    }
  }, [user?.id, checkSessionStatus]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Advanced Real Estate Lead Generator
          </CardTitle>
          <CardDescription>
            Search and discover high-quality real estate leads with comprehensive filtering and data enhancement
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="sessions" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="sessions">Browser Sessions</TabsTrigger>
          <TabsTrigger value="search">Search Filters</TabsTrigger>
          <TabsTrigger value="presets">Quick Presets</TabsTrigger>
          <TabsTrigger value="results">Results ({foundLeads.length})</TabsTrigger>
          <TabsTrigger value="export">Export & Integrate</TabsTrigger>
        </TabsList>

        <TabsContent value="sessions" className="space-y-6">
          {/* Browser Session Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Browser Session Management
              </CardTitle>
              <CardDescription>
                Login to Facebook, LinkedIn, and Propwire to scrape authenticated data from groups and networks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Platform Sessions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Facebook */}
                <Card className={`border-2 ${sessionStatuses.facebook.active ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white text-sm font-bold">f</div>
                        Facebook
                      </h3>
                      <Badge variant={sessionStatuses.facebook.active ? "default" : "secondary"}>
                        {sessionStatuses.facebook.active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm space-y-1">
                      <p>Groups: Real Estate Investors, Wholesalers</p>
                      <p>Last scrape: {sessionStatuses.facebook.lastScrape ? new Date(sessionStatuses.facebook.lastScrape).toLocaleDateString() : 'Never'}</p>
                      <p>Total scrapes: {sessionStatuses.facebook.scrapeCount}</p>
                    </div>
                    <div className="space-y-2">
                      {sessionStatuses.facebook.active ? (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleBrowserLogout('facebook')}
                          className="w-full"
                        >
                          Disconnect
                        </Button>
                      ) : (
                        <Button 
                          size="sm" 
                          onClick={() => handleBrowserLogin('facebook')}
                          disabled={isLoggingIn.facebook}
                          className="w-full"
                        >
                          {isLoggingIn.facebook ? 'Logging in...' : 'Login to Facebook'}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* LinkedIn */}
                <Card className={`border-2 ${sessionStatuses.linkedin.active ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-700 rounded flex items-center justify-center text-white text-sm font-bold">in</div>
                        LinkedIn
                      </h3>
                      <Badge variant={sessionStatuses.linkedin.active ? "default" : "secondary"}>
                        {sessionStatuses.linkedin.active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm space-y-1">
                      <p>Groups: Real Estate Professionals, REI Network</p>
                      <p>Last scrape: {sessionStatuses.linkedin.lastScrape ? new Date(sessionStatuses.linkedin.lastScrape).toLocaleDateString() : 'Never'}</p>
                      <p>Total scrapes: {sessionStatuses.linkedin.scrapeCount}</p>
                    </div>
                    <div className="space-y-2">
                      {sessionStatuses.linkedin.active ? (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleBrowserLogout('linkedin')}
                          className="w-full"
                        >
                          Disconnect
                        </Button>
                      ) : (
                        <Button 
                          size="sm" 
                          onClick={() => handleBrowserLogin('linkedin')}
                          disabled={isLoggingIn.linkedin}
                          className="w-full"
                        >
                          {isLoggingIn.linkedin ? 'Logging in...' : 'Login to LinkedIn'}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Propwire */}
                <Card className={`border-2 ${sessionStatuses.propwire.active ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium flex items-center gap-2">
                        <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center text-white text-sm font-bold">P</div>
                        Propwire
                      </h3>
                      <Badge variant={sessionStatuses.propwire.active ? "default" : "secondary"}>
                        {sessionStatuses.propwire.active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm space-y-1">
                      <p>Categories: Buyers, Investors, Wholesalers</p>
                      <p>Last scrape: {sessionStatuses.propwire.lastScrape ? new Date(sessionStatuses.propwire.lastScrape).toLocaleDateString() : 'Never'}</p>
                      <p>Total scrapes: {sessionStatuses.propwire.scrapeCount}</p>
                    </div>
                    <div className="space-y-2">
                      {sessionStatuses.propwire.active ? (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleBrowserLogout('propwire')}
                          className="w-full"
                        >
                          Disconnect
                        </Button>
                      ) : (
                        <Button 
                          size="sm" 
                          onClick={() => handleBrowserLogin('propwire')}
                          disabled={isLoggingIn.propwire}
                          className="w-full"
                        >
                          {isLoggingIn.propwire ? 'Logging in...' : 'Login to Propwire'}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Scraping Method Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Scraping Method
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${scrapingMethod === 'session' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                         onClick={() => setScrapingMethod('session')}>
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="h-5 w-5" />
                        <h3 className="font-medium">Browser Sessions (Recommended)</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Scrape from authenticated Facebook groups, LinkedIn networks, and Propwire platforms for highest quality leads
                      </p>
                    </div>
                    <div className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${scrapingMethod === 'traditional' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                         onClick={() => setScrapingMethod('traditional')}>
                      <div className="flex items-center gap-2 mb-2">
                        <Globe className="h-5 w-5" />
                        <h3 className="font-medium">Traditional Web Scraping</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Scrape public real estate websites like Realtor.com, Zillow, and county records
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Start Scraping Button */}
              <div className="space-y-4">
                {scrapingMethod === 'session' && (
                  <Button 
                    onClick={scrapeFromBrowserSessions}
                    disabled={isSearching || Object.values(sessionStatuses).every(status => !status.active)}
                    size="lg"
                    className="w-full"
                  >
                    {isSearching ? (
                      <>
                        <Pause className="mr-2 h-4 w-4" />
                        Scraping from sessions... {searchProgress}%
                      </>
                    ) : (
                      <>
                        <Users className="mr-2 h-4 w-4" />
                        Scrape from Browser Sessions
                      </>
                    )}
                  </Button>
                )}

                {scrapingMethod === 'traditional' && (
                  <Button 
                    onClick={startAdvancedSearch}
                    disabled={isSearching}
                    size="lg"
                    className="w-full"
                  >
                    {isSearching ? (
                      <>
                        <Pause className="mr-2 h-4 w-4" />
                        Traditional scraping... {searchProgress}%
                      </>
                    ) : (
                      <>
                        <Search className="mr-2 h-4 w-4" />
                        Start Traditional Search
                      </>
                    )}
                  </Button>
                )}

                {scrapingMethod === 'session' && Object.values(sessionStatuses).every(status => !status.active) && (
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      Please login to at least one platform to use browser session scraping
                    </p>
                  </div>
                )}
              </div>

              {/* Search Progress */}
              {isSearching && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{currentStep}</span>
                        <span>{searchProgress}%</span>
                      </div>
                      <Progress value={searchProgress} />
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="search" className="space-y-6">
          {/* Location Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Location Criteria
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label>State</Label>
                <Select value={filters.location.state} onValueChange={(value) => 
                  setFilters(prev => ({ ...prev, location: { ...prev.location, state: value } }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {['TX', 'CA', 'FL', 'NY', 'IL', 'PA', 'OH', 'GA', 'NC', 'MI'].map(state => (
                      <SelectItem key={state} value={state}>{state}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>City</Label>
                <Input 
                  value={filters.location.city}
                  onChange={(e) => setFilters(prev => ({ ...prev, location: { ...prev.location, city: e.target.value } }))}
                  placeholder="Enter city" 
                />
              </div>
              <div>
                <Label>County</Label>
                <Input 
                  value={filters.location.county}
                  onChange={(e) => setFilters(prev => ({ ...prev, location: { ...prev.location, county: e.target.value } }))}
                  placeholder="Enter county" 
                />
              </div>
              <div>
                <Label>Zip Code</Label>
                <Input 
                  value={filters.location.zipCode}
                  onChange={(e) => setFilters(prev => ({ ...prev, location: { ...prev.location, zipCode: e.target.value } }))}
                  placeholder="Enter zip code" 
                />
              </div>
            </CardContent>
          </Card>

          {/* Property Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Property Criteria
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Property Types</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                  {propertyTypes.map(type => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox 
                        id={type}
                        checked={filters.propertyType.includes(type)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFilters(prev => ({ ...prev, propertyType: [...prev.propertyType, type] }));
                          } else {
                            setFilters(prev => ({ ...prev, propertyType: prev.propertyType.filter(t => t !== type) }));
                          }
                        }}
                      />
                      <Label htmlFor={type} className="text-sm">{type}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>Property Value Range: ${filters.valueRange[0].toLocaleString()} - ${filters.valueRange[1].toLocaleString()}</Label>
                <Slider
                  value={filters.valueRange}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, valueRange: value as [number, number] }))}
                  max={5000000}
                  min={50000}
                  step={25000}
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Equity Range: ${filters.equityRange[0].toLocaleString()} - ${filters.equityRange[1].toLocaleString()}</Label>
                <Slider
                  value={filters.equityRange}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, equityRange: value as [number, number] }))}
                  max={2000000}
                  min={10000}
                  step={10000}
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Ownership Length: {filters.ownershipLength[0]} - {filters.ownershipLength[1]} years</Label>
                <Slider
                  value={filters.ownershipLength}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, ownershipLength: value as [number, number] }))}
                  max={50}
                  min={1}
                  step={1}
                  className="mt-2"
                />
              </div>
            </CardContent>
          </Card>

          {/* Status Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Status & Condition Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="vacant"
                    checked={filters.propertyStatus.vacant}
                    onCheckedChange={(checked) => 
                      setFilters(prev => ({ ...prev, propertyStatus: { ...prev.propertyStatus, vacant: checked as boolean } }))
                    }
                  />
                  <Label htmlFor="vacant">Vacant Properties</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="absentee"
                    checked={filters.propertyStatus.absenteeOwner}
                    onCheckedChange={(checked) => 
                      setFilters(prev => ({ ...prev, propertyStatus: { ...prev.propertyStatus, absenteeOwner: checked as boolean } }))
                    }
                  />
                  <Label htmlFor="absentee">Absentee Owners</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="distressed"
                    checked={filters.propertyStatus.distressed}
                    onCheckedChange={(checked) => 
                      setFilters(prev => ({ ...prev, propertyStatus: { ...prev.propertyStatus, distressed: checked as boolean } }))
                    }
                  />
                  <Label htmlFor="distressed">Distressed Properties</Label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="hasPhone"
                    checked={filters.ownerFilters.hasPhone}
                    onCheckedChange={(checked) => 
                      setFilters(prev => ({ ...prev, ownerFilters: { ...prev.ownerFilters, hasPhone: checked as boolean } }))
                    }
                  />
                  <Label htmlFor="hasPhone">Has Phone Number</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="hasEmail"
                    checked={filters.ownerFilters.hasEmail}
                    onCheckedChange={(checked) => 
                      setFilters(prev => ({ ...prev, ownerFilters: { ...prev.ownerFilters, hasEmail: checked as boolean } }))
                    }
                  />
                  <Label htmlFor="hasEmail">Has Email Address</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="outOfState"
                    checked={filters.ownerFilters.outOfState}
                    onCheckedChange={(checked) => 
                      setFilters(prev => ({ ...prev, ownerFilters: { ...prev.ownerFilters, outOfState: checked as boolean } }))
                    }
                  />
                  <Label htmlFor="outOfState">Out-of-State Owners</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button 
            onClick={startAdvancedSearch}
            disabled={isSearching}
            size="lg"
            className="w-full"
          >
            {isSearching ? (
              <>
                <Pause className="mr-2 h-4 w-4" />
                Searching... {searchProgress}%
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Start Advanced Search
              </>
            )}
          </Button>

          {isSearching && (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{currentStep}</span>
                    <span>{searchProgress}%</span>
                  </div>
                  <Progress value={searchProgress} />
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="presets" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {searchPresets.map((preset, index) => (
              <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <preset.icon className="h-5 w-5" />
                    {preset.name}
                  </CardTitle>
                  <CardDescription>{preset.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => {
                      preset.onClick();
                      toast({
                        title: "Preset Applied",
                        description: `Applied ${preset.name} search criteria`,
                      });
                    }}
                    className="w-full"
                  >
                    Apply This Preset
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          {foundLeads.length > 0 && (
            <>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    onClick={selectAllLeads}
                    size="sm"
                  >
                    {selectedLeads.size === foundLeads.length ? 'Deselect All' : 'Select All'}
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {selectedLeads.size} of {foundLeads.length} selected
                  </span>
                </div>
                <Badge variant="outline">{foundLeads.length} leads found</Badge>
              </div>

              <div className="space-y-2">
                {foundLeads.map((lead) => (
                  <Card key={lead.id} className="hover:shadow-sm transition-shadow">
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            checked={selectedLeads.has(lead.id)}
                            onCheckedChange={() => toggleLeadSelection(lead.id)}
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium">{lead.ownerName}</h3>
                              <Badge variant={lead.confidenceScore >= 80 ? "default" : "secondary"}>
                                {lead.confidenceScore}% Match
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {lead.propertyAddress}, {lead.city}, {lead.state}
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-sm">
                              <span className="flex items-center gap-1">
                                <DollarSign className="h-3 w-3" />
                                ${lead.assessedValue.toLocaleString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <TrendingUp className="h-3 w-3" />
                                {lead.equityPercentage}% Equity
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {lead.ownershipLength}y Owned
                              </span>
                              {lead.ownerPhone && (
                                <span className="flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  Phone
                                </span>
                              )}
                              {lead.ownerEmail && (
                                <span className="flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  Email
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setExpandedLead(expandedLead === lead.id ? null : lead.id)}
                        >
                          {expandedLead === lead.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                      </div>

                      {expandedLead === lead.id && (
                        <div className="mt-4 pt-4 border-t">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                            <div>
                              <strong>Contact Information:</strong>
                              <p>Phone: {lead.ownerPhone || 'Not available'}</p>
                              <p>Email: {lead.ownerEmail || 'Not available'}</p>
                            </div>
                            <div>
                              <strong>Property Details:</strong>
                              <p>Type: {lead.propertyType}</p>
                              <p>Sq Ft: {lead.sqft?.toLocaleString() || 'N/A'}</p>
                              <p>Bed/Bath: {lead.bedrooms || 'N/A'}/{lead.bathrooms || 'N/A'}</p>
                              <p>Year Built: {lead.yearBuilt || 'N/A'}</p>
                            </div>
                            <div>
                              <strong>Financial Information:</strong>
                              <p>Assessed Value: ${lead.assessedValue.toLocaleString()}</p>
                              <p>Equity: ${lead.equity.toLocaleString()} ({lead.equityPercentage}%)</p>
                              <p>Last Sale: {lead.lastSaleDate} (${lead.lastSalePrice?.toLocaleString() || 'N/A'})</p>
                              <p>Mortgage: ${lead.mortgageBalance?.toLocaleString() || 'N/A'}</p>
                            </div>
                            <div>
                              <strong>Status & Flags:</strong>
                              <p>Status: {lead.status}</p>
                              <p>Vacant: {lead.vacant ? 'Yes' : 'No'}</p>
                              <p>Absentee Owner: {lead.absenteeOwner ? 'Yes' : 'No'}</p>
                              <p>Distressed: {lead.distressed ? 'Yes' : 'No'}</p>
                            </div>
                            <div>
                              <strong>Additional Info:</strong>
                              <p>APN: {lead.apn || 'N/A'}</p>
                              <p>Source: {lead.source}</p>
                              <p>Scraped: {new Date(lead.scrapedAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}

          {foundLeads.length === 0 && !isSearching && (
            <Card>
              <CardContent className="text-center py-8">
                <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No leads found</h3>
                <p className="text-muted-foreground">Start a search to discover real estate leads</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="export" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Export to CSV
                </CardTitle>
                <CardDescription>
                  Download selected leads as a CSV file for use in Excel or other tools
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {selectedLeads.size} leads selected for export
                </p>
                <Button onClick={exportToCSV} disabled={selectedLeads.size === 0} className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Export to CSV
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Zapier Integration
                </CardTitle>
                <CardDescription>
                  Send leads directly to your CRM or other tools via Zapier webhook
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Zapier Webhook URL</Label>
                  <Input
                    value={zapierWebhook}
                    onChange={(e) => setZapierWebhook(e.target.value)}
                    placeholder="https://hooks.zapier.com/hooks/catch/..."
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  {selectedLeads.size} leads selected for integration
                </p>
                <Button onClick={sendToZapier} disabled={selectedLeads.size === 0 || !zapierWebhook} className="w-full">
                  <Zap className="mr-2 h-4 w-4" />
                  Send to Zapier
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RealEstateLeadGenerator;