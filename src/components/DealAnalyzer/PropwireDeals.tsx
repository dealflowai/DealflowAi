import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  MapPin, 
  Home, 
  Bed, 
  Bath, 
  Square, 
  TrendingUp, 
  Users, 
  Brain,
  RefreshCw,
  Save,
  Star,
  DollarSign,
  AlertTriangle,
  Zap
} from 'lucide-react';

interface PropwireDeal {
  id: string;
  address: string;
  photo?: string;
  contractPrice: number;
  estimatedARV: number;
  estimatedROI: number;
  beds: number;
  baths: number;
  sqft: number;
  tags: string[];
  aiScore: number;
  buyerMatchCount: number;
  daysOnMarket?: number;
  propertyType: string;
  city: string;
  state: string;
  zipCode: string;
}

const PropwireDeals = () => {
  const [searchFilters, setSearchFilters] = useState({
    location: '',
    minPrice: '',
    maxPrice: '',
    propertyType: 'all',
    minBeds: '',
    maxBeds: '',
    minBaths: '',
    maxBaths: '',
    distressSignals: {
      foreclosure: false,
      auction: false,
      fsbo: false,
      vacant: false,
      taxLien: false,
      absenteeOwner: false
    },
    aiScoreMin: '0',
    aiScoreMax: '100',
    buyerMatchMin: '0',
    buyerMatchMax: '100'
  });

  const [showFilters, setShowFilters] = useState(false);

  // Mock data for now
  const mockDeals: PropwireDeal[] = [
    {
      id: '1',
      address: '123 Oak Street',
      contractPrice: 85000,
      estimatedARV: 125000,
      estimatedROI: 35,
      beds: 3,
      baths: 2,
      sqft: 1200,
      tags: ['FSBO', 'Distressed'],
      aiScore: 85,
      buyerMatchCount: 3,
      daysOnMarket: 45,
      propertyType: 'Single Family',
      city: 'Atlanta',
      state: 'GA',
      zipCode: '30309'
    },
    {
      id: '2',
      address: '456 Pine Avenue',
      contractPrice: 120000,
      estimatedARV: 180000,
      estimatedROI: 42,
      beds: 4,
      baths: 3,
      sqft: 1800,
      tags: ['Vacant', 'Off-Market'],
      aiScore: 92,
      buyerMatchCount: 5,
      daysOnMarket: 12,
      propertyType: 'Single Family',
      city: 'Atlanta',
      state: 'GA',
      zipCode: '30309'
    },
    {
      id: '3',
      address: '789 Maple Drive',
      contractPrice: 65000,
      estimatedARV: 95000,
      estimatedROI: 28,
      beds: 2,
      baths: 1,
      sqft: 900,
      tags: ['Foreclosure', 'Active'],
      aiScore: 78,
      buyerMatchCount: 2,
      daysOnMarket: 67,
      propertyType: 'Condo',
      city: 'Atlanta',
      state: 'GA',
      zipCode: '30309'
    },
    {
      id: '4',
      address: '321 Cedar Lane',
      contractPrice: 200000,
      estimatedARV: 275000,
      estimatedROI: 32,
      beds: 5,
      baths: 4,
      sqft: 2400,
      tags: ['Tax Lien', 'Distressed'],
      aiScore: 88,
      buyerMatchCount: 4,
      daysOnMarket: 89,
      propertyType: 'Single Family',
      city: 'Atlanta',
      state: 'GA',
      zipCode: '30309'
    },
    {
      id: '5',
      address: '654 Birch Court',
      contractPrice: 95000,
      estimatedARV: 140000,
      estimatedROI: 38,
      beds: 3,
      baths: 2,
      sqft: 1400,
      tags: ['Absentee Owner', 'Off-Market'],
      aiScore: 90,
      buyerMatchCount: 6,
      daysOnMarket: 23,
      propertyType: 'Townhouse',
      city: 'Atlanta',
      state: 'GA',
      zipCode: '30309'
    },
    {
      id: '6',
      address: '987 Elm Street',
      contractPrice: 45000,
      estimatedARV: 75000,
      estimatedROI: 45,
      beds: 2,
      baths: 1,
      sqft: 800,
      tags: ['Auction', 'Distressed'],
      aiScore: 82,
      buyerMatchCount: 3,
      daysOnMarket: 156,
      propertyType: 'Single Family',
      city: 'Atlanta',
      state: 'GA',
      zipCode: '30309'
    }
  ];

  const [deals] = useState<PropwireDeal[]>(mockDeals);

  const handleRunAnalysis = (dealId: string) => {
    console.log('Running AI analysis for deal:', dealId);
    // Mock analysis simulation
  };

  const handleMatchBuyers = (dealId: string) => {
    console.log('Matching buyers for deal:', dealId);
    // Mock buyer matching simulation
  };

  const handleImportToPipeline = (dealId: string) => {
    console.log('Importing deal to pipeline:', dealId);
    // Mock import to pipeline
  };

  const getTagColor = (tag: string) => {
    const colors: { [key: string]: string } = {
      'FSBO': 'bg-blue-100 text-blue-800',
      'Foreclosure': 'bg-red-100 text-red-800',
      'Auction': 'bg-purple-100 text-purple-800',
      'Vacant': 'bg-yellow-100 text-yellow-800',
      'Tax Lien': 'bg-orange-100 text-orange-800',
      'Absentee Owner': 'bg-green-100 text-green-800',
      'Off-Market': 'bg-gray-100 text-gray-800',
      'Distressed': 'bg-red-100 text-red-800',
      'Active': 'bg-blue-100 text-blue-800'
    };
    return colors[tag] || 'bg-gray-100 text-gray-800';
  };

  const getAIScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 80) return 'text-blue-600 bg-blue-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="space-y-6">
      {/* Search Bar + Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Search className="w-5 h-5" />
              <span>Propwire Deal Discovery</span>
              <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                AI-Powered
              </Badge>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Main Search */}
          <div className="flex space-x-4">
            <div className="flex-1">
              <Input
                placeholder="Enter city, state, or ZIP code..."
                value={searchFilters.location}
                onChange={(e) => setSearchFilters({...searchFilters, location: e.target.value})}
              />
            </div>
            <Button className="bg-primary hover:bg-primary/90">
              <Search className="w-4 h-4 mr-2" />
              Search Deals
            </Button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="border-t pt-4 space-y-4">
              {/* Price Range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Min Price</label>
                  <Input
                    placeholder="$0"
                    value={searchFilters.minPrice}
                    onChange={(e) => setSearchFilters({...searchFilters, minPrice: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Max Price</label>
                  <Input
                    placeholder="$500,000"
                    value={searchFilters.maxPrice}
                    onChange={(e) => setSearchFilters({...searchFilters, maxPrice: e.target.value})}
                  />
                </div>
              </div>

              {/* Property Details */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Property Type</label>
                  <select 
                    className="w-full border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    value={searchFilters.propertyType}
                    onChange={(e) => setSearchFilters({...searchFilters, propertyType: e.target.value})}
                  >
                    <option value="all">All Types</option>
                    <option value="single-family">Single Family</option>
                    <option value="multi-family">Multi Family</option>
                    <option value="condo">Condo</option>
                    <option value="townhouse">Townhouse</option>
                    <option value="land">Land</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Min Beds</label>
                  <Input
                    placeholder="1"
                    value={searchFilters.minBeds}
                    onChange={(e) => setSearchFilters({...searchFilters, minBeds: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Max Beds</label>
                  <Input
                    placeholder="5+"
                    value={searchFilters.maxBeds}
                    onChange={(e) => setSearchFilters({...searchFilters, maxBeds: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Min Baths</label>
                  <Input
                    placeholder="1"
                    value={searchFilters.minBaths}
                    onChange={(e) => setSearchFilters({...searchFilters, minBaths: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Max Baths</label>
                  <Input
                    placeholder="3+"
                    value={searchFilters.maxBaths}
                    onChange={(e) => setSearchFilters({...searchFilters, maxBaths: e.target.value})}
                  />
                </div>
              </div>

              {/* Distress Signals */}
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-3">Distress Signals</label>
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                  {Object.entries(searchFilters.distressSignals).map(([key, value]) => (
                    <label key={key} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => setSearchFilters({
                          ...searchFilters,
                          distressSignals: {
                            ...searchFilters.distressSignals,
                            [key]: e.target.checked
                          }
                        })}
                        className="rounded border-input"
                      />
                      <span className="text-sm font-medium capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* AI Score & Buyer Match Ranges */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">AI Score Range</label>
                  <div className="flex items-center space-x-2">
                    <Input
                      placeholder="0"
                      value={searchFilters.aiScoreMin}
                      onChange={(e) => setSearchFilters({...searchFilters, aiScoreMin: e.target.value})}
                    />
                    <span className="text-muted-foreground">to</span>
                    <Input
                      placeholder="100"
                      value={searchFilters.aiScoreMax}
                      onChange={(e) => setSearchFilters({...searchFilters, aiScoreMax: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Buyer Match % Range</label>
                  <div className="flex items-center space-x-2">
                    <Input
                      placeholder="0"
                      value={searchFilters.buyerMatchMin}
                      onChange={(e) => setSearchFilters({...searchFilters, buyerMatchMin: e.target.value})}
                    />
                    <span className="text-muted-foreground">to</span>
                    <Input
                      placeholder="100"
                      value={searchFilters.buyerMatchMax}
                      onChange={(e) => setSearchFilters({...searchFilters, buyerMatchMax: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {deals.map((deal) => (
          <Card key={deal.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              {/* Property Image Placeholder */}
              <div className="w-full h-48 bg-muted rounded-lg mb-4 flex items-center justify-center">
                <Home className="w-16 h-16 text-muted-foreground" />
              </div>

              {/* Address & Location */}
              <div className="mb-3">
                <h3 className="font-semibold text-foreground">{deal.address}</h3>
                <p className="text-sm text-muted-foreground flex items-center">
                  <MapPin className="w-3 h-3 mr-1" />
                  {deal.city}, {deal.state} {deal.zipCode}
                </p>
              </div>

              {/* Price & Financial Info */}
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <p className="text-sm text-muted-foreground">Contract Price</p>
                  <p className="font-semibold text-foreground">
                    ${deal.contractPrice.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Est. ARV</p>
                  <p className="font-semibold text-foreground">
                    ${deal.estimatedARV.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Property Details */}
              <div className="flex items-center space-x-4 mb-3 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Bed className="w-4 h-4 mr-1" />
                  {deal.beds}
                </div>
                <div className="flex items-center">
                  <Bath className="w-4 h-4 mr-1" />
                  {deal.baths}
                </div>
                <div className="flex items-center">
                  <Square className="w-4 h-4 mr-1" />
                  {deal.sqft.toLocaleString()} ft²
                </div>
              </div>

              {/* ROI */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">Est. ROI</span>
                <Badge className="bg-green-100 text-green-800">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {deal.estimatedROI}%
                </Badge>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mb-3">
                {deal.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className={getTagColor(tag)}>
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* AI Score & Buyer Matches */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">AI Score</span>
                  <Badge className={getAIScoreColor(deal.aiScore)}>
                    {deal.aiScore}/100
                  </Badge>
                </div>
                <div className="flex items-center space-x-1 text-sm">
                  <Zap className="w-4 h-4 text-primary" />
                  <span className="font-medium text-primary">
                    {deal.buyerMatchCount} buyers match
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleRunAnalysis(deal.id)}
                  className="text-xs"
                >
                  <Brain className="w-3 h-3 mr-1" />
                  AI Analysis
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleMatchBuyers(deal.id)}
                  className="text-xs"
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Match
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleImportToPipeline(deal.id)}
                  className="text-xs"
                >
                  <Save className="w-3 h-3 mr-1" />
                  Import
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Sidebar Info (Optional) */}
      <Card>
        <CardHeader>
          <CardTitle>Market Intelligence</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-l-4 border-blue-500 pl-4">
            <p className="font-medium text-blue-700">Buyer Demand</p>
            <p className="text-sm text-muted-foreground">8 buyers active in this ZIP</p>
          </div>
          <div className="border-l-4 border-green-500 pl-4">
            <p className="font-medium text-green-700">Market Performance</p>
            <p className="text-sm text-muted-foreground">Avg ROI for this market: 35%</p>
          </div>
          <div className="border-l-4 border-purple-500 pl-4">
            <p className="font-medium text-purple-700">Popular Property Type</p>
            <p className="text-sm text-muted-foreground">Single-family homes most in demand</p>
          </div>
          <div className="border-l-4 border-orange-500 pl-4">
            <p className="font-medium text-orange-700">Deal Volume</p>
            <p className="text-sm text-muted-foreground">127 deals this month</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PropwireDeals;