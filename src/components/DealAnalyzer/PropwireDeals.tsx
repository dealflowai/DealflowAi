import React, { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Share2,
  MoreHorizontal,
  Camera,
  Phone,
  Mail,
  MapIcon,
  List,
  Grid3X3,
  SlidersHorizontal,
  Bookmark,
  Download,
  Upload,
  Timer,
  Target,
  TrendingDown,
  Activity,
  BarChart3
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
  lotSize?: number;
  yearBuilt?: number;
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
  photos?: string[];
  sellerInfo?: {
    name: string;
    phone: string;
    email: string;
    motivation: string;
  };
  marketData?: {
    avgDaysOnMarket: number;
    pricePerSqft: number;
    rentEstimate: number;
    appreciation: number;
  };
}

const PropwireDeals = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>('pk.eyJ1IjoiZGVhbGZsb3dhaSIsImEiOiJjbWN2cXN4aHcwMWdqMmtwdjR1NHdvb2o0In0.sEatKPAVaufEiTqApmCqgw');
  const [showTokenInput, setShowTokenInput] = useState(false);
  
  const [filters, setFilters] = useState({
    searchLocation: '',
    priceRange: [0, 500000],
    propertyTypes: [] as string[],
    beds: '',
    baths: '',
    sqftRange: [500, 5000],
    distressSignals: [] as string[],
    aiScoreRange: [60, 100],
    daysOnMarketMax: 180,
    roiRange: [15, 100],
    yearBuiltRange: [1950, 2024]
  });
  
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<PropwireDeal | null>(null);
  const [viewMode, setViewMode] = useState<'map' | 'list' | 'grid'>('map');
  const [savedSearches, setSavedSearches] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('newest');

  // Enhanced mock deals data with more realistic details
  const mockDeals: PropwireDeal[] = [
    {
      id: '1',
      address: '1247 Peachtree Street NE',
      lat: 33.7490,
      lng: -84.3880,
      contractPrice: 185000,
      estimatedARV: 285000,
      estimatedROI: 42,
      beds: 3,
      baths: 2,
      sqft: 1850,
      lotSize: 0.25,
      yearBuilt: 1985,
      tags: ['FSBO', 'Motivated Seller', 'Quick Close'],
      aiScore: 89,
      buyerMatchCount: 7,
      daysOnMarket: 23,
      propertyType: 'Single Family',
      city: 'Atlanta',
      state: 'GA',
      zipCode: '30309',
      listDate: '2024-02-15',
      description: 'Beautiful brick ranch in sought-after Midtown area. Seller motivated for quick close. Property has great bones with updated kitchen and hardwood floors throughout.',
      isFavorite: false,
      photos: ['photo1.jpg', 'photo2.jpg', 'photo3.jpg'],
      sellerInfo: {
        name: 'Sarah Johnson',
        phone: '(404) 555-0123',
        email: 'sarah.j@email.com',
        motivation: 'Relocating for job - needs quick sale'
      },
      marketData: {
        avgDaysOnMarket: 45,
        pricePerSqft: 100,
        rentEstimate: 2100,
        appreciation: 8.5
      }
    },
    {
      id: '2',
      address: '892 Virginia Avenue NE',
      lat: 33.7519,
      lng: -84.3702,
      contractPrice: 95000,
      estimatedARV: 165000,
      estimatedROI: 58,
      beds: 4,
      baths: 2,
      sqft: 1650,
      lotSize: 0.18,
      yearBuilt: 1955,
      tags: ['Vacant', 'Off-Market', 'Investor Special', 'Needs Work'],
      aiScore: 94,
      buyerMatchCount: 12,
      daysOnMarket: 8,
      propertyType: 'Single Family',
      city: 'Atlanta',
      state: 'GA',
      zipCode: '30306',
      listDate: '2024-03-01',
      description: 'Fantastic opportunity in Virginia-Highland! This vacant property offers incredible potential with 4 bedrooms and large lot. Perfect for flip or rental.',
      isFavorite: true,
      photos: ['photo4.jpg', 'photo5.jpg'],
      sellerInfo: {
        name: 'Estate of Robert Smith',
        phone: '(404) 555-0456',
        email: 'executor@estateplanning.com',
        motivation: 'Estate liquidation - cash preferred'
      },
      marketData: {
        avgDaysOnMarket: 32,
        pricePerSqft: 58,
        rentEstimate: 2400,
        appreciation: 12.3
      }
    },
    {
      id: '3',
      address: '3456 Cascade Road SW',
      lat: 33.7310,
      lng: -84.4360,
      contractPrice: 145000,
      estimatedARV: 195000,
      estimatedROI: 28,
      beds: 3,
      baths: 2.5,
      sqft: 1425,
      lotSize: 0.22,
      yearBuilt: 1978,
      tags: ['Pre-Foreclosure', 'Distressed', 'Cash Only'],
      aiScore: 76,
      buyerMatchCount: 4,
      daysOnMarket: 67,
      propertyType: 'Townhouse',
      city: 'Atlanta',
      state: 'GA',
      zipCode: '30311',
      listDate: '2024-01-15',
      description: 'Pre-foreclosure opportunity in growing Cascade Heights area. Property needs TLC but has solid structure and good location near new developments.',
      isFavorite: false,
      photos: ['photo6.jpg'],
      sellerInfo: {
        name: 'Michael Davis',
        phone: '(404) 555-0789',
        email: 'mdavis@gmail.com',
        motivation: 'Facing foreclosure - needs quick resolution'
      },
      marketData: {
        avgDaysOnMarket: 58,
        pricePerSqft: 102,
        rentEstimate: 1850,
        appreciation: 6.8
      }
    },
    {
      id: '4',
      address: '789 Memorial Drive SE',
      lat: 33.7490,
      lng: -84.3460,
      contractPrice: 75000,
      estimatedARV: 125000,
      estimatedROI: 48,
      beds: 2,
      baths: 1,
      sqft: 950,
      lotSize: 0.15,
      yearBuilt: 1962,
      tags: ['Auction', 'Bank Owned', 'As-Is'],
      aiScore: 82,
      buyerMatchCount: 6,
      daysOnMarket: 15,
      propertyType: 'Condo',
      city: 'Atlanta',
      state: 'GA',
      zipCode: '30312',
      listDate: '2024-02-28',
      description: 'Bank-owned condo near Grant Park. Being sold as-is at auction. Great opportunity for investors with renovation experience.',
      isFavorite: false,
      marketData: {
        avgDaysOnMarket: 28,
        pricePerSqft: 79,
        rentEstimate: 1450,
        appreciation: 9.2
      }
    }
  ];

  const [deals] = useState<PropwireDeal[]>(mockDeals);
  const [filteredDeals, setFilteredDeals] = useState<PropwireDeal[]>(mockDeals);

  // Initialize map with enhanced styling
  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12', // More colorful satellite view
      center: [-98.5795, 39.8283], // Center of USA
      zoom: 4,
      pitch: 45,
      bearing: 0
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl(),
      'top-right'
    );

    // Add scale control
    map.current.addControl(new mapboxgl.ScaleControl());

    // Add markers for deals with enhanced popups
    filteredDeals.forEach((deal) => {
      const markerColor = deal.aiScore >= 90 ? '#22c55e' : deal.aiScore >= 80 ? '#3b82f6' : deal.aiScore >= 70 ? '#f59e0b' : '#ef4444';
      
      const markerElement = document.createElement('div');
      markerElement.className = 'custom-marker';
      markerElement.style.cssText = `
        width: 32px;
        height: 32px;
        background: ${markerColor};
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        font-weight: bold;
        color: white;
        transition: all 0.2s ease;
      `;
      markerElement.innerHTML = deal.aiScore.toString();
      
      markerElement.addEventListener('mouseenter', () => {
        markerElement.style.transform = 'scale(1.2)';
      });
      
      markerElement.addEventListener('mouseleave', () => {
        markerElement.style.transform = 'scale(1)';
      });

      const marker = new mapboxgl.Marker({ element: markerElement })
        .setLngLat([deal.lng, deal.lat])
        .setPopup(
          new mapboxgl.Popup({ 
            offset: 25,
            className: 'propwire-popup'
          })
            .setHTML(`
              <div class="p-4 min-w-[280px]">
                <div class="flex items-start justify-between mb-3">
                  <div>
                    <h3 class="font-bold text-lg">${deal.address}</h3>
                    <p class="text-gray-600">${deal.city}, ${deal.state} ${deal.zipCode}</p>
                  </div>
                  <div class="text-right">
                    <span class="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded">
                      AI: ${deal.aiScore}
                    </span>
                  </div>
                </div>
                
                <div class="grid grid-cols-2 gap-4 mb-3 text-sm">
                  <div>
                    <span class="text-gray-600">Price:</span>
                    <div class="font-bold text-green-600 text-lg">$${deal.contractPrice.toLocaleString()}</div>
                  </div>
                  <div>
                    <span class="text-gray-600">Est. ARV:</span>
                    <div class="font-semibold">$${deal.estimatedARV.toLocaleString()}</div>
                  </div>
                </div>
                
                <div class="flex items-center justify-between mb-3 text-sm">
                  <div class="flex items-center space-x-3">
                    <span>${deal.beds} beds</span>
                    <span>${deal.baths} baths</span>
                    <span>${deal.sqft.toLocaleString()} sqft</span>
                  </div>
                </div>
                
                <div class="flex items-center justify-between">
                  <span class="text-sm font-medium text-green-600">${deal.estimatedROI}% ROI</span>
                  <span class="text-sm text-purple-600 flex items-center">
                    <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    ${deal.buyerMatchCount} matches
                  </span>
                </div>
                
                <div class="flex space-x-2 mt-3">
                  <button class="flex-1 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition">
                    View Details
                  </button>
                  <button class="px-3 py-1 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50 transition">
                    Save
                  </button>
                </div>
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

  const propertyTypes = [
    'Single Family',
    'Multi Family', 
    'Condo',
    'Townhouse',
    'Duplex',
    'Land',
    'Commercial'
  ];

  const distressSignals = [
    'Foreclosure',
    'Pre-Foreclosure',
    'Auction', 
    'FSBO',
    'Vacant',
    'Tax Lien',
    'Absentee Owner',
    'Motivated Seller',
    'Bank Owned',
    'Estate Sale'
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
      'FSBO': 'bg-blue-50 text-blue-700 border-blue-200',
      'Foreclosure': 'bg-red-50 text-red-700 border-red-200',
      'Pre-Foreclosure': 'bg-orange-50 text-orange-700 border-orange-200',
      'Auction': 'bg-purple-50 text-purple-700 border-purple-200',
      'Vacant': 'bg-yellow-50 text-yellow-700 border-yellow-200',
      'Tax Lien': 'bg-orange-50 text-orange-700 border-orange-200',
      'Absentee Owner': 'bg-green-50 text-green-700 border-green-200',
      'Off-Market': 'bg-gray-50 text-gray-700 border-gray-200',
      'Distressed': 'bg-red-50 text-red-700 border-red-200',
      'Motivated Seller': 'bg-pink-50 text-pink-700 border-pink-200',
      'Investment': 'bg-indigo-50 text-indigo-700 border-indigo-200',
      'Quick Close': 'bg-emerald-50 text-emerald-700 border-emerald-200',
      'Investor Special': 'bg-violet-50 text-violet-700 border-violet-200',
      'Needs Work': 'bg-amber-50 text-amber-700 border-amber-200',
      'Cash Only': 'bg-teal-50 text-teal-700 border-teal-200',
      'Bank Owned': 'bg-slate-50 text-slate-700 border-slate-200',
      'As-Is': 'bg-stone-50 text-stone-700 border-stone-200',
      'Estate Sale': 'bg-rose-50 text-rose-700 border-rose-200'
    };
    return colors[tag] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  const getAIScoreColor = (score: number) => {
    if (score >= 90) return 'bg-green-500 text-white';
    if (score >= 80) return 'bg-blue-500 text-white';
    if (score >= 70) return 'bg-yellow-500 text-white';
    return 'bg-red-500 text-white';
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
          <Button onClick={() => setShowTokenInput(false)} className="w-full">
            Start Using Map
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex h-[calc(100vh-200px)] bg-background">
      {/* Enhanced Sidebar */}
      <div className="w-[420px] flex flex-col border-r bg-card shadow-sm">
        {/* Search Header */}
        <div className="p-4 border-b bg-white">
          <div className="flex items-center space-x-2 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="City, ZIP, or neighborhood..."
                value={filters.searchLocation}
                onChange={(e) => setFilters({...filters, searchLocation: e.target.value})}
                className="pl-10 h-11 border-2 focus:border-primary"
              />
            </div>
            <Button 
              size="sm" 
              variant={showFilters ? "default" : "outline"}
              onClick={() => setShowFilters(!showFilters)}
              className="h-11 px-4"
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>

          {/* Results summary and view controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-muted-foreground">
                {filteredDeals.length} properties found
              </span>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-32 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="price-low">Price: Low</SelectItem>
                  <SelectItem value="price-high">Price: High</SelectItem>
                  <SelectItem value="roi">Highest ROI</SelectItem>
                  <SelectItem value="ai-score">AI Score</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-1">
              <Button
                size="sm"
                variant={viewMode === 'map' ? 'default' : 'ghost'}
                onClick={() => setViewMode('map')}
                className="h-8 px-2"
              >
                <MapIcon className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                onClick={() => setViewMode('list')}
                className="h-8 px-2"
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                onClick={() => setViewMode('grid')}
                className="h-8 px-2"
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Enhanced Filters */}
        {showFilters && (
          <div className="p-4 border-b bg-gray-50/50 max-h-96 overflow-y-auto">
            <div className="space-y-6">
              {/* Price Range */}
              <div>
                <label className="text-sm font-semibold mb-3 block text-gray-900">Price Range</label>
                <div className="px-2">
                  <Slider
                    value={filters.priceRange}
                    onValueChange={(value) => setFilters({...filters, priceRange: value})}
                    max={500000}
                    min={0}
                    step={5000}
                    className="mb-2"
                  />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>${filters.priceRange[0].toLocaleString()}</span>
                    <span>${filters.priceRange[1].toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Property Types */}
              <div>
                <label className="text-sm font-semibold mb-3 block text-gray-900">Property Type</label>
                <div className="flex flex-wrap gap-2">
                  {propertyTypes.map((type) => (
                    <Button
                      key={type}
                      size="sm"
                      variant={filters.propertyTypes.includes(type) ? 'default' : 'outline'}
                      onClick={() => togglePropertyType(type)}
                      className="h-8 text-xs font-medium"
                    >
                      {type}
                    </Button>
                  ))}
                </div>
              </div>

              {/* AI Score Range */}
              <div>
                <label className="text-sm font-semibold mb-3 block text-gray-900">AI Score Range</label>
                <div className="px-2">
                  <Slider
                    value={filters.aiScoreRange}
                    onValueChange={(value) => setFilters({...filters, aiScoreRange: value})}
                    max={100}
                    min={0}
                    step={5}
                    className="mb-2"
                  />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{filters.aiScoreRange[0]}</span>
                    <span>{filters.aiScoreRange[1]}</span>
                  </div>
                </div>
              </div>

              {/* ROI Range */}
              <div>
                <label className="text-sm font-semibold mb-3 block text-gray-900">Expected ROI %</label>
                <div className="px-2">
                  <Slider
                    value={filters.roiRange}
                    onValueChange={(value) => setFilters({...filters, roiRange: value})}
                    max={100}
                    min={0}
                    step={5}
                    className="mb-2"
                  />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{filters.roiRange[0]}%</span>
                    <span>{filters.roiRange[1]}%</span>
                  </div>
                </div>
              </div>

              {/* Distress Signals */}
              <div>
                <label className="text-sm font-semibold mb-3 block text-gray-900">Opportunity Types</label>
                <div className="flex flex-wrap gap-2">
                  {distressSignals.map((signal) => (
                    <Button
                      key={signal}
                      size="sm"
                      variant={filters.distressSignals.includes(signal) ? 'default' : 'outline'}
                      onClick={() => toggleDistressSignal(signal)}
                      className="h-8 text-xs font-medium"
                    >
                      {signal}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Deals List */}
        <div className="flex-1 overflow-y-auto">
          {filteredDeals.map((deal) => (
            <div
              key={deal.id}
              className={`p-4 border-b hover:bg-blue-50/50 cursor-pointer transition-all ${
                selectedDeal?.id === deal.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
              }`}
              onClick={() => setSelectedDeal(deal)}
            >
              {/* Property Image */}
              <div className="w-full h-40 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl mb-4 flex items-center justify-center relative overflow-hidden">
                <Home className="w-12 h-12 text-gray-400" />
                <div className="absolute top-3 left-3">
                  <Badge className={`${getAIScoreColor(deal.aiScore)} font-bold`}>
                    AI: {deal.aiScore}
                  </Badge>
                </div>
                <div className="absolute top-3 right-3">
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0 bg-white/80 hover:bg-white">
                    <Heart className={`w-4 h-4 ${deal.isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                  </Button>
                </div>
                {deal.daysOnMarket && deal.daysOnMarket < 30 && (
                  <div className="absolute bottom-3 left-3">
                    <Badge className="bg-green-500 text-white font-medium">
                      New Listing
                    </Badge>
                  </div>
                )}
              </div>

              {/* Property Info */}
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900 leading-tight">{deal.address}</h3>
                    <p className="text-sm text-gray-600 mt-1">{deal.city}, {deal.state} {deal.zipCode}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-2xl text-green-600">
                      ${deal.contractPrice.toLocaleString()}
                    </span>
                    <p className="text-sm text-gray-500">
                      ${Math.round(deal.contractPrice / deal.sqft)}/sqft
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-green-100 text-green-800 font-semibold">
                      {deal.estimatedROI}% ROI
                    </Badge>
                    <p className="text-sm text-gray-500 mt-1">
                      ARV: ${deal.estimatedARV.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-3 text-center">
                  <div className="bg-gray-50 rounded-lg p-2">
                    <Bed className="w-4 h-4 mx-auto mb-1 text-gray-600" />
                    <span className="text-sm font-medium">{deal.beds}</span>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2">
                    <Bath className="w-4 h-4 mx-auto mb-1 text-gray-600" />
                    <span className="text-sm font-medium">{deal.baths}</span>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2">
                    <Square className="w-4 h-4 mx-auto mb-1 text-gray-600" />
                    <span className="text-xs font-medium">{deal.sqft.toLocaleString()}</span>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2">
                    <Calendar className="w-4 h-4 mx-auto mb-1 text-gray-600" />
                    <span className="text-xs font-medium">{deal.yearBuilt}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  {deal.tags.slice(0, 3).map((tag, index) => (
                    <Badge 
                      key={index} 
                      variant="outline" 
                      className={`${getTagColor(tag)} text-xs font-medium border`}
                    >
                      {tag}
                    </Badge>
                  ))}
                  {deal.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs border-gray-200">
                      +{deal.tags.length - 3} more
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1 text-sm text-purple-600">
                      <Zap className="w-4 h-4" />
                      <span className="font-medium">{deal.buyerMatchCount} buyer matches</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span>{deal.daysOnMarket} days</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Enhanced Main Content */}
      <div className="flex-1 relative">
        {viewMode === 'map' ? (
          <>
            <div ref={mapContainer} className="absolute inset-0" />
            
            {/* Map Controls */}
            <div className="absolute top-4 right-4 space-y-2">
              <Button size="sm" variant="outline" className="bg-white/95 backdrop-blur shadow-lg">
                <Settings className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="outline" className="bg-white/95 backdrop-blur shadow-lg">
                <Download className="w-4 h-4" />
              </Button>
            </div>

            {/* Enhanced Deal Detail Panel */}
            {selectedDeal && (
              <div className="absolute bottom-6 left-6 right-6 max-w-2xl mx-auto">
                <Card className="bg-white/98 backdrop-blur border shadow-2xl">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-bold text-xl text-gray-900">{selectedDeal.address}</h3>
                        <p className="text-gray-600 mt-1">
                          {selectedDeal.city}, {selectedDeal.state} {selectedDeal.zipCode}
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge className={`${getAIScoreColor(selectedDeal.aiScore)} font-bold`}>
                            AI Score: {selectedDeal.aiScore}
                          </Badge>
                          <Badge className="bg-purple-100 text-purple-800">
                            {selectedDeal.buyerMatchCount} buyer matches
                          </Badge>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => setSelectedDeal(null)}
                        className="h-8 w-8 p-0"
                      >
                        <X className="w-5 h-5" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-4 gap-6 mb-6">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Purchase Price</p>
                        <p className="font-bold text-2xl text-green-600">
                          ${selectedDeal.contractPrice.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Est. ARV</p>
                        <p className="font-bold text-xl text-gray-900">
                          ${selectedDeal.estimatedARV.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Expected ROI</p>
                        <p className="font-bold text-xl text-blue-600">
                          {selectedDeal.estimatedROI}%
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Days on Market</p>
                        <p className="font-bold text-xl text-gray-900">
                          {selectedDeal.daysOnMarket}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-6 gap-4 mb-6">
                      <div className="text-center bg-gray-50 rounded-lg p-3">
                        <Bed className="w-5 h-5 mx-auto mb-2 text-gray-600" />
                        <div className="font-semibold">{selectedDeal.beds}</div>
                        <div className="text-xs text-gray-500">Beds</div>
                      </div>
                      <div className="text-center bg-gray-50 rounded-lg p-3">
                        <Bath className="w-5 h-5 mx-auto mb-2 text-gray-600" />
                        <div className="font-semibold">{selectedDeal.baths}</div>
                        <div className="text-xs text-gray-500">Baths</div>
                      </div>
                      <div className="text-center bg-gray-50 rounded-lg p-3">
                        <Square className="w-5 h-5 mx-auto mb-2 text-gray-600" />
                        <div className="font-semibold">{selectedDeal.sqft.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">Sqft</div>
                      </div>
                      <div className="text-center bg-gray-50 rounded-lg p-3">
                        <TrendingUp className="w-5 h-5 mx-auto mb-2 text-gray-600" />
                        <div className="font-semibold">{selectedDeal.estimatedROI}%</div>
                        <div className="text-xs text-gray-500">ROI</div>
                      </div>
                      <div className="text-center bg-gray-50 rounded-lg p-3">
                        <Calendar className="w-5 h-5 mx-auto mb-2 text-gray-600" />
                        <div className="font-semibold">{selectedDeal.yearBuilt}</div>
                        <div className="text-xs text-gray-500">Built</div>
                      </div>
                      <div className="text-center bg-gray-50 rounded-lg p-3">
                        <Activity className="w-5 h-5 mx-auto mb-2 text-gray-600" />
                        <div className="font-semibold">{selectedDeal.lotSize} ac</div>
                        <div className="text-xs text-gray-500">Lot</div>
                      </div>
                    </div>

                    <div className="flex space-x-3">
                      <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                        <Brain className="w-4 h-4 mr-2" />
                        Full Analysis
                      </Button>
                      <Button variant="outline" className="flex-1">
                        <Users className="w-4 h-4 mr-2" />
                        Match Buyers
                      </Button>
                      <Button variant="outline" className="px-4">
                        <Phone className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" className="px-4">
                        <Mail className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" className="px-4">
                        <Bookmark className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" className="px-4">
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </>
        ) : (
          // Enhanced List/Grid view
          <div className="p-6 h-full overflow-y-auto bg-gray-50/30">
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6' : 'space-y-4'}>
              {filteredDeals.map((deal) => (
                <Card key={deal.id} className="hover:shadow-xl transition-all duration-300 cursor-pointer group">
                  <CardContent className="p-0">
                    <div className="relative">
                      <div className="w-full h-64 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        <Home className="w-16 h-16 text-gray-400" />
                      </div>
                      <div className="absolute top-4 left-4">
                        <Badge className={`${getAIScoreColor(deal.aiScore)} font-bold`}>
                          AI: {deal.aiScore}
                        </Badge>
                      </div>
                      <div className="absolute top-4 right-4">
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 bg-white/80 hover:bg-white">
                          <Heart className={`w-4 h-4 ${deal.isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                        </Button>
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-bold text-lg text-gray-900">{deal.address}</h3>
                          <p className="text-gray-600">{deal.city}, {deal.state} {deal.zipCode}</p>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-bold text-2xl text-green-600">
                              ${deal.contractPrice.toLocaleString()}
                            </span>
                            <p className="text-sm text-gray-500">${Math.round(deal.contractPrice / deal.sqft)}/sqft</p>
                          </div>
                          <Badge className="bg-green-100 text-green-800 font-semibold">
                            {deal.estimatedROI}% ROI
                          </Badge>
                        </div>

                        <div className="grid grid-cols-4 gap-3">
                          <div className="text-center bg-gray-50 rounded-lg p-2">
                            <Bed className="w-4 h-4 mx-auto mb-1 text-gray-600" />
                            <span className="text-sm font-medium">{deal.beds}</span>
                          </div>
                          <div className="text-center bg-gray-50 rounded-lg p-2">
                            <Bath className="w-4 h-4 mx-auto mb-1 text-gray-600" />
                            <span className="text-sm font-medium">{deal.baths}</span>
                          </div>
                          <div className="text-center bg-gray-50 rounded-lg p-2">
                            <Square className="w-4 h-4 mx-auto mb-1 text-gray-600" />
                            <span className="text-xs font-medium">{deal.sqft.toLocaleString()}</span>
                          </div>
                          <div className="text-center bg-gray-50 rounded-lg p-2">
                            <Calendar className="w-4 h-4 mx-auto mb-1 text-gray-600" />
                            <span className="text-xs font-medium">{deal.yearBuilt}</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1">
                          {deal.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className={`${getTagColor(tag)} text-xs border`}>
                              {tag}
                            </Badge>
                          ))}
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <Button size="sm" variant="outline" className="text-xs">
                            <Brain className="w-3 h-3 mr-1" />
                            Analyze
                          </Button>
                          <Button size="sm" variant="outline" className="text-xs">
                            <Users className="w-3 h-3 mr-1" />
                            Match
                          </Button>
                          <Button size="sm" variant="outline" className="text-xs">
                            <Bookmark className="w-3 h-3 mr-1" />
                            Save
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropwireDeals;