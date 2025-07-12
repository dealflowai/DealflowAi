import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[AI-DEAL-ANALYZER] ${step}${detailsStr}`);
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
    const { dealData } = await req.json();
    if (!dealData) throw new Error("Deal data is required");

    logStep("Deal data received", { dealData });

    // Prepare the prompt for GPT
    const analysisPrompt = `
    As a real estate investment expert, analyze this deal and provide a comprehensive assessment:

    Property Details:
    - Address: ${dealData.address || 'Not provided'}
    - List Price: $${dealData.listPrice?.toLocaleString() || 'Not provided'}
    - ARV (After Repair Value): $${dealData.arv?.toLocaleString() || 'Not provided'}
    - Repair Estimate: $${dealData.repairEstimate?.toLocaleString() || 'Not provided'}
    - Deal Type: ${dealData.dealType || 'Not provided'}
    - Property Condition Score: ${dealData.conditionScore || 'Not provided'}/10

    Please provide:
    1. **Deal Quality Score** (1-100): Rate this deal's overall quality
    2. **Profit Analysis**: Calculate potential profit margins and ROI
    3. **Risk Assessment**: Identify potential risks and red flags
    4. **Market Analysis**: Assess the local market conditions
    5. **Recommendation**: Should this deal be pursued? Why or why not?
    6. **Key Insights**: 3-5 bullet points of the most important insights
    7. **Next Steps**: Recommended actions to take

    Format your response in a clear, structured way that helps make an informed investment decision.
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
            content: 'You are an expert real estate investment analyst with 20+ years of experience. Provide detailed, actionable analysis that helps investors make informed decisions.' 
          },
          { role: 'user', content: analysisPrompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const analysis = data.choices[0].message.content;

    logStep("Analysis completed successfully");

    // Calculate AI score from the analysis (extract from the response if possible)
    let aiScore = 75; // Default score
    const scoreMatch = analysis.match(/(?:Deal Quality Score|Score).*?(\d+)/i);
    if (scoreMatch) {
      aiScore = parseInt(scoreMatch[1]);
    }

    return new Response(JSON.stringify({ 
      analysis,
      aiScore,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in ai-deal-analyzer", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});