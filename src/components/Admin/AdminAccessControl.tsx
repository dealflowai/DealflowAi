
import React from 'react';
import { useUser } from '@clerk/clerk-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AdminAccessControlProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'super_admin';
}

const AdminAccessControl = ({ children, requiredRole = 'admin' }: AdminAccessControlProps) => {
  const { user, isLoaded } = useUser();
  console.log('Clerk ID from useUser():', user?.id);
  console.log('Supabase profile:', profile);


  // Check if user has admin role
  const { data: profile, isLoading: profileLoading, error, refetch } = useQuery({
    queryKey: ['admin-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      console.log('Checking profile for Clerk ID:', user.id);
      
      // First, try to get existing profile
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('role, first_name, last_name, email')
        .eq('clerk_id', user.id)
        .maybeSingle();
      
      if (fetchError) {
        console.error('Error fetching profile:', fetchError);
      }
      
      // If profile doesn't exist, create it
      if (!existingProfile) {
        console.log('Profile not found, creating new profile...');
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({
            clerk_id: user.id,
            email: user.primaryEmailAddress?.emailAddress,
            first_name: user.firstName,
            last_name: user.lastName,
            role: 'super_admin' // Default to super_admin for testing
          })
          .select('role, first_name, last_name, email')
          .single();
        
        if (insertError) {
          console.error('Error creating profile:', insertError);
          return null;
        }
        
        console.log('Created new profile:', newProfile);
        return newProfile;
      }
      
      console.log('Found existing profile:', existingProfile);
      return existingProfile;
    },
    enabled: !!user?.id && isLoaded,
    retry: 1,
  });

  // Debug function to check current user state
  const debugAuth = async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase.rpc('debug_current_user');
      console.log('Debug auth result:', data, error);
    } catch (err) {
      console.error('Debug auth error:', err);
    }
  };

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

  // Show error state with retry option
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <CardTitle className="text-xl text-red-600">Authentication Error</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600 dark:text-gray-400">
              There was an error checking your permissions.
            </p>
            <div className="text-sm text-gray-500 font-mono bg-gray-100 p-2 rounded">
              {error.message}
            </div>
            <div className="space-y-2">
              <Button onClick={() => refetch()} className="w-full">
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry Authentication
              </Button>
              <Button variant="outline" onClick={debugAuth} className="w-full">
                Debug Auth State
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              Your Clerk ID: {user.id}
            </p>
          </CardContent>
        </Card>
      </div>
    );
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
              <div className="text-sm text-gray-500">
                <strong>Clerk ID:</strong> {user.id}
              </div>
            </div>
            <div className="space-y-2">
              <Button onClick={() => refetch()} className="w-full">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Profile
              </Button>
              <Button variant="outline" onClick={debugAuth} className="w-full">
                Debug Auth State
              </Button>
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
