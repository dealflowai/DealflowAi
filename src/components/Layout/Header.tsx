
import React, { useState } from 'react';
import { Bell, Search } from 'lucide-react';
import { UserButton, useUser } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TokenBalanceDisplay } from '@/components/ui/token-balance-display';
import { TokenPricingModal } from '@/components/ui/token-pricing-modal';

const Header = () => {
  const { user } = useUser();
  const [tokenModalOpen, setTokenModalOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 h-16 fixed top-0 left-64 right-0 z-30">
      <div className="flex items-center justify-between px-6 h-full">
        <div className="flex items-center space-x-4 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input 
              placeholder="Search deals, buyers, or contracts..." 
              className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <TokenBalanceDisplay onBuyTokens={() => setTokenModalOpen(true)} />
          
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </Button>
          
          <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                {user?.firstName || user?.emailAddresses[0]?.emailAddress || 'User'}
              </p>
              <p className="text-xs text-gray-500">Pro Plan</p>
            </div>
            <UserButton 
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8"
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
