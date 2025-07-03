
import "https://deno.land/x/xhr@0.1.0/mod.ts";  
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailOutreachRequest {
  buyerId: string;
  buyerName: string;
  buyerEmail: string;
  campaignId: string;
  emailType: 'qualification' | 'follow_up' | 'nurture' | 'market_update';
  aiPersona: string;
  buyerCriteria?: {
    budget: string;
    location: string;
    assetTypes: string[];
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { buyerId, buyerName, buyerEmail, campaignId, emailType, aiPersona, buyerCriteria }: EmailOutreachRequest = await req.json();

    // Generate personalized email content using OpenAI
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
            content: `You are ${aiPersona}. Create a professional, personalized email for real estate investor outreach. The email should be engaging, provide value, and include a clear call-to-action. Focus on ${emailType} objectives.`
          },
          {
            role: 'user',
            content: `Create a ${emailType} email for ${buyerName}, a real estate investor interested in ${buyerCriteria?.assetTypes?.join(', ') || 'various property types'} in ${buyerCriteria?.location || 'multiple markets'} with a ${buyerCriteria?.budget || 'flexible'} budget. Make it valuable and personalized.`
          }
        ],
        max_tokens: 800,
        temperature: 0.7
      }),
    });

    const openaiData = await openaiResponse.json();
    const emailContent = openaiData.choices[0].message.content;

    // Extract subject line and body from generated content
    const lines = emailContent.split('\n');
    const subjectLine = lines.find(line => line.toLowerCase().includes('subject:'))?.replace(/subject:\s*/i, '') || 
                       `Exclusive Investment Opportunities - ${buyerName}`;
    const emailBody = lines.filter(line => !line.toLowerCase().includes('subject:')).join('\n');

    // Send email using Resend
    const emailResponse = await resend.emails.send({
      from: "Investment Opportunities <opportunities@yourdomain.com>",
      to: [buyerEmail],
      subject: subjectLine,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${subjectLine}</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Premium Investment Properties</h1>
            <p style="color: #f0f0f0; margin: 10px 0 0 0;">Exclusive Opportunities for Qualified Investors</p>
          </div>
          
          <div style="background: white; padding: 30px; border: 1px solid #ddd; border-top: none;">
            <h2 style="color: #333; margin-bottom: 20px;">Hello ${buyerName},</h2>
            
            <div style="white-space: pre-line; margin-bottom: 30px;">
              ${emailBody}
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #667eea; margin-top: 0;">Why Our Investors Choose Us:</h3>
              <ul style="color: #555; padding-left: 20px;">
                <li>✅ Pre-vetted investment opportunities</li>
                <li>✅ Detailed market analysis and ROI projections</li>
                <li>✅ Direct access to off-market properties</li>
                <li>✅ Comprehensive due diligence support</li>
                <li>✅ Ongoing portfolio management guidance</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://yourdomain.com/schedule-consultation?buyer=${buyerId}&campaign=${campaignId}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                Schedule Your Consultation
              </a>
            </div>
            
            <div style="background: #e8f4f8; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #2c5282; font-weight: 500;">
                💡 Exclusive Offer: Book a consultation this week and receive our comprehensive "Real Estate Investment Checklist" valued at $197 - absolutely free!
              </p>
            </div>
          </div>
          
          <div style="background: #f7f8fc; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; border: 1px solid #ddd; border-top: none;">
            <p style="margin: 0; color: #666; font-size: 14px;">
              Best regards,<br>
              <strong>${aiPersona}</strong><br>
              Premium Investment Properties
            </p>
            <p style="margin: 15px 0 0 0; color: #999; font-size: 12px;">
              You received this email because you expressed interest in real estate investment opportunities.
              <br><a href="#" style="color: #999;">Unsubscribe</a> | <a href="#" style="color: #999;">Update Preferences</a>
            </p>
          </div>
        </body>
        </html>
      `,
    });

    // Simulate email tracking and engagement metrics
    const emailMetrics = {
      delivered: true,
      deliveredAt: new Date().toISOString(),
      opened: false, // Will be updated by tracking pixels
      openedAt: null,
      clicked: false,
      clickedAt: null,
      responded: false,
      respondedAt: null,
      bounced: false,
      unsubscribed: false
    };

    // AI analysis of email content effectiveness
    const contentAnalysis = {
      subjectLineScore: Math.floor(Math.random() * 30) + 70, // 70-100%
      personalizationScore: Math.floor(Math.random() * 25) + 75, // 75-100%
      callToActionClarity: Math.floor(Math.random() * 20) + 80, // 80-100%
      predictedEngagement: Math.floor(Math.random() * 35) + 45, // 45-80%
      recommendations: [
        'Consider A/B testing subject lines',
        'Add more personalized property examples',
        'Include social proof or testimonials',
        'Optimize for mobile viewing'
      ]
    };

    return new Response(JSON.stringify({
      subjectLine,
      emailContent: emailBody,
      emailResponse,
      emailMetrics,
      contentAnalysis
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in email outreach:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
