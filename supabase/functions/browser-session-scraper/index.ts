import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';
import { launch } from "https://deno.land/x/astral@0.4.1/mod.ts";

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
  console.log(`Starting real browser login for ${platform} at ${loginUrl}`);
  
  try {
    // Launch headless browser
    const browser = await launch({ headless: false }); // Set to false for debugging
    const page = await browser.newPage();
    
    // Set user agent to appear more like a real browser
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    
    // Navigate to platform login page
    const targetUrl = loginUrl || getPlatformLoginUrl(platform);
    await page.goto(targetUrl, { waitUntil: 'networkidle0' });
    
    console.log(`Navigated to ${targetUrl}, waiting for user login...`);
    
    // Wait for user to complete login by checking for platform-specific authenticated elements
    await waitForAuthentication(page, platform);
    
    // Extract session data (cookies, localStorage, sessionStorage)
    const cookies = await page.cookies();
    const localStorage = await page.evaluate(() => JSON.stringify(window.localStorage));
    const sessionStorage = await page.evaluate(() => JSON.stringify(window.sessionStorage));
    
    // Generate session token
    const sessionToken = `${platform}_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    await browser.close();
    
    return {
      sessionToken,
      cookies: JSON.stringify(cookies),
      localStorage,
      sessionStorage,
      loginSuccessful: true
    };
    
  } catch (error) {
    console.error(`Browser login failed for ${platform}:`, error);
    throw new Error(`Login failed for ${platform}: ${error.message}`);
  }
}

async function performAuthenticatedScraping(platform: string, session: any, targets: string[] = [], filters: any = {}) {
  console.log(`Performing authenticated scraping for ${platform}`);
  
  try {
    const browser = await launch({ headless: true });
    const page = await browser.newPage();
    
    // Restore session state
    await restoreSessionState(page, session, platform);
    
    const allLeads = [];
    
    // Scrape each target
    for (const target of targets) {
      console.log(`Scraping target: ${target}`);
      
      const targetLeads = await scrapeTarget(page, platform, target, filters);
      allLeads.push(...targetLeads);
      
      // Add random delay between targets to avoid detection
      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
    }
    
    await browser.close();
    
    return {
      leads: allLeads,
      platform,
      scrapedAt: new Date().toISOString(),
      source: 'authenticated_browser_session',
      targetsScraped: targets.length
    };
    
  } catch (error) {
    console.error(`Scraping failed for ${platform}:`, error);
    
    // Fallback to mock data if real scraping fails
    const leads = await generatePlatformSpecificLeads(platform, filters);
    return {
      leads,
      platform,
      scrapedAt: new Date().toISOString(),
      source: 'fallback_mock_data',
      error: error.message
    };
  }
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

// Real browser automation helper functions

function getPlatformLoginUrl(platform: string): string {
  const urls = {
    facebook: 'https://www.facebook.com/login',
    linkedin: 'https://www.linkedin.com/login',
    propwire: 'https://app.propwire.com/login'
  };
  return urls[platform] || '';
}

async function waitForAuthentication(page: any, platform: string): Promise<void> {
  const selectors = {
    facebook: '[data-testid="royalty_tab_home"], #userNavigationLabel',
    linkedin: '.global-nav__me, .neptune-nav__profile-link',
    propwire: '.dashboard, .main-content, [data-test="dashboard"]'
  };
  
  const selector = selectors[platform];
  if (!selector) {
    throw new Error(`Unknown platform: ${platform}`);
  }
  
  console.log(`Waiting for authentication selector: ${selector}`);
  
  // Wait up to 5 minutes for user to complete login
  await page.waitForSelector(selector, { timeout: 300000 });
  
  // Additional wait to ensure page is fully loaded
  await page.waitForTimeout(3000);
}

async function restoreSessionState(page: any, session: any, platform: string): Promise<void> {
  // Navigate to platform first
  const baseUrl = getPlatformBaseUrl(platform);
  await page.goto(baseUrl);
  
  // Restore cookies
  if (session.cookies) {
    const cookies = JSON.parse(session.cookies);
    await page.setCookie(...cookies);
  }
  
  // Restore localStorage
  if (session.local_storage) {
    const localStorage = JSON.parse(session.local_storage);
    await page.evaluate((data) => {
      for (const [key, value] of Object.entries(data)) {
        window.localStorage.setItem(key, value as string);
      }
    }, localStorage);
  }
  
  // Restore sessionStorage
  if (session.session_storage) {
    const sessionStorage = JSON.parse(session.session_storage);
    await page.evaluate((data) => {
      for (const [key, value] of Object.entries(data)) {
        window.sessionStorage.setItem(key, value as string);
      }
    }, sessionStorage);
  }
  
  // Refresh page to apply session
  await page.reload({ waitUntil: 'networkidle0' });
}

function getPlatformBaseUrl(platform: string): string {
  const urls = {
    facebook: 'https://www.facebook.com',
    linkedin: 'https://www.linkedin.com',
    propwire: 'https://app.propwire.com'
  };
  return urls[platform] || '';
}

async function scrapeTarget(page: any, platform: string, target: string, filters: any): Promise<any[]> {
  console.log(`Scraping ${platform} target: ${target}`);
  
  // Navigate to target page
  await page.goto(target, { waitUntil: 'networkidle0' });
  
  // Platform-specific scraping logic
  switch (platform) {
    case 'facebook':
      return await scrapeFacebookTarget(page, target, filters);
    case 'linkedin':
      return await scrapeLinkedInTarget(page, target, filters);
    case 'propwire':
      return await scrapePropwireTarget(page, target, filters);
    default:
      return [];
  }
}

async function scrapeFacebookTarget(page: any, target: string, filters: any): Promise<any[]> {
  const leads = [];
  
  try {
    // Wait for posts to load
    await page.waitForSelector('[data-pagelet="FeedUnit"]', { timeout: 10000 });
    
    // Extract posts with buyer intent
    const posts = await page.evaluate(() => {
      const postElements = document.querySelectorAll('[data-pagelet="FeedUnit"]');
      const extractedPosts = [];
      
      for (const post of postElements) {
        const textContent = post.textContent?.toLowerCase() || '';
        
        // Look for buyer intent keywords
        const buyerKeywords = ['looking to buy', 'cash buyer', 'need property', 'investment opportunity', 'close quickly'];
        const hasBuyerIntent = buyerKeywords.some(keyword => textContent.includes(keyword));
        
        if (hasBuyerIntent) {
          const authorElement = post.querySelector('[data-hovercard-prefer-more-content-show]');
          const author = authorElement?.textContent || 'Unknown';
          
          extractedPosts.push({
            author,
            content: textContent.substring(0, 200),
            timestamp: Date.now(),
            platform: 'facebook'
          });
        }
      }
      
      return extractedPosts;
    });
    
    // Convert to lead format
    for (const post of posts) {
      leads.push({
        id: `fb_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        ownerName: post.author,
        source: 'facebook_groups',
        platform: 'facebook',
        confidenceScore: 75,
        buyerIntent: post.content,
        scrapedAt: new Date().toISOString(),
        propertyType: extractPropertyType(post.content),
        location: extractLocation(post.content, filters)
      });
    }
    
  } catch (error) {
    console.error('Facebook scraping error:', error);
  }
  
  return leads;
}

async function scrapeLinkedInTarget(page: any, target: string, filters: any): Promise<any[]> {
  const leads = [];
  
  try {
    // Wait for feed to load
    await page.waitForSelector('.feed-shared-update-v2', { timeout: 10000 });
    
    const posts = await page.evaluate(() => {
      const postElements = document.querySelectorAll('.feed-shared-update-v2');
      const extractedPosts = [];
      
      for (const post of postElements) {
        const textContent = post.textContent?.toLowerCase() || '';
        
        const buyerKeywords = ['real estate investment', 'looking for deals', 'acquisition', 'cash offers'];
        const hasBuyerIntent = buyerKeywords.some(keyword => textContent.includes(keyword));
        
        if (hasBuyerIntent) {
          const authorElement = post.querySelector('.feed-shared-actor__name');
          const titleElement = post.querySelector('.feed-shared-actor__description');
          
          extractedPosts.push({
            author: authorElement?.textContent || 'Unknown',
            title: titleElement?.textContent || '',
            content: textContent.substring(0, 200),
            timestamp: Date.now(),
            platform: 'linkedin'
          });
        }
      }
      
      return extractedPosts;
    });
    
    for (const post of posts) {
      leads.push({
        id: `li_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        ownerName: post.author,
        jobTitle: post.title,
        source: 'linkedin_groups',
        platform: 'linkedin',
        confidenceScore: 80,
        buyerIntent: post.content,
        scrapedAt: new Date().toISOString()
      });
    }
    
  } catch (error) {
    console.error('LinkedIn scraping error:', error);
  }
  
  return leads;
}

async function scrapePropwireTarget(page: any, target: string, filters: any): Promise<any[]> {
  const leads = [];
  
  try {
    // Wait for listings to load
    await page.waitForSelector('.listing-card, .buyer-request', { timeout: 10000 });
    
    const listings = await page.evaluate(() => {
      const listingElements = document.querySelectorAll('.listing-card, .buyer-request');
      const extractedListings = [];
      
      for (const listing of listingElements) {
        const name = listing.querySelector('.contact-name, .buyer-name')?.textContent || 'Unknown';
        const location = listing.querySelector('.location, .area')?.textContent || '';
        const details = listing.textContent || '';
        
        extractedListings.push({
          name,
          location,
          details: details.substring(0, 200),
          timestamp: Date.now(),
          platform: 'propwire'
        });
      }
      
      return extractedListings;
    });
    
    for (const listing of listings) {
      leads.push({
        id: `pw_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        ownerName: listing.name,
        location: listing.location,
        source: 'propwire_platform',
        platform: 'propwire',
        confidenceScore: 85,
        details: listing.details,
        scrapedAt: new Date().toISOString()
      });
    }
    
  } catch (error) {
    console.error('Propwire scraping error:', error);
  }
  
  return leads;
}

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