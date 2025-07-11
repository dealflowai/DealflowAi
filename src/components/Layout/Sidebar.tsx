
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { 
  BarChart3,
  Users,
  FileText,
  Calculator,
  MessageSquare,
  Settings,
  Home,
  Search,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Shield,
  Gem,
  Plus,
  Menu,
  X
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@clerk/clerk-react';
import { useTokens } from '@/contexts/TokenContext';
import { TokenPricingModal } from '@/components/ui/token-pricing-modal';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

const sidebarItems = [
  { icon: Home, label: 'Dashboard', path: '/' },
  { icon: Users, label: 'Buyer CRM', path: '/buyers' },
  { icon: Search, label: 'Deal Analyzer', path: '/analyzer' },
  { icon: FileText, label: 'Contracts', path: '/contracts' },
  { icon: MessageSquare, label: 'Marketplace', path: '/marketplace' },
  { icon: BarChart3, label: 'Analytics', path: '/analytics' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: (collapsed: boolean) => void;
}

const Sidebar = ({ collapsed, onToggle }: SidebarProps) => {
  const location = useLocation();
  const { user } = useUser();
  const { tokenBalance, loading: tokenLoading } = useTokens();
  const [tokenModalOpen, setTokenModalOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isMobile = useIsMobile();

  // Close mobile sidebar when route changes
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Close mobile sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobile && mobileOpen) {
        const sidebar = document.getElementById('sidebar');
        if (sidebar && !sidebar.contains(event.target as Node)) {
          setMobileOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobile, mobileOpen]);

  // Check if user has admin role
  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('clerk_id', user.id)
        .single();
      
      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }
      
      return data;
    },
    enabled: !!user?.id,
  });

  // Add admin link if user has admin role
  const isAdmin = profile && ['admin', 'super_admin'].includes(profile.role);
  const allSidebarItems = isAdmin 
    ? [...sidebarItems, { icon: Shield, label: 'Admin', path: '/admin' }]
    : sidebarItems;

  return (
    <>
      {/* Mobile Menu Button */}
      {isMobile && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setMobileOpen(true)}
          className="fixed top-4 left-4 z-50 lg:hidden bg-background/80 backdrop-blur"
        >
          <Menu className="w-5 h-5" />
        </Button>
      )}

      {/* Mobile Overlay */}
      {isMobile && mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <div 
        id="sidebar"
        className={cn(
          "bg-background border-r border-border h-screen fixed left-0 top-0 z-50 transition-all duration-300 shadow-lg",
          // Desktop behavior
          !isMobile && (collapsed ? "w-16" : "w-64"),
          // Mobile behavior
          isMobile && (mobileOpen ? "w-64" : "-translate-x-full w-64"),
          // Hide on mobile when closed
          isMobile && !mobileOpen && "lg:translate-x-0"
        )}
      >
        {/* Header */}
        <div className={cn(
          "p-4 sm:p-6 flex items-center border-b border-border/50",
          collapsed && !isMobile && "justify-center p-3"
        )}>
          {/* Mobile Close Button */}
          {isMobile && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileOpen(false)}
              className="mr-2 lg:hidden"
            >
              <X className="w-4 h-4" />
            </Button>
          )}

          {(!collapsed || isMobile) && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-emerald-600 to-green-700 bg-clip-text text-transparent">
                  dealflow.ai
                </h1>
                <p className="text-xs text-emerald-600 font-medium opacity-75">
                  AI-Powered CRM
                </p>
              </div>
            </div>
          )}
          
          {collapsed && !isMobile && (
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
          )}

          {/* Desktop Toggle Button */}
          {!isMobile && (
            <button
              onClick={() => onToggle(!collapsed)}
              className={cn(
                "hidden lg:flex items-center justify-center w-6 h-6 rounded bg-muted hover:bg-muted/80 transition-colors",
                collapsed ? "ml-2" : "ml-auto"
              )}
            >
              {collapsed ? (
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronLeft className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="px-3 sm:px-4 space-y-1 sm:space-y-2 mt-4">
          {allSidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-muted",
                  isActive 
                    ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-sm" 
                    : "text-foreground hover:text-foreground",
                  collapsed && !isMobile && "justify-center px-2"
                )}
                title={collapsed && !isMobile ? item.label : undefined}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {(!collapsed || isMobile) && <span className="truncate">{item.label}</span>}
                {(!collapsed || isMobile) && item.label === 'Admin' && (
                  <Shield className="w-3 h-3 ml-auto text-yellow-500 flex-shrink-0" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Token Card */}
        {(!collapsed || isMobile) && (
          <div className="absolute bottom-4 sm:bottom-6 left-3 sm:left-4 right-3 sm:right-4">
            <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg p-3 sm:p-4 border border-primary/20">
              {tokenLoading ? (
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-20 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-24 mb-3"></div>
                  <div className="h-8 bg-muted rounded"></div>
                </div>
              ) : tokenBalance ? (
                <>
                  <div className="flex items-center space-x-2 mb-2">
                    <Gem className="w-4 h-4 text-primary flex-shrink-0" />
                    <h3 className="font-medium text-sm text-foreground truncate">
                      {tokenBalance.remainingTokens} Tokens
                    </h3>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                    {tokenBalance.remainingTokens > 0 
                      ? `${tokenBalance.usedTokens} of ${tokenBalance.totalTokens} used`
                      : 'Recharge to continue using AI features'
                    }
                  </p>
                  <Button 
                    onClick={() => setTokenModalOpen(true)}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs py-2 px-3 rounded-md transition-all duration-200 shadow-sm hover:shadow-md"
                    size="sm"
                  >
                    <Plus className="w-3 h-3 mr-1 flex-shrink-0" />
                    <span className="truncate">
                      {tokenBalance.remainingTokens > 0 ? 'Buy More' : 'Recharge'}
                    </span>
                  </Button>
                </>
              ) : (
                <>
                  <div className="flex items-center space-x-2 mb-2">
                    <Gem className="w-4 h-4 text-primary flex-shrink-0" />
                    <h3 className="font-medium text-sm text-foreground truncate">25 Free Tokens</h3>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                    Try our AI features with your free tokens
                  </p>
                  <Button 
                    onClick={() => setTokenModalOpen(true)}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs py-2 px-3 rounded-md transition-all duration-200 shadow-sm hover:shadow-md"
                    size="sm"
                  >
                    <Plus className="w-3 h-3 mr-1 flex-shrink-0" />
                    <span className="truncate">Buy Tokens</span>
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
        
        <TokenPricingModal 
          open={tokenModalOpen} 
          onOpenChange={setTokenModalOpen} 
        />
      </div>
    </>
  );
};

export default Sidebar;
