// Cloudflare Workers script for random search mode
// This worker handles API key rotation and quota management

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Handle CORS for all requests
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 200, headers: corsHeaders });
    }

    // Route: /api/random-search
    if (url.pathname === '/api/random-search' && request.method === 'POST') {
      try {
        const body = await request.json();
        const { keyword, dateRange, selectedCountries } = body;

        // Validate input
        if (!keyword || !keyword.trim()) {
          return new Response(JSON.stringify({ error: 'Keyword is required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // Get API keys from environment variables
        const youtubeApiKeys = env.YOUTUBE_API_KEYS ? env.YOUTUBE_API_KEYS.split(',') : [];
        const geminiApiKeys = env.GEMINI_API_KEYS ? env.GEMINI_API_KEYS.split(',') : [];

        if (youtubeApiKeys.length === 0) {
          return new Response(JSON.stringify({ error: 'No YouTube API keys configured' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // Try to find a working YouTube API key
        const workingKey = await findWorkingApiKey(youtubeApiKeys, env);
        
        if (!workingKey) {
          return new Response(JSON.stringify({ 
            error: '모든 API 키가 할당량을 초과했습니다. 24시간 후 다시 시도해주세요.' 
          }), {
            status: 429,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // Perform search with working key
        const searchResults = await performRandomSearch(
          workingKey, 
          geminiApiKeys[0] || '', 
          keyword, 
          dateRange, 
          selectedCountries
        );

        return new Response(JSON.stringify(searchResults), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

      } catch (error) {
        console.error('Random search error:', error);
        return new Response(JSON.stringify({ 
          error: '검색 중 오류가 발생했습니다: ' + error.message 
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // Default response for unmatched routes
    return new Response('Not Found', { status: 404, headers: corsHeaders });
  }
};

// Find a working API key by testing each one
async function findWorkingApiKey(apiKeys, env) {
  const KV_NAMESPACE = env.API_KEY_STATUS; // KV namespace for storing key status
  
  for (let i = 0; i < apiKeys.length; i++) {
    const key = apiKeys[i].trim();
    
    // Check if key is in cooldown
    const keyStatus = await KV_NAMESPACE?.get(`key_${i}_status`);
    if (keyStatus === 'quota_exceeded') {
      const cooldownTime = await KV_NAMESPACE?.get(`key_${i}_cooldown`);
      if (cooldownTime && Date.now() < parseInt(cooldownTime)) {
        console.log(`Key ${i} still in cooldown, skipping`);
        continue;
      } else if (cooldownTime) {
        // Cooldown expired, reset status
        await KV_NAMESPACE?.delete(`key_${i}_status`);
        await KV_NAMESPACE?.delete(`key_${i}_cooldown`);
      }
    }

    // Test the key with a simple API call
    const isWorking = await testApiKey(key);
    
    if (isWorking) {
      console.log(`Using working key index: ${i}`);
      return { key, index: i };
    } else {
      // Mark key as failed and set 24-hour cooldown
      const cooldownTime = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
      await KV_NAMESPACE?.put(`key_${i}_status`, 'quota_exceeded');
      await KV_NAMESPACE?.put(`key_${i}_cooldown`, cooldownTime.toString());
      console.log(`Key ${i} failed, set cooldown until ${new Date(cooldownTime)}`);
    }
  }
  
  return null; // No working keys found
}

// Test if an API key is working with a minimal quota usage
async function testApiKey(apiKey) {
  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=1&q=test&key=${apiKey}`
    );
    
    if (response.ok) {
      return true;
    } else {
      const errorData = await response.json().catch(() => ({}));
      console.log(`API key test failed:`, errorData);
      return false;
    }
  } catch (error) {
    console.log(`API key test error:`, error);
    return false;
  }
}

// Perform the actual search using working API keys
async function performRandomSearch(workingKeyInfo, geminiApiKey, keyword, dateRange, selectedCountries) {
  const { key: youtubeApiKey } = workingKeyInfo;
  
  // Calculate date range
  const publishedAfterDate = new Date();
  publishedAfterDate.setDate(publishedAfterDate.getDate() - parseInt(dateRange, 10));
  const publishedAfter = publishedAfterDate.toISOString();

  // Translate keyword if needed (simplified version)
  const countryQueries = selectedCountries.map(countryCode => {
    // For now, use the original keyword
    // TODO: Implement Gemini translation here if geminiApiKey is available
    return { countryCode, query: keyword };
  });

  // Search in each country
  const searchPromises = countryQueries.map(({ countryCode, query }) => 
    searchYouTubeShorts(youtubeApiKey, query, countryCode, publishedAfter)
  );

  const results = await Promise.allSettled(searchPromises);
  
  // Collect successful results
  let allShorts = [];
  let errors = [];
  
  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      allShorts.push(...result.value);
    } else {
      errors.push(`${selectedCountries[index]}: ${result.reason.message}`);
    }
  });

  // Remove duplicates
  const uniqueShorts = Array.from(
    new Map(allShorts.map(short => [short.id, short])).values()
  );

  return {
    shorts: uniqueShorts,
    errors: errors.length > 0 ? errors : null,
    totalFound: uniqueShorts.length
  };
}

// Search YouTube Shorts for a specific country
async function searchYouTubeShorts(apiKey, query, regionCode, publishedAfter) {
  const url = new URL('https://www.googleapis.com/youtube/v3/search');
  url.searchParams.set('part', 'snippet');
  url.searchParams.set('type', 'video');
  url.searchParams.set('videoDuration', 'short');
  url.searchParams.set('maxResults', '50');
  url.searchParams.set('order', 'relevance');
  url.searchParams.set('q', query);
  url.searchParams.set('regionCode', regionCode);
  url.searchParams.set('publishedAfter', publishedAfter);
  url.searchParams.set('key', apiKey);

  const response = await fetch(url.toString());
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`YouTube API error: ${errorData.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  
  // Transform YouTube API response to match our format
  return data.items?.map(item => ({
    id: item.id.videoId,
    title: item.snippet.title,
    channelTitle: item.snippet.channelTitle,
    channelId: item.snippet.channelId,
    publishedAt: item.snippet.publishedAt,
    thumbnailUrl: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url,
    viewCount: 0, // Will be enhanced later if needed
    description: item.snippet.description,
    url: `https://www.youtube.com/watch?v=${item.id.videoId}`
  })) || [];
}