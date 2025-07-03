
import { useQuery } from '@tanstack/react-query';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '@/integrations/supabase/client';

export const useProfileData = () => {
  const { user, isSignedIn } = useUser();

  return useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!isSignedIn || !user) {
        throw new Error('User not authenticated');
      }

      console.log('Fetching profile for user:', user.id);
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('clerk_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        throw error;
      }

      // If no profile exists, return a default profile structure
      if (!profile) {
        console.log('No profile found, creating default profile data');
        return {
          id: user.id,
          clerk_id: user.id,
          email: user.primaryEmailAddress?.emailAddress || '',
          first_name: user.firstName || '',
          last_name: user.lastName || '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      }

      console.log('Profile found:', profile);
      return profile;
    },
    enabled: isSignedIn && !!user,
  });
};
