
import React, { useState } from 'react';
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
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

// Mock notifications data - in a real app this would come from an API
const mockNotifications = [
  {
    id: 1,
    type: 'buyer',
    title: 'New qualified buyer',
    message: 'Michael Rodriguez has been qualified with a $500K budget',
    time: '2 min ago',
    read: false,
    icon: Users,
    color: 'text-green-600'
  },
  {
    id: 2,
    type: 'deal',
    title: 'Deal analysis complete',
    message: 'AI analysis for 123 Main St is ready for review',
    time: '5 min ago',
    read: false,
    icon: Calculator,
    color: 'text-blue-600'
  },
  {
    id: 3,
    type: 'contract',
    title: 'Contract signed',
    message: 'Purchase agreement for Elm Street property has been executed',
    time: '1 hour ago',
    read: true,
    icon: FileText,
    color: 'text-purple-600'
  },
  {
    id: 4,
    type: 'system',
    title: 'Low token balance',
    message: 'You have 5 tokens remaining. Consider purchasing more.',
    time: '2 hours ago',
    read: false,
    icon: AlertCircle,
    color: 'text-orange-600'
  }
];

const Header = () => {
  const { user } = useUser();
  const [tokenModalOpen, setTokenModalOpen] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);
  const isMobile = useIsMobile();

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: number) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const removeNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getTimeColor = (time: string) => {
    if (time.includes('min')) return 'text-green-600 dark:text-green-400';
    if (time.includes('hour')) return 'text-orange-600 dark:text-orange-400';
    return 'text-muted-foreground';
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
                  const IconComponent = notification.icon;
                  return (
                    <DropdownMenuItem
                      key={notification.id}
                      className={cn(
                        "p-3 cursor-pointer flex items-start space-x-3 hover:bg-muted/50",
                        !notification.read && "bg-muted/20"
                      )}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className={cn("p-1.5 rounded-full bg-muted", notification.color)}>
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
                        <p className={cn("text-xs font-medium", getTimeColor(notification.time))}>
                          {notification.time}
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
