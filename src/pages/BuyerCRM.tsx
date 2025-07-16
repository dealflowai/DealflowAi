
import React, { useState } from 'react';
import Layout from '@/components/Layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Filter, MoreHorizontal, Phone, Mail, MapPin, Loader2, Calendar, Target, DollarSign, Building, Globe, Bot, Sparkles, AlertCircle, Clock, Settings, Zap, Users, TrendingUp } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@clerk/clerk-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AddBuyerDialog from '@/components/BuyerCRM/AddBuyerDialog';
import BuyerScraper from '@/components/BuyerCRM/BuyerScraper';
import BuyerStats from '@/components/BuyerCRM/BuyerStats';
import AIOutreach from '@/components/BuyerCRM/AIOutreach';
import RealEstateLeadGenerator from '@/components/BuyerCRM/RealEstateLeadGenerator';


import { AutomatedScrapingManager } from '@/components/BuyerCRM/AutomatedScrapingManager';

const BuyerCRM = () => {
  const { user } = useUser();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedPriority, setSelectedPriority] = useState('All');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const { data: buyers = [], isLoading, refetch } = useQuery({
    queryKey: ['buyers', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      // Get the profile to get the proper UUID
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('clerk_id', user.id)
        .single();
      
      if (!profile?.id) return [];
      
      console.log('Fetching buyers for user:', profile.id);
      
      const { data, error } = await supabase
        .from('buyers')
        .select('*')
        .eq('owner_id', profile.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching buyers:', error);
        return [];
      }
      
      console.log('Fetched buyers:', data);
      return data;
    },
    enabled: !!user?.id,
  });

  // Check if no new buyers for >7 days
  const lastBuyerAdded = buyers.length > 0 ? new Date(buyers[0].created_at!) : null;
  const daysSinceLastBuyer = lastBuyerAdded ? 
    Math.floor((new Date().getTime() - lastBuyerAdded.getTime()) / (1000 * 60 * 60 * 24)) : 
    999;
  const showDiscoveryCTA = daysSinceLastBuyer > 7;

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
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800';
      case 'warm':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800';
      case 'cold':
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600';
      case 'new':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600';
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
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800';
      case 'LOW':
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600';
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
      <div className="p-3 sm:p-4 md:p-6 space-y-4 md:space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Buyer CRM</h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
              Manage and discover qualified cash buyers
            </p>
          </div>
          
          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setActiveTab('discovery')}
              className="border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400"
            >
              <Globe className="w-4 h-4 mr-2" />
              Discovery & Tools
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setActiveTab('ai-outreach')}
              className="border-purple-200 text-purple-700 hover:bg-purple-50 dark:border-purple-800 dark:text-purple-400"
            >
              <Bot className="w-4 h-4 mr-2" />
              AI Outreach
            </Button>
            <Button 
              size="sm"
              onClick={() => setShowAddDialog(true)}
              className="bg-primary hover:bg-primary/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Buyer
            </Button>
          </div>
        </div>

        {/* Discovery CTA */}
        {showDiscoveryCTA && (
          <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                <div className="flex-1">
                  <h3 className="font-medium text-orange-900 dark:text-orange-100">
                    It's been {daysSinceLastBuyer} days since your last buyer addition
                  </h3>
                  <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                    Run discovery to find fresh opportunities and grow your pipeline.
                  </p>
                </div>
                <Button 
                  size="sm" 
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                  onClick={() => setActiveTab('ai-outreach')}
                >
                  <Bot className="w-4 h-4 mr-2" />
                  Run Discovery
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Overview */}
        <BuyerStats buyers={buyers} />

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Buyer Database</TabsTrigger>
            <TabsTrigger value="discovery">Discovery & Tools</TabsTrigger>
            <TabsTrigger value="ai-outreach">AI Outreach</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Enhanced Filters & Actions */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search buyers by name, email, location..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <p className="text-sm text-muted-foreground mt-2">
                    Use the Discovery & Tools tab to access filters and lead generation features.
                  </p>
                </div>
              </CardContent>
            </Card>


            {/* Buyers List */}
            {filteredBuyers.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">
                    {buyers.length === 0 ? 'No buyers found. Start by discovering new leads.' : 'No buyers match your filters.'}
                  </p>
                  {buyers.length === 0 && (
                    <div className="flex justify-center gap-3">
                      <Button onClick={() => setShowAddDialog(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Buyer
                      </Button>
                      <Button variant="outline" onClick={() => setActiveTab('discovery')}>
                        <Globe className="w-4 h-4 mr-2" />
                        Discover Leads
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredBuyers.map((buyer) => (
                  <Card key={buyer.id} className="hover:shadow-lg transition-all duration-200 dark:bg-gray-800 dark:border-gray-700">
                    <CardHeader className="pb-3 sm:pb-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">{buyer.name || 'Unnamed Buyer'}</h3>
                          <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-2">
                            <Badge className={`${getStatusColor(buyer.status || 'new')} text-xs`}>
                              {buyer.status || 'new'}
                            </Badge>
                            {buyer.priority && (
                              <Badge className={`${getPriorityColor(buyer.priority)} text-xs`}>
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
                        <button className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg flex-shrink-0">
                          <MoreHorizontal className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-2 sm:space-y-3 px-3 sm:px-6 pb-3 sm:pb-6">
                      {buyer.email && (
                        <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                          <Mail className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                          <span className="truncate">{buyer.email}</span>
                        </div>
                      )}
                      
                      {buyer.phone && (
                        <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                          <Phone className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                          <span className="truncate">{buyer.phone}</span>
                        </div>
                      )}

                      {(buyer.city || buyer.state || buyer.markets) && (
                        <div className="flex items-start space-x-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                          <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 mt-0.5" />
                          <span className="line-clamp-2">
                            {buyer.city && buyer.state ? `${buyer.city}, ${buyer.state}` : 
                             buyer.city || buyer.state || ''}
                            {buyer.markets && buyer.markets.length > 0 && (
                              <span className="text-gray-500 dark:text-gray-500"> • {buyer.markets.join(', ')}</span>
                            )}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                        <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                        <span className="truncate">{formatBudgetRange(buyer.budget_min, buyer.budget_max)}</span>
                      </div>

                      {buyer.asset_types && buyer.asset_types.length > 0 && (
                        <div className="space-y-1 sm:space-y-2">
                          <p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Asset Types:</p>
                          <div className="flex flex-wrap gap-1">
                            {buyer.asset_types.slice(0, 3).map((type, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {type}
                              </Badge>
                            ))}
                            {buyer.asset_types.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{buyer.asset_types.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      {buyer.property_type_interest && buyer.property_type_interest.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Property Types:</p>
                          <div className="flex flex-wrap gap-1">
                            {buyer.property_type_interest.map((type, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {type}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {buyer.acquisition_timeline && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                          <Calendar className="w-4 h-4" />
                          <span>{buyer.acquisition_timeline}</span>
                        </div>
                      )}

                      {buyer.financing_type && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                          <Building className="w-4 h-4" />
                          <span>{buyer.financing_type}</span>
                        </div>
                      )}

                      {buyer.investment_criteria && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Investment Criteria:</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{buyer.investment_criteria}</p>
                        </div>
                      )}

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

                    <CardFooter className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
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
          </TabsContent>

          <TabsContent value="discovery" className="space-y-6">
            <RealEstateLeadGenerator 
              onLeadsFound={(leads) => {
                console.log('Found leads:', leads);
                refetch();
              }} 
            />
          </TabsContent>

          <TabsContent value="ai-outreach" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-purple-600" />
                  AI-Powered Outreach
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Generate personalized emails, SMS, and voice messages using AI
                </p>
              </CardHeader>
              <CardContent>
                <AIOutreach buyers={buyers} onRefresh={refetch} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

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
