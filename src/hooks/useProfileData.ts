
import { useQuery } from '@tanstack/react-query';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '@/integrations/supabase/client';

export function useProfileData() {
  const { user, isLoaded } = useUser();

  return useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        console.log('No user ID available');
        return null;
      }

      console.log('Fetching profile for user:', user.id);

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('clerk_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        if (error.code === 'PGRST116') {
          // No profile found, return null instead of throwing
          return null;
        }
        throw error;
      }

      console.log('Profile data:', data);
      return data;
    },
    enabled: !!user?.id && isLoaded,
  });
}
