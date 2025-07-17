
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@clerk/clerk-react';

export const useDashboardData = () => {
  const { user } = useUser();

  // Get profile data
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('clerk_id', user.id)
        .single();
      
      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }
      
      return data;
    },
    enabled: !!user?.id,
  });

  // Get buyers data
  const { data: buyers = [], isLoading: buyersLoading } = useQuery({
    queryKey: ['buyers', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      
      const { data, error } = await supabase
        .from('buyers')
        .select('*')
        .eq('owner_id', profile.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching buyers:', error);
        return [];
      }
      
      return data || [];
    },
    enabled: !!profile?.id,
  });

  // Get deals data
  const { data: deals = [], isLoading: dealsLoading } = useQuery({
    queryKey: ['deals', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      
      const { data, error } = await supabase
        .from('deals')
        .select('*')
        .eq('owner_id', profile.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching deals:', error);
        return [];
      }
      
      return data || [];
    },
    enabled: !!profile?.id,
  });

  // Get contracts data
  const { data: contracts = [], isLoading: contractsLoading } = useQuery({
    queryKey: ['contracts', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      
      const { data, error } = await supabase
        .from('contracts')
        .select('*')
        .eq('owner_id', profile.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching contracts:', error);
        return [];
      }
      
      return data || [];
    },
    enabled: !!profile?.id,
  });

  // Get token usage data - Use auth.uid() from profiles
  const { data: tokenUsage, isLoading: tokenUsageLoading } = useQuery({
    queryKey: ['token-usage', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      // First get the profile to get the proper UUID
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id')
        .eq('clerk_id', user.id)
        .single();
      
      if (!profileData?.id) return null;
      
      const { data, error } = await supabase.rpc('get_user_tokens', {
        p_user_id: profileData.id
      });
      
      if (error) {
        console.error('Error fetching token usage:', error);
        return { total_tokens: 25, used_tokens: 0, remaining_tokens: 25 };
      }
      
      return data?.[0] || { total_tokens: 25, used_tokens: 0, remaining_tokens: 25 };
    },
    enabled: !!user?.id,
  });

  // Calculate advanced stats
  const stats = {
    // Buyer metrics
    totalBuyers: buyers.length,
    activeBuyers: buyers.filter(buyer => buyer.status === 'active' || buyer.status === 'qualified').length,
    newBuyers: buyers.filter(buyer => buyer.status === 'new').length,
    qualifiedBuyers: buyers.filter(buyer => buyer.status === 'qualified').length,
    
    // Deal metrics
    totalDeals: deals.length,
    activeDeals: deals.filter(deal => !deal.status || deal.status === 'active' || deal.status === 'new').length,
    underContractDeals: deals.filter(deal => deal.status === 'under_contract').length,
    closedDeals: deals.filter(deal => deal.status === 'closed').length,
    
    // Financial metrics
    averageBudget: buyers.length > 0 
      ? Math.round(buyers.reduce((sum, buyer) => sum + (buyer.budget_max || 0), 0) / buyers.length)
      : 0,
    totalBuyingPower: buyers.reduce((sum, buyer) => sum + (buyer.budget_max || 0), 0),
    averageDealValue: deals.length > 0
      ? Math.round(deals.reduce((sum, deal) => sum + (deal.list_price || 0), 0) / deals.length)
      : 0,
    totalDealValue: deals.reduce((sum, deal) => sum + (deal.list_price || 0), 0),
    
    // Contract metrics
    totalContracts: contracts.length,
    signedContracts: contracts.filter(contract => contract.status === 'signed').length,
    pendingContracts: contracts.filter(contract => contract.status === 'pending').length,
    draftContracts: contracts.filter(contract => contract.status === 'draft').length,
    
    // Token metrics
    totalTokens: tokenUsage?.total_tokens || 0,
    usedTokens: tokenUsage?.used_tokens || 0,
    remainingTokens: tokenUsage?.remaining_tokens || 0,
  };

  // Calculate trends (last 30 days vs previous 30 days)
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  const recentBuyers = buyers.filter(buyer => 
    new Date(buyer.created_at || '') >= thirtyDaysAgo
  ).length;
  
  const previousBuyers = buyers.filter(buyer => {
    const date = new Date(buyer.created_at || '');
    return date >= sixtyDaysAgo && date < thirtyDaysAgo;
  }).length;

  const recentDeals = deals.filter(deal => 
    new Date(deal.created_at || '') >= thirtyDaysAgo
  ).length;

  const previousDeals = deals.filter(deal => {
    const date = new Date(deal.created_at || '');
    return date >= sixtyDaysAgo && date < thirtyDaysAgo;
  }).length;

  // Calculate deals growth (last week vs previous week)
  const lastWeekDeals = deals.filter(deal => 
    new Date(deal.created_at || '') >= sevenDaysAgo
  ).length;
  
  const previousWeekDeals = deals.filter(deal => {
    const date = new Date(deal.created_at || '');
    return date >= fourteenDaysAgo && date < sevenDaysAgo;
  }).length;

  // Calculate buying power trends
  const recentBuyingPower = buyers
    .filter(buyer => new Date(buyer.created_at || '') >= thirtyDaysAgo)
    .reduce((sum, buyer) => sum + (buyer.budget_max || 0), 0);
  
  const previousBuyingPower = buyers
    .filter(buyer => {
      const date = new Date(buyer.created_at || '');
      return date >= sixtyDaysAgo && date < thirtyDaysAgo;
    })
    .reduce((sum, buyer) => sum + (buyer.budget_max || 0), 0);

  const trends = {
    buyersGrowth: previousBuyers > 0 ? ((recentBuyers - previousBuyers) / previousBuyers) * 100 : (recentBuyers > 0 ? 100 : 0),
    dealsGrowth: recentDeals,
    dealsGrowthPercentage: previousDeals > 0 ? ((recentDeals - previousDeals) / previousDeals) * 100 : (recentDeals > 0 ? 100 : 0),
    dealsWeeklyGrowth: previousWeekDeals > 0 ? ((lastWeekDeals - previousWeekDeals) / previousWeekDeals) * 100 : (lastWeekDeals > 0 ? 100 : 0),
    buyingPowerGrowth: previousBuyingPower > 0 ? ((recentBuyingPower - previousBuyingPower) / previousBuyingPower) * 100 : (recentBuyingPower > 0 ? 100 : 0),
    activationRate: stats.totalBuyers > 0 ? (stats.activeBuyers / stats.totalBuyers) * 100 : 0,
    conversionRate: stats.totalDeals > 0 ? (stats.closedDeals / stats.totalDeals) * 100 : 0,
    conversionGrowth: 0, // Calculate based on historical data if available
  };

  // Generate chart data for buyers over time (last 7 days)
  const buyerChartData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(now.getTime() - (6 - i) * 24 * 60 * 60 * 1000);
    const dayBuyers = buyers.filter(buyer => {
      const buyerDate = new Date(buyer.created_at || '');
      return buyerDate.toDateString() === date.toDateString();
    }).length;
    
    return {
      date: date.toLocaleDateString('en-US', { weekday: 'short' }),
      buyers: dayBuyers,
      deals: deals.filter(deal => {
        const dealDate = new Date(deal.created_at || '');
        return dealDate.toDateString() === date.toDateString();
      }).length,
    };
  });

  // Generate recent activity from all data sources - ONLY real data
  const allActivity = [];

  // Add real buyer activities
  if (buyers.length > 0) {
    buyers.slice(0, 10).forEach(buyer => { // Limit to prevent too many items
      allActivity.push({
        id: `buyer-${buyer.id}`,
        type: 'buyer',
        title: 'New buyer added',
        description: `${buyer.name || 'Unknown buyer'} - ${buyer.status || 'new'} status`,
        time: getTimeAgo(buyer.created_at),
        timestamp: new Date(buyer.created_at || '').getTime(),
        icon: 'User',
        color: 'text-green-600',
        bgColor: 'bg-green-50'
      });

      // Add buyer status changes if updated recently (within 7 days)
      const daysDiff = (new Date().getTime() - new Date(buyer.updated_at || buyer.created_at || '').getTime()) / (1000 * 60 * 60 * 24);
      if (buyer.updated_at !== buyer.created_at && buyer.updated_at && daysDiff <= 7) {
        allActivity.push({
          id: `buyer-update-${buyer.id}`,
          type: 'buyer',
          title: 'Buyer status updated',
          description: `${buyer.name || 'Unknown buyer'} changed to ${buyer.status || 'unknown'}`,
          time: getTimeAgo(buyer.updated_at),
          timestamp: new Date(buyer.updated_at).getTime(),
          icon: 'User',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50'
        });
      }
    });
  }

  // Add real deal activities
  if (deals.length > 0) {
    deals.slice(0, 10).forEach(deal => { // Limit to prevent too many items
      allActivity.push({
        id: `deal-${deal.id}`,
        type: 'deal',
        title: 'New deal analyzed',
        description: `${deal.address} - $${deal.list_price?.toLocaleString() || 'Price TBD'}`,
        time: getTimeAgo(deal.created_at),
        timestamp: new Date(deal.created_at || '').getTime(),
        icon: 'Calculator',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50'
      });

      // Add deal status changes (within 7 days)
      const daysDiff = (new Date().getTime() - new Date(deal.updated_at || deal.created_at || '').getTime()) / (1000 * 60 * 60 * 24);
      if (deal.updated_at !== deal.created_at && deal.updated_at && daysDiff <= 7) {
        allActivity.push({
          id: `deal-update-${deal.id}`,
          type: 'deal',
          title: 'Deal status updated',
          description: `${deal.address} - ${deal.status || 'updated'}`,
          time: getTimeAgo(deal.updated_at),
          timestamp: new Date(deal.updated_at).getTime(),
          icon: 'TrendingUp',
          color: 'text-orange-600',
          bgColor: 'bg-orange-50'
        });
      }
    });
  }

  // Add real contract activities
  if (contracts.length > 0) {
    contracts.slice(0, 10).forEach(contract => { // Limit to prevent too many items
      allActivity.push({
        id: `contract-${contract.id}`,
        type: 'contract',
        title: 'Contract generated',
        description: `${contract.title} - ${contract.status || 'draft'}`,
        time: getTimeAgo(contract.created_at),
        timestamp: new Date(contract.created_at || '').getTime(),
        icon: 'FileText',
        color: 'text-purple-600',
        bgColor: 'bg-purple-50'
      });
    });
  }

  // If no real activity exists, show empty state instead of sample data
  const recentActivity = allActivity.length > 0 
    ? allActivity
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 8) // Show more recent activities
    : [];

  // Market insights based on buyer data
  const marketInsights = {
    topMarkets: getTopMarkets(buyers),
    budgetDistribution: getBudgetDistribution(buyers),
    statusDistribution: getStatusDistribution(buyers),
    recentTrends: {
      newBuyersThisWeek: buyers.filter(buyer => 
        new Date(buyer.created_at || '') >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      ).length,
      dealsThisWeek: deals.filter(deal => 
        new Date(deal.created_at || '') >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      ).length,
    }
  };

  return {
    buyers,
    deals,
    contracts,
    profile,
    stats,
    trends,
    recentActivity,
    buyerChartData,
    marketInsights,
    isLoading: buyersLoading || dealsLoading || contractsLoading || profileLoading || tokenUsageLoading,
  };
};

function getTimeAgo(dateString: string | null): string {
  if (!dateString) return 'Unknown time';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  return `${Math.floor(diffInSeconds / 86400)} days ago`;
}

function getTopMarkets(buyers: any[]) {
  const marketCount: Record<string, number> = {};
  buyers.forEach(buyer => {
    if (buyer.markets && Array.isArray(buyer.markets)) {
      buyer.markets.forEach((market: string) => {
        marketCount[market] = (marketCount[market] || 0) + 1;
      });
    }
  });
  
  return Object.entries(marketCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([market, count]) => ({ market, count }));
}

function getBudgetDistribution(buyers: any[]) {
  const ranges = [
    { label: '$0-100K', min: 0, max: 100000, count: 0 },
    { label: '$100K-300K', min: 100000, max: 300000, count: 0 },
    { label: '$300K-500K', min: 300000, max: 500000, count: 0 },
    { label: '$500K-1M', min: 500000, max: 1000000, count: 0 },
    { label: '$1M+', min: 1000000, max: Infinity, count: 0 },
  ];
  
  buyers.forEach(buyer => {
    const budget = buyer.budget_max || 0;
    const range = ranges.find(r => budget >= r.min && budget < r.max);
    if (range) range.count++;
  });
  
  return ranges.filter(range => range.count > 0);
}

function getStatusDistribution(buyers: any[]) {
  const statusCount: Record<string, number> = {};
  buyers.forEach(buyer => {
    const status = buyer.status || 'unknown';
    statusCount[status] = (statusCount[status] || 0) + 1;
  });
  
  return Object.entries(statusCount).map(([status, count]) => ({ status, count }));
}
