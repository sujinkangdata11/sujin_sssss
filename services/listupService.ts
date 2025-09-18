// 🎬 Listup API 통신 서비스 (쇼츠메이커-탐험하기 전용)

// 🗄️ 지식쇼츠 전용 캐싱 인터페이스 (localStorage 기반, 1일 TTL)
interface ListupCacheEntry {
  data: any[];
  expiry: number;
}

interface ListupResponse {
  success: boolean;
  message: string;
  data?: any[];
}

class ListupService {
  private baseUrl = 'https://listup.anime-toon-7923.workers.dev';
  private cachePrefix = 'listup_';
  private cacheTTL = 24 * 60 * 60 * 1000; // 1일

  // 🗄️ 캐시에서 데이터 가져오기
  private getCacheData(key: string): any[] | null {
    try {
      const item = localStorage.getItem(this.cachePrefix + key);
      if (!item) return null;

      const entry: ListupCacheEntry = JSON.parse(item);

      // 만료 확인
      if (Date.now() > entry.expiry) {
        localStorage.removeItem(this.cachePrefix + key);
        console.log('🗑️ [INFO] 만료된 캐시 삭제:', key);
        return null;
      }

      return entry.data;
    } catch (error) {
      console.error('❌ [ERROR] 캐시 읽기 실패:', error);
      return null;
    }
  }

  // 🗄️ 캐시에 데이터 저장하기
  private setCacheData(key: string, data: any[]): void {
    try {
      const entry: ListupCacheEntry = {
        data,
        expiry: Date.now() + this.cacheTTL
      };
      localStorage.setItem(this.cachePrefix + key, JSON.stringify(entry));
      console.log('💾 [INFO] 데이터를 캐시에 저장:', key, '(TTL: 1일)');
    } catch (error) {
      console.error('❌ [ERROR] 캐시 저장 실패:', error);
    }
  }

  // 🚀 쇼츠메이커 탐험 데이터 가져오기
  async getExplorationData(): Promise<{
    success: boolean;
    data: any[];
    message: string;
    fromCache?: boolean;
  }> {
    try {
      console.log('🎬 [INFO] 쇼츠메이커 탐험 데이터 가져오는 중...');

      // 1. 캐시 확인 먼저
      const cachedData = this.getCacheData('exploration_data');
      if (cachedData) {
        console.log('📦 [INFO] 캐시된 데이터 사용 (1일 TTL)');
        return {
          success: true,
          data: cachedData,
          message: `${cachedData.length}개 캐시된 탐험 데이터 로드 완료`,
          fromCache: true
        };
      }

      // 2. API 호출 (292개 데이터 확보를 위해 limit 조정)
      const response = await fetch(`${this.baseUrl}/api/channels?limit=500`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      console.log('🔍 [DEBUG] Listup API 전체 응답:', result);
      console.log('🔍 [DEBUG] Listup API 응답 구조:', {
        hasData: !!result.data,
        hasChannels: !!result.channels,
        isArray: Array.isArray(result.data),
        isChannelsArray: Array.isArray(result.channels),
        dataLength: result.data?.length || 0,
        channelsLength: result.channels?.length || 0,
        responseKeys: Object.keys(result),
        firstItemKeys: result.data?.[0] ? Object.keys(result.data[0]) : [],
        firstChannelKeys: result.channels?.[0] ? Object.keys(result.channels[0]) : []
      });

      // API 응답이 data 속성에 채널 배열을 가지고 있는지 확인
      const isSuccess = result.data && Array.isArray(result.data);

      if (!isSuccess) {
        console.error('❌ [ERROR] Listup API 파싱 실패:', {
          hasData: !!result.data,
          hasChannels: !!result.channels,
          isArray: Array.isArray(result.data),
          isChannelsArray: Array.isArray(result.channels),
          responseType: typeof result,
          responseKeys: Object.keys(result)
        });
        throw new Error(result.message || result.error || 'Listup API에서 유효하지 않은 응답');
      }

      console.log('✅ [SUCCESS] Listup API 응답 성공:', {
        데이터수: result.data?.length || 0,
        응답키들: Object.keys(result),
        첫번째데이터키들: result.data?.[0] ? Object.keys(result.data[0]) : []
      });

      // Listup 데이터를 ChannelFinder 형태로 변환
      const transformedData = this.transformListupDataToChannelFinder(result.data || []);

      // 3. 변환된 데이터를 캐시에 저장
      this.setCacheData('exploration_data', transformedData);

      return {
        success: true,
        data: transformedData,
        message: result.message || `${transformedData.length}개 탐험 데이터 로드 완료`,
        fromCache: false
      };

    } catch (error) {
      console.error('🎬 [ERROR] Listup API 호출 실패:', error);

      // 폴백: 빈 배열 반환
      return {
        success: false,
        data: [],
        message: `Listup API 연결 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
      };
    }
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
      console.error('Listup Health check 실패:', error);
      return { online: false };
    }
  }

  // 🔄 Listup 데이터를 ChannelFinder 형태로 변환
  private transformListupDataToChannelFinder(listupChannels: any[]): any[] {
    console.log('🔄 [INFO] Listup 데이터 변환 시작:', listupChannels.length);

    return listupChannels.map((channel, index) => {
      // snapshots 배열에서 최신 데이터 추출 (보통 첫 번째 항목이 최신)
      const latestSnapshot = channel.snapshots?.[0] || {};



      return {
        channelId: channel.channelId || `listup_${index}`,
        staticData: channel.staticData || {},
        snapshots: channel.snapshots || [],
        recentThumbnailsHistory: channel.recentThumbnailsHistory || [],
        dailyViewsHistory: channel.dailyViewsHistory || [],
        subscriberHistory: channel.subscriberHistory || [],
        // 🎯 ChannelFinder 호환을 위해 최상위 레벨에 주요 필드들 추출
        rank: index + 1,
        channel: {
          name: latestSnapshot.title || latestSnapshot.customUrl || `Channel ${index + 1}`,
          subs: latestSnapshot.subscriberCount || '0',
          avatar: latestSnapshot.thumbnailDefault || ''
        },
        tags: ['GENERAL'], // 기본 태그
        date: new Date().toISOString().split('T')[0],
        views: latestSnapshot.viewCount || '0',
        country: latestSnapshot.country || '기타',
        // 🔥 핵심: gage 값을 최상위 레벨로 추출
        gage: latestSnapshot.gage || 0,
        // 기타 G그룹 필드들도 추출
        gavg: latestSnapshot.gavg || 0,
        gvcc: latestSnapshot.videoCount || 0,
        gspm: latestSnapshot.gspm || 0,
        gspy: latestSnapshot.gspy || 0,
        gspd: latestSnapshot.gspd || 0,
        gsub: latestSnapshot.gsub || 0,
        gupw: latestSnapshot.gupw || 0,
        // V그룹 필드들
        vsvp: latestSnapshot.vsvp || 75,
        vlvp: latestSnapshot.vlvp || 25,
        vesv: latestSnapshot.vesv || '0',
        velv: latestSnapshot.velv || '0'
      };
    });
  }

  // 🗑️ 캐시 삭제 (개발/디버깅용)
  clearCache(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.cachePrefix)) {
          localStorage.removeItem(key);
        }
      });
      console.log('🗑️ [INFO] 지식쇼츠 캐시 전체 삭제 완료');
    } catch (error) {
      console.error('❌ [ERROR] 캐시 삭제 실패:', error);
    }
  }

  // 🔧 설정 관리
  setWorkerUrl(url: string) {
    this.baseUrl = url;
    console.log('🎬 [INFO] Listup Worker URL 설정:', url);
  }
}

// 싱글톤 인스턴스
export const listupService = new ListupService();