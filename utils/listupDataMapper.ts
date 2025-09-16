// 🎬 Listup API 전용 데이터 매퍼 - Listup API 데이터를 랭킹 테이블로 변환

import { RankingData } from '../components/shared/RankingTable';
import { getCountryCodeByDisplayName } from './listupCountry';

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
    // 📅 날짜 매칭 디버깅 시작
    console.log('🔍 [DEBUG] 실제 filters 객체:', filters);
    console.log('🔍 [DEBUG] filters.selectedDate:', filters.selectedDate);
    console.log('🔍 [DEBUG] filters의 모든 키:', Object.keys(filters));

    console.log('📅 [DEBUG] 날짜 매칭 시작:', {
      선택한기간: filters.period,
      선택한날짜: filters.date || '없음',
      전체채널수: listupChannels.length
    });

    // 1. 기본 데이터 변환 (null 값 필터링)
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

      // 날짜 필터에 맞는 썸네일 찾기 (날짜 값 기반)
      const getFilteredThumbnail = () => {
        if (!channel.recentThumbnailsHistory || channel.recentThumbnailsHistory.length === 0) {
          return null;
        }

        // 선택된 날짜 값이 있으면 매칭
        if (filters.date) {
          if (filters.date.includes('~')) {
            // 주간: 날짜 범위 체크
            const [startDate, endDate] = filters.date.split('~');
            return channel.recentThumbnailsHistory.find(thumb =>
              thumb.date >= startDate && thumb.date <= endDate
            ) || null;
          } else {
            // 일간: 정확한 날짜 매칭
            return channel.recentThumbnailsHistory.find(thumb =>
              thumb.date === filters.date
            ) || null;
          }
        }

        // 폴백: 첫 번째 썸네일
        return channel.recentThumbnailsHistory[0] || null;
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

      // 디버깅: 처음 5개 채널의 매칭 상황 확인
      if (index < 5) {
        console.log(`📊 [DEBUG] 채널 ${index + 1} 매칭 상황:`, {
          채널명: staticData.title || snapshot.title || 'Unknown',
          타겟날짜: filters.date || '없음',
          매칭결과: matchedThumbnail ? matchedThumbnail.date : '매칭없음',
          전체날짜들: channel.recentThumbnailsHistory?.slice(0, 3).map(t => t.date) || []
        });
      }

      // 매칭되는 썸네일이 없으면 이 채널은 제외
      if (!matchedThumbnail) {
        return null;
      }

      const latestSubCount = getLatestSubscriberCount();

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
          avatar: snapshot.thumbnailDefault || staticData.thumbnailDefault || getChannelAvatar(staticData.title || snapshot.title || '')
        }
      };
    }).filter(Boolean); // null 값 제거

    // 📊 매칭 결과 요약
    const nullCount = listupChannels.length - rankingData.length;
    console.log('📊 [DEBUG] 매칭 결과 요약:', {
      전체채널: listupChannels.length + '개',
      매칭성공: rankingData.length + '개',
      매칭실패: nullCount + '개',
      성공률: Math.round((rankingData.length / listupChannels.length) * 100) + '%'
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

    // 국가 필터
    if (filters.country !== '🌍 전세계') {
      const targetCountryCode = getCountryCodeByDisplayName(filters.country);
      console.log('🌍 [DEBUG] 국가 필터 적용:', {
        선택된국가: filters.country,
        타겟국가코드: targetCountryCode
      });

      if (targetCountryCode) {
        filteredData = filteredData.filter(item => {
          // 해당 채널의 국가 코드를 확인
          const channelData = listupChannels.find(ch =>
            (ch.staticData?.title || ch.snapshots?.[0]?.title) === item.channel.name
          );
          const channelCountry = channelData?.snapshots?.[0]?.country;

          // null 값 처리
          const normalizedCountry = channelCountry || 'null';

          return normalizedCountry === targetCountryCode;
        });

        console.log('🌍 [INFO] 국가 필터링 완료:', {
          국가코드: targetCountryCode,
          필터후결과: filteredData.length + '개'
        });
      }
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
  const cleanText = viewsText.replace(/[+,]/g, ''); // 모든 콤마와 + 제거

  if (cleanText.includes('M')) {
    return parseFloat(cleanText.replace('M', '')) * 1000000;
  } else if (cleanText.includes('K')) {
    return parseFloat(cleanText.replace('K', '')) * 1000;
  }

  return parseInt(cleanText) || 0;
}