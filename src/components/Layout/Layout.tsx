
import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTokens } from '@/contexts/TokenContext';
import { TokenPricingModal } from '@/components/ui/token-pricing-modal';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const isMobile = useIsMobile();
  const { showTokenPricingModal, setShowTokenPricingModal } = useTokens();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar collapsed={sidebarCollapsed} onToggle={setSidebarCollapsed} />
      <Header />
      <main className={`${
        isMobile 
          ? 'ml-0 pt-16' 
          : sidebarCollapsed 
            ? 'ml-16 pt-16' 
            : 'ml-64 pt-16'
      } transition-all duration-200`}>
        {children}
      </main>
      
      {/* Global Token Pricing Modal */}
      <TokenPricingModal 
        open={showTokenPricingModal} 
        onOpenChange={setShowTokenPricingModal} 
      />
    </div>
  );
};

export default Layout;
