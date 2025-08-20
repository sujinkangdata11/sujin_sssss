// Cloudflare Pages Functions for Random Search
// API Key rotation and quota management

export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    
    // Get request data
    const body = await request.json();
    const { keyword, dateRange, selectedCountries } = body;
    
    if (!keyword || !keyword.trim()) {
      return new Response(JSON.stringify({ error: '키워드를 입력해주세요.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get API keys from environment
    const youtubeApiKeys = env.YOUTUBE_API_KEYS?.split(',') || [];
    const geminiApiKeys = env.GEMINI_API_KEYS?.split(',') || [];

    if (youtubeApiKeys.length === 0) {
      return new Response(JSON.stringify({ error: 'YouTube API 키가 설정되지 않았습니다.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Find working API key
    const workingKey = await findWorkingApiKey(youtubeApiKeys, env);
    
    if (!workingKey) {
      return new Response(JSON.stringify({ error: '현재 사용 가능한 API 키가 없습니다. 잠시 후 다시 시도해주세요.' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Perform search for each country
    const results = [];
    const errors = [];

    for (const countryCode of selectedCountries) {
      try {
        const searchResults = await searchYouTubeForCountry(
          workingKey.key, 
          keyword, 
          countryCode, 
          dateRange
        );
        results.push(...searchResults);
      } catch (error) {
        console.error(`Search failed for ${countryCode}:`, error);
        errors.push(countryCode);
        
        // If quota exceeded, mark key as exhausted
        if (error.message?.includes('quotaExceeded')) {
          await markKeyAsExhausted(workingKey.index, env);
        }
      }
    }

    // Return results
    return new Response(JSON.stringify({
      shorts: results,
      errors: errors.length > 0 ? errors : null
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Random search error:', error);
    return new Response(JSON.stringify({ error: '검색 중 오류가 발생했습니다.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Find working API key with rotation
async function findWorkingApiKey(apiKeys, env) {
  for (let i = 0; i < apiKeys.length; i++) {
    const key = apiKeys[i].trim();
    
    // Check if key is in cooldown
    const keyStatus = await env.API_KEY_STATUS?.get(`key_${i}_status`);
    if (keyStatus === 'quota_exceeded') {
      const cooldownTime = await env.API_KEY_STATUS?.get(`key_${i}_cooldown`);
      if (cooldownTime && Date.now() < parseInt(cooldownTime)) {
        continue; // Skip this key, still in cooldown
      }
    }

    // Test the key
    if (await testApiKey(key)) {
      return { key, index: i };
    }
  }
  
  return null;
}

// Test if API key is working
async function testApiKey(apiKey) {
  try {
    const testUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoDuration=short&maxResults=1&q=test&key=${apiKey}`;
    const response = await fetch(testUrl);
    return response.ok;
  } catch (error) {
    return false;
  }
}

// Mark API key as quota exhausted
async function markKeyAsExhausted(keyIndex, env) {
  try {
    const cooldownTime = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
    await env.API_KEY_STATUS?.put(`key_${keyIndex}_status`, 'quota_exceeded');
    await env.API_KEY_STATUS?.put(`key_${keyIndex}_cooldown`, cooldownTime.toString());
  } catch (error) {
    console.error('Failed to mark key as exhausted:', error);
  }
}

// Search YouTube for specific country
async function searchYouTubeForCountry(apiKey, keyword, countryCode, dateRange) {
  const publishedAfter = getPublishedAfter(dateRange);
  
  const searchUrl = `https://www.googleapis.com/youtube/v3/search?` +
    `part=snippet&type=video&videoDuration=short&maxResults=10` +
    `&q=${encodeURIComponent(keyword)}&regionCode=${countryCode}` +
    `&publishedAfter=${publishedAfter}&key=${apiKey}`;

  const response = await fetch(searchUrl);
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'YouTube API 오류');
  }

  const data = await response.json();
  
  return (data.items || []).map(item => ({
    id: item.id.videoId,
    title: item.snippet.title,
    thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url,
    channelTitle: item.snippet.channelTitle,
    publishedAt: item.snippet.publishedAt,
    url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
    country: countryCode
  }));
}

// Get published after date based on range
function getPublishedAfter(dateRange) {
  const now = new Date();
  const days = parseInt(dateRange);
  const pastDate = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));
  return pastDate.toISOString();
}