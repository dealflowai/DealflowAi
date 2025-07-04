import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import DealComparison from '@/components/Marketplace/DealComparison';
import SavedSearches from '@/components/Marketplace/SavedSearches';
import DealMatchingEngine from '@/components/Marketplace/DealMatchingEngine';
import AutomationHub from '@/components/Marketplace/AutomationHub';
import IntegratedDashboard from '@/components/Marketplace/IntegratedDashboard';
import { MarketplaceProvider, useMarketplace } from '@/contexts/MarketplaceContext';
import { 
  Search, 
  Bell, 
  Plus, 
  Trash2, 
  Edit2, 
  MapPin,
  DollarSign,
  Home,
  Calendar,
  AlertCircle
} from 'lucide-react';

const MarketplaceContent: React.FC = () => {
  const {
    deals,
    filteredDeals,
    buyers,
    savedSearches,
    comparisonDeals,
    selectedDeals,
    addToComparison,
    removeFromComparison,
    clearComparison,
    updateSearchCriteria,
    toggleDealSelection,
    setDeals,
    setBuyers
  } = useMarketplace();

  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000]);
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [minROI, setMinROI] = useState<number | undefined>(undefined);
  const [isAlertsEnabled, setIsAlertsEnabled] = useState(true);

  const [showComparison, setShowComparison] = useState(false);
  const [activeTab, setActiveTab] = useState('deals');

  // Initialize mock data
  useEffect(() => {
    const mockDeals = [
      {
        id: 1,
        title: "Renovated Colonial in Historic District",
        address: "123 Oak Street, Atlanta, GA 30309",
        price: 89000,
        arv: 145000,
        roiEstimate: 32,
        sqft: 1450,
        bedrooms: 3,
        bathrooms: 2,
        yearBuilt: 1925,
        repairEstimate: 15000,
        daysOnMarket: 12,
        dealType: "Fix & Flip",
        type: "Single Family",
        poster: "Mike Johnson",
        posterRating: 4.8
      },
      {
        id: 2,
        title: "Modern Condo with City Views",
        address: "456 Highrise Ave, Miami, FL 33130",
        price: 249000,
        arv: 320000,
        roiEstimate: 26,
        sqft: 980,
        bedrooms: 2,
        bathrooms: 2,
        yearBuilt: 2018,
        repairEstimate: 5000,
        daysOnMarket: 28,
        dealType: "Buy & Hold",
        type: "Condo",
        poster: "Sarah Lee",
        posterRating: 4.5
      },
      {
        id: 3,
        title: "Fixer-Upper Bungalow Near Downtown",
        address: "789 Lowland Rd, Houston, TX 77002",
        price: 65000,
        arv: 110000,
        roiEstimate: 40,
        sqft: 820,
        bedrooms: 2,
        bathrooms: 1,
        yearBuilt: 1948,
        repairEstimate: 20000,
        daysOnMarket: 5,
        dealType: "Wholesale",
        type: "Single Family",
        poster: "Kevin Tran",
        posterRating: 4.9
      },
      {
        id: 4,
        title: "Spacious Townhouse in Gated Community",
        address: "101 Park Ln, San Diego, CA 92101",
        price: 420000,
        arv: 550000,
        roiEstimate: 18,
        sqft: 1600,
        bedrooms: 3,
        bathrooms: 3,
        yearBuilt: 2005,
        repairEstimate: 8000,
        daysOnMarket: 45,
        dealType: "BRRRR",
        type: "Townhouse",
        poster: "Emily Davis",
        posterRating: 4.7
      },
      {
        id: 5,
        title: "Charming Victorian with Garden",
        address: "222 Bloom St, Denver, CO 80206",
        price: 310000,
        arv: 400000,
        roiEstimate: 22,
        sqft: 1200,
        bedrooms: 3,
        bathrooms: 2,
        yearBuilt: 1895,
        repairEstimate: 12000,
        daysOnMarket: 20,
        dealType: "Buy & Hold",
        type: "Single Family",
        poster: "Chris Evans",
        posterRating: 4.6
      },
      {
        id: 6,
        title: "Cozy Cabin in the Woods",
        address: "333 Forest Rd, Asheville, NC 28801",
        price: 175000,
        arv: 250000,
        roiEstimate: 28,
        sqft: 750,
        bedrooms: 1,
        bathrooms: 1,
        yearBuilt: 1970,
        repairEstimate: 10000,
        daysOnMarket: 30,
        dealType: "Fix & Flip",
        type: "Cabin",
        poster: "Megan White",
        posterRating: 4.4
      },
      {
        id: 7,
        title: "Luxury Penthouse with Ocean View",
        address: "444 Ocean Dr, Los Angeles, CA 90001",
        price: 950000,
        arv: 1200000,
        roiEstimate: 15,
        sqft: 2100,
        bedrooms: 3,
        bathrooms: 3,
        yearBuilt: 2010,
        repairEstimate: 3000,
        daysOnMarket: 60,
        dealType: "BRRRR",
        type: "Condo",
        poster: "David Green",
        posterRating: 4.8
      },
      {
        id: 8,
        title: "Affordable Starter Home in Suburbs",
        address: "555 Quiet Ln, Orlando, FL 32801",
        price: 120000,
        arv: 180000,
        roiEstimate: 35,
        sqft: 1100,
        bedrooms: 3,
        bathrooms: 2,
        yearBuilt: 1985,
        repairEstimate: 18000,
        daysOnMarket: 10,
        dealType: "Wholesale",
        type: "Single Family",
        poster: "Laura Kim",
        posterRating: 4.7
      },
      {
        id: 9,
        title: "Rustic Farmhouse with Acreage",
        address: "666 Country Rd, Austin, TX 78701",
        price: 550000,
        arv: 700000,
        roiEstimate: 20,
        sqft: 2500,
        bedrooms: 4,
        bathrooms: 3,
        yearBuilt: 1920,
        repairEstimate: 25000,
        daysOnMarket: 50,
        dealType: "Buy & Hold",
        type: "Farmhouse",
        poster: "Robert Smith",
        posterRating: 4.5
      },
      {
        id: 10,
        title: "Downtown Loft with Exposed Brick",
        address: "777 Main St, Chicago, IL 60601",
        price: 380000,
        arv: 480000,
        roiEstimate: 24,
        sqft: 1350,
        bedrooms: 2,
        bathrooms: 2,
        yearBuilt: 1930,
        repairEstimate: 7000,
        daysOnMarket: 35,
        dealType: "Fix & Flip",
        type: "Loft",
        poster: "Jennifer Lee",
        posterRating: 4.9
      }
    ];

    const mockBuyers = [
      {
        id: '1',
        buyer: 'Premium Investments LLC',
        budget: '50K - 150K',
        type: 'Fix & Flip',
        location: 'Southeast US (GA, AL, TN)',
        preferredAreas: ['Atlanta', 'Birmingham', 'Nashville'],
        buyerRating: 4.9,
        dealsClosed: 47
      },
      {
        id: '2',
        buyer: 'Global Holdings Group',
        budget: '200K - 500K',
        type: 'Buy & Hold',
        location: 'Nationwide',
        preferredAreas: ['Miami', 'Los Angeles', 'Chicago'],
        buyerRating: 4.7,
        dealsClosed: 62
      },
      {
        id: '3',
        buyer: 'Capital Ventures Inc.',
        budget: '50K - 250K',
        type: 'Wholesale',
        location: 'Texas',
        preferredAreas: ['Houston', 'Austin', 'Dallas'],
        buyerRating: 4.6,
        dealsClosed: 35
      },
      {
        id: '4',
        buyer: 'Elite Property Partners',
        budget: '300K - 750K',
        type: 'BRRRR',
        location: 'California',
        preferredAreas: ['San Diego', 'San Francisco', 'Sacramento'],
        buyerRating: 4.8,
        dealsClosed: 51
      },
      {
        id: '5',
        buyer: 'Strategic Asset Group',
        budget: '100K - 300K',
        type: 'Fix & Flip',
        location: 'Colorado',
        preferredAreas: ['Denver', 'Boulder', 'Colorado Springs'],
        buyerRating: 4.5,
        dealsClosed: 40
      }
    ];

    setDeals(mockDeals);
    setBuyers(mockBuyers);
  }, []);

  const handleApplySearch = (criteria: any) => {
    updateSearchCriteria(criteria);
    setActiveTab('deals');
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Advanced Marketplace</h1>
          <p className="text-gray-600">AI-powered deal matching and automation</p>
        </div>
        {comparisonDeals.length > 0 && (
          <Button onClick={() => setShowComparison(true)} className="flex items-center space-x-2">
            <span>Compare Deals ({comparisonDeals.length})</span>
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="deals">Browse Deals</TabsTrigger>
          <TabsTrigger value="matching">AI Matching</TabsTrigger>
          <TabsTrigger value="searches">Saved Searches</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <IntegratedDashboard />
        </TabsContent>

        <TabsContent value="deals">
          {/* Enhanced deals browsing with all the existing functionality */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              {/* Enhanced filters */}
              <Card>
                <CardHeader>
                  <CardTitle>Smart Filters</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="searchTerm">Search Term</Label>
                    <Input
                      id="searchTerm"
                      placeholder="Address, city, or keyword"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Price Range (${priceRange[0].toLocaleString()} - ${priceRange[1].toLocaleString()})</Label>
                    <Slider
                      defaultValue={[priceRange[0], priceRange[1]]}
                      max={1000000}
                      step={10000}
                      onValueChange={(value) => setPriceRange([value[0], value[1]])}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Property Types</Label>
                    <div className="flex flex-wrap gap-2">
                      {['Single Family', 'Condo', 'Townhouse', 'Multi-family', 'Land'].map((type) => (
                        <div key={type} className="flex items-center space-x-2">
                          <Checkbox
                            id={`type-${type}`}
                            checked={selectedTypes.includes(type)}
                            onCheckedChange={(checked) =>
                              setSelectedTypes(checked
                                ? [...selectedTypes, type]
                                : selectedTypes.filter((t) => t !== type))
                            }
                          />
                          <Label htmlFor={`type-${type}`}>{type}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>States</Label>
                    <Select onValueChange={(value) => setSelectedStates([value])}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a state" />
                      </SelectTrigger>
                      <SelectContent>
                        {['GA', 'FL', 'TX', 'CA', 'CO', 'NC', 'IL'].map((state) => (
                          <SelectItem key={state} value={state}>{state}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="minROI">Min ROI (%)</Label>
                    <Input
                      id="minROI"
                      type="number"
                      placeholder="Minimum ROI"
                      value={minROI === undefined ? '' : minROI.toString()}
                      onChange={(e) => setMinROI(e.target.value === '' ? undefined : Number(e.target.value))}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch id="alerts" checked={isAlertsEnabled} onCheckedChange={setIsAlertsEnabled} />
                    <Label htmlFor="alerts">Enable Alerts</Label>
                  </div>

                  <Button
                    className="w-full"
                    onClick={() =>
                      updateSearchCriteria({
                        searchTerm,
                        priceRange,
                        states: selectedStates,
                        types: selectedTypes,
                        minROI,
                        alertsEnabled: isAlertsEnabled,
                      })
                    }
                  >
                    Apply Filters
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-3">
              {/* Enhanced deal cards with integration */}
              <div className="space-y-4">
                {filteredDeals.length === 0 ? (
                  <Card className="text-center py-12">
                    <CardContent>
                      <p className="text-gray-500">No deals match your current filters.</p>
                      <Button 
                        variant="outline" 
                        className="mt-4"
                        onClick={() => updateSearchCriteria({})}
                      >
                        Clear Filters
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  filteredDeals.map((deal) => (
                    <Card key={deal.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold mb-2">{deal.title}</h3>
                            <p className="text-gray-600 mb-3">{deal.address}</p>
                            
                            <div className="grid grid-cols-3 gap-4 mb-4">
                              <div className="text-center p-3 bg-green-50 rounded-lg">
                                <p className="text-2xl font-bold text-green-600">${deal.price.toLocaleString()}</p>
                                <p className="text-sm text-gray-600">Price</p>
                              </div>
                              <div className="text-center p-3 bg-blue-50 rounded-lg">
                                <p className="text-2xl font-bold text-blue-600">{deal.roiEstimate}%</p>
                                <p className="text-sm text-gray-600">Est. ROI</p>
                              </div>
                              <div className="text-center p-3 bg-purple-50 rounded-lg">
                                <p className="text-2xl font-bold text-purple-600">${deal.arv.toLocaleString()}</p>
                                <p className="text-sm text-gray-600">ARV</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-col space-y-2 ml-6">
                            <Checkbox
                              checked={selectedDeals.includes(deal.id)}
                              onCheckedChange={() => toggleDealSelection(deal.id)}
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => addToComparison(deal)}
                              disabled={comparisonDeals.find(d => d.id === deal.id) !== undefined}
                            >
                              {comparisonDeals.find(d => d.id === deal.id) ? 'Added' : 'Compare'}
                            </Button>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-4">
                          <Badge variant="outline">{deal.type}</Badge>
                          <Badge variant="outline">{deal.dealType}</Badge>
                          <Badge variant="outline">{deal.bedrooms} bed / {deal.bathrooms} bath</Badge>
                          <Badge variant="outline">{deal.sqft.toLocaleString()} sq ft</Badge>
                        </div>

                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                              {deal.poster.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <p className="text-sm font-medium">{deal.poster}</p>
                              <p className="text-xs text-gray-500">Rating: {deal.posterRating} ⭐</p>
                            </div>
                          </div>
                          
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">View Details</Button>
                            <Button size="sm">Contact Seller</Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="matching">
          <DealMatchingEngine deals={deals} buyers={buyers} />
        </TabsContent>

        <TabsContent value="searches">
          <SavedSearches onApplySearch={handleApplySearch} />
        </TabsContent>

        <TabsContent value="automation">
          <AutomationHub />
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Market Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span>Average Deal ROI</span>
                    <span className="font-bold text-green-600">26.4%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span>Total Deal Volume</span>
                    <span className="font-bold text-blue-600">${(deals.reduce((acc, deal) => acc + deal.price, 0)).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                    <span>Active Buyers</span>
                    <span className="font-bold text-purple-600">{buyers.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Automation Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                    <span>AI Matches Today</span>
                    <span className="font-bold text-yellow-600">{Math.floor(deals.length * 0.3)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                    <span>Alerts Sent</span>
                    <span className="font-bold text-red-600">{savedSearches.reduce((acc, s) => acc + s.newResultsCount, 0)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-indigo-50 rounded-lg">
                    <span>Success Rate</span>
                    <span className="font-bold text-indigo-600">87%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Deal Comparison Modal */}
      {showComparison && (
        <DealComparison
          deals={comparisonDeals}
          onRemove={removeFromComparison}
          onClose={() => setShowComparison(false)}
        />
      )}
    </div>
  );
};

const Marketplace: React.FC = () => {
  return (
    <MarketplaceProvider>
      <MarketplaceContent />
    </MarketplaceProvider>
  );
};

export default Marketplace;
