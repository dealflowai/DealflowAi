import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { Search, Download, DollarSign, Home, MapPin, Building, Database } from 'lucide-react';
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

  const searchPresets = [
    {
      name: "High Equity",
      description: "Properties with 60%+ equity",
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
      name: "Distressed",
      description: "Pre-foreclosure & vacant",
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
      name: "Absentee",
      description: "Out-of-state owners",
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
      name: "Investment",
      description: "Multi-family properties",
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
      setCurrentStep('Scraping real estate websites...');
      
      const scrapedData = await scrapeRealEstateData(searchTargets);
      
      // Step 4: Process and analyze REAL data
      setSearchProgress(60);
      setCurrentStep('Processing scraped property data with AI...');
      
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
    }

    return targets;
  };

  const scrapeRealEstateData = async (targets: string[]) => {
    try {
      const { data, error } = await supabase.functions.invoke('ai-buyer-discovery', {
        body: {
          searchCriteria: {
            targets: targets,
            filters: filters,
            searchType: 'real_estate_leads'
          }
        }
      });

      if (error) {
        throw new Error(`Edge function error: ${error.message || JSON.stringify(error)}`);
      }
      return data;
    } catch (error) {
      console.error('Scraping error:', error);
      throw error;
    }
  };

  const processPropertyData = async (scrapedData: unknown, filters: SearchFilters): Promise<PropertyLead[]> => {
    if (!scrapedData || typeof scrapedData !== 'object' || !('leads' in scrapedData) || !Array.isArray((scrapedData as any).leads)) {
      throw new Error('No property data was scraped. Please ensure your Firecrawl API key is configured correctly.');
    }

    return (scrapedData as { leads: PropertyLead[] }).leads || [];
  };

  const enhanceWithContactData = async (leads: PropertyLead[]): Promise<PropertyLead[]> => {
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

  const toggleLeadSelection = (leadId: string) => {
    const newSelection = new Set(selectedLeads);
    if (newSelection.has(leadId)) {
      newSelection.delete(leadId);
    } else {
      newSelection.add(leadId);
    }
    setSelectedLeads(newSelection);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Real Estate Lead Generator
          </CardTitle>
          <CardDescription>
            Search and discover high-quality real estate leads with AI-powered filtering
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Simplified Discovery Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Start</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {searchPresets.map((preset, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={preset.onClick}
                  className="h-auto p-3 flex flex-col items-center gap-2"
                >
                  <preset.icon className="h-4 w-4" />
                  <span className="text-xs text-center">{preset.name}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Basic Search */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Search Location</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="City, State or ZIP Code"
              value={[filters.location.city, filters.location.state, filters.location.zipCode].filter(Boolean).join(', ')}
              onChange={(e) => {
                const value = e.target.value;
                setFilters(prev => ({
                  ...prev,
                  location: {
                    ...prev.location,
                    city: value.split(',')[0]?.trim() || '',
                    state: value.split(',')[1]?.trim() || '',
                    zipCode: value.split(',')[2]?.trim() || ''
                  }
                }));
              }}
            />
            <Button 
              onClick={startAdvancedSearch}
              disabled={isSearching}
              className="w-full"
            >
              {isSearching ? (
                <>
                  <Search className="mr-2 h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Find Leads
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
              <div className="text-2xl font-bold">{foundLeads.length}</div>
              <div className="text-sm text-muted-foreground">Leads Found</div>
              {foundLeads.length > 0 && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={exportToCSV}
                  className="mt-2"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Progress */}
      {isSearching && (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Searching for leads...</span>
                <span className="text-sm text-muted-foreground">{searchProgress}%</span>
              </div>
              <Progress value={searchProgress} />
              {currentStep && (
                <p className="text-sm text-muted-foreground">{currentStep}</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Display */}
      {foundLeads.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Found Leads ({foundLeads.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {foundLeads.slice(0, 10).map((lead) => (
                <div key={lead.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{lead.ownerName}</div>
                    <div className="text-sm text-muted-foreground">
                      {lead.propertyAddress}, {lead.city}, {lead.state}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      ${lead.assessedValue?.toLocaleString()} • {lead.equityPercentage}% equity
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      Score: {lead.confidenceScore}
                    </Badge>
                    <Checkbox
                      checked={selectedLeads.has(lead.id)}
                      onCheckedChange={() => toggleLeadSelection(lead.id)}
                    />
                  </div>
                </div>
              ))}
              {foundLeads.length > 10 && (
                <div className="text-center text-sm text-muted-foreground">
                  ... and {foundLeads.length - 10} more leads
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RealEstateLeadGenerator;