
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  X, 
  MapPin, 
  DollarSign, 
  TrendingUp, 
  Home,
  Calendar,
  Star,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

interface Deal {
  id: number;
  title: string;
  address: string;
  price: number;
  arv: number;
  roiEstimate: number;
  sqft: number;
  bedrooms: number;
  bathrooms: number;
  yearBuilt: number;
  repairEstimate: number;
  daysOnMarket: number;
  dealType: string;
  type: string;
  poster: string;
  posterRating: number;
}

interface DealComparisonProps {
  deals: Deal[];
  onRemove: (dealId: number) => void;
  onClose: () => void;
}

const DealComparison: React.FC<DealComparisonProps> = ({ deals, onRemove, onClose }) => {
  const getComparisonColor = (value: number, values: number[], higherIsBetter: boolean) => {
    const max = Math.max(...values);
    const min = Math.min(...values);
    
    if (higherIsBetter) {
      return value === max ? 'text-green-600' : value === min ? 'text-red-600' : 'text-gray-600';
    } else {
      return value === min ? 'text-green-600' : value === max ? 'text-red-600' : 'text-gray-600';
    }
  };

  const getWinner = (key: keyof Deal, higherIsBetter: boolean = true) => {
    const values = deals.map(deal => Number(deal[key]) || 0);
    const bestValue = higherIsBetter ? Math.max(...values) : Math.min(...values);
    return deals.find(deal => Number(deal[key]) === bestValue)?.id;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-7xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold">Deal Comparison</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {deals.map((deal) => (
              <Card key={deal.id} className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 z-10"
                  onClick={() => onRemove(deal.id)}
                >
                  <X className="w-4 h-4" />
                </Button>

                <CardHeader className="pb-3">
                  <CardTitle className="text-lg pr-8">{deal.title}</CardTitle>
                  <p className="text-sm text-gray-600 flex items-center">
                    <MapPin className="w-3 h-3 mr-1" />
                    {deal.address}
                  </p>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Key Metrics */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Price</span>
                      <span className={`font-semibold ${getComparisonColor(
                        deal.price, 
                        deals.map(d => d.price), 
                        false
                      )}`}>
                        ${deal.price.toLocaleString()}
                        {getWinner('price', false) === deal.id && (
                          <CheckCircle className="w-4 h-4 inline ml-1 text-green-600" />
                        )}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">ARV</span>
                      <span className={`font-semibold ${getComparisonColor(
                        deal.arv, 
                        deals.map(d => d.arv), 
                        true
                      )}`}>
                        ${deal.arv.toLocaleString()}
                        {getWinner('arv', true) === deal.id && (
                          <CheckCircle className="w-4 h-4 inline ml-1 text-green-600" />
                        )}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">ROI</span>
                      <span className={`font-semibold ${getComparisonColor(
                        deal.roiEstimate, 
                        deals.map(d => d.roiEstimate), 
                        true
                      )}`}>
                        {deal.roiEstimate}%
                        {getWinner('roiEstimate', true) === deal.id && (
                          <CheckCircle className="w-4 h-4 inline ml-1 text-green-600" />
                        )}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Repair Est.</span>
                      <span className={`font-semibold ${getComparisonColor(
                        deal.repairEstimate, 
                        deals.map(d => d.repairEstimate), 
                        false
                      )}`}>
                        ${deal.repairEstimate.toLocaleString()}
                        {getWinner('repairEstimate', false) === deal.id && (
                          <CheckCircle className="w-4 h-4 inline ml-1 text-green-600" />
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Property Details */}
                  <div className="pt-3 border-t space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Bed/Bath</span>
                      <span className="text-sm font-medium">{deal.bedrooms}/{deal.bathrooms}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Sq Ft</span>
                      <span className="text-sm font-medium">{deal.sqft.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Year Built</span>
                      <span className="text-sm font-medium">{deal.yearBuilt}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Days on Market</span>
                      <span className="text-sm font-medium">{deal.daysOnMarket}</span>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-1 pt-2">
                    <Badge variant="outline" className="text-xs">{deal.type}</Badge>
                    <Badge variant="outline" className="text-xs">{deal.dealType}</Badge>
                  </div>

                  {/* Poster */}
                  <div className="flex items-center space-x-2 pt-2 border-t">
                    <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                      {deal.poster.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium">{deal.poster}</p>
                      <div className="flex items-center">
                        <Star className="w-3 h-3 text-yellow-400 fill-current" />
                        <span className="text-xs text-gray-500 ml-1">{deal.posterRating}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Comparison Summary */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-3">Comparison Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Best Price:</span>
                <span className="ml-2 font-medium">
                  {deals.find(d => d.id === getWinner('price', false))?.title?.substring(0, 20)}...
                </span>
              </div>
              <div>
                <span className="text-gray-600">Highest ROI:</span>
                <span className="ml-2 font-medium">
                  {deals.find(d => d.id === getWinner('roiEstimate', true))?.title?.substring(0, 20)}...
                </span>
              </div>
              <div>
                <span className="text-gray-600">Lowest Repairs:</span>
                <span className="ml-2 font-medium">
                  {deals.find(d => d.id === getWinner('repairEstimate', false))?.title?.substring(0, 20)}...
                </span>
              </div>
              <div>
                <span className="text-gray-600">Highest ARV:</span>
                <span className="ml-2 font-medium">
                  {deals.find(d => d.id === getWinner('arv', true))?.title?.substring(0, 20)}...
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DealComparison;
