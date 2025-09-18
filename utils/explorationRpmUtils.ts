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

// 💰 채널파인더 방식 국가별 RPM 데이터 (tableMonthlyRevenue.ts에서 복사)
const EXPLORATION_COUNTRY_RPM_VALUES = {
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

// 💰 채널파인더 방식 환율 데이터 (tableMonthlyRevenue.ts에서 복사)
const EXPLORATION_CURRENCY_EXCHANGE_RATES = {
  en: { rate: 1, symbol: '$', name: 'USD' },
  ko: { rate: 1300, symbol: '원', name: 'KRW' },
  ja: { rate: 150, symbol: '円', name: 'JPY' },
  zh: { rate: 7.2, symbol: '元', name: 'CNY' },
  hi: { rate: 83, symbol: '₹', name: 'INR' },
  es: { rate: 0.92, symbol: '€', name: 'EUR' },
  fr: { rate: 0.92, symbol: '€', name: 'EUR' },
  de: { rate: 0.92, symbol: '€', name: 'EUR' },
  nl: { rate: 0.92, symbol: '€', name: 'EUR' },
  pt: { rate: 5.1, symbol: 'R$', name: 'BRL' },
  ru: { rate: 95, symbol: '₽', name: 'RUB' }
};

// 🎯 채널파인더 방식: 채널 국가에 따른 자동 RPM 선택
export const getChannelFinderRpmByCountry = (country: string): { shorts: number; long: number } => {
  const countryName = country || '기타';
  const rpmValues = EXPLORATION_COUNTRY_RPM_VALUES[countryName] || EXPLORATION_COUNTRY_RPM_VALUES["기타"];
  return {
    shorts: rpmValues.shortsRpm,
    long: rpmValues.longRpm
  };
};

// 💰 채널파인더 방식: 월 수익 계산 (tableMonthlyRevenue.ts 로직 복사)
export const calculateExplorationMonthlyRevenue = (
  channel: any,
  language: string = 'ko'
): { usd: number; local: string; localAmount: number } => {
  // 1. 기본값 체크
  if (!channel.operatingPeriod || channel.operatingPeriod <= 0) {
    const currencyInfo = EXPLORATION_CURRENCY_EXCHANGE_RATES[language] || EXPLORATION_CURRENCY_EXCHANGE_RATES['en'];
    return {
      usd: 0,
      local: language === 'en' ? '$0' : `0${currencyInfo.symbol}`,
      localAmount: 0
    };
  }

  // 2. 채널 국가에 따른 RPM 자동 선택 (채널파인더와 동일)
  const countryName = channel.country || 'United States';
  const rpmValues = EXPLORATION_COUNTRY_RPM_VALUES[countryName] || EXPLORATION_COUNTRY_RPM_VALUES["United States"];
  const { shortsRpm, longRpm } = rpmValues;

  // 3. 조회수 분할 (실제 API 데이터 사용 - 채널파인더와 동일한 필드명)
  const vsvp = channel.vsvp || 20;
  const vlvp = channel.vlvp || 80;

  const shortsViews = channel.totalViews * (vsvp / 100);
  const longViews = channel.totalViews * (vlvp / 100);

  // 4. USD 수익 계산 (채널파인더와 동일)
  const shortsRevenueUSD = (shortsViews / 1000) * shortsRpm;
  const longRevenueUSD = (longViews / 1000) * longRpm;
  const totalRevenueUSD = shortsRevenueUSD + longRevenueUSD;

  // 5. 월평균 수익 계산
  const monthlyRevenueUSD = totalRevenueUSD / channel.operatingPeriod;

  // 6. 현지 통화 변환
  const currencyInfo = EXPLORATION_CURRENCY_EXCHANGE_RATES[language] || EXPLORATION_CURRENCY_EXCHANGE_RATES['en'];
  const monthlyRevenueLocal = monthlyRevenueUSD * currencyInfo.rate;
  const amount = Math.round(monthlyRevenueLocal);

  // 7. 언어별 포맷팅 (채널파인더 동일 로직)
  let formattedLocal = '';

  if (language === 'en') {
    if (amount >= 1000000000) {
      formattedLocal = `$${(amount / 1000000000).toFixed(1)}B`;
    } else if (amount >= 1000000) {
      formattedLocal = `$${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      formattedLocal = `$${(amount / 1000).toFixed(1)}K`;
    } else {
      formattedLocal = `$${amount.toLocaleString()}`;
    }
  } else if (language === 'ko') {
    if (amount >= 100000000) {
      const eok = Math.floor(amount / 100000000);
      const remainder = amount % 100000000;
      const man = Math.floor(remainder / 10000);
      formattedLocal = man > 0 ? `${eok}억 ${man}만원` : `${eok}억원`;
    } else if (amount >= 10000) {
      const man = Math.floor(amount / 10000);
      const remainder = amount % 10000;
      formattedLocal = remainder > 0 ? `${man}만 ${remainder.toLocaleString()}원` : `${man}만원`;
    } else {
      formattedLocal = `${amount.toLocaleString()}원`;
    }
  } else {
    // 기타 언어는 M, B 포맷
    const symbol = currencyInfo.symbol;
    if (amount >= 1000000000) {
      formattedLocal = `${(amount / 1000000000).toFixed(1)}B${symbol}`;
    } else if (amount >= 1000000) {
      formattedLocal = `${(amount / 1000000).toFixed(1)}M${symbol}`;
    } else if (amount >= 1000) {
      formattedLocal = `${(amount / 1000).toFixed(1)}K${symbol}`;
    } else {
      formattedLocal = `${amount.toLocaleString()}${symbol}`;
    }
  }

  return {
    usd: Math.round(monthlyRevenueUSD),
    local: formattedLocal,
    localAmount: amount
  };
};

// 💰 기존 함수 (하위 호환성)
export const calculateExplorationRevenue = (
  totalViews: number,
  shortsPercentage: number,
  longPercentage: number,
  shortsRpm: number,
  longRpm: number
) => {
  const shortsViews = totalViews * (shortsPercentage / 100);
  const longViews = totalViews * (longPercentage / 100);

  const shortsRevenueUsd = (shortsViews / 1000) * shortsRpm;
  const longRevenueUsd = (longViews / 1000) * longRpm;

  return {
    shortsRevenueUsd,
    longRevenueUsd,
    totalRevenueUsd: shortsRevenueUsd + longRevenueUsd
  };
};