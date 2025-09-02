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
      channelId: item.snippet.channelId,
      publishedAt: item.snippet.publishedAt,
      viewCount: parseInt(item.statistics.viewCount, 10) || 0,
      duration: item.contentDetails?.duration ? formatDuration(item.contentDetails.duration) : undefined,
      likeCount: parseInt(item.statistics.likeCount, 10) || 0,
      commentCount: parseInt(item.statistics.commentCount, 10) || 0,
      categoryId: item.snippet.categoryId,
      tags: item.snippet.tags || [],
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

// Get channel statistics for multiple channels (subscriber count + video count + channel view count + published date + country)
export const getChannelStatistics = async (apiKey: string, channelIds: string[]): Promise<Record<string, {subscriberCount: number, videoCount: number, viewCount: number, publishedAt: string, country: string | null, defaultLanguage: string | null}>> => {
  try {
    if (channelIds.length === 0) return {};
    
    // YouTube API allows up to 50 channel IDs per request
    const channelIdsString = channelIds.join(',');
    
    const channelsParams = new URLSearchParams({
      part: 'statistics,snippet,localizations,brandingSettings',
      id: channelIdsString,
      key: apiKey,
    });

    const response = await fetch(`${API_BASE_URL}/channels?${channelsParams.toString()}`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`YouTube Channels API Error: ${errorData.error.message}`);
    }
    
    const data = await response.json();
    const channelStats: Record<string, {subscriberCount: number, videoCount: number, viewCount: number, publishedAt: string, country: string | null, defaultLanguage: string | null}> = {};
    
    data.items?.forEach((channel: any) => {
      const subscriberCount = parseInt(channel.statistics.subscriberCount, 10) || 0;
      const videoCount = parseInt(channel.statistics.videoCount, 10) || 0;
      const viewCount = parseInt(channel.statistics.viewCount, 10) || 0;
      const publishedAt = channel.snippet.publishedAt || '';
      const country = channel.snippet.country || null;
      const defaultLanguage = channel.snippet.defaultLanguage || null;
      console.log(`📍 Channel ${channel.snippet.title}:`, {
        country: country,
        defaultLanguage: defaultLanguage,
        snippet: channel.snippet,
        brandingSettings: channel.brandingSettings,
        localizations: channel.localizations
      });
      channelStats[channel.id] = { subscriberCount, videoCount, viewCount, publishedAt, country, defaultLanguage };
    });
    
    return channelStats;
  } catch (error) {
    console.error('Error fetching channel statistics:', error);
    throw error; // Re-throw error so enhanceVideosWithSubscriberData can catch it
  }
};

// Helper function to split array into chunks
const chunkArray = <T>(array: T[], chunkSize: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
};

// Add subscriber counts and calculate views per subscriber ratio
export const enhanceVideosWithSubscriberData = async (
  apiKey: string, 
  videos: YouTubeShort[],
  onProgress?: (current: number, total: number) => void
): Promise<{ videos: YouTubeShort[], hasSubscriberDataError: boolean }> => {
  try {
    if (videos.length === 0) return { videos, hasSubscriberDataError: false };
    
    // Sort videos by view count (highest first) to prioritize high-view channels
    const sortedVideos = [...videos].sort((a, b) => b.viewCount - a.viewCount);
    
    // Get unique channel IDs (preserving order to prioritize high-view videos)
    const uniqueChannelIds = [...new Set(sortedVideos.map(video => video.channelId).filter(Boolean))] as string[];
    console.log(`🔄 Processing ${uniqueChannelIds.length} unique channels in batches of 50`);
    
    // Split channel IDs into batches of 50 (YouTube API limit)
    const channelBatches = chunkArray(uniqueChannelIds, 50);
    console.log(`📦 Split into ${channelBatches.length} batches`);
    
    // Process batches sequentially, allowing partial success
    let allChannelStats: Record<string, {subscriberCount: number, videoCount: number, viewCount: number, publishedAt: string, country: string | null, defaultLanguage: string | null}> = {};
    let hasAnyError = false;
    
    for (let i = 0; i < channelBatches.length; i++) {
      const batch = channelBatches[i];
      console.log(`🔄 Processing batch ${i + 1}/${channelBatches.length} (${batch.length} channels)`);
      
      // Report progress if callback is provided
      if (onProgress) {
        onProgress(i + 1, channelBatches.length);
      }
      
      try {
        const batchChannelStats = await getChannelStatistics(apiKey, batch);
        allChannelStats = { ...allChannelStats, ...batchChannelStats };
        console.log(`✅ Batch ${i + 1} completed successfully`);
      } catch (batchError) {
        console.error(`❌ Batch ${i + 1} failed:`, batchError);
        hasAnyError = true;
        // Continue with next batch instead of stopping completely
        continue;
      }
    }
    
    console.log(`📊 Successfully collected channel data for ${Object.keys(allChannelStats).length}/${uniqueChannelIds.length} channels`);
    
    // Enhance videos with channel statistics (including partial results)
    const enhancedVideos = videos.map(video => {
      const channelData = video.channelId ? allChannelStats[video.channelId] : undefined;
      const subscriberCount = channelData?.subscriberCount;
      const videoCount = channelData?.videoCount;
      const channelViewCount = channelData?.viewCount;
      const channelPublishedAt = channelData?.publishedAt;
      const channelCountry = channelData?.country;
      const channelLanguage = channelData?.defaultLanguage;
      
      let viewsPerSubscriber: number | undefined;
      if (subscriberCount !== undefined && subscriberCount > 0) {
        viewsPerSubscriber = (video.viewCount / subscriberCount) * 100; // Convert to percentage
      }
      
      return {
        ...video,
        subscriberCount,
        videoCount,
        channelViewCount,
        channelPublishedAt,
        channelCountry,
        channelLanguage,
        viewsPerSubscriber,
      };
    });
    
    return { videos: enhancedVideos, hasSubscriberDataError: hasAnyError };
  } catch (error) {
    console.error('Error enhancing videos with subscriber data:', error);
    return { videos, hasSubscriberDataError: true }; // Return original videos if enhancement fails
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