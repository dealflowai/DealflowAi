
import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { useIsMobile } from '@/hooks/use-mobile';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const isMobile = useIsMobile();

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
    </div>
  );
};

export default Layout;
