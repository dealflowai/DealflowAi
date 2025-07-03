
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
import { Globe, Search, Download, Settings, Zap, CheckCircle, AlertCircle, User, Mail, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@clerk/clerk-react";

interface ScrapedBuyer {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  location?: string;
  city?: string;
  state?: string;
  source: string;
  confidence: number;
  profile_url?: string;
  estimated_budget_min?: number;
  estimated_budget_max?: number;
  asset_types?: string[];
  notes?: string;
}

interface ScrapeJob {
  id: string;
  url: string;
  type: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  results: ScrapedBuyer[];
  created_at: string;
}

interface BuyerScraperProps {
  onBuyersImported: () => void;
}

const BuyerScraper = ({ onBuyersImported }: BuyerScraperProps) => {
  const { user } = useUser();
  const { toast } = useToast();
  
  const [scrapeUrl, setScrapeUrl] = useState("");
  const [scrapeType, setScrapeType] = useState("linkedin");
  const [keywords, setKeywords] = useState("real estate investor, property investor, cash buyer");
  const [location, setLocation] = useState("");
  const [isScrapingActive, setIsScrapingActive] = useState(false);
  const [scrapeJobs, setScrapeJobs] = useState<ScrapeJob[]>([]);
  const [selectedResults, setSelectedResults] = useState<string[]>([]);
  const [autoEnrichment, setAutoEnrichment] = useState(true);
  const [maxResults, setMaxResults] = useState("50");

  const startScraping = async () => {
    if (!scrapeUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a URL to scrape",
        variant: "destructive",
      });
      return;
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
      created_at: new Date().toISOString()
    };

    setScrapeJobs(prev => [newJob, ...prev]);

    // Simulate scraping progress
    const progressInterval = setInterval(() => {
      setScrapeJobs(prev => prev.map(job => {
        if (job.id === jobId && job.progress < 100) {
          return { ...job, progress: Math.min(job.progress + Math.random() * 20, 100) };
        }
        return job;
      }));
    }, 1000);

    // Simulate completion after 5 seconds with enhanced mock data
    setTimeout(() => {
      clearInterval(progressInterval);
      
      const mockResults: ScrapedBuyer[] = [
        {
          name: "Michael Rodriguez",
          email: "m.rodriguez@investment.group",
          phone: "(555) 234-5678",
          company: "Rodriguez Investment Group",
          location: "Austin, TX",
          city: "Austin",
          state: "TX",
          source: scrapeUrl,
          confidence: 92,
          profile_url: "https://linkedin.com/in/mrodriguez",
          estimated_budget_min: 100000,
          estimated_budget_max: 500000,
          asset_types: ["Single Family", "Multi-Family"],
          notes: "Active real estate investor with 15+ years experience"
        },
        {
          name: "Sarah Kim",
          email: "sarah@cashbuyers.com",
          company: "Premium Cash Buyers",
          location: "Dallas, TX",
          city: "Dallas",
          state: "TX",
          source: scrapeUrl,
          confidence: 88,
          profile_url: "https://linkedin.com/in/sarahkim",
          estimated_budget_min: 200000,
          estimated_budget_max: 800000,
          asset_types: ["Commercial", "Land"],
          notes: "Specializes in commercial properties and development projects"
        },
        {
          name: "David Thompson",
          email: "david.t@realestate.com",
          phone: "(555) 876-5432",
          location: "Houston, TX",
          city: "Houston",
          state: "TX",
          source: scrapeUrl,
          confidence: 85,
          estimated_budget_min: 75000,
          estimated_budget_max: 300000,
          asset_types: ["Single Family"],
          notes: "First-time wholesaler, eager to learn and build portfolio"
        },
        {
          name: "Lisa Rodriguez",
          email: "lisa@capitalinvestments.com",
          phone: "(555) 321-0987",
          company: "Capital Investments LLC",
          location: "San Antonio, TX",
          city: "San Antonio",
          state: "TX",
          source: scrapeUrl,
          confidence: 90,
          estimated_budget_min: 150000,
          estimated_budget_max: 600000,
          asset_types: ["Multi-Family", "Commercial"],
          notes: "Experienced investor looking for apartment buildings and strip centers"
        }
      ];

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
      toast({
        title: "Success",
        description: `Found ${mockResults.length} potential buyers!`,
      });
    }, 5000);
  };

  const bulkImportSelected = async () => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to import buyers",
        variant: "destructive",
      });
      return;
    }

    const allResults = scrapeJobs.flatMap(job => job.results);
    const selected = allResults.filter((_, index) => selectedResults.includes(index.toString()));
    
    if (selected.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one buyer to import",
        variant: "destructive",
      });
      return;
    }

    try {
      const buyersToInsert = selected.map(buyer => ({
        owner_id: user.id,
        name: buyer.name,
        email: buyer.email || null,
        phone: buyer.phone || null,
        city: buyer.city || null,
        state: buyer.state || null,
        source: `Scraped from ${buyer.source}`,
        status: 'new',
        priority: buyer.confidence >= 90 ? 'HIGH' : buyer.confidence >= 80 ? 'MEDIUM' : 'LOW',
        budget_min: buyer.estimated_budget_min || null,
        budget_max: buyer.estimated_budget_max || null,
        asset_types: buyer.asset_types || null,
        notes: buyer.notes || null,
        contact_info: buyer.profile_url || null,
        portfolio_summary: buyer.company || null,
        tags: buyer.confidence >= 85 ? ['High Confidence', 'Scraped'] : ['Scraped']
      }));

      const { error } = await supabase
        .from('buyers')
        .insert(buyersToInsert);

      if (error) {
        console.error('Error importing buyers:', error);
        toast({
          title: "Error",
          description: "Failed to import buyers. Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: `Successfully imported ${selected.length} buyers to your database!`,
      });
      
      setSelectedResults([]);
      onBuyersImported();
    } catch (error) {
      console.error('Error importing buyers:', error);
      toast({
        title: "Error",
        description: "Failed to import buyers. Please try again.",
        variant: "destructive",
      });
    }
  };

  const scrapePresets = [
    { name: "LinkedIn Real Estate Groups", url: "https://linkedin.com/groups/real-estate-investors", type: "linkedin" },
    { name: "BiggerPockets Forum", url: "https://biggerpockets.com/forums", type: "forum" },
    { name: "Facebook RE Groups", url: "https://facebook.com/groups/real-estate", type: "facebook" },
    { name: "REIA Directory", url: "https://nationalreia.org/find-reia", type: "directory" }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Globe className="h-6 w-6 text-blue-600" />
          <span>Buyer Discovery Engine</span>
        </CardTitle>
        <CardDescription>
          Automatically find and import potential buyers from websites, social media, and directories
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="scrape" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="scrape">Discover Sources</TabsTrigger>
            <TabsTrigger value="results">Results & Import</TabsTrigger>
            <TabsTrigger value="settings">Configuration</TabsTrigger>
          </TabsList>

          <TabsContent value="scrape" className="space-y-6">
            {/* Quick Presets */}
            <div>
              <Label className="text-sm font-medium mb-3 block">Quick Start Templates</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {scrapePresets.map((preset, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="justify-start h-auto p-4 hover:bg-blue-50"
                    onClick={() => {
                      setScrapeUrl(preset.url);
                      setScrapeType(preset.type);
                    }}
                  >
                    <div className="text-left">
                      <div className="font-medium">{preset.name}</div>
                      <div className="text-xs text-gray-500 truncate mt-1">{preset.url}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            {/* Manual URL Input */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="scrape-url">Target URL</Label>
                  <Input
                    id="scrape-url"
                    value={scrapeUrl}
                    onChange={(e) => setScrapeUrl(e.target.value)}
                    placeholder="https://linkedin.com/groups/real-estate-investors"
                  />
                </div>
                <div>
                  <Label htmlFor="scrape-type">Platform Type</Label>
                  <Select value={scrapeType} onValueChange={setScrapeType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="linkedin">LinkedIn</SelectItem>
                      <SelectItem value="facebook">Facebook</SelectItem>
                      <SelectItem value="forum">Forum/Directory</SelectItem>
                      <SelectItem value="website">General Website</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="keywords">Search Keywords</Label>
                  <Input
                    id="keywords"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    placeholder="real estate investor, cash buyer"
                  />
                </div>
                <div>
                  <Label htmlFor="location">Target Location</Label>
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Austin, TX"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center space-x-2">
                  <Label htmlFor="max-results" className="text-sm">Max Results:</Label>
                  <Select value={maxResults} onValueChange={setMaxResults}>
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                      <SelectItem value="250">250</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="auto-enrich"
                    checked={autoEnrichment}
                    onCheckedChange={setAutoEnrichment}
                  />
                  <Label htmlFor="auto-enrich" className="text-sm">AI Enhancement</Label>
                </div>
              </div>

              <Button
                onClick={startScraping}
                disabled={isScrapingActive}
                className="w-full bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
                size="lg"
              >
                {isScrapingActive ? (
                  <>
                    <Zap className="h-4 w-4 mr-2 animate-spin" />
                    Discovering Buyers...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Start Discovery
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="results" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Discovery Results</h3>
              <Button
                onClick={bulkImportSelected}
                disabled={selectedResults.length === 0}
                className="bg-green-600 hover:bg-green-700"
              >
                <Download className="h-4 w-4 mr-2" />
                Import Selected ({selectedResults.length})
              </Button>
            </div>

            {scrapeJobs.map((job) => (
              <Card key={job.id} className="border-l-4 border-l-blue-500">
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
                         <Zap className="h-5 w-5" />}
                      </div>
                      <div>
                        <p className="font-medium truncate max-w-md">{job.url}</p>
                        <p className="text-sm text-gray-500">
                          {job.type} • {new Date(job.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <Badge variant={job.status === 'completed' ? 'default' : 'secondary'} className="capitalize">
                      {job.status}
                    </Badge>
                  </div>

                  {job.status === 'running' && (
                    <div className="mb-4">
                      <Progress value={job.progress} className="h-2" />
                      <p className="text-xs text-gray-500 mt-1">{Math.round(job.progress)}% complete</p>
                    </div>
                  )}

                  {job.results.length > 0 && (
                    <div className="space-y-4">
                      <p className="text-sm font-medium text-green-700">
                        🎉 Found {job.results.length} potential buyers
                      </p>
                      <div className="grid gap-4">
                        {job.results.map((buyer, index) => (
                          <div key={index} className="flex items-start space-x-3 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border">
                            <input
                              type="checkbox"
                              checked={selectedResults.includes(index.toString())}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedResults([...selectedResults, index.toString()]);
                                } else {
                                  setSelectedResults(selectedResults.filter(id => id !== index.toString()));
                                }
                              }}
                              className="mt-1 rounded"
                            />
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <User className="h-4 w-4 text-gray-400" />
                                <span className="font-medium text-lg">{buyer.name}</span>
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${
                                    buyer.confidence >= 90 ? 'bg-green-100 text-green-800' :
                                    buyer.confidence >= 80 ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}
                                >
                                  {buyer.confidence}% confidence
                                </Badge>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 mb-2">
                                {buyer.email && (
                                  <div className="flex items-center space-x-1">
                                    <Mail className="h-3 w-3" />
                                    <span>{buyer.email}</span>
                                  </div>
                                )}
                                {buyer.phone && (
                                  <div className="flex items-center space-x-1">
                                    <Phone className="h-3 w-3" />
                                    <span>{buyer.phone}</span>
                                  </div>
                                )}
                                {buyer.location && (
                                  <div className="flex items-center space-x-1">
                                    <span>📍 {buyer.location}</span>
                                  </div>
                                )}
                                {buyer.estimated_budget_min && buyer.estimated_budget_max && (
                                  <div className="flex items-center space-x-1">
                                    <span>💰 ${buyer.estimated_budget_min.toLocaleString()} - ${buyer.estimated_budget_max.toLocaleString()}</span>
                                  </div>
                                )}
                              </div>
                              
                              {buyer.company && (
                                <p className="text-sm font-medium text-gray-700 mb-1">{buyer.company}</p>
                              )}
                              
                              {buyer.asset_types && buyer.asset_types.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-2">
                                  {buyer.asset_types.map((type, typeIndex) => (
                                    <Badge key={typeIndex} variant="secondary" className="text-xs">
                                      {type}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                              
                              {buyer.notes && (
                                <p className="text-sm text-gray-600 italic">{buyer.notes}</p> 
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {scrapeJobs.length === 0 && (
              <Card className="border-dashed">
                <CardContent className="p-12 text-center">
                  <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No discovery jobs yet</h3>
                  <p className="text-gray-600">Start by discovering buyers from a source to see results here</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>Discovery Configuration</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="text-base font-medium">AI Buyer Identification Prompt</Label>
                  <p className="text-sm text-gray-600 mb-2">Customize how AI identifies potential buyers</p>
                  <Textarea
                    placeholder="Customize AI prompt for buyer identification..."
                    rows={4}
                    defaultValue="Look for profiles mentioning: real estate investor, property investor, cash buyer, wholesaler, fix and flip, rental property owner, house flipper, real estate developer, investment company"
                    className="resize-none"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-base font-medium">Confidence Threshold</Label>
                    <p className="text-sm text-gray-600 mb-2">Minimum confidence score to include results</p>
                    <Select defaultValue="75">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="60">60% - More results, lower quality</SelectItem>
                        <SelectItem value="75">75% - Balanced approach</SelectItem>
                        <SelectItem value="85">85% - High quality only</SelectItem>
                        <SelectItem value="90">90% - Premium quality</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="text-base font-medium">Rate Limiting</Label>
                    <p className="text-sm text-gray-600 mb-2">Control scraping speed</p>
                    <Select defaultValue="medium">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="slow">Slow & Safe</SelectItem>
                        <SelectItem value="medium">Medium Speed</SelectItem>
                        <SelectItem value="fast">Fast (Higher Risk)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-base font-medium">Auto-Processing Options</Label>
                  <div className="space-y-3">
                    {[
                      { id: "auto-qualify", label: "Auto-qualification after discovery", desc: "Automatically assign quality scores" },
                      { id: "remove-duplicates", label: "Remove duplicate contacts", desc: "Skip buyers already in your database" },
                      { id: "email-validation", label: "Email validation", desc: "Verify email addresses are valid" },
                      { id: "phone-validation", label: "Phone number validation", desc: "Clean and format phone numbers" }
                    ].map((option) => (
                      <div key={option.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <Label htmlFor={option.id} className="font-medium">{option.label}</Label>
                          <p className="text-sm text-gray-600">{option.desc}</p>
                        </div>
                        <Switch id={option.id} defaultChecked />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default BuyerScraper;
