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
        const response = await fetch(`${this.baseUrl}/api/channels?limit=200000`, {
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
      },
      {
        id: 'tseries',
        rank: 2,
        channelName: "T-Series",
        channelHandle: "@tseries",
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
      },
      {
        id: 'pewdiepie',
        rank: 3,
        channelName: "PewDiePie",
        channelHandle: "@pewdiepie",
        category: "Gaming",
        subscribers: 111000000,
        yearlyGrowth: 5000000,
        monthlyGrowth: 450000,
        dailyGrowth: 15000,
        subscribersPerVideo: 250000,
        operatingPeriod: 156,
        totalViews: 29500000000,
        avgViews: 6500000,
        videosCount: 4540,
        uploadFrequency: 3,
        country: "United Kingdom",
        youtubeUrl: "https://www.youtube.com/@pewdiepie",
        shortsTotalViews: 320000,
        longTotalViews: 140000000
      },
      {
        id: 'liziqi',
        rank: 4,
        channelName: "李子柒 Liziqi",
        channelHandle: "@cnliziqi",
        category: "Lifestyle",
        subscribers: 17800000,
        yearlyGrowth: 2500000,
        monthlyGrowth: 200000,
        dailyGrowth: 6500,
        subscribersPerVideo: 95000,
        operatingPeriod: 98,
        totalViews: 2850000000,
        avgViews: 15800000,
        videosCount: 180,
        uploadFrequency: 2,
        country: "China",
        youtubeUrl: "https://www.youtube.com/@cnliziqi",
        shortsTotalViews: 450000,
        longTotalViews: 142500000
      },
      {
        id: 'kpop-music',
        rank: 5,
        channelName: "K-POP Music",
        channelHandle: "@kpop-music",
        category: "Music",
        subscribers: 12400000,
        yearlyGrowth: 3200000,
        monthlyGrowth: 280000,
        dailyGrowth: 9200,
        subscribersPerVideo: 85000,
        operatingPeriod: 76,
        totalViews: 1920000000,
        avgViews: 8700000,
        videosCount: 220,
        uploadFrequency: 4,
        country: "South Korea",
        youtubeUrl: "https://www.youtube.com/@kpop-music",
        shortsTotalViews: 380000,
        longTotalViews: 96000000
      },
      {
        id: 'dude-perfect',
        rank: 6,
        channelName: "Dude Perfect",
        category: "Sports",
        subscribers: 59800000,
        yearlyGrowth: 8500000,
        monthlyGrowth: 720000,
        dailyGrowth: 24000,
        subscribersPerVideo: 180000,
        operatingPeriod: 144,
        totalViews: 15200000000,
        avgViews: 45600000,
        videosCount: 333,
        uploadFrequency: 1,
        country: "United States",
        youtubeUrl: "https://www.youtube.com/@dudeperfect",
        shortsTotalViews: 280000,
        longTotalViews: 76000000
      },
      {
        id: 'bts',
        rank: 7,
        channelName: "BANGTANTV",
        category: "Music",
        subscribers: 75200000,
        yearlyGrowth: 12000000,
        monthlyGrowth: 1000000,
        dailyGrowth: 33000,
        subscribersPerVideo: 280000,
        operatingPeriod: 132,
        totalViews: 21800000000,
        avgViews: 81300000,
        videosCount: 268,
        uploadFrequency: 2,
        country: "South Korea",
        youtubeUrl: "https://www.youtube.com/@bangtantv",
        shortsTotalViews: 520000,
        longTotalViews: 109000000
      },
      {
        id: 'blackpink',
        rank: 8,
        channelName: "BLACKPINK",
        category: "Music",
        subscribers: 95100000,
        yearlyGrowth: 18000000,
        monthlyGrowth: 1500000,
        dailyGrowth: 50000,
        subscribersPerVideo: 420000,
        operatingPeriod: 88,
        totalViews: 35400000000,
        avgViews: 157000000,
        videosCount: 226,
        uploadFrequency: 1,
        country: "South Korea",
        youtubeUrl: "https://www.youtube.com/@blackpink",
        shortsTotalViews: 720000,
        longTotalViews: 177000000
      },
      {
        id: 'kids-diana',
        rank: 9,
        channelName: "Kids Diana Show",
        category: "Entertainment",
        subscribers: 121000000,
        yearlyGrowth: 25000000,
        monthlyGrowth: 2100000,
        dailyGrowth: 70000,
        subscribersPerVideo: 89000,
        operatingPeriod: 72,
        totalViews: 103000000000,
        avgViews: 75700000,
        videosCount: 1361,
        uploadFrequency: 12,
        country: "United States",
        youtubeUrl: "https://www.youtube.com/@kidsdianashow",
        shortsTotalViews: 1200000,
        longTotalViews: 515000000
      },
      {
        id: 'cocomelon',
        rank: 10,
        channelName: "Cocomelon",
        category: "Education",
        subscribers: 179000000,
        yearlyGrowth: 35000000,
        monthlyGrowth: 2900000,
        dailyGrowth: 97000,
        subscribersPerVideo: 220000,
        operatingPeriod: 84,
        totalViews: 191000000000,
        avgViews: 234000000,
        videosCount: 816,
        uploadFrequency: 6,
        country: "United States",
        youtubeUrl: "https://www.youtube.com/@cocomelon",
        shortsTotalViews: 1800000,
        longTotalViews: 955000000
      },
      // 11-20 (데이터 2)
      {
        id: 'jake-paul',
        rank: 11,
        channelName: "Jake Paul",
        category: "Entertainment",
        subscribers: 20500000,
        yearlyGrowth: 2800000,
        monthlyGrowth: 235000,
        dailyGrowth: 7800,
        subscribersPerVideo: 45000,
        operatingPeriod: 96,
        totalViews: 7800000000,
        avgViews: 17100000,
        videosCount: 456,
        uploadFrequency: 3,
        country: "United States",
        youtubeUrl: "https://www.youtube.com/@jakepaul",
        shortsTotalViews: 180000,
        longTotalViews: 39000000
      },
      {
        id: 'markiplier',
        rank: 12,
        channelName: "Markiplier",
        category: "Gaming",
        subscribers: 36200000,
        yearlyGrowth: 4500000,
        monthlyGrowth: 375000,
        dailyGrowth: 12500,
        subscribersPerVideo: 68000,
        operatingPeriod: 132,
        totalViews: 19800000000,
        avgViews: 3700000,
        videosCount: 5351,
        uploadFrequency: 5,
        country: "United States",
        youtubeUrl: "https://www.youtube.com/@markiplier",
        shortsTotalViews: 250000,
        longTotalViews: 99000000
      },
      {
        id: 'jisoo-kim',
        rank: 13,
        channelName: "지수 김 JISOO KIM",
        category: "Lifestyle",
        subscribers: 8900000,
        yearlyGrowth: 1200000,
        monthlyGrowth: 100000,
        dailyGrowth: 3300,
        subscribersPerVideo: 25000,
        operatingPeriod: 48,
        totalViews: 1400000000,
        avgViews: 3900000,
        videosCount: 359,
        uploadFrequency: 4,
        country: "South Korea",
        youtubeUrl: "https://www.youtube.com/@jisookim",
        shortsTotalViews: 120000,
        longTotalViews: 70000000
      },
      {
        id: 'canal-kondzilla',
        rank: 14,
        channelName: "Canal KondZilla",
        category: "Music",
        subscribers: 67800000,
        yearlyGrowth: 9500000,
        monthlyGrowth: 792000,
        dailyGrowth: 26400,
        subscribersPerVideo: 180000,
        operatingPeriod: 108,
        totalViews: 41200000000,
        avgViews: 109000000,
        videosCount: 378,
        uploadFrequency: 2,
        country: "Brazil",
        youtubeUrl: "https://www.youtube.com/@canalkondZilla",
        shortsTotalViews: 680000,
        longTotalViews: 206000000
      },
      {
        id: 'sony-music-india',
        rank: 15,
        channelName: "Sony Music India",
        category: "Music",
        subscribers: 63400000,
        yearlyGrowth: 8900000,
        monthlyGrowth: 742000,
        dailyGrowth: 24700,
        subscribersPerVideo: 95000,
        operatingPeriod: 156,
        totalViews: 58900000000,
        avgViews: 88200000,
        videosCount: 668,
        uploadFrequency: 8,
        country: "India",
        youtubeUrl: "https://www.youtube.com/@sonymusicindia",
        shortsTotalViews: 590000,
        longTotalViews: 294500000
      },
      {
        id: 'emma-chamberlain',
        rank: 16,
        channelName: "Emma Chamberlain",
        category: "Lifestyle",
        subscribers: 12100000,
        yearlyGrowth: 1700000,
        monthlyGrowth: 142000,
        dailyGrowth: 4700,
        subscribersPerVideo: 35000,
        operatingPeriod: 72,
        totalViews: 2300000000,
        avgViews: 6600000,
        videosCount: 348,
        uploadFrequency: 2,
        country: "United States",
        youtubeUrl: "https://www.youtube.com/@emmachamberlain",
        shortsTotalViews: 140000,
        longTotalViews: 115000000
      },
      {
        id: 'elrubiusomg',
        rank: 17,
        channelName: "ElrubiusOMG",
        category: "Gaming",
        subscribers: 40900000,
        yearlyGrowth: 5200000,
        monthlyGrowth: 433000,
        dailyGrowth: 14400,
        subscribersPerVideo: 85000,
        operatingPeriod: 144,
        totalViews: 9800000000,
        avgViews: 20300000,
        videosCount: 482,
        uploadFrequency: 2,
        country: "Spain",
        youtubeUrl: "https://www.youtube.com/@elrubiusomg",
        shortsTotalViews: 190000,
        longTotalViews: 49000000
      },
      {
        id: 'logan-paul',
        rank: 18,
        channelName: "Logan Paul",
        category: "Entertainment",
        subscribers: 23800000,
        yearlyGrowth: 3200000,
        monthlyGrowth: 267000,
        dailyGrowth: 8900,
        subscribersPerVideo: 52000,
        operatingPeriod: 108,
        totalViews: 6100000000,
        avgViews: 13400000,
        videosCount: 456,
        uploadFrequency: 2,
        country: "United States",
        youtubeUrl: "https://www.youtube.com/@loganpaul",
        shortsTotalViews: 150000,
        longTotalViews: 30500000
      },
      {
        id: 'jeenie-weenie',
        rank: 19,
        channelName: "Jeenie Weenie",
        category: "Entertainment",
        subscribers: 7400000,
        yearlyGrowth: 980000,
        monthlyGrowth: 82000,
        dailyGrowth: 2700,
        subscribersPerVideo: 18000,
        operatingPeriod: 60,
        totalViews: 1200000000,
        avgViews: 2900000,
        videosCount: 414,
        uploadFrequency: 5,
        country: "Canada",
        youtubeUrl: "https://www.youtube.com/@jeenieweenie",
        shortsTotalViews: 95000,
        longTotalViews: 60000000
      },
      {
        id: 'hype-house',
        rank: 20,
        channelName: "Hype House",
        category: "Entertainment",
        subscribers: 19200000,
        yearlyGrowth: 2600000,
        monthlyGrowth: 217000,
        dailyGrowth: 7200,
        subscribersPerVideo: 42000,
        operatingPeriod: 48,
        totalViews: 4800000000,
        avgViews: 10500000,
        videosCount: 457,
        uploadFrequency: 7,
        country: "United States",
        youtubeUrl: "https://www.youtube.com/@hypehouse",
        shortsTotalViews: 180000,
        longTotalViews: 24000000
      },
      // 21-30 (데이터 3)
      {
        id: 'joji',
        rank: 21,
        channelName: "Joji",
        category: "Music",
        subscribers: 9800000,
        yearlyGrowth: 1300000,
        monthlyGrowth: 108000,
        dailyGrowth: 3600,
        subscribersPerVideo: 28000,
        operatingPeriod: 84,
        totalViews: 2900000000,
        avgViews: 8300000,
        videosCount: 349,
        uploadFrequency: 1,
        country: "Japan",
        youtubeUrl: "https://www.youtube.com/@joji",
        shortsTotalViews: 110000,
        longTotalViews: 145000000
      },
      {
        id: 'bbc-news',
        rank: 22,
        channelName: "BBC News",
        category: "News & Politics",
        subscribers: 16900000,
        yearlyGrowth: 2200000,
        monthlyGrowth: 183000,
        dailyGrowth: 6100,
        subscribersPerVideo: 12000,
        operatingPeriod: 168,
        totalViews: 8900000000,
        avgViews: 630000,
        videosCount: 14127,
        uploadFrequency: 45,
        country: "United Kingdom",
        youtubeUrl: "https://www.youtube.com/@bbcnews",
        shortsTotalViews: 75000,
        longTotalViews: 445000000
      },
      {
        id: 'ted',
        rank: 23,
        channelName: "TED",
        channelHandle: "@TED",
        category: "Education",
        subscribers: 22800000,
        yearlyGrowth: 2900000,
        monthlyGrowth: 242000,
        dailyGrowth: 8100,
        subscribersPerVideo: 6800,
        operatingPeriod: 180,
        totalViews: 4600000000,
        avgViews: 1370000,
        videosCount: 3357,
        uploadFrequency: 15,
        country: "United States",
        youtubeUrl: "https://www.youtube.com/@ted",
        shortsTotalViews: 85000,
        longTotalViews: 230000000
      },
      {
        id: 'pewdiepie-japan',
        rank: 24,
        channelName: "Hikakin TV",
        category: "Entertainment",
        subscribers: 11700000,
        yearlyGrowth: 1500000,
        monthlyGrowth: 125000,
        dailyGrowth: 4200,
        subscribersPerVideo: 32000,
        operatingPeriod: 156,
        totalViews: 14800000000,
        avgViews: 40600000,
        videosCount: 364,
        uploadFrequency: 4,
        country: "Japan",
        youtubeUrl: "https://www.youtube.com/@hikakin",
        shortsTotalViews: 350000,
        longTotalViews: 740000000
      },
      {
        id: 'germany-youtuber',
        rank: 25,
        channelName: "Julien Bam",
        category: "Entertainment",
        subscribers: 5900000,
        yearlyGrowth: 780000,
        monthlyGrowth: 65000,
        dailyGrowth: 2200,
        subscribersPerVideo: 25000,
        operatingPeriod: 120,
        totalViews: 2200000000,
        avgViews: 9300000,
        videosCount: 236,
        uploadFrequency: 1,
        country: "Germany",
        youtubeUrl: "https://www.youtube.com/@julienbam",
        shortsTotalViews: 120000,
        longTotalViews: 110000000
      },
      {
        id: 'france-youtuber',
        rank: 26,
        channelName: "Squeezie",
        category: "Gaming",
        subscribers: 18500000,
        yearlyGrowth: 2400000,
        monthlyGrowth: 200000,
        dailyGrowth: 6700,
        subscribersPerVideo: 48000,
        operatingPeriod: 144,
        totalViews: 19900000000,
        avgViews: 51500000,
        videosCount: 386,
        uploadFrequency: 3,
        country: "France",
        youtubeUrl: "https://www.youtube.com/@squeezie",
        shortsTotalViews: 420000,
        longTotalViews: 995000000
      },
      {
        id: 'australia-youtuber',
        rank: 27,
        channelName: "LazarBeam",
        category: "Gaming",
        subscribers: 21300000,
        yearlyGrowth: 2800000,
        monthlyGrowth: 233000,
        dailyGrowth: 7800,
        subscribersPerVideo: 55000,
        operatingPeriod: 108,
        totalViews: 7400000000,
        avgViews: 19100000,
        videosCount: 387,
        uploadFrequency: 2,
        country: "Australia",
        youtubeUrl: "https://www.youtube.com/@lazarbeam",
        shortsTotalViews: 290000,
        longTotalViews: 370000000
      },
      {
        id: 'russia-youtuber',
        rank: 28,
        channelName: "А4",
        category: "Entertainment",
        subscribers: 42800000,
        yearlyGrowth: 5600000,
        monthlyGrowth: 467000,
        dailyGrowth: 15600,
        subscribersPerVideo: 92000,
        operatingPeriod: 72,
        totalViews: 23800000000,
        avgViews: 51200000,
        videosCount: 465,
        uploadFrequency: 8,
        country: "Russia",
        youtubeUrl: "https://www.youtube.com/@a4",
        shortsTotalViews: 580000,
        longTotalViews: 1190000000
      },
      {
        id: 'indonesia-youtuber',
        rank: 29,
        channelName: "Atta Halilintar",
        category: "Entertainment",
        subscribers: 25900000,
        yearlyGrowth: 3400000,
        monthlyGrowth: 283000,
        dailyGrowth: 9400,
        subscribersPerVideo: 42000,
        operatingPeriod: 84,
        totalViews: 5700000000,
        avgViews: 9200000,
        videosCount: 620,
        uploadFrequency: 12,
        country: "Indonesia",
        youtubeUrl: "https://www.youtube.com/@attahalilintar",
        shortsTotalViews: 210000,
        longTotalViews: 285000000
      },
      {
        id: 'mexico-youtuber',
        rank: 30,
        channelName: "Luisito Comunica",
        category: "Travel & Events",
        subscribers: 41200000,
        yearlyGrowth: 5400000,
        monthlyGrowth: 450000,
        dailyGrowth: 15000,
        subscribersPerVideo: 85000,
        operatingPeriod: 96,
        totalViews: 8900000000,
        avgViews: 18300000,
        videosCount: 486,
        uploadFrequency: 3,
        country: "Mexico",
        youtubeUrl: "https://www.youtube.com/@luisitocomunica",
        shortsTotalViews: 320000,
        longTotalViews: 445000000
      },
      // 31-40 (데이터 4)
      {
        id: 'italy-youtuber',
        rank: 31,
        channelName: "Favij",
        category: "Gaming",
        subscribers: 6200000,
        yearlyGrowth: 820000,
        monthlyGrowth: 68000,
        dailyGrowth: 2300,
        subscribersPerVideo: 18000,
        operatingPeriod: 132,
        totalViews: 3400000000,
        avgViews: 9900000,
        videosCount: 343,
        uploadFrequency: 2,
        country: "Italy",
        youtubeUrl: "https://www.youtube.com/@favij",
        shortsTotalViews: 140000,
        longTotalViews: 170000000
      },
      {
        id: 'tech-channel-1',
        rank: 32,
        channelName: "Marques Brownlee",
        channelHandle: "@mkbhd",
        category: "Science & Technology",
        subscribers: 18400000,
        yearlyGrowth: 2400000,
        monthlyGrowth: 200000,
        dailyGrowth: 6700,
        subscribersPerVideo: 95000,
        operatingPeriod: 180,
        totalViews: 4200000000,
        avgViews: 21700000,
        videosCount: 194,
        uploadFrequency: 2,
        country: "United States",
        youtubeUrl: "https://www.youtube.com/@mkbhd",
        shortsTotalViews: 180000,
        longTotalViews: 210000000
      },
      {
        id: 'comedy-channel-1',
        rank: 33,
        channelName: "Ryan's World",
        category: "Entertainment",
        subscribers: 37800000,
        yearlyGrowth: 4900000,
        monthlyGrowth: 408000,
        dailyGrowth: 13600,
        subscribersPerVideo: 62000,
        operatingPeriod: 96,
        totalViews: 58900000000,
        avgViews: 96700000,
        videosCount: 609,
        uploadFrequency: 8,
        country: "United States",
        youtubeUrl: "https://www.youtube.com/@ryansworld",
        shortsTotalViews: 1100000,
        longTotalViews: 2945000000
      },
      {
        id: 'sports-channel-1',
        rank: 34,
        channelName: "FC Barcelona",
        category: "Sports",
        subscribers: 14800000,
        yearlyGrowth: 1900000,
        monthlyGrowth: 158000,
        dailyGrowth: 5300,
        subscribersPerVideo: 12000,
        operatingPeriod: 168,
        totalViews: 2100000000,
        avgViews: 1700000,
        videosCount: 1235,
        uploadFrequency: 15,
        country: "Spain",
        youtubeUrl: "https://www.youtube.com/@fcbarcelona",
        shortsTotalViews: 85000,
        longTotalViews: 105000000
      },
      {
        id: 'pets-channel-1',
        rank: 35,
        channelName: "Cole and Marmalade",
        category: "Pets & Animals",
        subscribers: 2100000,
        yearlyGrowth: 280000,
        monthlyGrowth: 23000,
        dailyGrowth: 770,
        subscribersPerVideo: 8500,
        operatingPeriod: 120,
        totalViews: 480000000,
        avgViews: 1940000,
        videosCount: 247,
        uploadFrequency: 2,
        country: "United States",
        youtubeUrl: "https://www.youtube.com/@coleandmarmalade",
        shortsTotalViews: 35000,
        longTotalViews: 24000000
      },
      {
        id: 'autos-channel-1',
        rank: 36,
        channelName: "Doug DeMuro",
        category: "Autos & Vehicles",
        subscribers: 4800000,
        yearlyGrowth: 620000,
        monthlyGrowth: 52000,
        dailyGrowth: 1700,
        subscribersPerVideo: 12000,
        operatingPeriod: 96,
        totalViews: 2200000000,
        avgViews: 5500000,
        videosCount: 400,
        uploadFrequency: 3,
        country: "United States",
        youtubeUrl: "https://www.youtube.com/@dougdemuro",
        shortsTotalViews: 95000,
        longTotalViews: 110000000
      },
      {
        id: 'film-channel-1',
        rank: 37,
        channelName: "Marvel Entertainment",
        category: "Film & Animation",
        subscribers: 19900000,
        yearlyGrowth: 2600000,
        monthlyGrowth: 217000,
        dailyGrowth: 7200,
        subscribersPerVideo: 45000,
        operatingPeriod: 180,
        totalViews: 12800000000,
        avgViews: 28900000,
        videosCount: 443,
        uploadFrequency: 5,
        country: "United States",
        youtubeUrl: "https://www.youtube.com/@marvel",
        shortsTotalViews: 420000,
        longTotalViews: 640000000
      },
      {
        id: 'nonprofit-channel-1',
        rank: 38,
        channelName: "Team Trees",
        category: "Nonprofits & Activism",
        subscribers: 1800000,
        yearlyGrowth: 240000,
        monthlyGrowth: 20000,
        dailyGrowth: 670,
        subscribersPerVideo: 45000,
        operatingPeriod: 60,
        totalViews: 180000000,
        avgViews: 4500000,
        videosCount: 40,
        uploadFrequency: 1,
        country: "United States",
        youtubeUrl: "https://www.youtube.com/@teamtrees",
        shortsTotalViews: 12000,
        longTotalViews: 9000000
      },
      {
        id: 'howto-channel-1',
        rank: 39,
        channelName: "5-Minute Crafts",
        category: "Howto & Style",
        subscribers: 79800000,
        yearlyGrowth: 10400000,
        monthlyGrowth: 867000,
        dailyGrowth: 28900,
        subscribersPerVideo: 42000,
        operatingPeriod: 84,
        totalViews: 42900000000,
        avgViews: 22500000,
        videosCount: 1907,
        uploadFrequency: 25,
        country: "United States",
        youtubeUrl: "https://www.youtube.com/@5minutecrafts",
        shortsTotalViews: 820000,
        longTotalViews: 2145000000
      },
      {
        id: 'news-channel-2',
        rank: 40,
        channelName: "CNN",
        category: "News & Politics",
        subscribers: 16200000,
        yearlyGrowth: 2100000,
        monthlyGrowth: 175000,
        dailyGrowth: 5800,
        subscribersPerVideo: 4200,
        operatingPeriod: 180,
        totalViews: 5700000000,
        avgViews: 1400000,
        videosCount: 4071,
        uploadFrequency: 30,
        country: "United States",
        youtubeUrl: "https://www.youtube.com/@cnn",
        shortsTotalViews: 180000,
        longTotalViews: 285000000
      },
      // 41-50 (데이터 5)
      {
        id: 'tech-channel-2',
        rank: 41,
        channelName: "Linus Tech Tips",
        category: "Science & Technology",
        subscribers: 15700000,
        yearlyGrowth: 2000000,
        monthlyGrowth: 167000,
        dailyGrowth: 5600,
        subscribersPerVideo: 25000,
        operatingPeriod: 168,
        totalViews: 6900000000,
        avgViews: 11000000,
        videosCount: 627,
        uploadFrequency: 7,
        country: "Canada",
        youtubeUrl: "https://www.youtube.com/@linustechtips",
        shortsTotalViews: 280000,
        longTotalViews: 345000000
      },
      {
        id: 'gaming-channel-2',
        rank: 42,
        channelName: "Ninja",
        category: "Gaming",
        subscribers: 24100000,
        yearlyGrowth: 3100000,
        monthlyGrowth: 258000,
        dailyGrowth: 8600,
        subscribersPerVideo: 52000,
        operatingPeriod: 120,
        totalViews: 2800000000,
        avgViews: 6100000,
        videosCount: 459,
        uploadFrequency: 4,
        country: "United States",
        youtubeUrl: "https://www.youtube.com/@ninja",
        shortsTotalViews: 150000,
        longTotalViews: 140000000
      },
      {
        id: 'music-channel-3',
        rank: 43,
        channelName: "Ed Sheeran",
        category: "Music",
        subscribers: 53800000,
        yearlyGrowth: 7000000,
        monthlyGrowth: 583000,
        dailyGrowth: 19400,
        subscribersPerVideo: 580000,
        operatingPeriod: 156,
        totalViews: 30400000000,
        avgViews: 327000000,
        videosCount: 93,
        uploadFrequency: 1,
        country: "United Kingdom",
        youtubeUrl: "https://www.youtube.com/@edsheeran",
        shortsTotalViews: 820000,
        longTotalViews: 1520000000
      },
      {
        id: 'lifestyle-channel-2',
        rank: 44,
        channelName: "James Charles",
        category: "Howto & Style",
        subscribers: 23600000,
        yearlyGrowth: 3100000,
        monthlyGrowth: 258000,
        dailyGrowth: 8600,
        subscribersPerVideo: 78000,
        operatingPeriod: 96,
        totalViews: 4100000000,
        avgViews: 13500000,
        videosCount: 304,
        uploadFrequency: 2,
        country: "United States",
        youtubeUrl: "https://www.youtube.com/@jamescharles",
        shortsTotalViews: 220000,
        longTotalViews: 205000000
      },
      {
        id: 'comedy-channel-2',
        rank: 45,
        channelName: "Saturday Night Live",
        category: "Comedy",
        subscribers: 14800000,
        yearlyGrowth: 1900000,
        monthlyGrowth: 158000,
        dailyGrowth: 5300,
        subscribersPerVideo: 12000,
        operatingPeriod: 192,
        totalViews: 11200000000,
        avgViews: 9300000,
        videosCount: 1204,
        uploadFrequency: 8,
        country: "United States",
        youtubeUrl: "https://www.youtube.com/@snl",
        shortsTotalViews: 420000,
        longTotalViews: 560000000
      },
      {
        id: 'travel-channel-1',
        rank: 46,
        channelName: "Mark Wiens",
        category: "Travel & Events",
        subscribers: 9300000,
        yearlyGrowth: 1200000,
        monthlyGrowth: 100000,
        dailyGrowth: 3300,
        subscribersPerVideo: 42000,
        operatingPeriod: 144,
        totalViews: 2100000000,
        avgViews: 9500000,
        videosCount: 221,
        uploadFrequency: 1,
        country: "United States",
        youtubeUrl: "https://www.youtube.com/@markwiens",
        shortsTotalViews: 95000,
        longTotalViews: 105000000
      },
      {
        id: 'education-channel-2',
        rank: 47,
        channelName: "Khan Academy",
        channelHandle: "@khanacademy",
        category: "Education",
        subscribers: 8100000,
        yearlyGrowth: 1050000,
        monthlyGrowth: 88000,
        dailyGrowth: 2900,
        subscribersPerVideo: 1200,
        operatingPeriod: 180,
        totalViews: 2400000000,
        avgViews: 356000,
        videosCount: 6742,
        uploadFrequency: 20,
        country: "United States",
        youtubeUrl: "https://www.youtube.com/@khanacademy",
        shortsTotalViews: 45000,
        longTotalViews: 120000000
      },
      {
        id: 'sports-channel-2',
        rank: 48,
        channelName: "NBA",
        category: "Sports",
        subscribers: 22100000,
        yearlyGrowth: 2900000,
        monthlyGrowth: 242000,
        dailyGrowth: 8100,
        subscribersPerVideo: 6800,
        operatingPeriod: 168,
        totalViews: 19800000000,
        avgViews: 6100000,
        videosCount: 3246,
        uploadFrequency: 25,
        country: "United States",
        youtubeUrl: "https://www.youtube.com/@nba",
        shortsTotalViews: 720000,
        longTotalViews: 990000000
      },
      {
        id: 'pets-channel-2',
        rank: 49,
        channelName: "The Dodo",
        category: "Pets & Animals",
        subscribers: 13400000,
        yearlyGrowth: 1700000,
        monthlyGrowth: 142000,
        dailyGrowth: 4700,
        subscribersPerVideo: 8900,
        operatingPeriod: 120,
        totalViews: 8900000000,
        avgViews: 5900000,
        videosCount: 1508,
        uploadFrequency: 12,
        country: "United States",
        youtubeUrl: "https://www.youtube.com/@thedodo",
        shortsTotalViews: 380000,
        longTotalViews: 445000000
      },
      {
        id: 'autos-channel-2',
        rank: 50,
        channelName: "Top Gear",
        category: "Autos & Vehicles",
        subscribers: 8700000,
        yearlyGrowth: 1100000,
        monthlyGrowth: 92000,
        dailyGrowth: 3100,
        subscribersPerVideo: 15000,
        operatingPeriod: 180,
        totalViews: 4800000000,
        avgViews: 8300000,
        videosCount: 578,
        uploadFrequency: 5,
        country: "United Kingdom",
        youtubeUrl: "https://www.youtube.com/@topgear",
        shortsTotalViews: 190000,
        longTotalViews: 240000000
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

  // 🔧 설정 관리
  setWorkerUrl(url: string) {
    this.baseUrl = url;
    console.log('🌐 [INFO] Cloudflare Worker URL 설정:', url);
  }
}

// 싱글톤 인스턴스
export const cloudflareService = new CloudflareService();