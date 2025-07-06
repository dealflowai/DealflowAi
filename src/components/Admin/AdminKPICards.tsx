
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  Activity,
  Building2,
  Zap,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

interface AdminKPICardsProps {
  timeframe: string;
}

const AdminKPICards = ({ timeframe }: AdminKPICardsProps) => {
  const { data: userStats, isLoading: userStatsLoading } = useQuery({
    queryKey: ['admin-user-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_user_stats')
        .select('*')
        .single();
      
      if (error) {
        console.error('Error fetching user stats:', error);
        return null;
      }
      
      return data;
    },
  });

  const { data: dealStats, isLoading: dealStatsLoading } = useQuery({
    queryKey: ['admin-deal-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_deals_stats')
        .select('*')
        .single();
      
      if (error) {
        console.error('Error fetching deal stats:', error);
        return null;
      }
      
      return data;
    },
  });

  const { data: tokenStats, isLoading: tokenStatsLoading } = useQuery({
    queryKey: ['admin-token-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_token_stats')
        .select('*')
        .single();
      
      if (error) {
        console.error('Error fetching token stats:', error);
        return null;
      }
      
      return data;
    },
  });

  const kpiCards = [
    {
      title: 'Total Users',
      value: userStats?.total_users || 0,
      change: '+12%',
      trend: 'up',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Active Users (7d)',
      value: userStats?.active_users_7d || 0,
      change: '+8%',
      trend: 'up',
      icon: Activity,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Total Deals',
      value: dealStats?.total_deals || 0,
      change: '+15%',
      trend: 'up',
      icon: Building2,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Avg Deal Margin',
      value: `${Math.round(dealStats?.avg_margin || 0)}%`,
      change: '+3%',
      trend: 'up',
      icon: TrendingUp,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    },
    {
      title: 'Token Usage',
      value: tokenStats?.total_tokens_used || 0,
      change: '+25%',
      trend: 'up',
      icon: Zap,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      title: 'Active Orgs',
      value: tokenStats?.active_orgs || 0,
      change: '+5%',
      trend: 'up',
      icon: DollarSign,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    }
  ];

  const isLoading = userStatsLoading || dealStatsLoading || tokenStatsLoading;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/4"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {kpiCards.map((card, index) => {
        const Icon = card.icon;
        const TrendIcon = card.trend === 'up' ? ArrowUp : ArrowDown;
        
        return (
          <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {card.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-1">
                {card.value.toLocaleString()}
              </div>
              <div className="flex items-center text-xs">
                <TrendIcon className={`h-3 w-3 mr-1 ${
                  card.trend === 'up' ? 'text-green-500' : 'text-red-500'
                }`} />
                <span className={`${
                  card.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {card.change}
                </span>
                <span className="text-gray-500 ml-1">vs last period</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default AdminKPICards;
