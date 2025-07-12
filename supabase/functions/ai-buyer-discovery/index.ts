import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[AI-BUYER-DISCOVERY] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) throw new Error('OPENAI_API_KEY is not set');

    // Create Supabase client for authentication
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");

    logStep("User authenticated", { userId: user.id });

    // Get request data
    const { searchCriteria } = await req.json();
    if (!searchCriteria) throw new Error("Search criteria is required");

    logStep("Search criteria received", { searchCriteria });

    // Prepare the prompt for GPT to generate buyer profiles
    const discoveryPrompt = `
    As a real estate lead generation expert, create detailed buyer profiles based on these search criteria:

    Search Parameters:
    - Markets: ${searchCriteria.markets?.join(', ') || 'Any'}
    - Property Types: ${searchCriteria.propertyTypes?.join(', ') || 'Any'}
    - Budget Range: $${searchCriteria.budgetMin?.toLocaleString() || '0'} - $${searchCriteria.budgetMax?.toLocaleString() || 'Unlimited'}
    - Deal Types: ${searchCriteria.dealTypes?.join(', ') || 'Any'}
    - Location Focus: ${searchCriteria.location || 'Any'}

    Generate 5-8 realistic buyer profiles that would match these criteria. For each buyer, provide:

    1. **Name**: Generate a realistic name
    2. **Company**: Create a realistic company name
    3. **Email**: Generate a professional email address
    4. **Phone**: Generate a realistic phone number
    5. **Investment Focus**: Specific property types and strategies they prefer
    6. **Budget Range**: Specific budget they work with
    7. **Markets**: Primary markets they invest in
    8. **Experience Level**: Years of experience and deal volume
    9. **Acquisition Timeline**: How quickly they can close
    10. **Contact Preference**: Email, phone, or in-person
    11. **Portfolio Summary**: Brief description of their current portfolio
    12. **Pain Points**: What challenges they face in finding deals

    Format the response as a JSON array of buyer objects. Make each profile unique and realistic.
    `;

    logStep("Making OpenAI API call");

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert real estate lead generation specialist. Generate realistic, high-quality buyer profiles that match the given criteria. Always respond with valid JSON format.' 
          },
          { role: 'user', content: discoveryPrompt }
        ],
        temperature: 0.8,
        max_tokens: 3000,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    let buyerProfiles;

    try {
      // Try to parse the JSON response
      const content = data.choices[0].message.content;
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        buyerProfiles = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON array found in response");
      }
    } catch (parseError) {
      logStep("JSON parsing failed, creating fallback profiles");
      // Fallback if JSON parsing fails
      buyerProfiles = [
        {
          name: "Generated Buyer Profile",
          company: "Real Estate Investment Co",
          email: "contact@example.com",
          phone: "(555) 123-4567",
          investmentFocus: searchCriteria.propertyTypes?.[0] || "Multi-family",
          budgetMin: searchCriteria.budgetMin || 100000,
          budgetMax: searchCriteria.budgetMax || 500000,
          markets: searchCriteria.markets || ["Local Market"],
          experienceLevel: "5+ years",
          acquisitionTimeline: "30-45 days",
          contactPreference: "Email",
          portfolioSummary: "Active real estate investor",
          painPoints: "Finding quality deals in target markets"
        }
      ];
    }

    logStep("Buyer discovery completed successfully", { profileCount: buyerProfiles.length });

    return new Response(JSON.stringify({ 
      buyerProfiles,
      searchCriteria,
      generatedAt: new Date().toISOString(),
      totalProfiles: buyerProfiles.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in ai-buyer-discovery", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});