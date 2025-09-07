// Configuration Constants
export const CONFIG = {
  RPM: {
    SHORTS_BASE: 0.05,
    LONG_BASE: 0.15,
    DEFAULT: 0.08,
    STEP: 0.01
  },
} as const;

// 반응형 테이블 컬럼 우선순위 설정
// ⚠️ 유지보수 가이드: 우선순위 변경 시 이 설정만 수정하세요
export const RESPONSIVE_COLUMN_CONFIG = {
  // 브레이크포인트 설정 (px)
  BREAKPOINTS: {
    mobile: 768,
    tablet: 1024,
  },
  
  // 컬럼별 우선순위 (낮을수록 중요)
  // priority 1: 항상 표시 (모바일 포함)
  // priority 2: 타블렛 이상에서 표시
  // priority 3: 데스크탑에서만 표시
  COLUMN_PRIORITIES: {
    rank: 1,           // 순위 - 필수
    channelName: 1,    // 채널명 - 필수
    subscribers: 1,    // 구독자수 - 필수
    country: 1,        // 국가 - 필수
    category: 2,       // 카테고리 - 타블렛+
    monthlyGrowth: 2,  // 월간성장 - 타블렛+
    totalViews: 2,     // 총조회수 - 타블렛+
    yearlyGrowth: 3,   // 연간성장 - 데스크탑만
    dailyGrowth: 3,    // 일간성장 - 데스크탑만
    subsPerVideo: 3,   // 구독자/영상 - 데스크탑만
    operatingPeriod: 3, // 운영기간 - 데스크탑만
    avgViews: 3,       // 평균조회수 - 데스크탑만
    videoCount: 3,     // 총영상개수 - 데스크탑만
    uploadFreq: 3,     // 업로드빈도 - 데스크탑만
  }
} as const;

// 국가 표시용 매핑 (간단한 객체)
export const countryDisplayNames: { [key: string]: string } = {
  'United States': '미국',
  'India': '인도',
  'Australia': '호주',
  'Austria': '오스트리아',
  'Belgium': '벨기에',
  'Brazil': '브라질',
  'Canada': '캐나다',
  'Denmark': '덴마크',
  'Egypt': '이집트',
  'Finland': '핀란드',
  'France': '프랑스',
  'Germany': '독일',
  'Hong Kong': '홍콩',
  'Indonesia': '인도네시아',
  'Ireland': '아일랜드',
  'Israel': '이스라엘',
  'Japan': '일본',
  'Mexico': '멕시코',
  'Netherlands': '네덜란드',
  'New Zealand': '뉴질랜드',
  'Norway': '노르웨이',
  'Pakistan': '파키스탄',
  'Philippines': '필리핀',
  'Portugal': '포르투갈',
  'Singapore': '싱가포르',
  'South Africa': '남아프리카공화국',
  'South Korea': '한국',
  'Spain': '스페인',
  'Sweden': '스웨덴',
  'Switzerland': '스위스',
  'Taiwan': '대만',
  'Turkey': '터키',
  'United Kingdom': '영국',
  '기타': '기타'
};