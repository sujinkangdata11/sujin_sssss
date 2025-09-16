import React, { useState } from 'react';
import { Language } from '../types';
import { translations } from '../i18n/translations';
import { channelFinderI18n, getChannelFinderTranslation, formatLocalizedNumber } from '../i18n/channelFinderI18n';
import SEOHead from '../components/SEOHead';
import DropdownOptions from '../components/DropdownOptions';
import Pagination from '../components/Pagination';
import countryRpmDefaults from '../data/countryRpmDefaults.json';
import currencyExchangeData from '../data/currencyExchangeData.json';
import { cloudflareService } from '../services/mainFinder/cloudflareService';
import { calculateTableMonthlyRevenue, calculateMonthlyRevenueUSD } from '../utils/tableMonthlyRevenue';
import { CONFIG, countryDisplayNames } from '../components/ChannelFinder/constants';
import { ChannelFinderProps, ChannelData } from '../components/ChannelFinder/types';
import { formatRevenue, calculateRevenueFromViews, calculateViewsPerSubscriber, calculateSubscriptionRate, formatUploadFrequency } from '../components/ChannelFinder/utils';
import { useChannelData } from '../components/ChannelFinder/hooks/useChannelData';
import { usePagination } from '../components/ChannelFinder/hooks/usePagination';
import TableHeader from '../components/ChannelFinder/components/TableHeader';
import TableRow from '../components/ChannelFinder/components/TableRow';
import ChannelSidebar from '../components/ChannelFinder/components/ChannelSidebar';
import TableSkeleton from '../components/ChannelFinder/components/TableSkeleton';
import SidebarSkeleton from '../components/ChannelFinder/components/SidebarSkeleton';
import FilterTagsSection, { FilterState } from '../components/ChannelFinder/components/FilterTagsSection';
import { applyFilters } from '../components/ChannelFinder/filters/sentenceFilters';
import styles from '../styles/ChannelFinder.module.css';
import '../styles/ChannelFinderMobile.css';


// 🌍 통합 국가 매핑 함수 - US = United States = 미국 모든 형태 지원
const getCountryDisplayName = (language: Language, countryInput: string): string => {
  // 국가 코드 → 영어명 → 다국어명 통합 매핑
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

  const country = unifiedCountryMap[countryInput];
  if (country) {
    return country.translations[language] || country.englishName;
  }

  // 매핑되지 않은 경우 기타로 처리
  return unifiedCountryMap['기타'].translations[language];
};


const SubTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <h4 className={styles.subtitle}>{children}</h4>;
};

const ChannelFinder: React.FC<ChannelFinderProps> = ({ language }) => {
  const t = (key: keyof typeof translations['en']) => translations[language][key] || translations['en'][key];
  const cf = (key: string) => getChannelFinderTranslation(channelFinderI18n, language, key);
  
  // 국가 옵션 배열 생성 (사이드바용)
  const countryOptions = Object.keys(countryRpmDefaults).map(country => ({
    value: country,
    label: getCountryDisplayName(language, country)
  }));
  
  // 메인 테이블용 국가 옵션 배열 ("전체 국가" 포함) - 사이드바와 동일한 국가 목록 사용
  const mainCountryOptions = [
    { value: '', label: 'ALL' },
    ...countryOptions
  ];
  const [selectedChannel, setSelectedChannel] = useState<ChannelData | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentCountry, setCurrentCountry] = useState(() => {
    // 한국어 사용자면 South Korea, 아니면 기타
    return language === 'ko' ? 'South Korea' : '기타';
  });
  const [shortsRpm, setShortsRpm] = useState(() => {
    const defaultCountry = language === 'ko' ? 'South Korea' : '기타';
    return countryRpmDefaults[defaultCountry].shorts;
  });
  const [longRpm, setLongRpm] = useState(() => {
    const defaultCountry = language === 'ko' ? 'South Korea' : '기타';
    return countryRpmDefaults[defaultCountry].long;
  });
  const [exchangeRate, setExchangeRate] = useState(() => {
    // 🌍 각 언어별 기본 환율 설정 (실제 환율 기준)
    const defaultRates = {
      ko: 1300,  // 한국원
      ja: 150,   // 일본엔  
      zh: 7.2,   // 중국위안
      hi: 83,    // 인도루피
      es: 0.92,  // 스페인유로
      fr: 0.92,  // 프랑스유로
      de: 0.92,  // 독일유로
      nl: 0.92,  // 네덜란드유로
      pt: 5.1,   // 브라질헤알
      ru: 95,    // 러시아루블
      en: 1      // 미국달러 (기준)
    };
    const rate = defaultRates[language] || 1;
    console.log('🔍 [DEBUG] 초기 환율 설정:', {
      language,
      rate,
      defaultRates
    });
    return rate;
  });
  // 선택된 채널의 숏폼/롱폼 비율 (실제 데이터 사용)
  const shortsPercentage = selectedChannel?.shortsViewsPercentage !== undefined && selectedChannel?.shortsViewsPercentage !== null ? selectedChannel.shortsViewsPercentage : 20;
  const longPercentage = selectedChannel?.longformViewsPercentage !== undefined && selectedChannel?.longformViewsPercentage !== null ? selectedChannel.longformViewsPercentage : 80;

  // 숫자를 영어 단위로 변환하는 함수
  const formatToEnglishUnits = (num: number): string => {
    if (num >= 1000000000) {
      return (num / 1000000000).toFixed(1) + 'B';
    } else if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    } else {
      return num.toString();
    }
  };

  // 구독자 성장 차트 데이터 생성
  const generateChartData = () => {
    const history = selectedChannel?.subscriberHistory || [];
    if (history.length === 0) return [];

    const chartWidth = 240; // 300에서 여백 60 빼기
    const pointSpacing = history.length > 1 ? chartWidth / (history.length - 1) : 0;
    
    return history.map((item, index) => {
      const x = 30 + (index * pointSpacing);
      const subscriberCount = parseInt(item.count) || 0;
      const y = 80 - (index * 15); // 간단한 상승 곡선
      const monthName = new Date(item.month + '-01').toLocaleDateString('ko-KR', { month: 'long' });
      
      return {
        x,
        y,
        value: formatToEnglishUnits(subscriberCount),
        month: monthName,
        index
      };
    }).slice(-5); // 최근 5개월만
  };

  const chartData = generateChartData();
  const [sortMenuOpen, setSortMenuOpen] = useState<string | null>(null);
  const [sortedChannels, setSortedChannels] = useState<ChannelData[]>([]);
  const [countrySearch, setCountrySearch] = useState('');
  const [filteredChannels, setFilteredChannels] = useState<ChannelData[]>([]);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [loading, setLoading] = useState(true); // 데이터 로딩 상태
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null); // 호버된 포인트 인덱스
  const [hoveredStat, setHoveredStat] = useState<string | null>(null); // 호버된 통계 항목
  const [apiStatus, setApiStatus] = useState<{
    isConnected: boolean;
    message: string;
    dataSource: 'api' | 'cache' | 'mock';
  }>({
    isConnected: false,
    message: '연결 확인 중...',
    dataSource: 'mock'
  });
  const [dropdownState, setDropdownState] = useState<{
    isOpen: boolean;
    type: 'main' | 'sidebar' | null;
    position: { x: number; y: number } | null;
  }>({
    isOpen: false,
    type: null,
    position: null
  });

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  
  // 언어별 기본 환율 및 화폐 단위
  const currencySettings = {
    en: { rate: 1, symbol: 'USD', code: '$' },
    ko: { rate: 1300, symbol: '원', code: '₩' },
    ja: { rate: 150, symbol: '円', code: '¥' },
    zh: { rate: 7, symbol: '元', code: '¥' },
    hi: { rate: 83, symbol: 'रुपये', code: '₹' },
    es: { rate: 0.92, symbol: 'euros', code: '€' },
    fr: { rate: 0.92, symbol: 'euros', code: '€' },
    de: { rate: 0.92, symbol: 'euros', code: '€' },
    nl: { rate: 0.92, symbol: 'euros', code: '€' },
    pt: { rate: 0.92, symbol: 'euros', code: '€' },
    ru: { rate: 95, symbol: 'рублей', code: '₽' }
  };

  // 현지 화폐 환율 및 모달 상태
  const [localExchangeRate, setLocalExchangeRate] = useState(1300);
  const [exchangeRateModalOpen, setExchangeRateModalOpen] = useState(false);
  const [tempExchangeRate, setTempExchangeRate] = useState(() => {
    // 🌍 초기값도 언어별 기본 환율 사용
    const defaultRates = {
      ko: 1300, ja: 150, zh: 7.2, hi: 83, es: 0.92, 
      fr: 0.92, de: 0.92, nl: 0.92, pt: 5.1, ru: 95, en: 1
    };
    return defaultRates[language] || 1;
  });

  // 필터나 정렬이 변경되면 첫 페이지로 리셋
  React.useEffect(() => {
    setCurrentPage(1);
  }, [filteredChannels.length, selectedCountry]);


  // 언어가 변경되면 환율을 해당 언어에 맞게 업데이트
  React.useEffect(() => {
    // 🌍 언어별 기본 환율로 업데이트
    const defaultRates = {
      ko: 1300, ja: 150, zh: 7.2, hi: 83, es: 0.92, 
      fr: 0.92, de: 0.92, nl: 0.92, pt: 5.1, ru: 95, en: 1
    };
    const newRate = defaultRates[language] || 1;
    console.log('🔍 [DEBUG] 언어 변경 effect:', {
      language,
      newRate,
      defaultRates
    });
    setTempExchangeRate(newRate);
    setExchangeRate(newRate);
  }, [language]);


  // 그래프 호버 툴팁 데이터
  const growthTooltips = [
    { from: '5월', to: '6월', growth: 3, message: ['5월에서 6월에', '3% 성장했어요'] },
    { from: '6월', to: '7월', growth: 4, message: ['6월에서 7월에', '4% 성장했어요'] },
    { from: '7월', to: '8월', growth: 7.3, message: ['7월에서 8월에', '7.3% 성장했어요'] },
    { from: '8월', to: '9월', growth: 10, message: ['8월에서 9월에', '10% 성장했어요'] }
  ];

  // 유튜브 공식 카테고리 목록
  const youtubeCategories = [
    'All',
    'Film & Animation',
    'Autos & Vehicles', 
    'Music',
    'Pets & Animals',
    'Sports',
    'Travel & Events',
    'Gaming',
    'People & Blogs',
    'Comedy',
    'Entertainment',
    'News & Politics',
    'Howto & Style',
    'Education',
    'Science & Technology',
    'Nonprofits & Activism'
  ];

  // 포매팅 함수들 - 숫자 데이터를 사용자가 읽기 쉬운 형태로 변환 (언어별 단위 적용)
  const formatNumber = (num: number): string => {
    return formatLocalizedNumber(num, language, '');
  };

  // 성장 지표용 포매팅 (최대 5자리 숫자까지만)
  const formatGrowthNumber = (num: number): string => {
    // 5자리까지만 표시하면서 적절한 단위 사용
    if (language === 'ko') {
      // 한국어: 만, 억 단위로 5자리 제한
      if (num >= 100000000) { // 억 단위
        const eok = Math.floor(num / 100000000);
        const man = Math.floor((num % 100000000) / 10000);
        if (man >= 1000) {
          // 만의 자리가 4자리면 천 단위로 반올림
          const roundedMan = Math.round(man / 1000) * 1000;
          return `${eok}억 ${roundedMan / 1000}천만`;
        } else if (man > 0) {
          return `${eok}억 ${man}만`;
        }
        return `${eok}억`;
      } else if (num >= 10000) { // 만 단위
        const man = Math.floor(num / 10000);
        const remainder = num % 10000;
        if (remainder >= 1000) {
          // 천 단위로 표시
          const thousand = Math.round(remainder / 1000);
          return `${man}만 ${thousand}천`;
        } else if (remainder > 0) {
          // 나머지가 있으면 반올림해서 천 단위로
          const rounded = Math.round(remainder / 100) * 100;
          if (rounded >= 1000) {
            return `${man}만 1천`;
          } else if (rounded > 0) {
            return `${man}만 ${Math.round(rounded / 100)}백`;
          }
        }
        return `${man}만`;
      }
      return num.toLocaleString();
    } else {
      // 영어: K, M, B 단위로 5자리 제한
      return formatLocalizedNumber(num, language, '');
    }
  };

  const formatSubscribers = (num: number): string => {
    const unit = getChannelFinderTranslation(channelFinderI18n, language, 'units.people');
    return formatNumber(num) + unit;
  };

  const formatViews = (num: number): string => {
    return formatNumber(num);
  };

  const formatGrowth = (num: number): string => {
    return '+' + formatGrowthNumber(num);
  };

  const formatVideosCount = (num: number): string => {
    const unit = getChannelFinderTranslation(channelFinderI18n, language, 'units.items');
    return num.toLocaleString() + unit;
  };

  const formatOperatingPeriod = (months: number): string => {
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    const yearUnit = getChannelFinderTranslation(channelFinderI18n, language, 'units.years');
    const monthUnit = getChannelFinderTranslation(channelFinderI18n, language, 'units.months');
    return `${years}${yearUnit} ${remainingMonths}${monthUnit}`;
  };

  const formatUploadFrequency = (videosPerWeek: number): string => {
    const weekUnit = getChannelFinderTranslation(channelFinderI18n, language, 'units.perWeek');
    
    if (videosPerWeek >= 7) {
      const perDay = Math.round(videosPerWeek / 7);
      // 언어별 일일 업로드 표현
      switch (language) {
        case 'en': return `${perDay} daily`;
        case 'ko': return `하루 ${perDay}개`;
        case 'ja': return `日${perDay}本`;
        case 'zh': return `每日${perDay}个`;
        case 'hi': return `दैनिक ${perDay}`;
        case 'es': return `${perDay} diarios`;
        case 'fr': return `${perDay} par jour`;
        case 'de': return `${perDay} täglich`;
        case 'nl': return `${perDay} dagelijks`;
        case 'pt': return `${perDay} diários`;
        case 'ru': return `${perDay} в день`;
        default: return `${perDay} daily`;
      }
    } else {
      return `${videosPerWeek}${weekUnit}`;
    }
  };

  // TODO: 구글 드라이브 연동 후 변수처리될 예정 (현재 하드코딩)
  const dummyChannels: ChannelData[] = [
    {
      id: 'mrbeast',
      rank: 1,
      channelName: "MrBeast",
      category: "Entertainment",
      subscribers: 424000000,
      yearlyGrowth: 125480000,
      monthlyGrowth: 31390000,
      dailyGrowth: 1040000,
      subscribersPerVideo: 470000,
      operatingPeriod: 162, // months
      totalViews: 93991060000,
      avgViews: 104900000,
      videosCount: 896,
      uploadFrequency: 1, // per week
      country: "United States",
      youtubeUrl: "https://www.youtube.com/@MrBeast",
      // 수익 계산용 기준 데이터 (조회수)
      shortsTotalViews: 1750000,    // 숏폼 총 조회수
      longTotalViews: 462800000     // 롱폼 총 조회수
    },
    {
      id: 'tseries',
      rank: 2,
      channelName: "T-Series",
      category: "Music", 
      subscribers: 300000000,
      yearlyGrowth: 75480000,
      monthlyGrowth: 15480000,
      dailyGrowth: 510000,
      subscribersPerVideo: 12435,
      operatingPeriod: 233, // months
      totalViews: 309025820000,
      avgViews: 12760000,
      videosCount: 2420,
      uploadFrequency: 70, // per week (daily 10)
      country: "India",
      youtubeUrl: "https://www.youtube.com/@tseries",
      // 수익 계산용 기준 데이터 (조회수)
      shortsTotalViews: 850000,     // 숏폼 총 조회수
      longTotalViews: 289000000     // 롱폼 총 조회수
    }
  ];

  // 🌐 CloudflareService에서 실제 채널 데이터 로딩
  React.useEffect(() => {
    const loadChannelData = async () => {
      try {
        setLoading(true);
        setApiStatus({
          isConnected: false,
          message: '데이터를 불러오고 있습니다...',
          dataSource: 'mock'
        });
        
        console.log('📊 [INFO] 채널 데이터 로딩 시작...');
        
        // CloudflareService에서 데이터 가져오기
        const result = await cloudflareService.getChannelData();
        
        if (result.success && result.data.length > 0) {
          console.log('✅ [SUCCESS] 채널 데이터 로드 성공:', result.data.length, '개');
          
          // 기본 정렬: 구독자 수 높은 순
          const sortedData = [...result.data].sort((a, b) => b.subscribers - a.subscribers);
          
          setSortedChannels(sortedData);
          setFilteredChannels(sortedData);
          
          // API 상태 업데이트
          setApiStatus({
            isConnected: true,
            message: result.message,
            dataSource: result.fromCache ? 'cache' : 
                       result.message.includes('Mock') ? 'mock' : 'api'
          });
        } else {
          // API 실패시 더미 데이터 폴백
          console.warn('⚠️ [WARNING] API 데이터 로드 실패, 더미 데이터 사용');
          
          // 기본 정렬: 구독자 수 높은 순
          const sortedDummyData = [...dummyChannels].sort((a, b) => b.subscribers - a.subscribers);
          
          setSortedChannels(sortedDummyData);
          setFilteredChannels(sortedDummyData);
          
          setApiStatus({
            isConnected: false,
            message: 'API 서버에 연결할 수 없어 샘플 데이터를 표시합니다.',
            dataSource: 'mock'
          });
        }
        
        console.log('📊 [INFO] 로딩 완료 -', result.message);
        
      } catch (error) {
        console.error('❌ [ERROR] 채널 데이터 로딩 실패:', error);
        // 에러 발생시 더미 데이터 사용
        
        // 기본 정렬: 구독자 수 높은 순
        const sortedDummyData = [...dummyChannels].sort((a, b) => b.subscribers - a.subscribers);
        
        setSortedChannels(sortedDummyData);
        setFilteredChannels(sortedDummyData);
        
        setApiStatus({
          isConnected: false,
          message: `연결 오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}`,
          dataSource: 'mock'
        });
      } finally {
        setLoading(false);
      }
    };

    loadChannelData();
  }, []);

  // 국가 필터링 - 문장형 필터 적용 시 비활성화
  const [sentenceFilterActive, setSentenceFilterActive] = React.useState(false);
  
  React.useEffect(() => {
    // 문장형 필터가 활성화되어 있으면 국가 필터링 건너뛰기
    if (sentenceFilterActive) {
      return;
    }
    
    let filtered = [...sortedChannels];
    
    if (selectedCountry) {
      filtered = filtered.filter(channel => channel.country === selectedCountry);
    }
    
    if (countrySearch.trim() !== '') {
      filtered = filtered.filter(channel => 
        channel.country.toLowerCase().includes(countrySearch.toLowerCase())
      );
    }
    
    setFilteredChannels(filtered);
  }, [countrySearch, selectedCountry, sortedChannels, sentenceFilterActive]);

  const handleHeaderClick = (column: string) => {
    setSortMenuOpen(sortMenuOpen === column ? null : column);
  };

  const handleSort = (column: string, direction: 'asc' | 'desc') => {
    // 🔄 CONDITIONAL SORTING: 문장형 필터 활성화 시 필터된 데이터만 정렬
    // ⚠️ 문제 발생시 이 조건문 전체 제거하고 기존 로직만 사용
    const dataToSort = sentenceFilterActive ? filteredChannels : sortedChannels;
    const sorted = [...dataToSort].sort((a, b) => {
      let aValue: number = 0;
      let bValue: number = 0;

      switch(column) {
        case 'subscribers':
          aValue = a.subscribers;
          bValue = b.subscribers;
          break;
        // 🔄 OLD: 매년증가 정렬 -> 🆕 NEW: 월 수익 정렬 (USD 기준)
        case 'monthlyRevenue':
          // 🔄 FIXED: 정렬은 순수 USD 값 사용, 표시는 다국어 환율 적용
          aValue = calculateMonthlyRevenueUSD(a); // 순수 USD 숫자값
          bValue = calculateMonthlyRevenueUSD(b); // 순수 USD 숫자값
          break;
        case 'yearlyGrowth': // 백업용으로 유지
          aValue = a.yearlyGrowth;
          bValue = b.yearlyGrowth;
          break;
        case 'monthlyGrowth':
          aValue = a.monthlyGrowth;
          bValue = b.monthlyGrowth;
          break;
        case 'totalViews':
          aValue = a.totalViews;
          bValue = b.totalViews;
          break;
        case 'videosCount':
          aValue = a.videosCount;
          bValue = b.videosCount;
          break;
        case 'dailyGrowth':
          aValue = a.dailyGrowth;
          bValue = b.dailyGrowth;
          break;
        case 'subscribersPerVideo':
          aValue = a.subscribersPerVideo;
          bValue = b.subscribersPerVideo;
          break;
        case 'operatingPeriod':
          aValue = a.operatingPeriod;
          bValue = b.operatingPeriod;
          break;
        case 'avgViews':
          aValue = a.avgViews;
          bValue = b.avgViews;
          break;
        case 'uploadFrequency':
          aValue = a.uploadFrequency;
          bValue = b.uploadFrequency;
          break;
        case 'country':
        case 'category':
          // 문자열 비교
          const aStr = column === 'country' ? a.country : a.category;
          const bStr = column === 'country' ? b.country : b.category;
          return direction === 'desc' ? bStr.localeCompare(aStr) : aStr.localeCompare(bStr);
        default:
          return 0;
      }

      return direction === 'desc' ? bValue - aValue : aValue - bValue;
    });

    // 🔄 CONDITIONAL STATE UPDATE: 문장형 필터 상태에 따라 다른 상태 업데이트
    // ⚠️ 문제 발생시 이 조건문 제거하고 setSortedChannels(sorted)만 사용
    if (sentenceFilterActive) {
      setFilteredChannels(sorted); // 필터된 데이터만 정렬 결과 반영
    } else {
      setSortedChannels(sorted);   // 기존 로직: 전체 데이터 정렬
    }
    
    setSortMenuOpen(null);
  };

  const openDropdown = (type: 'main' | 'sidebar', event: React.MouseEvent) => {
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    setDropdownState({
      isOpen: true,
      type,
      position: {
        x: rect.right + 0, // 드롭다운 위치 조정
        y: rect.bottom + 4
      }
    });
  };

  const closeDropdown = () => {
    setDropdownState({
      isOpen: false,
      type: null,
      position: null
    });
  };

  const handleDropdownSelect = (value: string) => {
    if (dropdownState.type === 'main') {
      setSelectedCountry(value);
    } else if (dropdownState.type === 'sidebar') {
      const newCountry = value as keyof typeof countryRpmDefaults;
      setCurrentCountry(newCountry);
      const rpm = countryRpmDefaults[newCountry];
      setShortsRpm(rpm.shorts);
      setLongRpm(rpm.long);
      // 환율은 언어에 따라 결정되므로 국가 변경 시 환율 변경하지 않음
    }
    closeDropdown();
  };

  const handleChannelClick = (channel: ChannelData) => {
    setSelectedChannel(channel);
    setSidebarOpen(true);
    
    // 선택된 채널의 국가에 따라 RPM 기본값 설정
    const channelCountry = channel.country;
    const defaultRpm = countryRpmDefaults[channelCountry as keyof typeof countryRpmDefaults];
    if (defaultRpm) {
      setCurrentCountry(channelCountry);
      setShortsRpm(defaultRpm.shorts);
      setLongRpm(defaultRpm.long);
      // ❌ 환율은 채널 국가가 아닌 사용자 언어에 따라 결정되므로 제거
    } else {
      // 해당 국가의 데이터가 없거나 국가 설정이 없는 채널은 "기타" 사용
      setCurrentCountry('기타');
      setShortsRpm(countryRpmDefaults['기타'].shorts);
      setLongRpm(countryRpmDefaults['기타'].long);
      // 환율은 언어에 따라 결정되므로 여기서 변경하지 않음
    }
    
    console.log('🔍 [DEBUG] handleChannelClick:', {
      channelCountry,
      selectedRpm: defaultRpm,
      currentExchangeRate: exchangeRate,
      userLanguage: language
    });
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
    setSelectedChannel(null);
  };

  const handleCategoryFilter = async (category: string) => {
    try {
      console.log('🔍 [INFO] 카테고리 필터링:', category);
      
      if (category === 'All') {
        // 전체 데이터 다시 로드
        const result = await cloudflareService.getChannelData();
        if (result.success) {
          setSortedChannels(result.data);
          console.log('📊 [SUCCESS] 전체 채널 데이터 복원:', result.data.length, '개');
        } else {
          // 폴백: 더미 데이터 사용
          setSortedChannels(dummyChannels);
        }
      } else {
        // 현재 데이터에서 카테고리 필터링
        const currentData = sortedChannels.length > 0 ? sortedChannels : dummyChannels;
        const filtered = currentData.filter(channel => channel.category === category);
        setSortedChannels(filtered);
        console.log('🔍 [SUCCESS] 카테고리 필터링 완료:', category, '-', filtered.length, '개');
      }
    } catch (error) {
      console.error('❌ [ERROR] 카테고리 필터링 실패:', error);
      // 에러 발생시 더미 데이터 사용
      const filtered = dummyChannels.filter(channel => 
        category === 'All' || channel.category === category
      );
      setSortedChannels(category === 'All' ? dummyChannels : filtered);
    }
    
    setSortMenuOpen(null);
  };

  const adjustShortsRpm = (increment: boolean) => {
    setShortsRpm(prev => {
      const newRpm = increment ? prev + 0.01 : prev - 0.01;
      return Math.max(0.01, Math.min(5.0, newRpm)); // 0.01 ~ 5.0 범위
    });
  };

  const adjustLongRpm = (increment: boolean) => {
    setLongRpm(prev => {
      const newRpm = increment ? prev + 0.01 : prev - 0.01;
      return Math.max(0.01, Math.min(10.0, newRpm)); // 0.01 ~ 10.0 범위
    });
  };

  const calculateShortsRevenue = (views: number) => {
    const revenue = Math.round(views * shortsRpm);
    return formatRevenue(revenue);
  };

  const calculateLongRevenue = (views: number) => {
    const revenue = Math.round(views * longRpm);
    return formatRevenue(revenue);
  };

  const formatRevenue = (revenue: number): string => {
    const currentCurrency = currencyExchangeData[currentCountry as keyof typeof currencyExchangeData];
    const currencyCode = currentCurrency?.currency || 'USD';
    const currencySymbol = getChannelFinderTranslation(channelFinderI18n, language, `currencies.${currencyCode}`) || '달러';
    
    // 지역화된 숫자 형식 사용
    return formatLocalizedNumber(revenue, language, currencySymbol);
  };

  // 조회수로부터 수익 계산
  const calculateRevenueFromViews = (views: number): number => {
    return Math.round(views * rpm);
  };

  // 총 수익의 USD 숫자값만 반환하는 함수 (환율 적용 X)
  const calculateTotalRevenueValue = () => {
    if (!selectedChannel) return 0;
    
    // ShortsViews = TotalViews * 숏폼비율 (vsvp)
    const shortsViews = selectedChannel.totalViews * (shortsPercentage / 100);
    // LongViews = TotalViews * 롱폼비율 (vlvp)
    const longViews = selectedChannel.totalViews * (longPercentage / 100);
    
    // ShortsUSD = (ShortsViews/1000) * 각 나라 숏폼 RPM (환율 적용 X)
    const shortsRevenueUsd = (shortsViews / 1000) * shortsRpm;
    // LongUSD = (LongViews/1000) * 각 나라 롱폼 RPM (환율 적용 X)
    const longRevenueUsd = (longViews / 1000) * longRpm;
    
    // TotalUSD = ShortsUSD + LongUSD
    const totalUSD = Math.round(shortsRevenueUsd + longRevenueUsd);
    
    console.log('🔍 [DEBUG] calculateTotalRevenueValue:', {
      channel: selectedChannel?.channelName,
      totalViews: selectedChannel?.totalViews,
      shortsPercentage,
      longPercentage,
      shortsViews,
      longViews,
      shortsRpm,
      longRpm,
      shortsRevenueUsd,
      longRevenueUsd,
      totalUSD,
      currentCountry
    });
    
    return totalUSD;
  };

  const calculateTotalRevenue = () => {
    const dollarText = getChannelFinderTranslation(channelFinderI18n, language, 'currencies.USD') || '달러';
    if (!selectedChannel) return formatLocalizedNumber(0, language, dollarText);
    
    const totalUsd = calculateTotalRevenueValue();
    
    return formatLocalizedNumber(totalUsd, language, dollarText);
  };

  const calculateLocalCurrencyRevenue = () => {
    if (!selectedChannel) return formatRevenue(0);
    
    // TotalUSD 값을 가져와서 환율만 곱하기
    const totalRevenueUsd = calculateTotalRevenueValue(); // USD 숫자값 (환율 적용 X)
    
    // KRW = TotalUSD * 각나라 환율 (환율모달창에서 변경가능)
    const localTotal = Math.round(totalRevenueUsd * exchangeRate);
    
    console.log('🔍 [DEBUG] calculateLocalCurrencyRevenue:', {
      totalRevenueUsd,
      exchangeRate,
      localTotal,
      language,
      selectedChannel: selectedChannel?.channelName
    });
    
    // 🌍 모든 11개 언어가 환율 반영된 localTotal 사용
    if (language === 'ko') {
      return formatLocalizedNumber(localTotal, language, '원'); // 한국원
    } else if (language === 'ja') {
      return formatLocalizedNumber(localTotal, language, '円'); // 일본엔
    } else if (language === 'zh') {
      return formatLocalizedNumber(localTotal, language, '元'); // 중국위안
    } else if (language === 'hi') {
      return formatLocalizedNumber(localTotal, language, '₹'); // 인도루피
    } else if (language === 'es') {
      return formatLocalizedNumber(localTotal, language, '€'); // 스페인유로
    } else if (language === 'fr') {
      return formatLocalizedNumber(localTotal, language, '€'); // 프랑스유로
    } else if (language === 'de') {
      return formatLocalizedNumber(localTotal, language, '€'); // 독일유로
    } else if (language === 'nl') {
      return formatLocalizedNumber(localTotal, language, '€'); // 네덜란드유로
    } else if (language === 'pt') {
      return formatLocalizedNumber(localTotal, language, 'R$'); // 브라질헤알
    } else if (language === 'ru') {
      return formatLocalizedNumber(localTotal, language, '₽'); // 러시아루블
    } else {
      // 미국 영어는 USD 원본값 사용 (환율적용안함)
      return formatLocalizedNumber(totalRevenueUsd, language, '$');
    }
  };

  // 🆕 정렬용 월 수익 숫자값 계산 - 각 채널의 고유 데이터 사용 (정렬용)
  const getMonthlyRevenueNumber = (channel: ChannelData): number => {
    if (!channel.operatingPeriod || channel.operatingPeriod <= 0) return 0;
    
    // 🔄 FIXED: 정렬은 각 채널의 고유 데이터 사용 (일관성 보장)
    const currentShortsPercentage = channel.shortsViewsPercentage || 20;
    const currentLongPercentage = channel.longformViewsPercentage || 80;
    
    // USD 월 수익 계산 (사이드바와 동일한 공식이지만 각 채널 데이터 사용)
    const totalRevenueUSD = (channel.totalViews * (currentShortsPercentage / 100) / 1000) * shortsRpm +
                           (channel.totalViews * (currentLongPercentage / 100) / 1000) * longRpm;
    const monthlyRevenueUSD = totalRevenueUSD / channel.operatingPeriod;
    
    // 환율 적용
    return language === 'en' ? monthlyRevenueUSD : monthlyRevenueUSD * exchangeRate;
  };

  // 🆕 테이블용 월 수익 표시 - 다국어 지원 (채널별 국가 RPM)
  const getTableMonthlyRevenue = (channel: ChannelData): string => {
    return calculateTableMonthlyRevenue(channel, language); // 언어별 환율 적용
  };

  // 현지 화폐 초기화 effect
  React.useEffect(() => {
    // 한국 원화 환율은 항상 1300원으로 고정
    const defaultRate = 1300;
    setLocalExchangeRate(defaultRate);
    setTempExchangeRate(defaultRate);
  }, [language]);

  // 컬럼 리사이즈 상태 및 기능
  const [isResizing, setIsResizing] = React.useState(false);
  const [resizingColumn, setResizingColumn] = React.useState<number | null>(null);
  const [columnWidths, setColumnWidths] = React.useState<{ [key: number]: string }>({});

  // 리사이즈 핸들러 이벤트
  const handleMouseDown = (columnIndex: number, event: React.MouseEvent) => {
    event.stopPropagation(); // 헤더 클릭 이벤트 방지
    setIsResizing(true);
    setResizingColumn(columnIndex);
    document.body.classList.add('resizing'); // 전역 커서 변경
    
    const startX = event.clientX;
    const table = event.currentTarget.closest('table');
    const th = table?.querySelectorAll('th')[columnIndex];
    const startWidth = th?.offsetWidth || 100;

    const handleMouseMove = (e: MouseEvent) => {
      // 왼쪽 핸들러도 직관적으로: 오른쪽 드래그 = 넓어짐, 왼쪽 드래그 = 좁아짐
      const deltaX = e.clientX - startX; // 마우스가 오른쪽으로 가면 +, 왼쪽으로 가면 -
      const newWidth = Math.max(50, Math.min(150, startWidth + deltaX)); // 최소 50px, 최대 150px
      
      setColumnWidths(prev => ({
        ...prev,
        [columnIndex]: `${newWidth}px`
      }));
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      setResizingColumn(null);
      document.body.classList.remove('resizing'); // 전역 커서 제거
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // 환율 모달 관련 함수들
  const openExchangeRateModal = () => {
    setTempExchangeRate(exchangeRate); // 현재 상태값 사용 (한국어처럼)
    setExchangeRateModalOpen(true);
  };

  const closeExchangeRateModal = () => {
    setExchangeRateModalOpen(false);
  };

  const applyExchangeRate = () => {
    setExchangeRate(tempExchangeRate); // exchangeRate를 업데이트하도록 수정
    setLocalExchangeRate(tempExchangeRate); // 기존 로직도 유지
    setExchangeRateModalOpen(false);
  };

  const calculateViewsPerSubscriber = (channel: ChannelData) => {
    if (!channel || channel.subscribers === 0) {
      return '0%'; // 안전한 기본값 (구독자 0명일 때)
    }
    // 총 조회수 대비 구독자 비율 계산
    const ratio = Math.round((channel.totalViews / channel.subscribers) * 100);
    return `${ratio.toLocaleString()}%`;
  };

  const calculateSubscriptionRate = (channel: ChannelData) => {
    // API에서 받은 gsub 값을 소수점 3자리까지 표시
    return `${(channel.subscribersPerVideo || 0).toFixed(3)}%`;
  };


  return (
    <>
      <SEOHead 
        title={t('channelFinderTitle')}
        description={t('channelFinderDescription')}
        language={language}
      />
      
      <div className={styles.pageContainer}>
        <div className={styles.contentWrapper} style={{ padding: '0 100px' }}>

          <div className={styles.channelStatsSection}>
            <div className={styles.statsHeader}>
              <h2>{getChannelFinderTranslation(channelFinderI18n, language, 'header.mainTitle')}</h2>
            </div>

            {/* 🏷️ 필터 태그 섹션 추가 */}
            <FilterTagsSection 
              language={language}
              onFilterApply={(filters: FilterState) => {
                console.log('🔍 [INFO] 문장형 필터 적용:', filters);
                console.log('🔧 [DEBUG] 필터 상세값:', JSON.stringify(filters, null, 2));
                
                // 🚀 실제 필터링 로직 적용
                const filtered = applyFilters(sortedChannels, filters);
                setFilteredChannels(filtered);
                
                // 문장형 필터 활성화 상태로 변경 (국가 필터링 비활성화)
                setSentenceFilterActive(true);
                
                console.log('📊 [SUCCESS] 필터 완료:', {
                  '원본데이터': sortedChannels.length,
                  '필터된데이터': filtered.length,
                  '적용된필터': Object.keys(filters).filter(key => filters[key as keyof FilterState])
                });
                
                // 🔍 디버깅: 필터된 데이터 상위 10개 확인
                console.log('🎯 필터된 채널 상위 10개:');
                filtered.slice(0, 10).forEach((channel, index) => {
                  console.log(`${index + 1}. ${channel.channelName} - 영상:${channel.videosCount}개, 예상수익:${Math.round((channel.totalViews / 1000 * 2) / Math.max(channel.videosCount, 1))}`);
                });
              }}
            />

            <div className={styles.tableContainer}>
              <table className={styles.channelTable}>
                <thead>
                  <tr>
                    {/* 리사이즈 핸들러 추가 - No 컬럼 */}
                    <th className={styles.categoryHeaderResizable} style={{ width: columnWidths[0] }}>
                      <div className={`${styles.resizeHandle} ${styles.resizeHandleLeft}`} onMouseDown={(e) => handleMouseDown(0, e)}></div>
                      {getChannelFinderTranslation(channelFinderI18n, language, 'table.headers.no')}
                    </th>
                    {/* 리사이즈 핸들러 추가 - 채널명 컬럼 */}
                    <th className={styles.categoryHeaderResizable} style={{ width: columnWidths[1] }}>
                      <div className={`${styles.resizeHandle} ${styles.resizeHandleLeft}`} onMouseDown={(e) => handleMouseDown(1, e)}></div>
                      {getChannelFinderTranslation(channelFinderI18n, language, 'table.headers.channelName')}
                    </th>
                    <th 
                      className={`${styles.sortableHeader} ${styles.categoryHeaderResizable}`}
                      onClick={() => handleHeaderClick('category')}
                      style={{ width: columnWidths[2] }}
                    >
                      <div className={`${styles.resizeHandle} ${styles.resizeHandleLeft}`} onMouseDown={(e) => handleMouseDown(2, e)}></div>
                      {getChannelFinderTranslation(channelFinderI18n, language, 'table.headers.category')}
                      
                      {sortMenuOpen === 'category' && (
                        <div className={`${styles.sortMenu} ${styles.categoryMenu}`}>
                          <div className={styles.categoryGrid}>
                            {youtubeCategories.map((category) => (
                              <div key={category} onClick={() => handleCategoryFilter(category)} className={styles.categoryItem}>
                                {category}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </th>
                    {/* 리사이즈 핸들러 추가 - 구독자 컬럼 */}
                    <th 
                      className={`${styles.sortableHeader} ${styles.categoryHeaderResizable}`}
                      onClick={() => handleHeaderClick('subscribers')}
                      style={{ width: columnWidths[3] }}
                    >
                      <div className={`${styles.resizeHandle} ${styles.resizeHandleLeft}`} onMouseDown={(e) => handleMouseDown(3, e)}></div>
                      {getChannelFinderTranslation(channelFinderI18n, language, 'table.headers.subscribers')}
                      {sortMenuOpen === 'subscribers' && (
                        <div className={styles.sortMenu}>
                          <div onClick={() => handleSort('subscribers', 'desc')}>{getChannelFinderTranslation(channelFinderI18n, language, 'table.sortOptions.highToLow')}</div>
                          <div onClick={() => handleSort('subscribers', 'asc')}>{getChannelFinderTranslation(channelFinderI18n, language, 'table.sortOptions.lowToHigh')}</div>
                        </div>
                      )}
                    </th>
                    {/* 리사이즈 핸들러 추가 - 연간성장 컬럼 */}
                    {/* 🔄 OLD: 매년증가 -> 🆕 NEW: 월 수익 컬럼으로 교체 */}
                    <th 
                      className={`${styles.sortableHeader} ${styles.categoryHeaderResizable}`}
                      onClick={() => handleHeaderClick('monthlyRevenue')}
                      style={{ width: columnWidths[4] }}
                    >
                      <div className={`${styles.resizeHandle} ${styles.resizeHandleLeft}`} onMouseDown={(e) => handleMouseDown(4, e)}></div>
                      {getChannelFinderTranslation(channelFinderI18n, language, 'table.headers.monthlyRevenue')}
                      {sortMenuOpen === 'monthlyRevenue' && (
                        <div className={styles.sortMenu}>
                          <div onClick={() => handleSort('monthlyRevenue', 'desc')}>{getChannelFinderTranslation(channelFinderI18n, language, 'table.sortOptions.highToLow')}</div>
                          <div onClick={() => handleSort('monthlyRevenue', 'asc')}>{getChannelFinderTranslation(channelFinderI18n, language, 'table.sortOptions.lowToHigh')}</div>
                        </div>
                      )}
                    </th>
                    {/* 리사이즈 핸들러 추가 - 월간성장 컬럼 */}
                    <th 
                      className={`${styles.sortableHeader} ${styles.categoryHeaderResizable}`}
                      onClick={() => handleHeaderClick('monthlyGrowth')}
                      style={{ width: columnWidths[5] }}
                    >
                      <div className={`${styles.resizeHandle} ${styles.resizeHandleLeft}`} onMouseDown={(e) => handleMouseDown(5, e)}></div>
                      {getChannelFinderTranslation(channelFinderI18n, language, 'table.headers.monthlyGrowth')}
                      {sortMenuOpen === 'monthlyGrowth' && (
                        <div className={styles.sortMenu}>
                          <div onClick={() => handleSort('monthlyGrowth', 'desc')}>{getChannelFinderTranslation(channelFinderI18n, language, 'table.sortOptions.highToLow')}</div>
                          <div onClick={() => handleSort('monthlyGrowth', 'asc')}>{getChannelFinderTranslation(channelFinderI18n, language, 'table.sortOptions.lowToHigh')}</div>
                        </div>
                      )}
                    </th>
                    {/* 리사이즈 핸들러 추가 - 일간성장 컬럼 */}
                    <th 
                      className={`${styles.sortableHeader} ${styles.categoryHeaderResizable}`}
                      onClick={() => handleHeaderClick('dailyGrowth')}
                      style={{ width: columnWidths[6] }}
                    >
                      <div className={`${styles.resizeHandle} ${styles.resizeHandleLeft}`} onMouseDown={(e) => handleMouseDown(6, e)}></div>
                      {getChannelFinderTranslation(channelFinderI18n, language, 'table.headers.dailyGrowth')}
                      {sortMenuOpen === 'dailyGrowth' && (
                        <div className={styles.sortMenu}>
                          <div onClick={() => handleSort('dailyGrowth', 'desc')}>{getChannelFinderTranslation(channelFinderI18n, language, 'table.sortOptions.highToLow')}</div>
                          <div onClick={() => handleSort('dailyGrowth', 'asc')}>{getChannelFinderTranslation(channelFinderI18n, language, 'table.sortOptions.lowToHigh')}</div>
                        </div>
                      )}
                    </th>
                    {/* 리사이즈 핸들러 추가 - 구독전환율 컬럼 */}
                    <th 
                      className={`${styles.sortableHeader} ${styles.categoryHeaderResizable}`}
                      onClick={() => handleHeaderClick('subscribersPerVideo')}
                      style={{ width: columnWidths[7] }}
                    >
                      <div className={`${styles.resizeHandle} ${styles.resizeHandleLeft}`} onMouseDown={(e) => handleMouseDown(7, e)}></div>
                      {getChannelFinderTranslation(channelFinderI18n, language, 'table.headers.subscriptionRate')}
                      {sortMenuOpen === 'subscribersPerVideo' && (
                        <div className={styles.sortMenu}>
                          <div onClick={() => handleSort('subscribersPerVideo', 'desc')}>{getChannelFinderTranslation(channelFinderI18n, language, 'table.sortOptions.highToLow')}</div>
                          <div onClick={() => handleSort('subscribersPerVideo', 'asc')}>{getChannelFinderTranslation(channelFinderI18n, language, 'table.sortOptions.lowToHigh')}</div>
                        </div>
                      )}
                    </th>
                    {/* 리사이즈 핸들러 추가 - 운영기간 컬럼 */}
                    <th 
                      className={`${styles.sortableHeader} ${styles.categoryHeaderResizable}`}
                      onClick={() => handleHeaderClick('operatingPeriod')}
                      style={{ width: columnWidths[8] }}
                    >
                      <div className={`${styles.resizeHandle} ${styles.resizeHandleLeft}`} onMouseDown={(e) => handleMouseDown(8, e)}></div>
                      {getChannelFinderTranslation(channelFinderI18n, language, 'table.headers.operatingPeriod')}
                      {sortMenuOpen === 'operatingPeriod' && (
                        <div className={styles.sortMenu}>
                          <div onClick={() => handleSort('operatingPeriod', 'desc')}>{getChannelFinderTranslation(channelFinderI18n, language, 'table.sortOptions.highToLow')}</div>
                          <div onClick={() => handleSort('operatingPeriod', 'asc')}>{getChannelFinderTranslation(channelFinderI18n, language, 'table.sortOptions.lowToHigh')}</div>
                        </div>
                      )}
                    </th>
                    {/* 리사이즈 핸들러 추가 - 총조회수 컬럼 */}
                    <th 
                      className={`${styles.sortableHeader} ${styles.categoryHeaderResizable}`}
                      onClick={() => handleHeaderClick('totalViews')}
                      style={{ width: columnWidths[9] }}
                    >
                      <div className={`${styles.resizeHandle} ${styles.resizeHandleLeft}`} onMouseDown={(e) => handleMouseDown(9, e)}></div>
                      {getChannelFinderTranslation(channelFinderI18n, language, 'table.headers.totalViews')}
                      {sortMenuOpen === 'totalViews' && (
                        <div className={styles.sortMenu}>
                          <div onClick={() => handleSort('totalViews', 'desc')}>{getChannelFinderTranslation(channelFinderI18n, language, 'table.sortOptions.highToLow')}</div>
                          <div onClick={() => handleSort('totalViews', 'asc')}>{getChannelFinderTranslation(channelFinderI18n, language, 'table.sortOptions.lowToHigh')}</div>
                        </div>
                      )}
                    </th>
                    {/* 리사이즈 핸들러 추가 - 평균조회수 컬럼 */}
                    <th 
                      className={`${styles.sortableHeader} ${styles.categoryHeaderResizable}`}
                      onClick={() => handleHeaderClick('avgViews')}
                      style={{ width: columnWidths[10] }}
                    >
                      <div className={`${styles.resizeHandle} ${styles.resizeHandleLeft}`} onMouseDown={(e) => handleMouseDown(10, e)}></div>
                      {getChannelFinderTranslation(channelFinderI18n, language, 'table.headers.avgViews')}
                      {sortMenuOpen === 'avgViews' && (
                        <div className={styles.sortMenu}>
                          <div onClick={() => handleSort('avgViews', 'desc')}>{getChannelFinderTranslation(channelFinderI18n, language, 'table.sortOptions.highToLow')}</div>
                          <div onClick={() => handleSort('avgViews', 'asc')}>{getChannelFinderTranslation(channelFinderI18n, language, 'table.sortOptions.lowToHigh')}</div>
                        </div>
                      )}
                    </th>
                    <th 
                      className={styles.sortableHeader}
                      onClick={() => handleHeaderClick('videosCount')}
                    >
                      {getChannelFinderTranslation(channelFinderI18n, language, 'table.headers.totalVideos')}
                      {sortMenuOpen === 'videosCount' && (
                        <div className={styles.sortMenu}>
                          <div onClick={() => handleSort('videosCount', 'desc')}>{getChannelFinderTranslation(channelFinderI18n, language, 'table.sortOptions.highToLow')}</div>
                          <div onClick={() => handleSort('videosCount', 'asc')}>{getChannelFinderTranslation(channelFinderI18n, language, 'table.sortOptions.lowToHigh')}</div>
                        </div>
                      )}
                    </th>
                    <th 
                      className={styles.sortableHeader}
                      onClick={() => handleHeaderClick('uploadFrequency')}
                    >
                      {getChannelFinderTranslation(channelFinderI18n, language, 'table.headers.uploadFrequency')}
                      {sortMenuOpen === 'uploadFrequency' && (
                        <div className={styles.sortMenu}>
                          <div onClick={() => handleSort('uploadFrequency', 'desc')}>{getChannelFinderTranslation(channelFinderI18n, language, 'table.sortOptions.highToLow')}</div>
                          <div onClick={() => handleSort('uploadFrequency', 'asc')}>{getChannelFinderTranslation(channelFinderI18n, language, 'table.sortOptions.lowToHigh')}</div>
                        </div>
                      )}
                    </th>
                    <th className={`${styles.sortableHeader} ${styles.countryHeader}`}>
                      <button 
                        className={`${styles.countrySelectButton} ${styles.mainCountryButton}`}
                        onClick={(e) => openDropdown('main', e)}
                      >
                        <span>{selectedCountry || '🌍'}</span>
                        <svg className={`dropdown-arrow ${dropdownState.isOpen && dropdownState.type === 'main' ? 'open' : ''}`} width="16" height="16" viewBox="0 0 20 20">
                          <path stroke="#666" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="m6 8 4 4 4-4"/>
                        </svg>
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <TableSkeleton />
                  ) : (
                    filteredChannels
                      .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                      .map((channel, index) => (
                    <tr 
                      key={channel.rank}
                      className={styles.channelRow}
                      onClick={() => handleChannelClick(channel)}
                    >
                      <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                      <td className={styles.channelName}>
                        <span className={styles.rankBadge}>
                          {channel.thumbnailUrl && (
                            <img 
                              src={channel.thumbnailUrl} 
                              alt={channel.channelName}
                              className={styles.rankBadgeImg}
                            />
                          )}
                        </span>
                        <span className={styles.name}>{channel.channelName}</span>
                      </td>
                      <td>{channel.category}</td>
                      <td className={styles.subscribers}>{formatSubscribers(channel.subscribers)}</td>
                      {/* 🔄 OLD: 매년증가 -> 🆕 NEW: 월 수익 표시 */}
                      <td className={styles.monthlyRevenue}>{getTableMonthlyRevenue(channel)}</td>
                      <td className={`${styles.growth} ${styles.positive}`}>{formatGrowth(channel.monthlyGrowth)}</td>
                      <td className={`${styles.growth} ${styles.positive}`}>{formatGrowth(channel.dailyGrowth)}</td>
                      <td>{formatNumber(channel.subscribersPerVideo)}</td>
                      <td className={styles.period}>{formatOperatingPeriod(channel.operatingPeriod)}</td>
                      <td className={styles.totalViews}>{formatViews(channel.totalViews)}</td>
                      <td className={styles.avgViews}>{formatViews(channel.avgViews)}</td>
                      <td>{formatVideosCount(channel.videosCount)}</td>
                      <td className={styles.uploadFrequency}>{formatUploadFrequency(channel.uploadFrequency)}</td>
                      <td className={styles.country}>{getCountryDisplayName(language, channel.country)}</td>
                    </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {!loading && (
              <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil(filteredChannels.length / itemsPerPage)}
                onPageChange={setCurrentPage}
              />
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        {sidebarOpen && (
          loading ? (
            <SidebarSkeleton />
          ) : selectedChannel ? (
            <ChannelSidebar
              selectedChannel={selectedChannel}
              language={language}
              onClose={closeSidebar}
              formatSubscribers={formatSubscribers}
              formatOperatingPeriod={formatOperatingPeriod}
              formatGrowth={formatGrowth}
              getCountryDisplayName={getCountryDisplayName}
              chartData={chartData}
              growthTooltips={growthTooltips}
              hoveredPoint={hoveredPoint}
              hoveredStat={hoveredStat}
              setHoveredStat={setHoveredStat}
              shortsPercentage={shortsPercentage}
              longPercentage={longPercentage}
              shortsRpm={shortsRpm}
              longRpm={longRpm}
              exchangeRate={exchangeRate}
              currentCountry={currentCountry}
              dropdownState={dropdownState}
              openDropdown={openDropdown}
              countryOptions={countryOptions}
              onCountrySelect={(value) => {
                const newCountry = value as keyof typeof countryRpmDefaults;
                setCurrentCountry(newCountry);
                const rpm = countryRpmDefaults[newCountry];
                setShortsRpm(rpm.shorts);
                setLongRpm(rpm.long);
                
                // 선택된 국가의 환율로 변경
                const exchangeData = currencyExchangeData[newCountry as keyof typeof currencyExchangeData];
                if (exchangeData) {
                  setExchangeRate(exchangeData.exchangeRate);
                  console.log('🔍 [DEBUG] 국가 RPM 변경으로 환율 업데이트:', {
                    country: newCountry,
                    newRate: exchangeData.exchangeRate,
                    currency: exchangeData.currency
                  });
                }
              }}
              adjustShortsRpm={adjustShortsRpm}
              adjustLongRpm={adjustLongRpm}
              calculateTotalRevenue={calculateTotalRevenue}
              calculateLocalCurrencyRevenue={calculateLocalCurrencyRevenue}
              openExchangeRateModal={openExchangeRateModal}
              setExchangeRate={setExchangeRate}
              formatViews={formatViews}
              formatVideosCount={formatVideosCount}
              formatUploadFrequency={formatUploadFrequency}
              currencyExchangeData={currencyExchangeData}
              cf={cf}
            />
          ) : null
        )}
      </div>


      {/* 전역 공용 드롭다운 - 단 1개만 존재 */}
      {dropdownState.isOpen && dropdownState.position && (
        <div 
          style={{
            position: 'fixed',
            left: dropdownState.position.x,
            top: dropdownState.position.y,
            zIndex: 5000
          }}
        >
          <DropdownOptions
            options={dropdownState.type === 'main' ? mainCountryOptions : countryOptions}
            onSelect={handleDropdownSelect}
            isOpen={dropdownState.isOpen}
            onClose={closeDropdown}
            selectedValue={dropdownState.type === 'main' ? selectedCountry : currentCountry}
            maxHeight="250px"
            showSearch={true}
          />
        </div>
      )}

      {/* 환율 설정 모달 */}
      {exchangeRateModalOpen && (
        <div className={styles.modalOverlay} onClick={closeExchangeRateModal}>
          <div className={styles.exchangeRateModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>{getChannelFinderTranslation(channelFinderI18n, language, 'units.exchangeRate')}</h3>
              <button className={styles.modalClose} onClick={closeExchangeRateModal}>×</button>
            </div>
            <div className={styles.modalContent}>
              <div className={styles.exchangeRateDisplay}>
                <span>$ 1 = </span>
                <input 
                  type="number" 
                  value={tempExchangeRate}
                  onChange={(e) => setTempExchangeRate(Number(e.target.value))}
                  className={styles.exchangeRateInput}
                />
                <span>{currencySettings[language].symbol}</span>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={closeExchangeRateModal}>{getChannelFinderTranslation(channelFinderI18n, language, 'buttons.cancel')}</button>
              <button className={styles.confirmBtn} onClick={applyExchangeRate}>{getChannelFinderTranslation(channelFinderI18n, language, 'buttons.confirm')}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChannelFinder;