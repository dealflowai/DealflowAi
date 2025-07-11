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
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">Purchase Tokens</DialogTitle>
          <DialogDescription className="text-center">
            Pay only for what you use. Tokens power all AI features.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {TOKEN_PACKAGES.map((pkg) => {
            const Icon = pkg.icon;
            return (
              <div
                key={pkg.id}
                className={`relative p-6 rounded-lg border-2 transition-all ${
                  pkg.popular 
                    ? 'border-primary bg-primary/5' 
                    : pkg.bestValue
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-muted hover:border-primary/50'
                }`}
              >
                {pkg.popular && (
                  <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary">
                    Most Popular
                  </Badge>
                )}
                {pkg.bestValue && (
                  <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-purple-600">
                    💎 Best Value
                  </Badge>
                )}

                <div className="text-center space-y-4">
                  <Icon className={`h-8 w-8 mx-auto ${
                    pkg.popular ? 'text-primary' : pkg.bestValue ? 'text-purple-600' : 'text-muted-foreground'
                  }`} />
                  
                  <div>
                    <div className="text-3xl font-bold">{pkg.tokens}</div>
                    <div className="text-sm text-muted-foreground">Tokens</div>
                  </div>

                  <div>
                    <div className="text-2xl font-bold">${pkg.price}</div>
                    <div className="text-xs text-muted-foreground">
                      ${pkg.value.toFixed(2)} per token
                    </div>
                    {pkg.bonus > 0 && (
                      <div className="text-xs text-green-600 font-medium">
                        Save {pkg.bonus}%
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={() => handlePurchase(pkg)}
                    disabled={loadingPackage === pkg.id}
                    className={`w-full ${
                      pkg.popular 
                        ? 'bg-primary hover:bg-primary/90' 
                        : pkg.bestValue
                        ? 'bg-purple-600 hover:bg-purple-700'
                        : ''
                    }`}
                  >
                    {loadingPackage === pkg.id ? 'Processing...' : 'Purchase'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium mb-2">Token Usage Guide:</h4>
          <div className="text-sm text-muted-foreground space-y-1">
            <div>• AI Deal Analyzer: 5 tokens</div>
            <div>• AI Buyer Discovery: 2 tokens per lead</div>
            <div>• Voice Outreach: 10 tokens per call</div>
            <div>• Contract Generator: 7 tokens</div>
            <div>• Buyer Matching: 2 tokens per match</div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}