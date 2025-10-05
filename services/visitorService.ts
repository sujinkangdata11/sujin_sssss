// 🔢 방문자 통계 관리 서비스 (Cloudflare Workers API 연동)

interface VisitorStats {
  totalVisits: number;
  dailyVisits: number;
  lastUpdated: string;
}

interface ApiResponse {
  success: boolean;
  data?: VisitorStats;
  message?: string;
  error?: string;
}

class VisitorService {
  private baseUrl = 'https://vidhunt-visitor-api.evvi-aa-aa.workers.dev';
  private fallbackKey = 'vidhunt_visitor_fallback';

  // 🌐 방문자 수 증가 (POST)
  async recordVisit(): Promise<VisitorStats> {
    try {
      const response = await fetch(`${this.baseUrl}/api/visit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          timezone: 'Asia/Seoul'
        }),
        signal: this.createTimeoutSignal(10000)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result: ApiResponse = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.error || 'API 응답 오류');
      }

      // 성공 시 로컬 캐시 업데이트
      this.updateFallbackCache(result.data);

      return result.data;
    } catch (error) {
      console.warn('⚠️ [VisitorService] API 호출 실패, fallback 사용:', error);
      return this.handleFallback();
    }
  }

  // 📊 현재 방문자 통계 조회 (GET)
  async getVisitorStats(): Promise<VisitorStats> {
    try {
      const response = await fetch(`${this.baseUrl}/api/stats`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        signal: this.createTimeoutSignal(8000)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result: ApiResponse = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.error || 'API 응답 오류');
      }

      // 성공 시 로컬 캐시 업데이트
      this.updateFallbackCache(result.data);

      return result.data;
    } catch (error) {
      console.warn('⚠️ [VisitorService] 통계 조회 실패, fallback 사용:', error);
      return this.getFallbackStats();
    }
  }

  // 🔄 로컬 fallback 처리 (방문 기록)
  private handleFallback(): VisitorStats {
    try {
      const fallbackData = this.getFallbackFromStorage();
      const today = this.getKstDateKey();

      const newTotal = fallbackData.totalVisits + 1;
      const newDaily = fallbackData.dailyDate === today ? fallbackData.dailyVisits + 1 : 1;

      const updatedData = {
        totalVisits: newTotal,
        dailyVisits: newDaily,
        dailyDate: today,
        lastUpdated: new Date().toISOString()
      };

      localStorage.setItem(this.fallbackKey, JSON.stringify(updatedData));

      return {
        totalVisits: newTotal,
        dailyVisits: newDaily,
        lastUpdated: updatedData.lastUpdated
      };
    } catch {
      return {
        totalVisits: 1,
        dailyVisits: 1,
        lastUpdated: new Date().toISOString()
      };
    }
  }

  // 📈 로컬 fallback 데이터 조회
  private getFallbackStats(): VisitorStats {
    try {
      const fallbackData = this.getFallbackFromStorage();
      return {
        totalVisits: fallbackData.totalVisits,
        dailyVisits: fallbackData.dailyVisits,
        lastUpdated: fallbackData.lastUpdated
      };
    } catch {
      return {
        totalVisits: 0,
        dailyVisits: 0,
        lastUpdated: new Date().toISOString()
      };
    }
  }

  // 💾 fallback 캐시 업데이트
  private updateFallbackCache(stats: VisitorStats): void {
    try {
      const cacheData = {
        totalVisits: stats.totalVisits,
        dailyVisits: stats.dailyVisits,
        dailyDate: this.getKstDateKey(),
        lastUpdated: stats.lastUpdated
      };
      localStorage.setItem(this.fallbackKey, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('⚠️ [VisitorService] fallback 캐시 업데이트 실패:', error);
    }
  }

  // 🗄️ 로컬 스토리지에서 fallback 데이터 읽기
  private getFallbackFromStorage() {
    try {
      const stored = localStorage.getItem(this.fallbackKey);
      if (!stored) {
        return { totalVisits: 0, dailyVisits: 0, dailyDate: '', lastUpdated: new Date().toISOString() };
      }

      const data = JSON.parse(stored);
      const today = this.getKstDateKey();

      // 날짜가 바뀌면 일일 방문자 초기화
      if (data.dailyDate !== today) {
        data.dailyVisits = 0;
        data.dailyDate = today;
      }

      return {
        totalVisits: Number.isFinite(data.totalVisits) ? data.totalVisits : 0,
        dailyVisits: Number.isFinite(data.dailyVisits) ? data.dailyVisits : 0,
        dailyDate: data.dailyDate || today,
        lastUpdated: data.lastUpdated || new Date().toISOString()
      };
    } catch {
      return { totalVisits: 0, dailyVisits: 0, dailyDate: this.getKstDateKey(), lastUpdated: new Date().toISOString() };
    }
  }

  // 📅 KST 날짜 키 생성
  private getKstDateKey(): string {
    const now = new Date();
    const utcMillis = now.getTime() + now.getTimezoneOffset() * 60000;
    const kstMillis = utcMillis + 9 * 60 * 60000; // KST is UTC+9
    return new Date(kstMillis).toISOString().split('T')[0];
  }

  // ⏱️ 브라우저 호환 타임아웃 시그널 생성
  private createTimeoutSignal(timeoutMs: number): AbortSignal | undefined {
    try {
      if (typeof AbortSignal !== 'undefined' && typeof (AbortSignal as unknown as { timeout?: (ms: number) => AbortSignal }).timeout === 'function') {
        return (AbortSignal as unknown as { timeout: (ms: number) => AbortSignal }).timeout(timeoutMs);
      }
    } catch (error) {
      console.warn('⚠️ [VisitorService] AbortSignal.timeout 사용 불가, 수동 타임아웃으로 전환:', error);
    }

    if (typeof AbortController !== 'undefined') {
      const controller = new AbortController();
      setTimeout(() => controller.abort(), timeoutMs);
      return controller.signal;
    }

    return undefined;
  }

  // 🔧 설정 관리
  setApiUrl(url: string): void {
    this.baseUrl = url;
    console.log('🔢 [VisitorService] API URL 설정:', url);
  }

  // 🩺 서비스 상태 확인
  async checkHealth(): Promise<{ online: boolean; message?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        signal: this.createTimeoutSignal(5000)
      });

      return {
        online: response.ok,
        message: response.ok ? 'API 정상' : `HTTP ${response.status}`
      };
    } catch (error) {
      return {
        online: false,
        message: `연결 실패: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
}

// 싱글톤 인스턴스
export const visitorService = new VisitorService();
export type { VisitorStats };
