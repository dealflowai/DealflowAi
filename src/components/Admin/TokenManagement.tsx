import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { toast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Zap, 
  Plus, 
  Gift,
  Search,
  TrendingUp,
  Users,
  AlertCircle,
  Loader2
} from 'lucide-react';

interface AddTokensFormData {
  email: string;
  tokens: number;
}

const TokenManagement = () => {
  const [isAddTokensDialogOpen, setIsAddTokensDialogOpen] = useState(false);
  const [searchEmail, setSearchEmail] = useState('');
  const queryClient = useQueryClient();
  const addTokensForm = useForm<AddTokensFormData>();

  // Fetch real user profiles with token data
  const { data: tokenData, isLoading } = useQuery({
    queryKey: ['admin-users-tokens'],
    queryFn: async () => {
      // Get all profiles
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (profileError) throw profileError;
      
      // Get token data for each user
      const usersWithTokens = await Promise.all(
        profiles?.map(async (profile) => {
          const { data: tokenData } = await supabase.rpc('get_user_tokens', {
            p_user_id: profile.id
          });
          
          return {
            ...profile,
            totalTokens: tokenData?.[0]?.total_tokens || 0,
            usedTokens: tokenData?.[0]?.used_tokens || 0,
            remainingTokens: tokenData?.[0]?.remaining_tokens || 0,
            // These properties are no longer returned by the function
          };
        }) || []
      );
      
      return usersWithTokens;
    },
  });

  // Add tokens mutation that actually works
  const addTokensMutation = useMutation({
    mutationFn: async ({ userId, amount }: { userId: string, amount: number }) => {
      const { data, error } = await supabase.rpc('add_tokens', {
        p_user_id: userId,
        p_tokens: amount
      });
      
      if (error) throw error;
      if (!data) throw new Error('Failed to add tokens');
      
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users-tokens'] });
      toast({ 
        title: 'Tokens Added Successfully!', 
        description: `Added ${variables.amount} tokens to user account.`
      });
    },
    onError: (error) => {
      toast({ 
        title: 'Error adding tokens', 
        description: error.message, 
        variant: 'destructive' 
      });
    }
  });

  // Add tokens by email mutation
  const addTokensByEmailMutation = useMutation({
    mutationFn: async ({ email, tokens }: { email: string, tokens: number }) => {
      // First find the profile by email
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();
      
      if (profileError) throw new Error(`User with email ${email} not found`);
      if (!profile) throw new Error(`User with email ${email} not found`);
      
      // Then add tokens
      const { data, error } = await supabase.rpc('add_tokens', {
        p_user_id: profile.id,
        p_tokens: tokens
      });
      
      if (error) throw error;
      if (!data) throw new Error('Failed to add tokens');
      
      return { data, email, tokens };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users-tokens'] });
      toast({ 
        title: 'Tokens Added Successfully!', 
        description: `Added ${result.tokens} tokens to ${result.email}`
      });
      setIsAddTokensDialogOpen(false);
      addTokensForm.reset();
    },
    onError: (error) => {
      toast({ 
        title: 'Error adding tokens', 
        description: error.message, 
        variant: 'destructive' 
      });
    }
  });

  const handleAddTokens = (userId: string, amount: number) => {
    addTokensMutation.mutate({ userId, amount });
  };

  const getTokenStatusColor = (remaining: number) => {
    if (remaining === 0) return 'text-red-600';
    if (remaining < 10) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getTokenStatusBadge = (remaining: number) => {
    if (remaining === 0) return { status: 'Empty', variant: 'destructive' as const };
    if (remaining < 10) return { status: 'Low', variant: 'secondary' as const };
    return { status: 'Good', variant: 'default' as const };
  };

  // Filter users based on search
  const filteredUsers = tokenData?.filter(user => 
    searchEmail === '' || 
    user.email?.toLowerCase().includes(searchEmail.toLowerCase()) ||
    `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchEmail.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Token Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Users className="h-4 w-4 mr-2 text-blue-600" />
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {tokenData?.length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Zap className="h-4 w-4 mr-2 text-green-600" />
              Total Tokens Distributed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {tokenData?.reduce((sum, user) => sum + user.totalTokens, 0).toLocaleString() || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <TrendingUp className="h-4 w-4 mr-2 text-purple-600" />
              Tokens Remaining
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {tokenData?.reduce((sum, user) => sum + user.remainingTokens, 0).toLocaleString() || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <AlertCircle className="h-4 w-4 mr-2 text-yellow-600" />
              Low Token Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {tokenData?.filter(user => user.remainingTokens < 10).length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Token Management Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="flex items-center">
              <Gift className="w-5 h-5 mr-2 text-blue-600" />
              Token Management
            </CardTitle>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by email or name..."
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
              
              {/* Add Tokens by Email Dialog */}
              <Dialog open={isAddTokensDialogOpen} onOpenChange={setIsAddTokensDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-green-600 to-blue-600">
                    <Gift className="w-4 h-4 mr-2" />
                    Add Tokens
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Tokens to User</DialogTitle>
                  </DialogHeader>
                  <Form {...addTokensForm}>
                    <form onSubmit={addTokensForm.handleSubmit((data) => addTokensByEmailMutation.mutate(data))} className="space-y-4">
                      <FormField
                        control={addTokensForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>User Email</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="user@example.com" type="email" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={addTokensForm.control}
                        name="tokens"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Number of Tokens</FormLabel>
                            <FormControl>
                              <Input {...field} type="number" placeholder="100" min="1" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="flex gap-2 pt-4">
                        <Button type="submit" disabled={addTokensByEmailMutation.isPending}>
                          {addTokensByEmailMutation.isPending ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Adding...
                            </>
                          ) : (
                            'Add Tokens'
                          )}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => setIsAddTokensDialogOpen(false)}>
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Loading users...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Total Tokens</TableHead>
                      <TableHead>Used Tokens</TableHead>
                      <TableHead>Remaining</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Quick Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                <TableBody>
                  {filteredUsers?.map((user) => {
                    const status = getTokenStatusBadge(user.remainingTokens);
                    
                    return (
                      <TableRow key={user.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">
                          <div>
                            <div className="font-semibold">
                              {user.first_name && user.last_name 
                                ? `${user.first_name} ${user.last_name}` 
                                : user.email?.split('@')[0] || 'Unknown User'}
                            </div>
                            <div className="text-xs text-gray-500">{user.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-semibold text-blue-600">
                            {user.totalTokens.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-500">Monthly + Purchased</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-gray-600">
                            {user.usedTokens.toLocaleString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className={`font-semibold ${getTokenStatusColor(user.remainingTokens)}`}>
                            {user.remainingTokens.toLocaleString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={status.variant}>
                            {status.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleAddTokens(user.id, 25)}
                              disabled={addTokensMutation.isPending}
                              title="Add 25 tokens"
                              className="text-xs"
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              +25
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleAddTokens(user.id, 100)}
                              disabled={addTokensMutation.isPending}
                              title="Add 100 tokens"
                              className="text-xs"
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              +100
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleAddTokens(user.id, 500)}
                              disabled={addTokensMutation.isPending}
                              title="Add 500 tokens"
                              className="text-xs"
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              +500
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {filteredUsers?.length === 0 && (
                     <TableRow>
                       <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                         {searchEmail ? 'No users found matching your search.' : 'No users found.'}
                       </TableCell>
                     </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TokenManagement;