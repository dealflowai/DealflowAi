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
      <div className="flex items-center gap-2">
        <Gem className="h-4 w-4 text-primary" />
        <span className="text-sm">Loading...</span>
      </div>
    );
  }

  const isLow = tokenBalance.remainingTokens < 10;

  return (
    <div className="flex items-center gap-2">
      <Gem className="h-4 w-4 text-primary" />
      <Badge 
        variant={isLow ? "destructive" : "secondary"}
        className="font-medium"
      >
        {tokenBalance.remainingTokens} tokens
      </Badge>
      {showBuyButton && (
        <Button
          size="sm"
          variant="outline"
          onClick={onBuyTokens}
          className="h-6 px-2 text-xs"
        >
          <Plus className="h-3 w-3 mr-1" />
          Buy
        </Button>
      )}
    </div>
  );
}