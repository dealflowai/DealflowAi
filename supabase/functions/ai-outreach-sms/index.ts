
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SMSOutreachRequest {
  buyerId: string;
  buyerName: string;
  buyerPhone: string;
  campaignId: string;
  messageType: 'qualification' | 'follow_up' | 'nurture';
  aiPersona: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { buyerId, buyerName, buyerPhone, campaignId, messageType, aiPersona }: SMSOutreachRequest = await req.json();

    // Generate personalized SMS using OpenAI
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
            content: `You are ${aiPersona}. Create a professional but friendly SMS message for real estate investor outreach. Keep it under 160 characters, personalized, and focused on ${messageType}.`
          },
          {
            role: 'user',
            content: `Create a ${messageType} SMS message for ${buyerName}, a potential real estate investor. Make it engaging and include a clear call-to-action.`
          }
        ],
        max_tokens: 100,
        temperature: 0.7
      }),
    });

    const openaiData = await openaiResponse.json();
    const message = openaiData.choices[0].message.content;

    // Send SMS using Twilio (mock for now)
    const twilioResponse = {
      success: true,
      messageSid: `SM${Math.random().toString(36).substr(2, 34)}`,
      status: 'sent',
      deliveredAt: new Date().toISOString()
    };

    // Simulate response analysis after a delay
    const responseAnalysis = {
      delivered: true,
      opened: Math.random() > 0.3, // 70% open rate
      responded: Math.random() > 0.6, // 40% response rate
      sentiment: ['positive', 'neutral', 'negative'][Math.floor(Math.random() * 3)],
      qualificationScore: Math.floor(Math.random() * 40) + 50, // 50-90%
      followUpRecommended: Math.random() > 0.5
    };

    return new Response(JSON.stringify({
      message,
      twilioResponse,
      responseAnalysis
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in SMS outreach:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
