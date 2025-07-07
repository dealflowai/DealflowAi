
import { useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '@/integrations/supabase/client';

export const useSupabaseSync = () => {
  const { user, isSignedIn } = useUser();

  useEffect(() => {
    const syncUserToSupabase = async () => {
      if (!isSignedIn || !user) return;

      try {
        console.log('Syncing user to Supabase:', user.id);
        
        // Check if user profile exists in Supabase
        const { data: existingProfile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('clerk_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error checking user profile:', error);
          return;
        }

        // Create profile if it doesn't exist
        if (!existingProfile) {
          console.log('Creating new profile for user:', user.id);
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              clerk_id: user.id,
              email: user.primaryEmailAddress?.emailAddress,
              first_name: user.firstName,
              last_name: user.lastName,
              role: 'super_admin', // Default to super_admin for now
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });

          if (insertError) {
            console.error('Error creating user profile:', insertError);
          } else {
            console.log('User profile created successfully');
          }
        } else {
          console.log('User profile already exists:', existingProfile);
          
          // Update profile with latest info from Clerk
          const { error: updateError } = await supabase
            .from('profiles')
            .update({
              email: user.primaryEmailAddress?.emailAddress,
              first_name: user.firstName,
              last_name: user.lastName,
              updated_at: new Date().toISOString()
            })
            .eq('clerk_id', user.id);

          if (updateError) {
            console.error('Error updating user profile:', updateError);
          } else {
            console.log('User profile updated successfully');
          }
        }
      } catch (error) {
        console.error('Error syncing user to Supabase:', error);
      }
    };

    syncUserToSupabase();
  }, [user, isSignedIn]);
};
