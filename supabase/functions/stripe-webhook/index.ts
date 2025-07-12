import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Webhook received");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const body = await req.text();
    const sig = req.headers.get("stripe-signature");

    if (!sig) {
      throw new Error("No Stripe signature found");
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        sig,
        Deno.env.get("STRIPE_WEBHOOK_SECRET") || ""
      );
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    logStep("Event type", { type: event.type });

    // Handle successful checkout sessions for token purchases
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      
      logStep("Processing checkout session", { sessionId: session.id });

      if (session.metadata?.type === "token_purchase") {
        const tokens = parseInt(session.metadata.tokens);
        const userId = session.metadata.user_id;
        
        logStep("Token purchase detected", { tokens, userId });

        // First get the profile UUID from Clerk ID
        const { data: profile, error: profileError } = await supabaseAdmin
          .from('profiles')
          .select('id')
          .eq('clerk_id', userId)
          .single();

        if (profileError) {
          logStep("Profile lookup error", profileError);
          throw profileError;
        }

        if (!profile) {
          logStep("Profile not found", { userId });
          throw new Error('Profile not found');
        }

        // Record the purchase
        const { error: purchaseError } = await supabaseAdmin
          .from('token_purchases')
          .insert({
            user_id: profile.id,
            stripe_session_id: session.id,
            tokens_purchased: tokens,
            amount_paid: (session.amount_total || 0) / 100, // Convert from cents
            status: 'paid'
          });

        if (purchaseError) {
          logStep("Purchase record error", purchaseError);
          throw purchaseError;
        }

        // Add tokens to user's balance
        const { data: addResult, error: addError } = await supabaseAdmin.rpc('add_tokens', {
          p_user_id: profile.id,
          p_tokens: tokens
        });

        if (addError) {
          logStep("Add tokens error", addError);
          throw addError;
        }

        logStep("Tokens added successfully", { userId, tokens, profileId: profile.id });
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in stripe webhook", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});