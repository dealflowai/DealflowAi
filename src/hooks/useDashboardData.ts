
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@clerk/clerk-react';

export const useDashboardData = () => {
  const { user } = useUser();

  const { data: buyers = [], isLoading: buyersLoading } = useQuery({
    queryKey: ['buyers', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('buyers')
        .select('*')
        .eq('owner_id', user.id);
      
      if (error) {
        console.error('Error fetching buyers:', error);
        return [];
      }
      
      return data;
    },
    enabled: !!user?.id,
  });

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

  // Calculate dashboard stats from real data
  const stats = {
    activeBuyers: buyers.filter(buyer => buyer.status === 'active').length,
    totalBuyers: buyers.length,
    newBuyers: buyers.filter(buyer => buyer.status === 'new').length,
    averageBudget: buyers.length > 0 
      ? Math.round(buyers.reduce((sum, buyer) => sum + (buyer.budget_max || 0), 0) / buyers.length)
      : 0,
  };

  // Generate recent activity from buyers data
  const recentActivity = buyers
    .sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime())
    .slice(0, 4)
    .map((buyer, index) => ({
      id: buyer.id,
      type: 'buyer_added',
      title: 'New buyer added',
      description: `${buyer.name || 'Unknown'} - ${buyer.status} status`,
      time: getTimeAgo(buyer.created_at),
      icon: 'User',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    }));

  return {
    buyers,
    profile,
    stats,
    recentActivity,
    isLoading: buyersLoading || profileLoading,
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
