
import React, { useState, useEffect, useRef } from 'react';
import { Bell, Search, Check, X, AlertCircle, Users, Calculator, FileText, MapPin, Phone, Mail } from 'lucide-react';
import { UserButton, useUser } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TokenBalanceDisplay } from '@/components/ui/token-balance-display';
import { TokenPricingModal } from '@/components/ui/token-pricing-modal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { NotificationService, type Notification } from '@/services/notificationService';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const { user } = useUser();
  const [tokenModalOpen, setTokenModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ deals: [], buyers: [], contracts: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Get user profile for notifications and plan info
  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, selected_plan, role')
        .eq('clerk_id', user.id)
        .single();
      
      return profileData;
    },
    enabled: !!user?.id,
  });

  // Get subscription info
  const { data: subscription } = useQuery({
    queryKey: ['subscription', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data: subData } = await supabase
        .from('subscribers')
        .select('subscription_tier, subscribed')
        .eq('user_id', profile?.id)
        .single();
      
      return subData;
    },
    enabled: !!profile?.id,
  });

  // Fetch real notifications
  const { data: notifications = [], isLoading: notificationsLoading } = useQuery({
    queryKey: ['notifications', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      return NotificationService.getUserNotifications(profile.id);
    },
    enabled: !!profile?.id,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = async (id: string) => {
    const success = await NotificationService.markAsRead(id);
    if (success) {
      queryClient.invalidateQueries({ queryKey: ['notifications', profile?.id] });
    }
  };

  const markAllAsRead = async () => {
    if (!profile?.id) return;
    const success = await NotificationService.markAllAsRead(profile.id);
    if (success) {
      queryClient.invalidateQueries({ queryKey: ['notifications', profile?.id] });
    }
  };

  const removeNotification = async (id: string) => {
    const success = await NotificationService.deleteNotification(id);
    if (success) {
      queryClient.invalidateQueries({ queryKey: ['notifications', profile?.id] });
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  };

  const getTimeColor = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) return 'text-green-600 dark:text-green-400';
    if (diffInMinutes < 1440) return 'text-orange-600 dark:text-orange-400';
    return 'text-muted-foreground';
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'buyer': return Users;
      case 'deal': return Calculator;
      case 'contract': return FileText;
      case 'system': return AlertCircle;
      default: return Bell;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'buyer': return 'text-green-600';
      case 'deal': return 'text-blue-600';
      case 'contract': return 'text-purple-600';
      case 'system': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  // Search functionality
  const performSearch = async (query: string) => {
    if (!query.trim() || !profile?.id) {
      setSearchResults({ deals: [], buyers: [], contracts: [] });
      return;
    }

    setIsSearching(true);
    
    try {
      const searchTerm = `%${query.trim().toLowerCase()}%`;
      
      // Search deals
      const { data: deals } = await supabase
        .from('deals')
        .select('id, address, city, state, list_price, status')
        .eq('owner_id', profile.id)
        .or(`address.ilike.${searchTerm},city.ilike.${searchTerm},state.ilike.${searchTerm}`)
        .limit(5);

      // Search buyers
      const { data: buyers } = await supabase
        .from('buyers')
        .select('id, name, email, phone, city, state, status')
        .eq('owner_id', profile.id)
        .or(`name.ilike.${searchTerm},email.ilike.${searchTerm},city.ilike.${searchTerm},state.ilike.${searchTerm}`)
        .limit(5);

      // Search contracts
      const { data: contracts } = await supabase
        .from('contracts')
        .select('id, title, property_address, buyer_name, status')
        .eq('owner_id', profile.id)
        .or(`title.ilike.${searchTerm},property_address.ilike.${searchTerm},buyer_name.ilike.${searchTerm}`)
        .limit(5);

      setSearchResults({
        deals: deals || [],
        buyers: buyers || [],
        contracts: contracts || []
      });
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle search input changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, profile?.id]);

  // Handle click outside to close results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleResultClick = (type: string, id: string) => {
    setShowResults(false);
    setSearchQuery('');
    
    switch (type) {
      case 'deal':
        navigate('/deal-analyzer');
        break;
      case 'buyer':
        navigate('/buyer-crm');
        break;
      case 'contract':
        navigate('/contracts');
        break;
    }
  };

  const totalResults = searchResults.deals.length + searchResults.buyers.length + searchResults.contracts.length;

  // Get user plan display name
  const getUserPlanDisplay = () => {
    if (subscription?.subscribed && subscription?.subscription_tier) {
      return subscription.subscription_tier.charAt(0).toUpperCase() + subscription.subscription_tier.slice(1) + ' Plan';
    }
    if (profile?.selected_plan) {
      return profile.selected_plan.charAt(0).toUpperCase() + profile.selected_plan.slice(1) + ' Plan';
    }
    return 'Free Plan';
  };

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
          <div className="relative flex-1" ref={searchRef}>
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowResults(true);
              }}
              onFocus={() => setShowResults(true)}
              placeholder={isMobile ? "Search..." : "Search deals, buyers, or contracts..."} 
              className="pl-10 text-sm border-border/50 focus:border-primary focus:ring-primary/20 bg-background/50"
            />
            
            {/* Search Results Dropdown */}
            {showResults && searchQuery.trim() && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                {isSearching ? (
                  <div className="p-4 text-center text-muted-foreground">
                    <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                    Searching...
                  </div>
                ) : totalResults === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    No results found for "{searchQuery}"
                  </div>
                ) : (
                  <div className="py-2">
                    {/* Deals */}
                    {searchResults.deals.length > 0 && (
                      <>
                        <div className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider border-b">
                          Deals ({searchResults.deals.length})
                        </div>
                        {searchResults.deals.map((deal: any) => (
                          <button
                            key={deal.id}
                            onClick={() => handleResultClick('deal', deal.id)}
                            className="w-full text-left px-3 py-2 hover:bg-muted/50 flex items-center space-x-3"
                          >
                            <div className="p-1.5 rounded-full bg-blue-100 dark:bg-blue-900/20">
                              <Calculator className="w-3 h-3 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{deal.address}</p>
                              <p className="text-xs text-muted-foreground">
                                {deal.city}, {deal.state} • ${deal.list_price?.toLocaleString()} • {deal.status}
                              </p>
                            </div>
                          </button>
                        ))}
                      </>
                    )}

                    {/* Buyers */}
                    {searchResults.buyers.length > 0 && (
                      <>
                        <div className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider border-b">
                          Buyers ({searchResults.buyers.length})
                        </div>
                        {searchResults.buyers.map((buyer: any) => (
                          <button
                            key={buyer.id}
                            onClick={() => handleResultClick('buyer', buyer.id)}
                            className="w-full text-left px-3 py-2 hover:bg-muted/50 flex items-center space-x-3"
                          >
                            <div className="p-1.5 rounded-full bg-green-100 dark:bg-green-900/20">
                              <Users className="w-3 h-3 text-green-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{buyer.name}</p>
                              <p className="text-xs text-muted-foreground flex items-center space-x-2">
                                <span className="flex items-center space-x-1">
                                  <Mail className="w-3 h-3" />
                                  <span className="truncate">{buyer.email}</span>
                                </span>
                                {buyer.city && (
                                  <span className="flex items-center space-x-1">
                                    <MapPin className="w-3 h-3" />
                                    <span>{buyer.city}, {buyer.state}</span>
                                  </span>
                                )}
                              </p>
                            </div>
                          </button>
                        ))}
                      </>
                    )}

                    {/* Contracts */}
                    {searchResults.contracts.length > 0 && (
                      <>
                        <div className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider border-b">
                          Contracts ({searchResults.contracts.length})
                        </div>
                        {searchResults.contracts.map((contract: any) => (
                          <button
                            key={contract.id}
                            onClick={() => handleResultClick('contract', contract.id)}
                            className="w-full text-left px-3 py-2 hover:bg-muted/50 flex items-center space-x-3"
                          >
                            <div className="p-1.5 rounded-full bg-purple-100 dark:bg-purple-900/20">
                              <FileText className="w-3 h-3 text-purple-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{contract.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {contract.property_address} • {contract.buyer_name} • {contract.status}
                              </p>
                            </div>
                          </button>
                        ))}
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3">
          {!isMobile && <TokenBalanceDisplay onBuyTokens={() => setTokenModalOpen(true)} />}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="relative hover:bg-muted/50">
                <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                {unreadCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 w-5 h-5 text-xs p-0 flex items-center justify-center rounded-full"
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
              <div className="flex items-center justify-between p-3">
                <h3 className="font-semibold text-sm">Notifications</h3>
                {unreadCount > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs h-7 px-2"
                    onClick={markAllAsRead}
                  >
                    Mark all read
                  </Button>
                )}
              </div>
              <DropdownMenuSeparator />
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No notifications</p>
                </div>
              ) : (
                notifications.map((notification) => {
                  const IconComponent = getNotificationIcon(notification.type);
                  const iconColor = getNotificationColor(notification.type);
                  return (
                    <DropdownMenuItem
                      key={notification.id}
                      className={cn(
                        "p-3 cursor-pointer flex items-start space-x-3 hover:bg-muted/50",
                        !notification.read && "bg-muted/20"
                      )}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className={cn("p-1.5 rounded-full bg-muted", iconColor)}>
                        <IconComponent className="w-3 h-3" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-start justify-between">
                          <p className="font-medium text-sm leading-none">
                            {notification.title}
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-4 w-4 p-0 hover:bg-destructive/10 hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeNotification(notification.id);
                            }}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {notification.message}
                        </p>
                        <p className={cn("text-xs font-medium", getTimeColor(notification.created_at))}>
                          {getTimeAgo(notification.created_at)}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-primary rounded-full mt-1"></div>
                      )}
                    </DropdownMenuItem>
                  );
                })
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <div className={cn(
            "flex items-center space-x-2 sm:space-x-3 border-l border-border/50",
            isMobile ? "pl-2" : "pl-4"
          )}>
            {!isMobile && (
              <div className="text-right">
                <p className="text-sm font-medium text-foreground truncate max-w-24">
                  {user?.firstName || user?.emailAddresses[0]?.emailAddress || 'User'}
                </p>
                <p className="text-xs text-muted-foreground">{getUserPlanDisplay()}</p>
              </div>
            )}
            <UserButton 
              appearance={{
                elements: {
                  avatarBox: "w-7 h-7 sm:w-8 sm:h-8 shadow-sm ring-2 ring-primary/10 hover:ring-primary/20 transition-all",
                  userButtonPopoverCard: "bg-background border border-border shadow-lg rounded-xl p-0 overflow-hidden",
                  userButtonPopoverActionButton: "text-foreground hover:bg-muted/80 rounded-lg mx-2 first:mt-2 last:mb-2 transition-colors",
                  userButtonPopoverActionButtonText: "text-sm font-medium",
                  userButtonPopoverActionButtonIcon: "text-muted-foreground",
                  userButtonPopoverFooter: "hidden",
                  userPreviewSecondaryIdentifier: "text-muted-foreground text-xs",
                  userPreviewMainIdentifier: "text-foreground font-medium",
                  userButtonPopoverMain: "p-3",
                  userButtonPopoverActions: "space-y-1 p-1"
                },
                variables: {
                  colorPrimary: "hsl(var(--primary))",
                  colorText: "hsl(var(--foreground))",
                  colorTextSecondary: "hsl(var(--muted-foreground))",
                  colorBackground: "hsl(var(--background))",
                  colorInputBackground: "hsl(var(--background))",
                  borderRadius: "0.75rem"
                }
              }}
              userProfileUrl="/settings"
              afterSignOutUrl="/"
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
