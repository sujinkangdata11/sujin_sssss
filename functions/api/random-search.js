// Cloudflare Pages Functions for Random Search
// Complete YouTube API integration with same logic as main app

const API_BASE_URL = 'https://www.googleapis.com/youtube/v3';

// Country to language mapping for translation
const COUNTRIES = [
  { code: 'US', name: 'United States', language: 'English' },
  { code: 'KR', name: 'South Korea', language: 'Korean' },
  { code: 'JP', name: 'Japan', language: 'Japanese' },
  { code: 'CN', name: 'China', language: 'Chinese' },
  { code: 'IN', name: 'India', language: 'Hindi' },
  { code: 'ES', name: 'Spain', language: 'Spanish' },
  { code: 'FR', name: 'France', language: 'French' },
  { code: 'DE', name: 'Germany', language: 'German' },
  { code: 'NL', name: 'Netherlands', language: 'Dutch' },
  { code: 'PT', name: 'Portugal', language: 'Portuguese' },
  { code: 'RU', name: 'Russia', language: 'Russian' },
  { code: 'GB', name: 'United Kingdom', language: 'English' },
  { code: 'CA', name: 'Canada', language: 'English' },
  { code: 'AU', name: 'Australia', language: 'English' },
  { code: 'IT', name: 'Italy', language: 'Italian' },
  { code: 'PH', name: 'Philippines', language: 'English' },
  { code: 'TH', name: 'Thailand', language: 'Thai' },
  { code: 'VN', name: 'Vietnam', language: 'Vietnamese' },
  { code: 'TR', name: 'Turkey', language: 'Turkish' },
  { code: 'ZA', name: 'South Africa', language: 'English' }
];

// Get localized error messages
const getLocalizedMessage = (language, messageKey) => {
  const messages = {
    quotaExhausted: {
      en: "Oh.. unfortunately, the previous search was the last quota.",
      ko: "아.. 아쉽게도 이전 검색이 마지막 할당량이었어요.",
      ja: "あ.. 残念ながら前の検索が最後のクォータでした。",
      zh: "啊.. 很遗憾，上次搜索是最后的配额了。",
      hi: "अरे.. दुर्भाग्य से पिछली खोज अंतिम कोटा था।",
      es: "Oh.. lamentablemente, la búsqueda anterior fue la última cuota.",
      fr: "Oh.. malheureusement, la recherche précédente était le dernier quota.",
      de: "Oh.. leider war die vorherige Suche das letzte Kontingent.",
      nl: "Oh.. helaas was de vorige zoekopdracht het laatste quotum.",
      pt: "Ah.. infelizmente, a busca anterior foi a última cota.",
      ru: "Ох.. к сожалению, предыдущий поиск был последней квотой."
    },
    keywordRequired: {
      en: "Please enter a keyword.",
      ko: "키워드를 입력해주세요.",
      ja: "キーワードを入力してください。",
      zh: "请输入关键词。",
      hi: "कृपया एक कीवर्ड दर्ज करें।",
      es: "Por favor ingrese una palabra clave.",
      fr: "Veuillez saisir un mot-clé.",
      de: "Bitte geben Sie ein Schlüsselwort ein.",
      nl: "Voer een zoekwoord in.",
      pt: "Por favor, insira uma palavra-chave.",
      ru: "Пожалуйста, введите ключевое слово."
    },
    geminiKeyMissing: {
      en: "Gemini API key is not configured.",
      ko: "Gemini API 키가 설정되지 않았습니다.",
      ja: "Gemini API キーが設定されていません。",
      zh: "Gemini API 密钥未配置。",
      hi: "Gemini API कुंजी कॉन्फ़िगर नहीं है।",
      es: "La clave API de Gemini no está configurada.",
      fr: "La clé API Gemini n'est pas configurée.",
      de: "Gemini API-Schlüssel ist nicht konfiguriert.",
      nl: "Gemini API-sleutel is niet geconfigureerd.",
      pt: "A chave da API Gemini não está configurada.",
      ru: "Ключ API Gemini не настроен."
    },
    searchError: {
      en: "An error occurred during search.",
      ko: "검색 중 오류가 발생했습니다.",
      ja: "検索中にエラーが発生しました。",
      zh: "搜索过程中发生错误。",
      hi: "खोज के दौरान एक त्रुटि हुई।",
      es: "Ocurrió un error durante la búsqueda.",
      fr: "Une erreur s'est produite lors de la recherche.",
      de: "Während der Suche ist ein Fehler aufgetreten.",
      nl: "Er is een fout opgetreden tijdens het zoeken.",
      pt: "Ocorreu um erro durante a pesquisa.",
      ru: "Произошла ошибка во время поиска."
    }
  };
  
  return messages[messageKey]?.[language] || messages[messageKey]?.['en'] || 'An error occurred.';
};

// Translate keyword for countries using Gemini API
const translateKeywordForCountries = async (keyword, selectedCountries, geminiApiKey) => {
  if (!geminiApiKey) {
    throw new Error("Gemini API key is not provided.");
  }

  const targetCountries = COUNTRIES.filter(c => selectedCountries.includes(c.code));
  const uniqueLanguages = [...new Set(targetCountries.map(c => c.language))];
  
  const prompt = `Translate the keyword "${keyword}" into the following languages: ${uniqueLanguages.join(', ')}. Return the result as a JSON array of objects, where each object has a "language" key (the English name of the language) and a "translation" key (the translated keyword).`;

  try {
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=' + geminiApiKey, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          response_mime_type: "application/json"
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API Error: ${response.status}`);
    }

    const data = await response.json();
    const translationsText = data.candidates[0].content.parts[0].text;
    const translations = JSON.parse(translationsText);

    const translationMap = {};
    translations.forEach(t => {
      translationMap[t.language] = t.translation;
    });

    const result = {};
    targetCountries.forEach(country => {
      result[country.code] = translationMap[country.language] || keyword;
    });

    return result;
  } catch (error) {
    console.error('Translation error:', error);
    throw error;
  }
};

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
    const { keyword, dateRange, selectedCountries, language } = body;
    
    if (!keyword || !keyword.trim()) {
      return new Response(JSON.stringify({ error: getLocalizedMessage(language || 'ko', 'keywordRequired') }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    ////// 주석 - 환경변수에서 키 가져오기 (나중에 복구용) //////
    // const youtubeApiKeys = env.YOUTUBE_API_KEYS?.split(',').map(key => key.trim()) || [];
    
    ////// 주석 - 하드코딩된 키 사용 (테스트용) //////
    const youtubeApiKeys = [
      "AIzaSyDOh7oTUrSxyw3fy2hfaNTMFRWqiYrbyVQ",
      "AIzaSyDhegNdYCTu8_mAyp44y9usHNfUwZbOWUo"
    ];

    if (youtubeApiKeys.length === 0) {
      return new Response(JSON.stringify({ 
        error: 'YouTube API 키가 설정되지 않았습니다.',
        debug: {
          envExists: !!env.YOUTUBE_API_KEYS,
          rawValue: env.YOUTUBE_API_KEYS ? `${env.YOUTUBE_API_KEYS.substring(0, 20)}...` : 'undefined'
        }
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    ////// 주석 - 환경변수에서 Gemini 키 가져오기 (나중에 복구용) //////
    // const geminiApiKeys = env.GEMINI_API_KEYS?.split(',').map(key => key.trim()) || [];
    // const geminiApiKey = geminiApiKeys[0];
    
    ////// 주석 - 하드코딩된 Gemini 키 사용 (테스트용) //////
    const geminiApiKeys = [
      "AIzaSyC3A_H2WsGgTRVADmWFQAqThSQ7_Ipur1I",
      "AIzaSyBO3r4xK-GLkqArE7vnLp6ROaDcrNUkxlk"
    ];
    const geminiApiKey = geminiApiKeys[0];
    if (!geminiApiKey) {
      return new Response(JSON.stringify({ error: getLocalizedMessage(language || 'ko', 'geminiKeyMissing') }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Find working API key
    const workingKey = await findWorkingApiKey(youtubeApiKeys, env);
    
    if (!workingKey) {
      return new Response(JSON.stringify({ 
        error: getLocalizedMessage(language || 'ko', 'quotaExhausted'),
        debug: {
          keysFound: youtubeApiKeys.length,
          message: 'All API keys failed testing'
        }
      }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Translate keyword for each country
    let translatedKeywords;
    try {
      translatedKeywords = await translateKeywordForCountries(keyword, selectedCountries, geminiApiKey);
    } catch (translateError) {
      console.error('Translation failed:', translateError);
      return new Response(JSON.stringify({ error: getLocalizedMessage(language || 'ko', 'quotaExhausted') }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Perform search for each country with translated keywords
    const allShorts = [];
    const errors = [];

    for (const countryCode of selectedCountries) {
      try {
        const publishedAfter = getPublishedAfter(dateRange);
        const translatedKeyword = translatedKeywords[countryCode] || keyword;
        const searchResults = await searchYouTubeShorts(workingKey.key, translatedKeyword, {
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
    return new Response(JSON.stringify({ error: getLocalizedMessage(language || 'ko', 'searchError') }), {
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