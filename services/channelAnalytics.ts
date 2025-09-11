// 추후 사용예정 지금 사용안함 //

// Channel Analytics Service
// 채널의 쇼츠/롱폼 비율 분석 및 데이터 수집을 위한 서비스

/*
⚠️ 중요: 계산 순서가 반드시 지켜져야 합니다!

계산 순서:
1. 기본 데이터 수집 (channelId, viewCount, videoCount, publishedAt 등)
2. 최근 100개 영상 분석하여 csct(쇼츠개수), clct(롱폼개수) 계산
3. 각 영상의 조회수 합산하여 vesv(쇼츠 총 조회수) 계산
4. velv(롱폼 총 조회수) = 전체 조회수 - 쇼츠 조회수
5. vsvp(쇼츠 조회수 비율) = vesv / viewCount * 100
6. vlvp(롱폼 조회수 비율) = velv / viewCount * 100
7. 기타 지표들 계산 (gavg, gvps, gage 등)

주의: vesv가 먼저 계산되어야 velv를 구할 수 있습니다!
*/

/*
Cloudflare에 저장할 채널 분석 JSON 구조:

📊 G그룹 - 일반 성과 지표 (General Performance):
- gavg: averageViewsPerVideo (영상평균 조회수)
- gsub: subscriberConversionRate (구독 전환율 %)
- gvps: viewsPerSubscriber (구독자 대비 조회수)
- gage: channelAgeInDays (채널 나이, 일)
- gupw: uploadsPerWeek (주당 업로드 수)

📈 성장 지표 (Growth Metrics):
- gspd: subsGainedPerDay (하루 구독자 증가수)
- gvpd: viewsGainedPerDay (하루 조회수 증가량)
- gspm: subsGainedPerMonth (한 달 구독자 증가수)
- gspy: subsGainedPerYear (1년 구독자 증가수)
- gsvr: subscriberToViewRatio (구독자/조회수 비율)
- gvir: viralIndex (바이럴 지수)

📹 C그룹 - 콘텐츠 분석 (Content Analysis):
- csct: shortsCount (숏폼 영상 개수)
- clct: longformCount (롱폼 영상 개수)
- csdr: totalShortsDuration (숏폼 총 재생시간, 초)

👁️ V그룹 - 조회수 분석 (Views Analysis):
- vesv: estimatedShortsViews (숏폼 예상 조회수) ← RPM 계산용
- vsvp: shortsViewsPercentage (숏폼 조회수 비율 %)
- velv: estimatedLongformViews (롱폼 예상 조회수) ← RPM 계산용
- vlvp: longformViewsPercentage (롱폼 조회수 비율 %)

기본 정보:
- channelId, publishedAt, title, customUrl, country, thumbnailDefault
- topicCategories, viewCount, videoCount, subscriberHistory
- 수집 시간(ts), 메타데이터(firstCollected, lastUpdated, totalCollections)
*/

import { YouTubeShort } from '../types';

// 채널 분석 결과 타입 정의
interface ChannelAnalyticsData {
  // 기본 정보
  channelId: string;
  staticData: {
    publishedAt: string;
  };
  snapshots: [{
    ts: string;
    title: string;
    customUrl: string;
    country: string;
    thumbnailDefault: string;
    uploadsPlaylistId: string;
    topicCategories: string[];
    viewCount: string;
    videoCount: string;
    
    // G그룹 - 일반 성과 지표
    gavg: number;          // 영상평균 조회수
    gsub: number;          // 구독 전환율
    gvps: number;          // 구독자 대비 조회수
    gage: number;          // 채널 나이 (일)
    gupw: number;          // 주당 업로드 수
    
    // 성장 지표
    gspd: number;          // 하루 구독자 증가수
    gvpd: number;          // 하루 조회수 증가량
    gspm: number;          // 한 달 구독자 증가수
    gspy: number;          // 1년 구독자 증가수
    gsvr: number;          // 구독자/조회수 비율
    gvir: number;          // 바이럴 지수
    
    // C그룹 - 콘텐츠 분석
    csct: number;          // 숏폼 영상 개수
    clct: number;          // 롱폼 영상 개수
    csdr: number;          // 숏폼 총 재생시간 (초)
    
    // V그룹 - 조회수 분석
    vesv: number;          // 숏폼 예상 조회수
    vsvp: number;          // 숏폼 조회수 비율 (%)
    velv: number;          // 롱폼 예상 조회수
    vlvp: number;          // 롱폼 조회수 비율 (%)
  }];
  subscriberHistory: Array<{
    month: string;
    count: string;
  }>;
  metadata: {
    firstCollected: string;
    lastUpdated: string;
    totalCollections: number;
  };
}

// 1단계: 기본 채널 데이터 수집
export const getBasicChannelData = async (apiKey: string, channelId: string) => {
  // YouTube Channels API 호출
  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,topicDetails&id=${channelId}&key=${apiKey}`
  );
  
  if (!response.ok) {
    throw new Error('Failed to fetch channel data');
  }
  
  const data = await response.json();
  const channel = data.items[0];
  
  return {
    channelId: channelId,
    title: channel.snippet.title,
    customUrl: channel.snippet.customUrl || '',
    country: channel.snippet.country || '',
    thumbnailDefault: channel.snippet.thumbnails.default?.url || '',
    publishedAt: channel.snippet.publishedAt,
    viewCount: parseInt(channel.statistics.viewCount),
    videoCount: parseInt(channel.statistics.videoCount),
    subscriberCount: parseInt(channel.statistics.subscriberCount),
    topicCategories: channel.topicDetails?.topicCategories || [],
    uploadsPlaylistId: channel.contentDetails?.relatedPlaylists?.uploads || ''
  };
};

// 2단계: 최근 100개 영상 분석
export const analyzeRecent100Videos = async (apiKey: string, uploadsPlaylistId: string) => {
  let allVideos: YouTubeShort[] = [];
  let nextPageToken = '';
  
  // 최대 100개까지 가져오기 (25개씩 4번)
  for (let i = 0; i < 4; i++) {
    const playlistUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=25&key=${apiKey}${nextPageToken ? `&pageToken=${nextPageToken}` : ''}`;
    
    const response = await fetch(playlistUrl);
    if (!response.ok) break;
    
    const data = await response.json();
    const videoIds = data.items.map((item: any) => item.snippet.resourceId.videoId).join(',');
    
    // 비디오 상세 정보 가져오기
    const videosResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${videoIds}&key=${apiKey}`
    );
    
    if (!videosResponse.ok) break;
    
    const videosData = await videosResponse.json();
    
    const videos = videosData.items.map((item: any) => ({
      id: item.id,
      title: item.snippet.title,
      viewCount: parseInt(item.statistics.viewCount) || 0,
      duration: item.contentDetails.duration,
      publishedAt: item.snippet.publishedAt
    }));
    
    allVideos.push(...videos);
    
    nextPageToken = data.nextPageToken;
    if (!nextPageToken) break;
  }
  
  return allVideos;
};

// 3단계: 쇼츠/롱폼 분류 및 조회수 계산
export const calculateContentAnalysis = (videos: YouTubeShort[]) => {
  let shortsCount = 0;
  let longformCount = 0;
  let shortsViews = 0;
  let longformViews = 0;
  
  videos.forEach(video => {
    const durationInSeconds = parseDuration(video.duration || '');
    
    if (durationInSeconds <= 60) {
      // 60초 이하는 쇼츠
      shortsCount++;
      shortsViews += video.viewCount;
    } else {
      // 60초 초과는 롱폼
      longformCount++;
      longformViews += video.viewCount;
    }
  });
  
  return {
    csct: shortsCount,           // 쇼츠 개수
    clct: longformCount,         // 롱폼 개수
    vesv: shortsViews,           // 쇼츠 총 조회수
    velv: longformViews,         // 롱폼 총 조회수 (일단 계산된 값)
    csdr: shortsCount * 60       // 쇼츠 총 재생시간 (추정: 개수 × 60초)
  };
};

// 4단계: 비율 계산 (전체 조회수 기준으로 재계산)
export const calculateViewPercentages = (
  totalViews: number, 
  shortsViews: number
) => {
  const longformViews = Math.max(0, totalViews - shortsViews); // 전체에서 쇼츠 빼기
  
  return {
    vesv: shortsViews,
    velv: longformViews,
    vsvp: totalViews > 0 ? (shortsViews / totalViews) * 100 : 0,
    vlvp: totalViews > 0 ? (longformViews / totalViews) * 100 : 0
  };
};

// 5단계: 기타 지표 계산
export const calculateOtherMetrics = (
  channelData: any,
  contentAnalysis: any,
  viewAnalysis: any
) => {
  const now = new Date();
  const publishedDate = new Date(channelData.publishedAt);
  const ageInDays = Math.floor((now.getTime() - publishedDate.getTime()) / (1000 * 60 * 60 * 24));
  
  return {
    gavg: channelData.videoCount > 0 ? Math.round(channelData.viewCount / channelData.videoCount) : 0,
    gsub: channelData.viewCount > 0 ? (channelData.subscriberCount / channelData.viewCount) * 100 : 0,
    gvps: channelData.subscriberCount > 0 ? (channelData.viewCount / channelData.subscriberCount) * 100 : 0,
    gage: ageInDays,
    gupw: ageInDays > 0 ? (channelData.videoCount / (ageInDays / 7)) : 0,
    
    // 성장 지표 (기본값 - 실제로는 과거 데이터 필요)
    gspd: ageInDays > 0 ? (channelData.subscriberCount / ageInDays) : 0,
    gvpd: ageInDays > 0 ? (channelData.viewCount / ageInDays) : 0,
    gspm: ageInDays > 0 ? (channelData.subscriberCount / ageInDays) * 30.44 : 0,
    gspy: ageInDays > 0 ? (channelData.subscriberCount / ageInDays) * 365.25 : 0,
    gsvr: channelData.viewCount > 0 ? (channelData.subscriberCount / channelData.viewCount) * 100 : 0,
    gvir: ((channelData.viewCount > 0 && channelData.videoCount > 0) ? 
      ((channelData.subscriberCount / channelData.viewCount) * 100 * 100) + 
      ((channelData.viewCount / channelData.videoCount) / 1000000) : 0) // 바이럴 지수
  };
};

// 메인 분석 함수 - 모든 단계를 순서대로 실행
export const analyzeChannel = async (apiKey: string, channelId: string): Promise<ChannelAnalyticsData> => {
  try {
    // 1단계: 기본 데이터
    const basicData = await getBasicChannelData(apiKey, channelId);
    
    // 2단계: 최근 100개 영상
    const recentVideos = await analyzeRecent100Videos(apiKey, basicData.uploadsPlaylistId);
    
    // 3단계: 콘텐츠 분석
    const contentAnalysis = calculateContentAnalysis(recentVideos);
    
    // 4단계: 조회수 비율 재계산 (전체 조회수 기준)
    const viewAnalysis = calculateViewPercentages(basicData.viewCount, contentAnalysis.vesv);
    
    // 5단계: 기타 지표
    const otherMetrics = calculateOtherMetrics(basicData, contentAnalysis, viewAnalysis);
    
    // 최종 결과 조합
    const result: ChannelAnalyticsData = {
      channelId: channelId,
      staticData: {
        publishedAt: basicData.publishedAt
      },
      snapshots: [{
        ts: new Date().toISOString(),
        title: basicData.title,
        customUrl: basicData.customUrl,
        country: basicData.country,
        thumbnailDefault: basicData.thumbnailDefault,
        uploadsPlaylistId: basicData.uploadsPlaylistId,
        topicCategories: basicData.topicCategories.map(url => url.split('/').pop() || ''),
        viewCount: basicData.viewCount.toString(),
        videoCount: basicData.videoCount.toString(),
        
        ...otherMetrics,
        ...contentAnalysis,
        ...viewAnalysis
      }],
      subscriberHistory: [{
        month: new Date().toISOString().slice(0, 7),
        count: basicData.subscriberCount.toString()
      }],
      metadata: {
        firstCollected: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        totalCollections: 1
      }
    };
    
    return result;
    
  } catch (error) {
    console.error('Channel analysis failed:', error);
    throw error;
  }
};

// 유틸리티: YouTube 기간 형식을 초로 변환
const parseDuration = (duration: string): number => {
  if (!duration) return 0;
  
  // ISO 8601 형식 (PT1M30S) 처리
  if (duration.startsWith('PT')) {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (match) {
      const hours = parseInt(match[1] || '0');
      const minutes = parseInt(match[2] || '0');
      const seconds = parseInt(match[3] || '0');
      return hours * 3600 + minutes * 60 + seconds;
    }
  }
  
  // 포맷된 형식 (1:30) 처리
  const parts = duration.split(':').map(Number);
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1]; // MM:SS
  } else if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2]; // HH:MM:SS
  }
  
  return 0;
};
