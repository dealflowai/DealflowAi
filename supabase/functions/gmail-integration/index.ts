import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GmailRequest {
  action: 'auth' | 'search' | 'status' | 'revoke';
  searchQuery?: string;
  keywords?: string[];
  maxResults?: number;
  authCode?: string;
  filters?: {
    dateRange?: 'week' | 'month' | 'quarter' | 'year';
    senderDomains?: string[];
    excludeSpam?: boolean;
    minConfidence?: number;
  };
}

interface EmailLead {
  id: string;
  messageId: string;
  subject: string;
  sender: {
    name?: string;
    email: string;
  };
  content: string;
  date: string;
  buyerSignals: string[];
  extractedInfo: {
    budget?: { min?: number; max?: number };
    location?: string;
    propertyTypes?: string[];
    timeline?: string;
    contactInfo?: {
      phone?: string;
      email: string;
    };
  };
  confidenceScore: number;
  buyerType?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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

    const body: GmailRequest = await req.json();
    console.log('Gmail integration request:', { action: body.action, userId: user.id });

    switch (body.action) {
      case 'auth':
        return await handleGmailAuth(body, user.id, supabaseClient);
      case 'search':
        return await handleGmailSearch(body, user.id, supabaseClient);
      case 'status':
        return await handleAuthStatus(user.id, supabaseClient);
      case 'revoke':
        return await handleRevokeAuth(user.id, supabaseClient);
      default:
        throw new Error('Invalid action');
    }

  } catch (error) {
    console.error('Gmail integration error:', error);
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

async function handleGmailAuth(body: GmailRequest, userId: string, supabase: any) {
  console.log('Starting Gmail OAuth flow');
  
  const clientId = Deno.env.get('GOOGLE_CLIENT_ID');
  const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET');
  const redirectUri = `${Deno.env.get('SUPABASE_URL')}/functions/v1/gmail-integration`;

  if (!clientId || !clientSecret) {
    throw new Error('Google OAuth credentials not configured');
  }

  if (body.authCode) {
    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code: body.authCode,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange authorization code for tokens');
    }

    const tokens = await tokenResponse.json();
    
    // Store tokens securely
    const { error } = await supabase
      .from('gmail_tokens')
      .upsert({
        user_id: userId,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
        scope: tokens.scope,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    if (error) {
      throw new Error(`Failed to store Gmail tokens: ${error.message}`);
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Gmail authentication successful',
        authenticated: true
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } else {
    // Generate authorization URL
    const scopes = [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile'
    ];

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `scope=${encodeURIComponent(scopes.join(' '))}&` +
      `response_type=code&` +
      `access_type=offline&` +
      `prompt=consent&` +
      `state=${userId}`;

    return new Response(
      JSON.stringify({ 
        success: true,
        authUrl,
        message: 'Visit the auth URL to grant Gmail access'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function handleGmailSearch(body: GmailRequest, userId: string, supabase: any) {
  console.log('Starting Gmail buyer search');
  
  // Get stored tokens
  const { data: tokenData, error: tokenError } = await supabase
    .from('gmail_tokens')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (tokenError || !tokenData) {
    throw new Error('Gmail not authenticated. Please authenticate first.');
  }

  // Check if token needs refresh
  const accessToken = await refreshTokenIfNeeded(tokenData, supabase);
  
  // Default buyer-related keywords
  const defaultKeywords = [
    'cash buyer', 'real estate investor', 'looking to buy property',
    'quick close', 'off market', 'wholesale deal', 'investment property',
    'buy properties', 'real estate investment', 'property acquisition',
    'cash offer', 'fast closing', 'investor seeking', 'buy houses'
  ];

  const keywords = body.keywords || defaultKeywords;
  const maxResults = body.maxResults || 50;
  
  // Build Gmail search query
  const searchQuery = body.searchQuery || buildSearchQuery(keywords, body.filters);
  
  console.log('Gmail search query:', searchQuery);
  
  // Search Gmail
  const emails = await searchGmailMessages(accessToken, searchQuery, maxResults);
  
  // Analyze emails for buyer intent
  const qualifiedLeads = await analyzeEmailsForBuyerIntent(emails, accessToken, userId, supabase);
  
  return new Response(
    JSON.stringify({ 
      success: true,
      data: {
        leads: qualifiedLeads,
        totalEmails: emails.length,
        qualifiedLeads: qualifiedLeads.filter(lead => lead.confidenceScore >= 70).length,
        searchQuery,
        searchedAt: new Date().toISOString()
      }
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function handleAuthStatus(userId: string, supabase: any) {
  const { data: tokenData } = await supabase
    .from('gmail_tokens')
    .select('expires_at, scope, created_at')
    .eq('user_id', userId)
    .single();

  const isAuthenticated = tokenData && new Date(tokenData.expires_at) > new Date();
  
  return new Response(
    JSON.stringify({ 
      success: true,
      authenticated: isAuthenticated,
      expiresAt: tokenData?.expires_at,
      scope: tokenData?.scope,
      authenticatedAt: tokenData?.created_at,
      connected: isAuthenticated,
      connectedAt: tokenData?.created_at
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function handleRevokeAuth(userId: string, supabase: any) {
  await supabase
    .from('gmail_tokens')
    .delete()
    .eq('user_id', userId);

  return new Response(
    JSON.stringify({ 
      success: true,
      message: 'Gmail authentication revoked'
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function refreshTokenIfNeeded(tokenData: any, supabase: any) {
  if (new Date(tokenData.expires_at) > new Date(Date.now() + 5 * 60 * 1000)) {
    return tokenData.access_token; // Token still valid for at least 5 minutes
  }

  console.log('Refreshing Gmail access token');
  
  const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: Deno.env.get('GOOGLE_CLIENT_ID')!,
      client_secret: Deno.env.get('GOOGLE_CLIENT_SECRET')!,
      refresh_token: tokenData.refresh_token,
      grant_type: 'refresh_token',
    }),
  });

  if (!refreshResponse.ok) {
    throw new Error('Failed to refresh Gmail access token');
  }

  const newTokens = await refreshResponse.json();
  
  // Update stored tokens
  await supabase
    .from('gmail_tokens')
    .update({
      access_token: newTokens.access_token,
      expires_at: new Date(Date.now() + newTokens.expires_in * 1000).toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('user_id', tokenData.user_id);

  return newTokens.access_token;
}

function buildSearchQuery(keywords: string[], filters?: GmailRequest['filters']) {
  let query = keywords.map(k => `"${k}"`).join(' OR ');
  
  if (filters?.dateRange) {
    const dateMap = {
      week: '7d',
      month: '1m',
      quarter: '3m', 
      year: '1y'
    };
    query += ` newer_than:${dateMap[filters.dateRange]}`;
  }
  
  if (filters?.senderDomains) {
    const domainQueries = filters.senderDomains.map(domain => `from:${domain}`).join(' OR ');
    query += ` (${domainQueries})`;
  }
  
  if (filters?.excludeSpam !== false) {
    query += ' -in:spam -in:trash';
  }
  
  return query;
}

async function searchGmailMessages(accessToken: string, query: string, maxResults: number) {
  const searchUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}&maxResults=${maxResults}`;
  
  const response = await fetch(searchUrl, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Gmail search failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.messages || [];
}

async function analyzeEmailsForBuyerIntent(messages: any[], accessToken: string, userId: string, supabase: any) {
  const leads: EmailLead[] = [];
  
  for (const message of messages) {
    try {
      // Get full message content
      const emailContent = await getGmailMessage(accessToken, message.id);
      
      // Call AI buyer detection
      const analysis = await analyzeEmailWithAI(emailContent, userId, supabase);
      
      if (analysis.isBuyer && analysis.confidenceScore >= 50) {
        leads.push({
          id: `gmail_${message.id}`,
          messageId: message.id,
          subject: emailContent.subject,
          sender: emailContent.sender,
          content: emailContent.content,
          date: emailContent.date,
          buyerSignals: analysis.signals,
          extractedInfo: analysis.extractedInfo,
          confidenceScore: analysis.confidenceScore,
          buyerType: analysis.buyerType
        });
      }
    } catch (error) {
      console.error(`Error analyzing email ${message.id}:`, error);
    }
  }
  
  return leads;
}

async function getGmailMessage(accessToken: string, messageId: string) {
  const response = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to get Gmail message: ${response.status}`);
  }

  const message = await response.json();
  
  // Extract email content
  const headers = message.payload.headers;
  const subject = headers.find((h: any) => h.name === 'Subject')?.value || '';
  const from = headers.find((h: any) => h.name === 'From')?.value || '';
  const date = headers.find((h: any) => h.name === 'Date')?.value || '';
  
  // Parse sender info
  const senderMatch = from.match(/^(.+?)\s*<(.+?)>$/) || [null, '', from];
  const sender = {
    name: senderMatch[1]?.trim(),
    email: senderMatch[2]?.trim() || from
  };
  
  // Extract body content
  let content = '';
  if (message.payload.body?.data) {
    content = atob(message.payload.body.data.replace(/-/g, '+').replace(/_/g, '/'));
  } else if (message.payload.parts) {
    for (const part of message.payload.parts) {
      if (part.mimeType === 'text/plain' && part.body?.data) {
        content += atob(part.body.data.replace(/-/g, '+').replace(/_/g, '/'));
      }
    }
  }
  
  return {
    subject,
    sender,
    content: content.substring(0, 2000), // Limit content length
    date
  };
}

async function analyzeEmailWithAI(emailContent: any, userId: string, supabase: any) {
  const aiDetectionUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/ai-buyer-detection`;
  
  const response = await fetch(aiDetectionUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      content: `Subject: ${emailContent.subject}\n\nFrom: ${emailContent.sender.name} <${emailContent.sender.email}>\n\n${emailContent.content}`,
      contentType: 'message',
      platform: 'gmail'
    })
  });
  
  if (!response.ok) {
    throw new Error(`AI analysis failed: ${response.status}`);
  }
  
  const result = await response.json();
  return result.analysis;
}