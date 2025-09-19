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
    // 📊 ChannelFinder 호환 필드들 (실제 API 데이터)
    gavg?: number;        // 평균 조회수 (averageViewsPerVideo)
    gvcc?: number;        // 총 영상수 (videosCount)
    gspm?: number;        // 월간 구독자 증가수 (subsGainedPerMonth)
    gspy?: number;        // 년간 구독자 증가수 (subsGainedPerYear)
    gspd?: number;        // 일일 구독자 증가수 (subsGainedPerDay)
    gsub?: number;        // 구독 전환율 (subscriberConversionRate) - 핵심!
    vsvp?: number;        // 숏폼 조회수 비율
    vlvp?: number;        // 롱폼 조회수 비율
    vesv?: number;        // 숏폼 예상 조회수
    velv?: number;        // 롱폼 예상 조회수
  }>;
  recentThumbnailsHistory?: Array<{
    date: string;
    url: string;
    title: string;
  }>;
  dailyViewsHistory?: Array<{
    date: string;
    views: number;
    totalViews?: string; // 채널 총 조회수 (매일 갱신)
    dailyIncrease?: string; // 일간 증가량
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

// 🌍 Translation Bridge: 번역된 값을 한국어로 변환 (11개 언어 완전 지원)
function normalizeToKorean(filters: ShortsFilterState): ShortsFilterState {
  const normalizedFilters = { ...filters };

  // 1. 카테고리 정규화 (explorationI18n.ts filterAll 완전 반영)
  if (filters.category.includes('All') || filters.category.includes('すべて') ||
      filters.category.includes('全部') || filters.category.includes('सभी') ||
      filters.category.includes('Todos') || filters.category.includes('Tous') ||
      filters.category.includes('Alle') || filters.category.includes('Все')) {
    normalizedFilters.category = '전체';
  }

  // 2. 기준 정규화 (explorationI18n.ts filterViews & filterSubscribers 완전 반영)
  if (filters.criteria.includes('Views') || filters.criteria.includes('再生回数') ||
      filters.criteria.includes('观看次数') || filters.criteria.includes('दृश्य') ||
      filters.criteria.includes('Vistas') || filters.criteria.includes('Vues') ||
      filters.criteria.includes('Aufrufe') || filters.criteria.includes('Weergaven') ||
      filters.criteria.includes('Visualizações') || filters.criteria.includes('Просмотры')) {
    normalizedFilters.criteria = '조회수';
  } else if (filters.criteria.includes('Subscribers') || filters.criteria.includes('登録者') ||
             filters.criteria.includes('订阅者') || filters.criteria.includes('सब्सक्राइबर') ||
             filters.criteria.includes('Suscriptores') || filters.criteria.includes('Abonnés') ||
             filters.criteria.includes('Abonnenten') || filters.criteria.includes('Abonnees') ||
             filters.criteria.includes('Inscritos') || filters.criteria.includes('Подписчики')) {
    normalizedFilters.criteria = '구독자';
  }

  // 3. 국가 정규화 (explorationI18n.ts filterWorldwide 완전 반영)
  if (filters.country.includes('Worldwide') || filters.country.includes('世界中') ||
      filters.country.includes('全球') || filters.country.includes('विश्वव्यापी') ||
      filters.country.includes('Mundial') || filters.country.includes('Mondial') ||
      filters.country.includes('Weltweit') || filters.country.includes('Wereldwijd') ||
      filters.country.includes('По всему миру')) {
    normalizedFilters.country = '🌍 전세계';
  }

  // 4. 기간 정규화 (explorationI18n.ts 기간 번역들 완전 반영)
  if (filters.period.includes('Monthly') || filters.period.includes('月間') ||
      filters.period.includes('月度') || filters.period.includes('मासिक') ||
      filters.period.includes('Mensual') || filters.period.includes('Mensuel') ||
      filters.period.includes('Monatlich') || filters.period.includes('Maandelijks') ||
      filters.period.includes('Mensal') || filters.period.includes('Ежемесячно')) {
    normalizedFilters.period = '월간';
  } else if (filters.period.includes('Weekly') || filters.period.includes('週間') ||
             filters.period.includes('周度') || filters.period.includes('साप्ताहिक') ||
             filters.period.includes('Semanal') || filters.period.includes('Hebdomadaire') ||
             filters.period.includes('Wöchentlich') || filters.period.includes('Wekelijks') ||
             filters.period.includes('Еженедельно')) {
    normalizedFilters.period = '주간';
  } else if (filters.period.includes('Daily') || filters.period.includes('日間') ||
             filters.period.includes('日度') || filters.period.includes('दैनिक') ||
             filters.period.includes('Diario') || filters.period.includes('Quotidien') ||
             filters.period.includes('Täglich') || filters.period.includes('Dagelijks') ||
             filters.period.includes('Diário') || filters.period.includes('Ежедневно')) {
    normalizedFilters.period = '일간';
  } else if (filters.period.includes('Yearly') || filters.period.includes('年間') ||
             filters.period.includes('年度') || filters.period.includes('वार्षिक') ||
             filters.period.includes('Anual') || filters.period.includes('Annuel') ||
             filters.period.includes('Jährlich') || filters.period.includes('Jaarlijks') ||
             filters.period.includes('Ежегодно')) {
    normalizedFilters.period = '연간';
  }

  // 5. 채널 정규화 (explorationI18n.ts filterAll 완전 반영)
  if (filters.channel && (filters.channel.includes('All') || filters.channel.includes('すべて') ||
      filters.channel.includes('全部') || filters.channel.includes('सभी') ||
      filters.channel.includes('Todos') || filters.channel.includes('Tous') ||
      filters.channel.includes('Alle') || filters.channel.includes('Все'))) {
    normalizedFilters.channel = '전체';
  }

  return normalizedFilters;
}

// 🎯 Listup 데이터를 랭킹 테이블로 변환
export function convertListupToRankingData(
  listupChannels: ListupChannelData[],
  filters: ShortsFilterState,
  availableChannels: string[] = []
): RankingData[] {
  // 🌍 Translation Bridge 적용 - 모든 번역된 값을 한국어로 변환
  const normalizedFilters = normalizeToKorean(filters);

  console.log('🎬 [DEBUG] 쇼츠메이커 데이터 변환 시작:', {
    '입력데이터수': listupChannels.length,
    '원본필터': filters,
    '정규화필터': normalizedFilters,
    '사용가능채널수': availableChannels.length
  });

  if (!listupChannels || listupChannels.length === 0) {
    console.warn('⚠️ [WARNING] 변환할 데이터가 없습니다.');
    return [];
  }

  try {
    // 📅 날짜 매칭 디버깅 시작
    console.log('🔍 [DEBUG] 실제 filters 객체:', normalizedFilters);
    console.log('🔍 [DEBUG] filters.selectedDate:', normalizedFilters.selectedDate);
    console.log('🔍 [DEBUG] filters의 모든 키:', Object.keys(normalizedFilters));

    console.log('📅 [DEBUG] 날짜 매칭 시작:', {
      선택한기간: normalizedFilters.period,
      선택한날짜: normalizedFilters.date || '없음',
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

      // 카테고리 추출 (채널파인더와 동일한 로직)
      const category = extractCategory(staticData.topicCategories || snapshot.topicCategories || []);
      // 태그 생성 (카테고리 기반으로 단순화)
      const tags = generateTags(category);

      // 변화 추세 계산
      const change = calculateChange(index);

      // 날짜 필터에 맞는 썸네일 찾기 (조회수 최고값 우선)
      const getFilteredThumbnail = () => {
        if (!channel.recentThumbnailsHistory || channel.recentThumbnailsHistory.length === 0) {
          return null;
        }

        // 해당 기간의 모든 썸네일 수집
        let candidateThumbnails = channel.recentThumbnailsHistory;

        // 선택된 날짜 값이 있으면 매칭
        if (normalizedFilters.date) {
          if (normalizedFilters.date.includes('~')) {
            // 주간: 날짜 범위 체크
            const [startDate, endDate] = normalizedFilters.date.split('~');
            candidateThumbnails = channel.recentThumbnailsHistory.filter(thumb =>
              thumb.date >= startDate && thumb.date <= endDate
            );
          } else if (normalizedFilters.date.length === 7) {
            // 월간: YYYY-MM 형태 (예: "2025-09") - 해당 월의 모든 영상
            candidateThumbnails = channel.recentThumbnailsHistory.filter(thumb =>
              thumb.date.startsWith(normalizedFilters.date)
            );
          } else {
            // 일간: 정확한 날짜 매칭
            candidateThumbnails = channel.recentThumbnailsHistory.filter(thumb =>
              thumb.date === normalizedFilters.date
            );
          }
        }

        // 매칭된 썸네일이 없으면 null 반환
        if (candidateThumbnails.length === 0) {
          return null;
        }

        // ⭐ 핵심: 해당 기간에서 조회수가 가장 높은 썸네일 선택
        return candidateThumbnails.sort((a, b) => {
          const aViews = parseViews(a.viewCount || '0');
          const bViews = parseViews(b.viewCount || '0');
          return bViews - aViews;
        })[0];
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
          타겟날짜: normalizedFilters.date || '없음',
          매칭결과: matchedThumbnail ? matchedThumbnail.date : '매칭없음',
          전체날짜들: channel.recentThumbnailsHistory?.slice(0, 3).map(t => t.date) || []
        });
      }

      // 매칭되는 썸네일이 없으면 이 채널은 제외
      if (!matchedThumbnail) {
        return null;
      }

      const latestSubCount = getLatestSubscriberCount();

      // 📊 채널 총 조회수 가져오기 (dailyViewsHistory에서 최신 totalViews)
      const getLatestTotalViews = () => {
        if (!channel.dailyViewsHistory || channel.dailyViewsHistory.length === 0) {
          // dailyViewsHistory가 없으면 snapshot의 viewCount 사용 (채널 전체 조회수)
          return snapshot.viewCount || '0';
        }

        // dailyViewsHistory를 최신 날짜순으로 정렬
        const sortedHistory = channel.dailyViewsHistory.sort((a, b) => {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        });

        // 최신 totalViews 반환 (이게 총 조회수)
        return sortedHistory[0].totalViews || '0';
      };

      const totalChannelViews = getLatestTotalViews();

      return {
        rank: index + 1,
        change: change,
        title: matchedThumbnail?.title || channelName,
        tags: tags,
        date: matchedThumbnail?.date || new Date().toISOString().split('T')[0].replace(/-/g, '.'),
        views: matchedThumbnail?.viewCount || '0', // 개별 영상 조회수
        totalChannelViews: totalChannelViews, // 채널 총 조회수 (dailyViewsHistory 최신 totalViews)
        country: snapshot.country || staticData.country || null, // 국가 정보 (snapshots.country)
        vsvp: snapshot.vsvp, // 숏폼 조회수 비율
        vlvp: snapshot.vlvp, // 롱폼 조회수 비율
        vesv: snapshot.vesv?.toString(), // 숏폼 예상 조회수
        velv: snapshot.velv?.toString(), // 롱폼 예상 조회수
        channelId: channel.channelId, // 채널 ID
        // 📊 ChannelFinder 호환 실제 API 필드들 (20년차 개발자 접근법)
        gavg: snapshot.gavg, // 평균 조회수 (실제 API 데이터)
        gvcc: snapshot.videoCount, // 총 영상수 (실제 API 데이터) - JSON의 videoCount 필드 사용
        gspm: snapshot.gspm, // 월간 구독자 증가수 (실제 API 데이터)
        gspy: snapshot.gspy, // 년간 구독자 증가수 (실제 API 데이터)
        gspd: snapshot.gspd, // 일일 구독자 증가수 (실제 API 데이터)
        gsub: snapshot.gsub, // 구독 전환율 (실제 API 데이터) - 핵심!
        gage: (() => {
          console.log(`${snapshot.title} snapshot.gage:`, snapshot.gage);
          return snapshot.gage;
        })(), // 채널 나이(일) (실제 API 데이터) - 운영기간 계산용
        gupw: snapshot.gupw, // 주당 업로드 수 (실제 API 데이터) - 업로드 빈도
        thumbnail: matchedThumbnail?.url, // 썸네일 이미지 추가
        videoUrl: matchedThumbnail?.videoUrl, // 비디오 URL 추가 (YouTube 임베드용)
        channel: {
          name: channelName,
          subs: formatSubscriberCount(latestSubCount),
          avatar: snapshot.thumbnailDefault || staticData.thumbnailDefault || getChannelAvatar(staticData.title || snapshot.title || '')
        }
      };
    }).filter(Boolean); // null 값 제거

    // 📊 매칭 결과 요약 + 고조회수 데이터 확인
    const nullCount = listupChannels.length - rankingData.length;
    console.log('📊 [DEBUG] 매칭 결과 요약:', {
      전체채널: listupChannels.length + '개',
      매칭성공: rankingData.length + '개',
      매칭실패: nullCount + '개',
      성공률: Math.round((rankingData.length / listupChannels.length) * 100) + '%'
    });

    // 🔥 고조회수 영상 TOP 10 확인 (정렬 전)
    const topViews = rankingData
      .map(item => ({ title: item.title.substring(0, 30), views: item.views, parsed: parseViews(item.views) }))
      .sort((a, b) => b.parsed - a.parsed)
      .slice(0, 10);

    console.log('🔥 [DEBUG] 고조회수 TOP 10 (정렬 전 확인):', topViews);

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
              // 카테고리 추출 (채널파인더와 동일한 로직)
              const category = extractCategory(staticData.topicCategories || snapshot.topicCategories || []);
              // 태그 생성 (카테고리 기반으로 단순화)
              const tags = generateTags(category);
              const change = calculateChange(thumbnailIndex);

              // 📊 최신 구독자 수 가져오기 (subscriberHistory에서 최신 count)
              const getLatestSubscriberCount = () => {
                if (!channel.subscriberHistory || channel.subscriberHistory.length === 0) {
                  return parseInt(snapshot.subscriberCount || '0');
                }

                const sortedHistory = channel.subscriberHistory.sort((a, b) => {
                  return new Date(b.month + '-01').getTime() - new Date(a.month + '-01').getTime();
                });

                return parseInt(sortedHistory[0].count || '0');
              };

              const subscriberCount = getLatestSubscriberCount();

              // 📊 채널 총 조회수 가져오기 (dailyViewsHistory에서 최신 totalViews)
              const getLatestTotalViews = () => {
                if (!channel.dailyViewsHistory || channel.dailyViewsHistory.length === 0) {
                  return snapshot.viewCount || '0';
                }

                const sortedHistory = channel.dailyViewsHistory.sort((a, b) => {
                  return new Date(b.date).getTime() - new Date(a.date).getTime();
                });

                return sortedHistory[0].totalViews || '0';
              };

              const totalChannelViews = getLatestTotalViews();

              // 각 썸네일 데이터를 배열에 추가
              filteredData.push({
                rank: filteredData.length + 1,
                change: change,
                title: thumbnail.title || channelName,
                tags: tags,
                date: thumbnail.date,
                views: thumbnail.viewCount || '0', // 개별 영상 조회수
                totalChannelViews: totalChannelViews, // 채널 총 조회수 (dailyViewsHistory 최신 totalViews)
                country: snapshot.country || staticData.country || null, // 국가 정보 (snapshots.country)
                vsvp: snapshot.vsvp, // 숏폼 조회수 비율
                vlvp: snapshot.vlvp, // 롱폼 조회수 비율
                vesv: snapshot.vesv?.toString(), // 숏폼 예상 조회수
                velv: snapshot.velv?.toString(), // 롱폼 예상 조회수
                channelId: channel.channelId, // 채널 ID
                // 📊 ChannelFinder 호환 실제 API 필드들 (20년차 개발자 접근법)
                gavg: snapshot.gavg, // 평균 조회수 (실제 API 데이터)
                gvcc: snapshot.videoCount, // 총 영상수 (실제 API 데이터) - JSON의 videoCount 필드 사용
                gspm: snapshot.gspm, // 월간 구독자 증가수 (실제 API 데이터)
                gspy: snapshot.gspy, // 년간 구독자 증가수 (실제 API 데이터)
                gspd: snapshot.gspd, // 일일 구독자 증가수 (실제 API 데이터)
                gsub: snapshot.gsub, // 구독 전환율 (실제 API 데이터) - 핵심!
                gage: (() => {
                  console.log(`[특정채널] ${snapshot.title} snapshot.gage:`, snapshot.gage);
                  return snapshot.gage;
                })(), // 채널 나이(일) (실제 API 데이터) - 운영기간 계산용
                gupw: snapshot.gupw, // 주당 업로드 수 (실제 API 데이터) - 업로드 빈도
                thumbnail: thumbnail.url, // 영상 썸네일
                videoUrl: thumbnail.videoUrl, // 비디오 URL 추가 (YouTube 임베드용)
                channel: {
                  name: channelName,
                  subs: formatSubscriberCount(subscriberCount), // snapshot의 subscriberCount 사용
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

    // 🌍 Translation Bridge 적용: 이제 간단한 한국어 매칭만 하면 됨!

    // 카테고리 필터 (채널이 선택되지 않은 경우에만)
    if (normalizedFilters.category !== '전체' && (!normalizedFilters.channel || normalizedFilters.channel === '전체')) {
      filteredData = filteredData.filter(item =>
        item.tags.some(tag => tag.toLowerCase().includes(normalizedFilters.category.toLowerCase()))
      );
    }

    // 국가 필터
    console.log('🌍 [DEBUG] 국가 필터 체크:', {
      '정규화국가값': normalizedFilters.country,
      '원본데이터수': filteredData.length
    });

    if (normalizedFilters.country !== '🌍 전세계') {
      const targetCountryCode = getCountryCodeByDisplayName(normalizedFilters.country);
      console.log('🌍 [DEBUG] 국가 필터 적용:', {
        정규화국가: normalizedFilters.country,
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

    // 3. 정렬 - 🌍 Translation Bridge로 간단해짐!
    if (normalizedFilters.criteria === '조회수') {
      filteredData.sort((a, b) => {
        const aViews = parseViews(a.views);
        const bViews = parseViews(b.views);
        return bViews - aViews;
      });
    } else if (normalizedFilters.criteria === '구독자수') {
      filteredData.sort((a, b) => {
        const aSubCount = parseSubscribers(a.channel.subs);
        const bSubCount = parseSubscribers(b.channel.subs);
        return bSubCount - aSubCount;
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

// 🏷️ 카테고리 추출 (채널파인더에서 완전 복사)
function extractCategory(topicCategories?: string[]): string {
  if (!topicCategories || topicCategories.length === 0) return "General";

  const categoryMap: Record<string, string> = {
    'entertainment': 'Entertainment',
    'lifestyle': 'Lifestyle',
    'society': 'Society',
    'music': 'Music',
    'education': 'Education',
    'gaming': 'Gaming',
    'sports': 'Sports',
    'technology': 'Technology'
  };

  for (const topic of topicCategories) {
    const lowerTopic = topic.toLowerCase();
    for (const [key, value] of Object.entries(categoryMap)) {
      if (lowerTopic.includes(key)) {
        return value;
      }
    }
  }

  return "Entertainment"; // 기본값
}

// 🏷️ 태그 생성 (카테고리 기반으로 단순화)
function generateTags(category: string): string[] {
  const tagMap: Record<string, string> = {
    'Entertainment': '#entertainment',
    'Music': '#music',
    'Gaming': '#gaming',
    'Education': '#education',
    'Sports': '#sports',
    'Technology': '#tech',
    'Lifestyle': '#lifestyle',
    'Society': '#society',
    'General': '#general'
  };

  return [tagMap[category] || '#general'];
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

// 🔢 구독자 수 파싱 (parseViews와 동일한 로직)
function parseSubscribers(subsText: string): number {
  if (!subsText) return 0;

  const cleanText = subsText.replace(/[+,]/g, ''); // 모든 콤마와 + 제거

  if (cleanText.includes('M')) {
    return parseFloat(cleanText.replace('M', '')) * 1000000;
  } else if (cleanText.includes('K')) {
    return parseFloat(cleanText.replace('K', '')) * 1000;
  }

  return parseInt(cleanText) || 0;
}