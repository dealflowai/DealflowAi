import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Gem, Star, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@clerk/clerk-react';
import { toast } from '@/hooks/use-toast';

interface TokenPricingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TOKEN_PACKAGES = [
  {
    id: 'starter',
    tokens: 100,
    price: 49,
    value: 0.49,
    bonus: 0,
    popular: false,
    icon: Gem,
  },
  {
    id: 'standard',
    tokens: 250,
    price: 110,
    value: 0.44,
    bonus: 10,
    popular: true,
    icon: Star,
  },
  {
    id: 'pro',
    tokens: 500,
    price: 199,
    value: 0.40,
    bonus: 18,
    popular: false,
    icon: Zap,
  },
  {
    id: 'business',
    tokens: 1000,
    price: 379,
    value: 0.38,
    bonus: 22,
    popular: false,
    icon: Zap,
  },
  {
    id: 'enterprise',
    tokens: 2000,
    price: 699,
    value: 0.35,
    bonus: 28,
    popular: false,
    icon: Zap,
    bestValue: true,
  },
];

export function TokenPricingModal({ open, onOpenChange }: TokenPricingModalProps) {
  const { user } = useUser();
  const [loadingPackage, setLoadingPackage] = useState<string | null>(null);

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
      <DialogContent className="max-w-7xl max-h-[95vh] w-[95vw] overflow-y-auto bg-gradient-to-br from-background via-background to-muted/20 border-0 shadow-2xl">
        <DialogHeader className="sticky top-0 bg-gradient-to-r from-background/95 to-background/95 backdrop-blur-sm pb-6 z-10">
          <DialogTitle className="text-2xl sm:text-3xl font-bold text-center bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Choose Your Token Package
          </DialogTitle>
          <DialogDescription className="text-center text-base text-muted-foreground max-w-2xl mx-auto">
            Pay only for what you use. Each token powers our advanced AI features to help you close more deals.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6 mt-6">
          {TOKEN_PACKAGES.map((pkg, index) => {
            const Icon = pkg.icon;
            return (
              <div
                key={pkg.id}
                className={`group relative overflow-hidden rounded-2xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-xl ${
                  pkg.popular 
                    ? 'border-primary bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 shadow-lg shadow-primary/20' 
                    : pkg.bestValue
                    ? 'border-purple-500 bg-gradient-to-br from-purple-50 via-purple-100/50 to-purple-50 shadow-lg shadow-purple-500/20'
                    : 'border-border bg-gradient-to-br from-background to-muted/30 hover:border-primary/40 hover:shadow-lg'
                }`}
                style={{
                  animationDelay: `${index * 100}ms`,
                  animation: 'fadeInUp 0.5s ease-out forwards'
                }}
              >
                {/* Animated background effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
                    <Badge className="bg-gradient-to-r from-primary to-blue-600 text-white shadow-lg border-0 text-xs font-semibold px-3 py-1">
                      ⭐ Most Popular
                    </Badge>
                  </div>
                )}
                {pkg.bestValue && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
                    <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg border-0 text-xs font-semibold px-3 py-1">
                      💎 Best Value
                    </Badge>
                  </div>
                )}

                <div className="relative p-4 sm:p-6 text-center space-y-4">
                  {/* Icon with animated background */}
                  <div className={`relative mx-auto w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
                    pkg.popular 
                      ? 'bg-gradient-to-br from-primary/20 to-blue-600/20 group-hover:from-primary/30 group-hover:to-blue-600/30' 
                      : pkg.bestValue 
                      ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 group-hover:from-purple-500/30 group-hover:to-pink-500/30'
                      : 'bg-gradient-to-br from-muted to-muted/50 group-hover:from-primary/20 group-hover:to-blue-600/20'
                  }`}>
                    <Icon className={`h-7 w-7 transition-all duration-300 ${
                      pkg.popular 
                        ? 'text-primary group-hover:scale-110' 
                        : pkg.bestValue 
                        ? 'text-purple-600 group-hover:scale-110' 
                        : 'text-muted-foreground group-hover:text-primary group-hover:scale-110'
                    }`} />
                  </div>
                  
                  {/* Token count */}
                  <div>
                    <div className={`text-3xl sm:text-4xl font-bold transition-colors duration-300 ${
                      pkg.popular 
                        ? 'text-primary' 
                        : pkg.bestValue 
                        ? 'text-purple-600' 
                        : 'text-foreground group-hover:text-primary'
                    }`}>
                      {pkg.tokens.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground font-medium">Tokens</div>
                  </div>

                  {/* Price and savings */}
                  <div className="space-y-2">
                    <div className={`text-2xl sm:text-3xl font-bold transition-colors duration-300 ${
                      pkg.popular 
                        ? 'text-primary' 
                        : pkg.bestValue 
                        ? 'text-purple-600' 
                        : 'text-foreground'
                    }`}>
                      ${pkg.price}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      ${pkg.value.toFixed(2)} per token
                    </div>
                    {pkg.bonus > 0 && (
                      <div className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                        💰 Save {pkg.bonus}%
                      </div>
                    )}
                  </div>

                  {/* Purchase button */}
                  <Button
                    onClick={() => handlePurchase(pkg)}
                    disabled={loadingPackage === pkg.id}
                    size="sm"
                    className={`w-full transition-all duration-300 font-semibold shadow-lg hover:shadow-xl ${
                      pkg.popular 
                        ? 'bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white' 
                        : pkg.bestValue
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
                        : 'bg-gradient-to-r from-muted-foreground to-muted-foreground/80 hover:from-primary hover:to-blue-600 text-white'
                    }`}
                  >
                    {loadingPackage === pkg.id ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Processing...</span>
                      </div>
                    ) : (
                      <span className="flex items-center justify-center space-x-2">
                        <Gem className="w-4 h-4" />
                        <span>Purchase Now</span>
                      </span>
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Enhanced usage guide */}
        <div className="mt-8 p-6 bg-gradient-to-r from-muted/50 via-muted/30 to-muted/50 rounded-2xl border border-border/50 shadow-inner">
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary/20 to-blue-600/20 flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary" />
            </div>
            <h4 className="text-lg font-semibold text-foreground">How You'll Use Your Tokens</h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { feature: 'AI Deal Analyzer', cost: 5, icon: '🎯' },
              { feature: 'AI Buyer Discovery', cost: 2, icon: '🔍' },
              { feature: 'Voice Outreach', cost: 10, icon: '📞' },
              { feature: 'Contract Generator', cost: 7, icon: '📄' },
              { feature: 'Buyer Matching', cost: 2, icon: '🤝' },
              { feature: 'Marketplace Listing', cost: 2, icon: '🏪' }
            ].map((item) => (
              <div key={item.feature} className="flex items-center justify-between p-3 bg-background/50 rounded-lg border border-border/30">
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{item.icon}</span>
                  <span className="font-medium text-sm">{item.feature}</span>
                </div>
                <Badge variant="outline" className="text-xs font-semibold">
                  {item.cost} token{item.cost > 1 ? 's' : ''}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        <style>{`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
}