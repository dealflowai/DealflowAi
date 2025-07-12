import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper logging function for debugging
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[MONTHLY-TOKEN-GRANT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Monthly token grant function started");

    // Use the service role key to perform operations
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Call the database function to grant monthly tokens
    const { data: grantResults, error: grantError } = await supabaseClient
      .rpc('grant_monthly_tokens');

    if (grantError) {
      logStep("Error granting monthly tokens", { error: grantError });
      throw grantError;
    }

    logStep("Monthly tokens granted successfully", { 
      usersProcessed: grantResults?.length || 0,
      results: grantResults 
    });

    // Create notifications for users who received tokens
    if (grantResults && grantResults.length > 0) {
      for (const result of grantResults) {
        try {
          await supabaseClient.rpc('create_notification', {
            p_user_id: result.user_id,
            p_type: 'token_grant',
            p_title: 'Monthly Tokens Added!',
            p_message: `Your monthly ${result.tokens_granted} tokens have been added to your account.`,
            p_data: {
              tokens_granted: result.tokens_granted,
              next_grant_date: result.next_grant_date,
              grant_type: 'monthly_subscription'
            }
          });
          
          logStep("Notification created for user", { 
            userId: result.user_id, 
            tokensGranted: result.tokens_granted 
          });
        } catch (notificationError) {
          logStep("Failed to create notification", { 
            userId: result.user_id, 
            error: notificationError 
          });
          // Don't throw here - notification failure shouldn't stop token grants
        }
      }
    }

    return new Response(JSON.stringify({
      success: true,
      usersProcessed: grantResults?.length || 0,
      results: grantResults,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in monthly-token-grant", { message: errorMessage, stack: error.stack });
    
    return new Response(JSON.stringify({ 
      success: false,
      error: errorMessage,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});