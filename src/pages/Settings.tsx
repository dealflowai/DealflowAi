
import React from 'react';
import Layout from '@/components/Layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useTheme } from '@/contexts/ThemeContext';
import { useUser } from '@clerk/clerk-react';
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
  MapPin
} from 'lucide-react';

const Settings = () => {
  const { user } = useUser();
  const { isDark, toggleTheme } = useTheme();

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
                  <span>Billing</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p className="font-medium">Free Plan</p>
                  <p>5 deals analyzed this month</p>
                </div>
                <Button className="w-full bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800">
                  Upgrade to Pro
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
