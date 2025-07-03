
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Calculator, TrendingUp, AlertTriangle, CheckCircle, Save } from 'lucide-react';
import { useCreateDeal } from '@/hooks/useDeals';
import { toast } from 'sonner';

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

interface DealAnalysisProps {
  property: Property | null;
}

const DealAnalysis: React.FC<DealAnalysisProps> = ({ property }) => {
  const [arv, setArv] = useState('');
  const [repairCosts, setRepairCosts] = useState('');
  const [analysis, setAnalysis] = useState<any>(null);
  const createDeal = useCreateDeal();

  useEffect(() => {
    if (property) {
      // Auto-estimate ARV as 120% of list price
      const estimatedArv = Math.round(property.listPrice * 1.2);
      setArv(estimatedArv.toString());
      
      // Auto-estimate repair costs based on property age/condition
      const baseCostPerSqft = 15; // $15 per sqft for basic repairs
      const estimatedRepairs = Math.round(property.sqft * baseCostPerSqft);
      setRepairCosts(estimatedRepairs.toString());
    }
  }, [property]);

  const calculateDeal = () => {
    if (!property || !arv || !repairCosts) return;

    const arvValue = parseInt(arv);
    const repairValue = parseInt(repairCosts);
    
    // 70% Rule calculation
    const maxOfferBy70Rule = Math.round(arvValue * 0.7 - repairValue);
    
    // Wholesale calculations
    const wholesaleFee = 10000; // Standard $10k wholesale fee
    const maxOfferForWholesale = maxOfferBy70Rule - wholesaleFee;
    
    // Deal scoring
    const listPrice = property.listPrice;
    const equity = arvValue - listPrice;
    const equityPercentage = (equity / arvValue) * 100;
    
    // Profit calculations
    const potentialProfit = maxOfferBy70Rule - listPrice;
    const profitMargin = listPrice > 0 ? (potentialProfit / listPrice) * 100 : 0;
    
    // AI Score calculation (0-100)
    let aiScore = 0;
    
    // Motivation score weight (30%)
    aiScore += property.motivationScore * 0.3;
    
    // Equity percentage weight (40%)
    if (equityPercentage > 30) aiScore += 40;
    else if (equityPercentage > 20) aiScore += 30;
    else if (equityPercentage > 10) aiScore += 20;
    else if (equityPercentage > 0) aiScore += 10;
    
    // Days on market weight (20%)
    if (property.daysOnMarket > 120) aiScore += 20;
    else if (property.daysOnMarket > 90) aiScore += 15;
    else if (property.daysOnMarket > 60) aiScore += 10;
    else if (property.daysOnMarket > 30) aiScore += 5;
    
    // Price vs ARV weight (10%)
    const priceVsArvRatio = listPrice / arvValue;
    if (priceVsArvRatio < 0.7) aiScore += 10;
    else if (priceVsArvRatio < 0.8) aiScore += 7;
    else if (priceVsArvRatio < 0.9) aiScore += 4;
    
    aiScore = Math.round(Math.min(aiScore, 100));

    setAnalysis({
      arv: arvValue,
      repairs: repairValue,
      listPrice,
      maxOffer70Rule: maxOfferBy70Rule,
      maxOfferWholesale: maxOfferForWholesale,
      equity,
      equityPercentage,
      potentialProfit,
      profitMargin,
      aiScore,
      wholesaleFee,
      recommendation: aiScore >= 70 ? 'Strong Deal' : aiScore >= 50 ? 'Good Deal' : aiScore >= 30 ? 'Marginal Deal' : 'Pass'
    });
  };

  const saveDeal = async () => {
    if (!property || !analysis) return;

    try {
      await createDeal.mutateAsync({
        address: property.address,
        city: property.city,
        state: property.state,
        zip_code: property.zipCode,
        lat: property.lat,
        lon: property.lon,
        list_price: property.listPrice,
        arv: analysis.arv,
        max_offer: analysis.maxOfferWholesale,
        condition_score: Math.round((100 - property.motivationScore) * 0.6 + 40), // Inverse of motivation
        ai_score: analysis.aiScore,
        repair_estimate: analysis.repairs,
        margin: analysis.potentialProfit,
        status: 'new',
        deal_type: 'wholesale',
        notes: `Scraped from MLS. ${property.description.substring(0, 200)}...`
      });

      toast.success('Deal saved successfully!');
    } catch (error) {
      console.error('Error saving deal:', error);
      toast.error('Failed to save deal');
    }
  };

  if (!property) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Calculator className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">Select a Property</h3>
          <p className="text-gray-500">Choose a property from the search results to analyze the deal</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Deal Analysis - {property.address}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Input Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">List Price</label>
              <Input value={`$${property.listPrice.toLocaleString()}`} disabled />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">ARV (After Repair Value)</label>
              <Input
                type="number"
                value={arv}
                onChange={(e) => setArv(e.target.value)}
                placeholder="Enter ARV"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Repair Costs</label>
              <Input
                type="number"
                value={repairCosts}
                onChange={(e) => setRepairCosts(e.target.value)}
                placeholder="Enter repair costs"
              />
            </div>
          </div>

          <Button onClick={calculateDeal} className="w-full" disabled={!arv || !repairCosts}>
            Calculate Deal
          </Button>

          {analysis && (
            <div className="space-y-6">
              {/* Deal Score */}
              <div className="text-center">
                <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-50 to-teal-50 p-6 rounded-lg">
                  <div className="text-center">
                    <div className={`text-4xl font-bold ${
                      analysis.aiScore >= 70 ? 'text-green-600' : 
                      analysis.aiScore >= 50 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {analysis.aiScore}
                    </div>
                    <div className="text-sm text-gray-600">AI Score</div>
                  </div>
                  <div className="h-12 w-px bg-gray-300" />
                  <div className="text-center">
                    <Badge className={
                      analysis.recommendation === 'Strong Deal' ? 'bg-green-500' :
                      analysis.recommendation === 'Good Deal' ? 'bg-yellow-500' :
                      analysis.recommendation === 'Marginal Deal' ? 'bg-orange-500' : 'bg-red-500'
                    }>
                      {analysis.recommendation}
                    </Badge>
                    <div className="text-sm text-gray-600 mt-1">Recommendation</div>
                  </div>
                </div>
              </div>

              {/* Financial Analysis */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">70% Rule Analysis</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span>ARV:</span>
                      <span className="font-semibold">${analysis.arv.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>70% of ARV:</span>
                      <span>${Math.round(analysis.arv * 0.7).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Repair Costs:</span>
                      <span>-${analysis.repairs.toLocaleString()}</span>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between font-semibold">
                        <span>Max Offer (70% Rule):</span>
                        <span className="text-green-600">${analysis.maxOffer70Rule.toLocaleString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Wholesale Analysis</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span>Max Offer (70% Rule):</span>
                      <span>${analysis.maxOffer70Rule.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Wholesale Fee:</span>
                      <span>-${analysis.wholesaleFee.toLocaleString()}</span>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between font-semibold">
                        <span>Max Wholesale Offer:</span>
                        <span className="text-blue-600">${analysis.maxOfferWholesale.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Potential Profit:</span>
                      <span className={analysis.potentialProfit > 0 ? 'text-green-600' : 'text-red-600'}>
                        ${analysis.potentialProfit.toLocaleString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{analysis.equityPercentage.toFixed(1)}%</div>
                  <div className="text-sm text-gray-600">Equity</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{property.daysOnMarket}</div>
                  <div className="text-sm text-gray-600">Days on Market</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{property.motivationScore}%</div>
                  <div className="text-sm text-gray-600">Motivation</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{analysis.profitMargin.toFixed(1)}%</div>
                  <div className="text-sm text-gray-600">Profit Margin</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <Button 
                  onClick={saveDeal} 
                  disabled={createDeal.isPending}
                  className="flex-1"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {createDeal.isPending ? 'Saving...' : 'Save Deal'}
                </Button>
                <Button variant="outline" className="flex-1">
                  Generate Contract
                </Button>
              </div>

              {/* Recommendations */}
              {analysis.recommendation === 'Strong Deal' && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-green-800">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-semibold">Strong Deal Recommendation</span>
                  </div>
                  <p className="text-green-700 mt-1">
                    This property shows excellent wholesale potential with strong motivation indicators and good profit margins.
                  </p>
                </div>
              )}

              {analysis.recommendation === 'Pass' && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 text-red-800">
                    <AlertTriangle className="w-5 h-5" />
                    <span className="font-semibold">Consider Passing</span>
                  </div>
                  <p className="text-red-700 mt-1">
                    This deal may not meet wholesale criteria. Consider negotiating a lower price or looking for other opportunities.
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DealAnalysis;
