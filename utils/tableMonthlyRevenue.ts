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

export const calculateTableMonthlyRevenue = (
  channel: ChannelData,
  exchangeRate: number = 1300
): string => {
  // 1. 기본값 체크
  if (!channel.operatingPeriod || channel.operatingPeriod <= 0) return '0원';
  
  // 2. 채널의 국가에 따른 RPM 값 선택
  const countryName = channel.country || 'United States'; // 기본값은 미국
  const rpmValues = COUNTRY_RPM_VALUES[countryName] || COUNTRY_RPM_VALUES["United States"];
  const { shortsRpm, longRpm } = rpmValues;
  
  // 🔍 디버깅: 미스터비스트 데이터 확인
  if (channel.channelName && channel.channelName.includes('MrBeast')) {
    console.log('🔍 MrBeast 디버깅:');
    console.log('- country:', channel.country);
    console.log('- totalViews:', channel.totalViews);
    console.log('- operatingPeriod:', channel.operatingPeriod);
    console.log('- shortsViewsPercentage:', channel.shortsViewsPercentage);
    console.log('- longformViewsPercentage:', channel.longformViewsPercentage);
    console.log('- shortsRpm:', shortsRpm, 'longRpm:', longRpm);
  }
  
  // 3. 조회수 분할 (퍼센트를 소수로 변환)
  const vsvp = channel.shortsViewsPercentage || 20; // 기본값 20%
  const vlvp = channel.longformViewsPercentage || 80; // 기본값 80%
  
  const shortsViews = channel.totalViews * (vsvp / 100);
  const longViews = channel.totalViews * (vlvp / 100);
  
  // 4. 각각의 수익 계산 (USD) - 고정 RPM 값 사용
  const shortsRevenueUSD = (shortsViews / 1000) * shortsRpm;
  const longRevenueUSD = (longViews / 1000) * longRpm;
  const totalRevenueUSD = shortsRevenueUSD + longRevenueUSD;
  
  // 4. 운영기간 (이미 개월 단위로 들어옴)
  const channelAgeMonths = channel.operatingPeriod; // 이미 개월 단위
  
  // 5. 월평균 수익 계산
  const monthlyAvgUSD = totalRevenueUSD / channelAgeMonths;
  
  // 6. 한국원으로 변환
  const monthlyAvgKRW = monthlyAvgUSD * exchangeRate;
  
  // 7. 한국원 포맷팅 (억, 만원 단위)
  const amount = Math.round(monthlyAvgKRW);
  if (amount >= 100000000) {
    const eok = Math.floor(amount / 100000000);
    const remainder = amount % 100000000;
    const man = Math.floor(remainder / 10000);
    if (man > 0) {
      return `${eok}억 ${man}만원`;
    } else {
      return `${eok}억원`;
    }
  } else if (amount >= 10000) {
    const man = Math.floor(amount / 10000);
    const remainder = amount % 10000;
    if (remainder > 0) {
      return `${man}만 ${remainder.toLocaleString()}원`;
    } else {
      return `${man}만원`;
    }
  } else {
    return `${amount.toLocaleString()}원`;
  }
};