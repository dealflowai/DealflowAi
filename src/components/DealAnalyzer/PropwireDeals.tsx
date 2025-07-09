import React, { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
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
  Zap,
  ChevronDown,
  X,
  Settings,
  Calendar,
  Clock,
  Eye,
  Heart,
  Share2
} from 'lucide-react';

interface PropwireDeal {
  id: string;
  address: string;
  lat: number;
  lng: number;
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
  listDate: string;
  description: string;
  isFavorite?: boolean;
}

const PropwireDeals = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>('pk.eyJ1IjoiZGVhbGZsb3dhaSIsImEiOiJjbWN2cXN4aHcwMWdqMmtwdjR1NHdvb2o0In0.sEatKPAVaufEiTqApmCqgw');
  const [showTokenInput, setShowTokenInput] = useState(false);
  
  const [filters, setFilters] = useState({
    searchLocation: '',
    priceMin: '',
    priceMax: '',
    propertyTypes: [] as string[],
    beds: '',
    baths: '',
    sqftMin: '',
    sqftMax: '',
    distressSignals: [] as string[],
    aiScoreMin: 70,
    daysOnMarketMax: 180,
    roiMin: 20
  });
  
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<PropwireDeal | null>(null);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');

  // Mock deals data with coordinates
  const mockDeals: PropwireDeal[] = [
    {
      id: '1',
      address: '123 Oak Street',
      lat: 33.7490,
      lng: -84.3880,
      contractPrice: 85000,
      estimatedARV: 125000,
      estimatedROI: 35,
      beds: 3,
      baths: 2,
      sqft: 1200,
      tags: ['FSBO', 'Distressed', 'Motivated Seller'],
      aiScore: 85,
      buyerMatchCount: 3,
      daysOnMarket: 45,
      propertyType: 'Single Family',
      city: 'Atlanta',
      state: 'GA',
      zipCode: '30309',
      listDate: '2024-01-15',
      description: 'Motivated seller! Property needs cosmetic updates but has great bones. Perfect for wholesale or flip.',
      isFavorite: false
    },
    {
      id: '2',
      address: '456 Pine Avenue',
      lat: 33.7519,
      lng: -84.3902,
      contractPrice: 120000,
      estimatedARV: 180000,
      estimatedROI: 42,
      beds: 4,
      baths: 3,
      sqft: 1800,
      tags: ['Vacant', 'Off-Market', 'Investment'],
      aiScore: 92,
      buyerMatchCount: 5,
      daysOnMarket: 12,
      propertyType: 'Single Family',
      city: 'Atlanta',
      state: 'GA',
      zipCode: '30309',
      listDate: '2024-01-28',
      description: 'Vacant property with huge potential. Great investment opportunity in up-and-coming neighborhood.',
      isFavorite: true
    },
    {
      id: '3',
      address: '789 Maple Drive',
      lat: 33.7510,
      lng: -84.3860,
      contractPrice: 65000,
      estimatedARV: 95000,
      estimatedROI: 28,
      beds: 2,
      baths: 1,
      sqft: 900,
      tags: ['Foreclosure', 'Auction', 'Distressed'],
      aiScore: 78,
      buyerMatchCount: 2,
      daysOnMarket: 67,
      propertyType: 'Condo',
      city: 'Atlanta',
      state: 'GA',
      zipCode: '30309',
      listDate: '2023-12-01',
      description: 'Foreclosure auction opportunity. Property sold as-is, perfect for experienced investors.',
      isFavorite: false
    }
  ];

  const [deals] = useState<PropwireDeal[]>(mockDeals);
  const [filteredDeals, setFilteredDeals] = useState<PropwireDeal[]>(mockDeals);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [-84.3880, 33.7490], // Atlanta
      zoom: 12,
      pitch: 0,
      bearing: 0
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl(),
      'top-right'
    );

    // Add markers for deals
    filteredDeals.forEach((deal) => {
      const marker = new mapboxgl.Marker({
        color: deal.aiScore >= 90 ? '#10b981' : deal.aiScore >= 80 ? '#3b82f6' : '#f59e0b'
      })
        .setLngLat([deal.lng, deal.lat])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 })
            .setHTML(`
              <div class="p-2">
                <h3 class="font-semibold">${deal.address}</h3>
                <p class="text-sm text-gray-600">${deal.city}, ${deal.state}</p>
                <p class="font-bold text-green-600">$${deal.contractPrice.toLocaleString()}</p>
                <p class="text-sm">AI Score: ${deal.aiScore}/100</p>
                <p class="text-sm">${deal.buyerMatchCount} buyer matches</p>
              </div>
            `)
        )
        .addTo(map.current!);

      marker.getElement().addEventListener('click', () => {
        setSelectedDeal(deal);
      });
    });

    return () => {
      map.current?.remove();
    };
  }, [mapboxToken, filteredDeals]);

  const handleTokenSubmit = () => {
    if (mapboxToken.trim()) {
      setShowTokenInput(false);
    }
  };

  const propertyTypes = [
    'Single Family',
    'Multi Family', 
    'Condo',
    'Townhouse',
    'Land',
    'Commercial'
  ];

  const distressSignals = [
    'Foreclosure',
    'Auction', 
    'FSBO',
    'Vacant',
    'Tax Lien',
    'Absentee Owner',
    'Motivated Seller',
    'Pre-Foreclosure'
  ];

  const togglePropertyType = (type: string) => {
    setFilters(prev => ({
      ...prev,
      propertyTypes: prev.propertyTypes.includes(type)
        ? prev.propertyTypes.filter(t => t !== type)
        : [...prev.propertyTypes, type]
    }));
  };

  const toggleDistressSignal = (signal: string) => {
    setFilters(prev => ({
      ...prev,
      distressSignals: prev.distressSignals.includes(signal)
        ? prev.distressSignals.filter(s => s !== signal)
        : [...prev.distressSignals, signal]
    }));
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
      'Motivated Seller': 'bg-pink-100 text-pink-800',
      'Investment': 'bg-indigo-100 text-indigo-800'
    };
    return colors[tag] || 'bg-gray-100 text-gray-800';
  };

  if (showTokenInput) {
    return (
      <Card className="max-w-md mx-auto mt-8">
        <CardHeader>
          <CardTitle>Setup Mapbox</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            To use the map feature, please add your Mapbox public token to Supabase Edge Function Secrets with key "MAPBOX_PUBLIC_TOKEN", or enter it below temporarily:
          </p>
          <Input
            placeholder="pk.eyJ1IjoieW91cnVzZXJuYW1lIiwiYSI6InBrLjA..."
            value={mapboxToken}
            onChange={(e) => setMapboxToken(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Get your token from <a href="https://mapbox.com/" target="_blank" rel="noopener noreferrer" className="text-primary underline">mapbox.com</a>
          </p>
          <Button onClick={handleTokenSubmit} className="w-full">
            Start Using Map
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex h-[calc(100vh-200px)] bg-background">
      {/* Sidebar with filters and deals list */}
      <div className="w-96 flex flex-col border-r bg-card">
        {/* Search Header */}
        <div className="p-4 border-b">
          <div className="flex items-center space-x-2 mb-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by city, state, or ZIP..."
                value={filters.searchLocation}
                onChange={(e) => setFilters({...filters, searchLocation: e.target.value})}
                className="pl-10"
              />
            </div>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="bg-background border z-50"
            >
              <Filter className="w-4 h-4" />
            </Button>
          </div>

          {/* Filter toggles */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{filteredDeals.length} properties</span>
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant={viewMode === 'map' ? 'default' : 'outline'}
                onClick={() => setViewMode('map')}
                className="h-7"
              >
                Map
              </Button>
              <Button
                size="sm"
                variant={viewMode === 'list' ? 'default' : 'outline'}
                onClick={() => setViewMode('list')}
                className="h-7"
              >
                List
              </Button>
            </div>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="p-4 border-b bg-muted/30 max-h-80 overflow-y-auto z-50 bg-background">
            <div className="space-y-4">
              {/* Price Range */}
              <div>
                <label className="text-sm font-medium mb-2 block">Price Range</label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="Min"
                    value={filters.priceMin}
                    onChange={(e) => setFilters({...filters, priceMin: e.target.value})}
                    className="bg-background"
                  />
                  <Input
                    placeholder="Max"
                    value={filters.priceMax}
                    onChange={(e) => setFilters({...filters, priceMax: e.target.value})}
                    className="bg-background"
                  />
                </div>
              </div>

              {/* Property Types */}
              <div>
                <label className="text-sm font-medium mb-2 block">Property Type</label>
                <div className="flex flex-wrap gap-1">
                  {propertyTypes.map((type) => (
                    <Button
                      key={type}
                      size="sm"
                      variant={filters.propertyTypes.includes(type) ? 'default' : 'outline'}
                      onClick={() => togglePropertyType(type)}
                      className="h-7 text-xs bg-background border"
                    >
                      {type}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Beds/Baths */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-sm font-medium mb-2 block">Beds</label>
                  <Input
                    placeholder="Any"
                    value={filters.beds}
                    onChange={(e) => setFilters({...filters, beds: e.target.value})}
                    className="bg-background"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Baths</label>
                  <Input
                    placeholder="Any"
                    value={filters.baths}
                    onChange={(e) => setFilters({...filters, baths: e.target.value})}
                    className="bg-background"
                  />
                </div>
              </div>

              {/* Distress Signals */}
              <div>
                <label className="text-sm font-medium mb-2 block">Distress Signals</label>
                <div className="flex flex-wrap gap-1">
                  {distressSignals.map((signal) => (
                    <Button
                      key={signal}
                      size="sm"
                      variant={filters.distressSignals.includes(signal) ? 'default' : 'outline'}
                      onClick={() => toggleDistressSignal(signal)}
                      className="h-7 text-xs bg-background border"
                    >
                      {signal}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Deals List */}
        <div className="flex-1 overflow-y-auto">
          {filteredDeals.map((deal) => (
            <div
              key={deal.id}
              className={`p-4 border-b hover:bg-muted/50 cursor-pointer transition-colors ${
                selectedDeal?.id === deal.id ? 'bg-muted' : ''
              }`}
              onClick={() => setSelectedDeal(deal)}
            >
              {/* Property Image */}
              <div className="w-full h-32 bg-muted rounded-lg mb-3 flex items-center justify-center">
                <Home className="w-8 h-8 text-muted-foreground" />
              </div>

              {/* Property Info */}
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-sm">{deal.address}</h3>
                    <p className="text-xs text-muted-foreground">{deal.city}, {deal.state}</p>
                  </div>
                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                    <Heart className={`w-3 h-3 ${deal.isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-bold text-lg text-green-600">
                    ${deal.contractPrice.toLocaleString()}
                  </span>
                  <Badge className="bg-green-100 text-green-800 text-xs">
                    {deal.estimatedROI}% ROI
                  </Badge>
                </div>

                <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                  <span className="flex items-center">
                    <Bed className="w-3 h-3 mr-1" />
                    {deal.beds}
                  </span>
                  <span className="flex items-center">
                    <Bath className="w-3 h-3 mr-1" />
                    {deal.baths}
                  </span>
                  <span className="flex items-center">
                    <Square className="w-3 h-3 mr-1" />
                    {deal.sqft.toLocaleString()}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1">
                  {deal.tags.slice(0, 2).map((tag, index) => (
                    <Badge key={index} variant="secondary" className={`${getTagColor(tag)} text-xs`}>
                      {tag}
                    </Badge>
                  ))}
                  {deal.tags.length > 2 && (
                    <Badge variant="secondary" className="text-xs">
                      +{deal.tags.length - 2}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center space-x-1">
                    <Badge className="bg-blue-100 text-blue-800 text-xs">
                      AI: {deal.aiScore}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-1 text-xs text-primary">
                    <Zap className="w-3 h-3" />
                    <span>{deal.buyerMatchCount} matches</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative">
        {viewMode === 'map' ? (
          <>
            <div ref={mapContainer} className="absolute inset-0" />
            
            {/* Map Controls */}
            <div className="absolute top-4 right-4 space-y-2">
              <Button size="sm" variant="outline" className="bg-background/90 backdrop-blur">
                <Settings className="w-4 h-4" />
              </Button>
            </div>

            {/* Deal Detail Panel */}
            {selectedDeal && (
              <div className="absolute bottom-4 left-4 right-4 max-w-md mx-auto">
                <Card className="bg-background/95 backdrop-blur border">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold">{selectedDeal.address}</h3>
                        <p className="text-sm text-muted-foreground">
                          {selectedDeal.city}, {selectedDeal.state}
                        </p>
                      </div>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => setSelectedDeal(null)}
                        className="h-6 w-6 p-0"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Price</p>
                        <p className="font-bold text-green-600">
                          ${selectedDeal.contractPrice.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Est. ARV</p>
                        <p className="font-semibold">
                          ${selectedDeal.estimatedARV.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-2 mb-3 text-sm">
                      <div className="text-center">
                        <Bed className="w-4 h-4 mx-auto mb-1" />
                        <span>{selectedDeal.beds}</span>
                      </div>
                      <div className="text-center">
                        <Bath className="w-4 h-4 mx-auto mb-1" />
                        <span>{selectedDeal.baths}</span>
                      </div>
                      <div className="text-center">
                        <Square className="w-4 h-4 mx-auto mb-1" />
                        <span>{selectedDeal.sqft}</span>
                      </div>
                      <div className="text-center">
                        <TrendingUp className="w-4 h-4 mx-auto mb-1" />
                        <span>{selectedDeal.estimatedROI}%</span>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button size="sm" className="flex-1">
                        <Brain className="w-3 h-3 mr-1" />
                        Analyze
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <Users className="w-3 h-3 mr-1" />
                        Match
                      </Button>
                      <Button size="sm" variant="outline">
                        <Eye className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Share2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </>
        ) : (
          // List view
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-full overflow-y-auto">
            {filteredDeals.map((deal) => (
              <Card key={deal.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="w-full h-48 bg-muted rounded-lg mb-4 flex items-center justify-center">
                    <Home className="w-16 h-16 text-muted-foreground" />
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold">{deal.address}</h3>
                      <p className="text-sm text-muted-foreground">{deal.city}, {deal.state}</p>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xl text-green-600">
                        ${deal.contractPrice.toLocaleString()}
                      </span>
                      <Badge className="bg-green-100 text-green-800">
                        {deal.estimatedROI}% ROI
                      </Badge>
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span className="flex items-center">
                        <Bed className="w-4 h-4 mr-1" />
                        {deal.beds}
                      </span>
                      <span className="flex items-center">
                        <Bath className="w-4 h-4 mr-1" />
                        {deal.baths}
                      </span>
                      <span className="flex items-center">
                        <Square className="w-4 h-4 mr-1" />
                        {deal.sqft.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {deal.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className={getTagColor(tag)}>
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <Button size="sm" variant="outline">
                        <Brain className="w-3 h-3 mr-1" />
                        Analyze
                      </Button>
                      <Button size="sm" variant="outline">
                        <Users className="w-3 h-3 mr-1" />
                        Match
                      </Button>
                      <Button size="sm" variant="outline">
                        <Save className="w-3 h-3 mr-1" />
                        Save
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PropwireDeals;