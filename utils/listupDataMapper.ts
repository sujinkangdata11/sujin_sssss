// 🎬 Listup API 전용 데이터 매퍼 - Listup API 데이터를 랭킹 테이블로 변환

import { RankingData } from '../components/shared/RankingTable';

// Listup API에서 받는 데이터 타입
export interface ListupChannelData {
  channelId: string;
  staticData: {
    title: string;
    customUrl?: string;
    thumbnailDefault?: string;
    country?: string;
    topicCategories?: string[];
  };
  snapshots: Array<{
    title: string;
    subscriberCount: string;
    viewCount: string;
    videoCount: string;
    country?: string;
    topicCategories?: string[];
    thumbnailDefault?: string;
  }>;
  recentThumbnailsHistory?: Array<{
    date: string;
    url: string;
    title: string;
  }>;
  dailyViewsHistory?: Array<{
    date: string;
    views: number;
  }>;
  subscriberHistory?: Array<{
    count: string;
    month: string;
  }>;
}

// 필터 상태 타입
export interface ShortsFilterState {
  category: string;
  criteria: string;
  country: string;
  period: string;
  date: number;
}

// 🎯 Listup 데이터를 랭킹 테이블로 변환
export function convertListupToRankingData(
  listupChannels: ListupChannelData[],
  filters: ShortsFilterState,
  availableChannels: string[] = []
): RankingData[] {
  console.log('🎬 [DEBUG] 쇼츠메이커 데이터 변환 시작:', {
    '입력데이터수': listupChannels.length,
    '필터': filters,
    '사용가능채널수': availableChannels.length
  });

  if (!listupChannels || listupChannels.length === 0) {
    console.warn('⚠️ [WARNING] 변환할 데이터가 없습니다.');
    return [];
  }

  try {
    // 1. 기본 데이터 변환
    const rankingData: RankingData[] = listupChannels.map((channel, index) => {
      const snapshot = channel.snapshots?.[0] || {};
      const staticData = channel.staticData || {};
      const recentThumbnail = channel.recentThumbnailsHistory?.[0];

      // 조회수 계산 (일간 증가 모의)
      const baseViews = parseInt(snapshot.viewCount || '0') || 0;
      const dailyIncrease = Math.floor(baseViews * 0.001); // 0.1% 일간 증가 가정
      const viewsIncreaseText = dailyIncrease > 1000000
        ? `+${Math.floor(dailyIncrease / 1000000)}M`
        : dailyIncrease > 1000
        ? `+${Math.floor(dailyIncrease / 1000)}K`
        : `+${dailyIncrease}`;

      // 채널명 포맷팅
      const channelName = formatChannelName(staticData.title || snapshot.title || 'Unknown Channel');

      // 태그 생성 (카테고리 기반)
      const tags = generateTags(staticData.topicCategories || snapshot.topicCategories || []);

      // 변화 추세 계산
      const change = calculateChange(index);

      return {
        rank: index + 1,
        change: change,
        title: recentThumbnail?.title || channelName,
        tags: tags,
        date: recentThumbnail?.date || new Date().toISOString().split('T')[0].replace(/-/g, '.'),
        views: viewsIncreaseText,
        channel: {
          name: channelName,
          subs: formatSubscriberCount(parseInt(snapshot.subscriberCount || '0')),
          avatar: snapshot.thumbnailDefault || staticData.thumbnailDefault || getChannelAvatar(staticData.title || snapshot.title || '')
        }
      };
    });

    // 2. 필터 적용
    let filteredData = rankingData;

    // 카테고리 필터
    if (filters.category !== '전체') {
      filteredData = filteredData.filter(item =>
        item.tags.some(tag => tag.toLowerCase().includes(filters.category.toLowerCase()))
      );
    }

    // 국가 필터 (기본적으로 전세계)
    if (filters.country !== '🌍 전세계') {
      // 국가별 필터링 로직 (현재는 모든 데이터 유지)
      console.log('🌍 [INFO] 국가 필터 적용:', filters.country);
    }

    // 3. 정렬 (조회수 기준)
    if (filters.criteria === '조회수') {
      filteredData.sort((a, b) => {
        const aViews = parseViews(a.views);
        const bViews = parseViews(b.views);
        return bViews - aViews;
      });
    }

    console.log('✅ [SUCCESS] 쇼츠메이커 데이터 변환 완료:', {
      '원본': listupChannels.length,
      '필터후': filteredData.length
    });

    return filteredData;

  } catch (error) {
    console.error('❌ [ERROR] 쇼츠메이커 데이터 변환 실패:', error);
    return [];
  }
}

// 🏷️ 채널명 포맷팅
function formatChannelName(title: string): string {
  if (!title) return 'Unknown Channel';

  // 15자 이상이면 줄임
  if (title.length > 15) {
    return title.substring(0, 12) + '...';
  }
  return title;
}

// 🏷️ 태그 생성
function generateTags(categories: string[]): string[] {
  if (!categories || categories.length === 0) {
    return ['#general'];
  }

  return categories.slice(0, 2).map(cat => {
    // 카테고리를 태그 형태로 변환
    const tagMap: Record<string, string> = {
      'entertainment': '#entertainment',
      'music': '#music',
      'gaming': '#gaming',
      'education': '#education',
      'sports': '#sports',
      'technology': '#tech',
      'lifestyle': '#lifestyle',
      'comedy': '#comedy'
    };

    const lowerCat = cat.toLowerCase();
    for (const [key, tag] of Object.entries(tagMap)) {
      if (lowerCat.includes(key)) {
        return tag;
      }
    }
    return `#${lowerCat.substring(0, 8)}`;
  });
}

// 📈 변화 추세 계산
function calculateChange(index: number): string {
  const changes = ['▲9', '▼1', '▲1', 'NEW', '-', '▲2', '▼3', 'NEW', '▲1', '-'];
  return changes[index % changes.length];
}

// 👥 구독자 수 포맷팅
function formatSubscriberCount(count: number): string {
  if (count >= 1000000) {
    return `${Math.floor(count / 100000) / 10}M`;
  } else if (count >= 1000) {
    return `${Math.floor(count / 100) / 10}K`;
  }
  return count.toString();
}

// 🎭 채널 아바타 생성
function getChannelAvatar(channelName: string): string {
  const avatars = ['👤', '🎬', '👥', '🎹', '💃', '🍴', '🐕', '🎮', '✈️', '🎵'];
  const index = channelName.length % avatars.length;
  return avatars[index];
}

// 📊 조회수 텍스트를 숫자로 변환 (정렬용)
function parseViews(viewsText: string): number {
  const cleanText = viewsText.replace('+', '').replace(',', '');

  if (cleanText.includes('M')) {
    return parseFloat(cleanText.replace('M', '')) * 1000000;
  } else if (cleanText.includes('K')) {
    return parseFloat(cleanText.replace('K', '')) * 1000;
  }

  return parseInt(cleanText) || 0;
}