
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@clerk/clerk-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Users, TrendingUp, Bot, Search } from "lucide-react";
import BuyersList from "@/components/BuyerCRM/BuyersList";
import BuyerStats from "@/components/BuyerCRM/BuyerStats";
import BuyerScraper from "@/components/BuyerCRM/BuyerScraper";
import AIOutreach from "@/components/BuyerCRM/AIOutreach";
import AddBuyerDialog from "@/components/BuyerCRM/AddBuyerDialog";
import { toast } from "sonner";

const BuyerCRM = () => {
  const { user } = useUser();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedPriority, setSelectedPriority] = useState("All");

  // First, get the user's profile to get their UUID
  const { data: userProfile } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        console.log('No user ID available for profile fetch');
        return null;
      }

      console.log('Fetching profile for Clerk user:', user.id);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('clerk_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      console.log('User profile found:', data);
      return data;
    },
    enabled: !!user?.id,
  });

  // Then fetch buyers using the profile UUID
  const { data: buyers = [], isLoading, error, refetch } = useQuery({
    queryKey: ['buyers', userProfile?.id],
    queryFn: async () => {
      if (!userProfile?.id) {
        console.log('No profile ID available for buyers fetch');
        return [];
      }

      console.log('Fetching buyers for profile ID:', userProfile.id);
      
      const { data, error } = await supabase
        .from('buyers')
        .select('*')
        .eq('owner_id', userProfile.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching buyers:', error);
        throw error;
      }

      console.log('Fetched buyers:', data);
      return data || [];
    },
    enabled: !!userProfile?.id,
  });

  // Filter buyers based on search and filters
  const filteredBuyers = buyers.filter(buyer => {
    const matchesSearch = !searchQuery || 
      buyer.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      buyer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      buyer.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      buyer.state?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      buyer.markets?.some(market => market.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = selectedStatus === 'All' || buyer.status === selectedStatus.toLowerCase();
    const matchesPriority = selectedPriority === 'All' || buyer.priority === selectedPriority;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleRefresh = () => {
    refetch();
    toast.success("Buyer data refreshed");
  };

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <h2 className="text-lg font-semibold text-red-600 mb-2">Error Loading Buyers</h2>
            <p className="text-gray-600 mb-4">
              {error instanceof Error ? error.message : 'An unexpected error occurred'}
            </p>
            <Button onClick={handleRefresh}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!userProfile && user?.id) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <h2 className="text-lg font-semibold text-blue-600 mb-2">Setting up your account...</h2>
            <p className="text-gray-600">Please wait while we initialize your profile.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Buyer CRM</h1>
          <p className="text-gray-600">Manage your real estate buyer relationships</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Buyer
        </Button>
      </div>

      {/* Stats Overview */}
      <BuyerStats buyers={buyers} />

      {/* Main Content Tabs */}
      <Tabs defaultValue="buyers" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="buyers" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Buyers</span>
          </TabsTrigger>
          <TabsTrigger value="ai-outreach" className="flex items-center space-x-2">
            <Bot className="h-4 w-4" />
            <span>AI Outreach</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4" />
            <span>Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="scraper" className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Find Buyers</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="buyers" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Buyer Management</CardTitle>
              <CardDescription>
                Search, filter, and manage your buyer relationships
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search and Filter Controls */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search buyers by name, email, location, or market..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Statuses</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="qualified">Qualified</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="warm">Warm</SelectItem>
                    <SelectItem value="cold">Cold</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Priorities</SelectItem>
                    <SelectItem value="VERY HIGH">Very High</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="LOW">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Buyers List */}
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-600 mt-2">Loading buyers...</p>
                </div>
              ) : (
                <BuyersList 
                  buyers={filteredBuyers}
                  searchQuery={searchQuery}
                  selectedStatus={selectedStatus}
                  selectedPriority={selectedPriority}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-outreach" className="mt-6">
          <AIOutreach 
            buyers={buyers} 
            onRefresh={handleRefresh}
          />
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Advanced Analytics</span>
              </CardTitle>
              <CardDescription>
                Detailed insights into your buyer relationships and outreach performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <TrendingUp className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Advanced Analytics Coming Soon</h3>
                <p className="text-gray-600">
                  Detailed performance metrics, ROI tracking, and predictive analytics will be available here.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scraper" className="mt-6">
          <BuyerScraper onBuyersImported={handleRefresh} />
        </TabsContent>
      </Tabs>

      {/* Add Buyer Dialog */}
      <AddBuyerDialog 
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onBuyerAdded={handleRefresh}
      />
    </div>
  );
};

export default BuyerCRM;
