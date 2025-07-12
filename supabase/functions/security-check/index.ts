import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-forwarded-for, x-real-ip',
};

interface SecurityCheckRequest {
  endpoint: string;
  action?: string;
  maxRequests?: number;
  windowMinutes?: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client with service role for security operations
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get user authentication
    const authHeader = req.headers.get("Authorization");
    let userId = null;
    
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user } } = await supabaseClient.auth.getUser(token);
      userId = user?.id;
    }

    // Get client IP address
    const clientIP = req.headers.get('x-forwarded-for') || 
                    req.headers.get('x-real-ip') || 
                    'unknown';

    const userAgent = req.headers.get('user-agent') || 'unknown';

    // Parse request body
    const { endpoint, action, maxRequests = 100, windowMinutes = 60 }: SecurityCheckRequest = 
      await req.json();

    if (!endpoint) {
      return new Response(
        JSON.stringify({ error: 'Endpoint is required' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    // Use IP address as identifier if no user, otherwise use user ID
    const identifier = userId || clientIP;

    console.log(`Security check for ${identifier} on ${endpoint}`);

    // Check rate limit
    const { data: rateLimitPassed, error: rateLimitError } = await supabaseClient.rpc(
      'check_rate_limit',
      {
        p_identifier: identifier,
        p_endpoint: endpoint,
        p_max_requests: maxRequests,
        p_window_minutes: windowMinutes
      }
    );

    if (rateLimitError) {
      console.error('Rate limit check failed:', rateLimitError);
      // Log the error but allow the request (fail open)
      return new Response(
        JSON.stringify({ 
          allowed: true, 
          warning: 'Rate limit check failed',
          remaining: maxRequests,
          resetTime: new Date(Date.now() + windowMinutes * 60 * 1000).toISOString()
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    // Calculate reset time
    const now = new Date();
    const windowStart = new Date(now);
    windowStart.setMinutes(Math.floor(now.getMinutes() / windowMinutes) * windowMinutes, 0, 0);
    const resetTime = new Date(windowStart.getTime() + windowMinutes * 60 * 1000);

    if (!rateLimitPassed) {
      // Log rate limit exceeded event
      await supabaseClient.rpc('log_audit_event', {
        p_user_id: userId,
        p_admin_id: null,
        p_action: 'security.rate_limit.exceeded',
        p_resource_type: 'endpoint',
        p_resource_id: endpoint,
        p_details: JSON.stringify({
          endpoint,
          identifier,
          maxRequests,
          windowMinutes,
          clientIP,
          userAgent
        }),
        p_ip_address: clientIP,
        p_user_agent: userAgent
      });

      return new Response(
        JSON.stringify({ 
          allowed: false,
          error: 'Rate limit exceeded',
          remaining: 0,
          resetTime: resetTime.toISOString(),
          retryAfter: Math.ceil((resetTime.getTime() - now.getTime()) / 1000)
        }),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'Retry-After': Math.ceil((resetTime.getTime() - now.getTime()) / 1000).toString()
          },
          status: 429 
        }
      );
    }

    // If action is provided, log it for audit purposes
    if (action && userId) {
      await supabaseClient.rpc('log_audit_event', {
        p_user_id: userId,
        p_admin_id: null,
        p_action: action,
        p_resource_type: 'endpoint',
        p_resource_id: endpoint,
        p_details: JSON.stringify({
          endpoint,
          clientIP,
          userAgent,
          timestamp: new Date().toISOString()
        }),
        p_ip_address: clientIP,
        p_user_agent: userAgent
      });

      // Check for suspicious activity patterns
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const { data: recentLogs } = await supabaseClient
        .from('audit_logs')
        .select('id')
        .eq('user_id', userId)
        .eq('action', action)
        .gte('created_at', fiveMinutesAgo.toISOString());

      // Flag suspicious activity if more than 20 identical actions in 5 minutes
      if (recentLogs && recentLogs.length > 20) {
        await supabaseClient.rpc('log_audit_event', {
          p_user_id: userId,
          p_admin_id: null,
          p_action: 'security.suspicious.activity',
          p_resource_type: 'user_behavior',
          p_resource_id: userId,
          p_details: JSON.stringify({
            action,
            count: recentLogs.length,
            timeWindow: '5_minutes',
            clientIP,
            userAgent,
            severity: 'medium'
          }),
          p_ip_address: clientIP,
          p_user_agent: userAgent
        });

        console.warn(`Suspicious activity detected for user ${userId}: ${recentLogs.length} ${action} actions in 5 minutes`);
      }
    }

    // Return success with rate limit info
    return new Response(
      JSON.stringify({ 
        allowed: true,
        remaining: maxRequests - 1,
        resetTime: resetTime.toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Security check error:', error);
    
    // Return error but allow request (fail open for availability)
    return new Response(
      JSON.stringify({ 
        allowed: true,
        error: 'Security check failed',
        warning: 'Security validation unavailable'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  }
});