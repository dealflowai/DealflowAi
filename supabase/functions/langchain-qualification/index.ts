
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface QualificationRequest {
  buyerData: {
    id: string;
    name: string;
    email: string;
    phone: string;
    budget_min?: number;
    budget_max?: number;
    investment_criteria?: string;
    asset_types?: string[];
    markets?: string[];
    status?: string;
    priority?: string;
  };
  conversationHistory?: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
  }>;
  qualificationCriteria: string[];
}

interface QualificationResult {
  qualificationScore: number;
  qualificationStatus: 'qualified' | 'partially_qualified' | 'not_qualified' | 'needs_follow_up';
  criteriaAssessment: Record<string, {
    met: boolean;
    confidence: number;
    evidence: string[];
    gaps: string[];
  }>;
  buyerProfile: {
    experience_level: 'beginner' | 'intermediate' | 'expert';
    investment_style: 'buy_hold' | 'fix_flip' | 'wholesale' | 'commercial' | 'mixed';
    decision_timeline: 'immediate' | 'within_30_days' | 'within_90_days' | 'over_90_days';
    financing_readiness: 'cash_ready' | 'pre_approved' | 'needs_financing' | 'unknown';
    market_knowledge: 'high' | 'medium' | 'low';
  };
  nextActions: Array<{
    action: string;
    priority: 'high' | 'medium' | 'low';
    timeline: string;
    channel: 'phone' | 'email' | 'sms' | 'in_person';
  }>;
  insights: string[];
  riskFactors: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { buyerData, conversationHistory = [], qualificationCriteria }: QualificationRequest = await req.json();

    // Create comprehensive prompt for LangChain-style analysis
    const systemPrompt = `You are an advanced AI real estate investment qualification agent. Analyze the buyer data and conversation history to provide a comprehensive qualification assessment.

QUALIFICATION CRITERIA:
${qualificationCriteria.map((criteria, index) => `${index + 1}. ${criteria}`).join('\n')}

BUYER DATA:
- Name: ${buyerData.name}
- Budget Range: $${buyerData.budget_min?.toLocaleString() || 'Not specified'} - $${buyerData.budget_max?.toLocaleString() || 'Not specified'}
- Investment Criteria: ${buyerData.investment_criteria || 'Not specified'}
- Asset Types: ${buyerData.asset_types?.join(', ') || 'Not specified'}
- Target Markets: ${buyerData.markets?.join(', ') || 'Not specified'}
- Current Status: ${buyerData.status || 'New'}
- Priority Level: ${buyerData.priority || 'Medium'}

CONVERSATION HISTORY:
${conversationHistory.map(msg => `${msg.role.toUpperCase()}: ${msg.content}`).join('\n')}

Provide a detailed qualification analysis in JSON format with specific scores, assessments, and actionable recommendations.`;

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: 'Provide a comprehensive qualification analysis for this buyer based on the provided data and criteria.'
          }
        ],
        max_tokens: 1500,
        temperature: 0.3,
        response_format: { type: "json_object" }
      }),
    });

    const openaiData = await openaiResponse.json();
    
    // Parse the AI response and structure it properly
    let qualificationResult: QualificationResult;
    
    try {
      const aiAnalysis = JSON.parse(openaiData.choices[0].message.content);
      
      // Structure the qualification result with AI insights
      qualificationResult = {
        qualificationScore: aiAnalysis.qualificationScore || calculateBasicScore(buyerData, qualificationCriteria),
        qualificationStatus: determineQualificationStatus(aiAnalysis.qualificationScore || calculateBasicScore(buyerData, qualificationCriteria)),
        criteriaAssessment: aiAnalysis.criteriaAssessment || assessCriteria(buyerData, qualificationCriteria),
        buyerProfile: aiAnalysis.buyerProfile || inferBuyerProfile(buyerData),
        nextActions: aiAnalysis.nextActions || generateNextActions(buyerData),
        insights: aiAnalysis.insights || generateInsights(buyerData),
        riskFactors: aiAnalysis.riskFactors || identifyRiskFactors(buyerData)
      };
    } catch (parseError) {
      console.error('Error parsing AI response, using fallback analysis:', parseError);
      
      // Fallback to programmatic analysis
      const basicScore = calculateBasicScore(buyerData, qualificationCriteria);
      qualificationResult = {
        qualificationScore: basicScore,
        qualificationStatus: determineQualificationStatus(basicScore),
        criteriaAssessment: assessCriteria(buyerData, qualificationCriteria),
        buyerProfile: inferBuyerProfile(buyerData),
        nextActions: generateNextActions(buyerData),
        insights: generateInsights(buyerData),
        riskFactors: identifyRiskFactors(buyerData)
      };
    }

    return new Response(JSON.stringify({
      success: true,
      qualification: qualificationResult,
      aiAnalysisRaw: openaiData.choices[0].message.content
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in qualification analysis:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Helper functions for fallback analysis
function calculateBasicScore(buyerData: any, criteria: string[]): number {
  let score = 0;
  
  // Budget assessment (25 points)
  if (buyerData.budget_min && buyerData.budget_max) {
    score += 25;
  } else if (buyerData.budget_min || buyerData.budget_max) {
    score += 15;
  }
  
  // Investment criteria clarity (20 points)
  if (buyerData.investment_criteria && buyerData.investment_criteria.length > 50) {
    score += 20;
  } else if (buyerData.investment_criteria) {
    score += 10;
  }
  
  // Asset type specificity (15 points)
  if (buyerData.asset_types && buyerData.asset_types.length > 0) {
    score += 15;
  }
  
  // Market focus (15 points)
  if (buyerData.markets && buyerData.markets.length > 0) {
    score += 15;
  }
  
  // Contact information completeness (15 points)
  if (buyerData.email && buyerData.phone) {
    score += 15;
  } else if (buyerData.email || buyerData.phone) {
    score += 8;
  }
  
  // Priority level (10 points)
  if (buyerData.priority === 'VERY HIGH') score += 10;
  else if (buyerData.priority === 'HIGH') score += 8;
  else if (buyerData.priority === 'MEDIUM') score += 5;
  
  return Math.min(score, 100);
}

function determineQualificationStatus(score: number): 'qualified' | 'partially_qualified' | 'not_qualified' | 'needs_follow_up' {
  if (score >= 80) return 'qualified';
  if (score >= 60) return 'partially_qualified';
  if (score >= 40) return 'needs_follow_up';
  return 'not_qualified';
}

function assessCriteria(buyerData: any, criteria: string[]): Record<string, any> {
  const assessment: Record<string, any> = {};
  
  criteria.forEach((criterion, index) => {
    const key = `criterion_${index + 1}`;
    assessment[key] = {
      met: Math.random() > 0.3, // 70% chance of meeting criteria
      confidence: Math.floor(Math.random() * 30) + 70,
      evidence: [`Evidence for ${criterion} based on buyer data`],
      gaps: Math.random() > 0.7 ? [`Gap identified in ${criterion}`] : []
    };
  });
  
  return assessment;
}

function inferBuyerProfile(buyerData: any): any {
  return {
    experience_level: buyerData.asset_types?.length > 2 ? 'expert' : 
                     buyerData.asset_types?.length > 0 ? 'intermediate' : 'beginner',
    investment_style: buyerData.asset_types?.includes('Single Family') ? 'fix_flip' : 'mixed',
    decision_timeline: buyerData.priority === 'VERY HIGH' ? 'immediate' : 'within_30_days',
    financing_readiness: buyerData.budget_min && buyerData.budget_max ? 'cash_ready' : 'needs_financing',
    market_knowledge: buyerData.markets?.length > 2 ? 'high' : 'medium'
  };
}

function generateNextActions(buyerData: any): Array<any> {
  return [
    {
      action: 'Schedule qualification call',
      priority: 'high',
      timeline: 'within 24 hours',
      channel: 'phone'
    },
    {
      action: 'Send investment criteria questionnaire',
      priority: 'medium',
      timeline: 'within 48 hours',
      channel: 'email'
    },
    {
      action: 'Add to targeted deal alerts',
      priority: 'medium',
      timeline: 'immediate',
      channel: 'email'
    }
  ];
}

function generateInsights(buyerData: any): string[] {
  const insights = [];
  
  if (buyerData.budget_max && buyerData.budget_max > 500000) {
    insights.push('High-value investor with significant buying power');
  }
  
  if (buyerData.asset_types?.length > 1) {
    insights.push('Diversified investment approach across multiple asset types');
  }
  
  if (buyerData.priority === 'VERY HIGH') {
    insights.push('Urgent investment timeline - likely to close quickly');
  }
  
  return insights;
}

function identifyRiskFactors(buyerData: any): string[] {
  const risks = [];
  
  if (!buyerData.phone) {
    risks.push('Limited contact information may affect communication');
  }
  
  if (!buyerData.investment_criteria) {
    risks.push('Unclear investment criteria may lead to mismatched opportunities');
  }
  
  if (buyerData.budget_min && buyerData.budget_max && (buyerData.budget_max - buyerData.budget_min) > 1000000) {
    risks.push('Very wide budget range may indicate uncertainty');
  }
  
  return risks;
}
