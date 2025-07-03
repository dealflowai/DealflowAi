
import { useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '@/integrations/supabase/client';

export const useSupabaseSync = () => {
  const { user, isSignedIn } = useUser();

  useEffect(() => {
    const syncUserToSupabase = async () => {
      if (!isSignedIn || !user) return;

      try {
        // Check if user profile exists in Supabase using a direct query
        const { data: existingProfile, error } = await supabase
          .from('profiles' as any)
          .select('*')
          .eq('clerk_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error checking user profile:', error);
          return;
        }

        // Create profile if it doesn't exist
        if (!existingProfile) {
          const { error: insertError } = await supabase
            .from('profiles' as any)
            .insert({
              clerk_id: user.id,
              email: user.primaryEmailAddress?.emailAddress,
              first_name: user.firstName,
              last_name: user.lastName,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });

          if (insertError) {
            console.error('Error creating user profile:', insertError);
          } else {
            console.log('User profile created successfully');
          }
        } else {
          console.log('User profile already exists');
        }
      } catch (error) {
        console.error('Error syncing user to Supabase:', error);
      }
    };

    syncUserToSupabase();
  }, [user, isSignedIn]);
};
