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

  // 4. RankingData 형태로 변환
  return topResults.map((channel, index) => ({
    rank: index + 1,
    change: generateRankChange(), // 랜덤한 변동 표시
    title: '', // 제목 데이터 없음
    tags: [], // 태그 없음
    date: '', // 날짜 없음
    views: formatViews(getRelevantViews(channel, filters.criteria)),
    channel: {
      name: formatChannelName(channel.channelName),
      subs: formatSubscribers(channel.subscribers),
      avatar: channel.thumbnailUrl || '👤' // 실제 프로필 이미지 또는 기본 아바타
    }
  }));
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
    // [전체] 선택시: channelList에 있는 채널들만 표시
    if (channelList && channelList.length > 0) {
      filtered = filtered.filter(channel =>
        channelList.includes(channel.channelHandle || '')
      );
    }
  } else {
    // 특정 채널 선택시: 해당 채널만 표시
    filtered = filtered.filter(channel => {
      // @ 핸들명으로 필터링 (예: @TED)
      if (filters.category.startsWith('@')) {
        return channel.channelHandle === filters.category;
      }
      // 기존 카테고리 필터링 (폴백)
      return channel.category === filters.category;
    });
  }

  // 국가 필터
  if (filters.country !== '🌍 전세계') {
    const countryMap: Record<string, string> = {
      '🇰🇷 한국': 'South Korea',
      '🇺🇸 미국': 'United States',
      '🇯🇵 일본': 'Japan',
      '🇨🇳 중국': 'CN', // 실제 데이터에서 중국이 CN으로 저장되었을 가능성
      '🇮🇳 인도': 'India',
      '🇧🇷 브라질': 'Brazil',
      '🇩🇪 독일': 'Germany',
      '🇫🇷 프랑스': 'France',
      '🇬🇧 영국': 'United Kingdom',
      '🇨🇦 캐나다': 'Canada',
      '🇦🇺 호주': 'Australia',
      '🇷🇺 러시아': 'Russia',
      '🇮🇩 인도네시아': 'Indonesia',
      '🇲🇽 멕시코': 'Mexico',
      '🇮🇹 이탈리아': 'Italy',
      '🇪🇸 스페인': 'Spain'
    };
    const targetCountry = countryMap[filters.country];
    console.log('🔍 국가 필터링:', filters.country, '→', targetCountry);

    // 실제 데이터에 있는 모든 국가 확인
    const allCountries = [...new Set(data.map(ch => ch.country))];
    console.log('🌍 실제 데이터의 모든 국가:', allCountries);

    if (targetCountry) {
      const beforeFilter = filtered.length;
      filtered = filtered.filter(channel => channel.country === targetCountry);
      console.log('🔍 필터 결과:', beforeFilter, '→', filtered.length, '개');
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

// 조회수 포맷팅
const formatViews = (views: number): string => {
  if (views >= 1000000000) {
    return `+${(views / 1000000000).toFixed(1)}B`;
  } else if (views >= 1000000) {
    return `+${(views / 1000000).toFixed(1)}M`;
  } else if (views >= 1000) {
    return `+${(views / 1000).toFixed(1)}K`;
  } else {
    return `+${views}`;
  }
};

// 구독자수 포맷팅
const formatSubscribers = (subscribers: number): string => {
  if (subscribers >= 1000000) {
    return `${(subscribers / 1000000).toFixed(1)}M`;
  } else if (subscribers >= 1000) {
    return `${(subscribers / 1000).toFixed(0)}K`;
  } else {
    return subscribers.toString();
  }
};

// 채널명 포맷팅 (20자 제한)
const formatChannelName = (name: string): string => {
  return name.length > 12 ? `${name.substring(0, 12)}...` : name;
};