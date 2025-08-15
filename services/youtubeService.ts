import { YouTubeShort } from '../types';

const API_BASE_URL = 'https://www.googleapis.com/youtube/v3';

// Convert ISO 8601 duration (PT1M30S) to readable format (1:30)
const formatDuration = (duration: string): string => {
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

// Convert duration to seconds for filtering
const durationToSeconds = (duration: string): number => {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  
  const hours = parseInt(match[1] || '0');
  const minutes = parseInt(match[2] || '0');
  const seconds = parseInt(match[3] || '0');
  
  return hours * 3600 + minutes * 60 + seconds;
};

// Convert formatted duration (1:30) to seconds
const formattedDurationToSeconds = (duration: string): number => {
  const parts = duration.split(':').map(Number);
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1]; // MM:SS
  } else if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2]; // HH:MM:SS
  }
  return 0;
};

// Filter videos by duration for shorts (4 minutes or less)
const filterVideosByDuration = (videos: YouTubeShort[]): YouTubeShort[] => {
  return videos.filter(video => {
    if (!video.duration) return true; // If no duration info, include it
    
    const durationInSeconds = formattedDurationToSeconds(video.duration);
    return durationInSeconds <= 240; // 4 minutes or less
  });
};

interface SearchOptions {
  regionCode?: string;
  channelId?: string;
  publishedAfter: string;
}

export const searchYouTubeShorts = async (
  apiKey: string,
  query: string,
  options: SearchOptions
): Promise<YouTubeShort[]> => {
  try {
    // Build search query based on video type
    let searchQuery = query || '';
    const searchParams = new URLSearchParams({
      part: 'snippet',
      type: 'video',
      maxResults: '25',
      publishedAfter: options.publishedAfter,
      key: apiKey,
    });

    // Search for shorts only
    searchQuery = query ? `${query} #shorts` : '#shorts';
    searchParams.set('videoDuration', 'short');

    searchParams.set('q', searchQuery);

    if (options.channelId) {
        searchParams.set('channelId', options.channelId);
        // Order by date to get latest shorts if no keyword is provided
        searchParams.set('order', query ? 'relevance' : 'date');
    } else if (options.regionCode) {
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

    const videoIds = searchData.items.map((item: any) => item.id.videoId).join(',');

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

    const allVideos = videosData.items.map((item: any): YouTubeShort => ({
      id: item.id,
      title: item.snippet.title,
      thumbnailUrl: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
      viewCount: parseInt(item.statistics.viewCount, 10) || 0,
      duration: item.contentDetails?.duration ? formatDuration(item.contentDetails.duration) : undefined,
    }));

    // Filter by duration on client side (4 minutes or less for shorts)
    return filterVideosByDuration(allVideos);
  } catch (error) {
    console.error(`Error searching YouTube:`, error);
    if (error instanceof Error) {
        throw error;
    }
    throw new Error('An unknown error occurred while searching YouTube.');
  }
};

export const resolveChannelUrlsToIds = async (apiKey: string, channelUrls: string[]): Promise<string[]> => {
    const validUrls = channelUrls.filter(url => url.trim() !== '');
    if (validUrls.length === 0) return [];

    const resolvedIds = new Set<string>();
    const urlsToLookup: string[] = [];

    for (const url of validUrls) {
        const match = url.match(/youtube\.com\/channel\/([a-zA-Z0-9_-]{24})/);
        if (match && match[1]) {
            resolvedIds.add(match[1]);
        } else {
            urlsToLookup.push(url);
        }
    }

    const lookupPromises = urlsToLookup.map(async (url) => {
        const nameMatch = url.match(/youtube\.com\/(?:c\/|user\/|@)([a-zA-Z0-9_.-]+)/);
        const handle = nameMatch ? nameMatch[1] : url.trim().replace(/^@/, '');

        if (!handle) return null;

        try {
            const searchParams = new URLSearchParams({
                part: 'id',
                q: handle,
                type: 'channel',
                maxResults: '1',
                key: apiKey,
            });
            const response = await fetch(`${API_BASE_URL}/search?${searchParams.toString()}`);
            if (!response.ok) return null;
            const data = await response.json();
            return data.items?.[0]?.id?.channelId || null;
        } catch (e) {
            console.error(`Failed to resolve handle ${handle}:`, e);
            return null;
        }
    });

    const lookedUpIds = await Promise.all(lookupPromises);
    lookedUpIds.forEach(id => {
        if (id) resolvedIds.add(id);
    });

    return Array.from(resolvedIds);
};