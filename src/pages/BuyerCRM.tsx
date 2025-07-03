
import React, { useState } from 'react';
import Layout from '@/components/Layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Filter, MoreHorizontal, Phone, Mail, MapPin, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@clerk/clerk-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import AddBuyerDialog from '@/components/BuyerCRM/AddBuyerDialog';

const BuyerCRM = () => {
  const { user } = useUser();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [showAddDialog, setShowAddDialog] = useState(false);

  const { data: buyers = [], isLoading, refetch } = useQuery({
    queryKey: ['buyers', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('buyers')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching buyers:', error);
        return [];
      }
      
      return data;
    },
    enabled: !!user?.id,
  });

  const filteredBuyers = buyers.filter(buyer => {
    const matchesSearch = !searchTerm || 
      buyer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      buyer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      buyer.markets?.some(market => market.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = selectedStatus === 'All' || buyer.status === selectedStatus.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'warm':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cold':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'new':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatBudgetRange = (min: number | null, max: number | null) => {
    if (!min && !max) return 'Budget not specified';
    if (!min) return `Up to $${max?.toLocaleString()}`;
    if (!max) return `From $${min?.toLocaleString()}`;
    return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
  };

  const getTimeAgo = (dateString: string | null) => {
    if (!dateString) return 'Unknown';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="p-6 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Buyer CRM</h1>
            <p className="text-gray-600 mt-1">Manage your qualified cash buyers and their preferences</p>
          </div>
          <Button 
            className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
            onClick={() => setShowAddDialog(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Buyer
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search buyers by name, email, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <select 
                  value={selectedStatus} 
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="All">All Status</option>
                  <option value="New">New</option>
                  <option value="Active">Active</option>
                  <option value="Warm">Warm</option>
                  <option value="Cold">Cold</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Buyers Grid */}
        {filteredBuyers.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-gray-500 text-lg mb-4">
                {buyers.length === 0 ? 'No buyers found. Add your first buyer to get started!' : 'No buyers match your search criteria.'}
              </p>
              {buyers.length === 0 && (
                <Button onClick={() => setShowAddDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Buyer
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredBuyers.map((buyer) => (
              <Card key={buyer.id} className="hover:shadow-lg transition-all duration-200">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{buyer.name || 'Unnamed Buyer'}</h3>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge className={getStatusColor(buyer.status || 'new')}>
                          {buyer.status || 'new'}
                        </Badge>
                      </div>
                    </div>
                    <button className="p-2 hover:bg-gray-100 rounded-lg">
                      <MoreHorizontal className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  {buyer.email && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4" />
                      <span>{buyer.email}</span>
                    </div>
                  )}
                  
                  {buyer.phone && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span>{buyer.phone}</span>
                    </div>
                  )}
                  
                  {buyer.markets && buyer.markets.length > 0 && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{buyer.markets.join(', ')}</span>
                    </div>
                  )}

                  {buyer.asset_types && buyer.asset_types.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Asset Types:</p>
                      <div className="flex flex-wrap gap-1">
                        {buyer.asset_types.map((type, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {type}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <p className="text-sm font-medium text-gray-700">Budget Range:</p>
                    <p className="text-sm text-gray-600">{formatBudgetRange(buyer.budget_min, buyer.budget_max)}</p>
                  </div>
                </CardContent>

                <CardFooter className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <span className="text-xs text-gray-400">
                    Added: {getTimeAgo(buyer.created_at)}
                  </span>
                  <div className="flex space-x-2">
                    {buyer.phone && (
                      <Button variant="outline" size="sm">
                        <Phone className="w-3 h-3 mr-1" />
                        Call
                      </Button>
                    )}
                    {buyer.email && (
                      <Button variant="outline" size="sm">
                        <Mail className="w-3 h-3 mr-1" />
                        Email
                      </Button>
                    )}
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        <AddBuyerDialog 
          open={showAddDialog} 
          onOpenChange={setShowAddDialog}
          onBuyerAdded={() => {
            refetch();
            setShowAddDialog(false);
          }}
        />
      </div>
    </Layout>
  );
};

export default BuyerCRM;
