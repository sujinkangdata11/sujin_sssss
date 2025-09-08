// 테이블 전용 월 수익 계산 유틸리티
import { ChannelData } from '../components/ChannelFinder/types';

// 실제 RPM 데이터 (countryRpmDefaults.json에서 가져옴)
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

// 각 언어별 환율 및 통화 정보 (하드코딩)
const CURRENCY_EXCHANGE_RATES = {
  en: { rate: 1, symbol: '$', name: 'USD' },         // 미국 달러 (기준)
  ko: { rate: 1300, symbol: '원', name: 'KRW' },      // 한국 원
  ja: { rate: 150, symbol: '円', name: 'JPY' },       // 일본 엔
  zh: { rate: 7.2, symbol: '元', name: 'CNY' },       // 중국 위안
  hi: { rate: 83, symbol: '₹', name: 'INR' },        // 인도 루피
  es: { rate: 0.92, symbol: '€', name: 'EUR' },      // 스페인 유로
  fr: { rate: 0.92, symbol: '€', name: 'EUR' },      // 프랑스 유로
  de: { rate: 0.92, symbol: '€', name: 'EUR' },      // 독일 유로
  nl: { rate: 0.92, symbol: '€', name: 'EUR' },      // 네덜란드 유로
  pt: { rate: 5.1, symbol: 'R$', name: 'BRL' },     // 브라질 헤알
  ru: { rate: 95, symbol: '₽', name: 'RUB' }         // 러시아 루블
};

export const calculateTableMonthlyRevenue = (
  channel: ChannelData,
  language: string = 'ko'
): string => {
  // 1. 언어별 통화 정보 선택 (지원 안되는 언어는 USD 기본값)
  const currencyInfo = CURRENCY_EXCHANGE_RATES[language] || CURRENCY_EXCHANGE_RATES['en'];
  const { rate, symbol } = currencyInfo;
  
  // 2. 기본값 체크
  if (!channel.operatingPeriod || channel.operatingPeriod <= 0) {
    return language === 'en' ? '$0' : `0${symbol}`;
  }
  
  // 3. 채널의 국가에 따른 RPM 값 선택
  const countryName = channel.country || 'United States'; // 기본값은 미국
  const rpmValues = COUNTRY_RPM_VALUES[countryName] || COUNTRY_RPM_VALUES["United States"];
  const { shortsRpm, longRpm } = rpmValues;
  
  // 4. 조회수 분할 (퍼센트를 소수로 변환)
  const vsvp = channel.shortsViewsPercentage || 20; // 기본값 20%
  const vlvp = channel.longformViewsPercentage || 80; // 기본값 80%
  
  const shortsViews = channel.totalViews * (vsvp / 100);
  const longViews = channel.totalViews * (vlvp / 100);
  
  // 5. 각각의 수익 계산 (USD) - 고정 RPM 값 사용
  const shortsRevenueUSD = (shortsViews / 1000) * shortsRpm;
  const longRevenueUSD = (longViews / 1000) * longRpm;
  const totalRevenueUSD = shortsRevenueUSD + longRevenueUSD;
  
  // 6. 운영기간 (이미 개월 단위로 들어옴)
  const channelAgeMonths = channel.operatingPeriod; // 이미 개월 단위
  
  // 7. 월평균 수익 계산
  const monthlyAvgUSD = totalRevenueUSD / channelAgeMonths;
  
  // 8. 해당 언어의 통화로 변환
  const monthlyAvgLocal = monthlyAvgUSD * rate;
  
  // 9. 언어별 포맷팅
  const amount = Math.round(monthlyAvgLocal);
  
  if (language === 'en') {
    // 미국: USD 달러 포맷 (Million, Billion 단위)
    if (amount >= 1000000000) {
      const billions = (amount / 1000000000).toFixed(1);
      return `$${billions}B`;
    } else if (amount >= 1000000) {
      const millions = (amount / 1000000).toFixed(1);
      return `$${millions}M`;
    } else if (amount >= 1000) {
      const thousands = (amount / 1000).toFixed(1);
      return `$${thousands}K`;
    } else {
      return `$${amount.toLocaleString()}`;
    }
  } else if (language === 'ko') {
    // 한국: 억, 만원 단위 포맷
    if (amount >= 100000000) {
      const eok = Math.floor(amount / 100000000);
      const remainder = amount % 100000000;
      const man = Math.floor(remainder / 10000);
      if (man > 0) {
        return `${eok}억 ${man}만${symbol}`;
      } else {
        return `${eok}억${symbol}`;
      }
    } else if (amount >= 10000) {
      const man = Math.floor(amount / 10000);
      const remainder = amount % 10000;
      if (remainder > 0) {
        return `${man}만 ${remainder.toLocaleString()}${symbol}`;
      } else {
        return `${man}만${symbol}`;
      }
    } else {
      return `${amount.toLocaleString()}${symbol}`;
    }
  } else if (language === 'ja') {
    // 일본: 만円 단위 포맷
    if (amount >= 100000000) {
      const oku = Math.floor(amount / 100000000);
      const remainder = amount % 100000000;
      const man = Math.floor(remainder / 10000);
      if (man > 0) {
        return `${oku}億 ${man}万${symbol}`;
      } else {
        return `${oku}億${symbol}`;
      }
    } else if (amount >= 10000) {
      const man = Math.floor(amount / 10000);
      const remainder = amount % 10000;
      if (remainder > 0) {
        return `${man}万 ${remainder.toLocaleString()}${symbol}`;
      } else {
        return `${man}万${symbol}`;
      }
    } else {
      return `${amount.toLocaleString()}${symbol}`;
    }
  } else if (language === 'zh') {
    // 중국: 万, 亿 단위 포맷
    if (amount >= 100000000) {
      const yi = Math.floor(amount / 100000000);
      const remainder = amount % 100000000;
      const wan = Math.floor(remainder / 10000);
      if (wan > 0) {
        return `${yi}亿 ${wan}万${symbol}`;
      } else {
        return `${yi}亿${symbol}`;
      }
    } else if (amount >= 10000) {
      const wan = Math.floor(amount / 10000);
      const remainder = amount % 10000;
      if (remainder > 0) {
        return `${wan}万 ${remainder.toLocaleString()}${symbol}`;
      } else {
        return `${wan}万${symbol}`;
      }
    } else {
      return `${amount.toLocaleString()}${symbol}`;
    }
  } else if (language === 'hi') {
    // 인도: 크로르(10M), 라크(0.1M) 단위 포맷
    if (amount >= 10000000) {
      const crore = Math.floor(amount / 10000000);
      const remainder = amount % 10000000;
      const lakh = Math.floor(remainder / 100000);
      if (lakh > 0) {
        return `${crore}करोड़ ${lakh}लाख${symbol}`;
      } else {
        return `${crore}करोड़${symbol}`;
      }
    } else if (amount >= 100000) {
      const lakh = Math.floor(amount / 100000);
      const remainder = amount % 100000;
      if (remainder > 0) {
        return `${lakh}लाख ${remainder.toLocaleString()}${symbol}`;
      } else {
        return `${lakh}लाख${symbol}`;
      }
    } else {
      return `${amount.toLocaleString()}${symbol}`;
    }
  } else if (['es', 'fr', 'de', 'nl', 'pt'].includes(language)) {
    // 유럽 언어들: Million, Billion 단위 포맷
    if (amount >= 1000000000) {
      const billions = (amount / 1000000000).toFixed(1);
      return `${billions}B${symbol}`;
    } else if (amount >= 1000000) {
      const millions = (amount / 1000000).toFixed(1);
      return `${millions}M${symbol}`;
    } else if (amount >= 1000) {
      const thousands = (amount / 1000).toFixed(1);
      return `${thousands}K${symbol}`;
    } else {
      return `${amount.toLocaleString()}${symbol}`;
    }
  } else if (language === 'ru') {
    // 러시아: млн(Million), млрд(Billion) 단위 포맷
    if (amount >= 1000000000) {
      const billions = (amount / 1000000000).toFixed(1);
      return `${billions}млрд${symbol}`;
    } else if (amount >= 1000000) {
      const millions = (amount / 1000000).toFixed(1);
      return `${millions}млн${symbol}`;
    } else if (amount >= 1000) {
      const thousands = (amount / 1000).toFixed(1);
      return `${thousands}тыс${symbol}`;
    } else {
      return `${amount.toLocaleString()}${symbol}`;
    }
  } else {
    // 기타 언어: 기본 M, B 포맷
    if (amount >= 1000000000) {
      const billions = (amount / 1000000000).toFixed(1);
      return `${billions}B${symbol}`;
    } else if (amount >= 1000000) {
      const millions = (amount / 1000000).toFixed(1);
      return `${millions}M${symbol}`;
    } else if (amount >= 1000) {
      const thousands = (amount / 1000).toFixed(1);
      return `${thousands}K${symbol}`;
    } else {
      return `${amount.toLocaleString()}${symbol}`;
    }
  }
};