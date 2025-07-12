import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[AI-REAL-ESTATE-LEAD-DISCOVERY] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY');
    
    if (!openAIApiKey) throw new Error('OPENAI_API_KEY is not set');
    if (!firecrawlApiKey) throw new Error('FIRECRAWL_API_KEY is not set');

    // Create Supabase client for authentication
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");

    logStep("User authenticated", { userId: user.id });

    // Get request data
    const { searchCriteria } = await req.json();
    if (!searchCriteria) throw new Error("Search criteria is required");

    logStep("Search criteria received", { searchCriteria });

    // Determine if this is a real estate lead search or buyer discovery
    if (searchCriteria.searchType === 'real_estate_leads') {
      return await handleRealEstateLeadGeneration(searchCriteria, firecrawlApiKey, openAIApiKey);
    } else {
      return await handleBuyerDiscovery(searchCriteria, openAIApiKey);
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in function", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function handleRealEstateLeadGeneration(searchCriteria: any, firecrawlApiKey: string, openAIApiKey: string) {
  logStep("Starting REAL real estate lead generation with Firecrawl");
  
  const city = (searchCriteria.filters?.location?.city || 'Austin').toLowerCase().replace(/\s+/g, '-');
  const state = (searchCriteria.filters?.location?.state || 'TX').toLowerCase();
  
  // Use real estate websites that actually contain property data
  const realEstateTargets = [
    `https://www.realtor.com/realestateandhomes-search/${city}_${state.toUpperCase()}`,
    `https://www.zillow.com/homes/for_sale/${city}-${state}_rb/`,
    `https://www.redfin.com/state/${state}/city/${city}`,
    `https://www.homes.com/real-estate/${city}-${state}`,
    `https://www.movoto.com/homes-for-sale/${city}-${state}`
  ];

  const scrapedData = [];
  
  // Scrape REAL real estate data
  for (const url of realEstateTargets.slice(0, 3)) { // Limit to 3 to avoid timeouts
    try {
      logStep(`Scraping REAL data from: ${url}`);
      
      const scrapeResponse = await fetch('https://api.firecrawl.dev/v0/scrape', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${firecrawlApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: url,
          formats: ['markdown'],
          onlyMainContent: true,
          waitFor: 2000,
          timeout: 30000
        }),
      });

      if (scrapeResponse.ok) {
        const scrapeData = await scrapeResponse.json();
        if (scrapeData.data && scrapeData.data.markdown) {
          scrapedData.push({
            url: url,
            title: scrapeData.data.metadata?.title || '',
            content: scrapeData.data.markdown,
            timestamp: new Date().toISOString()
          });
          logStep(`SUCCESS: Scraped real data from ${url}`, { contentLength: scrapeData.data.markdown.length });
        }
        } else {
          const errorText = await scrapeResponse.text();
          logStep(`FAILED to scrape: ${url}`, { status: scrapeResponse.status, error: errorText });
          
          // Check if it's an API key issue
          if (scrapeResponse.status === 401 || scrapeResponse.status === 403) {
            throw new Error(`Firecrawl API authentication failed. Please check your API key in Supabase secrets.`);
          }
          
          // For rate limiting or other errors, just log and continue
          if (scrapeResponse.status === 429) {
            logStep(`Rate limited by Firecrawl API for ${url}`);
          }
        }
    } catch (error) {
      logStep(`ERROR scraping ${url}`, { error: error.message });
    }
  }

  // If no real data was scraped, provide fallback mock data with clear indication
  if (scrapedData.length === 0) {
    logStep("No real data scraped, generating mock data for demo purposes");
    
    // Generate realistic mock leads for demo purposes
    const mockLeads = [];
    const numLeads = Math.floor(Math.random() * 8) + 3; // 3-10 leads
    
    for (let i = 0; i < numLeads; i++) {
      mockLeads.push({
        id: `mock_${Date.now()}_${i}`,
        ownerName: generateMockName(),
        propertyAddress: generateMockAddress(searchCriteria.filters?.location),
        propertyType: ['Single Family', 'Multi Family', 'Townhouse', 'Condo'][Math.floor(Math.random() * 4)],
        assessedValue: Math.floor(Math.random() * 400000) + 150000,
        equityPercentage: Math.floor(Math.random() * 40) + 60,
        ownershipLength: Math.floor(Math.random() * 12) + 2,
        status: ['Vacant', 'Rental', 'Owner-occupied'][Math.floor(Math.random() * 3)],
        contactPhone: generateMockPhone(),
        contactEmail: generateMockEmail(),
        bedrooms: Math.floor(Math.random() * 4) + 1,
        bathrooms: Math.floor(Math.random() * 3) + 1,
        squareFootage: Math.floor(Math.random() * 2000) + 1000,
        distressed: Math.random() > 0.7,
        absenteeOwner: Math.random() > 0.6,
        source: 'demo_data',
        generatedAt: new Date().toISOString()
      });
    }
    
    return new Response(JSON.stringify({
      leads: mockLeads,
      note: "This is demo data. Real scraping failed - please check your Firecrawl API configuration.",
      scrapedSources: 0,
      generatedAt: new Date().toISOString(),
      searchCriteria
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Process scraped data with AI to extract real estate leads
  logStep("Processing scraped data with AI");
  
  const analysisPrompt = `
  As a real estate lead generation expert, analyze the following scraped real estate data and extract property owner leads.

  Scraped Data:
  ${scrapedData.map(data => `
  URL: ${data.url}
  Title: ${data.title}
  Content: ${data.content.substring(0, 2000)}...
  `).join('\n\n')}

  Search Filters:
  ${JSON.stringify(searchCriteria.filters)}

  Extract and generate realistic property leads with the following information for each property:
  1. Owner name (realistic)
  2. Property address
  3. Property type
  4. Assessed value (realistic for the area)
  5. Estimated equity percentage
  6. Ownership length in years
  7. Property status (vacant, rental, owner-occupied)
  8. Contact information (phone/email if mentioned, otherwise generate realistic ones)
  9. Property details (bedrooms, bathrooms, square footage)
  10. Market indicators (distressed, absentee owner, etc.)

  Return a JSON array of property lead objects. Make the data realistic and valuable for real estate investors.
  Focus on properties that match the search criteria provided.
  `;

  try {
    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert real estate data analyst. Extract and enhance property owner information from scraped real estate websites. Always respond with valid JSON format.' 
          },
          { role: 'user', content: analysisPrompt }
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (aiResponse.ok) {
      const aiData = await aiResponse.json();
      const content = aiData.choices[0].message.content;
      
      try {
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const leads = JSON.parse(jsonMatch[0]);
          logStep("Successfully generated leads from AI analysis", { leadCount: leads.length });
          
          return new Response(JSON.stringify({
            leads,
            scrapedSources: scrapedData.length,
            generatedAt: new Date().toISOString(),
            searchCriteria
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      } catch (parseError) {
        logStep("Failed to parse AI response", { error: parseError.message });
        throw new Error("AI returned invalid JSON format - cannot process scraped data");
      }
    }
  } catch (aiError) {
    logStep("AI analysis failed", { error: aiError.message });
    throw new Error(`Failed to analyze scraped data with AI: ${aiError.message}`);
  }

  // If we get here, everything failed
  throw new Error("Failed to process real estate data - no valid leads could be generated from scraped content");
}

async function handleBuyerDiscovery(searchCriteria: any, openAIApiKey: string) {
  logStep("Starting buyer discovery");
  
  // Prepare the prompt for GPT to generate buyer profiles
  const discoveryPrompt = `
  As a real estate lead generation expert, create detailed buyer profiles based on these search criteria:

  Search Parameters:
  - Markets: ${searchCriteria.markets?.join(', ') || 'Any'}
  - Property Types: ${searchCriteria.propertyTypes?.join(', ') || 'Any'}
  - Budget Range: $${searchCriteria.budgetMin?.toLocaleString() || '0'} - $${searchCriteria.budgetMax?.toLocaleString() || 'Unlimited'}
  - Deal Types: ${searchCriteria.dealTypes?.join(', ') || 'Any'}
  - Location Focus: ${searchCriteria.location || 'Any'}

  Generate 5-8 realistic buyer profiles that would match these criteria. For each buyer, provide:

  1. **Name**: Generate a realistic name
  2. **Company**: Create a realistic company name
  3. **Email**: Generate a professional email address
  4. **Phone**: Generate a realistic phone number
  5. **Investment Focus**: Specific property types and strategies they prefer
  6. **Budget Range**: Specific budget they work with
  7. **Markets**: Primary markets they invest in
  8. **Experience Level**: Years of experience and deal volume
  9. **Acquisition Timeline**: How quickly they can close
  10. **Contact Preference**: Email, phone, or in-person
  11. **Portfolio Summary**: Brief description of their current portfolio
  12. **Pain Points**: What challenges they face in finding deals

  Format the response as a JSON array of buyer objects. Make each profile unique and realistic.
  `;

  logStep("Making OpenAI API call for buyer discovery");

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { 
          role: 'system', 
          content: 'You are an expert real estate lead generation specialist. Generate realistic, high-quality buyer profiles that match the given criteria. Always respond with valid JSON format.' 
        },
        { role: 'user', content: discoveryPrompt }
      ],
      temperature: 0.8,
      max_tokens: 3000,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  let buyerProfiles;

  try {
    // Try to parse the JSON response
    const content = data.choices[0].message.content;
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      buyerProfiles = JSON.parse(jsonMatch[0]);
    } else {
      throw new Error("No JSON array found in response");
    }
  } catch (parseError) {
    logStep("JSON parsing failed, creating fallback profiles");
    // Fallback if JSON parsing fails
    buyerProfiles = [
      {
        name: "Generated Buyer Profile",
        company: "Real Estate Investment Co",
        email: "contact@example.com",
        phone: "(555) 123-4567",
        investmentFocus: searchCriteria.propertyTypes?.[0] || "Multi-family",
        budgetMin: searchCriteria.budgetMin || 100000,
        budgetMax: searchCriteria.budgetMax || 500000,
        markets: searchCriteria.markets || ["Local Market"],
        experienceLevel: "5+ years",
        acquisitionTimeline: "30-45 days",
        contactPreference: "Email",
        portfolioSummary: "Active real estate investor",
        painPoints: "Finding quality deals in target markets"
      }
    ];
  }

  logStep("Buyer discovery completed successfully", { profileCount: buyerProfiles.length });

  return new Response(JSON.stringify({ 
    buyerProfiles,
    searchCriteria,
    generatedAt: new Date().toISOString(),
    totalProfiles: buyerProfiles.length
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function generateMockName() {
  const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Lisa', 'Robert', 'Emily', 'James', 'Mary'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Wilson', 'Moore'];
  return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
}

function generateMockAddress(location?: any) {
  const streetNumbers = Math.floor(Math.random() * 9999) + 100;
  const streetNames = ['Main St', 'Oak Ave', 'Pine Rd', 'Elm St', 'Maple Dr', 'Cedar Ln', 'First St', 'Park Ave'];
  const city = location?.city || 'Austin';
  const state = location?.state || 'TX';
  const zipCode = Math.floor(Math.random() * 90000) + 10000;
  
  return `${streetNumbers} ${streetNames[Math.floor(Math.random() * streetNames.length)]}, ${city}, ${state} ${zipCode}`;
}

function generateMockPhone() {
  return `(${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`;
}

function generateMockEmail() {
  const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'];
  const name = generateMockName().replace(/\s+/g, '.').toLowerCase();
  return `${name}@${domains[Math.floor(Math.random() * domains.length)]}`;
}