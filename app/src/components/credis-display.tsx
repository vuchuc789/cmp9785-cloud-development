'use client';

import { useState, useEffect } from 'react';
import { CreditCard, Clock } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

interface CreditDisplayProps {
  availableCredits: number;
  maxCredits: number;
  nextRefillTime: Date;
  refillCredit: () => void;
}

export function CreditDisplay({
  availableCredits,
  maxCredits,
  nextRefillTime,
  refillCredit,
}: CreditDisplayProps) {
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  // Calculate percentage of credits used
  const creditPercentage = Math.round((availableCredits / maxCredits) * 100);

  // Determine status color based on available credits
  const getStatusColor = () => {
    if (availableCredits <= 0) return 'text-destructive';
    if (availableCredits <= maxCredits * 0.2)
      return 'text-amber-500 dark:text-amber-400';
    return 'text-green-500 dark:text-green-400';
  };

  // Format time remaining until next credit
  useEffect(() => {
    const updateTimeRemaining = () => {
      const now = new Date();
      const diffMs = nextRefillTime.getTime() - now.getTime();

      if (diffMs <= 0) {
        setTimeRemaining('Refilling soon...');
        return;
      }

      const diffMins = Math.floor(diffMs / 60000);
      const diffSecs = Math.floor((diffMs % 60000) / 1000);

      if (diffMins > 0) {
        setTimeRemaining(`${diffMins}m ${diffSecs}s`);
      } else {
        setTimeRemaining(`${diffSecs}s`);
      }
    };

    updateTimeRemaining();
    const interval = setInterval(updateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [nextRefillTime]);

  // Effect to trigger credit refill when the time comes
  useEffect(() => {
    const now = new Date();
    const diffMs = nextRefillTime.getTime() - now.getTime();
    if (diffMs <= 0) {
      return;
    }

    const timeout = setTimeout(refillCredit, diffMs);

    return () => clearTimeout(timeout);
  }, [nextRefillTime, refillCredit]);

  return (
    <div className="flex items-center gap-3">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-md border">
              <CreditCard className={`h-4 w-4 ${getStatusColor()}`} />
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-medium">
                    {availableCredits} / {maxCredits} credits
                  </span>
                  {availableCredits <= 0 && (
                    <Badge
                      variant="destructive"
                      className="text-[10px] px-1 py-0 h-4"
                    >
                      Depleted
                    </Badge>
                  )}
                  {availableCredits > 0 &&
                    availableCredits <= maxCredits * 0.2 && (
                      <Badge
                        variant="outline"
                        className="text-[10px] px-1 py-0 h-4 border-amber-500 text-amber-500 dark:border-amber-400 dark:text-amber-400"
                      >
                        Low
                      </Badge>
                    )}
                </div>
                <Progress
                  value={creditPercentage}
                  className="h-1 w-24"
                  indicatorClassName={
                    availableCredits <= 0
                      ? 'bg-destructive'
                      : availableCredits <= maxCredits * 0.2
                        ? 'bg-amber-500 dark:bg-amber-400'
                        : 'bg-green-500 dark:bg-green-400'
                  }
                />
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Processing credits available</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {availableCredits < maxCredits && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                <span>{timeRemaining}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Time until next credit refill</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}
