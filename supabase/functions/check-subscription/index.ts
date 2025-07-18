import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper logging function for enhanced debugging
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Use the service role key to perform writes (upsert) in Supabase
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    // For Clerk authentication, we'll get user info from the request body
    const requestBody = await req.json();
    const { userEmail, userId } = requestBody;
    
    if (!userEmail || !userId) {
      throw new Error("User email and ID are required");
    }
    
    logStep("User info received", { userId, userEmail });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    const customers = await stripe.customers.list({ email: userEmail, limit: 1 });
    
    
    if (customers.data.length === 0) {
      logStep("No customer found, updating unsubscribed state");
      
      // Get the profile UUID from the Clerk ID
      const { data: profile } = await supabaseClient
        .from('profiles')
        .select('id')
        .eq('clerk_id', userId)
        .single();
      
      await supabaseClient.from("subscribers").upsert({
        email: userEmail,
        user_id: profile?.id || null,
        stripe_customer_id: null,
        subscribed: false,
        subscription_tier: null,
        subscription_end: null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'email' });
      return new Response(JSON.stringify({ subscribed: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });
    const hasActiveSub = subscriptions.data.length > 0;
    let subscriptionTier = null;
    let subscriptionEnd = null;

    if (hasActiveSub) {
      const subscription = subscriptions.data[0];
      subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
      logStep("Active subscription found", { subscriptionId: subscription.id, endDate: subscriptionEnd });
      
      // Determine subscription tier from price
      const priceId = subscription.items.data[0].price.id;
      const price = await stripe.prices.retrieve(priceId);
      const amount = price.unit_amount || 0;
      
      if (amount <= 10000) { // $100 or less
        subscriptionTier = "Starter";
      } else if (amount <= 25000) { // $250 or less  
        subscriptionTier = "Pro";
      } else {
        subscriptionTier = "Agency";
      }
      logStep("Determined subscription tier", { priceId, amount, subscriptionTier });
    } else {
      logStep("No active subscription found");
    }

    // Get the profile UUID from the Clerk ID
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('id, subscription_start_date')
      .eq('clerk_id', userId)
      .single();
    
    // Update subscription data
    await supabaseClient.from("subscribers").upsert({
      email: userEmail,
      user_id: profile?.id || null,
      stripe_customer_id: customerId,
      subscribed: hasActiveSub,
      subscription_tier: subscriptionTier,
      subscription_end: subscriptionEnd,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'email' });

    // If user has active subscription and no subscription start date, set it
    if (hasActiveSub && profile?.id && !profile.subscription_start_date) {
      const planTokens = subscriptionTier?.toLowerCase() === 'pro' || subscriptionTier?.toLowerCase() === 'starter' ? 100 : 25;
      
      await supabaseClient
        .from('profiles')
        .update({
          subscription_start_date: new Date().toISOString().split('T')[0], // Today's date
          last_token_grant_date: new Date().toISOString().split('T')[0],
          next_token_grant_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
          plan_tokens: planTokens
        })
        .eq('id', profile.id);
      
      // Grant initial tokens for new core/pro subscribers
      await supabaseClient.rpc('grant_tokens_to_user', {
        p_user_id: profile.id,
        p_tokens: planTokens
      });
      
      logStep("Set up new subscriber with initial tokens", { 
        userId: profile.id, 
        tokensGranted: planTokens,
        subscriptionTier 
      });
    }

    logStep("Updated database with subscription info", { subscribed: hasActiveSub, subscriptionTier });
    return new Response(JSON.stringify({
      subscribed: hasActiveSub,
      subscription_tier: subscriptionTier,
      subscription_end: subscriptionEnd
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in check-subscription", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});