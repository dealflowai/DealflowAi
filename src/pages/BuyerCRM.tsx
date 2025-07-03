import React, { useState } from 'react';
import Layout from '@/components/Layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Filter, MoreHorizontal, Phone, Mail, MapPin, Loader2, Calendar, Target, DollarSign, Building } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@clerk/clerk-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import AddBuyerDialog from '@/components/BuyerCRM/AddBuyerDialog';

const BuyerCRM = () => {
  const { user } = useUser();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedPriority, setSelectedPriority] = useState('All');
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
      buyer.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      buyer.state?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      buyer.markets?.some(market => market.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = selectedStatus === 'All' || buyer.status === selectedStatus.toLowerCase();
    const matchesPriority = selectedPriority === 'All' || buyer.priority === selectedPriority;
    
    return matchesSearch && matchesStatus && matchesPriority;
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

  const getPriorityColor = (priority: string) => {
    switch (priority?.toUpperCase()) {
      case 'VERY HIGH':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'LOW':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
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

        {/* Enhanced Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search buyers by name, email, location, or market..."
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
                  <option value="Not contacted">Not Contacted</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Qualified">Qualified</option>
                  <option value="Deal pending">Deal Pending</option>
                </select>

                <select 
                  value={selectedPriority} 
                  onChange={(e) => setSelectedPriority(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="All">All Priority</option>
                  <option value="VERY HIGH">Very High</option>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
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
                        {buyer.priority && (
                          <Badge className={getPriorityColor(buyer.priority)}>
                            {buyer.priority}
                          </Badge>
                        )}
                        {buyer.land_buyer && (
                          <Badge variant="outline" className="text-xs">
                            Land Buyer
                          </Badge>
                        )}
                      </div>
                    </div>
                    <button className="p-2 hover:bg-gray-100 rounded-lg">
                      <MoreHorizontal className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  {/* Contact Information */}
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

                  {/* Location */}
                  {(buyer.city || buyer.state || buyer.markets) && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>
                        {buyer.city && buyer.state ? `${buyer.city}, ${buyer.state}` : 
                         buyer.city || buyer.state || ''}
                        {buyer.markets && buyer.markets.length > 0 && (
                          <span className="text-gray-500"> • {buyer.markets.join(', ')}</span>
                        )}
                      </span>
                    </div>
                  )}

                  {/* Budget Range */}
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <DollarSign className="w-4 h-4" />
                    <span>{formatBudgetRange(buyer.budget_min, buyer.budget_max)}</span>
                  </div>

                  {/* Asset Types */}
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

                  {/* Property Types */}
                  {buyer.property_type_interest && buyer.property_type_interest.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Property Types:</p>
                      <div className="flex flex-wrap gap-1">
                        {buyer.property_type_interest.map((type, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {type}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Acquisition Timeline */}
                  {buyer.acquisition_timeline && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{buyer.acquisition_timeline}</span>
                    </div>
                  )}

                  {/* Financing Type */}
                  {buyer.financing_type && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Building className="w-4 h-4" />
                      <span>{buyer.financing_type}</span>
                    </div>
                  )}

                  {/* Investment Criteria */}
                  {buyer.investment_criteria && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Investment Criteria:</p>
                      <p className="text-sm text-gray-600 line-clamp-2">{buyer.investment_criteria}</p>
                    </div>
                  )}

                  {/* Tags */}
                  {buyer.tags && buyer.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {buyer.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
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
