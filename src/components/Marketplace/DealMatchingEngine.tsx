
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Target, 
  TrendingUp, 
  Star, 
  MapPin, 
  DollarSign, 
  Users,
  Brain,
  Zap,
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
  dealType: string;
  type: string;
  poster: string;
  posterRating: number;
}

interface BuyerCriteria {
  id: string;
  buyer: string;
  budget: string;
  type: string;
  location: string;
  preferredAreas: string[];
  buyerRating: number;
  dealsClosed: number;
}

interface DealMatch {
  deal: Deal;
  buyers: Array<{
    buyer: BuyerCriteria;
    matchScore: number;
    matchReasons: string[];
  }>;
  aiScore: number;
  marketDemand: number;
}

interface DealMatchingEngineProps {
  deals: Deal[];
  buyers: BuyerCriteria[];
}

const DealMatchingEngine: React.FC<DealMatchingEngineProps> = ({ deals, buyers }) => {
  const [matches, setMatches] = useState<DealMatch[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<DealMatch | null>(null);

  // AI-powered matching algorithm
  const calculateMatches = () => {
    setIsAnalyzing(true);
    
    setTimeout(() => {
      const dealMatches: DealMatch[] = deals.map(deal => {
        const dealBuyers = buyers.map(buyer => {
          let matchScore = 0;
          const matchReasons: string[] = [];

          // Budget matching
          const budgetRange = buyer.budget.split(' - ').map(b => parseInt(b.replace(/[K$,]/g, '')) * 1000);
          if (deal.price >= budgetRange[0] && deal.price <= budgetRange[1]) {
            matchScore += 30;
            matchReasons.push('Within budget range');
          }

          // Property type matching
          if (deal.dealType === buyer.type) {
            matchScore += 25;
            matchReasons.push('Property type match');
          }

          // Location matching
          const dealState = deal.address.split(', ').pop()?.split(' ')[0];
          if (buyer.location.includes(dealState || '')) {
            matchScore += 20;
            matchReasons.push('Location preference');
          }

          // ROI attractiveness
          if (deal.roiEstimate >= 25) {
            matchScore += 15;
            matchReasons.push('High ROI potential');
          }

          // Buyer rating bonus
          if (buyer.buyerRating >= 4.5) {
            matchScore += 10;
            matchReasons.push('Qualified buyer');
          }

          return { buyer, matchScore, matchReasons };
        }).filter(match => match.matchScore > 20).sort((a, b) => b.matchScore - a.matchScore);

        // Calculate AI score based on various factors
        const aiScore = Math.min(100, 
          (deal.roiEstimate * 1.5) + 
          (dealBuyers.length * 5) + 
          (deal.posterRating * 10) +
          Math.random() * 20
        );

        // Market demand based on buyer interest
        const marketDemand = Math.min(100, dealBuyers.length * 15 + Math.random() * 30);

        return {
          deal,
          buyers: dealBuyers.slice(0, 5), // Top 5 matches
          aiScore: Math.round(aiScore),
          marketDemand: Math.round(marketDemand)
        };
      }).sort((a, b) => b.aiScore - a.aiScore);

      setMatches(dealMatches);
      setIsAnalyzing(false);
    }, 2000);
  };

  useEffect(() => {
    if (deals.length > 0 && buyers.length > 0) {
      calculateMatches();
    }
  }, [deals, buyers]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getDemandLevel = (demand: number) => {
    if (demand >= 70) return { label: 'High', color: 'bg-green-500' };
    if (demand >= 40) return { label: 'Medium', color: 'bg-yellow-500' };
    return { label: 'Low', color: 'bg-red-500' };
  };

  if (isAnalyzing) {
    return (
      <Card className="p-8 text-center">
        <div className="flex flex-col items-center space-y-4">
          <Brain className="w-12 h-12 text-blue-600 animate-pulse" />
          <h3 className="text-lg font-semibold">AI Analyzing Deals...</h3>
          <p className="text-gray-600">Matching deals with buyer preferences</p>
          <Progress value={65} className="w-64" />
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold flex items-center space-x-2">
            <Brain className="w-6 h-6 text-blue-600" />
            <span>AI Deal Matching</span>
          </h3>
          <p className="text-gray-600">Intelligent buyer-deal matching powered by AI</p>
        </div>
        <Button onClick={calculateMatches} className="flex items-center space-x-2">
          <Zap className="w-4 h-4" />
          <span>Refresh Analysis</span>
        </Button>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Target className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold">{matches.filter(m => m.buyers.length > 0).length}</p>
            <p className="text-sm text-gray-600">Deals with Matches</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold">{Math.round(matches.reduce((acc, m) => acc + m.aiScore, 0) / matches.length) || 0}</p>
            <p className="text-sm text-gray-600">Avg AI Score</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold">{buyers.length}</p>
            <p className="text-sm text-gray-600">Active Buyers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Star className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
            <p className="text-2xl font-bold">{matches.filter(m => m.marketDemand > 60).length}</p>
            <p className="text-sm text-gray-600">High Demand</p>
          </CardContent>
        </Card>
      </div>

      {/* Deal Matches */}
      <div className="space-y-4">
        {matches.slice(0, 10).map((match) => (
          <Card key={match.deal.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg">{match.deal.title}</CardTitle>
                  <p className="text-gray-600 flex items-center mt-1">
                    <MapPin className="w-4 h-4 mr-1" />
                    {match.deal.address}
                  </p>
                </div>
                <div className="flex space-x-2 ml-4">
                  <Badge className={`${getScoreColor(match.aiScore)} px-3 py-1`}>
                    AI Score: {match.aiScore}
                  </Badge>
                  <Badge className={`${getDemandLevel(match.marketDemand).color} text-white px-3 py-1`}>
                    {getDemandLevel(match.marketDemand).label} Demand
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Deal Metrics */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <DollarSign className="w-5 h-5 text-green-600 mx-auto mb-1" />
                  <p className="text-sm text-gray-600">Price</p>
                  <p className="font-semibold text-green-600">${match.deal.price.toLocaleString()}</p>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                  <p className="text-sm text-gray-600">ROI Est.</p>
                  <p className="font-semibold text-blue-600">{match.deal.roiEstimate}%</p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <Users className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                  <p className="text-sm text-gray-600">Interested</p>
                  <p className="font-semibold text-purple-600">{match.buyers.length} buyers</p>
                </div>
              </div>

              {/* Matched Buyers */}
              {match.buyers.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Top Buyer Matches</h4>
                  <div className="space-y-2">
                    {match.buyers.slice(0, 3).map((buyerMatch, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                            {buyerMatch.buyer.buyer.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <p className="font-medium">{buyerMatch.buyer.buyer}</p>
                            <div className="flex items-center space-x-2">
                              <Star className="w-3 h-3 text-yellow-400 fill-current" />
                              <span className="text-xs text-gray-600">{buyerMatch.buyer.buyerRating}</span>
                              <span className="text-xs text-gray-400">•</span>
                              <span className="text-xs text-gray-600">{buyerMatch.buyer.dealsClosed} deals</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className="mb-1">
                            {buyerMatch.matchScore}% match
                          </Badge>
                          <div className="flex flex-wrap gap-1">
                            {buyerMatch.matchReasons.slice(0, 2).map((reason, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {reason}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-2 pt-2 border-t">
                <Button variant="outline" size="sm" className="flex-1">
                  View Deal Details
                </Button>
                {match.buyers.length > 0 && (
                  <Button size="sm" className="flex-1">
                    Contact Top Buyers ({match.buyers.length})
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DealMatchingEngine;
