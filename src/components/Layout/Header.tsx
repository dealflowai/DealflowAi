
import React, { useState } from 'react';
import { Bell, Search } from 'lucide-react';
import { UserButton, useUser } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TokenBalanceDisplay } from '@/components/ui/token-balance-display';
import { TokenPricingModal } from '@/components/ui/token-pricing-modal';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

const Header = () => {
  const { user } = useUser();
  const [tokenModalOpen, setTokenModalOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <header className={cn(
      "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border h-16 fixed top-0 right-0 z-30 shadow-sm transition-all duration-300",
      isMobile ? "left-0" : "left-64"
    )}>
      <div className={cn(
        "flex items-center justify-between h-full px-3 sm:px-6",
        isMobile && "pl-16" // Add left padding for mobile menu button
      )}>
        <div className="flex items-center space-x-4 flex-1 max-w-sm sm:max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input 
              placeholder={isMobile ? "Search..." : "Search deals, buyers, or contracts..."} 
              className="pl-10 text-sm border-border/50 focus:border-primary focus:ring-primary/20 bg-background/50"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3">
          {!isMobile && <TokenBalanceDisplay onBuyTokens={() => setTokenModalOpen(true)} />}
          
          <Button variant="ghost" size="sm" className="relative hover:bg-muted/50">
            <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-destructive rounded-full"></span>
          </Button>
          
          <div className={cn(
            "flex items-center space-x-2 sm:space-x-3 border-l border-border/50",
            isMobile ? "pl-2" : "pl-4"
          )}>
            {!isMobile && (
              <div className="text-right">
                <p className="text-sm font-medium text-foreground truncate max-w-24">
                  {user?.firstName || user?.emailAddresses[0]?.emailAddress || 'User'}
                </p>
                <p className="text-xs text-muted-foreground">Token User</p>
              </div>
            )}
            <UserButton 
              appearance={{
                elements: {
                  avatarBox: "w-7 h-7 sm:w-8 sm:h-8 shadow-sm ring-2 ring-primary/10"
                }
              }}
            />
          </div>
        </div>
      </div>
      
      <TokenPricingModal 
        open={tokenModalOpen} 
        onOpenChange={setTokenModalOpen} 
      />
    </header>
  );
};

export default Header;
