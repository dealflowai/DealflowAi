import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    console.log('Automated scraper triggered at:', new Date().toISOString());

    // Get all users with active scraping preferences and sessions
    const { data: preferences, error: prefsError } = await supabaseClient
      .from('scraping_preferences')
      .select(`
        *,
        profiles!inner(id, clerk_id)
      `)
      .eq('auto_scrape_enabled', true)
      .lte('next_scrape_at', new Date().toISOString());

    if (prefsError) {
      console.error('Error fetching scraping preferences:', prefsError);
      throw prefsError;
    }

    console.log(`Found ${preferences?.length || 0} users ready for automated scraping`);

    const results = [];

    for (const pref of preferences || []) {
      try {
        console.log(`Processing automated scrape for user ${pref.user_id} on ${pref.platform}`);

        // Check if user has an active session for this platform
        const { data: session, error: sessionError } = await supabaseClient
          .from('scraping_sessions')
          .select('*')
          .eq('user_id', pref.user_id)
          .eq('platform', pref.platform)
          .eq('is_active', true)
          .gt('expires_at', new Date().toISOString())
          .single();

        if (sessionError || !session) {
          console.log(`No active session found for user ${pref.user_id} on ${pref.platform}`);
          
          // Update next scrape time to try again later
          await supabaseClient
            .from('scraping_preferences')
            .update({
              next_scrape_at: new Date(Date.now() + (pref.scrape_frequency_hours || 48) * 60 * 60 * 1000),
              updated_at: new Date().toISOString()
            })
            .eq('id', pref.id);

          results.push({
            user_id: pref.user_id,
            platform: pref.platform,
            status: 'skipped',
            reason: 'No active session'
          });
          continue;
        }

        // Perform the automated scrape
        const scrapeTargets = getScrapeTargets(pref);
        const scrapeFilters = getScrapeFilters(pref);

        // Call the browser session scraper function
        const scrapeResponse = await supabaseClient.functions.invoke('browser-session-scraper', {
          body: {
            action: 'scrape',
            platform: pref.platform,
            scrapeTargets,
            filters: scrapeFilters
          },
          headers: {
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`
          }
        });

        if (scrapeResponse.error) {
          console.error(`Scrape failed for user ${pref.user_id}:`, scrapeResponse.error);
          results.push({
            user_id: pref.user_id,
            platform: pref.platform,
            status: 'failed',
            error: scrapeResponse.error
          });
        } else {
          console.log(`Scrape completed for user ${pref.user_id}`);
          results.push({
            user_id: pref.user_id,
            platform: pref.platform,
            status: 'completed',
            leads_found: scrapeResponse.data?.leads?.length || 0
          });
        }

        // Update scraping preferences with next run time and increment scrape count
        const nextScrapeTime = new Date(Date.now() + (pref.scrape_frequency_hours || 48) * 60 * 60 * 1000);
        await supabaseClient
          .from('scraping_preferences')
          .update({
            last_scrape_at: new Date().toISOString(),
            next_scrape_at: nextScrapeTime.toISOString(),
            scrape_count: (pref.scrape_count || 0) + 1,
            updated_at: new Date().toISOString()
          })
          .eq('id', pref.id);

        // Create notification for the user
        await supabaseClient.functions.invoke('create-notification', {
          body: {
            user_id: pref.user_id,
            type: 'scrape_completed',
            title: 'Automated Scrape Completed',
            message: `Found ${scrapeResponse.data?.leads?.length || 0} new leads from ${pref.platform}`,
            data: {
              platform: pref.platform,
              leads_count: scrapeResponse.data?.leads?.length || 0,
              scrape_time: new Date().toISOString()
            }
          }
        });

      } catch (error) {
        console.error(`Error processing automated scrape for user ${pref.user_id}:`, error);
        results.push({
          user_id: pref.user_id,
          platform: pref.platform,
          status: 'error',
          error: error.message
        });

        // Still update next scrape time to avoid getting stuck
        await supabaseClient
          .from('scraping_preferences')
          .update({
            next_scrape_at: new Date(Date.now() + (pref.scrape_frequency_hours || 48) * 60 * 60 * 1000),
            updated_at: new Date().toISOString()
          })
          .eq('id', pref.id);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Automated scraping completed',
        results,
        processed_count: results.length,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Automated scraper error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

function getScrapeTargets(preferences: any): string[] {
  const targets = [];
  
  if (preferences.facebook_groups?.length) {
    targets.push(...preferences.facebook_groups);
  }
  
  if (preferences.linkedin_groups?.length) {
    targets.push(...preferences.linkedin_groups);
  }
  
  if (preferences.propwire_categories?.length) {
    targets.push(...preferences.propwire_categories);
  }
  
  return targets;
}

function getScrapeFilters(preferences: any): any {
  return {
    platform: preferences.platform,
    auto_scrape: true,
    scrape_id: `auto_${preferences.id}_${Date.now()}`
  };
}