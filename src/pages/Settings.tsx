
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/contexts/ThemeContext';
import { useUser } from '@clerk/clerk-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
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
  Target
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
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>({ subscribed: false });
  const [loading, setLoading] = useState(false);
  const [checkingSubscription, setCheckingSubscription] = useState(true);

  const checkSubscription = async () => {
    try {
      setCheckingSubscription(true);
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (!authUser) return;

      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) throw error;
      
      setSubscriptionStatus(data);
    } catch (error: any) {
      console.error('Error checking subscription:', error);
      toast({
        title: "Error",
        description: "Failed to check subscription status",
        variant: "destructive",
      });
    } finally {
      setCheckingSubscription(false);
    }
  };

  useEffect(() => {
    checkSubscription();
  }, []);

  const handleSubscribe = async (plan: string) => {
    try {
      console.log('handleSubscribe called with plan:', plan);
      setLoading(true);
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      console.log('Current user:', authUser);
      
      if (!authUser) {
        console.log('No authenticated user found');
        toast({
          title: "Authentication Required",
          description: "Please sign in to continue",
          variant: "destructive",
        });
        return;
      }

      console.log('Invoking create-checkout function...');
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { plan }
      });
      
      console.log('Function response:', { data, error });
      
      if (error) throw error;
      
      if (data?.url) {
        console.log('Opening checkout URL:', data.url);
        // Open Stripe checkout in a new tab
        window.open(data.url, '_blank');
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error: any) {
      console.error('Error creating checkout:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create checkout session",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) throw error;
      
      // Open customer portal in a new tab
      window.open(data.url, '_blank');
    } catch (error: any) {
      console.error('Error opening customer portal:', error);
      toast({
        title: "Error", 
        description: "Failed to open customer portal",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const plans = [
    {
      name: "Starter",
      price: 79,
      period: "/mo",
      description: "Solo wholesaler or coach's student",
      features: [
        "Import buyers and analyze deals",
        "Basic AI discovery",
        "Email support",
        "1 user included",
        "Basic CRM features"
      ],
      popular: false,
      gradient: "from-blue-500 to-blue-700",
      planId: "starter"
    },
    {
      name: "Pro",
      price: 199,
      period: "/mo", 
      description: "Mid-level wholesaler doing 2+ deals/month",
      features: [
        "Advanced AI buyer discovery",
        "Unlimited deal analysis",
        "Priority support",
        "Advanced CRM features",
        "API access",
        "Deal automation"
      ],
      popular: true,
      gradient: "from-emerald-500 to-blue-600",
      planId: "pro"
    },
    {
      name: "Agency",
      price: 499,
      period: "/mo",
      description: "3–5 users + full outreach campaigns, templates",
      features: [
        "Everything in Pro",
        "3-5 user accounts",
        "Full outreach campaigns",
        "Custom templates",
        "Dedicated account manager",
        "White-label options"
      ],
      popular: false,
      gradient: "from-purple-500 to-pink-600",
      planId: "agency"
    }
  ];

  return (
    <Layout>
      <div className="p-6 space-y-6 max-w-4xl">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your account preferences and application settings</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Settings */}
          <Card className="lg:col-span-2 dark:bg-gray-800 dark:border-gray-700">
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

          {/* App Preferences */}
          <div className="space-y-6">
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="w-5 h-5" />
                  <span>Appearance</span>
                </CardTitle>
                <CardDescription>Customize your app appearance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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

            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="w-5 h-5" />
                  <span>Notifications</span>
                </CardTitle>
                <CardDescription>Configure your notification preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="emailNotifs">Email Notifications</Label>
                  <Switch id="emailNotifs" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="dealAlerts">Deal Alerts</Label>
                  <Switch id="dealAlerts" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="buyerMatches">Buyer Matches</Label>
                  <Switch id="buyerMatches" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="weeklyReports">Weekly Reports</Label>
                  <Switch id="weeklyReports" />
                </div>
              </CardContent>
            </Card>

            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="w-5 h-5" />
                  <span>Privacy & Security</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full">
                  Change Password
                </Button>
                <Button variant="outline" className="w-full">
                  Two-Factor Authentication
                </Button>
                <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/20">
                  Delete Account
                </Button>
              </CardContent>
            </Card>

            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard className="w-5 h-5" />
                  <span>Billing & Subscription</span>
                </CardTitle>
                <CardDescription>Manage your subscription and billing settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {checkingSubscription ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto mb-4"></div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Checking subscription status...</p>
                  </div>
                ) : subscriptionStatus.subscribed ? (
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 rounded-lg p-4 border border-emerald-200 dark:border-emerald-800">
                      <div className="flex items-center mb-2">
                        <CheckCircle className="w-5 h-5 text-emerald-600 mr-2" />
                        <span className="font-medium text-emerald-800 dark:text-emerald-400">
                          Active: {subscriptionStatus.subscription_tier}
                        </span>
                      </div>
                      <p className="text-sm text-emerald-700 dark:text-emerald-300">
                        Renews on {subscriptionStatus.subscription_end && 
                          new Date(subscriptionStatus.subscription_end).toLocaleDateString()
                        }
                      </p>
                    </div>
                    <Button 
                      onClick={handleManageSubscription}
                      disabled={loading}
                      className="w-full bg-emerald-600 hover:bg-emerald-700"
                    >
                      <SettingsIcon className="mr-2" size={16} />
                      Manage Subscription
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-blue-50 to-emerald-50 dark:from-blue-900/20 dark:to-emerald-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center mb-2">
                        <Zap className="w-5 h-5 text-blue-600 mr-2" />
                        <span className="font-medium text-blue-800 dark:text-blue-400">Free Plan</span>
                      </div>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        14-day trial • Limited features • Basic support
                      </p>
                    </div>
                    
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">Choose Your Plan</h4>
                      {plans.map((plan, index) => {
                        return (
                          <motion.div
                            key={plan.name}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                            className="relative"
                          >
                            {plan.popular && (
                              <div className="absolute -top-2 right-2">
                                <Badge className="bg-gradient-to-r from-emerald-500 to-blue-500 text-white text-xs">
                                  Most Popular
                                </Badge>
                              </div>
                            )}
                            
                            <Card className={`${plan.popular ? 'ring-2 ring-emerald-500' : ''} transition-all hover:shadow-md`}>
                              <CardHeader className={`bg-gradient-to-r ${plan.gradient} text-white rounded-t-lg`}>
                                <div className="flex items-center justify-between">
                                  <div>
                                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                                    <p className="text-white/80 text-sm">{plan.description}</p>
                                  </div>
                                  <div className="text-right">
                                    <span className="text-2xl font-bold">${plan.price}</span>
                                    <span className="text-white/80 text-sm">{plan.period}</span>
                                  </div>
                                </div>
                              </CardHeader>
                              
                              <CardContent className="p-4">
                                <ul className="space-y-2 mb-4 text-sm">
                                  {plan.features.slice(0, 3).map((feature, featureIndex) => (
                                    <li key={featureIndex} className="flex items-start space-x-2">
                                      <CheckCircle className="text-emerald-500 mt-0.5 flex-shrink-0" size={14} />
                                      <span className="text-gray-600 dark:text-gray-400">{feature}</span>
                                    </li>
                                  ))}
                                  {plan.features.length > 3 && (
                                    <li className="text-sm text-gray-500 dark:text-gray-500">
                                      +{plan.features.length - 3} more features
                                    </li>
                                  )}
                                </ul>
                                
                                <Button 
                                  className={`w-full ${
                                    plan.popular 
                                      ? 'bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white' 
                                      : 'bg-gray-100 hover:bg-gray-200 text-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100'
                                  }`}
                                  onClick={() => handleSubscribe(plan.planId)}
                                  disabled={loading}
                                >
                                  {loading ? 'Processing...' : 'Choose Plan'}
                                  <ArrowRight className="ml-2" size={16} />
                                </Button>
                              </CardContent>
                            </Card>
                          </motion.div>
                        );
                      })}
                    </div>
                    
                    <Button 
                      variant="outline" 
                      onClick={checkSubscription}
                      disabled={checkingSubscription}
                      className="w-full"
                    >
                      {checkingSubscription ? 'Checking...' : 'Refresh Subscription Status'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
