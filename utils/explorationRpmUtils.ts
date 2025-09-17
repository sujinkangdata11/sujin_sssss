// 🎬 탐험하기 전용 RPM 유틸리티 (채널파인더에서 복사)

import countryRpmDefaults from '../data/countryRpmDefaults.json';
import { Language } from '../types';

// 🌍 통합 국가 매핑 함수 - 채널파인더에서 완전 복사 (수정 없음)
export const getExplorationCountryDisplayName = (language: Language, countryInput: string): string => {
  // 국가 코드 → 영어명 → 다국어명 통합 매핑 (채널파인더 전체 데이터)
  const unifiedCountryMap: { [key: string]: { englishName: string; translations: { [key in Language]: string } } } = {
    // 코드와 영어명 모두 지원 (US, United States 둘 다 동일하게 처리)
    'US': {
      englishName: 'United States',
      translations: { en: 'United States', ko: '미국', ja: 'アメリカ', zh: '美国', hi: 'अमेरिका', es: 'Estados Unidos', fr: 'États-Unis', de: 'USA', nl: 'Verenigde Staten', pt: 'Estados Unidos', ru: 'США' }
    },
    'United States': {
      englishName: 'United States',
      translations: { en: 'United States', ko: '미국', ja: 'アメリカ', zh: '美国', hi: 'अमेरिका', es: 'Estados Unidos', fr: 'États-Unis', de: 'USA', nl: 'Verenigde Staten', pt: 'Estados Unidos', ru: 'США' }
    },
    'KR': {
      englishName: 'South Korea',
      translations: { en: 'South Korea', ko: '한국', ja: '韓国', zh: '韩国', hi: 'दक्षिण कोरिया', es: 'Corea del Sur', fr: 'Corée du Sud', de: 'Südkorea', nl: 'Zuid-Korea', pt: 'Coreia do Sul', ru: 'Южная Корея' }
    },
    'South Korea': {
      englishName: 'South Korea',
      translations: { en: 'South Korea', ko: '한국', ja: '韓国', zh: '韩国', hi: 'दक्षिण कोरिया', es: 'Corea del Sur', fr: 'Corée du Sud', de: 'Südkorea', nl: 'Zuid-Korea', pt: 'Coreia do Sul', ru: 'Южная Корея' }
    },
    'JP': {
      englishName: 'Japan',
      translations: { en: 'Japan', ko: '일본', ja: '日本', zh: '日本', hi: 'जापान', es: 'Japón', fr: 'Japon', de: 'Japan', nl: 'Japan', pt: 'Japão', ru: 'Япония' }
    },
    'Japan': {
      englishName: 'Japan',
      translations: { en: 'Japan', ko: '일본', ja: '日本', zh: '日本', hi: 'जापान', es: 'Japón', fr: 'Japon', de: 'Japan', nl: 'Japan', pt: 'Japão', ru: 'Япония' }
    },
    'CN': {
      englishName: 'China',
      translations: { en: 'China', ko: '중국', ja: '中国', zh: '中国', hi: 'चीन', es: 'China', fr: 'Chine', de: 'China', nl: 'China', pt: 'China', ru: 'Китай' }
    },
    'China': {
      englishName: 'China',
      translations: { en: 'China', ko: '중국', ja: '中国', zh: '中国', hi: 'चीन', es: 'China', fr: 'Chine', de: 'China', nl: 'China', pt: 'China', ru: 'Китай' }
    },
    'GB': {
      englishName: 'United Kingdom',
      translations: { en: 'United Kingdom', ko: '영국', ja: 'イギリス', zh: '英国', hi: 'यूनाइटेड किंगडम', es: 'Reino Unido', fr: 'Royaume-Uni', de: 'Vereinigtes Königreich', nl: 'Verenigd Koninkrijk', pt: 'Reino Unido', ru: 'Великобритания' }
    },
    'United Kingdom': {
      englishName: 'United Kingdom',
      translations: { en: 'United Kingdom', ko: '영국', ja: 'イギリス', zh: '英国', hi: 'यूनाइटेड किंगडम', es: 'Reino Unido', fr: 'Royaume-Uni', de: 'Vereinigtes Königreich', nl: 'Verenigd Koninkrijk', pt: 'Reino Unido', ru: 'Великобритания' }
    },
    'CA': {
      englishName: 'Canada',
      translations: { en: 'Canada', ko: '캐나다', ja: 'カナダ', zh: '加拿大', hi: 'कनाडा', es: 'Canadá', fr: 'Canada', de: 'Kanada', nl: 'Canada', pt: 'Canadá', ru: 'Канада' }
    },
    'Canada': {
      englishName: 'Canada',
      translations: { en: 'Canada', ko: '캐나다', ja: 'カナダ', zh: '加拿大', hi: 'कनाडा', es: 'Canadá', fr: 'Canada', de: 'Kanada', nl: 'Canada', pt: 'Canadá', ru: 'Канада' }
    },
    'AU': {
      englishName: 'Australia',
      translations: { en: 'Australia', ko: '호주', ja: 'オーストラリア', zh: '澳大利亚', hi: 'ऑस्ट्रेलिया', es: 'Australia', fr: 'Australie', de: 'Australien', nl: 'Australië', pt: 'Austrália', ru: 'Австралия' }
    },
    'Australia': {
      englishName: 'Australia',
      translations: { en: 'Australia', ko: '호주', ja: 'オーストラリア', zh: '澳大利亚', hi: 'ऑस्ट्रेलिया', es: 'Australia', fr: 'Australie', de: 'Australien', nl: 'Australië', pt: 'Austrália', ru: 'Австралия' }
    },
    'DE': {
      englishName: 'Germany',
      translations: { en: 'Germany', ko: '독일', ja: 'ドイツ', zh: '德国', hi: 'जर्मनी', es: 'Alemania', fr: 'Allemagne', de: 'Deutschland', nl: 'Duitsland', pt: 'Alemanha', ru: 'Германия' }
    },
    'Germany': {
      englishName: 'Germany',
      translations: { en: 'Germany', ko: '독일', ja: 'ドイツ', zh: '德国', hi: 'जर्मनी', es: 'Alemania', fr: 'Allemagne', de: 'Deutschland', nl: 'Duitsland', pt: 'Alemanha', ru: 'Германия' }
    },
    'FR': {
      englishName: 'France',
      translations: { en: 'France', ko: '프랑스', ja: 'フランス', zh: '法国', hi: 'फ्रांस', es: 'Francia', fr: 'France', de: 'Frankreich', nl: 'Frankrijk', pt: 'França', ru: 'Франция' }
    },
    'France': {
      englishName: 'France',
      translations: { en: 'France', ko: '프랑스', ja: 'フランス', zh: '法国', hi: 'फ्रांस', es: 'Francia', fr: 'France', de: 'Frankreich', nl: 'Frankrijk', pt: 'França', ru: 'Франция' }
    },
    'BR': {
      englishName: 'Brazil',
      translations: { en: 'Brazil', ko: '브라질', ja: 'ブラジル', zh: '巴西', hi: 'ब्राजील', es: 'Brasil', fr: 'Brésil', de: 'Brasilien', nl: 'Brazilië', pt: 'Brasil', ru: 'Бразилия' }
    },
    'Brazil': {
      englishName: 'Brazil',
      translations: { en: 'Brazil', ko: '브라질', ja: 'ブラジル', zh: '巴西', hi: 'ब्राजील', es: 'Brasil', fr: 'Brésil', de: 'Brasilien', nl: 'Brazilië', pt: 'Brasil', ru: 'Бразилия' }
    },
    'IN': {
      englishName: 'India',
      translations: { en: 'India', ko: '인도', ja: 'インド', zh: '印度', hi: 'भारत', es: 'India', fr: 'Inde', de: 'Indien', nl: 'India', pt: 'Índia', ru: 'Индия' }
    },
    'India': {
      englishName: 'India',
      translations: { en: 'India', ko: '인도', ja: 'インド', zh: '印度', hi: 'भारत', es: 'India', fr: 'Inde', de: 'Indien', nl: 'India', pt: 'Índia', ru: 'Индия' }
    },
    // 기타 국가들
    '기타': {
      englishName: '기타',
      translations: { en: 'Others', ko: '기타', ja: 'その他', zh: '其他', hi: 'अन्य', es: 'Otros', fr: 'Autres', de: 'Andere', nl: 'Anderen', pt: 'Outros', ru: 'Прочие' }
    }
  };

  // null, "null", undefined, 빈 문자열은 모두 "기타"로 처리
  if (!countryInput || countryInput === 'null' || countryInput === 'undefined') {
    const fallback = unifiedCountryMap['기타'];
    return fallback.translations[language] || fallback.englishName;
  }

  const countryData = unifiedCountryMap[countryInput];
  if (countryData) {
    return countryData.translations[language] || countryData.englishName;
  }

  // 매핑되지 않은 경우 기타로 처리 (채널파인더와 동일한 로직)
  return unifiedCountryMap['기타'].translations[language];
};

// 📊 국가별 RPM 가져오기 함수 (채널파인더와 동일한 로직으로 모든 국가 지원)
export const getCountryRpm = (country: string): { shorts: number; long: number } => {
  // null, "null", undefined, 빈 문자열은 모두 "기타"로 처리
  if (!country || country === 'null' || country === 'undefined') {
    return countryRpmDefaults['기타'];
  }

  // 먼저 국가명 그대로 찾기 (United States, South Korea, Japan 등)
  if (countryRpmDefaults[country]) {
    return countryRpmDefaults[country];
  }

  // 국가 코드를 영어명으로 변환해서 찾기 (채널파인더 전체 매핑)
  const countryCodeMap: { [key: string]: string } = {
    'US': 'United States',
    'KR': 'South Korea',
    'JP': 'Japan',
    'CN': 'China',
    'GB': 'United Kingdom',
    'CA': 'Canada',
    'AU': 'Australia',
    'DE': 'Germany',
    'FR': 'France',
    'BR': 'Brazil',
    'IN': 'India',
    // countryRpmDefaults.json에 있는 모든 국가 추가
    'AT': 'Austria',
    'BE': 'Belgium',
    'DK': 'Denmark',
    'EG': 'Egypt',
    'FI': 'Finland',
    'HK': 'Hong Kong',
    'ID': 'Indonesia',
    'IE': 'Ireland',
    'IL': 'Israel',
    'MX': 'Mexico',
    'NL': 'Netherlands',
    'NZ': 'New Zealand',
    'NO': 'Norway',
    'PK': 'Pakistan',
    'PH': 'Philippines',
    'PT': 'Portugal',
    'SG': 'Singapore',
    'ZA': 'South Africa',
    'ES': 'Spain',
    'SE': 'Sweden',
    'CH': 'Switzerland',
    'TW': 'Taiwan',
    'TR': 'Turkey',
    'AR': 'Argentina'
  };

  const englishName = countryCodeMap[country];
  if (englishName && countryRpmDefaults[englishName]) {
    return countryRpmDefaults[englishName];
  }

  // 찾지 못하면 "기타" 기본값 반환
  return countryRpmDefaults['기타'];
};

// 🎯 탐험하기 전용 초기 RPM 설정 함수
export const getExplorationInitialRpm = (language: Language): { shorts: number; long: number } => {
  const defaultCountry = language === 'ko' ? 'South Korea' : '기타';
  return countryRpmDefaults[defaultCountry];
};

// 💰 수익 계산 함수 (채널파인더에서 복사)
export const calculateExplorationRevenue = (
  totalViews: number,
  shortsPercentage: number,
  longPercentage: number,
  shortsRpm: number,
  longRpm: number
) => {
  const shortsViews = totalViews * (shortsPercentage / 100);
  const longViews = totalViews * (longPercentage / 100);

  // ShortsUSD = (ShortsViews/1000) * 각 나라 숏폼 RPM (환율 적용 X)
  const shortsRevenueUsd = (shortsViews / 1000) * shortsRpm;
  // LongUSD = (LongViews/1000) * 각 나라 롱폼 RPM (환율 적용 X)
  const longRevenueUsd = (longViews / 1000) * longRpm;

  return {
    shortsRevenueUsd,
    longRevenueUsd,
    totalRevenueUsd: shortsRevenueUsd + longRevenueUsd
  };
};