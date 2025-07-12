
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Eye, Edit, Trash2 } from 'lucide-react';

interface AdminDataTablesProps {
  type: 'users' | 'deals' | 'tokens' | 'revenue';
}

const AdminDataTables = ({ type }: AdminDataTablesProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching users:', error);
        return [];
      }
      
      return data || [];
    },
    enabled: type === 'users',
  });

  const { data: deals, isLoading: dealsLoading } = useQuery({
    queryKey: ['admin-deals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deals')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching deals:', error);
        return [];
      }
      
      return data || [];
    },
    enabled: type === 'deals',
  });

  const renderUsersTable = () => {
    if (usersLoading) {
      return (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    const filteredUsers = users?.filter(user => {
      const matchesSearch = user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.last_name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || user.role === statusFilter;
      return matchesSearch && matchesStatus;
    }) || [];

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Plan</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredUsers.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">
                {user.first_name && user.last_name 
                  ? `${user.first_name} ${user.last_name}`
                  : user.email?.split('@')[0] || 'Unknown'
                }
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                {user.selected_plan ? (
                  <Badge variant="outline" className="text-blue-600 border-blue-200">
                     {user.selected_plan === 'core' ? 'Core Plan' :
                     user.selected_plan === 'starter' ? 'Starter' :
                     user.selected_plan === 'pro' ? 'Pro' :
                     user.selected_plan === 'agency' ? 'Agency Plan' :
                     user.selected_plan}
                  </Badge>
                ) : (
                  <span className="text-gray-500">No Plan</span>
                )}
              </TableCell>
              <TableCell>
                <Badge variant={user.role === 'admin' || user.role === 'super_admin' ? 'default' : 'secondary'}>
                  {user.role || 'user'}
                </Badge>
              </TableCell>
              <TableCell>
                {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="text-green-600 border-green-200">
                  Active
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  const renderDealsTable = () => {
    if (dealsLoading) {
      return (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    const filteredDeals = deals?.filter(deal => {
      const matchesSearch = deal.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           deal.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           deal.state?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || deal.status === statusFilter;
      return matchesSearch && matchesStatus;
    }) || [];

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Address</TableHead>
            <TableHead>City</TableHead>
            <TableHead>State</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Margin</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredDeals.map((deal) => (
            <TableRow key={deal.id}>
              <TableCell className="font-medium">{deal.address}</TableCell>
              <TableCell>{deal.city || 'Unknown'}</TableCell>
              <TableCell>{deal.state || 'Unknown'}</TableCell>
              <TableCell>
                {deal.list_price ? `$${deal.list_price.toLocaleString()}` : 'N/A'}
              </TableCell>
              <TableCell>
                {deal.margin ? `${deal.margin}%` : 'N/A'}
              </TableCell>
              <TableCell>
                <Badge variant={
                  deal.status === 'active' ? 'default' : 
                  deal.status === 'pending' ? 'secondary' : 'outline'
                }>
                  {deal.status || 'new'}
                </Badge>
              </TableCell>
              <TableCell>
                {deal.created_at ? new Date(deal.created_at).toLocaleDateString() : 'Unknown'}
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle>
            {type === 'users' ? 'Users Management' : 
             type === 'deals' ? 'Deals Management' : 
             type === 'tokens' ? 'Token Usage' : 'Revenue & Payments'}
          </CardTitle>
          
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full sm:w-64"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-32">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {type === 'users' ? (
                  <>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                  </>
                ) : (
                  <>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {type === 'users' && renderUsersTable()}
        {type === 'deals' && renderDealsTable()}
        {(type === 'tokens' || type === 'revenue') && (
          <div className="text-center py-8 text-gray-500">
            {type === 'tokens' ? 'Token usage data will be displayed here' : 'Revenue data will be displayed here'}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminDataTables;
