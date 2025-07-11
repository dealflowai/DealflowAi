import React, { createContext, useContext, useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface PlanLimits {
  users: number;
  deals: number;
  buyers: number;
  savedSearches: number;
  aiAnalyzerRuns: number;
  aiMatchingRuns: number;
  aiDiscoveryRuns: number;
  buyerContacts: number;
  sellerContacts: number;
  contracts: number;
  marketplaceListings: number;
  hasAnalyticsDashboard: boolean;
  hasAIOutreach: boolean;
  hasVoiceAgents: boolean;
  hasESignatures: boolean;
  hasTeamFeatures: boolean;
  contractTemplates: number;
}

export interface Usage {
  ai_analyzer_runs: number;
  ai_matching_runs: number;
  ai_discovery_runs: number;
  contracts_created: number;
  buyer_contacts: number;
  seller_contacts: number;
  marketplace_listings: number;
}

interface SubscriptionContextType {
  subscriptionTier: string | null;
  subscribed: boolean;
  limits: PlanLimits;
  usage: Usage;
  loading: boolean;
  checkUsageLimit: (usageType: keyof Usage, increment?: number) => boolean;
  incrementUsage: (usageType: keyof Usage, increment?: number) => Promise<void>;
  showUpgradeModal: (feature: string) => void;
  refreshSubscription: () => Promise<void>;
}

const PLAN_LIMITS: Record<string, PlanLimits> = {
  free: {
    users: 1,
    deals: 3,
    buyers: 10,
    savedSearches: 2,
    aiAnalyzerRuns: 2,
    aiMatchingRuns: 1,
    aiDiscoveryRuns: 0,
    buyerContacts: 1,
    sellerContacts: 1,
    contracts: 1,
    marketplaceListings: 3,
    hasAnalyticsDashboard: false,
    hasAIOutreach: false,
    hasVoiceAgents: false,
    hasESignatures: false,
    hasTeamFeatures: false,
    contractTemplates: 1,
  },
  starter: {
    users: 1,
    deals: 10,
    buyers: 50,
    savedSearches: 2,
    aiAnalyzerRuns: 10,
    aiMatchingRuns: 50,
    aiDiscoveryRuns: 20,
    buyerContacts: 5,
    sellerContacts: 5,
    contracts: 10,
    marketplaceListings: 10,
    hasAnalyticsDashboard: true,
    hasAIOutreach: false,
    hasVoiceAgents: false,
    hasESignatures: false,
    hasTeamFeatures: false,
    contractTemplates: 5,
  },
  pro: {
    users: 1,
    deals: 50,
    buyers: 500,
    savedSearches: 10,
    aiAnalyzerRuns: 100,
    aiMatchingRuns: 250,
    aiDiscoveryRuns: 100,
    buyerContacts: 30,
    sellerContacts: 30,
    contracts: 50,
    marketplaceListings: 15,
    hasAnalyticsDashboard: true,
    hasAIOutreach: true,
    hasVoiceAgents: true,
    hasESignatures: true,
    hasTeamFeatures: false,
    contractTemplates: 20,
  },
  agency: {
    users: 5,
    deals: 999999,
    buyers: 999999,
    savedSearches: 999999,
    aiAnalyzerRuns: 999999,
    aiMatchingRuns: 999999,
    aiDiscoveryRuns: 500,
    buyerContacts: 999999,
    sellerContacts: 999999,
    contracts: 999999,
    marketplaceListings: 999999,
    hasAnalyticsDashboard: true,
    hasAIOutreach: true,
    hasVoiceAgents: true,
    hasESignatures: true,
    hasTeamFeatures: true,
    contractTemplates: 999999,
  },
};

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoaded } = useUser();
  const { toast } = useToast();
  
  const [subscriptionTier, setSubscriptionTier] = useState<string | null>(null);
  const [subscribed, setSubscribed] = useState(false);
  const [usage, setUsage] = useState<Usage>({
    ai_analyzer_runs: 0,
    ai_matching_runs: 0,
    ai_discovery_runs: 0,
    contracts_created: 0,
    buyer_contacts: 0,
    seller_contacts: 0,
    marketplace_listings: 0,
  });
  const [loading, setLoading] = useState(true);

  const limits = PLAN_LIMITS[subscriptionTier?.toLowerCase() || 'free'] || PLAN_LIMITS.free;

  const checkSubscription = async () => {
    if (!user?.primaryEmailAddress?.emailAddress) return;

    try {
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        body: {
          userEmail: user.primaryEmailAddress.emailAddress,
          userId: user.id,
        }
      });

      if (error) throw error;

      setSubscribed(data.subscribed || false);
      setSubscriptionTier(data.subscription_tier?.toLowerCase() || null);
    } catch (error) {
      console.error('Error checking subscription:', error);
      setSubscribed(false);
      setSubscriptionTier(null);
    }
  };

  const fetchUsage = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .rpc('get_current_month_usage', { p_user_id: user.id });

      if (error) throw error;

      if (data && data.length > 0) {
        setUsage(data[0]);
      }
    } catch (error) {
      console.error('Error fetching usage:', error);
    }
  };

  const refreshSubscription = async () => {
    setLoading(true);
    await Promise.all([checkSubscription(), fetchUsage()]);
    setLoading(false);
  };

  useEffect(() => {
    if (isLoaded && user) {
      refreshSubscription();
    } else if (isLoaded) {
      setLoading(false);
    }
  }, [isLoaded, user]);

  const checkUsageLimit = (usageType: keyof Usage, increment: number = 1): boolean => {
    const currentUsage = usage[usageType] || 0;
    const limit = limits[usageType as keyof PlanLimits] as number;
    
    return currentUsage + increment <= limit;
  };

  const incrementUsage = async (usageType: keyof Usage, increment: number = 1) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .rpc('increment_usage', {
          p_user_id: user.id,
          p_usage_type: usageType,
          p_increment: increment
        });

      if (error) throw error;

      // Update local usage state
      setUsage(prev => ({
        ...prev,
        [usageType]: (prev[usageType] || 0) + increment
      }));
    } catch (error) {
      console.error('Error incrementing usage:', error);
    }
  };

  const showUpgradeModal = (feature: string) => {
    toast({
      title: "Upgrade Required",
      description: `You've reached your plan limit for ${feature}. Upgrade to unlock more.`,
      variant: "destructive",
    });
  };

  return (
    <SubscriptionContext.Provider
      value={{
        subscriptionTier,
        subscribed,
        limits,
        usage,
        loading,
        checkUsageLimit,
        incrementUsage,
        showUpgradeModal,
        refreshSubscription,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};