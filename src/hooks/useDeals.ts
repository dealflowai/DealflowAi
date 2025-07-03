
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert } from '@/integrations/supabase/types';

type Deal = Tables<'deals'>;
type DealInsert = TablesInsert<'deals'>;

export const useDeals = () => {
  const { user } = useUser();
  const profileId = user?.id;

  return useQuery({
    queryKey: ['deals', profileId],
    queryFn: async () => {
      if (!profileId) throw new Error('No user profile found');

      // Get the user's profile first to get the UUID
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('clerk_id', profileId)
        .single();

      if (!profile) throw new Error('Profile not found');

      const { data, error } = await supabase
        .from('deals')
        .select('*')
        .eq('owner_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Deal[];
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

      // Get the user's profile first to get the UUID
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('clerk_id', profileId)
        .single();

      if (!profile) throw new Error('Profile not found');

      const { data, error } = await supabase
        .from('deals')
        .insert([{ ...dealData, owner_id: profile.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
    },
  });
};
