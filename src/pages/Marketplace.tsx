import React, { useState, useMemo } from 'react';
import Layout from '@/components/Layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import DealComparison from '@/components/Marketplace/DealComparison';
import SavedSearches from '@/components/Marketplace/SavedSearches';
import DealMatchingEngine from '@/components/Marketplace/DealMatchingEngine';
import { 
  Search, 
  MapPin, 
  DollarSign, 
  Calendar, 
  Users, 
  Plus, 
  Filter,
  Star,
  Heart,
  Share2,
  Eye,
  TrendingUp,
  Building,
  Home,
  Bookmark,
  Bell,
  SlidersHorizontal,
  Clock,
  Target,
  Award,
  BarChart3,
  Zap,
  GitCompare,
  Brain,
  Layers,
  Settings
} from 'lucide-react';

const Marketplace = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('deals');
  const [sortBy, setSortBy] = useState('newest');
  const [priceRange, setPriceRange] = useState([0, 500000]);
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [savedDeals, setSavedDeals] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [comparisonDeals, setComparisonDeals] = useState<number[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [showAdvancedFeatures, setShowAdvancedFeatures] = useState(false);

  const deals = [
    {
      id: 1,
      title: '3BR/2BA Single Family Home - Great Investment',
      address: '1234 Oak Street, Atlanta, GA 30309',
      price: 85000,
      arv: 120000,
      type: 'Wholesale',
      dealType: 'Single Family',
      postedDate: '2024-01-15',
      poster: 'Mike Johnson',
      posterRating: 4.8,
      status: 'Active',
      images: ['/placeholder.svg'],
      sqft: 1200,
      bedrooms: 3,
      bathrooms: 2,
      yearBuilt: 1985,
      roiEstimate: 28,
      repairEstimate: 25000,
      description: 'Excellent investment opportunity in up-and-coming neighborhood. Property needs cosmetic updates but has great bones.',
      featured: true,
      views: 145,
      inquiries: 12,
      daysOnMarket: 2
    },
    {
      id: 2,
      title: 'Duplex Investment Property - Cash Flow Ready',
      address: '5678 Pine Ave, Birmingham, AL 35203',
      price: 65000,
      arv: 95000,
      type: 'Assignment',
      dealType: 'Multi-family',
      postedDate: '2024-01-10',
      poster: 'Sarah Wilson',
      posterRating: 4.6,
      status: 'Under Contract',
      images: ['/placeholder.svg'],
      sqft: 1800,
      bedrooms: 4,
      bathrooms: 2,
      yearBuilt: 1978,
      roiEstimate: 35,
      repairEstimate: 15000,
      description: 'Great duplex with separate entrances. One unit rented, other ready to rent.',
      featured: false,
      views: 89,
      inquiries: 8,
      daysOnMarket: 7
    },
    {
      id: 3,
      title: 'Fix & Flip Opportunity - Prime Location',
      address: '9012 Maple Dr, Nashville, TN 37203',
      price: 45000,
      arv: 85000,
      type: 'Wholesale',
      dealType: 'Single Family',
      postedDate: '2024-01-12',
      poster: 'David Chen',
      posterRating: 4.9,
      status: 'Active',
      images: ['/placeholder.svg'],
      sqft: 1050,
      bedrooms: 2,
      bathrooms: 1,
      yearBuilt: 1965,
      roiEstimate: 42,
      repairEstimate: 30000,
      description: 'Perfect flip opportunity in trendy neighborhood. High demand area with quick sales.',
      featured: true,
      views: 203,
      inquiries: 18,
      daysOnMarket: 3
    }
  ];

  const buyerRequests = [
    {
      id: '1',
      buyer: 'Jennifer Smith',
      buyerRating: 4.7,
      criteria: 'SFH $50K-$100K in Metro Atlanta',
      budget: '50K - 100K',
      type: 'Single Family',
      location: 'Atlanta Metro',
      postedDate: '2024-01-14',
      urgency: 'High',
      dealsClosed: 12,
      preferredAreas: ['Decatur', 'East Atlanta', 'Grant Park'],
      financingReady: true
    },
    {
      id: '2',
      buyer: 'Robert Davis',
      buyerRating: 4.5,
      criteria: 'Multi-family properties in Birmingham',
      budget: '75K - 150K',
      type: 'Multi-family',
      location: 'Birmingham, AL',
      postedDate: '2024-01-11',
      urgency: 'Medium',
      dealsClosed: 8,
      preferredAreas: ['Highland Park', 'Forest Park', 'Crestwood'],
      financingReady: true
    }
  ];

  const states = ['GA', 'AL', 'TN', 'FL', 'NC', 'SC'];
  const propertyTypes = ['Single Family', 'Multi-family', 'Condo', 'Townhouse', 'Commercial'];

  const filteredDeals = useMemo(() => {
    return deals.filter(deal => {
      const matchesSearch = deal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           deal.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           deal.poster.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesPrice = deal.price >= priceRange[0] && deal.price <= priceRange[1];
      
      const matchesState = selectedStates.length === 0 || 
                          selectedStates.some(state => deal.address.includes(state));
      
      const matchesType = selectedTypes.length === 0 || 
                         selectedTypes.includes(deal.dealType);

      return matchesSearch && matchesPrice && matchesState && matchesType;
    }).sort((a, b) => {
      switch (sortBy) {
        case 'price-low': return a.price - b.price;
        case 'price-high': return b.price - a.price;
        case 'roi': return b.roiEstimate - a.roiEstimate;
        case 'newest': return new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime();
        case 'popular': return b.views - a.views;
        default: return 0;
      }
    });
  }, [searchTerm, priceRange, selectedStates, selectedTypes, sortBy]);

  const toggleSavedDeal = (dealId: string) => {
    setSavedDeals(prev => 
      prev.includes(dealId) 
        ? prev.filter(id => id !== dealId)
        : [...prev, dealId]
    );
  };

  const handleStateChange = (state: string, checked: boolean) => {
    setSelectedStates(prev =>
      checked ? [...prev, state] : prev.filter(s => s !== state)
    );
  };

  const handleTypeChange = (type: string, checked: boolean) => {
    setSelectedTypes(prev =>
      checked ? [...prev, type] : prev.filter(t => t !== type)
    );
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'High': return 'bg-red-100 text-red-800 border-red-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const toggleComparison = (dealId: number) => {
    setComparisonDeals(prev => 
      prev.includes(dealId) 
        ? prev.filter(id => id !== dealId)
        : [...prev, dealId].slice(0, 4) // Max 4 deals for comparison
    );
  };

  const handleApplySearch = (criteria: any) => {
    if (criteria.searchTerm) setSearchTerm(criteria.searchTerm);
    if (criteria.priceRange) setPriceRange(criteria.priceRange);
    if (criteria.states) setSelectedStates(criteria.states);
    if (criteria.types) setSelectedTypes(criteria.types);
  };

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 space-y-4 md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
              <Building className="w-8 h-8 text-blue-600" />
              <span>Advanced Marketplace</span>
              <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                AI-Powered
              </Badge>
            </h1>
            <p className="text-gray-600 mt-1">Intelligent deal discovery with advanced matching and analytics</p>
          </div>
          <div className="flex space-x-3">
            <Button 
              variant="outline" 
              className="flex items-center space-x-2"
              onClick={() => setShowAdvancedFeatures(!showAdvancedFeatures)}
            >
              <Settings className="w-4 h-4" />
              <span>Advanced Features</span>
            </Button>
            <Button variant="outline" className="flex items-center space-x-2">
              <Bell className="w-4 h-4" />
              <span>Alerts</span>
            </Button>
            <Button className="gradient-primary flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Post Deal</span>
            </Button>
          </div>
        </div>

        {/* Advanced Features Panel */}
        {showAdvancedFeatures && (
          <Card className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-blue-600" />
                <span>Advanced Features</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col items-center space-y-2"
                  onClick={() => setActiveTab('matching')}
                >
                  <Brain className="w-6 h-6 text-purple-600" />
                  <span className="text-sm">AI Matching</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col items-center space-y-2"
                  onClick={() => setActiveTab('saved-searches')}
                >
                  <Bookmark className="w-6 h-6 text-green-600" />
                  <span className="text-sm">Saved Searches</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col items-center space-y-2"
                  onClick={() => setShowComparison(true)}
                  disabled={comparisonDeals.length < 2}
                >
                  <GitCompare className="w-6 h-6 text-blue-600" />
                  <span className="text-sm">Compare ({comparisonDeals.length})</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col items-center space-y-2"
                  onClick={() => setActiveTab('analytics')}
                >
                  <BarChart3 className="w-6 h-6 text-orange-600" />
                  <span className="text-sm">Analytics</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search and Filters Bar */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6 space-y-4">
          <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by location, property type, or investor name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="roi">Highest ROI</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters</span>
            </Button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="border-t pt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                  <div className="px-3">
                    <Slider
                      value={priceRange}
                      onValueChange={setPriceRange}
                      max={500000}
                      min={0}
                      step={5000}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-gray-500 mt-1">
                      <span>${priceRange[0].toLocaleString()}</span>
                      <span>${priceRange[1].toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* States */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">States</label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {states.map(state => (
                      <div key={state} className="flex items-center space-x-2">
                        <Checkbox
                          id={state}
                          checked={selectedStates.includes(state)}
                          onCheckedChange={(checked) => handleStateChange(state, !!checked)}
                        />
                        <label htmlFor={state} className="text-sm text-gray-700">{state}</label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Property Types */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Property Types</label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {propertyTypes.map(type => (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox
                          id={type}
                          checked={selectedTypes.includes(type)}
                          onCheckedChange={(checked) => handleTypeChange(type, !!checked)}
                        />
                        <label htmlFor={type} className="text-sm text-gray-700">{type}</label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Summary with Comparison */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <p className="text-gray-600">
              Showing {filteredDeals.length} deals • {buyerRequests.length} active buyer requests
            </p>
            {comparisonDeals.length > 0 && (
              <Badge variant="outline" className="flex items-center space-x-1">
                <GitCompare className="w-3 h-3" />
                <span>{comparisonDeals.length} selected for comparison</span>
              </Badge>
            )}
          </div>
          <div className="flex space-x-2">
            {comparisonDeals.length >= 2 && (
              <Button
                size="sm"
                onClick={() => setShowComparison(true)}
                className="flex items-center space-x-1"
              >
                <GitCompare className="w-3 h-3" />
                <span>Compare ({comparisonDeals.length})</span>
              </Button>
            )}
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              Grid
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              List
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 max-w-2xl">
            <TabsTrigger value="deals">Deals ({filteredDeals.length})</TabsTrigger>
            <TabsTrigger value="buyers">Buyers ({buyerRequests.length})</TabsTrigger>
            <TabsTrigger value="matching">AI Matching</TabsTrigger>
            <TabsTrigger value="saved-searches">Saved Searches</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="deals" className="space-y-4">
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' : 'space-y-4'}>
              {filteredDeals.map((deal) => (
                <Card key={deal.id} className={`hover:shadow-lg transition-all duration-200 ${deal.featured ? 'ring-2 ring-blue-200 bg-blue-50/30' : ''} ${comparisonDeals.includes(deal.id) ? 'ring-2 ring-purple-300 bg-purple-50/30' : ''}`}>
                  {deal.featured && (
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1 text-xs font-medium">
                      ⭐ FEATURED DEAL
                    </div>
                  )}
                  
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg leading-tight">{deal.title}</CardTitle>
                        <CardDescription className="flex items-center mt-1">
                          <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                          <span className="truncate">{deal.address}</span>
                        </CardDescription>
                      </div>
                      <div className="flex space-x-1 ml-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleComparison(deal.id)}
                          className={`p-1 ${comparisonDeals.includes(deal.id) ? 'text-purple-600' : 'text-gray-400'}`}
                        >
                          <GitCompare className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleSavedDeal(deal.id.toString())}
                          className={`p-1 ${savedDeals.includes(deal.id.toString()) ? 'text-red-500' : 'text-gray-400'}`}
                        >
                          <Heart className="w-4 h-4" fill={savedDeals.includes(deal.id.toString()) ? 'currentColor' : 'none'} />
                        </Button>
                        <Button variant="ghost" size="sm" className="p-1 text-gray-400 hover:text-gray-600">
                          <Share2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Key Metrics */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <p className="text-sm text-gray-500">Contract Price</p>
                        <p className="text-xl font-bold text-green-600">${deal.price.toLocaleString()}</p>
                      </div>
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-gray-500">ARV</p>
                        <p className="text-xl font-bold text-blue-600">${deal.arv.toLocaleString()}</p>
                      </div>
                    </div>

                    {/* Property Details */}
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <p className="text-gray-500">Bed/Bath</p>
                        <p className="font-semibold">{deal.bedrooms}/{deal.bathrooms}</p>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <p className="text-gray-500">Sq Ft</p>
                        <p className="font-semibold">{deal.sqft}</p>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <p className="text-gray-500">Est. ROI</p>
                        <p className="font-semibold text-green-600">{deal.roiEstimate}%</p>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-600 line-clamp-2">{deal.description}</p>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center space-x-3">
                        <span className="flex items-center">
                          <Eye className="w-3 h-3 mr-1" />
                          {deal.views} views
                        </span>
                        <span className="flex items-center">
                          <Users className="w-3 h-3 mr-1" />
                          {deal.inquiries} inquiries
                        </span>
                      </div>
                      <span className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {deal.daysOnMarket} days
                      </span>
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-2">
                      <Badge variant={deal.status === 'Active' ? 'default' : 'secondary'}>
                        {deal.status}
                      </Badge>
                      <Badge variant="outline">{deal.type}</Badge>
                      <Badge variant="outline">{deal.dealType}</Badge>
                    </div>

                    {/* Poster Info */}
                    <div className="flex items-center justify-between pt-3 border-t">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                          {deal.poster.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{deal.poster}</p>
                          <div className="flex items-center">
                            <Star className="w-3 h-3 text-yellow-400 fill-current" />
                            <span className="text-xs text-gray-500 ml-1">{deal.posterRating}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Posted</p>
                        <p className="text-xs font-medium">{deal.postedDate}</p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="w-3 h-3 mr-1" />
                        View Details
                      </Button>
                      <Button size="sm" className="flex-1">
                        Contact Seller
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="buyers" className="space-y-4">
            <div className="grid gap-6">
              {buyerRequests.map((request) => (
                <Card key={request.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                          {request.buyer.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{request.buyer}</CardTitle>
                          <div className="flex items-center space-x-3 mt-1">
                            <div className="flex items-center">
                              <Star className="w-4 h-4 text-yellow-400 fill-current" />
                              <span className="text-sm text-gray-600 ml-1">{request.buyerRating} rating</span>
                            </div>
                            <div className="flex items-center">
                              <Award className="w-4 h-4 text-blue-500" />
                              <span className="text-sm text-gray-600 ml-1">{request.dealsClosed} deals closed</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getUrgencyColor(request.urgency)}>
                          {request.urgency} Priority
                        </Badge>
                        {request.financingReady && (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            💰 Financing Ready
                          </Badge>
                        )}
                        <Badge variant="outline">{request.postedDate}</Badge>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Investment Criteria</h4>
                      <p className="text-gray-600">{request.criteria}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-3 bg-green-50 rounded-lg">
                        <p className="text-sm text-gray-500">Budget Range</p>
                        <p className="font-semibold text-green-600">${request.budget}</p>
                      </div>
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-gray-500">Property Type</p>
                        <p className="font-semibold text-blue-600">{request.type}</p>
                      </div>
                      <div className="p-3 bg-purple-50 rounded-lg">
                        <p className="text-sm text-gray-500">Target Location</p>
                        <p className="font-semibold text-purple-600">{request.location}</p>
                      </div>
                    </div>

                    {request.preferredAreas && (
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Preferred Areas</h5>
                        <div className="flex flex-wrap gap-2">
                          {request.preferredAreas.map(area => (
                            <Badge key={area} variant="secondary">{area}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-4 border-t">
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="flex items-center">
                          <Target className="w-4 h-4 mr-1 text-blue-500" />
                          Active buyer
                        </span>
                        <span className="flex items-center">
                          <TrendingUp className="w-4 h-4 mr-1 text-green-500" />
                          Quick closer
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Users className="w-3 h-3 mr-1" />
                          View Profile
                        </Button>
                        <Button size="sm">
                          <DollarSign className="w-3 h-3 mr-1" />
                          Send Deal
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="matching" className="space-y-4">
            <DealMatchingEngine deals={filteredDeals} buyers={buyerRequests} />
          </TabsContent>

          <TabsContent value="saved-searches" className="space-y-4">
            <SavedSearches onApplySearch={handleApplySearch} />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    <span>Deal Volume</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600 mb-2">{filteredDeals.length}</div>
                  <p className="text-gray-600">Active deals in marketplace</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <span>Avg ROI</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {Math.round(filteredDeals.reduce((acc, deal) => acc + deal.roiEstimate, 0) / filteredDeals.length)}%
                  </div>
                  <p className="text-gray-600">Average expected ROI</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <DollarSign className="w-5 h-5 text-purple-600" />
                    <span>Total Value</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    ${Math.round(filteredDeals.reduce((acc, deal) => acc + deal.price, 0) / 1000000 * 10) / 10}M
                  </div>
                  <p className="text-gray-600">Total portfolio value</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Deal Comparison Modal */}
        {showComparison && comparisonDeals.length >= 2 && (
          <DealComparison
            deals={filteredDeals.filter(deal => comparisonDeals.includes(deal.id))}
            onRemove={(dealId) => setComparisonDeals(prev => prev.filter(id => id !== dealId))}
            onClose={() => setShowComparison(false)}
          />
        )}
      </div>
    </Layout>
  );
};

export default Marketplace;
