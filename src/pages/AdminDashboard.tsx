
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@clerk/clerk-react';
import Layout from '@/components/Layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  Activity,
  Building2,
  Zap,
  ArrowUp,
  ArrowDown,
  Shield,
  Eye,
  RefreshCw,
  BarChart3,
  Settings,
  Server,
  Layers
} from 'lucide-react';
import AdminKPICards from '@/components/Admin/AdminKPICards';
import AdminCharts from '@/components/Admin/AdminCharts';
import AdminDataTables from '@/components/Admin/AdminDataTables';
import AdminActions from '@/components/Admin/AdminActions';
import SystemMonitoring from '@/components/Admin/SystemMonitoring';
import AdvancedAnalytics from '@/components/Admin/AdvancedAnalytics';
import BulkOperations from '@/components/Admin/BulkOperations';
import { Navigate } from 'react-router-dom';

const AdminDashboard = () => {
  const { user } = useUser();
  const [timeframe, setTimeframe] = useState('30d');

  // Check if user has admin role
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['admin-profile', user?.id],
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

  // Redirect if not admin
  if (!profileLoading && profile && !['admin', 'super_admin'].includes(profile.role)) {
    return <Navigate to="/" replace />;
  }

  // Show loading while checking permissions
  if (profileLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
        {/* Enhanced Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Advanced Admin Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Comprehensive platform management and analytics
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Badge variant="outline" className="bg-gradient-to-r from-green-50 to-green-100 text-green-700 border-green-200">
              <Shield className="w-3 h-3 mr-1" />
              Super Admin Access
            </Badge>
            <Button variant="outline" size="sm" className="hover:bg-blue-50">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Data
            </Button>
            <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600">
              <Eye className="w-4 h-4 mr-2" />
              Live View
            </Button>
          </div>
        </div>

        {/* Enhanced Timeframe Filter */}
        <div className="flex flex-wrap items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Time Period:</span>
          <div className="flex space-x-2">
            {[
              { key: '7d', label: '7 Days' },
              { key: '30d', label: '30 Days' },
              { key: '90d', label: '90 Days' },
              { key: '1y', label: '1 Year' }
            ].map((period) => (
              <Button
                key={period.key}
                variant={timeframe === period.key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeframe(period.key)}
                className={timeframe === period.key ? 'bg-gradient-to-r from-blue-600 to-purple-600' : ''}
              >
                {period.label}
              </Button>
            ))}
          </div>
        </div>

        {/* KPI Overview Cards */}
        <AdminKPICards timeframe={timeframe} />

        {/* Enhanced Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-7 h-auto p-1">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Users</span>
            </TabsTrigger>
            <TabsTrigger value="deals" className="flex items-center space-x-2">
              <Building2 className="w-4 h-4" />
              <span className="hidden sm:inline">Deals</span>
            </TabsTrigger>
            <TabsTrigger value="monitoring" className="flex items-center space-x-2">
              <Server className="w-4 h-4" />
              <span className="hidden sm:inline">System</span>
            </TabsTrigger>
            <TabsTrigger value="bulk" className="flex items-center space-x-2">
              <Layers className="w-4 h-4" />
              <span className="hidden sm:inline">Bulk Ops</span>
            </TabsTrigger>
            <TabsTrigger value="actions" className="flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Actions</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <AdminCharts timeframe={timeframe} />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <AdvancedAnalytics timeframe={timeframe} />
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <AdminDataTables type="users" />
          </TabsContent>

          <TabsContent value="deals" className="space-y-6">
            <AdminDataTables type="deals" />
          </TabsContent>

          <TabsContent value="monitoring" className="space-y-6">
            <SystemMonitoring />
          </TabsContent>

          <TabsContent value="bulk" className="space-y-6">
            <BulkOperations />
          </TabsContent>

          <TabsContent value="actions" className="space-y-6">
            <AdminActions />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
