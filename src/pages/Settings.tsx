
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
import { useSubscription } from '@/contexts/SubscriptionContext';
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
  Gem,
  ExternalLink
} from 'lucide-react';

const Settings = () => {
  const { user } = useUser();
  const { isDark, toggleTheme } = useTheme();
  const { toast } = useToast();
  const { tokenBalance, loading: tokenLoading } = useTokens();
  const { subscriptionTier, subscribed, loading: subscriptionLoading, refreshSubscription } = useSubscription();
  const [tokenModalOpen, setTokenModalOpen] = useState(false);
  const [upgrading, setUpgrading] = useState(false);
  
  // Profile form state
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    company_name: '',
    brokerage_name: '',
    user_role: '',
    primary_markets: [],
    property_types: [],
    budget_min: '',
    budget_max: '',
    bio: ''
  });
  const [saving, setSaving] = useState(false);

  const getCurrentPlan = () => {
    if (!subscribed) return 'free';
    const tier = subscriptionTier?.toLowerCase();
    if (tier === 'pro') return 'core';
    if (tier === 'agency') return 'agency';
    return 'free';
  };

  const getPlanDisplayName = () => {
    const plan = getCurrentPlan();
    if (plan === 'free') return 'Entry / Free';
    if (plan === 'core') return 'Core Plan';
    if (plan === 'agency') return 'Agency Plan';
    return 'Entry / Free';
  };

  const getPlanDescription = () => {
    const plan = getCurrentPlan();
    if (plan === 'free') return '25 non-expiring tokens, no credit card required';
    if (plan === 'core') return '$49/month • 25 tokens every month';
    if (plan === 'agency') return '$299/month • 1,500 tokens + 5 seats';
    return '25 non-expiring tokens, no credit card required';
  };

  // Load profile data on component mount
  useEffect(() => {
    const loadProfileData = async () => {
      if (!user) return;

      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('clerk_id', user.id)
          .maybeSingle();

        if (profile) {
          setProfileData({
            first_name: profile.first_name || user.firstName || '',
            last_name: profile.last_name || user.lastName || '',
            phone: profile.phone || user.primaryPhoneNumber?.phoneNumber || '',
            company_name: profile.company_name || '',
            brokerage_name: profile.brokerage_name || '',
            user_role: profile.user_role || '',
            primary_markets: profile.primary_markets || [],
            property_types: profile.property_types || [],
            budget_min: profile.budget_min?.toString() || '',
            budget_max: profile.budget_max?.toString() || '',
            bio: profile.bio || ''
          });
        } else {
          // Initialize with Clerk data if no profile exists
          setProfileData(prev => ({
            ...prev,
            first_name: user.firstName || '',
            last_name: user.lastName || '',
            phone: user.primaryPhoneNumber?.phoneNumber || ''
          }));
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    };

    loadProfileData();
  }, [user]);

  const handleProfileSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const profileUpdate = {
        clerk_id: user.id,
        email: user.primaryEmailAddress?.emailAddress,
        first_name: profileData.first_name,
        last_name: profileData.last_name,
        phone: profileData.phone,
        company_name: profileData.company_name,
        brokerage_name: profileData.brokerage_name,
        user_role: profileData.user_role,
        primary_markets: profileData.primary_markets,
        property_types: profileData.property_types,
        budget_min: profileData.budget_min ? parseInt(profileData.budget_min) : null,
        budget_max: profileData.budget_max ? parseInt(profileData.budget_max) : null,
        bio: profileData.bio,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(profileUpdate, { onConflict: 'clerk_id' });

      if (error) throw error;

      toast({
        title: "Profile Updated",
        description: "Your profile information has been saved successfully.",
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Save Error",
        description: "Unable to save profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePropertyTypeChange = (type: string, checked: boolean) => {
    setProfileData(prev => ({
      ...prev,
      property_types: checked 
        ? [...prev.property_types, type]
        : prev.property_types.filter(t => t !== type)
    }));
  };

  const handleUpgrade = async (planType: string) => {
    if (!user) return;
    
    setUpgrading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          userEmail: user.primaryEmailAddress?.emailAddress,
          userId: user.id,
          plan: planType,
        }
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast({
        title: "Upgrade Error",
        description: "Unable to start upgrade process. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUpgrading(false);
    }
  };

  const handleManageSubscription = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.functions.invoke('customer-portal', {
        body: {
          userEmail: user.primaryEmailAddress?.emailAddress,
          userId: user.id,
        }
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast({
        title: "Portal Error", 
        description: "Unable to open subscription management. Please try again.",
        variant: "destructive"
      });
    }
  };

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
      <div className="p-8 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-10">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent dark:from-gray-100 dark:to-gray-300"
          >
            Settings
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-600 dark:text-gray-400 mt-3"
          >
            Manage your account preferences and application settings
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8 bg-gray-50 dark:bg-gray-800 p-1 rounded-xl">
              <TabsTrigger value="profile" className="flex items-center justify-center space-x-2 py-3 rounded-lg transition-all">
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Profile</span>
              </TabsTrigger>
              <TabsTrigger value="billing" className="flex items-center justify-center space-x-2 py-3 rounded-lg transition-all">
                <CreditCard className="w-4 h-4" />
                <span className="hidden sm:inline">Billing</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center justify-center space-x-2 py-3 rounded-lg transition-all">
                <Bell className="w-4 h-4" />
                <span className="hidden sm:inline">Notifications</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center justify-center space-x-2 py-3 rounded-lg transition-all">
                <Shield className="w-4 h-4" />
                <span className="hidden sm:inline">Security</span>
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-8 mt-8">
              {/* Account Overview Card */}
              <Card className="dark:bg-gray-800 dark:border-gray-700 shadow-lg border-0 bg-white rounded-xl">
                <CardHeader className="pb-6 bg-gradient-to-r from-emerald-500 to-blue-600 text-white rounded-t-xl">
                  <CardTitle className="flex items-center space-x-3 text-xl">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <User className="w-6 h-6" />
                    </div>
                    <span>Account Overview</span>
                  </CardTitle>
                  <CardDescription className="text-white/90 text-base">Manage your profile and account settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  {/* Account Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Mail className="w-5 h-5 text-emerald-600" />
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                          <p className="font-medium truncate">{user?.primaryEmailAddress?.emailAddress}</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Phone className="w-5 h-5 text-emerald-600" />
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Phone</p>
                          <p className="font-medium">{profileData.phone || 'Not set'}</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
                          <p className="font-medium text-green-600">Active</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Star className="w-5 h-5 text-emerald-600" />
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Member since</p>
                          <p className="font-medium">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recently'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Profile Information Card */}
              <Card className="dark:bg-gray-800 dark:border-gray-700 shadow-lg border-0 bg-white rounded-xl">
                <CardHeader className="pb-6">
                  <CardTitle className="flex items-center space-x-3 text-xl">
                    <div className="p-2 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-lg">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <span>Profile Information</span>
                  </CardTitle>
                  <CardDescription className="text-base">Update your personal information and contact details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-sm font-medium">First Name</Label>
                      <Input 
                        id="firstName" 
                        value={profileData.first_name}
                        onChange={(e) => handleInputChange('first_name', e.target.value)}
                        className="h-11 rounded-lg border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-sm font-medium">Last Name</Label>
                      <Input 
                        id="lastName" 
                        value={profileData.last_name}
                        onChange={(e) => handleInputChange('last_name', e.target.value)}
                        className="h-11 rounded-lg border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input 
                        id="email" 
                        type="email"
                        value={user?.primaryEmailAddress?.emailAddress || ''} 
                        disabled
                        className="h-11 pl-10 rounded-lg bg-gray-50 border-gray-200"
                      />
                    </div>
                    <p className="text-xs text-gray-500">Email is managed through your account settings</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm font-medium">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input 
                          id="phone" 
                          type="tel" 
                          value={profileData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          className="h-11 pl-10 rounded-lg border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company" className="text-sm font-medium">Company</Label>
                      <div className="relative">
                        <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input 
                          id="company" 
                          value={profileData.company_name}
                          onChange={(e) => handleInputChange('company_name', e.target.value)}
                          placeholder="Your Company Name" 
                          className="h-11 pl-10 rounded-lg border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="brokerage" className="text-sm font-medium">Brokerage Name</Label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input 
                        id="brokerage" 
                        value={profileData.brokerage_name}
                        onChange={(e) => handleInputChange('brokerage_name', e.target.value)}
                        placeholder="Your Brokerage Name" 
                        className="h-11 pl-10 rounded-lg border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role" className="text-sm font-medium">Your Role</Label>
                    <select 
                      className="w-full h-11 px-3 border rounded-lg bg-background border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                      value={profileData.user_role}
                      onChange={(e) => handleInputChange('user_role', e.target.value)}
                    >
                      <option value="">Select your role</option>
                      <option value="buyer">Buyer/Investor</option>
                      <option value="wholesaler">Wholesaler</option>
                      <option value="real_estate_agent">Real Estate Agent</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="markets" className="text-sm font-medium">Primary Markets</Label>
                    <Textarea 
                      id="markets" 
                      value={profileData.primary_markets.join(', ')}
                      onChange={(e) => handleInputChange('primary_markets', e.target.value.split(',').map(m => m.trim()).filter(m => m))}
                      className="rounded-lg border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 resize-none" 
                      rows={3}
                      placeholder="e.g., Austin, Dallas, Houston..."
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Property Types of Interest</Label>
                    <div className="grid grid-cols-2 gap-4">
                      {['Single Family', 'Multi Family', 'Vacant Land', 'Commercial'].map((type) => (
                        <label key={type} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={profileData.property_types.includes(type)}
                            onChange={(e) => handlePropertyTypeChange(type, e.target.checked)}
                            className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" 
                          />
                          <span className="text-sm font-medium">{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="budgetMin" className="text-sm font-medium">Min Budget</Label>
                      <Input 
                        id="budgetMin" 
                        type="number" 
                        value={profileData.budget_min}
                        onChange={(e) => handleInputChange('budget_min', e.target.value)}
                        placeholder="50000" 
                        className="h-11 rounded-lg border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="budgetMax" className="text-sm font-medium">Max Budget</Label>
                      <Input 
                        id="budgetMax" 
                        type="number" 
                        value={profileData.budget_max}
                        onChange={(e) => handleInputChange('budget_max', e.target.value)}
                        placeholder="500000" 
                        className="h-11 rounded-lg border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio" className="text-sm font-medium">Bio</Label>
                    <Textarea 
                      id="bio" 
                      value={profileData.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      className="rounded-lg border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 resize-none" 
                      rows={4}
                      placeholder="Tell us about yourself and your investment focus..."
                    />
                  </div>

                  <div className="pt-4">
                    <Button 
                      onClick={handleProfileSave}
                      disabled={saving}
                      className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-8 py-3 rounded-lg"
                    >
                      {saving ? 'Saving...' : 'Save Profile'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

            <Card className="dark:bg-gray-800 dark:border-gray-700 shadow-lg border-0 bg-white rounded-xl">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center space-x-3 text-xl">
                  <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg">
                    <Moon className="w-5 h-5 text-white" />
                  </div>
                  <span>Appearance</span>
                </CardTitle>
                <CardDescription className="text-base">Customize your app appearance</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg">
                      {isDark ? <Moon className="w-4 h-4 text-white" /> : <Sun className="w-4 h-4 text-white" />}
                    </div>
                    <div>
                      <Label htmlFor="darkMode" className="text-sm font-medium cursor-pointer">Dark Mode</Label>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Toggle between light and dark themes</p>
                    </div>
                  </div>
                  <Switch 
                    id="darkMode" 
                    checked={isDark}
                    onCheckedChange={toggleTheme}
                    className="data-[state=checked]:bg-emerald-600"
                  />
                </div>
              </CardContent>
            </Card>
            </TabsContent>
            {/* Account Management Tab */}
            <TabsContent value="account" className="space-y-8 mt-8">
              <Card className="dark:bg-gray-800 dark:border-gray-700 shadow-lg border-0 bg-white rounded-xl">
                <CardHeader className="pb-6">
                  <CardTitle className="flex items-center space-x-3 text-xl">
                    <div className="p-2 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg">
                      <SettingsIcon className="w-5 h-5 text-white" />
                    </div>
                    <span>Account Management</span>
                  </CardTitle>
                  <CardDescription className="text-base">
                    Manage your account settings, change password, and update security preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                    <UserProfile
                      appearance={{
                        elements: {
                          card: "shadow-none border-0",
                          navbar: "hidden",
                          header: "hidden",
                          profileSectionPrimaryButton: "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700",
                          formButtonPrimary: "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700",
                          page: "p-6"
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
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing" className="space-y-8 mt-8">
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
                            {getPlanDisplayName()}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {getPlanDescription()}
                          </p>
                        </div>
                        <Badge variant={subscribed ? "default" : "secondary"}>
                          {subscribed ? "Active" : "Free"}
                        </Badge>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-2">
                        {!subscribed ? (
                          <>
                            <Button 
                              onClick={() => handleUpgrade('pro')}
                              disabled={upgrading}
                              className="bg-primary hover:bg-primary/90 text-white flex-1"
                            >
                              {upgrading ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              ) : (
                                <ArrowRight className="mr-2" size={14} />
                              )}
                              Upgrade to Core Plan
                            </Button>
                            <Button 
                              onClick={() => handleUpgrade('agency')}
                              disabled={upgrading}
                              variant="outline"
                              className="flex-1"
                            >
                              {upgrading ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                              ) : (
                                <Users className="mr-2" size={14} />
                              )}
                              Get Agency Plan
                            </Button>
                          </>
                        ) : (
                          <div className="flex flex-col sm:flex-row gap-2 w-full">
                            <Button 
                              onClick={handleManageSubscription}
                              variant="outline" 
                              className="flex-1"
                            >
                              <ExternalLink className="mr-2" size={14} />
                              Manage Subscription
                            </Button>
                            {getCurrentPlan() === 'core' && (
                              <Button 
                                onClick={() => handleUpgrade('agency')}
                                disabled={upgrading}
                                className="bg-purple-600 hover:bg-purple-700 text-white flex-1"
                              >
                                {upgrading ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                ) : (
                                  <Users className="mr-2" size={14} />
                                )}
                                Upgrade to Agency
                              </Button>
                            )}
                          </div>
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
        </motion.div>
      </div>
      
      <TokenPricingModal
        open={tokenModalOpen}
        onOpenChange={setTokenModalOpen}
      />
    </Layout>
  );
};

export default Settings;
