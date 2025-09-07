// Configuration Constants
export const CONFIG = {
  RPM: {
    SHORTS_BASE: 0.05,
    LONG_BASE: 0.15,
    DEFAULT: 0.08,
    STEP: 0.01
  },
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