
import { useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '@/integrations/supabase/client';

export function useUserSync() {
  const { user, isLoaded } = useUser();

  useEffect(() => {
    const syncUser = async () => {
      if (!isLoaded || !user) return;

      try {
        // Check if profile exists
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('clerk_id', user.id)
          .single();

        if (!existingProfile) {
          // Create profile if it doesn't exist
          const { error } = await supabase
            .from('profiles')
            .insert({
              clerk_id: user.id,
              email: user.primaryEmailAddress?.emailAddress,
              first_name: user.firstName,
              last_name: user.lastName,
            });

          if (error && error.code !== '23505') { // Ignore duplicate key errors
            console.error('Error creating user profile:', error);
          }
        }
      } catch (error) {
        console.error('Error syncing user:', error);
      }
    };

    syncUser();
  }, [user, isLoaded]);

  return { user, isLoaded };
}
