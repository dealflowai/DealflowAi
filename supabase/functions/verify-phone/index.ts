import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PhoneVerificationRequest {
  action: 'send' | 'verify'
  phone: string
  code?: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { action, phone, code }: PhoneVerificationRequest = await req.json()
    
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the user from the JWT token
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Authorization header is required')
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      throw new Error('Invalid authentication token')
    }

    if (action === 'send') {
      // Generate a 6-digit verification code
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
      
      // Store verification code in database with expiration (5 minutes)
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes from now
      
      const { error: storeError } = await supabase
        .from('phone_verifications')
        .upsert({
          user_id: user.id,
          phone_number: phone,
          verification_code: verificationCode,
          expires_at: expiresAt.toISOString(),
          verified: false
        })

      if (storeError) {
        console.error('Error storing verification code:', storeError)
        throw new Error('Failed to store verification code')
      }

      // Send SMS using Twilio
      const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID')
      const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN')
      const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER')

      if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
        throw new Error('Twilio credentials not configured')
      }

      const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`
      
      const formData = new URLSearchParams()
      formData.append('From', twilioPhoneNumber)
      formData.append('To', phone)
      formData.append('Body', `Your Dealflow AI verification code is: ${verificationCode}`)

      const twilioResponse = await fetch(twilioUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(`${twilioAccountSid}:${twilioAuthToken}`)}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData
      })

      if (!twilioResponse.ok) {
        const error = await twilioResponse.text()
        console.error('Twilio error:', error)
        throw new Error('Failed to send SMS')
      }

      console.log(`Verification code sent to ${phone}`)
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Verification code sent successfully' 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    } 
    
    else if (action === 'verify') {
      if (!code) {
        throw new Error('Verification code is required')
      }

      // Check verification code
      const { data: verification, error: verifyError } = await supabase
        .from('phone_verifications')
        .select('*')
        .eq('user_id', user.id)
        .eq('phone_number', phone)
        .eq('verification_code', code)
        .eq('verified', false)
        .gte('expires_at', new Date().toISOString())
        .single()

      if (verifyError || !verification) {
        throw new Error('Invalid or expired verification code')
      }

      // Mark as verified
      const { error: updateError } = await supabase
        .from('phone_verifications')
        .update({ verified: true })
        .eq('id', verification.id)

      if (updateError) {
        console.error('Error updating verification status:', updateError)
        throw new Error('Failed to update verification status')
      }

      console.log(`Phone ${phone} verified successfully for user ${user.id}`)

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Phone number verified successfully' 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    else {
      throw new Error('Invalid action. Must be "send" or "verify"')
    }

  } catch (error) {
    console.error('Phone verification error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})