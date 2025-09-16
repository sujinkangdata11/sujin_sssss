// 🎬 Listup API 통신 서비스 (쇼츠메이커-탐험하기 전용)
interface ListupResponse {
  success: boolean;
  message: string;
  data?: any[];
}

class ListupService {
  private baseUrl = 'https://listup.anime-toon-7923.workers.dev';

  // 🚀 쇼츠메이커 탐험 데이터 가져오기
  async getExplorationData(): Promise<{
    success: boolean;
    data: any[];
    message: string;
    fromCache?: boolean;
  }> {
    try {
      console.log('🎬 [INFO] 쇼츠메이커 탐험 데이터 가져오는 중...');

      // API 호출
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

      console.log('🔍 [DEBUG] Listup API 응답 구조:', {
        hasData: !!result.data,
        isArray: Array.isArray(result.data),
        dataLength: result.data?.length || 0,
        responseKeys: Object.keys(result),
        firstItemKeys: result.data?.[0] ? Object.keys(result.data[0]) : []
      });

      const isSuccess = result.data && Array.isArray(result.data);

      if (!isSuccess) {
        console.error('❌ [ERROR] Listup API 파싱 실패:', {
          hasData: !!result.data,
          isArray: Array.isArray(result.data),
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

      return {
        success: true,
        data: result.data || [],
        message: result.message || `${result.data?.length || 0}개 탐험 데이터 로드 완료`
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

  // 🔧 설정 관리
  setWorkerUrl(url: string) {
    this.baseUrl = url;
    console.log('🎬 [INFO] Listup Worker URL 설정:', url);
  }
}

// 싱글톤 인스턴스
export const listupService = new ListupService();