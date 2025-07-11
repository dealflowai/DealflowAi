import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface TokenBalance {
  totalTokens: number;
  usedTokens: number;
  remainingTokens: number;
}

interface TokenContextType {
  tokenBalance: TokenBalance | null;
  loading: boolean;
  refreshTokenBalance: () => Promise<void>;
  deductTokens: (amount: number, feature: string) => Promise<boolean>;
  showTokenUpgradeModal: (feature: string, cost: number) => void;
}

const TokenContext = createContext<TokenContextType | undefined>(undefined);

export const TOKEN_COSTS = {
  'AI Deal Analyzer': 5,
  'AI Buyer Discovery': 2,
  'Voice Outreach': 10,
  'Buyer Matching': 2,
  'Contract Generator': 7,
  'Saved Search': 1,
  'Marketplace Listing': 2,
} as const;

export function TokenProvider({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const [tokenBalance, setTokenBalance] = useState<TokenBalance | null>(null);
  const [loading, setLoading] = useState(false);

  const refreshTokenBalance = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_user_tokens', {
        p_user_id: user.id
      });

      if (error) throw error;
      
      if (data && data.length > 0) {
        setTokenBalance({
          totalTokens: data[0].total_tokens,
          usedTokens: data[0].used_tokens,
          remainingTokens: data[0].remaining_tokens,
        });
      }
    } catch (error) {
      console.error('Error fetching token balance:', error);
      toast({
        title: "Error",
        description: "Failed to fetch token balance",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deductTokens = async (amount: number, feature: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const { data, error } = await supabase.rpc('deduct_tokens', {
        p_user_id: user.id,
        p_tokens: amount
      });

      if (error) throw error;
      
      if (data) {
        await refreshTokenBalance();
        toast({
          title: "Tokens Used",
          description: `Used ${amount} tokens for ${feature}`,
        });
        return true;
      } else {
        showTokenUpgradeModal(feature, amount);
        return false;
      }
    } catch (error) {
      console.error('Error deducting tokens:', error);
      toast({
        title: "Error",
        description: "Failed to deduct tokens",
        variant: "destructive",
      });
      return false;
    }
  };

  const showTokenUpgradeModal = (feature: string, cost: number) => {
    toast({
      title: "Insufficient Tokens",
      description: `You need ${cost} tokens to use ${feature}. Please purchase more tokens to continue.`,
      variant: "destructive",
    });
  };

  useEffect(() => {
    if (user) {
      refreshTokenBalance();
    }
  }, [user]);

  return (
    <TokenContext.Provider value={{
      tokenBalance,
      loading,
      refreshTokenBalance,
      deductTokens,
      showTokenUpgradeModal,
    }}>
      {children}
    </TokenContext.Provider>
  );
}

export function useTokens() {
  const context = useContext(TokenContext);
  if (context === undefined) {
    throw new Error('useTokens must be used within a TokenProvider');
  }
  return context;
}