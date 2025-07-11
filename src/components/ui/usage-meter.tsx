import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, AlertTriangle } from 'lucide-react';

interface UsageMeterProps {
  title: string;
  current: number;
  limit: number;
  unit?: string;
  showUpgrade?: boolean;
  onUpgrade?: () => void;
}

export const UsageMeter: React.FC<UsageMeterProps> = ({
  title,
  current,
  limit,
  unit = 'uses',
  showUpgrade = false,
  onUpgrade,
}) => {
  const percentage = limit > 0 ? Math.min((current / limit) * 100, 100) : 0;
  const isNearLimit = percentage >= 80;
  const isAtLimit = percentage >= 100;

  return (
    <Card className={`${isAtLimit ? 'border-destructive' : isNearLimit ? 'border-warning' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {isAtLimit && <AlertTriangle className="h-4 w-4 text-destructive" />}
          {isNearLimit && !isAtLimit && <TrendingUp className="h-4 w-4 text-warning" />}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {current} / {limit === 999999 ? '∞' : limit} {unit}
            </span>
            <Badge variant={isAtLimit ? 'destructive' : isNearLimit ? 'secondary' : 'outline'}>
              {percentage.toFixed(0)}%
            </Badge>
          </div>
          
          {limit !== 999999 && (
            <Progress 
              value={percentage} 
              className="h-2"
            />
          )}
          
          {(isAtLimit || showUpgrade) && onUpgrade && (
            <Button 
              onClick={onUpgrade}
              variant={isAtLimit ? 'destructive' : 'outline'}
              size="sm"
              className="w-full"
            >
              {isAtLimit ? 'Upgrade Required' : 'Upgrade Plan'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};