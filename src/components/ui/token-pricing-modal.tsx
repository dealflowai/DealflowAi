import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Gem, Star, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@clerk/clerk-react';
import { toast } from '@/hooks/use-toast';
import { useTokens } from '@/contexts/TokenContext';

interface TokenPricingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userPlan?: string;
}

const TOKEN_PACKAGES = [
  {
    id: 'trial',
    tokens: 25,
    price: 15,
    value: 0.60,
    bonus: 0,
    popular: false,
    icon: Gem,
  },
  {
    id: 'basic',
    tokens: 50,
    price: 27,
    value: 0.54,
    bonus: 5,
    popular: false,
    icon: Gem,
  },
  {
    id: 'starter',
    tokens: 100,
    price: 49,
    value: 0.49,
    bonus: 10,
    popular: false,
    icon: Gem,
  },
  {
    id: 'standard',
    tokens: 250,
    price: 110,
    value: 0.44,
    bonus: 15,
    popular: true,
    icon: Star,
  },
  {
    id: 'pro',
    tokens: 500,
    price: 199,
    value: 0.40,
    bonus: 20,
    popular: false,
    icon: Zap,
  },
  {
    id: 'business',
    tokens: 1000,
    price: 379,
    value: 0.38,
    bonus: 25,
    popular: false,
    icon: Zap,
  },
  {
    id: 'enterprise',
    tokens: 2000,
    price: 699,
    value: 0.35,
    bonus: 30,
    popular: false,
    icon: Zap,
  },
  {
    id: 'premium',
    tokens: 5000,
    price: 1599,
    value: 0.32,
    bonus: 35,
    popular: false,
    icon: Zap,
    bestValue: true,
  },
  {
    id: 'ultimate',
    tokens: 10000,
    price: 2999,
    value: 0.30,
    bonus: 40,
    popular: false,
    icon: Zap,
  },
];

export function TokenPricingModal({ open, onOpenChange, userPlan }: TokenPricingModalProps) {
  const { user } = useUser();
  const { refreshTokenBalance } = useTokens();
  const [loadingPackage, setLoadingPackage] = useState<string | null>(null);
  
  const isFreePlan = userPlan?.toLowerCase().includes('free');

  // Listen for successful token purchases
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token_purchase_success' && e.newValue === 'true') {
        // Payment was successful, refresh tokens and close modal
        refreshTokenBalance();
        onOpenChange(false);
        localStorage.removeItem('token_purchase_success');
        toast({
          title: "Tokens Added Successfully!",
          description: "Your tokens have been added to your account.",
        });
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [refreshTokenBalance, onOpenChange]);

  const handlePurchase = async (packageData: typeof TOKEN_PACKAGES[0]) => {
    if (!user) return;

    setLoadingPackage(packageData.id);
    try {
      const { data, error } = await supabase.functions.invoke('create-token-purchase', {
        body: { 
          tokens: packageData.tokens,
          price: packageData.price,
          userEmail: user.emailAddresses[0]?.emailAddress,
          userId: user.id 
        }
      });

      if (error) throw error;

      if (data?.url) {
        // Store package info for after payment
        localStorage.setItem('pending_token_purchase', JSON.stringify(packageData));
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error creating token purchase:', error);
      toast({
        title: "Error",
        description: "Failed to initiate token purchase",
        variant: "destructive",
      });
    } finally {
      setLoadingPackage(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        {isFreePlan ? (
          <div className="text-center py-8">
            <DialogHeader className="pb-6">
              <DialogTitle className="text-3xl font-bold text-center">
                Upgrade Required
              </DialogTitle>
              <DialogDescription className="text-center text-muted-foreground">
                Token purchases are only available for paid plan users. Upgrade your plan to unlock additional tokens.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-6 border rounded-lg bg-muted/30">
                <h3 className="text-lg font-semibold mb-2">Current Plan: {userPlan || 'Free'}</h3>
                <p className="text-muted-foreground mb-4">
                  Free plan users receive a monthly token allowance but cannot purchase additional tokens.
                </p>
                <Button size="lg" className="w-full max-w-sm mx-auto">
                  Upgrade to Pro Plan
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <DialogHeader className="pb-6">
              <DialogTitle className="text-3xl font-bold text-center">
                Choose Your Token Package
              </DialogTitle>
              <DialogDescription className="text-center text-muted-foreground">
                Buy extra tokens that never expire. Core plan includes 100 monthly tokens for $49/month.
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {TOKEN_PACKAGES.map((pkg, index) => {
                const Icon = pkg.icon;
                return (
                  <div
                    key={pkg.id}
                    className={`relative rounded-lg border p-6 text-center transition-colors ${
                      pkg.popular 
                        ? 'border-primary bg-primary/5' 
                        : pkg.bestValue
                        ? 'border-purple-500 bg-purple-50/50'
                        : 'border-border bg-card hover:border-primary'
                    }`}
                  >
                    {pkg.popular && (
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                        <Badge className="bg-primary text-primary-foreground">
                          Most Popular
                        </Badge>
                      </div>
                    )}
                    {pkg.bestValue && (
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                        <Badge className="bg-purple-600 text-white">
                          Best Value
                        </Badge>
                      </div>
                    )}

                    <div className="space-y-4">
                      {/* Icon */}
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                        <Icon className="h-6 w-6 text-foreground" />
                      </div>
                      
                      {/* Token count */}
                      <div>
                        <div className="text-3xl font-bold text-foreground">
                          {pkg.tokens.toLocaleString()}
                        </div>
                        <div className="text-sm text-muted-foreground">Tokens</div>
                      </div>

                      {/* Price */}
                      <div className="space-y-1">
                        <div className="text-2xl font-bold text-foreground">
                          ${pkg.price}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          ${pkg.value.toFixed(2)} per token
                        </div>
                        {pkg.bonus > 0 && (
                          <div className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                            Save {pkg.bonus}%
                          </div>
                        )}
                      </div>

                      {/* Purchase button */}
                      <Button
                        onClick={() => handlePurchase(pkg)}
                        disabled={loadingPackage === pkg.id}
                        className={`w-full ${
                          pkg.popular || pkg.bestValue
                            ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                            : ''
                        }`}
                      >
                        {loadingPackage === pkg.id ? (
                          <div className="flex items-center space-x-2">
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            <span>Processing...</span>
                          </div>
                        ) : (
                          'Purchase Now'
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Usage guide */}
            <div className="mt-8 rounded-lg border bg-muted/30 p-6">
              <h4 className="mb-4 text-lg font-semibold">How You'll Use Your Tokens</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  { feature: 'AI Deal Analyzer', cost: 5, icon: '🎯' },
                  { feature: 'AI Buyer Discovery', cost: 2, icon: '🔍' },
                  { feature: 'Voice Outreach', cost: 10, icon: '📞' },
                  { feature: 'Contract Generator', cost: 7, icon: '📄' },
                  { feature: 'Buyer Matching', cost: 2, icon: '🤝' },
                  { feature: 'Marketplace Listing', cost: 2, icon: '🏪' }
                ].map((item) => (
                  <div key={item.feature} className="flex items-center justify-between rounded-md bg-background p-3">
                    <div className="flex items-center space-x-2">
                      <span>{item.icon}</span>
                      <span className="text-sm font-medium">{item.feature}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {item.cost} token{item.cost > 1 ? 's' : ''}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}