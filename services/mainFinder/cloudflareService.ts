// 🌐 Cloudflare Workers API 통신 서비스
import { cache } from './cache';

interface CloudflareResponse {
  success: boolean;
  message: string;
  metadata?: {
    totalFilesFound: number;
    downloadedCount: number;
    lastUpdated: string;
    folderId: string;
  };
  channels?: any[];
  debug?: {
    fileNames: string[];
    errors: any[];
  };
}

class CloudflareService {
  private baseUrl = 'https://vidhunt-api.evvi-aa-aa.workers.dev'; // 채널파인더 API URL
  private isLoading = false; // 중복 호출 방지 플래그
  private currentLoadPromise: Promise<{
    success: boolean;
    data: any[];
    message: string;
    fromCache?: boolean;
  }> | null = null;

  // 🚀 채널 데이터 가져오기 (서버에서 + Mock 데이터 지원)
  async getChannelData(): Promise<{
    success: boolean;
    data: any[];
    message: string;
    fromCache?: boolean;
  }> {
    if (this.isLoading && this.currentLoadPromise) {
      console.log('🔁 [INFO] 기존 로딩 Promise 재사용');
      return this.currentLoadPromise;
    }

    if (this.isLoading) {
      console.warn('⚠️ [WARNING] 로딩 플래그가 예상치 못한 상태입니다. 초기화 후 재시도합니다.');
    }

    const load = async () => {
      try {
        this.isLoading = true;
        console.log('🌐 [INFO] 채널 데이터 가져오는 중...');

        // 1. 캐시 확인 먼저 (3일 TTL)
        const cachedData = cache.get<any[]>('cloudflare_channel_data');
        if (cachedData && Array.isArray(cachedData) && cachedData.length > 0) {
          console.log('📦 [INFO] 캐시된 데이터 사용 (3일 TTL)');
          const transformedChannels = this.transformApiDataToUIFormat(cachedData);
          return {
            success: true,
            data: transformedChannels,
            message: `${cachedData.length}개 캐시된 데이터 로드 완료`,
            fromCache: true
          };
        }

        // 2. totalChannels 값 파악 (파라미터 없이 기본 요청)
        try {
          console.log('🔍 [DEBUG] 1단계: 파라미터 없이 API 호출해서 totalChannels 확인');
          const firstResponse = await fetch(`${this.baseUrl}/api/channels`, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            signal: AbortSignal.timeout(30000)
          });

          if (!firstResponse.ok) {
            throw new Error(`HTTP ${firstResponse.status}: ${firstResponse.statusText}`);
          }

          const firstResult = await firstResponse.json();

          // 🎯 최상위 레벨에서 totalChannels 값 추출 (핵심!)
          let totalChannels = firstResult.totalChannels || firstResult.totalMatches || firstResult.totalInDatabase || 0;

          console.log('🔍 [DEBUG] 🎯 최상위에서 totalChannels 값 확인:', {
            'totalChannels': totalChannels,
            'lastUpdated': firstResult.lastUpdated,
            '이제_배치처리할_총개수': totalChannels
          });

          if (!totalChannels || totalChannels === 0) {
            console.error('❌ [ERROR] totalChannels를 찾을 수 없음 - 폴백 처리');
            throw new Error('totalChannels 값이 유효하지 않음');
          }

          console.log(`📊 [SUCCESS] 전체 채널 수 확인: ${totalChannels}개`);

          // 2. 페이지네이션 순회 기반 배치 처리
          console.log('🚀 [INFO] 스마트 배치 처리 시작 (offset 기반 페이지네이션)...');

          const batchSize = 1000;
          const seenChannelIds = new Set<string>();
          let allChannels: any[] = [];
          let successfulBatches = 0;
          let currentOffset = 0;
          let hasMore = true;
          let safetyCounter = 0;

          while (hasMore) {
            safetyCounter++;
            if (safetyCounter > 200) {
              console.warn('⚠️ [WARNING] 예상치 못한 페이지네이션 루프 감지, 안전하게 중단합니다.');
              break;
            }

            const remaining = totalChannels - allChannels.length;
            const currentBatchSize = remaining > 0 ? Math.min(batchSize, remaining) : batchSize;

            console.log(`📦 [BATCH ${successfulBatches + 1}] offset=${currentOffset}, limit=${currentBatchSize}`);

            try {
              const apiUrl = `${this.baseUrl}/api/channels?limit=${currentBatchSize}&offset=${currentOffset}`;
              console.log(`🔍 [BATCH ${successfulBatches + 1}] API URL:`, apiUrl);

              const batchResponse = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json'
                },
                signal: AbortSignal.timeout(30000)
              });

              if (!batchResponse.ok) {
                throw new Error(`HTTP ${batchResponse.status}: ${batchResponse.statusText}`);
              }

              const batchResult = await batchResponse.json();
              const batchChannels: any[] = Array.isArray(batchResult.channels) ? batchResult.channels : [];

              if (!totalChannels && typeof batchResult.totalMatches === 'number') {
                totalChannels = batchResult.totalMatches;
              }

              const pageInfo = batchResult.page || {};
              console.log('🧭 [BATCH 페이지 정보]', {
                offset: pageInfo.offset ?? currentOffset,
                nextOffset: pageInfo.nextOffset,
                hasMore: pageInfo.hasMore,
                totalMatches: batchResult.totalMatches,
                totalInDatabase: batchResult.totalInDatabase
              });

              const prevSeenCount = seenChannelIds.size;
              for (const channel of batchChannels) {
                const channelId = channel?.channelId;
                if (!channelId || seenChannelIds.has(channelId)) continue;
                seenChannelIds.add(channelId);
                allChannels.push(channel);
              }
              const batchAdded = seenChannelIds.size - prevSeenCount;

              if (batchChannels.length > 0) {
                const firstChannelId = batchChannels[0]?.channelId || 'unknown';
                console.log(`✅ [BATCH ${successfulBatches + 1}] ${batchAdded}개 채널 추가 (첫 ID: ${firstChannelId}, 누적: ${allChannels.length})`);
              } else {
                console.warn(`⚠️ [BATCH ${successfulBatches + 1}] 응답에 채널이 없습니다. (누적 ${allChannels.length})`);
              }

              if (batchAdded > 0) {
                successfulBatches++;
              }

              const nextOffsetFromServer = typeof pageInfo.nextOffset === 'number' ? pageInfo.nextOffset : null;
              const hasMoreFromServer = typeof pageInfo.hasMore === 'boolean' ? pageInfo.hasMore : null;

              hasMore = hasMoreFromServer !== null ? hasMoreFromServer : (batchChannels.length === currentBatchSize && batchChannels.length > 0);

              if (!hasMore) {
                console.log('🛑 [BATCH] 서버에서 더 이상의 페이지가 없다고 응답했습니다.');
                break;
              }

              const computedNextOffset = nextOffsetFromServer !== null ? nextOffsetFromServer : currentOffset + currentBatchSize;

              if (computedNextOffset <= currentOffset) {
                console.warn('⚠️ [WARNING] nextOffset이 현재 offset 이하입니다. 루프를 중단합니다.');
                break;
              }

              currentOffset = computedNextOffset;

            } catch (batchError) {
              console.error(`❌ [BATCH ${successfulBatches + 1}] API 호출 실패:`, batchError);
              break;
            }

            await new Promise(resolve => setTimeout(resolve, 100));
          }

          console.log(`🎯 [COMPLETE] 배치 처리 완료 (중복 제거 전):`, {
            성공배치: successfulBatches,
            수집채널수: allChannels.length,
            예상채널수: totalChannels
          });

          // 중복 제거 (안전장치)
          console.log('🔧 [INFO] 중복 제거 시작...');
          const uniqueChannelsMap = new Map();

          for (const channel of allChannels) {
            const channelId = channel.channelId;
            if (channelId && !uniqueChannelsMap.has(channelId)) {
              uniqueChannelsMap.set(channelId, channel);
            }
          }

          const uniqueChannels = Array.from(uniqueChannelsMap.values());

          console.log(`✅ [SUCCESS] 중복 제거 완료:`, {
            원본개수: allChannels.length,
            중복제거후: uniqueChannels.length,
            중복개수: allChannels.length - uniqueChannels.length
          });

          allChannels = uniqueChannels;

          // 배치 처리 결과를 기존 형태로 변환
          const result = {
            channels: allChannels,
            totalChannels: totalChannels,
            message: `배치 처리로 ${allChannels.length}개 채널 로드 완료`
          };

          // 🔍 API 응답 구조 디버깅 로그 (요약만)
          console.log('🔍 [DEBUG] 전체 데이터 응답 구조:', {
            hasChannels: !!result.channels,
            isArray: Array.isArray(result.channels),
            channelsLength: result.channels?.length || 0,
            예상개수: totalChannels,
            일치여부: result.channels?.length === totalChannels
          });

          // API 응답이 성공인지 확인 (channels 배열만 확인)
          const isSuccess = result.channels && Array.isArray(result.channels);

          if (!isSuccess) {
            console.error('❌ [ERROR] API 파싱 실패:', {
              hasChannels: !!result.channels,
              isArray: Array.isArray(result.channels),
              responseType: typeof result,
              responseKeys: Object.keys(result)
            });
            throw new Error(result.message || result.error || 'API에서 유효하지 않은 응답');
          }

          console.log('✅ [SUCCESS] API 응답 성공:', {
            채널수: result.channels?.length || 0,
            응답키들: Object.keys(result),
            첫번째채널키들: result.channels?.[0] ? Object.keys(result.channels[0]) : []
          });

          // 3. 데이터 캐시 저장 (3일)
          if (result.channels) {
            cache.set('cloudflare_channel_data', result.channels, 3 * 24 * 60 * 60 * 1000); // 3일
            console.log('💾 [INFO] 데이터를 캐시에 저장했습니다 (3일 TTL).');
          }

          // 4. API 데이터를 UI가 기대하는 형태로 변환
          const transformedChannels = this.transformApiDataToUIFormat(result.channels || []);

          return {
            success: true,
            data: transformedChannels,
            message: result.message || `${result.channels?.length || 0}개 채널 로드 완료`
          };

      } catch (apiError) {
        // API 실패시 Mock 데이터로 폴백
        console.warn('🌐 [WARNING] API 호출 실패, Mock 데이터 사용:', apiError);
        return this.getMockChannelData();
      }

    } catch (error) {
      console.error('🌐 [ERROR] 전체 프로세스 오류:', error);
      // 최종 폴백: Mock 데이터
      return this.getMockChannelData();
    } finally {
      this.isLoading = false;
      this.currentLoadPromise = null;
    }
  };

    const promise = load();
    this.currentLoadPromise = promise;
    return promise;
  }

  // 🎭 개발용 Mock 데이터 (API 서버가 없을 때 사용)
  private getMockChannelData() {
    console.log('🎭 [INFO] Mock 데이터를 사용합니다.');

    const mockData = [
      // Top 10 (데이터 1)
      {
        id: 'mrbeast',
        rank: 1,
        channelName: "MrBeast",
        channelHandle: "@MrBeast",
        category: "Entertainment",
        subscribers: 424000000,
        yearlyGrowth: 125480000,
        monthlyGrowth: 31390000,
        dailyGrowth: 1040000,
        subscribersPerVideo: 470000,
        operatingPeriod: 162,
        totalViews: 93991060000,
        avgViews: 104900000,
        videosCount: 896,
        uploadFrequency: 1,
        country: "United States",
        youtubeUrl: "https://www.youtube.com/@MrBeast",
        shortsTotalViews: 1750000,
        longTotalViews: 462800000
      }
    ];

    // Mock 데이터도 캐시에 저장 (3일)
    cache.set('cloudflare_channel_data', mockData, 3 * 24 * 60 * 60 * 1000); // 3일

    return {
      success: true,
      data: mockData,
      message: '개발용 Mock 데이터입니다. (API 서버 연결 실패로 인한 폴백)'
    };
  }

  // 🔍 서버 상태 확인
  async checkHealth(): Promise<{ online: boolean; timestamp?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/health`);
      const data = await response.json();

      return {
        online: response.ok && data.status === 'ok',
        timestamp: data.timestamp
      };
    } catch (error) {
      console.error('Health check 실패:', error);
      return { online: false };
    }
  }

  // 🔄 API 데이터를 UI 형태로 변환 (새로운 JSON 구조 대응)
  private transformApiDataToUIFormat(apiChannels: any[]): any[] {
    return apiChannels.map((channel, index) => {
      // 🔍 실제 채널 JSON 구조 (원본 형태)
      const snapshot = channel.snapshots?.[0] || channel.latestSnapshot || {};  // snapshots[0] 우선, 없으면 latestSnapshot
      const staticData = channel.staticData || {};
      const subscriberHistory = channel.subscriberHistory?.[0] || {};

      // 🚨 디버깅: 구독자 데이터 접근 확인
      if (index === 0) {
        console.log('🔍 [DEBUG] 구독자 데이터 디버깅:', {
          'channel.subscriberHistory': channel.subscriberHistory,
          'subscriberHistory': subscriberHistory,
          'subscriberHistory.count': subscriberHistory.count,
          'parseInt결과': parseInt(subscriberHistory.count || '0'),
          '전체채널구조': Object.keys(channel),
          '스냅샷구조': Object.keys(snapshot),
          '전체채널데이터': channel,
          '스냅샷데이터': snapshot
        });
      }

      return {
        id: channel.channelId || `channel_${index}`,
        rank: index + 1,
        channelName: snapshot.title || staticData.title || 'Unknown Channel',
        channelHandle: snapshot.customUrl || '',
        thumbnailUrl: snapshot.thumbnailDefault || '',
        category: this.extractCategory(snapshot.topicCategories) || "General",

        // 📊 기본 정보 - 원본 JSON 구조 (문자열 → 숫자 변환)
        subscribers: parseInt(subscriberHistory.count || '0') || channel.subscriberCount || 0,  // subscriberHistory.count 우선
        totalViews: parseInt(snapshot.viewCount || '0') || channel.viewCount || 0,              // snapshot.viewCount 우선
        videosCount: parseInt(snapshot.videoCount || '0') || channel.videoCount || 0,           // snapshot.videoCount 우선

        // 📊 G그룹 - 일반 성과 지표 (General Performance)
        avgViews: snapshot.gavg || 0,  // gavg → 평균 조회수 (averageViewsPerVideo)

        // 📈 성장 지표 (Growth Metrics) - G그룹
        yearlyGrowth: snapshot.gspy || 0,    // gspy → 년간 구독자 증가수 (subsGainedPerYear)
        monthlyGrowth: snapshot.gspm || 0,   // gspm → 월간 구독자 증가수 (subsGainedPerMonth)
        dailyGrowth: snapshot.gspd || 0,     // gspd → 일일 구독자 증가수 (subsGainedPerDay)

        // 📊 추가 G그룹 지표들 - 정확한 매핑!
        subscribersPerVideo: snapshot.gsub || 0, // gsub → 구독 전환율 (subscriberConversionRate) - 기존 계산식 삭제
        operatingPeriod: Math.round((snapshot.gage || 0) / 30), // gage → 채널 나이(일) → 운영기간(월) 변환 (channelAgeInDays)
        uploadFrequency: snapshot.gupw || 0, // gupw → 주당 업로드 수 (uploadsPerWeek)

        // 🌍 국가 정보 (코드를 영어명으로 변환)
        country: this.mapCountryCode(snapshot.country) || '기타',
        youtubeUrl: `https://www.youtube.com/channel/${channel.channelId}`,

        // 👁️ V그룹 - RPM 계산용 조회수 분석 (Views Analysis)
        shortsTotalViews: snapshot.vesv || 0,  // vesv → 숏폼 예상 조회수 (estimatedShortsViews)
        longTotalViews: snapshot.velv || 0,    // velv → 롱폼 예상 조회수 (estimatedLongformViews)
        shortsViewsPercentage: snapshot.vsvp !== undefined && snapshot.vsvp !== null ? snapshot.vsvp : 20,  // vsvp → 숏폼 조회수 비율 (shortsViewsPercentage)
        longformViewsPercentage: snapshot.vlvp !== undefined && snapshot.vlvp !== null ? snapshot.vlvp : 80, // vlvp → 롱폼 조회수 비율 (longformViewsPercentage)

        // 📈 구독자 성장 히스토리
        subscriberHistory: channel.subscriberHistory || [],

        // 🎬 최근 썸네일 히스토리 (7일치)
        recentThumbnailsHistory: channel.recentThumbnailsHistory || []
      };
    });
  }

  // 카테고리 추출 (topicCategories에서)
  private extractCategory(topicCategories?: string[]): string {
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

  // 🌍 국가 코드를 영어명으로 매핑 (ChannelFinder와 호환)
  private mapCountryCode(countryCode?: string): string {
    const countryMap: Record<string, string> = {
      'US': 'United States',
      'KR': 'South Korea',
      'JP': 'Japan',
      'CN': 'China',
      'IN': 'India',
      'GB': 'United Kingdom',
      'CA': 'Canada',
      'AU': 'Australia',
      'DE': 'Germany',
      'FR': 'France',
      'BR': 'Brazil',
      'MX': 'Mexico',
      'ES': 'Spain',
      'IT': 'Italy',
      'RU': 'Russia',
      'PE': 'Peru',
      'AR': 'Argentina',
      'CL': 'Chile',
      'CO': 'Colombia',
      'HK': 'Hong Kong',
      'ID': 'Indonesia',
      'NL': 'Netherlands',
      'SE': 'Sweden',
      'NO': 'Norway',
      'DK': 'Denmark',
      'FI': 'Finland',
      'CH': 'Switzerland',
      'AT': 'Austria',
      'BE': 'Belgium',
      'PT': 'Portugal',
      'IE': 'Ireland',
      'IL': 'Israel',
      'EG': 'Egypt',
      'ZA': 'South Africa',
      'SG': 'Singapore',
      'TW': 'Taiwan',
      'TR': 'Turkey',
      'PH': 'Philippines',
      'PK': 'Pakistan',
      'NZ': 'New Zealand'
    };

    return countryMap[countryCode || ''] || '기타';
  }

  // 🔁 offset이 무시될 때 전체 데이터를 한 번에 가져오는 폴백 로직
  private async fetchAllChannelsWithSingleRequest(totalChannels: number): Promise<any[]> {
    const safeLimit = Math.max(totalChannels, 1000);
    const fallbackUrl = `${this.baseUrl}/api/channels?limit=${safeLimit}&ts=${Date.now()}`;
    console.log('🌐 [FALLBACK] offset 미지원 감지 → 전체 데이터 단일 호출 시도:', fallbackUrl);

    const response = await fetch(fallbackUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      signal: AbortSignal.timeout(30000)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    const fallbackChannels: any[] = Array.isArray(result.channels)
      ? result.channels
      : Array.isArray(result.data)
        ? result.data
        : [];

    if (!fallbackChannels.length) {
      console.error('❌ [FALLBACK] 단일 호출 응답 구조가 올바르지 않습니다:', Object.keys(result));
      throw new Error('폴백 요청에서 채널 데이터를 찾을 수 없습니다.');
    }

    const uniqueMap = new Map<string, any>();
    for (const channel of fallbackChannels) {
      const channelId = channel?.channelId;
      if (!channelId || uniqueMap.has(channelId)) continue;
      uniqueMap.set(channelId, channel);
    }

    const uniqueChannels = Array.from(uniqueMap.values());
    console.log('🌐 [FALLBACK] 단일 호출 완료:', {
      응답채널수: fallbackChannels.length,
      중복제거후: uniqueChannels.length
    });

    return uniqueChannels;
  }

  // ⏱️ 단일 호출 후에도 배치 처리가 필요한 경우를 위한 클라이언트 사이드 시뮬레이션
  private async simulateClientSideBatchProcessing(channels: any[], batchSize: number, delayMs: number): Promise<any[]> {
    const aggregated: any[] = [];
    const totalBatches = Math.ceil(channels.length / batchSize) || 1;

    console.log('⏱️ [FALLBACK] 클라이언트 사이드 배치 시뮬레이션 시작:', {
      총채널수: channels.length,
      배치크기: batchSize,
      총배치수: totalBatches
    });

    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
      const start = batchIndex * batchSize;
      const end = start + batchSize;
      const chunk = channels.slice(start, end);
      if (!chunk.length) continue;

      aggregated.push(...chunk);
      console.log(`⏱️ [FALLBACK BATCH ${batchIndex + 1}/${totalBatches}] ${chunk.length}개 누적 (총 ${aggregated.length}개)`);

      if (delayMs > 0 && batchIndex < totalBatches - 1) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }

    return aggregated;
  }

  // 🔧 설정 관리
  setWorkerUrl(url: string) {
    this.baseUrl = url;
    console.log('🌐 [INFO] Cloudflare Worker URL 설정:', url);
  }
}

// 싱글톤 인스턴스
export const cloudflareService = new CloudflareService();
