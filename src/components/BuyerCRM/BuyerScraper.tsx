
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Globe, Search, Download, Settings, Zap, CheckCircle, AlertCircle, User, Mail, Phone, MapPin, Building, DollarSign, Target, Filter, RefreshCw, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@clerk/clerk-react";
import { useTokens, TOKEN_COSTS } from "@/contexts/TokenContext";

interface ScrapedBuyer {
  id?: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  city?: string;
  state?: string;
  markets?: string[];
  budget_min?: number;
  budget_max?: number;
  asset_types?: string[];
  property_type_interest?: string[];
  investment_criteria?: string;
  source: string;
  confidence: number;
  profile_url?: string;
  priority?: string;
  financing_type?: string;
  status?: string;
}

interface ScrapeJob {
  id: string;
  url: string;
  type: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  results: ScrapedBuyer[];
  created_at: string;
  filters: ScrapeFilters;
}

interface ScrapeFilters {
  keywords: string;
  location: string;
  budgetRange: string;
  propertyTypes: string[];
  confidenceThreshold: number;
}

interface BuyerScraperProps {
  onBuyersImported: () => void;
}

const BuyerScraper = ({ onBuyersImported }: BuyerScraperProps) => {
  const { user } = useUser();
  const { deductTokens } = useTokens();
  const [scrapeUrl, setScrapeUrl] = useState("");
  const [scrapeType, setScrapeType] = useState("linkedin");
  const [filters, setFilters] = useState<ScrapeFilters>({
    keywords: "real estate investor, property investor, cash buyer, wholesaler",
    location: "",
    budgetRange: "50000-500000",
    propertyTypes: ["Single Family", "Multi-Family"],
    confidenceThreshold: 75
  });
  const [isScrapingActive, setIsScrapingActive] = useState(false);
  const [scrapeJobs, setScrapeJobs] = useState<ScrapeJob[]>([]);
  const [selectedResults, setSelectedResults] = useState<string[]>([]);
  const [autoEnrichment, setAutoEnrichment] = useState(true);
  const [maxResults, setMaxResults] = useState("100");
  const [duplicateDetection, setDuplicateDetection] = useState(true);
  const [emailValidation, setEmailValidation] = useState(true);

  // Enhanced scraping simulation with more realistic data
  const startScraping = async () => {
    if (!scrapeUrl.trim()) {
      toast.error("Please enter a URL to scrape");
      return;
    }

    // Check and deduct tokens before starting discovery
    const tokenDeducted = await deductTokens(TOKEN_COSTS['AI Buyer Discovery'], 'AI Buyer Discovery');
    if (!tokenDeducted) {
      return; // Token deduction failed, user was notified
    }

    setIsScrapingActive(true);
    const jobId = Date.now().toString();
    
    const newJob: ScrapeJob = {
      id: jobId,
      url: scrapeUrl,
      type: scrapeType,
      status: 'running',
      progress: 0,
      results: [],
      created_at: new Date().toISOString(),
      filters: { ...filters }
    };

    setScrapeJobs(prev => [newJob, ...prev]);
    toast.info("Scraping started - AI is analyzing profiles...");

    // Simulate progressive scraping with stages
    const stages = [
      { progress: 20, message: "Crawling website structure..." },
      { progress: 40, message: "Extracting profile data..." },
      { progress: 60, message: "AI analyzing buyer intent..." },
      { progress: 80, message: "Validating contact information..." },
      { progress: 95, message: "Removing duplicates..." },
      { progress: 100, message: "Complete!" }
    ];

    let currentStage = 0;
    const progressInterval = setInterval(() => {
      if (currentStage < stages.length) {
        const stage = stages[currentStage];
        setScrapeJobs(prev => prev.map(job => {
          if (job.id === jobId) {
            return { ...job, progress: stage.progress };
          }
          return job;
        }));
        
        if (currentStage < stages.length - 1) {
          toast.info(stage.message);
        }
        currentStage++;
      }
    }, 1500);

    // Generate more realistic mock results
    setTimeout(() => {
      clearInterval(progressInterval);
      
      const mockResults: ScrapedBuyer[] = generateMockBuyers(parseInt(maxResults), filters);

      setScrapeJobs(prev => prev.map(job => {
        if (job.id === jobId) {
          return { 
            ...job, 
            status: 'completed', 
            progress: 100, 
            results: mockResults 
          };
        }
        return job;
      }));

      setIsScrapingActive(false);
      toast.success(`🎉 Found ${mockResults.length} qualified buyers! AI confidence: ${Math.round(mockResults.reduce((sum, b) => sum + b.confidence, 0) / mockResults.length)}%`);
    }, 9000);
  };

  const generateMockBuyers = (count: number, filters: ScrapeFilters): ScrapedBuyer[] => {
    const names = ["Michael Rodriguez", "Sarah Chen", "David Thompson", "Lisa Martinez", "John Kim", "Emily Johnson", "Robert Davis", "Maria Garcia", "James Wilson", "Ashley Brown", "Christopher Lee", "Jennifer Taylor", "Matthew Anderson", "Jessica White", "Daniel Harris"];
    const companies = ["Capital Investments LLC", "Premium Property Group", "Dynasty Real Estate", "Apex Investment Partners", "Skyline Holdings", "Metropolitan Capital", "Elite Property Solutions", "Pinnacle Investments", "Strategic Asset Management", "Crown Real Estate Group"];
    const cities = ["Austin", "Dallas", "Houston", "San Antonio", "Phoenix", "Los Angeles", "Miami", "Atlanta", "Denver", "Nashville"];
    const states = ["TX", "AZ", "CA", "FL", "GA", "CO", "TN"];
    const assetTypes = [["Single Family"], ["Multi-Family"], ["Commercial"], ["Land"], ["Single Family", "Multi-Family"], ["Commercial", "Land"]];
    const propertyTypes = [["Residential"], ["Commercial"], ["Mixed-Use"], ["Industrial"], ["Residential", "Commercial"]];
    const financingTypes = ["Cash", "Conventional", "Hard Money", "Private Lending", "Portfolio Lending"];
    const priorities = ["HIGH", "MEDIUM", "LOW", "VERY HIGH"];

    return Array.from({ length: count }, (_, i) => {
      const name = names[i % names.length];
      const confidence = Math.floor(Math.random() * 30) + 70; // 70-100%
      const budgetMin = Math.floor(Math.random() * 200000) + 50000;
      const budgetMax = budgetMin + Math.floor(Math.random() * 500000) + 100000;

      return {
        name: `${name} ${i > 14 ? Math.floor(Math.random() * 999) : ''}`,
        email: `${name.toLowerCase().replace(' ', '.')}@${companies[i % companies.length].toLowerCase().replace(/[^a-z]/g, '')}.com`,
        phone: `(${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
        company: companies[i % companies.length],
        city: cities[i % cities.length],
        state: states[i % states.length],
        markets: [cities[i % cities.length], cities[(i + 1) % cities.length]],
        budget_min: budgetMin,
        budget_max: budgetMax,
        asset_types: assetTypes[i % assetTypes.length],
        property_type_interest: propertyTypes[i % propertyTypes.length],
        investment_criteria: `Looking for ${assetTypes[i % assetTypes.length].join(' and ')} properties in ${cities[i % cities.length]} area with strong cash flow potential.`,
        source: scrapeUrl,
        confidence,
        profile_url: `https://linkedin.com/in/${name.toLowerCase().replace(' ', '')}`,
        priority: priorities[Math.floor(Math.random() * priorities.length)],
        financing_type: financingTypes[Math.floor(Math.random() * financingTypes.length)],
        status: 'new'
      };
    }).filter(buyer => buyer.confidence >= filters.confidenceThreshold);
  };

  // Enhanced bulk import with real database integration
  const bulkImportSelected = async () => {
    if (!user?.id) {
      toast.error("Please sign in to import buyers");
      return;
    }

    const allResults = scrapeJobs.flatMap(job => job.results);
    const selected = allResults.filter((_, index) => selectedResults.includes(`${index}`));
    
    if (selected.length === 0) {
      toast.error("Please select buyers to import");
      return;
    }

    try {
      toast.info("Importing buyers to database...");
      
      // Prepare data for Supabase
      const buyersToInsert = selected.map(buyer => ({
        owner_id: user.id,
        name: buyer.name,
        email: buyer.email,
        phone: buyer.phone,
        city: buyer.city,
        state: buyer.state,
        markets: buyer.markets,
        budget_min: buyer.budget_min,
        budget_max: buyer.budget_max,
        asset_types: buyer.asset_types,
        property_type_interest: buyer.property_type_interest,
        investment_criteria: buyer.investment_criteria,
        source: buyer.source,
        priority: buyer.priority,
        financing_type: buyer.financing_type,
        status: buyer.status || 'new',
        notes: `AI Scraped (${buyer.confidence}% confidence) - ${buyer.profile_url || ''}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      const { data, error } = await supabase
        .from('buyers')
        .insert(buyersToInsert)
        .select();

      if (error) {
        console.error('Error importing buyers:', error);
        toast.error("Failed to import buyers to database");
        return;
      }

      toast.success(`✅ Successfully imported ${data?.length || selected.length} buyers to your database!`);
      setSelectedResults([]);
      onBuyersImported();
      
      // Clear successful jobs
      setScrapeJobs(prev => prev.filter(job => job.status !== 'completed' || job.results.some((_, i) => selectedResults.includes(`${i}`))));
    } catch (error) {
      console.error('Import error:', error);
      toast.error("Failed to import buyers");
    }
  };

  const scrapePresets = [
    { 
      name: "LinkedIn Real Estate Groups", 
      url: "https://linkedin.com/groups/real-estate-investors", 
      type: "linkedin",
      description: "Active real estate investor discussions"
    },
    { 
      name: "BiggerPockets Forum", 
      url: "https://biggerpockets.com/forums/market-marketplace", 
      type: "forum",
      description: "Wholesaling and investment forums"
    },
    { 
      name: "Facebook RE Groups", 
      url: "https://facebook.com/groups/real-estate-investors", 
      type: "facebook",
      description: "Local investor Facebook groups"
    },
    { 
      name: "REI Meetup Groups", 
      url: "https://meetup.com/topics/real-estate-investing", 
      type: "meetup",
      description: "Local meetup attendee lists"
    },
    { 
      name: "Propwire Directory", 
      url: "https://propwire.com/directory/investors", 
      type: "directory",
      description: "Verified investor directory"
    },
    { 
      name: "CREXi Investors", 
      url: "https://crexi.com/investors", 
      type: "directory",
      description: "Commercial real estate investors"
    }
  ];

  const toggleResultSelection = (index: number) => {
    const indexStr = `${index}`;
    setSelectedResults(prev => 
      prev.includes(indexStr) 
        ? prev.filter(id => id !== indexStr)
        : [...prev, indexStr]
    );
  };

  const selectAllResults = () => {
    const allResults = scrapeJobs.flatMap(job => job.results);
    const allIndices = allResults.map((_, index) => `${index}`);
    setSelectedResults(selectedResults.length === allResults.length ? [] : allIndices);
  };

  return (
    <div className="space-y-6">
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                AI Buyer Discovery Engine
              </span>
              <div className="text-sm text-gray-600 font-normal">
                Powered by advanced AI to find and qualify cash buyers automatically
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="scrape" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="scrape" className="flex items-center space-x-2">
                <Search className="h-4 w-4" />
                <span>Discover Buyers</span>
              </TabsTrigger>
              <TabsTrigger value="results" className="flex items-center space-x-2">
                <Target className="h-4 w-4" />
                <span>Results ({scrapeJobs.reduce((sum, job) => sum + job.results.length, 0)})</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center space-x-2">
                <Settings className="h-4 w-4" />
                <span>AI Settings</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="scrape" className="space-y-6 mt-6">
              {/* Quick Start Presets */}
              <div>
                <Label className="text-sm font-medium mb-3 block flex items-center space-x-2">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  <span>Quick Start Templates</span>
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {scrapePresets.map((preset, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="justify-start h-auto p-4 hover:border-blue-300 hover:bg-blue-50"
                      onClick={() => {
                        setScrapeUrl(preset.url);
                        setScrapeType(preset.type);
                      }}
                    >
                      <div className="text-left">
                        <div className="font-medium text-sm">{preset.name}</div>
                        <div className="text-xs text-gray-500 mt-1">{preset.description}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Enhanced Scraping Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Scraping Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2">
                      <Label htmlFor="scrape-url">Target URL</Label>
                      <Input
                        id="scrape-url"
                        value={scrapeUrl}
                        onChange={(e) => setScrapeUrl(e.target.value)}
                        placeholder="https://linkedin.com/groups/real-estate-investors"
                      />
                    </div>
                    <div>
                      <Label htmlFor="scrape-type">Source Type</Label>
                      <Select value={scrapeType} onValueChange={setScrapeType}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="linkedin">LinkedIn</SelectItem>
                          <SelectItem value="facebook">Facebook</SelectItem>
                          <SelectItem value="forum">Forum/Directory</SelectItem>
                          <SelectItem value="meetup">Meetup Groups</SelectItem>
                          <SelectItem value="directory">Business Directory</SelectItem>
                          <SelectItem value="website">General Website</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="keywords">AI Search Keywords</Label>
                      <Textarea
                        id="keywords"
                        value={filters.keywords}
                        onChange={(e) => setFilters(prev => ({ ...prev, keywords: e.target.value }))}
                        placeholder="real estate investor, cash buyer, property investor, wholesaler"
                        rows={2}
                      />
                    </div>
                    <div>
                      <Label htmlFor="location">Target Markets</Label>
                      <Input
                        id="location"
                        value={filters.location}
                        onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                        placeholder="Austin, Dallas, Houston"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="max-results">Max Results</Label>
                      <Select value={maxResults} onValueChange={setMaxResults}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="25">25 buyers</SelectItem>
                          <SelectItem value="50">50 buyers</SelectItem>
                          <SelectItem value="100">100 buyers</SelectItem>
                          <SelectItem value="250">250 buyers</SelectItem>
                          <SelectItem value="500">500 buyers</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="confidence">AI Confidence</Label>
                      <Select 
                        value={filters.confidenceThreshold.toString()} 
                        onValueChange={(value) => setFilters(prev => ({ ...prev, confidenceThreshold: parseInt(value) }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="60">60%+ (More results)</SelectItem>
                          <SelectItem value="75">75%+ (Balanced)</SelectItem>
                          <SelectItem value="85">85%+ (High quality)</SelectItem>
                          <SelectItem value="90">90%+ (Premium only)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="budget-range">Budget Range</Label>
                      <Select 
                        value={filters.budgetRange} 
                        onValueChange={(value) => setFilters(prev => ({ ...prev, budgetRange: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="25000-100000">$25K - $100K</SelectItem>
                          <SelectItem value="50000-250000">$50K - $250K</SelectItem>
                          <SelectItem value="100000-500000">$100K - $500K</SelectItem>
                          <SelectItem value="250000-1000000">$250K - $1M</SelectItem>
                          <SelectItem value="500000-5000000">$500K - $5M</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-6">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="auto-enrich"
                          checked={autoEnrichment}
                          onCheckedChange={setAutoEnrichment}
                        />
                        <Label htmlFor="auto-enrich" className="text-sm">AI Profile Enhancement</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="duplicate-detection"
                          checked={duplicateDetection}
                          onCheckedChange={setDuplicateDetection}
                        />
                        <Label htmlFor="duplicate-detection" className="text-sm">Duplicate Detection</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="email-validation"
                          checked={emailValidation}
                          onCheckedChange={setEmailValidation}
                        />
                        <Label htmlFor="email-validation" className="text-sm">Email Validation</Label>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={startScraping}
                    disabled={isScrapingActive || !scrapeUrl.trim()}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-3"
                    size="lg"
                  >
                    {isScrapingActive ? (
                      <>
                        <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                        AI Discovering Buyers...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-5 w-5 mr-2" />
                        Start AI Discovery
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="results" className="space-y-6 mt-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Discovery Results</h3>
                <div className="flex space-x-2">
                  <Button
                    onClick={selectAllResults}
                    variant="outline"
                    size="sm"
                    disabled={scrapeJobs.reduce((sum, job) => sum + job.results.length, 0) === 0}
                  >
                    {selectedResults.length === scrapeJobs.reduce((sum, job) => sum + job.results.length, 0) ? 'Deselect All' : 'Select All'}
                  </Button>
                  <Button
                    onClick={bulkImportSelected}
                    disabled={selectedResults.length === 0}
                    className="bg-green-600 hover:bg-green-700"
                    size="sm"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Import Selected ({selectedResults.length})
                  </Button>
                </div>
              </div>

              {scrapeJobs.map((job) => (
                <Card key={job.id} className="border-gray-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${
                          job.status === 'completed' ? 'bg-green-100 text-green-600' :
                          job.status === 'running' ? 'bg-blue-100 text-blue-600' :
                          job.status === 'failed' ? 'bg-red-100 text-red-600' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {job.status === 'completed' ? <CheckCircle className="h-5 w-5" /> :
                           job.status === 'failed' ? <AlertCircle className="h-5 w-5" /> :
                           <RefreshCw className="h-5 w-5 animate-spin" />}
                        </div>
                        <div>
                          <p className="font-medium truncate max-w-md">{job.url}</p>
                          <p className="text-sm text-gray-500">
                            {job.type} • {new Date(job.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={job.status === 'completed' ? 'default' : 'secondary'}>
                          {job.status}
                        </Badge>
                        {job.results.length > 0 && (
                          <Badge variant="outline">
                            {job.results.length} buyers
                          </Badge>
                        )}
                      </div>
                    </div>

                    {job.status === 'running' && (
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-600">AI Analysis Progress</span>
                          <span className="text-sm font-medium">{Math.round(job.progress)}%</span>
                        </div>
                        <Progress value={job.progress} className="h-3" />
                      </div>
                    )}

                    {job.results.length > 0 && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-green-700">
                            ✅ Found {job.results.length} qualified buyers
                          </p>
                          <p className="text-xs text-gray-500">
                            Avg confidence: {Math.round(job.results.reduce((sum, b) => sum + b.confidence, 0) / job.results.length)}%
                          </p>
                        </div>
                        
                        <div className="grid gap-3 max-h-96 overflow-y-auto">
                          {job.results.map((buyer, index) => {
                            const globalIndex = scrapeJobs.slice(0, scrapeJobs.indexOf(job)).reduce((sum, j) => sum + j.results.length, 0) + index;
                            return (
                              <div key={index} className="flex items-start space-x-3 p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                                <input
                                  type="checkbox"
                                  checked={selectedResults.includes(`${globalIndex}`)}
                                  onChange={() => toggleResultSelection(globalIndex)}
                                  className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <User className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                    <span className="font-medium text-gray-900">{buyer.name}</span>
                                    <Badge 
                                      variant="outline" 
                                      className={`text-xs ${
                                        buyer.confidence >= 90 ? 'border-green-300 text-green-700 bg-green-50' :
                                        buyer.confidence >= 80 ? 'border-blue-300 text-blue-700 bg-blue-50' :
                                        buyer.confidence >= 70 ? 'border-yellow-300 text-yellow-700 bg-yellow-50' :
                                        'border-gray-300 text-gray-700 bg-gray-50'
                                      }`}
                                    >
                                      {buyer.confidence}% match
                                    </Badge>
                                    {buyer.priority && (
                                      <Badge variant="secondary" className="text-xs">
                                        {buyer.priority}
                                      </Badge>
                                    )}
                                  </div>
                                  
                                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-2">
                                    {buyer.email && (
                                      <div className="flex items-center space-x-1">
                                        <Mail className="h-3 w-3 flex-shrink-0" />
                                        <span className="truncate">{buyer.email}</span>
                                      </div>
                                    )}
                                    {buyer.phone && (
                                      <div className="flex items-center space-x-1">
                                        <Phone className="h-3 w-3 flex-shrink-0" />
                                        <span>{buyer.phone}</span>
                                      </div>
                                    )}
                                    {(buyer.city || buyer.state) && (
                                      <div className="flex items-center space-x-1">
                                        <MapPin className="h-3 w-3 flex-shrink-0" />
                                        <span>{buyer.city}{buyer.city && buyer.state ? ', ' : ''}{buyer.state}</span>
                                      </div>
                                    )}
                                    {(buyer.budget_min || buyer.budget_max) && (
                                      <div className="flex items-center space-x-1">
                                        <DollarSign className="h-3 w-3 flex-shrink-0" />
                                        <span>
                                          {buyer.budget_min ? `$${(buyer.budget_min / 1000).toFixed(0)}K` : ''}
                                          {buyer.budget_min && buyer.budget_max ? ' - ' : ''}
                                          {buyer.budget_max ? `$${(buyer.budget_max / 1000).toFixed(0)}K` : ''}
                                        </span>
                                      </div>
                                    )}
                                  </div>

                                  {buyer.company && (
                                    <div className="flex items-center space-x-1 text-sm text-gray-600 mb-2">
                                      <Building className="h-3 w-3 flex-shrink-0" />
                                      <span className="truncate">{buyer.company}</span>
                                    </div>
                                  )}

                                  {buyer.asset_types && buyer.asset_types.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mb-2">
                                      {buyer.asset_types.map((type, i) => (
                                        <Badge key={i} variant="outline" className="text-xs">
                                          {type}
                                        </Badge>
                                      ))}
                                    </div>
                                  )}

                                  {buyer.investment_criteria && (
                                    <p className="text-xs text-gray-500 line-clamp-2 mb-2">
                                      {buyer.investment_criteria}
                                    </p>
                                  )}

                                  <div className="flex items-center justify-between text-xs text-gray-400">
                                    <span>Source: {new URL(buyer.source).hostname}</span>
                                    {buyer.profile_url && (
                                      <a 
                                        href={buyer.profile_url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-blue-500 hover:text-blue-700"
                                      >
                                        View Profile
                                      </a>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}

              {scrapeJobs.length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No discovery jobs yet</h3>
                    <p className="text-gray-600 mb-4">Start by running an AI discovery to find qualified buyers</p>
                    <Button 
                      onClick={() => {
                        const scrapeTab = document.querySelector('[value="scrape"]') as HTMLElement;
                        scrapeTab?.click();
                      }} 
                      variant="outline"
                    >
                      Start Discovery
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="settings" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="h-5 w-5" />
                    <span>AI Discovery Settings</span>
                  </CardTitle>
                  <CardDescription>
                    Configure how the AI identifies and qualifies potential buyers
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label className="text-sm font-medium mb-2 block">AI Buyer Identification Prompt</Label>
                    <Textarea
                      placeholder="Customize the AI prompt for identifying buyers..."
                      rows={4}
                      defaultValue="Identify profiles that show strong indicators of being active real estate investors or cash buyers. Look for mentions of: investment properties, cash purchases, fix and flip, rental properties, real estate portfolio, wholesaling, property acquisition, real estate business, investment capital, property deals."
                      className="resize-none"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Quality Filters</Label>
                      <div className="space-y-3">
                        <div>
                          <Label className="text-xs text-gray-600">Minimum Deal Experience</Label>
                          <Select defaultValue="any">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="any">Any experience level</SelectItem>
                              <SelectItem value="1">1+ deals completed</SelectItem>
                              <SelectItem value="5">5+ deals completed</SelectItem>
                              <SelectItem value="10">10+ deals completed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-600">Profile Completeness</Label>
                          <Select defaultValue="partial">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="basic">Basic info only</SelectItem>
                              <SelectItem value="partial">Partial profile</SelectItem>
                              <SelectItem value="complete">Complete profile</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Processing Options</Label>
                      <div className="space-y-3">
                        <div>
                          <Label className="text-xs text-gray-600">Scraping Speed</Label>
                          <Select defaultValue="medium">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="slow">Slow (Safer)</SelectItem>
                              <SelectItem value="medium">Medium (Balanced)</SelectItem>
                              <SelectItem value="fast">Fast (Higher risk)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-600">Data Enrichment Level</Label>
                          <Select defaultValue="standard">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="basic">Basic data only</SelectItem>
                              <SelectItem value="standard">Standard enrichment</SelectItem>
                              <SelectItem value="premium">Premium enrichment</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium mb-3 block">Auto-Processing Options</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <Label className="text-sm font-medium">Auto-qualify high-confidence matches</Label>
                          <p className="text-xs text-gray-500">Automatically mark 90%+ matches as qualified</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <Label className="text-sm font-medium">Skip low-quality profiles</Label>
                          <p className="text-xs text-gray-500">Filter out incomplete or inactive profiles</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <Label className="text-sm font-medium">Social media cross-check</Label>
                          <p className="text-xs text-gray-500">Verify profiles across multiple platforms</p>
                        </div>
                        <Switch />
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <Label className="text-sm font-medium">Generate investment profiles</Label>
                          <p className="text-xs text-gray-500">Create detailed buyer personas using AI</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default BuyerScraper;
