
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@clerk/clerk-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, Users, TrendingUp, Bot } from "lucide-react";
import BuyersList from "@/components/BuyerCRM/BuyersList";
import BuyerStats from "@/components/BuyerCRM/BuyerStats";
import BuyerScraper from "@/components/BuyerCRM/BuyerScraper";
import AIOutreach from "@/components/BuyerCRM/AIOutreach";
import AddBuyerDialog from "@/components/BuyerCRM/AddBuyerDialog";
import { toast } from "sonner";

const BuyerCRM = () => {
  const { user } = useUser();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Fetch buyers with proper error handling
  const { data: buyers = [], isLoading, error, refetch } = useQuery({
    queryKey: ['buyers', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        console.log('No user ID available');
        return [];
      }

      console.log('Fetching buyers for user:', user.id);
      
      const { data, error } = await supabase
        .from('buyers')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching buyers:', error);
        throw error;
      }

      console.log('Fetched buyers:', data);
      return data || [];
    },
    enabled: !!user?.id,
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
          <BuyersList 
            buyers={buyers} 
            isLoading={isLoading} 
            onRefresh={handleRefresh}
          />
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
          <BuyerScraper onBuyerAdded={handleRefresh} />
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
