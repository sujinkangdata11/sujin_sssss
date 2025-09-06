// 🗄️ MainFinder 캐싱 서비스 (localStorage 기반, 3일 TTL)

interface CacheEntry {
  data: any;
  expiry: number;
}

const CACHE_PREFIX = 'mainFinder_';
const CACHE_TTL = 3 * 24 * 60 * 60 * 1000; // 3일

export const cache = {
  // 캐시에서 데이터 가져오기
  get(key: string): any | null {
    try {
      const item = localStorage.getItem(CACHE_PREFIX + key);
      if (!item) return null;
      
      const entry: CacheEntry = JSON.parse(item);
      
      // 만료 확인
      if (Date.now() > entry.expiry) {
        localStorage.removeItem(CACHE_PREFIX + key);
        return null;
      }
      
      return entry.data;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  },

  // 캐시에 데이터 저장하기
  set(key: string, data: any): void {
    try {
      const entry: CacheEntry = {
        data,
        expiry: Date.now() + CACHE_TTL
      };
      localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry));
    } catch (error) {
      console.error('Cache set error:', error);
    }
  },

  // 캐시에서 데이터 삭제
  remove(key: string): void {
    localStorage.removeItem(CACHE_PREFIX + key);
  },

  // 모든 MainFinder 캐시 삭제
  clear(): void {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(CACHE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  }
};