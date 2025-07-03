
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, DollarSign, Home, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Property {
  id: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  propertyType: string;
  daysOnMarket: number;
  images: string[];
  description: string;
  listingUrl: string;
}

interface PropertyScraperProps {
  onPropertySelect: (property: Property) => void;
}

export function PropertyScraper({ onPropertySelect }: PropertyScraperProps) {
  const [searchLocation, setSearchLocation] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [propertyType, setPropertyType] = useState('all');
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Mock property data for demonstration
  const mockProperties: Property[] = [
    {
      id: '1',
      address: '123 Main St',
      city: 'Atlanta',
      state: 'GA',
      zipCode: '30309',
      price: 180000,
      bedrooms: 3,
      bathrooms: 2,
      sqft: 1200,
      propertyType: 'Single Family',
      daysOnMarket: 45,
      images: ['/placeholder.svg'],
      description: 'Motivated seller! Needs some TLC but great bones.',
      listingUrl: '#'
    },
    {
      id: '2',
      address: '456 Oak Ave',
      city: 'Atlanta',
      state: 'GA',
      zipCode: '30309',
      price: 250000,
      bedrooms: 4,
      bathrooms: 3,
      sqft: 1800,
      propertyType: 'Single Family',
      daysOnMarket: 120,
      images: ['/placeholder.svg'],
      description: 'Estate sale - must sell quickly!',
      listingUrl: '#'
    },
    {
      id: '3',
      address: '789 Pine St',
      city: 'Atlanta',
      state: 'GA',
      zipCode: '30309',
      price: 95000,
      bedrooms: 2,
      bathrooms: 1,
      sqft: 900,
      propertyType: 'Condo',
      daysOnMarket: 200,
      images: ['/placeholder.svg'],
      description: 'Divorce sale - priced to move!',
      listingUrl: '#'
    }
  ];

  const handleSearch = async () => {
    if (!searchLocation.trim()) {
      toast({
        title: "Search Location Required",
        description: "Please enter a location to search for properties.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const filteredProperties = mockProperties.filter(property => {
        const matchesLocation = property.city.toLowerCase().includes(searchLocation.toLowerCase()) ||
                               property.state.toLowerCase().includes(searchLocation.toLowerCase());
        const matchesMinPrice = !minPrice || property.price >= parseInt(minPrice);
        const matchesMaxPrice = !maxPrice || property.price <= parseInt(maxPrice);
        const matchesType = propertyType === 'all' || property.propertyType.toLowerCase().includes(propertyType.toLowerCase());
        
        return matchesLocation && matchesMinPrice && matchesMaxPrice && matchesType;
      });
      
      setProperties(filteredProperties);
      setIsLoading(false);
      
      toast({
        title: "Search Complete",
        description: `Found ${filteredProperties.length} properties matching your criteria.`,
      });
    }, 2000);
  };

  const getMotivationScore = (property: Property) => {
    let score = 0;
    if (property.daysOnMarket > 90) score += 3;
    else if (property.daysOnMarket > 60) score += 2;
    else if (property.daysOnMarket > 30) score += 1;
    
    if (property.description.toLowerCase().includes('motivated')) score += 2;
    if (property.description.toLowerCase().includes('must sell')) score += 3;
    if (property.description.toLowerCase().includes('divorce')) score += 3;
    if (property.description.toLowerCase().includes('estate')) score += 2;
    
    return Math.min(score, 5);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Property Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Location (City, State)"
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
            />
            <Input
              placeholder="Min Price"
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
            />
            <Input
              placeholder="Max Price"
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="single">Single Family</option>
              <option value="condo">Condo</option>
              <option value="townhouse">Townhouse</option>
            </select>
          </div>
          <Button onClick={handleSearch} disabled={isLoading} className="w-full">
            {isLoading ? 'Searching...' : 'Search Properties'}
          </Button>
        </CardContent>
      </Card>

      {properties.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => {
            const motivationScore = getMotivationScore(property);
            return (
              <Card key={property.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {property.address}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {property.city}, {property.state} {property.zipCode}
                        </p>
                      </div>
                      <Badge variant={motivationScore >= 4 ? "destructive" : motivationScore >= 2 ? "default" : "secondary"}>
                        Motivation: {motivationScore}/5
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        ${property.price.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Home className="h-4 w-4" />
                        {property.bedrooms}bed/{property.bathrooms}bath
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{property.sqft.toLocaleString()} sqft</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {property.daysOnMarket} days
                      </span>
                    </div>
                    
                    <p className="text-sm">{property.description}</p>
                    
                    <Button
                      onClick={() => onPropertySelect(property)}
                      className="w-full"
                      variant="outline"
                    >
                      Analyze Deal
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
