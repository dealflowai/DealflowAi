
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
             <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Buyer Discovery System</h1>
             <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
               Discover, manage and contact qualified cash buyers
             </p>
           </div>
           
           {/* Quick Actions */}
           <div className="flex flex-wrap gap-2">
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

        {/* Main Discovery Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Discovery Control Panel */}
          <div className="lg:col-span-1">
            <Card className="h-fit">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Discovery Filters</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Configure search parameters
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Status</label>
                    <select 
                      value={selectedStatus} 
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="All">All Status</option>
                      <option value="New">New</option>
                      <option value="Active">Active</option>
                      <option value="Warm">Warm</option>
                      <option value="Cold">Cold</option>
                      <option value="Qualified">Qualified</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Priority</label>
                    <select 
                      value={selectedPriority} 
                      onChange={(e) => setSelectedPriority(e.target.value)}
                      className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="All">All Priority</option>
                      <option value="VERY HIGH">Very High</option>
                      <option value="HIGH">High</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="LOW">Low</option>
                    </select>
                  </div>

                  <div className="pt-3 border-t">
                    <label className="text-sm font-medium mb-2 block">Quick Filters</label>
                    <div className="space-y-2">
                      <Button 
                        variant={selectedStatus === "Qualified" && selectedPriority === "HIGH" ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          setSelectedStatus("Qualified");
                          setSelectedPriority("HIGH");
                        }}
                        className="w-full justify-start text-xs"
                      >
                        High Priority Qualified
                      </Button>
                      <Button 
                        variant={selectedStatus === "Warm" ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          setSelectedStatus("Warm");
                          setSelectedPriority("All");
                        }}
                        className="w-full justify-start text-xs"
                      >
                        Warm Prospects
                      </Button>
                      <Button 
                        variant={selectedStatus === "New" ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          setSelectedStatus("New");
                          setSelectedPriority("All");
                        }}
                        className="w-full justify-start text-xs"
                      >
                        New Leads
                      </Button>
                    </div>
                  </div>

                  {(selectedStatus !== 'All' || selectedPriority !== 'All') && (
                    <div className="pt-3 border-t">
                      <div className="text-xs font-medium text-muted-foreground mb-2">Active Filters</div>
                      <div className="space-y-1">
                        {selectedStatus !== 'All' && (
                          <div className="text-xs px-2 py-1 bg-muted rounded">Status: {selectedStatus}</div>
                        )}
                        {selectedPriority !== 'All' && (
                          <div className="text-xs px-2 py-1 bg-muted rounded">Priority: {selectedPriority}</div>
                        )}
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          setSelectedStatus("All");
                          setSelectedPriority("All");
                        }}
                        className="w-full mt-2 text-xs"
                      >
                        Clear Filters
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Discovery Results */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Platform Discovery</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Search across LinkedIn, Facebook, and PropWire platforms
                </p>
              </CardHeader>
              <CardContent>
                <RealEstateLeadGenerator 
                  onLeadsFound={(leads) => {
                    console.log('Found leads:', leads);
                    refetch();
                  }} 
                />
              </CardContent>
            </Card>

            {/* Search Results */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="text-lg">Search Results</span>
                  <Badge variant="outline">{filteredBuyers.length} buyers</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filteredBuyers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No buyers match your current filters
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredBuyers.slice(0, 10).map((buyer) => (
                      <div key={buyer.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium">{buyer.name || 'Unnamed Buyer'}</div>
                          <div className="text-sm text-muted-foreground">
                            {buyer.location_focus || buyer.city || 'No location specified'}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {formatBudgetRange(buyer.budget_min, buyer.budget_max)}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {buyer.status || 'New'}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {buyer.priority || 'MEDIUM'}
                          </Badge>
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
                        </div>
                      </div>
                    ))}
                    {filteredBuyers.length > 10 && (
                      <div className="text-center text-sm text-muted-foreground">
                        ... and {filteredBuyers.length - 10} more buyers
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* AI Outreach */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">AI-Powered Outreach</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Generate personalized emails, SMS, and voice messages
                </p>
              </CardHeader>
              <CardContent>
                <AIOutreach buyers={filteredBuyers} onRefresh={refetch} />
              </CardContent>
            </Card>
          </div>

          {/* AI Settings Panel */}
          <div className="lg:col-span-1">
            <Card className="h-fit">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">AI Configuration</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Automated discovery settings
                </p>
              </CardHeader>
              <CardContent>
                <AutomatedScrapingManager />
              </CardContent>
            </Card>

            {/* Analytics Summary */}
            <Card className="mt-6">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Total Buyers</span>
                    <span className="font-medium">{buyers.length}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Qualified</span>
                    <span className="font-medium">{buyers.filter(b => b.status === 'Qualified').length}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">High Priority</span>
                    <span className="font-medium">{buyers.filter(b => b.priority === 'HIGH' || b.priority === 'VERY HIGH').length}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">New This Week</span>
                    <span className="font-medium">{buyers.filter(b => b.created_at && new Date(b.created_at) > new Date(Date.now() - 7*24*60*60*1000)).length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

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
