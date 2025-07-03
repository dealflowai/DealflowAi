
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDeals } from '@/hooks/useDeals';
import { TrendingUp, DollarSign, FileText, Users, Target } from 'lucide-react';

const DealStats: React.FC = () => {
  const { data: deals, isLoading } = useDeals();

  const calculateStats = () => {
    if (!deals || deals.length === 0) {
      return {
        totalDeals: 0,
        activeDeals: 0,
        totalProfit: 0,
        avgScore: 0,
        contractedDeals: 0
      };
    }

    const activeDeals = deals.filter(deal => 
      deal.status && !['closed', 'dead'].includes(deal.status)
    ).length;

    const totalProfit = deals.reduce((sum, deal) => 
      sum + (deal.margin || 0), 0
    );

    const dealsWithScores = deals.filter(deal => deal.ai_score !== null);
    const avgScore = dealsWithScores.length > 0 
      ? dealsWithScores.reduce((sum, deal) => sum + (deal.ai_score || 0), 0) / dealsWithScores.length
      : 0;

    const contractedDeals = deals.filter(deal => 
      deal.status === 'contracted' || deal.status === 'closed'
    ).length;

    return {
      totalDeals: deals.length,
      activeDeals,
      totalProfit,
      avgScore: Math.round(avgScore),
      contractedDeals
    };
  };

  const stats = calculateStats();

  const statCards = [
    {
      title: 'Total Deals',
      value: stats.totalDeals.toString(),
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Active Deals',
      value: stats.activeDeals.toString(),
      icon: Target,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Contracted',
      value: stats.contractedDeals.toString(),
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Projected Profit',
      value: `$${stats.totalProfit.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100'
    },
    {
      title: 'Avg AI Score',
      value: stats.avgScore > 0 ? `${stats.avgScore}%` : 'N/A',
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-6 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      {statCards.map((stat, index) => (
        <Card key={index}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`${stat.bgColor} p-3 rounded-full`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DealStats;
