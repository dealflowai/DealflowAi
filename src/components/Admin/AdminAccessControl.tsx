
import React from 'react';
import { useUser } from '@clerk/clerk-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle, CheckCircle } from 'lucide-react';

interface AdminAccessControlProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'super_admin';
}

const AdminAccessControl = ({ children, requiredRole = 'admin' }: AdminAccessControlProps) => {
  const { user, isLoaded } = useUser();

  // Check if user has admin role
  const { data: profile, isLoading: profileLoading, error } = useQuery({
    queryKey: ['admin-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('role, first_name, last_name, email')
        .eq('clerk_id', user.id)
        .single();
      
      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }
      
      return data;
    },
    enabled: !!user?.id && isLoaded,
  });

  // Show loading while checking auth status
  if (!isLoaded || profileLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-8">
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <div className="text-center">
                <h3 className="text-lg font-semibold">Verifying Access</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Checking your administrative privileges...
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if user is signed in
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Check if profile exists and has required role
  if (!profile || !profile.role || !['admin', 'super_admin'].includes(profile.role)) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <CardTitle className="text-xl text-red-600">Access Denied</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600 dark:text-gray-400">
              You don't have the required permissions to access the admin dashboard.
            </p>
            <div className="space-y-2">
              <div className="text-sm text-gray-500">
                <strong>Your Role:</strong> {profile?.role || 'None'}
              </div>
              <div className="text-sm text-gray-500">
                <strong>Required:</strong> Admin or Super Admin
              </div>
            </div>
            <div className="pt-4">
              <Badge variant="destructive">
                <Shield className="w-3 h-3 mr-1" />
                Insufficient Privileges
              </Badge>
            </div>
            <p className="text-xs text-gray-500">
              Please contact your system administrator if you believe this is an error.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check specific role requirement
  if (requiredRole === 'super_admin' && profile.role !== 'super_admin') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-yellow-600" />
            </div>
            <CardTitle className="text-xl text-yellow-600">Super Admin Required</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600 dark:text-gray-400">
              This section requires Super Admin privileges.
            </p>
            <div className="space-y-2">
              <div className="text-sm text-gray-500">
                <strong>Your Role:</strong> {profile.role}
              </div>
              <div className="text-sm text-gray-500">
                <strong>Required:</strong> Super Admin
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success - render children with admin context
  return (
    <div className="admin-dashboard">
      {/* Admin Status Bar */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-medium">
              Admin Dashboard - Authenticated as {profile.first_name} {profile.last_name}
            </span>
          </div>
          <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
            <Shield className="w-3 h-3 mr-1" />
            {profile.role === 'super_admin' ? 'Super Admin' : 'Admin'}
          </Badge>
        </div>
      </div>
      
      {/* Admin Content */}
      {children}
    </div>
  );
};

export default AdminAccessControl;
