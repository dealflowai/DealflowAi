
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTheme } from '@/contexts/ThemeContext';
import { useUser } from '@clerk/clerk-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useTokens, TOKEN_COSTS } from '@/contexts/TokenContext';
import { TokenPricingModal } from '@/components/ui/token-pricing-modal';
import { motion } from 'framer-motion';
import { 
  User, 
  Bell, 
  Shield, 
  CreditCard, 
  Moon, 
  Sun,
  Mail,
  Phone,
  Building,
  MapPin,
  CheckCircle,
  Star,
  ArrowRight,
  Settings as SettingsIcon,
  Zap,
  Users,
  Target,
  Gem
} from 'lucide-react';

interface SubscriptionStatus {
  subscribed: boolean;
  subscription_tier?: string;
  subscription_end?: string;
}

const Settings = () => {
  const { user } = useUser();
  const { isDark, toggleTheme } = useTheme();
  const { toast } = useToast();
  const { tokenBalance, loading: tokenLoading } = useTokens();
  const [tokenModalOpen, setTokenModalOpen] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);

  // Fetch subscription status
  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      try {
        const { data } = await supabase.functions.invoke('check-subscription');
        if (data) {
          setSubscriptionStatus(data);
        }
      } catch (error) {
        console.error('Error fetching subscription status:', error);
      } finally {
        setSubscriptionLoading(false);
      }
    };

    if (user) {
      fetchSubscriptionStatus();
    }
  }, [user]);

  const plans = [
    {
      name: "Entry / Free",
      price: 0,
      period: "",
      description: "25 non-expiring tokens, no credit card required",
      features: [
        "25 non-expiring tokens included",
        "Basic AI discovery",
        "Email support",
        "1 user included"
      ],
      popular: false,
      gradient: "from-emerald-500 to-blue-600",
      planId: "free"
    },
    {
      name: "Core Plan",
      price: 49,
      period: "/month",
      description: "25 tokens included every month",
      features: [
        "25 tokens included every month",
        "Advanced AI buyer discovery",
        "Unlimited deal analysis",
        "Priority support",
        "Advanced CRM features",
        "API access"
      ],
      popular: true,
      gradient: "from-blue-500 to-purple-600",
      planId: "pro"
    },
    {
      name: "Agency",
      price: 299,
      period: "/month",
      description: "1,500 tokens + 5 seats, extra seats $30/month",
      features: [
        "1,500 tokens included monthly",
        "5 user seats included",
        "Extra seats $30/month",
        "Team collaboration",
        "Priority support",
        "Custom branding"
      ],
      popular: false,
      gradient: "from-purple-500 to-pink-600",
      planId: "agency"
    }
  ];

  return (
    <Layout>
      <div className="p-6 space-y-6 max-w-6xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your account preferences and application settings</p>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" className="flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span>Profile</span>
            </TabsTrigger>
            <TabsTrigger value="billing" className="flex items-center space-x-2">
              <CreditCard className="w-4 h-4" />
              <span>Billing</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center space-x-2">
              <Bell className="w-4 h-4" />
              <span>Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center space-x-2">
              <Shield className="w-4 h-4" />
              <span>Security</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>Profile Information</span>
                </CardTitle>
                <CardDescription>Update your personal information and contact details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input 
                      id="firstName" 
                      defaultValue={user?.firstName || ''} 
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input 
                      id="lastName" 
                      defaultValue={user?.lastName || ''} 
                      className="mt-1"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <Input 
                      id="email" 
                      type="email"
                      defaultValue={user?.primaryEmailAddress?.emailAddress || ''} 
                      disabled
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <Input id="phone" type="tel" placeholder="+1 (555) 123-4567" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="company">Company</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <Building className="w-4 h-4 text-gray-400" />
                      <Input id="company" placeholder="Your Company Name" />
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="location">Location</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <Input id="location" placeholder="City, State" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea 
                    id="bio" 
                    className="mt-1" 
                    rows={3}
                    placeholder="Tell us about yourself and your investment focus..."
                  />
                </div>

                <Button className="bg-primary hover:bg-primary/90">Save Changes</Button>
              </CardContent>
            </Card>

            {/* Role and Preferences Card */}
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="w-5 h-5" />
                  <span>Role & Preferences</span>
                </CardTitle>
                <CardDescription>Update your role and business preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="role">Your Role</Label>
                  <select className="w-full mt-1 p-2 border rounded-md bg-background">
                    <option value="buyer">Buyer/Investor</option>
                    <option value="wholesaler">Wholesaler</option>
                    <option value="real_estate_agent">Real Estate Agent</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="markets">Primary Markets</Label>
                  <Textarea 
                    id="markets" 
                    className="mt-1" 
                    rows={2}
                    placeholder="e.g., Austin, Dallas, Houston..."
                  />
                </div>

                <div>
                  <Label htmlFor="propertyTypes">Property Types of Interest</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {['Single Family', 'Multi Family', 'Vacant Land', 'Commercial'].map((type) => (
                      <label key={type} className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="budgetMin">Min Budget</Label>
                    <Input id="budgetMin" type="number" placeholder="$50,000" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="budgetMax">Max Budget</Label>
                    <Input id="budgetMax" type="number" placeholder="$500,000" className="mt-1" />
                  </div>
                </div>

                <Button className="bg-primary hover:bg-primary/90">Update Preferences</Button>
              </CardContent>
            </Card>

            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Moon className="w-5 h-5" />
                  <span>Appearance</span>
                </CardTitle>
                <CardDescription>Customize your app appearance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                    <Label htmlFor="darkMode">Dark Mode</Label>
                  </div>
                  <Switch 
                    id="darkMode" 
                    checked={isDark}
                    onCheckedChange={toggleTheme}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing" className="space-y-4">
            {/* Current Plan */}
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <CreditCard className="w-5 h-5 text-primary" />
                  <span>Current Plan</span>
                </CardTitle>
                <CardDescription className="text-sm">Your current subscription plan and billing details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {subscriptionLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3"></div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Loading plan information...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-primary/10 to-blue-50 dark:from-primary/20 dark:to-blue-900/20 rounded-lg p-6 border border-primary/20">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-primary mb-1">
                            {subscriptionStatus?.subscribed ? 
                              (subscriptionStatus.subscription_tier === 'pro' ? 'Core Plan' :
                               subscriptionStatus.subscription_tier === 'agency' ? 'Agency Plan' :
                               'Entry / Free') : 
                              'Entry / Free'}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {subscriptionStatus?.subscribed ? 
                              (subscriptionStatus.subscription_tier === 'pro' ? '$49/month • 25 tokens every month' :
                               subscriptionStatus.subscription_tier === 'agency' ? '$299/month • 1,500 tokens + 5 seats' :
                               '25 non-expiring tokens, no credit card required') : 
                              '25 non-expiring tokens, no credit card required'}
                          </p>
                        </div>
                        <Badge variant={subscriptionStatus?.subscribed ? "default" : "secondary"}>
                          {subscriptionStatus?.subscribed ? "Active" : "Free"}
                        </Badge>
                      </div>
                      
                      {subscriptionStatus?.subscribed && subscriptionStatus.subscription_end && (
                        <div className="text-sm text-muted-foreground mb-4">
                          <span>Next billing date: </span>
                          <span className="font-medium">
                            {new Date(subscriptionStatus.subscription_end).toLocaleDateString()}
                          </span>
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row gap-2">
                        {!subscriptionStatus?.subscribed && (
                          <Button className="bg-primary hover:bg-primary/90 text-white flex-1">
                            <ArrowRight className="mr-2" size={14} />
                            Upgrade to Core Plan
                          </Button>
                        )}
                        {subscriptionStatus?.subscribed && (
                          <Button variant="outline" className="flex-1">
                            <SettingsIcon className="mr-2" size={14} />
                            Manage Subscription
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            {/* Token Balance */}
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <Gem className="w-5 h-5 text-primary" />
                  <span>Token Balance</span>
                </CardTitle>
                <CardDescription className="text-sm">Pay only for what you use with our token-based system</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {tokenLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3"></div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Loading token balance...</p>
                  </div>
                ) : tokenBalance ? (
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-primary/10 to-blue-50 dark:from-primary/20 dark:to-blue-900/20 rounded-lg p-4 border border-primary/20">
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="text-center">
                          <div className="text-xl sm:text-2xl font-bold text-primary mb-1">
                            {tokenBalance.remainingTokens}
                          </div>
                          <div className="text-xs text-muted-foreground">Remaining</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl sm:text-2xl font-bold text-gray-600 mb-1">
                            {tokenBalance.usedTokens}
                          </div>
                          <div className="text-xs text-muted-foreground">Used</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl sm:text-2xl font-bold text-gray-800 mb-1">
                            {tokenBalance.totalTokens}
                          </div>
                          <div className="text-xs text-muted-foreground">Total</div>
                        </div>
                      </div>
                      
                      <Button 
                        onClick={() => setTokenModalOpen(true)}
                        className="bg-primary hover:bg-primary/90 text-white w-full h-10"
                        size="sm"
                      >
                        <Gem className="mr-2" size={14} />
                        Buy More Tokens
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gradient-to-r from-blue-50 to-emerald-50 dark:from-blue-900/20 dark:to-emerald-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center mb-3">
                      <Gem className="w-5 h-5 text-blue-600 mr-2" />
                      <h3 className="text-lg font-bold text-blue-800 dark:text-blue-400">25 Free Tokens</h3>
                    </div>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                      Perfect for testing our AI features • No credit card required
                    </p>
                    <Button 
                      onClick={() => setTokenModalOpen(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white w-full h-10"
                      size="sm"
                    >
                      <Gem className="mr-2" size={14} />
                      Buy Tokens
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Token Usage Guide */}
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <Target className="w-5 h-5" />
                  <span>Token Usage Guide</span>
                </CardTitle>
                <CardDescription className="text-sm">See how tokens are used across different features</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.entries(TOKEN_COSTS).map(([feature, cost]) => (
                    <div key={feature} className="flex items-center justify-between p-3 border rounded-lg dark:border-gray-700 bg-muted/20">
                      <div className="flex items-center space-x-2">
                        <Gem className="w-3 h-3 text-primary flex-shrink-0" />
                        <span className="font-medium text-sm truncate">{feature}</span>
                      </div>
                      <Badge variant="secondary" className="text-xs ml-2 flex-shrink-0">
                        {cost} token{cost > 1 ? 's' : ''}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="w-5 h-5" />
                  <span>Notification Preferences</span>
                </CardTitle>
                <CardDescription>Configure how you receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                    <div>
                      <Label htmlFor="emailNotifs" className="font-medium">Email Notifications</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Receive updates via email</p>
                    </div>
                    <Switch id="emailNotifs" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                    <div>
                      <Label htmlFor="dealAlerts" className="font-medium">Deal Alerts</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Get notified of new deals</p>
                    </div>
                    <Switch id="dealAlerts" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                    <div>
                      <Label htmlFor="buyerMatches" className="font-medium">Buyer Matches</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Alert when buyers match your deals</p>
                    </div>
                    <Switch id="buyerMatches" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                    <div>
                      <Label htmlFor="weeklyReports" className="font-medium">Weekly Reports</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Receive weekly performance reports</p>
                    </div>
                    <Switch id="weeklyReports" />
                  </div>
                </div>
                
                <Button className="bg-primary hover:bg-primary/90">Save Preferences</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="w-5 h-5" />
                  <span>Account Security</span>
                </CardTitle>
                <CardDescription>Manage your account security settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <Button variant="outline" className="w-full justify-start" size="lg">
                    <Shield className="mr-2 w-4 h-4" />
                    Change Password
                  </Button>
                  
                  <Button variant="outline" className="w-full justify-start" size="lg">
                    <SettingsIcon className="mr-2 w-4 h-4" />
                    Two-Factor Authentication
                  </Button>
                  
                  <div className="border-t pt-4">
                    <h4 className="font-medium text-red-600 dark:text-red-400 mb-2">Danger Zone</h4>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/20"
                      size="lg"
                    >
                      Delete Account
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      <TokenPricingModal
        open={tokenModalOpen}
        onOpenChange={setTokenModalOpen}
      />
    </Layout>
  );
};

export default Settings;
