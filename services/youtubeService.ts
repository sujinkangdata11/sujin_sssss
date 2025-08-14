import { YouTubeShort } from '../types';

const API_BASE_URL = 'https://www.googleapis.com/youtube/v3';

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
    const searchParams = new URLSearchParams({
      part: 'snippet',
      q: query ? `${query} #shorts` : '#shorts',
      type: 'video',
      videoDuration: 'short',
      maxResults: '25',
      publishedAfter: options.publishedAfter,
      key: apiKey,
    });

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
      part: 'snippet,statistics',
      id: videoIds,
      key: apiKey,
    });

    const videosResponse = await fetch(`${API_BASE_URL}/videos?${videosParams.toString()}`);
     if (!videosResponse.ok) {
        const errorData = await videosResponse.json();
        throw new Error(`YouTube Videos API Error: ${errorData.error.message}`);
    }
    const videosData = await videosResponse.json();

    return videosData.items.map((item: any): YouTubeShort => ({
      id: item.id,
      title: item.snippet.title,
      thumbnailUrl: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
      viewCount: parseInt(item.statistics.viewCount, 10) || 0,
    }));
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