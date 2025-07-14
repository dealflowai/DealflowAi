import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalysisRequest {
  content: string;
  contentType: 'post' | 'profile' | 'message' | 'bio';
  platform: 'facebook' | 'linkedin' | 'propwire' | 'biggerpockets' | 'gmail';
  userFilters?: {
    minBudget?: number;
    maxBudget?: number;
    locations?: string[];
    propertyTypes?: string[];
    excludeRetail?: boolean;
  };
}

interface BuyerIntent {
  isBuyer: boolean;
  confidenceScore: number; // 0-100
  buyerType: 'cash_buyer' | 'investor' | 'wholesaler' | 'fix_flip' | 'buy_hold' | 'land_buyer' | 'unknown';
  signals: string[];
  extractedInfo: {
    name?: string;
    location?: string;
    budget?: {
      min?: number;
      max?: number;
    };
    propertyTypes?: string[];
    timeline?: string;
    experience?: 'beginner' | 'intermediate' | 'experienced';
    contactInfo?: {
      phone?: string;
      email?: string;
    };
  };
  redFlags: string[];
  reasoning: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Get user from JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header missing' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body: AnalysisRequest = await req.json();
    console.log('AI buyer detection request:', { 
      contentType: body.contentType, 
      platform: body.platform,
      contentLength: body.content.length 
    });

    // Analyze content with OpenAI
    const buyerIntent = await analyzeBuyerIntent(body, openAIApiKey);
    
    // Apply user filters if provided
    const filteredResult = applyUserFilters(buyerIntent, body.userFilters);

    // Log the analysis for debugging
    console.log('Buyer intent analysis result:', {
      isBuyer: filteredResult.isBuyer,
      confidenceScore: filteredResult.confidenceScore,
      buyerType: filteredResult.buyerType,
      signalsCount: filteredResult.signals.length
    });

    return new Response(
      JSON.stringify({ 
        success: true,
        analysis: filteredResult,
        platform: body.platform,
        contentType: body.contentType,
        analyzedAt: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('AI buyer detection error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function analyzeBuyerIntent(request: AnalysisRequest, apiKey: string): Promise<BuyerIntent> {
  const systemPrompt = `You are an expert real estate investor lead qualification AI. Your job is to analyze content from social media posts, profiles, messages, and bios to determine if someone is a legitimate real estate buyer/investor.

BUYER TYPES TO IDENTIFY:
- cash_buyer: Has cash ready to purchase properties quickly
- investor: General real estate investor (rental properties, etc.)
- wholesaler: Finds deals to assign to other investors
- fix_flip: Buys properties to renovate and resell
- buy_hold: Buys properties for long-term rental income
- land_buyer: Specifically interested in raw land deals

POSITIVE BUYER SIGNALS:
- Mentions having cash available or liquid funds
- Looking for "off-market" or "distressed" properties
- Mentions "quick close" or "close fast"
- Has specific buy criteria (location, price range, property type)
- Mentions being an "investor" or "buyer"
- Looking for "deals" or "wholesale prices"
- Mentions ARV, cap rates, cash flow, ROI
- Has experience with real estate investing
- Mentions portfolio or multiple properties
- Looking for properties "under market value"
- Mentions "rehab" or "fix and flip"
- Looking for "rental properties" or "buy and hold"

RED FLAGS (reduce confidence):
- Asking for money or loans
- Offering "training" or "courses"
- Vague or generic language
- No specific criteria mentioned
- Seems like spam or promotional content
- Asking others to find deals for them without reciprocal value
- New to investing with no clear funding source

RESPONSE FORMAT:
Return a JSON object with the exact structure shown in the BuyerIntent interface. Be specific and detailed in your analysis.`;

  const userPrompt = `Analyze this ${request.contentType} from ${request.platform}:

CONTENT:
"${request.content}"

Provide a detailed analysis determining if this person is a legitimate real estate buyer/investor. Extract any relevant information about their buying criteria, budget, location preferences, and contact information.

Consider the platform context - ${request.platform} posts may have different styles and formats.

Return your analysis as a valid JSON object matching the BuyerIntent interface.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 1500,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const analysisText = data.choices[0].message.content;
    
    try {
      const analysis = JSON.parse(analysisText);
      
      // Validate and sanitize the response
      return {
        isBuyer: Boolean(analysis.isBuyer),
        confidenceScore: Math.max(0, Math.min(100, Number(analysis.confidenceScore) || 0)),
        buyerType: analysis.buyerType || 'unknown',
        signals: Array.isArray(analysis.signals) ? analysis.signals : [],
        extractedInfo: {
          name: analysis.extractedInfo?.name || undefined,
          location: analysis.extractedInfo?.location || undefined,
          budget: analysis.extractedInfo?.budget || undefined,
          propertyTypes: Array.isArray(analysis.extractedInfo?.propertyTypes) 
            ? analysis.extractedInfo.propertyTypes : undefined,
          timeline: analysis.extractedInfo?.timeline || undefined,
          experience: analysis.extractedInfo?.experience || undefined,
          contactInfo: analysis.extractedInfo?.contactInfo || undefined,
        },
        redFlags: Array.isArray(analysis.redFlags) ? analysis.redFlags : [],
        reasoning: analysis.reasoning || 'No reasoning provided'
      };
    } catch (parseError) {
      console.error('Failed to parse OpenAI JSON response:', parseError);
      console.error('Raw response:', analysisText);
      
      // Fallback analysis
      return {
        isBuyer: false,
        confidenceScore: 0,
        buyerType: 'unknown',
        signals: [],
        extractedInfo: {},
        redFlags: ['Failed to parse AI analysis'],
        reasoning: 'AI analysis parsing failed'
      };
    }
  } catch (error) {
    console.error('OpenAI API call failed:', error);
    throw new Error(`AI analysis failed: ${error.message}`);
  }
}

function applyUserFilters(analysis: BuyerIntent, filters?: AnalysisRequest['userFilters']): BuyerIntent {
  if (!filters || !analysis.isBuyer) {
    return analysis;
  }

  let adjustedConfidence = analysis.confidenceScore;
  const adjustmentReasons: string[] = [];

  // Check budget alignment
  if (filters.minBudget || filters.maxBudget) {
    const extractedBudget = analysis.extractedInfo.budget;
    if (extractedBudget) {
      if (filters.minBudget && extractedBudget.max && extractedBudget.max < filters.minBudget) {
        adjustedConfidence -= 30;
        adjustmentReasons.push('Budget below minimum requirement');
      }
      if (filters.maxBudget && extractedBudget.min && extractedBudget.min > filters.maxBudget) {
        adjustedConfidence -= 30;
        adjustmentReasons.push('Budget above maximum range');
      }
    }
  }

  // Check location alignment
  if (filters.locations && filters.locations.length > 0) {
    const extractedLocation = analysis.extractedInfo.location?.toLowerCase();
    if (extractedLocation) {
      const locationMatch = filters.locations.some(loc => 
        extractedLocation.includes(loc.toLowerCase()) || 
        loc.toLowerCase().includes(extractedLocation)
      );
      if (!locationMatch) {
        adjustedConfidence -= 20;
        adjustmentReasons.push('Location not in target areas');
      }
    }
  }

  // Check property type alignment
  if (filters.propertyTypes && filters.propertyTypes.length > 0) {
    const extractedTypes = analysis.extractedInfo.propertyTypes;
    if (extractedTypes && extractedTypes.length > 0) {
      const typeMatch = extractedTypes.some(type => 
        filters.propertyTypes!.some(filterType => 
          type.toLowerCase().includes(filterType.toLowerCase()) ||
          filterType.toLowerCase().includes(type.toLowerCase())
        )
      );
      if (!typeMatch) {
        adjustedConfidence -= 15;
        adjustmentReasons.push('Property types not aligned with targets');
      }
    }
  }

  // Exclude retail/beginner investors if requested
  if (filters.excludeRetail && analysis.extractedInfo.experience === 'beginner') {
    adjustedConfidence -= 25;
    adjustmentReasons.push('Beginner investor excluded per filters');
  }

  // Ensure confidence doesn't go below 0
  adjustedConfidence = Math.max(0, adjustedConfidence);

  // If confidence drops too low, mark as not a buyer
  const isBuyer = adjustedConfidence >= 30;

  return {
    ...analysis,
    isBuyer,
    confidenceScore: adjustedConfidence,
    redFlags: adjustmentReasons.length > 0 
      ? [...analysis.redFlags, ...adjustmentReasons]
      : analysis.redFlags
  };
}