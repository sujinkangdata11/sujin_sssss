// 채널파인더 데이터를 Step1 랭킹 테이블 형태로 변환하는 유틸리티

import { RankingData } from '../components/shared/RankingTable';

// 채널파인더에서 받는 데이터 타입 (cloudflareService 기반)
export interface ChannelFinderData {
  id: string;
  rank: number;
  channelName: string;
  channelHandle?: string;
  thumbnailUrl?: string;
  category: string;
  subscribers: number;
  yearlyGrowth: number;
  monthlyGrowth: number;
  dailyGrowth: number;
  subscribersPerVideo: number;
  operatingPeriod: number;
  totalViews: number;
  avgViews: number;
  videosCount: number;
  uploadFrequency: number;
  country: string;
  youtubeUrl: string;
  shortsTotalViews: number;
  longTotalViews: number;
  shortsViewsPercentage?: number;
  longformViewsPercentage?: number;
  subscriberHistory?: Array<{ count: string; month: string }>;
  recentThumbnailsHistory?: Array<{ date: string; url: string; title: string }>;
}

// 필터 상태 타입
export interface DataFilterState {
  category: string;
  criteria: string;
  country: string;
  period: string;
  date: number;
}

// 채널파인더 데이터를 Step1 랭킹 형태로 변환
export const convertToRankingData = (
  channelData: ChannelFinderData[],
  filters: DataFilterState,
  channelList?: string[]
): RankingData[] => {
  // 1. 필터링 적용
  let filteredData = applyFilters(channelData, filters, channelList);

  // 2. 정렬 (기준에 따라)
  filteredData = applySorting(filteredData, filters.criteria);

  // 3. 상위 50개 선택 (5페이지 × 10개) - 데이터가 부족하면 가능한 만큼만
  const maxResults = Math.min(50, filteredData.length);
  const topResults = filteredData.slice(0, maxResults);

  // 4. RankingData 형태로 변환 - 각 채널의 7일치 썸네일을 모두 개별 항목으로 생성
  const allRankingItems: any[] = [];

  topResults.forEach((channel, channelIndex) => {
    const recentThumbnails = channel.recentThumbnailsHistory || [];

    if (recentThumbnails.length > 0) {
      // 각 썸네일마다 개별 랭킹 항목 생성
      recentThumbnails.forEach((thumbnail, thumbnailIndex) => {
        allRankingItems.push({
          rank: allRankingItems.length + 1,
          change: generateRankChange(),
          title: thumbnail.title || generateVideoTitle(channel),
          tags: generateTags(channel.category),
          date: thumbnail.date || generateDate(filters.period, filters.date),
          views: formatViews(channel.totalViews), // 항상 조회수만 표시
          thumbnail: thumbnail.url,
          channel: {
            name: formatChannelName(channel.channelName),
            subs: formatSubscribers(channel.subscribers),
            avatar: channel.thumbnailUrl || '👤'
          }
        });
      });
    } else {
      // 썸네일이 없는 경우 채널 기본 정보만
      allRankingItems.push({
        rank: allRankingItems.length + 1,
        change: generateRankChange(),
        title: generateVideoTitle(channel),
        tags: generateTags(channel.category),
        date: generateDate(filters.period, filters.date),
        views: formatViews(channel.totalViews), // 항상 조회수만 표시
        thumbnail: null,
        channel: {
          name: formatChannelName(channel.channelName),
          subs: formatSubscribers(channel.subscribers),
          avatar: channel.thumbnailUrl || '👤'
        }
      });
    }
  });

  return allRankingItems;
};

// 필터 적용 함수
const applyFilters = (
  data: ChannelFinderData[],
  filters: DataFilterState,
  channelList?: string[]
): ChannelFinderData[] => {
  let filtered = [...data];

  // 채널명(핸들명) 필터
  if (filters.category === '전체') {
    // [전체] 선택시: 모든 채널 표시 (필터링 안함)
    // channelList 조건 제거하여 모든 실제 데이터 표시
  } else {
    // 특정 채널 선택시: 해당 채널만 표시
    filtered = filtered.filter(channel => {
      // @ 핸들명으로 필터링 (예: @wchinapost)
      if (filters.category.startsWith('@')) {
        return channel.channelHandle === filters.category;
      }
      // 기존 카테고리 필터링 (폴백)
      return channel.category === filters.category;
    });
  }

  console.log('🔍 [DEBUG] 필터링 전 데이터:', filtered.length + '개');
  console.log('🔍 [DEBUG] 선택된 국가:', filters.country);
  console.log('🔍 [DEBUG] 데이터의 국가들:', [...new Set(filtered.map(ch => ch.country))]);

  // 국가 필터
  if (filters.country !== '🌍 전세계') {
    const countryMap: Record<string, string> = {
      '🇰🇷 한국': 'KR',
      '🇺🇸 미국': 'US',
      '🇯🇵 일본': 'JP',
      '🇨🇳 중국': 'CN',
      '🇮🇳 인도': 'IN',
      '🇧🇷 브라질': 'BR',
      '🇩🇪 독일': 'DE',
      '🇫🇷 프랑스': 'FR',
      '🇬🇧 영국': 'GB',
      '🇨🇦 캐나다': 'CA',
      '🇦🇺 호주': 'AU',
      '🇷🇺 러시아': 'RU',
      '🇮🇩 인도네시아': 'ID',
      '🇲🇽 멕시코': 'MX',
      '🇮🇹 이탈리아': 'IT',
      '🇪🇸 스페인': 'ES'
    };

    if (filters.country === '🌐 기타') {
      // "기타" 선택시: 매핑되지 않은 국가 또는 null/undefined인 채널들
      const mappedCountryCodes = Object.values(countryMap);
      filtered = filtered.filter(channel =>
        !channel.country ||
        channel.country === '' ||
        !mappedCountryCodes.includes(channel.country)
      );
    } else {
      const targetCountry = countryMap[filters.country];
      console.log('🔍 국가 필터링:', filters.country, '→', targetCountry);

      if (targetCountry) {
        const beforeFilter = filtered.length;
        filtered = filtered.filter(channel => channel.country === targetCountry);
        console.log('🔍 필터 결과:', beforeFilter, '→', filtered.length, '개');
      }
    }
  }

  return filtered;
};

// 정렬 적용 함수
const applySorting = (
  data: ChannelFinderData[],
  criteria: string
): ChannelFinderData[] => {
  return [...data].sort((a, b) => {
    switch (criteria) {
      case '조회수':
        return b.totalViews - a.totalViews;
      case '구독자수':
        return b.subscribers - a.subscribers;
      default:
        return b.totalViews - a.totalViews;
    }
  });
};

// 기준에 따른 조회수/구독자수 반환
const getRelevantViews = (channel: ChannelFinderData, criteria: string): number => {
  switch (criteria) {
    case '조회수':
      return channel.totalViews;
    case '구독자수':
      return channel.subscribers;
    default:
      return channel.totalViews;
  }
};

// 랭킹 변동 생성 (랜덤)
const generateRankChange = (): string => {
  const changes = ['▲1', '▲2', '▲3', '▼1', '▼2', '▼3', 'NEW', '-'];
  return changes[Math.floor(Math.random() * changes.length)];
};

// 채널 기반 가상 비디오 제목 생성
const generateVideoTitle = (channel: ChannelFinderData): string => {
  const templates = [
    `${channel.channelName}의 최신 영상`,
    `인기 급상승! ${channel.category} 컨텐츠`,
    `구독자 ${formatSubscribers(channel.subscribers)} 달성 기념`,
    `${channel.category} 분야 TOP 영상`,
    `화제의 ${channel.channelName} 신작`
  ];
  return templates[Math.floor(Math.random() * templates.length)];
};

// 카테고리 기반 태그 생성
const generateTags = (category: string): string[] => {
  const tagMap: Record<string, string[]> = {
    'Music': ['#music', '#trending'],
    'Entertainment': ['#entertainment', '#viral'],
    'Gaming': ['#gaming', '#gameplay'],
    'Education': ['#education', '#learning'],
    'Comedy': ['#comedy', '#funny'],
    'Sports': ['#sports', '#highlights'],
    'News & Politics': ['#news', '#politics'],
    'Science & Technology': ['#tech', '#science']
  };

  return tagMap[category] || ['#trending', '#viral'];
};

// 필터 기간과 날짜에 따른 날짜 생성
const generateDate = (period: string, dateOffset: number): string => {
  const today = new Date();
  let targetDate = new Date(today);

  switch (period) {
    case '일간':
      targetDate.setDate(today.getDate() - dateOffset);
      break;
    case '주간':
      targetDate.setDate(today.getDate() - (dateOffset * 7));
      break;
    case '월간':
      targetDate.setMonth(today.getMonth() - dateOffset);
      break;
    case '연간':
      targetDate.setFullYear(today.getFullYear() - dateOffset);
      break;
  }

  const year = targetDate.getFullYear();
  const month = String(targetDate.getMonth() + 1).padStart(2, '0');
  const day = String(targetDate.getDate()).padStart(2, '0');

  return `${year}.${month}.${day}`;
};

// 조회수 포맷팅 (한국 단위)
const formatViews = (views: number): string => {
  if (views >= 100000000) { // 1억 이상
    const eok = Math.floor(views / 100000000);
    const man = Math.floor((views % 100000000) / 10000);
    return man > 0 ? `+${eok}억${man}만` : `+${eok}억`;
  } else if (views >= 10000) { // 1만 이상
    const man = Math.floor(views / 10000);
    const cheon = Math.floor((views % 10000) / 1000);
    return cheon > 0 ? `+${man}만${cheon}천` : `+${man}만`;
  } else if (views >= 1000) { // 1천 이상
    const cheon = Math.floor(views / 1000);
    const baek = Math.floor((views % 1000) / 100);
    return baek > 0 ? `+${cheon}천${baek}백` : `+${cheon}천`;
  } else {
    return `+${views}`;
  }
};

// 구독자수 포맷팅 (한국 단위)
const formatSubscribers = (subscribers: number): string => {
  if (subscribers >= 100000000) { // 1억 이상
    const eok = Math.floor(subscribers / 100000000);
    const man = Math.floor((subscribers % 100000000) / 10000);
    return man > 0 ? `${eok}억${man}만` : `${eok}억`;
  } else if (subscribers >= 10000) { // 1만 이상
    const man = Math.floor(subscribers / 10000);
    const cheon = Math.floor((subscribers % 10000) / 1000);
    return cheon > 0 ? `${man}만${cheon}천` : `${man}만`;
  } else if (subscribers >= 1000) { // 1천 이상
    const cheon = Math.floor(subscribers / 1000);
    const baek = Math.floor((subscribers % 1000) / 100);
    return baek > 0 ? `${cheon}천${baek}백` : `${cheon}천`;
  } else {
    return subscribers.toString();
  }
};

// 채널명 포맷팅 (20자 제한)
const formatChannelName = (name: string): string => {
  return name.length > 12 ? `${name.substring(0, 12)}...` : name;
};