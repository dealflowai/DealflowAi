
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, DollarSign, Home, Calendar, TrendingUp } from 'lucide-react';

interface Property {
  id: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  listPrice: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  daysOnMarket: number;
  propertyType: string;
  description: string;
  motivationScore: number;
  lat: number;
  lon: number;
}

interface PropertyScraperProps {
  onPropertySelect: (property: Property) => void;
  selectedProperty: Property | null;
}

const PropertyScraper: React.FC<PropertyScraperProps> = ({ onPropertySelect, selectedProperty }) => {
  const [searchLocation, setSearchLocation] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);

  const calculateMotivationScore = (daysOnMarket: number, description: string): number => {
    let score = 0;
    
    // Days on market scoring
    if (daysOnMarket > 180) score += 40;
    else if (daysOnMarket > 90) score += 30;
    else if (daysOnMarket > 60) score += 20;
    else if (daysOnMarket > 30) score += 10;
    
    // Description keywords scoring
    const motivationKeywords = [
      'motivated', 'urgent', 'must sell', 'priced to sell', 'owner financing',
      'divorce', 'estate sale', 'job relocation', 'needs work', 'handyman special',
      'cash only', 'as is', 'below market', 'reduced price'
    ];
    
    const descLower = description.toLowerCase();
    motivationKeywords.forEach(keyword => {
      if (descLower.includes(keyword)) score += 15;
    });
    
    return Math.min(score, 100);
  };

  const mockProperties: Property[] = [
    {
      id: '1',
      address: '123 Oak Street',
      city: 'Phoenix',
      state: 'AZ',
      zipCode: '85001',
      listPrice: 180000,
      bedrooms: 3,
      bathrooms: 2,
      sqft: 1250,
      daysOnMarket: 120,
      propertyType: 'Single Family',
      description: 'Motivated seller! Handyman special needs some TLC. Great investment opportunity in up-and-coming neighborhood. Priced to sell quickly.',
      motivationScore: 0,
      lat: 33.4484,
      lon: -112.0740
    },
    {
      id: '2',
      address: '456 Pine Avenue',
      city: 'Phoenix',
      state: 'AZ',
      zipCode: '85002',
      listPrice: 220000,
      bedrooms: 4,
      bathrooms: 2.5,
      sqft: 1800,
      daysOnMarket: 45,
      propertyType: 'Single Family',
      description: 'Beautiful home in great condition. Perfect for families. Move-in ready with updated kitchen and bathrooms.',
      motivationScore: 0,
      lat: 33.4734,
      lon: -112.0431
    },
    {
      id: '3',
      address: '789 Elm Drive',
      city: 'Tempe',
      state: 'AZ',
      zipCode: '85281',
      listPrice: 150000,
      bedrooms: 2,
      bathrooms: 1,
      sqft: 900,
      daysOnMarket: 200,
      propertyType: 'Condo',
      description: 'Estate sale - must sell urgently. Cash only, sold as is. Great potential for renovation. Below market value.',
      motivationScore: 0,
      lat: 33.4255,
      lon: -111.9400
    },
    {
      id: '4',
      address: '321 Maple Court',
      city: 'Scottsdale',
      state: 'AZ',
      zipCode: '85251',
      listPrice: 320000,
      bedrooms: 3,
      bathrooms: 2,
      sqft: 1600,
      daysOnMarket: 90,
      propertyType: 'Single Family',
      description: 'Job relocation forces sale. Owner financing available for qualified buyers. Reduced price for quick sale.',
      motivationScore: 0,
      lat: 33.5092,
      lon: -111.8999
    }
  ];

  const handleSearch = async () => {
    setIsSearching(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Filter and score properties
    let filteredProperties = mockProperties.filter(property => {
      const matchesLocation = !searchLocation || 
        property.city.toLowerCase().includes(searchLocation.toLowerCase()) ||
        property.state.toLowerCase().includes(searchLocation.toLowerCase()) ||
        property.zipCode.includes(searchLocation);
      
      const matchesPrice = !maxPrice || property.listPrice <= parseInt(maxPrice);
      const matchesType = !propertyType || property.propertyType === propertyType;
      
      return matchesLocation && matchesPrice && matchesType;
    });

    // Calculate motivation scores
    filteredProperties = filteredProperties.map(property => ({
      ...property,
      motivationScore: calculateMotivationScore(property.daysOnMarket, property.description)
    }));

    // Sort by motivation score (highest first)
    filteredProperties.sort((a, b) => b.motivationScore - a.motivationScore);

    setProperties(filteredProperties);
    setIsSearching(false);
  };

  const getMotivationColor = (score: number) => {
    if (score >= 70) return 'bg-red-500';
    if (score >= 50) return 'bg-orange-500';
    if (score >= 30) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Property Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Location (City, State, ZIP)"
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
            />
            <Input
              placeholder="Max Price"
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
            <Select value={propertyType} onValueChange={setPropertyType}>
              <SelectTrigger>
                <SelectValue placeholder="Property Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Types</SelectItem>
                <SelectItem value="Single Family">Single Family</SelectItem>
                <SelectItem value="Condo">Condo</SelectItem>
                <SelectItem value="Townhouse">Townhouse</SelectItem>
                <SelectItem value="Multi-Family">Multi-Family</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleSearch} disabled={isSearching} className="w-full">
              {isSearching ? 'Searching...' : 'Search Properties'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {properties.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {properties.map((property) => (
            <Card 
              key={property.id} 
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedProperty?.id === property.id ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => onPropertySelect(property)}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">{property.address}</h3>
                    <p className="text-gray-600 flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {property.city}, {property.state} {property.zipCode}
                    </p>
                  </div>
                  <Badge className={`${getMotivationColor(property.motivationScore)} text-white`}>
                    {property.motivationScore}% Motivated
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <span className="font-semibold">${property.listPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Home className="w-4 h-4 text-blue-600" />
                    <span>{property.bedrooms}bd/{property.bathrooms}ba • {property.sqft.toLocaleString()} sqft</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-3 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{property.daysOnMarket} days on market</span>
                  </div>
                  <Badge variant="outline">{property.propertyType}</Badge>
                </div>

                <p className="text-sm text-gray-700 line-clamp-2">
                  {property.description}
                </p>

                {selectedProperty?.id === property.id && (
                  <div className="mt-3 p-2 bg-blue-50 rounded text-sm text-blue-700">
                    ✓ Selected for analysis
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {properties.length === 0 && !isSearching && (
        <Card>
          <CardContent className="text-center py-12">
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Search for Properties</h3>
            <p className="text-gray-500">Enter your search criteria above to find wholesale opportunities</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PropertyScraper;
