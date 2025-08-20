// Cloudflare Pages Functions for Random Search
// Complete YouTube API integration with same logic as main app

const API_BASE_URL = 'https://www.googleapis.com/youtube/v3';

// Convert ISO 8601 duration (PT1M30S) to readable format (1:30)
const formatDuration = (duration) => {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return duration;
  
  const hours = parseInt(match[1] || '0');
  const minutes = parseInt(match[2] || '0');
  const seconds = parseInt(match[3] || '0');
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  } else {
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
};

// Convert formatted duration (1:30) to seconds
const formattedDurationToSeconds = (duration) => {
  const parts = duration.split(':').map(Number);
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1]; // MM:SS
  } else if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2]; // HH:MM:SS
  }
  return 0;
};

// Filter videos by duration for shorts (4 minutes or less)
const filterVideosByDuration = (videos) => {
  return videos.filter(video => {
    if (!video.duration) return true; // If no duration info, include it
    
    const durationInSeconds = formattedDurationToSeconds(video.duration);
    return durationInSeconds <= 240; // 4 minutes or less
  });
};

// Get channel statistics for multiple channels
const getChannelStatistics = async (apiKey, channelIds) => {
  try {
    if (channelIds.length === 0) return {};
    
    const channelIdsString = channelIds.join(',');
    
    const channelsParams = new URLSearchParams({
      part: 'statistics',
      id: channelIdsString,
      key: apiKey,
    });

    const response = await fetch(`${API_BASE_URL}/channels?${channelsParams.toString()}`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`YouTube Channels API Error: ${errorData.error.message}`);
    }
    
    const data = await response.json();
    const channelStats = {};
    
    data.items?.forEach((channel) => {
      const subscriberCount = parseInt(channel.statistics.subscriberCount, 10) || 0;
      const videoCount = parseInt(channel.statistics.videoCount, 10) || 0;
      const viewCount = parseInt(channel.statistics.viewCount, 10) || 0;
      channelStats[channel.id] = { subscriberCount, videoCount, viewCount };
    });
    
    return channelStats;
  } catch (error) {
    console.error('Error fetching channel statistics:', error);
    throw error;
  }
};

// Helper function to split array into chunks
const chunkArray = (array, chunkSize) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
};

// Search YouTube shorts with complete data enhancement
const searchYouTubeShorts = async (apiKey, query, options) => {
  try {
    let searchQuery = query || '';
    const searchParams = new URLSearchParams({
      part: 'snippet',
      type: 'video',
      maxResults: '25',
      publishedAfter: options.publishedAfter,
      key: apiKey,
    });

    searchQuery = query ? `${query} #shorts` : '#shorts';
    searchParams.set('videoDuration', 'short');
    searchParams.set('q', searchQuery);

    if (options.regionCode) {
      searchParams.set('regionCode', options.regionCode);
      searchParams.set('order', 'viewCount');
    }

    const searchResponse = await fetch(`${API_BASE_URL}/search?${searchParams.toString()}`);
    if (!searchResponse.ok) {
      const errorData = await searchResponse.json();
      throw new Error(`YouTube Search API Error: ${errorData.error.message}`);
    }
    const searchData = await searchResponse.json();

    if (!searchData.items || searchData.items.length === 0) {
      return [];
    }

    const videoIds = searchData.items.map((item) => item.id.videoId).join(',');

    const videosParams = new URLSearchParams({
      part: 'snippet,statistics,contentDetails',
      id: videoIds,
      key: apiKey,
    });

    const videosResponse = await fetch(`${API_BASE_URL}/videos?${videosParams.toString()}`);
    if (!videosResponse.ok) {
      const errorData = await videosResponse.json();
      throw new Error(`YouTube Videos API Error: ${errorData.error.message}`);
    }
    const videosData = await videosResponse.json();

    const allVideos = videosData.items.map((item) => ({
      id: item.id,
      title: item.snippet.title,
      thumbnailUrl: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
      channelTitle: item.snippet.channelTitle,
      channelId: item.snippet.channelId,
      publishedAt: item.snippet.publishedAt,
      viewCount: parseInt(item.statistics.viewCount, 10) || 0,
      duration: item.contentDetails?.duration ? formatDuration(item.contentDetails.duration) : undefined,
    }));

    return filterVideosByDuration(allVideos);
  } catch (error) {
    console.error(`Error searching YouTube:`, error);
    throw error;
  }
};

// Enhance videos with subscriber data (same as main app)
const enhanceVideosWithSubscriberData = async (apiKey, videos) => {
  try {
    if (videos.length === 0) return { videos, hasSubscriberDataError: false };
    
    const sortedVideos = [...videos].sort((a, b) => b.viewCount - a.viewCount);
    const uniqueChannelIds = [...new Set(sortedVideos.map(video => video.channelId).filter(Boolean))];
    
    const channelBatches = chunkArray(uniqueChannelIds, 50);
    let allChannelStats = {};
    let hasAnyError = false;
    
    for (let i = 0; i < channelBatches.length; i++) {
      const batch = channelBatches[i];
      
      try {
        const batchChannelStats = await getChannelStatistics(apiKey, batch);
        allChannelStats = { ...allChannelStats, ...batchChannelStats };
      } catch (batchError) {
        console.error(`Batch ${i + 1} failed:`, batchError);
        hasAnyError = true;
        continue;
      }
    }
    
    const enhancedVideos = videos.map(video => {
      const channelData = video.channelId ? allChannelStats[video.channelId] : undefined;
      const subscriberCount = channelData?.subscriberCount;
      const videoCount = channelData?.videoCount;
      const channelViewCount = channelData?.viewCount;
      
      let viewsPerSubscriber;
      if (subscriberCount !== undefined && subscriberCount > 0) {
        viewsPerSubscriber = (video.viewCount / subscriberCount) * 100;
      }
      
      return {
        ...video,
        subscriberCount,
        videoCount,
        channelViewCount,
        viewsPerSubscriber,
      };
    });
    
    return { videos: enhancedVideos, hasSubscriberDataError: hasAnyError };
  } catch (error) {
    console.error('Error enhancing videos with subscriber data:', error);
    return { videos, hasSubscriberDataError: true };
  }
};

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

    // Perform search for each country with complete enhancement
    const allShorts = [];
    const errors = [];

    for (const countryCode of selectedCountries) {
      try {
        const publishedAfter = getPublishedAfter(dateRange);
        const searchResults = await searchYouTubeShorts(workingKey.key, keyword, {
          regionCode: countryCode,
          publishedAfter
        });
        allShorts.push(...searchResults);
      } catch (error) {
        console.error(`Search failed for ${countryCode}:`, error);
        errors.push(countryCode);
        
        if (error.message?.includes('quotaExceeded')) {
          await markKeyAsExhausted(workingKey.index, env);
        }
      }
    }

    // Remove duplicates
    const uniqueShorts = Array.from(new Map(allShorts.map(short => [short.id, short])).values());
    
    // Enhance videos with subscriber data (same as main app)
    const { videos: enhancedVideos } = await enhanceVideosWithSubscriberData(workingKey.key, uniqueShorts);

    return new Response(JSON.stringify({
      shorts: enhancedVideos,
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