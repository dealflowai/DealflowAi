import React, { useState } from 'react';
import { useTokens } from '@/contexts/TokenContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { Gem, Plus, Clock, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface TokenBalanceDisplayProps {
  showBuyButton?: boolean;
  onBuyTokens?: () => void;
  userPlan?: string;
}

export function TokenBalanceDisplay({ showBuyButton = true, onBuyTokens, userPlan }: TokenBalanceDisplayProps) {
  const { tokenBalance, loading } = useTokens();
  const { subscriptionTier } = useSubscription();
  
  // Use subscription context tier if userPlan prop is not provided
  const currentPlan = userPlan || subscriptionTier || 'free';

  if (loading || !tokenBalance) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50">
        <Gem className="h-4 w-4 text-primary animate-pulse" />
        <span className="text-sm text-muted-foreground">Loading...</span>
      </div>
    );
  }

  const isLow = tokenBalance.remainingTokens < 10;
  const isEmpty = tokenBalance.remainingTokens === 0;
  const isFreePlan = !currentPlan || currentPlan.toLowerCase() === 'free' || currentPlan.toLowerCase().includes('free');

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 border cursor-pointer">
              <Gem className={`h-4 w-4 ${isEmpty ? 'text-destructive' : isLow ? 'text-orange-500' : 'text-primary'}`} />
              <Badge 
                variant={isEmpty ? "destructive" : isLow ? "outline" : "secondary"}
                className={`font-medium border-0 ${
                  isEmpty 
                    ? "bg-destructive/10 text-destructive hover:bg-destructive/20" 
                    : isLow 
                      ? "bg-orange-500/10 text-orange-700 hover:bg-orange-500/20" 
                      : "bg-primary/10 text-primary hover:bg-primary/20"
                }`}
              >
                {tokenBalance.remainingTokens} tokens
              </Badge>
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-xs">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-500" />
                <span className="text-sm">
                  Total tokens: {tokenBalance.totalTokens}
                  <span className="text-muted-foreground"> (monthly + purchased)</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-green-500" />
                <span className="text-sm">
                  Used: {tokenBalance.usedTokens}
                  <span className="text-muted-foreground"> tokens</span>
                </span>
              </div>
              <div className="border-t pt-2">
                <div className="text-sm">
                  <span className="font-medium">Total remaining: {tokenBalance.remainingTokens}</span>
                </div>
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      {showBuyButton && !isFreePlan && (
        <Button
          size="sm"
          variant="outline"
          onClick={onBuyTokens}
          className={`h-8 px-3 text-xs border-primary/20 hover:border-primary/40 hover:bg-primary/5 ${
            isEmpty ? 'animate-pulse border-destructive/40 hover:border-destructive/60' : ''
          }`}
        >
          <Plus className="h-3 w-3 mr-1" />
          {isEmpty ? 'Recharge' : 'Buy'}
        </Button>
      )}
      {showBuyButton && isFreePlan && (
        <div className="text-xs text-muted-foreground px-3 py-1.5">
          Upgrade to buy tokens
        </div>
      )}
      </div>
    </TooltipProvider>
  );
}