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
  channel?: string;
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

      // 날짜 필터에 맞는 썸네일 찾기
      const getFilteredThumbnail = () => {
        if (!channel.recentThumbnailsHistory || channel.recentThumbnailsHistory.length === 0) {
          return null;
        }

        const currentDate = new Date();
        let targetDate: string;

        // 필터 조건에 따른 날짜 계산
        if (filters.period === '일간') {
          // 일간: 현재 날짜에서 selectedDate만큼 뺀 날짜
          const target = new Date(currentDate);
          target.setDate(currentDate.getDate() - filters.date);
          targetDate = target.toISOString().split('T')[0]; // YYYY-MM-DD 형태
        } else if (filters.period === '주간') {
          // 주간 필터링 범위 (고정)
          // - 1주차: 1일~7일 (selectedDate: 0)
          // - 2주차: 8일~15일 (selectedDate: 1)
          // - 3주차: 16일~22일 (selectedDate: 2)
          // - 4주차: 23일~월말까지 (selectedDate: 3)
          const weekRanges = [
            [1, 7],   // 1주차
            [8, 15],  // 2주차
            [16, 22], // 3주차
            [23, 31]  // 4주차 (월말까지)
          ];

          const [startDay, endDay] = weekRanges[filters.date] || [1, 7];
          const currentMonth = currentDate.getMonth() + 1;
          const currentYear = currentDate.getFullYear();

          // 해당 주차 범위 내의 썸네일 찾기
          return channel.recentThumbnailsHistory.find(thumbnail => {
            const thumbnailDate = new Date(thumbnail.date);
            const day = thumbnailDate.getDate();
            const month = thumbnailDate.getMonth() + 1;
            const year = thumbnailDate.getFullYear();

            return year === currentYear && month === currentMonth &&
                   day >= startDay && day <= endDay;
          }) || channel.recentThumbnailsHistory[0];
        } else if (filters.period === '월간') {
          // 월간: 현재 월에서 selectedDate만큼 뺀 월
          const target = new Date(currentDate);
          target.setMonth(currentDate.getMonth() - filters.date);
          const targetMonth = target.toISOString().slice(0, 7); // YYYY-MM 형태

          return channel.recentThumbnailsHistory.find(thumbnail =>
            thumbnail.date.startsWith(targetMonth)
          ) || channel.recentThumbnailsHistory[0];
        }

        // 일간의 경우 정확한 날짜 매칭
        return channel.recentThumbnailsHistory.find(thumbnail =>
          thumbnail.date === targetDate
        ) || channel.recentThumbnailsHistory[0];
      };

      // 최신 구독자 수 가져오기 (subscriberHistory에서)
      const getLatestSubscriberCount = () => {
        if (!channel.subscriberHistory || channel.subscriberHistory.length === 0) {
          return parseInt(snapshot.subscriberCount || '0');
        }

        const sortedHistory = channel.subscriberHistory.sort((a, b) => {
          return new Date(b.month + '-01').getTime() - new Date(a.month + '-01').getTime();
        });

        const latestSubscriber = sortedHistory[0];
        return parseInt(latestSubscriber.count || '0');
      };

      const matchedThumbnail = getFilteredThumbnail();
      const latestSubCount = getLatestSubscriberCount();

      console.log('🎬 [DEBUG] 썸네일 매칭 결과:', {
        채널명: channelName,
        필터: `${filters.period} ${filters.date}`,
        매칭된썸네일: matchedThumbnail ? {
          date: matchedThumbnail.date,
          title: matchedThumbnail.title,
          viewCount: matchedThumbnail.viewCount
        } : null
      });

      return {
        rank: index + 1,
        change: change,
        title: matchedThumbnail?.title || channelName,
        tags: tags,
        date: matchedThumbnail?.date || new Date().toISOString().split('T')[0].replace(/-/g, '.'),
        views: matchedThumbnail?.viewCount || '0',
        thumbnail: matchedThumbnail?.url, // 썸네일 이미지 추가
        channel: {
          name: channelName,
          subs: formatSubscriberCount(latestSubCount),
          avatar: matchedThumbnail?.url || snapshot.thumbnailDefault || staticData.thumbnailDefault || getChannelAvatar(staticData.title || snapshot.title || '')
        }
      };
    });

    // 2. 필터 적용
    let filteredData = rankingData;

    // 채널 필터 (우선 적용) - 정확한 채널명 매칭
    if (filters.channel && filters.channel !== '전체') {
      // 원본 채널 데이터에서 정확한 채널명으로 매칭
      const matchedChannels = listupChannels.filter(channel => {
        const channelTitle = channel.staticData?.title || channel.snapshots?.[0]?.title || '';
        return channelTitle === filters.channel;
      });

      console.log('📺 [DEBUG] 매칭된 채널 데이터:', {
        검색채널명: filters.channel,
        매칭된채널수: matchedChannels.length,
        매칭된채널들: matchedChannels.map(ch => ch.staticData?.title || ch.snapshots?.[0]?.title)
      });

      if (matchedChannels.length > 0) {
        // 매칭된 채널의 모든 썸네일 데이터를 변환 (각 썸네일마다 하나의 행)
        filteredData = [];

        matchedChannels.forEach((channel) => {
          if (channel.recentThumbnailsHistory && channel.recentThumbnailsHistory.length > 0) {
            // 날짜 기준으로 정렬 (최신순)
            const sortedThumbnails = channel.recentThumbnailsHistory.sort((a, b) =>
              new Date(b.date).getTime() - new Date(a.date).getTime()
            );

            // 각 썸네일을 개별 행으로 변환
            sortedThumbnails.forEach((thumbnail, thumbnailIndex) => {
              const snapshot = channel.snapshots?.[0] || {};
              const staticData = channel.staticData || {};

              const channelName = formatChannelName(staticData.title || snapshot.title || 'Unknown Channel');
              const tags = generateTags(staticData.topicCategories || snapshot.topicCategories || []);
              const change = calculateChange(thumbnailIndex);

              // 최신 구독자 수 가져오기
              const getLatestSubscriberCount = () => {
                if (!channel.subscriberHistory || channel.subscriberHistory.length === 0) {
                  return parseInt(snapshot.subscriberCount || '0');
                }

                const sortedHistory = channel.subscriberHistory.sort((a, b) => {
                  return new Date(b.month + '-01').getTime() - new Date(a.month + '-01').getTime();
                });

                return parseInt(sortedHistory[0].count || '0');
              };

              const latestSubCount = getLatestSubscriberCount();

              // 각 썸네일 데이터를 배열에 추가
              filteredData.push({
                rank: filteredData.length + 1,
                change: change,
                title: thumbnail.title || channelName,
                tags: tags,
                date: thumbnail.date,
                views: thumbnail.viewCount || '0',
                thumbnail: thumbnail.url, // 영상 썸네일
                channel: {
                  name: channelName,
                  subs: formatSubscriberCount(latestSubCount),
                  avatar: snapshot.thumbnailDefault || staticData.thumbnailDefault || getChannelAvatar(staticData.title || snapshot.title || '') // 채널 프로필 이미지 (동일)
                }
              });
            });
          }
        });

        console.log('📺 [SUCCESS] 채널 필터링 완료:', filters.channel, '결과:', filteredData.length + '개');
      } else {
        console.warn('📺 [WARNING] 매칭되는 채널을 찾을 수 없습니다:', filters.channel);
        filteredData = [];
      }
    }

    // 카테고리 필터 (채널이 선택되지 않은 경우에만)
    if (filters.category !== '전체' && (!filters.channel || filters.channel === '전체')) {
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