// 국가 코드 매핑 데이터
export interface CountryMapping {
  code: string;      // 2글자 국가 코드 (예: "US")
  english: string;   // 영어명 (예: "United States")
  korean: string;    // 한글명 (예: "미국")
  emoji: string;     // 이모지 (예: "🇺🇸")
  displayName: string; // UI 표시명 (예: "🇺🇸 미국")
}

export const COUNTRY_MAPPINGS: CountryMapping[] = [
  { code: "KR", english: "Korea", korean: "한국", emoji: "🇰🇷", displayName: "🇰🇷 한국" },
  { code: "US", english: "United States", korean: "미국", emoji: "🇺🇸", displayName: "🇺🇸 미국" },
  { code: "JP", english: "Japan", korean: "일본", emoji: "🇯🇵", displayName: "🇯🇵 일본" },
  { code: "IN", english: "India", korean: "인도", emoji: "🇮🇳", displayName: "🇮🇳 인도" },
  { code: "BR", english: "Brazil", korean: "브라질", emoji: "🇧🇷", displayName: "🇧🇷 브라질" },
  { code: "DE", english: "Germany", korean: "독일", emoji: "🇩🇪", displayName: "🇩🇪 독일" },
  { code: "FR", english: "France", korean: "프랑스", emoji: "🇫🇷", displayName: "🇫🇷 프랑스" },
  { code: "GB", english: "United Kingdom", korean: "영국", emoji: "🇬🇧", displayName: "🇬🇧 영국" },
  { code: "CA", english: "Canada", korean: "캐나다", emoji: "🇨🇦", displayName: "🇨🇦 캐나다" },
  { code: "AU", english: "Australia", korean: "호주", emoji: "🇦🇺", displayName: "🇦🇺 호주" },
  { code: "RU", english: "Russia", korean: "러시아", emoji: "🇷🇺", displayName: "🇷🇺 러시아" },
  { code: "ID", english: "Indonesia", korean: "인도네시아", emoji: "🇮🇩", displayName: "🇮🇩 인도네시아" },
  { code: "MX", english: "Mexico", korean: "멕시코", emoji: "🇲🇽", displayName: "🇲🇽 멕시코" },
  { code: "IT", english: "Italy", korean: "이탈리아", emoji: "🇮🇹", displayName: "🇮🇹 이탈리아" },
  { code: "ES", english: "Spain", korean: "스페인", emoji: "🇪🇸", displayName: "🇪🇸 스페인" },
  { code: "null", english: "Other", korean: "기타", emoji: "🌐", displayName: "🌐 기타" }
];

// 국가 코드로 매핑 객체 찾기
export const getCountryByCode = (code: string): CountryMapping | undefined => {
  return COUNTRY_MAPPINGS.find(country => country.code === code);
};

// 표시명으로 국가 코드 찾기
export const getCountryCodeByDisplayName = (displayName: string): string | undefined => {
  const country = COUNTRY_MAPPINGS.find(country => country.displayName === displayName);
  return country?.code;
};

// UI에서 사용할 국가 목록 (전세계 포함)
export const getCountryDisplayList = (): string[] => {
  return [
    '🌍 전세계',
    ...COUNTRY_MAPPINGS.map(country => country.displayName)
  ];
};