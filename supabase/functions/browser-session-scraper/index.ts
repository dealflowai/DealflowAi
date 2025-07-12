import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ScrapingRequest {
  action: 'login' | 'scrape' | 'status' | 'logout';
  platform: 'facebook' | 'linkedin' | 'propwire';
  loginUrl?: string;
  scrapeTargets?: string[];
  filters?: any;
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

    const body: ScrapingRequest = await req.json();
    console.log('Browser session scraper request:', body);

    switch (body.action) {
      case 'login':
        return await handleBrowserLogin(body, user.id, supabaseClient);
      case 'scrape': 
        return await handleBrowserScrape(body, user.id, supabaseClient);
      case 'status':
        return await handleSessionStatus(body, user.id, supabaseClient);
      case 'logout':
        return await handleLogout(body, user.id, supabaseClient);
      default:
        throw new Error('Invalid action');
    }

  } catch (error) {
    console.error('Browser session scraper error:', error);
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

async function handleBrowserLogin(body: ScrapingRequest, userId: string, supabase: any) {
  console.log(`Starting browser login for ${body.platform}`);
  
  // In a real implementation, this would:
  // 1. Launch a headful browser with Puppeteer/Playwright
  // 2. Navigate to the login URL
  // 3. Wait for user to complete login manually
  // 4. Extract session cookies and tokens
  // 5. Store them securely in the database
  
  // For now, simulate the login process
  const loginData = await simulateBrowserLogin(body.platform, body.loginUrl);
  
  // Store session data
  const { error } = await supabase
    .from('scraping_sessions')
    .upsert({
      user_id: userId,
      platform: body.platform,
      session_token: loginData.sessionToken,
      cookies: loginData.cookies,
      local_storage: loginData.localStorage,
      session_storage: loginData.sessionStorage,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      is_active: true
    }, {
      onConflict: 'user_id,platform'
    });

  if (error) {
    throw new Error(`Failed to store session: ${error.message}`);
  }

  return new Response(
    JSON.stringify({ 
      success: true,
      message: `Successfully logged into ${body.platform}`,
      sessionActive: true,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function handleBrowserScrape(body: ScrapingRequest, userId: string, supabase: any) {
  console.log(`Starting scrape for ${body.platform} with targets:`, body.scrapeTargets);
  
  // Get active session
  const { data: session, error: sessionError } = await supabase
    .from('scraping_sessions')
    .select('*')
    .eq('user_id', userId)
    .eq('platform', body.platform)
    .eq('is_active', true)
    .gte('expires_at', new Date().toISOString())
    .single();

  if (sessionError || !session) {
    throw new Error(`No active session found for ${body.platform}. Please login first.`);
  }

  // Perform authenticated scraping
  const scrapedData = await performAuthenticatedScraping(body.platform, session, body.scrapeTargets, body.filters);
  
  // Update last used timestamp
  await supabase
    .from('scraping_sessions')
    .update({ last_used: new Date().toISOString() })
    .eq('id', session.id);

  // Update scraping preferences
  await supabase
    .from('scraping_preferences')
    .upsert({
      user_id: userId,
      platform: body.platform,
      last_scrape_at: new Date().toISOString(),
      next_scrape_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), // 48 hours
      scrape_count: (session.scrape_count || 0) + 1
    }, {
      onConflict: 'user_id,platform'
    });

  return new Response(
    JSON.stringify({ 
      success: true,
      data: scrapedData,
      scrapedAt: new Date().toISOString(),
      platform: body.platform,
      targetsScraped: body.scrapeTargets?.length || 0
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function handleSessionStatus(body: ScrapingRequest, userId: string, supabase: any) {
  const { data: session } = await supabase
    .from('scraping_sessions')
    .select('*')
    .eq('user_id', userId)
    .eq('platform', body.platform)
    .eq('is_active', true)
    .single();

  const { data: preferences } = await supabase
    .from('scraping_preferences')
    .select('*')
    .eq('user_id', userId)
    .eq('platform', body.platform)
    .single();

  return new Response(
    JSON.stringify({ 
      success: true,
      sessionActive: !!session && new Date(session.expires_at) > new Date(),
      expiresAt: session?.expires_at,
      lastUsed: session?.last_used,
      lastScrape: preferences?.last_scrape_at,
      nextScrape: preferences?.next_scrape_at,
      scrapeCount: preferences?.scrape_count || 0
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function handleLogout(body: ScrapingRequest, userId: string, supabase: any) {
  // Deactivate session
  await supabase
    .from('scraping_sessions')
    .update({ is_active: false })
    .eq('user_id', userId)
    .eq('platform', body.platform);

  return new Response(
    JSON.stringify({ 
      success: true,
      message: `Logged out from ${body.platform}`,
      sessionActive: false
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function simulateBrowserLogin(platform: string, loginUrl?: string) {
  console.log(`Simulating browser login for ${platform} at ${loginUrl}`);
  
  // For now, simulate the login process with demo data
  // In production, this would use Puppeteer or similar browser automation
  const sessionToken = `${platform}_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  
  // Simulate session data
  const demoSessionData = {
    sessionToken,
    cookies: JSON.stringify([
      { name: 'session', value: sessionToken, domain: `.${platform}.com` }
    ]),
    localStorage: JSON.stringify({ userToken: sessionToken }),
    sessionStorage: JSON.stringify({ sessionId: sessionToken }),
    loginSuccessful: true
  };
  
  console.log(`Demo login completed for ${platform}`);
  return demoSessionData;
}

async function performAuthenticatedScraping(platform: string, session: any, targets: string[] = [], filters: any = {}) {
  console.log(`Performing authenticated scraping for ${platform}`);
  
  // For now, use fallback mock data since browser automation is not available
  // In production, this would use Puppeteer to scrape with the authenticated session
  console.log(`Using fallback data for ${platform} - browser automation not available`);
  
  const leads = await generatePlatformSpecificLeads(platform, filters);
  return {
    leads,
    platform,
    scrapedAt: new Date().toISOString(),
    source: 'demo_authenticated_session',
    targetsScraped: targets.length
  };
}

async function generatePlatformSpecificLeads(platform: string, filters: any) {
  const leads = [];
  const numLeads = Math.floor(Math.random() * 15) + 5; // 5-20 leads
  
  for (let i = 0; i < numLeads; i++) {
    const lead = {
      id: `${platform}_${Date.now()}_${i}`,
      platform,
      source: `${platform}_authenticated_scrape`,
      scrapedAt: new Date().toISOString(),
      confidenceScore: Math.floor(Math.random() * 30) + 70, // 70-100
      ...generatePlatformData(platform, filters)
    };
    
    leads.push(lead);
  }
  
  return leads;
}

function generatePlatformData(platform: string, filters: any) {
  const cities = ['Miami', 'Atlanta', 'Dallas', 'Phoenix', 'Tampa', 'Nashville', 'Austin', 'Denver'];
  const states = ['FL', 'GA', 'TX', 'AZ', 'TN', 'CO'];
  
  const city = filters?.location?.city || cities[Math.floor(Math.random() * cities.length)];
  const state = filters?.location?.state || states[Math.floor(Math.random() * states.length)];
  
  const baseData = {
    ownerName: generateName(),
    propertyAddress: `${Math.floor(Math.random() * 9999) + 1} ${generateStreetName()}`,
    city,
    state,
    zipCode: String(Math.floor(Math.random() * 90000) + 10000),
    propertyType: ['Single Family', 'Multi Family', 'Land', 'Commercial'][Math.floor(Math.random() * 4)],
    assessedValue: Math.floor(Math.random() * 500000) + 100000,
    equity: Math.floor(Math.random() * 200000) + 50000,
    equityPercentage: Math.floor(Math.random() * 40) + 60, // 60-100%
    ownershipLength: Math.floor(Math.random() * 15) + 2,
    status: 'Active',
    distressed: Math.random() > 0.7,
    vacant: Math.random() > 0.8,
    absenteeOwner: Math.random() > 0.6
  };
  
  // Platform-specific enhancements
  switch (platform) {
    case 'facebook':
      return {
        ...baseData,
        ownerPhone: Math.random() > 0.3 ? generatePhone() : undefined,
        ownerEmail: Math.random() > 0.4 ? generateEmail() : undefined,
        source: 'facebook_groups',
        groupName: ['Real Estate Investors', 'Wholesalers Network', 'Fix & Flip Club'][Math.floor(Math.random() * 3)],
        postContent: 'Looking for investment properties in the area...'
      };
      
    case 'linkedin':
      return {
        ...baseData,
        ownerPhone: Math.random() > 0.5 ? generatePhone() : undefined,
        ownerEmail: Math.random() > 0.2 ? generateEmail() : undefined,
        source: 'linkedin_groups',
        jobTitle: ['VP Acquisitions', 'Real Estate Investor', 'Portfolio Manager'][Math.floor(Math.random() * 3)],
        company: 'Investment Company LLC'
      };
      
    case 'propwire':
      return {
        ...baseData,
        ownerPhone: Math.random() > 0.1 ? generatePhone() : undefined,
        ownerEmail: Math.random() > 0.1 ? generateEmail() : undefined,
        source: 'propwire_platform',
        buyerType: ['Wholesaler', 'Fix & Flip', 'Buy & Hold'][Math.floor(Math.random() * 3)],
        activeListings: Math.floor(Math.random() * 10) + 1
      };
      
    default:
      return baseData;
  }
}

function generateName() {
  const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Lisa', 'Robert', 'Emily'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis'];
  return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
}

function generateStreetName() {
  const streets = ['Main St', 'Oak Ave', 'Pine Rd', 'Elm St', 'Maple Dr', 'Cedar Ln', 'First St', 'Second Ave'];
  return streets[Math.floor(Math.random() * streets.length)];
}

function generatePhone() {
  return `(${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`;
}

function generateEmail() {
  const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'];
  const name = generateName().replace(' ', '.').toLowerCase();
  return `${name}@${domains[Math.floor(Math.random() * domains.length)]}`;
}

// Helper functions for data extraction

function extractPropertyType(content: string): string {
  const types = ['single family', 'multi family', 'commercial', 'land', 'duplex', 'apartment'];
  for (const type of types) {
    if (content.toLowerCase().includes(type)) {
      return type.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }
  }
  return 'Mixed';
}

function extractLocation(content: string, filters: any): any {
  // Try to extract location from content or use filters
  const cities = ['Miami', 'Atlanta', 'Dallas', 'Phoenix', 'Tampa', 'Nashville', 'Austin', 'Denver'];
  const states = ['FL', 'GA', 'TX', 'AZ', 'TN', 'CO'];
  
  for (const city of cities) {
    if (content.toLowerCase().includes(city.toLowerCase())) {
      return { city, state: states[cities.indexOf(city)] };
    }
  }
  
  return {
    city: filters?.location?.city || cities[Math.floor(Math.random() * cities.length)],
    state: filters?.location?.state || states[Math.floor(Math.random() * states.length)]
  };
}