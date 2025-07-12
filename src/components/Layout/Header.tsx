
import React, { useState, useEffect } from 'react';
import { Bell, Search, Check, X, AlertCircle, Users, Calculator, FileText } from 'lucide-react';
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

const Header = () => {
  const { user } = useUser();
  const [tokenModalOpen, setTokenModalOpen] = useState(false);
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();

  // Get user profile for notifications
  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id')
        .eq('clerk_id', user.id)
        .single();
      
      return profileData;
    },
    enabled: !!user?.id,
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
                <p className="text-xs text-muted-foreground">Token User</p>
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
