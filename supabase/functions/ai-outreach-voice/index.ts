
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VoiceOutreachRequest {
  buyerId: string;
  buyerName: string;
  buyerPhone: string;
  campaignId: string;
  aiPersona: string;
  qualificationCriteria: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { buyerId, buyerName, buyerPhone, campaignId, aiPersona, qualificationCriteria }: VoiceOutreachRequest = await req.json();

    // Generate qualification script using OpenAI
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
            content: `You are ${aiPersona}. Create a natural, conversational script for a phone call to qualify a real estate investor. Keep it professional but friendly. Focus on these qualification criteria: ${qualificationCriteria.join(', ')}`
          },
          {
            role: 'user',
            content: `Create a phone script to qualify ${buyerName} as a real estate investor. The script should be natural, engaging, and focus on understanding their investment goals, budget, timeline, and experience.`
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      }),
    });

    const openaiData = await openaiResponse.json();
    const script = openaiData.choices[0].message.content;

    // Convert script to speech using ElevenLabs
    const elevenLabsResponse = await fetch('https://api.elevenlabs.io/v1/text-to-speech/EXAVITQu4vr4xnSDxMaL', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('ELEVENLABS_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: script,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
          style: 0.5,
          use_speaker_boost: true
        }
      }),
    });

    const audioBuffer = await elevenLabsResponse.arrayBuffer();
    const base64Audio = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));

    // Simulate making the call (in production, integrate with Twilio Voice API)
    const callResult = {
      success: true,
      callDuration: Math.floor(Math.random() * 300) + 60, // 1-5 minutes
      transcript: `AI: Hello ${buyerName}, this is Sarah from Premium Investment Properties...`,
      qualificationScore: Math.floor(Math.random() * 40) + 60, // 60-100%
      sentiment: ['positive', 'neutral', 'negative'][Math.floor(Math.random() * 3)],
      keyInsights: [
        'Experienced investor with 5+ properties',
        'Looking for fix-and-flip opportunities',
        'Budget range $100K-$300K',
        'Prefers properties in Austin area'
      ],
      nextActions: [
        'Send deal examples matching criteria',
        'Schedule property viewing',
        'Add to VIP investor list'
      ]
    };

    return new Response(JSON.stringify({
      script,
      audioContent: base64Audio,
      callResult
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in voice outreach:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
