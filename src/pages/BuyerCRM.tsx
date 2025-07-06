
import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@clerk/clerk-react';
import Layout from '@/components/Layout/Layout';
import BuyersList from '@/components/BuyerCRM/BuyersList';
import AddBuyerDialog from '@/components/BuyerCRM/AddBuyerDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from "@/components/ui/card";
import { UserPlus, Bot, Users, Building, FileText, BarChart3, Settings, ShoppingCart, Grip, List, Columns } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SkeletonCard } from "@/components/Performance/SkeletonCard";

interface Buyer {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  state: string | null;
  markets: string[] | null;
  asset_types: string[] | null;
  property_type_interest: string[] | null;
  budget_min: number | null;
  budget_max: number | null;
  priority: string | null;
  status: string | null;
  financing_type: string | null;
  investment_criteria: string | null;
  created_at: string | null;
  updated_at: string | null;
  last_contacted: string | null;
  notes: string | null;
  tags: string[] | null;
}

const BuyerCRM = () => {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedPriority, setSelectedPriority] = useState('All');

  const { data: buyers, isLoading, isError } = useQuery({
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
        throw error;
      }

      return data || [];
    },
  });

  const { mutate: addBuyer, isPending: isAdding } = useMutation({
    mutationFn: async (newBuyer: Omit<Buyer, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('buyers')
        .insert([
          {
            ...newBuyer,
            owner_id: user?.id,
          },
        ])
        .select();

      if (error) {
        console.error('Error adding buyer:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buyers', user?.id] });
      setShowAddDialog(false);
    },
    onError: (error) => {
      console.error('Error adding buyer:', error);
    },
  });

  const handleAddBuyer = async (newBuyer: Omit<Buyer, 'id' | 'created_at' | 'updated_at'>) => {
    await addBuyer(newBuyer);
  };

  const statuses = useMemo(() => {
    if (!buyers) return ['All'];
    const uniqueStatuses = ['All', ...new Set(buyers.map(buyer => buyer.status).filter(Boolean))];
    return uniqueStatuses;
  }, [buyers]);

  const priorities = useMemo(() => {
    if (!buyers) return ['All'];
    const uniquePriorities = ['All', ...new Set(buyers.map(buyer => buyer.priority).filter(Boolean))];
    return uniquePriorities;
  }, [buyers]);

  if (isLoading) {
    return (
      <Layout>
        <div className="p-6 space-y-6">
          <SkeletonCard />
        </div>
      </Layout>
    );
  }

  if (isError) {
    return (
      <Layout>
        <div className="p-6 space-y-6">
          <Card>
            <CardContent className="p-12 text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Error</h3>
              <p className="text-gray-600">Failed to load buyers. Please try again.</p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header and Stats */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Buyer CRM</h1>
            <p className="text-gray-600 mt-1">Manage and engage with your investor network</p>
          </div>
          <div className="flex space-x-4">
            <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-blue-500" />
                <span className="text-xl font-bold text-gray-900">{buyers?.length}</span>
                <span className="text-sm text-gray-500">Buyers</span>
              </div>
            </div>
            <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
              <div className="flex items-center space-x-2">
                <Building className="w-4 h-4 text-green-500" />
                <span className="text-xl font-bold text-gray-900">12</span>
                <span className="text-sm text-gray-500">Active Deals</span>
              </div>
            </div>
            <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-yellow-500" />
                <span className="text-xl font-bold text-gray-900">$5M</span>
                <span className="text-sm text-gray-500">Potential Volume</span>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <Input
              type="search"
              placeholder="Search buyers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="md:flex md:items-center md:space-x-4">
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full md:w-auto">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {statuses.map(status => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedPriority} onValueChange={setSelectedPriority}>
              <SelectTrigger className="w-full md:w-auto mt-2 md:mt-0">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                {priorities.map(priority => (
                  <SelectItem key={priority} value={priority}>{priority}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Add AI Discovery button with test ID */}
        <div className="flex justify-between items-center">
          <div className="flex space-x-4">
            <Button
              onClick={() => setShowAddDialog(true)}
              className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add Buyer
            </Button>
            <Button
              variant="outline"
              data-testid="ai-discovery"
              onClick={() => console.log('AI Discovery clicked')}
            >
              <Bot className="w-4 h-4 mr-2" />
              AI Discovery
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            {/* View Toggle Buttons */}
          </div>
        </div>

        {/* Buyers List Display */}
        <BuyersList
          buyers={buyers}
          searchQuery={searchQuery}
          selectedStatus={selectedStatus}
          selectedPriority={selectedPriority}
        />
      </div>

      {/* Add Buyer Dialog */}
      <AddBuyerDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onBuyerAdded={() => {
          queryClient.invalidateQueries({ queryKey: ['buyers', user?.id] });
          setShowAddDialog(false);
        }}
      />
    </Layout>
  );
};

export default BuyerCRM;
