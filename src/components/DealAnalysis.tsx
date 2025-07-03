
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Calculator, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Property {
  id: string;
  address: string;
  city: string;
  state: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
}

interface DealAnalysisProps {
  property: Property;
  onSaveDeal: (dealData: any) => void;
}

export function DealAnalysis({ property, onSaveDeal }: DealAnalysisProps) {
  const [arv, setArv] = useState('');
  const [repairCosts, setRepairCosts] = useState('');
  const [wholesaleFee, setWholesaleFee] = useState('10000');
  const [analysis, setAnalysis] = useState<any>(null);
  const { toast } = useToast();

  const calculateDeal = () => {
    const arvNum = parseFloat(arv) || 0;
    const repairNum = parseFloat(repairCosts) || 0;
    const feeNum = parseFloat(wholesaleFee) || 0;
    const listPrice = property.price;

    // Standard wholesale formulas
    const maxOffer70 = (arvNum * 0.7) - repairNum - feeNum;
    const maxOffer75 = (arvNum * 0.75) - repairNum - feeNum;
    const profit = maxOffer70 - listPrice;
    const profitMargin = listPrice > 0 ? (profit / listPrice) * 100 : 0;

    // Market analysis (simplified)
    const pricePerSqft = listPrice / property.sqft;
    const avgPricePerSqft = 150; // Mock average
    const belowMarket = ((avgPricePerSqft - pricePerSqft) / avgPricePerSqft) * 100;

    const dealScore = calculateDealScore(profit, profitMargin, belowMarket);

    setAnalysis({
      maxOffer70,
      maxOffer75,
      profit,
      profitMargin,
      pricePerSqft,
      belowMarket,
      dealScore,
      recommendation: getDealRecommendation(dealScore, profit)
    });
  };

  const calculateDealScore = (profit: number, margin: number, belowMarket: number) => {
    let score = 0;
    
    // Profit scoring
    if (profit > 20000) score += 4;
    else if (profit > 10000) score += 3;
    else if (profit > 5000) score += 2;
    else if (profit > 0) score += 1;
    
    // Margin scoring
    if (margin > 20) score += 2;
    else if (margin > 10) score += 1;
    
    // Below market scoring
    if (belowMarket > 20) score += 2;
    else if (belowMarket > 10) score += 1;
    
    return Math.min(score, 10);
  };

  const getDealRecommendation = (score: number, profit: number) => {
    if (score >= 7) return { type: 'excellent', text: 'Excellent Deal - Pursue Immediately' };
    if (score >= 5) return { type: 'good', text: 'Good Deal - Worth Pursuing' };
    if (score >= 3) return { type: 'fair', text: 'Fair Deal - Proceed with Caution' };
    return { type: 'poor', text: 'Poor Deal - Pass on This One' };
  };

  const handleSaveDeal = () => {
    if (!analysis) {
      toast({
        title: "Analysis Required",
        description: "Please run the analysis before saving the deal.",
        variant: "destructive",
      });
      return;
    }

    const dealData = {
      address: property.address,
      city: property.city,
      state: property.state,
      list_price: property.price,
      arv: parseFloat(arv),
      repair_estimate: parseFloat(repairCosts),
      max_offer: Math.round(analysis.maxOffer70),
      margin: Math.round(analysis.profit),
      ai_score: analysis.dealScore,
      deal_type: 'wholesale',
      status: 'new'
    };

    onSaveDeal(dealData);
    
    toast({
      title: "Deal Saved",
      description: "Deal has been added to your pipeline.",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Deal Analysis - {property.address}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="arv">After Repair Value (ARV)</Label>
              <Input
                id="arv"
                type="number"
                placeholder="Enter ARV"
                value={arv}
                onChange={(e) => setArv(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="repairs">Estimated Repairs</Label>
              <Input
                id="repairs"
                type="number"
                placeholder="Enter repair costs"
                value={repairCosts}
                onChange={(e) => setRepairCosts(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="fee">Wholesale Fee</Label>
              <Input
                id="fee"
                type="number"
                placeholder="Your fee"
                value={wholesaleFee}
                onChange={(e) => setWholesaleFee(e.target.value)}
              />
            </div>
          </div>
          
          <Button onClick={calculateDeal} className="w-full">
            Analyze Deal
          </Button>
        </CardContent>
      </Card>

      {analysis && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Analysis Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-muted-foreground">Max Offer (70% Rule)</p>
                <p className="text-2xl font-bold text-blue-600">
                  ${analysis.maxOffer70.toLocaleString()}
                </p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-muted-foreground">Potential Profit</p>
                <p className={`text-2xl font-bold ${analysis.profit > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${analysis.profit.toLocaleString()}
                </p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-muted-foreground">Deal Score</p>
                <p className="text-2xl font-bold text-purple-600">
                  {analysis.dealScore}/10
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Badge
                variant={
                  analysis.recommendation.type === 'excellent' ? 'default' :
                  analysis.recommendation.type === 'good' ? 'secondary' :
                  analysis.recommendation.type === 'fair' ? 'outline' : 'destructive'
                }
                className="text-lg py-2 px-4"
              >
                {analysis.recommendation.type === 'excellent' && <CheckCircle className="h-4 w-4 mr-2" />}
                {analysis.recommendation.type === 'poor' && <AlertTriangle className="h-4 w-4 mr-2" />}
                {analysis.recommendation.text}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Price per Sq Ft</p>
                <p className="font-semibold">${analysis.pricePerSqft.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Below Market</p>
                <p className="font-semibold">{analysis.belowMarket.toFixed(1)}%</p>
              </div>
            </div>

            <Button onClick={handleSaveDeal} className="w-full">
              Save Deal to Pipeline
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
