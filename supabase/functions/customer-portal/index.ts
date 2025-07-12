import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper logging function for debugging
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CUSTOMER-PORTAL] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

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
    
    // Check if customer exists, if not create one
    let customers = await stripe.customers.list({ email: userEmail, limit: 1 });
    let customerId;
    
    if (customers.data.length === 0) {
      logStep("No customer found, creating new customer");
      const newCustomer = await stripe.customers.create({
        email: userEmail,
        metadata: {
          userId: userId
        }
      });
      customerId = newCustomer.id;
      logStep("Created new Stripe customer", { customerId });
    } else {
      customerId = customers.data[0].id;
      logStep("Found existing Stripe customer", { customerId });
    }

    // Check if customer has any subscriptions or payment methods
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      limit: 1
    });
    
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      limit: 1
    });
    
    logStep("Checked customer data", { 
      hasSubscriptions: subscriptions.data.length > 0,
      hasPaymentMethods: paymentMethods.data.length > 0 
    });
    
    // If no subscriptions or payment methods, customer portal won't work
    if (subscriptions.data.length === 0 && paymentMethods.data.length === 0) {
      throw new Error("No subscription found. Please upgrade to a paid plan first to manage your subscription.");
    }

    const origin = req.headers.get("origin") || "http://localhost:3000";
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/settings`,
    });
    logStep("Customer portal session created", { sessionId: portalSession.id, url: portalSession.url });

    return new Response(JSON.stringify({ url: portalSession.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in customer-portal", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});