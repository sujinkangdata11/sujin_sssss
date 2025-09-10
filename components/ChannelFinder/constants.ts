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
    monthlyRevenue: 1, // 월 수익 - 필수 (모바일 표시)
    country: 2,        // 국가 - 태블릿+
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

// 🎛️ 필터 태그 시스템 - 유지보수를 위한 설정 중심 구조
// ⚠️ 유지보수 가이드: 태그/옵션 변경 시 이 설정만 수정하세요
export const FILTER_TAG_CONFIG = {
  // 💰 드롭다운 옵션 정의 (단위: 만원)
  OPTIONS: {
    videoCount: {
      label: '영상 개수',
      values: [
        { value: 1000, label: '1000개' },
        { value: 500, label: '500개' },
        { value: 100, label: '100개' },
        { value: 50, label: '50개' },
        { value: 30, label: '30개' },
        { value: 10, label: '10개' }
      ]
    },
    revenue: {
      label: '수익',
      values: [
        { value: 76923, label: '1억' },
        { value: 38461, label: '5천만' },
        { value: 23077, label: '3천만' },
        { value: 7692, label: '1천만' },
        { value: 3846, label: '500만' },
        { value: 2308, label: '300만' },
        { value: 769, label: '100만' },
        { value: 385, label: '50만' },
        { value: 77, label: '10만' }
      ]
    },
    period: {
      label: '기간',
      values: [
        { value: 20, label: '20년' },
        { value: 10, label: '10년' },
        { value: 5, label: '5년' },
        { value: 3, label: '3년' },
        { value: 1, label: '1년' },
        { value: 0.5, label: '6개월' },
        { value: 0.25, label: '3개월' }
      ]
    },
    views: {
      label: '조회수',
      values: [
        { value: 100000000, label: '1억' },
        { value: 50000000, label: '5천만' },
        { value: 30000000, label: '3천만' },
        { value: 10000000, label: '1천만' },
        { value: 5000000, label: '500만' },
        { value: 1000000, label: '100만' },
        { value: 500000, label: '50만' },
        { value: 100000, label: '10만' },
        { value: 50000, label: '5만' },
        { value: 10000, label: '1만' }
      ]
    },
    subscribers: {
      label: '구독자',
      values: [
        { value: 100000000, label: '1억' },
        { value: 50000000, label: '5천만' },
        { value: 30000000, label: '3천만' },
        { value: 10000000, label: '1천만' },
        { value: 5000000, label: '500만' },
        { value: 1000000, label: '100만' },
        { value: 500000, label: '50만' },
        { value: 100000, label: '10만' },
        { value: 50000, label: '5만' },
        { value: 10000, label: '1만' }
      ]
    }
  },

  // 🏷️ 태그 정의 - 새로운 태그는 여기에 추가하세요
  TAGS: [
    {
      id: 'videoRevenue',
      template: '영상 개수 {videoCount} 이하\n매월 {revenue}원 이상 버는 채널',
      placeholders: ['videoCount', 'revenue'],
      defaultValues: { videoCount: 100, revenue: 7692 }
    },
    {
      id: 'periodRevenue',
      template: '개설 {period} 이하\n매월 {revenue}원 이상 버는 채널',
      placeholders: ['period', 'revenue'],
      defaultValues: { period: 1, revenue: 7692 }
    },
    {
      id: 'videoSubscribers',
      template: '영상 개수 {videoCount} 이하\n구독자 {subscribers} 이상 채널',
      placeholders: ['videoCount', 'subscribers'],
      defaultValues: { videoCount: 100, subscribers: 100000 }
    },
    {
      id: 'monthlyRevenue',
      template: '평균 월 {revenue}원 이상 버는 채널',
      placeholders: ['revenue'],
      defaultValues: { revenue: 7692 }
    },
    {
      id: 'avgViews',
      template: '평균 조회수 {views} 이상 채널',
      placeholders: ['views'],
      defaultValues: { views: 1000000 }
    }
  ]
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