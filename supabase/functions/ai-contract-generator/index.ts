import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[AI-CONTRACT-GENERATOR] ${step}${detailsStr}`);
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
    logStep("Auth header received", { hasAuthHeader: !!authHeader, authHeaderLength: authHeader?.length });
    
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    logStep("Token extracted", { tokenLength: token.length, tokenPrefix: token.substring(0, 10) + "..." });
    
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    logStep("User data retrieved", { hasUser: !!userData?.user, userId: userData?.user?.id, error: userError?.message });
    
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");

    logStep("User authenticated", { userId: user.id });

    // Get request data - the frontend sends the data directly, not nested in contractData
    const contractData = await req.json();
    if (!contractData) throw new Error("Contract data is required");

    logStep("Contract data received", { contractData });

    // Prepare the prompt for GPT to generate contract
    const contractPrompt = `
    As a real estate attorney and contract specialist, generate a comprehensive real estate purchase agreement with the following details:

    Contract Information:
    - Property Address: ${contractData.propertyAddress}
    - Purchase Price: $${contractData.purchasePrice?.toLocaleString() || 'TBD'}
    - Earnest Money: $${contractData.earnestMoney?.toLocaleString() || 'TBD'}
    - Closing Date: ${contractData.closingDate || 'TBD'}
    - Buyer Name: ${contractData.buyerName || 'TBD'}
    - Buyer Email: ${contractData.buyerEmail || 'TBD'}
    - Seller Name: ${contractData.sellerName || 'TBD'}
    - Seller Email: ${contractData.sellerEmail || 'TBD'}
    - Template Type: ${contractData.templateType || 'Standard Purchase Agreement'}
    - Special Terms: ${contractData.specialTerms || 'None'}

    Generate a complete, professional real estate purchase agreement that includes:

    1. **Header Section**: Contract title, date, parties involved
    2. **Property Description**: Full legal description and address
    3. **Purchase Terms**: Price, earnest money, financing details
    4. **Closing Information**: Date, location, title company details
    5. **Contingencies**: Inspection, financing, appraisal contingencies
    6. **Seller Disclosures**: Required disclosure statements
    7. **Default Provisions**: What happens if either party defaults
    8. **Special Conditions**: Any custom terms or conditions
    9. **Signatures Section**: Signature lines for all parties
    10. **Addendums**: Any additional terms or state-specific requirements

    Make sure the contract is:
    - Legally sound and professional
    - State-appropriate (use generic terms if state not specified)
    - Easy to read and understand
    - Complete with all necessary clauses
    - Ready for review by legal counsel

    Format the contract as a professional document with proper sections and numbering.
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
            content: 'You are an expert real estate attorney with 20+ years of experience drafting purchase agreements. Create comprehensive, legally sound contracts that protect all parties involved.' 
          },
          { role: 'user', content: contractPrompt }
        ],
        temperature: 0.3,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const contractContent = data.choices[0].message.content;

    logStep("Contract generation completed successfully");

    // Generate a title for the contract
    const contractTitle = `${contractData.templateType || 'Purchase Agreement'} - ${contractData.propertyAddress}`;

    return new Response(JSON.stringify({ 
      contractContent,
      contractTitle,
      contractData,
      generatedAt: new Date().toISOString(),
      disclaimer: "This contract was generated by AI and should be reviewed by a qualified real estate attorney before use."
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in ai-contract-generator", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});