
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert } from '@/integrations/supabase/types';

type Deal = Tables<'deals'>;
type DealInsert = TablesInsert<'deals'>;

export const useDeals = () => {
  const { user } = useUser();
  const profileId = user?.id;

  console.log('useDeals - profileId:', profileId, 'user:', user);

  return useQuery({
    queryKey: ['deals', profileId],
    queryFn: async () => {
      if (!profileId) {
        console.log('useDeals - No profileId, throwing error');
        throw new Error('No user profile found');
      }

      console.log('useDeals - Fetching profile for profileId:', profileId);

      // Get the user's profile first to get the UUID
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('clerk_id', profileId)
        .single();

      console.log('useDeals - Profile query result:', { profile, profileError });

      if (profileError || !profile) {
        console.log('useDeals - Profile not found, returning empty array');
        return []; // Return empty array instead of throwing error
      }

      console.log('useDeals - Fetching deals for profile id:', profile.id);

      const { data, error } = await supabase
        .from('deals')
        .select('*')
        .eq('owner_id', profile.id)
        .order('created_at', { ascending: false });

      console.log('useDeals - Deals query result:', { data, error });

      if (error) {
        console.error('useDeals - Error fetching deals:', error);
        throw error;
      }
      
      return (data as Deal[]) || [];
    },
    enabled: !!profileId,
  });
};

export const useCreateDeal = () => {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const profileId = user?.id;

  return useMutation({
    mutationFn: async (dealData: Omit<DealInsert, 'owner_id'>) => {
      if (!profileId) throw new Error('No user profile found');

      console.log('useCreateDeal - Creating deal for profileId:', profileId);

      // Get the user's profile first to get the UUID
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('clerk_id', profileId)
        .single();

      if (!profile) throw new Error('Profile not found');

      console.log('useCreateDeal - Creating deal with data:', dealData);

      const { data, error } = await supabase
        .from('deals')
        .insert([{ ...dealData, owner_id: profile.id }])
        .select()
        .single();

      if (error) {
        console.error('useCreateDeal - Error creating deal:', error);
        throw error;
      }
      
      console.log('useCreateDeal - Deal created successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
    },
  });
};
