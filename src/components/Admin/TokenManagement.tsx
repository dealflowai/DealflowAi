
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
  Minus, 
  Settings,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';

interface TokenLimitFormData {
  user_id: string;
  daily_limit: number;
  monthly_limit: number;
}

const TokenManagement = () => {
  const [isSetLimitDialogOpen, setIsSetLimitDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const form = useForm<TokenLimitFormData>();

  // Fetch token usage data
  const { data: tokenData, isLoading } = useQuery({
    queryKey: ['token-usage'],
    queryFn: async () => {
      // This would be replaced with actual token usage data from your system
      // For now, using mock data based on profiles
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .limit(20);
      
      if (error) throw error;
      
      // Mock token usage data
      return profiles?.map(profile => ({
        ...profile,
        daily_tokens_used: Math.floor(Math.random() * 500),
        daily_token_limit: 1000,
        monthly_tokens_used: Math.floor(Math.random() * 15000),
        monthly_token_limit: 25000,
        last_usage: new Date(Date.now() - Math.random() * 86400000 * 7)
      })) || [];
    },
  });

  // Add tokens mutation
  const addTokensMutation = useMutation({
    mutationFn: async ({ userId, amount }: { userId: string, amount: number }) => {
      // This would integrate with your token system
      // For demo purposes, we'll just show a success message
      console.log(`Adding ${amount} tokens to user ${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['token-usage'] });
      toast({ title: 'Tokens added successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error adding tokens', description: error.message, variant: 'destructive' });
    }
  });

  // Set token limits mutation
  const setLimitsMutation = useMutation({
    mutationFn: async (data: TokenLimitFormData) => {
      // This would integrate with your token limit system
      console.log('Setting token limits:', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['token-usage'] });
      toast({ title: 'Token limits updated successfully' });
      setIsSetLimitDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({ title: 'Error setting limits', description: error.message, variant: 'destructive' });
    }
  });

  const handleAddTokens = (userId: string, amount: number) => {
    addTokensMutation.mutate({ userId, amount });
  };

  const getUsageColor = (used: number, limit: number) => {
    const percentage = (used / limit) * 100;
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getUsageStatus = (used: number, limit: number) => {
    const percentage = (used / limit) * 100;
    if (percentage >= 90) return { status: 'Critical', variant: 'destructive' as const };
    if (percentage >= 70) return { status: 'Warning', variant: 'secondary' as const };
    return { status: 'Good', variant: 'default' as const };
  };

  return (
    <div className="space-y-6">
      {/* Token Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Zap className="h-4 w-4 mr-2 text-blue-600" />
              Total Tokens Used Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {tokenData?.reduce((sum, user) => sum + user.daily_tokens_used, 0).toLocaleString() || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <TrendingUp className="h-4 w-4 mr-2 text-green-600" />
              Monthly Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {tokenData?.reduce((sum, user) => sum + user.monthly_tokens_used, 0).toLocaleString() || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2 text-yellow-600" />
              High Usage Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {tokenData?.filter(user => (user.daily_tokens_used / user.daily_token_limit) > 0.8).length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Settings className="h-4 w-4 mr-2 text-purple-600" />
              Active Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {tokenData?.filter(user => user.daily_tokens_used > 0).length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Token Management Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Token Usage & Management</CardTitle>
            <Dialog open={isSetLimitDialogOpen} onOpenChange={setIsSetLimitDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                  <Settings className="w-4 h-4 mr-2" />
                  Set Limits
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Set Token Limits</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit((data) => setLimitsMutation.mutate(data))} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="user_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>User ID</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter user ID" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="daily_limit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Daily Limit</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" placeholder="1000" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="monthly_limit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Monthly Limit</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" placeholder="25000" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex gap-2 pt-4">
                      <Button type="submit" disabled={setLimitsMutation.isPending}>
                        {setLimitsMutation.isPending ? 'Setting...' : 'Set Limits'}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setIsSetLimitDialogOpen(false)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Daily Usage</TableHead>
                    <TableHead>Monthly Usage</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Activity</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tokenData?.map((user) => {
                    const dailyUsage = getUsageStatus(user.daily_tokens_used, user.daily_token_limit);
                    const monthlyUsage = getUsageStatus(user.monthly_tokens_used, user.monthly_token_limit);
                    
                    return (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          <div>
                            <div>{user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : user.email?.split('@')[0]}</div>
                            <div className="text-xs text-gray-500">{user.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className={getUsageColor(user.daily_tokens_used, user.daily_token_limit)}>
                                {user.daily_tokens_used.toLocaleString()} / {user.daily_token_limit.toLocaleString()}
                              </span>
                              <span className="text-gray-500">
                                {Math.round((user.daily_tokens_used / user.daily_token_limit) * 100)}%
                              </span>
                            </div>
                            <Progress 
                              value={(user.daily_tokens_used / user.daily_token_limit) * 100} 
                              className="h-2"
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className={getUsageColor(user.monthly_tokens_used, user.monthly_token_limit)}>
                                {user.monthly_tokens_used.toLocaleString()} / {user.monthly_token_limit.toLocaleString()}
                              </span>
                              <span className="text-gray-500">
                                {Math.round((user.monthly_tokens_used / user.monthly_token_limit) * 100)}%
                              </span>
                            </div>
                            <Progress 
                              value={(user.monthly_tokens_used / user.monthly_token_limit) * 100} 
                              className="h-2"
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={dailyUsage.variant}>
                            {dailyUsage.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-500">
                            {user.last_usage.toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleAddTokens(user.id, 100)}
                              title="Add 100 tokens"
                            >
                              <Plus className="h-3 w-3" />
                              100
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleAddTokens(user.id, 500)}
                              title="Add 500 tokens"
                            >
                              <Plus className="h-3 w-3" />
                              500
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
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
