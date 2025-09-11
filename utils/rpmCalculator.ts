import { YouTubeShort } from '../types';
import { formattedDurationToSeconds } from '../services/youtubeService';

// 채널파인더 데이터 기반 RPM 값들
const COUNTRY_RPM_VALUES = {
  "United States": { shortsRpm: 0.33, longRpm: 10.81 },
  "Australia": { shortsRpm: 0.19, longRpm: 11.95 },
  "Austria": { shortsRpm: 0.14, longRpm: 5.10 },
  "Belgium": { shortsRpm: 0.15, longRpm: 4.67 },
  "Brazil": { shortsRpm: 0.04, longRpm: 0.58 },
  "Canada": { shortsRpm: 0.17, longRpm: 9.62 },
  "Denmark": { shortsRpm: 0.18, longRpm: 5.29 },
  "Egypt": { shortsRpm: 0.00, longRpm: 0.11 },
  "Finland": { shortsRpm: 0.11, longRpm: 3.10 },
  "France": { shortsRpm: 0.10, longRpm: 1.50 },
  "Germany": { shortsRpm: 0.16, longRpm: 6.20 },
  "Hong Kong": { shortsRpm: 0.15, longRpm: 5.21 },
  "India": { shortsRpm: 0.01, longRpm: 0.46 },
  "Indonesia": { shortsRpm: 0.01, longRpm: 0.41 },
  "Ireland": { shortsRpm: 0.18, longRpm: 6.01 },
  "Israel": { shortsRpm: 0.14, longRpm: 3.87 },
  "Japan": { shortsRpm: 0.14, longRpm: 2.90 },
  "Mexico": { shortsRpm: 0.04, longRpm: 0.62 },
  "Netherlands": { shortsRpm: 0.18, longRpm: 5.86 },
  "New Zealand": { shortsRpm: 0.11, longRpm: 9.29 },
  "Norway": { shortsRpm: 0.20, longRpm: 6.66 },
  "Pakistan": { shortsRpm: 0.00, longRpm: 0.20 },
  "Philippines": { shortsRpm: 0.02, longRpm: 0.15 },
  "Portugal": { shortsRpm: 0.10, longRpm: 2.84 },
  "Singapore": { shortsRpm: 0.18, longRpm: 5.37 },
  "South Africa": { shortsRpm: 0.07, longRpm: 2.00 },
  "South Korea": { shortsRpm: 0.18, longRpm: 0.96 },
  "Spain": { shortsRpm: 0.14, longRpm: 3.91 },
  "Sweden": { shortsRpm: 0.13, longRpm: 3.67 },
  "Switzerland": { shortsRpm: 0.20, longRpm: 7.63 },
  "Taiwan": { shortsRpm: 0.14, longRpm: 0.69 },
  "Turkey": { shortsRpm: 0.02, longRpm: 0.29 },
  "United Kingdom": { shortsRpm: 0.17, longRpm: 7.12 },
  "기타": { shortsRpm: 0.10, longRpm: 1.00 }
};

// 국가 코드를 국가명으로 매핑
const getCountryNameFromCode = (countryCode?: string): string => {
  if (!countryCode) return "United States";
  
  const countryCodeMap: Record<string, string> = {
    'US': 'United States',
    'AU': 'Australia', 
    'AT': 'Austria',
    'BE': 'Belgium',
    'BR': 'Brazil',
    'CA': 'Canada',
    'DK': 'Denmark',
    'EG': 'Egypt',
    'FI': 'Finland',
    'FR': 'France',
    'DE': 'Germany',
    'HK': 'Hong Kong',
    'IN': 'India',
    'ID': 'Indonesia',
    'IE': 'Ireland',
    'IL': 'Israel',
    'JP': 'Japan',
    'MX': 'Mexico',
    'NL': 'Netherlands',
    'NZ': 'New Zealand',
    'NO': 'Norway',
    'PK': 'Pakistan',
    'PH': 'Philippines',
    'PT': 'Portugal',
    'SG': 'Singapore',
    'ZA': 'South Africa',
    'KR': 'South Korea',
    'ES': 'Spain',
    'SE': 'Sweden',
    'CH': 'Switzerland',
    'TW': 'Taiwan',
    'TR': 'Turkey',
    'GB': 'United Kingdom'
  };
  
  return countryCodeMap[countryCode.toUpperCase()] || "United States";
};

// 영상 길이에 따라 적절한 RPM 값 반환
export const calculateRpmRate = (short: YouTubeShort): number => {
  // 1차: 국가별 RPM 데이터에서 가져오기
  if (short.channelCountry) {
    const countryName = getCountryNameFromCode(short.channelCountry);
    const isLongForm = short.duration ? formattedDurationToSeconds(short.duration) >= 90 : false;
    const rpmData = COUNTRY_RPM_VALUES[countryName] || COUNTRY_RPM_VALUES["United States"];
    return isLongForm ? rpmData.longRpm : rpmData.shortsRpm;
  }
  
  // 2차: 제목 언어로 추정
  const hasKorean = /[ㄱ-ㅎㅏ-ㅣ가-힣]/.test(short.title);
  if (hasKorean) {
    const isLongForm = short.duration ? formattedDurationToSeconds(short.duration) >= 90 : false;
    const rpmData = COUNTRY_RPM_VALUES["South Korea"];
    return isLongForm ? rpmData.longRpm : rpmData.shortsRpm;
  }
  
  // 3차: 글로벌 기본값
  const isLongForm = short.duration ? formattedDurationToSeconds(short.duration) >= 90 : false;
  const rpmData = COUNTRY_RPM_VALUES["기타"];
  return isLongForm ? rpmData.longRpm : rpmData.shortsRpm;
};