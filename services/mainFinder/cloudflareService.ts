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
  private baseUrl = 'https://vidhunt-api.evvi-aa-aa.workers.dev'; // 실제 API URL

  // 🚀 채널 데이터 가져오기 (서버에서 + Mock 데이터 지원)
  async getChannelData(): Promise<{
    success: boolean;
    data: any[];
    message: string;
    fromCache?: boolean;
  }> {
    try {
      console.log('🌐 [INFO] 채널 데이터 가져오는 중...');

      // 1. 캐시 확인 먼저 (개발 테스트를 위해 임시로 비활성화)
      // const cachedData = cache.get<any[]>('cloudflare_channel_data');
      // if (cachedData) {
      //   console.log('📦 [INFO] 캐시된 데이터 사용');
      //   return {
      //     success: true,
      //     data: cachedData,
      //     message: '캐시된 데이터를 사용했습니다.',
      //     fromCache: true
      //   };
      // }

      // 2. 실제 API 호출 시도
      try {
        console.log('🌐 [DEBUG] API 호출 시도');
        const response = await fetch(`${this.baseUrl}/api/channels?limit=10000`, {
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
        
        // 🔍 API 응답 구조 디버깅 로그 (요약만)
        console.log('🔍 [DEBUG] API 응답 구조:', {
          hasChannels: !!result.channels,
          isArray: Array.isArray(result.channels),
          channelsLength: result.channels?.length || 0,
          responseKeys: Object.keys(result),
          firstChannelKeys: result.channels?.[0] ? Object.keys(result.channels[0]) : []
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

        // 3. 데이터 캐시 저장 (1시간)
        if (result.channels) {
          cache.set('cloudflare_channel_data', result.channels, 60 * 60 * 1000); // 1시간
          console.log('💾 [INFO] 데이터를 캐시에 저장했습니다.');
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
    }
  }

  // 🎭 개발용 Mock 데이터 (API 서버가 없을 때 사용)
  private getMockChannelData() {
    console.log('🎭 [INFO] Mock 데이터를 사용합니다.');
    
    const mockData = [
      {
        id: 'mrbeast',
        rank: 1,
        channelName: "MrBeast",
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
      },
      {
        id: 'tseries',
        rank: 2,
        channelName: "T-Series",
        category: "Music",
        subscribers: 300000000,
        yearlyGrowth: 75480000,
        monthlyGrowth: 15480000,
        dailyGrowth: 510000,
        subscribersPerVideo: 12435,
        operatingPeriod: 233,
        totalViews: 309025820000,
        avgViews: 12760000,
        videosCount: 2420,
        uploadFrequency: 70,
        country: "India",
        youtubeUrl: "https://www.youtube.com/@tseries",
        shortsTotalViews: 850000,
        longTotalViews: 289000000
      }
    ];

    // Mock 데이터도 캐시에 저장 (짧은 시간)
    cache.set('cloudflare_channel_data', mockData, 5 * 60 * 1000); // 5분

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
        
        // 🌍 국가 정보
        country: this.mapCountryCode(snapshot.country) || "기타",
        youtubeUrl: `https://www.youtube.com/channel/${channel.channelId}`,
        
        // 👁️ V그룹 - RPM 계산용 조회수 분석 (Views Analysis)
        shortsTotalViews: snapshot.vesv || 0,  // vesv → 숏폼 예상 조회수 (estimatedShortsViews)
        longTotalViews: snapshot.velv || 0,    // velv → 롱폼 예상 조회수 (estimatedLongformViews)
        shortsViewsPercentage: snapshot.vsvp !== undefined && snapshot.vsvp !== null ? snapshot.vsvp : 20,  // vsvp → 숏폼 조회수 비율 (shortsViewsPercentage)
        longformViewsPercentage: snapshot.vlvp !== undefined && snapshot.vlvp !== null ? snapshot.vlvp : 80, // vlvp → 롱폼 조회수 비율 (longformViewsPercentage)
        
        // 📈 구독자 성장 히스토리
        subscriberHistory: channel.subscriberHistory || []
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

  // 국가 코드를 전체 이름으로 매핑
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
      'CO': 'Colombia'
    };
    
    return countryMap[countryCode || ''] || countryCode || '기타';
  }

  // 🔧 설정 관리
  setWorkerUrl(url: string) {
    this.baseUrl = url;
    console.log('🌐 [INFO] Cloudflare Worker URL 설정:', url);
  }
}

// 싱글톤 인스턴스
export const cloudflareService = new CloudflareService();