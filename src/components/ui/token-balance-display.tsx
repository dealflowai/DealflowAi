import React from 'react';
import { useTokens } from '@/contexts/TokenContext';
import { Gem, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface TokenBalanceDisplayProps {
  showBuyButton?: boolean;
  onBuyTokens?: () => void;
}

export function TokenBalanceDisplay({ showBuyButton = true, onBuyTokens }: TokenBalanceDisplayProps) {
  const { tokenBalance, loading } = useTokens();

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

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 border">
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
      {showBuyButton && (
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
    </div>
  );
}