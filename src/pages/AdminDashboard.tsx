
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
  RefreshCw
} from 'lucide-react';
import AdminKPICards from '@/components/Admin/AdminKPICards';
import AdminCharts from '@/components/Admin/AdminCharts';
import AdminDataTables from '@/components/Admin/AdminDataTables';
import AdminActions from '@/components/Admin/AdminActions';
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
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Monitor and manage your dealflow.ai platform
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <Shield className="w-3 h-3 mr-1" />
              Admin Access
            </Badge>
            <Button variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Timeframe Filter */}
        <div className="flex space-x-2">
          {['7d', '30d', '90d'].map((period) => (
            <Button
              key={period}
              variant={timeframe === period ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeframe(period)}
            >
              {period === '7d' ? '7 Days' : period === '30d' ? '30 Days' : '90 Days'}
            </Button>
          ))}
        </div>

        {/* KPI Overview Cards */}
        <AdminKPICards timeframe={timeframe} />

        {/* Main Content Tabs */}
        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="deals">Deals</TabsTrigger>
            <TabsTrigger value="actions">Actions</TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="space-y-6">
            <AdminCharts timeframe={timeframe} />
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <AdminDataTables type="users" />
          </TabsContent>

          <TabsContent value="deals" className="space-y-6">
            <AdminDataTables type="deals" />
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
