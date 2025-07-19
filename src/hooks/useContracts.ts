import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Contract {
  id: string;
  title: string;
  template_type: string;
  status: string;
  buyer_name?: string;
  buyer_email?: string;
  seller_name?: string;
  seller_email?: string;
  purchase_price?: number;
  earnest_money?: number;
  property_address: string;
  closing_date?: string;
  special_terms?: string;
  contract_content?: string;
  created_at: string;
  updated_at: string;
  deal_id?: string;
  owner_id: string;
}

export const useContracts = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchContracts = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('contracts')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setContracts(data || []);
    } catch (err: any) {
      console.error('Error fetching contracts:', err);
      setError(err.message);
      toast({
        title: "Error",
        description: "Failed to load contracts. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createContract = async (contractData: Omit<Contract, 'id' | 'created_at' | 'updated_at' | 'owner_id'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('contracts')
        .insert({
          ...contractData,
          owner_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      setContracts(prev => [data, ...prev]);
      return data;
    } catch (err: any) {
      console.error('Error creating contract:', err);
      toast({
        title: "Error",
        description: "Failed to create contract. Please try again.",
        variant: "destructive"
      });
      throw err;
    }
  };

  const updateContract = async (id: string, updates: Partial<Contract>) => {
    try {
      const { data, error } = await supabase
        .from('contracts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setContracts(prev => 
        prev.map(contract => 
          contract.id === id ? { ...contract, ...data } : contract
        )
      );

      return data;
    } catch (err: any) {
      console.error('Error updating contract:', err);
      toast({
        title: "Error",
        description: "Failed to update contract. Please try again.",
        variant: "destructive"
      });
      throw err;
    }
  };

  const deleteContract = async (id: string) => {
    try {
      const { error } = await supabase
        .from('contracts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setContracts(prev => prev.filter(contract => contract.id !== id));
      
      toast({
        title: "Success",
        description: "Contract deleted successfully.",
      });
    } catch (err: any) {
      console.error('Error deleting contract:', err);
      toast({
        title: "Error",
        description: "Failed to delete contract. Please try again.",
        variant: "destructive"
      });
      throw err;
    }
  };

  useEffect(() => {
    fetchContracts();
  }, []);

  // Subscribe to real-time updates
  useEffect(() => {
    const channel = supabase
      .channel('contracts_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'contracts' 
        }, 
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setContracts(prev => [payload.new as Contract, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setContracts(prev => 
              prev.map(contract => 
                contract.id === payload.new.id ? payload.new as Contract : contract
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setContracts(prev => 
              prev.filter(contract => contract.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    contracts,
    loading,
    error,
    createContract,
    updateContract,
    deleteContract,
    refetch: fetchContracts
  };
};