import React, { useState } from 'react';
import { Language } from '../types';
import { translations } from '../i18n/translations';
import { channelFinderTranslations } from '../i18n/channelFinderTranslations';
import SEOHead from '../components/SEOHead';
import DropdownOptions from '../components/DropdownOptions';
import countryRpmDefaults from '../data/countryRpmDefaults.json';

// 국가 표시용 매핑 (영어 -> 한국어)
const countryDisplayNames: { [key: string]: string } = {
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

interface ChannelFinderProps {
  language: Language;
}

// Configuration Constants
const CONFIG = {
  RPM: {
    SHORTS_BASE: 0.05,
    LONG_BASE: 0.15,
    DEFAULT: 0.08,
    STEP: 0.01
  },
} as const;

interface ChannelData {
  id: string;
  rank: number;
  channelName: string;
  category: string;
  subscribers: number;
  yearlyGrowth: number;
  monthlyGrowth: number;
  dailyGrowth: number;
  subscribersPerVideo: number;
  operatingPeriod: number; // months
  totalViews: number;
  avgViews: number;
  videosCount: number;
  uploadFrequency: number; // videos per week
  country: string;
  youtubeUrl: string;
  // 수익 계산용 데이터 (조회수)
  shortsTotalViews: number;  // 숏폼 총 조회수
  longTotalViews: number;    // 롱폼 총 조회수
}

const SubTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <h4 className="subtitle">{children}</h4>;
};

// 스켈레톤 컴포넌트들
const TableSkeleton: React.FC = () => (
  <>
    {Array.from({ length: 2 }).map((_, i) => (
      <tr key={`skeleton-${i}`} className="skeleton-row">
        <td><div className="skeleton-cell skeleton-rank">{i + 1}</div></td>
        <td>
          <div className="skeleton-cell-group">
            <div className="skeleton-cell skeleton-channel-name"></div>
          </div>
        </td>
        <td><div className="skeleton-cell skeleton-category"></div></td>
        <td><div className="skeleton-cell skeleton-subscribers"></div></td>
        <td><div className="skeleton-cell skeleton-growth"></div></td>
        <td><div className="skeleton-cell skeleton-growth"></div></td>
        <td><div className="skeleton-cell skeleton-growth"></div></td>
        <td><div className="skeleton-cell skeleton-number"></div></td>
        <td><div className="skeleton-cell skeleton-period"></div></td>
        <td><div className="skeleton-cell skeleton-views-large"></div></td>
        <td><div className="skeleton-cell skeleton-views-medium"></div></td>
        <td><div className="skeleton-cell skeleton-videos-count"></div></td>
        <td><div className="skeleton-cell skeleton-frequency"></div></td>
        <td><div className="skeleton-cell skeleton-country"></div></td>
      </tr>
    ))}
  </>
);

const SidebarSkeleton: React.FC = () => (
  <div className="sidebar-overlay">
    <div className="sidebar skeleton-sidebar-content">
      <div className="sidebar-header">
        <h3>
          <button className="back-btn skeleton-back-btn">←</button>
          <div className="skeleton-title"></div>
        </h3>
        <button className="youtube-visit-btn skeleton-youtube-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{opacity: 0}}>
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
          <div className="skeleton-btn-text"></div>
        </button>
      </div>
      
      <div className="sidebar-content">
        {/* 채널 정보 스켈레톤 - 실제 구조와 동일 */}
        <div className="channel-info">
          <div className="info-item">
            <span className="label">채널명:</span>
            <div className="skeleton-info-value" style={{width: '120px', height: '18px'}}></div>
          </div>
          <div className="info-item">
            <span className="label">카테고리:</span>
            <div className="skeleton-info-value" style={{width: '80px', height: '18px'}}></div>
          </div>
          <div className="info-item">
            <span className="label">구독자수:</span>
            <div className="skeleton-info-value" style={{width: '100px', height: '18px'}}></div>
          </div>
          <div className="info-item">
            <span className="label">국가:</span>
            <div className="skeleton-info-value" style={{width: '50px', height: '18px'}}></div>
          </div>
          <div className="info-item">
            <span className="label">운영기간:</span>
            <div className="skeleton-info-value" style={{width: '90px', height: '18px'}}></div>
          </div>
        </div>
        
        {/* 차트 스켈레톤 - 실제 구조와 동일 */}
        <div className="chart-section">
          <h4 className="subtitle">구독자 성장 추이</h4>
          <div className="chart-placeholder">
            <div className="line-chart">
              <div className="skeleton-chart"></div>
            </div>
            <div className="chart-labels">
              <span>5월</span><span>6월</span><span>7월</span><span>8월</span><span>9월</span>
            </div>
          </div>
        </div>
        
        {/* RPM 섹션 스켈레톤 - 실제 구조와 동일 */}
        <div className="rpm-section">
          <h4 className="subtitle">수익계산</h4>
          <div className="rpm-card">
            <div className="content-tabs">
              <button className="tab active">숏폼</button>
              <button className="tab">롱폼</button>
            </div>
            <div className="rpm-header">
              <span>RPM</span>
              <span>총 조회수</span>
            </div>
            <div className="rpm-controls">
              <button className="rpm-btn minus">-</button>
              <div className="skeleton-rpm-value"></div>
              <button className="rpm-btn plus">+</button>
              <div className="skeleton-period-value"></div>
            </div>
            
            <div className="revenue-grid">
              <div className="revenue-card">
                <div className="revenue-label">최근 영상 수익</div>
                <div className="skeleton-revenue-value"></div>
              </div>
              <div className="revenue-card">
                <div className="revenue-label">채널 총 수익</div>
                <div className="skeleton-revenue-value"></div>
              </div>
            </div>
            
            <div className="total-revenue-card">
              <div className="total-revenue-label">쇼폼 + 롱폼 총수익</div>
              <div className="skeleton-total-revenue"></div>
            </div>
          </div>
        </div>
        
        {/* 스탯 스켈레톤 - 실제 구조와 동일 */}
        <h4 className="subtitle">디테일 정보</h4>
        <div className="stats-grid">
          {[
            '총 조회수', '평균 조회수', '총 영상수', '업로드 빈도',
            '월간증가', '년간증가', '구독자 대비 조회수', '구독 전환율'
          ].map((label, i) => (
            <div key={i} className="stat-card">
              <div className="stat-label">{label}</div>
              <div className="skeleton-stat-value"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const ChannelFinder: React.FC<ChannelFinderProps> = ({ language }) => {
  const t = (key: keyof typeof translations['en']) => translations[language][key] || translations['en'][key];
  const cf = (key: keyof typeof channelFinderTranslations['en']) => channelFinderTranslations[language][key] || channelFinderTranslations['en'][key];
  
  // 국가 옵션 배열 생성 (사이드바용)
  const countryOptions = Object.keys(countryRpmDefaults).map(country => ({
    value: country,
    label: countryDisplayNames[country] || country
  }));
  
  // 메인 테이블용 국가 옵션 배열 ("전체 국가" 포함) - 사이드바와 동일한 국가 목록 사용
  const mainCountryOptions = [
    { value: '', label: '전체 국가' },
    ...countryOptions
  ];
  const [selectedChannel, setSelectedChannel] = useState<ChannelData | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentCountry, setCurrentCountry] = useState('기타'); // 기본 국가
  const [shortsRpm, setShortsRpm] = useState(countryRpmDefaults['기타'].shorts);
  const [longRpm, setLongRpm] = useState(countryRpmDefaults['기타'].long);
  // TODO: 추후 변수로 변경예정 - 숏폼/롱폼 비율
  const shortsPercentage = 20; // 숏폼 20% (추후 변수로 변경예정)
  const longPercentage = 80;   // 롱폼 80% (추후 변수로 변경예정)
  const [sortMenuOpen, setSortMenuOpen] = useState<string | null>(null);
  const [sortedChannels, setSortedChannels] = useState<ChannelData[]>([]);
  const [countrySearch, setCountrySearch] = useState('');
  const [filteredChannels, setFilteredChannels] = useState<ChannelData[]>([]);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [loading, setLoading] = useState(true); // 데이터 로딩 상태
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null); // 호버된 포인트 인덱스
  const [hoveredStat, setHoveredStat] = useState<string | null>(null); // 호버된 통계 항목
  const [dropdownState, setDropdownState] = useState<{
    isOpen: boolean;
    type: 'main' | 'sidebar' | null;
    position: { x: number; y: number } | null;
  }>({
    isOpen: false,
    type: null,
    position: null
  });

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

  // 포매팅 함수들 - 숫자 데이터를 사용자가 읽기 쉬운 형태로 변환 (3자리 콤마 포함)
  const formatNumber = (num: number): string => {
    if (num >= 100000000) { // 1억 이상
      const eok = Math.floor(num / 100000000);
      const man = Math.floor((num % 100000000) / 10000);
      if (man === 0) {
        return `${eok.toLocaleString()}억`;
      }
      return `${eok.toLocaleString()}억 ${man.toLocaleString()}만`;
    } else if (num >= 10000) { // 1만 이상
      const man = Math.floor(num / 10000);
      const remainder = num % 10000;
      if (remainder === 0) {
        return `${man.toLocaleString()}만`;
      }
      return `${man.toLocaleString()}만 ${remainder.toLocaleString()}`;
    } else {
      return num.toLocaleString();
    }
  };

  const formatSubscribers = (num: number): string => {
    return formatNumber(num) + '명';
  };

  const formatViews = (num: number): string => {
    return formatNumber(num);
  };

  const formatGrowth = (num: number): string => {
    return '+' + formatNumber(num);
  };

  const formatVideosCount = (num: number): string => {
    return num.toLocaleString() + '개';
  };

  const formatOperatingPeriod = (months: number): string => {
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    return `${years}년 ${remainingMonths}개월`;
  };

  const formatUploadFrequency = (videosPerWeek: number): string => {
    if (videosPerWeek >= 7) {
      return `일 ${Math.round(videosPerWeek / 7)}회`;
    } else {
      return `주 ${videosPerWeek}회`;
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

  // TODO: 구글 드라이브 JSON 데이터 로딩으로 변경될 예정
  // 초기 정렬된 채널 설정 (현재 하드코딩 데이터 사용)
  React.useEffect(() => {
    // 시뮬레이션: 2초 로딩 시간
    setTimeout(() => {
      setSortedChannels([...dummyChannels]);
      setFilteredChannels([...dummyChannels]);
      setLoading(false); // 로딩 완료
    }, 2000);
  }, []);

  // 국가 필터링
  React.useEffect(() => {
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
  }, [countrySearch, selectedCountry, sortedChannels]);

  const handleHeaderClick = (column: string) => {
    setSortMenuOpen(sortMenuOpen === column ? null : column);
  };

  const handleSort = (column: string, direction: 'asc' | 'desc') => {
    const sorted = [...sortedChannels].sort((a, b) => {
      let aValue: number = 0;
      let bValue: number = 0;

      switch(column) {
        case 'subscribers':
          aValue = a.subscribers;
          bValue = b.subscribers;
          break;
        case 'yearlyGrowth':
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

    setSortedChannels(sorted);
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
    } else {
      // 해당 국가의 데이터가 없거나 국가 설정이 없는 채널은 "기타" 사용
      setCurrentCountry('기타');
      setShortsRpm(countryRpmDefaults['기타'].shorts);
      setLongRpm(countryRpmDefaults['기타'].long);
    }
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
    setSelectedChannel(null);
  };

  const handleCategoryFilter = (category: string) => {
    if (category === 'All') {
      setSortedChannels(dummyChannels);
    } else {
      const filtered = dummyChannels.filter(channel => channel.category === category);
      setSortedChannels(filtered);
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
    if (revenue >= 100000000) {
      const eok = Math.floor(revenue / 100000000);
      const man = Math.floor((revenue % 100000000) / 10000);
      if (man === 0) {
        return `${eok.toLocaleString()}억원`;
      }
      return `${eok.toLocaleString()}억 ${man.toLocaleString()}만원`;
    } else if (revenue >= 10000) {
      const man = Math.floor(revenue / 10000);
      const remainder = revenue % 10000;
      if (remainder === 0) {
        return `${man.toLocaleString()}만원`;
      }
      return `${man.toLocaleString()}만 ${remainder.toLocaleString()}원`;
    } else {
      return `${revenue.toLocaleString()}원`;
    }
  };

  // 조회수로부터 수익 계산
  const calculateRevenueFromViews = (views: number): number => {
    return Math.round(views * rpm);
  };

  const calculateTotalRevenue = () => {
    if (!selectedChannel) return '0원';
    
    const usdToKrw = 1388; // 환율 (추후 변수로 변경예정)
    
    // 숏폼 조회수 = 총 조회수의 20%
    const shortsViews = selectedChannel.totalViews * (shortsPercentage / 100);
    // 숏폼 수익 = (숏폼 조회수 ÷ 1000) × 숏폼 RPM × 환율
    const shortsRevenue = Math.round((shortsViews / 1000) * shortsRpm * usdToKrw);
    
    // 롱폼 조회수 = 총 조회수의 80%
    const longViews = selectedChannel.totalViews * (longPercentage / 100);
    // 롱폼 수익 = (롱폼 조회수 ÷ 1000) × 롱폼 RPM × 환율
    const longRevenue = Math.round((longViews / 1000) * longRpm * usdToKrw);
    
    const total = shortsRevenue + longRevenue;
    
    return formatRevenue(total);
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
    // 구독자수를 총조회수로 나누고 100을 곱해 백분율로 계산
    const totalViewsNum = channel.channelName === "MrBeast" ? 93991066041 : 309025825692;
    const subscribersNum = channel.channelName === "MrBeast" ? 424000000 : 300000000;
    const rate = ((subscribersNum / totalViewsNum) * 100).toFixed(2);
    // 소수점이 있는 경우 숫자 부분만 콤마 처리
    const [integerPart, decimalPart] = rate.split('.');
    const formattedInteger = parseInt(integerPart).toLocaleString();
    return decimalPart ? `${formattedInteger}.${decimalPart}%` : `${formattedInteger}%`;
  };

  return (
    <>
      <SEOHead 
        title={t('channelFinderTitle')}
        description={t('channelFinderDescription')}
        language={language}
      />
      
      <div className="page-container">
        <div className="content-wrapper" style={{ padding: '0 100px' }}>

          <div className="channel-stats-section">
            <div className="stats-header">
              <h2>전세계 유튜브 채널 데이터</h2>
            </div>

            <div className="table-container">
              <table className="channel-table">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>채널명</th>
                    <th 
                      className="sortable-header"
                      onClick={() => handleHeaderClick('category')}
                    >
                      카테고리
                      {sortMenuOpen === 'category' && (
                        <div className="sort-menu category-menu">
                          <div className="category-grid">
                            {youtubeCategories.map((category) => (
                              <div key={category} onClick={() => handleCategoryFilter(category)} className="category-item">
                                {category}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </th>
                    <th 
                      className="sortable-header"
                      onClick={() => handleHeaderClick('subscribers')}
                    >
                      구독자수
                      {sortMenuOpen === 'subscribers' && (
                        <div className="sort-menu">
                          <div onClick={() => handleSort('subscribers', 'desc')}>수치 높은 순</div>
                          <div onClick={() => handleSort('subscribers', 'asc')}>수치 낮은 순</div>
                        </div>
                      )}
                    </th>
                    <th 
                      className="sortable-header"
                      onClick={() => handleHeaderClick('yearlyGrowth')}
                    >
                      매년증가
                      {sortMenuOpen === 'yearlyGrowth' && (
                        <div className="sort-menu">
                          <div onClick={() => handleSort('yearlyGrowth', 'desc')}>수치 높은 순</div>
                          <div onClick={() => handleSort('yearlyGrowth', 'asc')}>수치 낮은 순</div>
                        </div>
                      )}
                    </th>
                    <th 
                      className="sortable-header"
                      onClick={() => handleHeaderClick('monthlyGrowth')}
                    >
                      월간 증가
                      {sortMenuOpen === 'monthlyGrowth' && (
                        <div className="sort-menu">
                          <div onClick={() => handleSort('monthlyGrowth', 'desc')}>수치 높은 순</div>
                          <div onClick={() => handleSort('monthlyGrowth', 'asc')}>수치 낮은 순</div>
                        </div>
                      )}
                    </th>
                    <th 
                      className="sortable-header"
                      onClick={() => handleHeaderClick('dailyGrowth')}
                    >
                      일일증가
                      {sortMenuOpen === 'dailyGrowth' && (
                        <div className="sort-menu">
                          <div onClick={() => handleSort('dailyGrowth', 'desc')}>수치 높은 순</div>
                          <div onClick={() => handleSort('dailyGrowth', 'asc')}>수치 낮은 순</div>
                        </div>
                      )}
                    </th>
                    <th 
                      className="sortable-header"
                      onClick={() => handleHeaderClick('subscribersPerVideo')}
                    >
                      구독 전환율
                      {sortMenuOpen === 'subscribersPerVideo' && (
                        <div className="sort-menu">
                          <div onClick={() => handleSort('subscribersPerVideo', 'desc')}>수치 높은 순</div>
                          <div onClick={() => handleSort('subscribersPerVideo', 'asc')}>수치 낮은 순</div>
                        </div>
                      )}
                    </th>
                    <th 
                      className="sortable-header"
                      onClick={() => handleHeaderClick('operatingPeriod')}
                    >
                      운영기간
                      {sortMenuOpen === 'operatingPeriod' && (
                        <div className="sort-menu">
                          <div onClick={() => handleSort('operatingPeriod', 'desc')}>수치 높은 순</div>
                          <div onClick={() => handleSort('operatingPeriod', 'asc')}>수치 낮은 순</div>
                        </div>
                      )}
                    </th>
                    <th 
                      className="sortable-header"
                      onClick={() => handleHeaderClick('totalViews')}
                    >
                      총조회수
                      {sortMenuOpen === 'totalViews' && (
                        <div className="sort-menu">
                          <div onClick={() => handleSort('totalViews', 'desc')}>수치 높은 순</div>
                          <div onClick={() => handleSort('totalViews', 'asc')}>수치 낮은 순</div>
                        </div>
                      )}
                    </th>
                    <th 
                      className="sortable-header"
                      onClick={() => handleHeaderClick('avgViews')}
                    >
                      평균조회수
                      {sortMenuOpen === 'avgViews' && (
                        <div className="sort-menu">
                          <div onClick={() => handleSort('avgViews', 'desc')}>수치 높은 순</div>
                          <div onClick={() => handleSort('avgViews', 'asc')}>수치 낮은 순</div>
                        </div>
                      )}
                    </th>
                    <th 
                      className="sortable-header"
                      onClick={() => handleHeaderClick('videosCount')}
                    >
                      총영상수
                      {sortMenuOpen === 'videosCount' && (
                        <div className="sort-menu">
                          <div onClick={() => handleSort('videosCount', 'desc')}>수치 높은 순</div>
                          <div onClick={() => handleSort('videosCount', 'asc')}>수치 낮은 순</div>
                        </div>
                      )}
                    </th>
                    <th 
                      className="sortable-header"
                      onClick={() => handleHeaderClick('uploadFrequency')}
                    >
                      업로드 빈도
                      {sortMenuOpen === 'uploadFrequency' && (
                        <div className="sort-menu">
                          <div onClick={() => handleSort('uploadFrequency', 'desc')}>수치 높은 순</div>
                          <div onClick={() => handleSort('uploadFrequency', 'asc')}>수치 낮은 순</div>
                        </div>
                      )}
                    </th>
                    <th className="sortable-header country-header">
                      <button 
                        className="country-select-button main-country-button"
                        onClick={(e) => openDropdown('main', e)}
                      >
                        <span>{selectedCountry || '국가'}</span>
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
                    filteredChannels.map((channel) => (
                    <tr 
                      key={channel.rank}
                      className="channel-row"
                      onClick={() => handleChannelClick(channel)}
                    >
                      <td>{channel.rank}</td>
                      <td className="channel-name">
                        <span className="rank-badge"></span>
                        <span className="name">{channel.channelName}</span>
                      </td>
                      <td>{channel.category}</td>
                      <td className="subscribers">{formatSubscribers(channel.subscribers)}</td>
                      <td className="growth positive">{formatGrowth(channel.yearlyGrowth)}</td>
                      <td className="growth positive">{formatGrowth(channel.monthlyGrowth)}</td>
                      <td className="growth positive">{formatGrowth(channel.dailyGrowth)}</td>
                      <td>{formatNumber(channel.subscribersPerVideo)}</td>
                      <td className="period">{formatOperatingPeriod(channel.operatingPeriod)}</td>
                      <td className="total-views">{formatViews(channel.totalViews)}</td>
                      <td className="avg-views">{formatViews(channel.avgViews)}</td>
                      <td>{formatVideosCount(channel.videosCount)}</td>
                      <td className="upload-frequency">{formatUploadFrequency(channel.uploadFrequency)}</td>
                      <td className="country">{countryDisplayNames[channel.country] || channel.country}</td>
                    </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        {sidebarOpen && (
          loading ? (
            <SidebarSkeleton />
          ) : selectedChannel ? (
          <div className="sidebar-overlay">
            <div className="sidebar">
              <div className="sidebar-header">
                <h3>
                  <button onClick={closeSidebar} className="back-btn">←</button>
                  @{selectedChannel.channelName}
                </h3>
                <button 
                  className="youtube-visit-btn"
                  onClick={() => {
                    // TODO: 구글 드라이브 연동 후 selectedChannel.youtubeUrl 사용으로 변경될 예정
                    const channelUrl = selectedChannel.channelName === 'MrBeast' 
                      ? 'https://www.youtube.com/@MrBeast'
                      : 'https://www.youtube.com/@tseries';
                    window.open(channelUrl, '_blank');
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                  이동
                </button>
              </div>
              
              <div className="sidebar-content">
                <div className="channel-info">
                  <div className="info-item">
                    <span className="label">채널명:</span>
                    <span className="value">{selectedChannel.channelName}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">카테고리:</span>
                    <span className="value">{selectedChannel.category}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">구독자수:</span>
                    <span className="value">{formatSubscribers(selectedChannel.subscribers)}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">국가:</span>
                    <span className="value">{countryDisplayNames[selectedChannel.country] || selectedChannel.country}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">운영기간:</span>
                    <span className="value">{formatOperatingPeriod(selectedChannel.operatingPeriod)}</span>
                  </div>
                </div>

                <div className="chart-section" style={{position: 'relative'}}>
                  <SubTitle>구독자 성장 추이</SubTitle>
                  <div className="chart-placeholder">
                    <div className="line-chart">
                      <svg width="100%" height="100" viewBox="0 0 300 100">
                        <defs>
                          <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style={{stopColor: '#4fc3f7', stopOpacity: 0.3}} />
                            <stop offset="100%" style={{stopColor: '#4fc3f7', stopOpacity: 0.05}} />
                          </linearGradient>
                        </defs>
                        
                        {/* 그라데이션 영역 */}
                        <path 
                          d="M 30 80 Q 90 60 150 40 Q 210 20 270 15 L 270 100 L 30 100 Z" 
                          fill="url(#areaGradient)"
                        />
                        
                        {/* 선 그래프 */}
                        <path 
                          d="M 30 80 Q 90 60 150 40 Q 210 20 270 15" 
                          stroke="#4fc3f7" 
                          strokeWidth="3" 
                          fill="none"
                          className="growth-line"
                        />
                        
                        {/* 호버 가능한 투명 영역 (구간별) */}
                        <rect x="30" y="0" width="60" height="100" fill="transparent" className="hover-area"
                              onMouseEnter={() => setHoveredPoint(0)}
                              onMouseLeave={() => setHoveredPoint(null)} />
                        <rect x="90" y="0" width="60" height="100" fill="transparent" className="hover-area"
                              onMouseEnter={() => setHoveredPoint(1)}
                              onMouseLeave={() => setHoveredPoint(null)} />
                        <rect x="150" y="0" width="60" height="100" fill="transparent" className="hover-area"
                              onMouseEnter={() => setHoveredPoint(2)}
                              onMouseLeave={() => setHoveredPoint(null)} />
                        <rect x="210" y="0" width="60" height="100" fill="transparent" className="hover-area"
                              onMouseEnter={() => setHoveredPoint(3)}
                              onMouseLeave={() => setHoveredPoint(null)} />
                        
                        {/* 데이터 포인트 */}
                        <circle cx="30" cy="80" r="4" fill="#4fc3f7" />
                        <circle cx="90" cy="60" r="4" fill="#4fc3f7" />
                        <circle cx="150" cy="40" r="4" fill="#4fc3f7" />
                        <circle cx="210" cy="20" r="4" fill="#4fc3f7" />
                        <circle cx="270" cy="15" r="4" fill="#4fc3f7" />
                        
                        {/* 성장률 퍼센트 라벨 */}
                        <text x="90" y="52" textAnchor="middle" className="growth-percentage">3%</text>
                        <text x="150" y="32" textAnchor="middle" className="growth-percentage">4%</text>
                        <text x="210" y="12" textAnchor="middle" className="growth-percentage">7.3%</text>
                        <text x="270" y="7" textAnchor="middle" className="growth-percentage">10%</text>
                      </svg>
                    </div>
                    <div className="chart-labels">
                      <span>5월</span>
                      <span>6월</span>
                      <span>7월</span>
                      <span>8월</span>
                      <span>9월</span>
                    </div>
                  </div>
                  
                  {/* HTML 말풍선 툴팁 - chart-section 레벨에서 절대 위치 */}
                  {hoveredPoint !== null && (() => {
                    // 각 구간의 중앙 x 좌표 계산 (퍼센트 기준)
                    const tooltipPositions = [20, 40, 60, 80]; // 각 구간 중앙 (%)
                    const tooltipX = tooltipPositions[hoveredPoint];
                    
                    return (
                      <div 
                        className="html-tooltip"
                        style={{
                          position: 'absolute',
                          left: `${tooltipX}%`,
                          top: '170px',
                          transform: 'translateX(-50%)',
                          zIndex: 9999,
                          pointerEvents: 'none'
                        }}
                      >
                        <div className="tooltip-bubble">
                          <div className="tooltip-arrow"></div>
                          <div className="tooltip-content">
                            <div>{growthTooltips[hoveredPoint].message[0]}</div>
                            <div>{growthTooltips[hoveredPoint].message[1]}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                <div className="rpm-section">
                  <SubTitle>수익계산</SubTitle>
                  
                  <div className="unified-revenue-section">
                    <div className="total-views-simple">
                      <span className="total-views-label">{cf('totalViewsLabel')}</span>
                      <span className="total-views-value">{selectedChannel ? formatViews(selectedChannel.totalViews) : '0'}</span>
                    </div>
                    
                    <div className="country-selector">
                      <label className="country-label">{cf('countryRpmLabel')}</label>
                      <button 
                        className="country-select-button"
                        onClick={(e) => openDropdown('sidebar', e)}
                      >
                        <span>{countryDisplayNames[currentCountry] || currentCountry}</span>
                        <svg className={`dropdown-arrow ${dropdownState.isOpen && dropdownState.type === 'sidebar' ? 'open' : ''}`} width="16" height="16" viewBox="0 0 20 20">
                          <path stroke="#666" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="m6 8 4 4 4-4"/>
                        </svg>
                      </button>
                    </div>
                    
                    <div className="revenue-cards-container">
                      {/* 숏폼 카드 */}
                      <div className="content-revenue-card">
                        <div className="content-header">
                          <span className="content-title">{cf('shortsRpmLabel')}</span>
                          <span className="content-percentage">{shortsPercentage}%</span>
                        </div>
                        
                        <div className="rpm-controller">
                          <button onClick={() => adjustShortsRpm(false)} className="rpm-btn">-</button>
                          <span className="rpm-value">{shortsRpm.toFixed(2)}</span>
                          <button onClick={() => adjustShortsRpm(true)} className="rpm-btn">+</button>
                        </div>
                        
                        <div className="revenue-result">
                          <div className="revenue-label">총 숏폼 수익</div>
                          <div className="revenue-value">
                            {selectedChannel ? formatRevenue(Math.round((selectedChannel.totalViews * (shortsPercentage / 100) / 1000) * shortsRpm * 1388)) : '0원'}
                          </div>
                        </div>
                      </div>
                      
                      {/* 롱폼 카드 */}
                      <div className="content-revenue-card">
                        <div className="content-header">
                          <span className="content-title">{cf('longRpmLabel')}</span>
                          <span className="content-percentage">{longPercentage}%</span>
                        </div>
                        
                        <div className="rpm-controller">
                          <button onClick={() => adjustLongRpm(false)} className="rpm-btn">-</button>
                          <span className="rpm-value">{longRpm.toFixed(2)}</span>
                          <button onClick={() => adjustLongRpm(true)} className="rpm-btn">+</button>
                        </div>
                        
                        <div className="revenue-result">
                          <div className="revenue-label">총 롱폼 수익</div>
                          <div className="revenue-value">
                            {selectedChannel ? formatRevenue(Math.round((selectedChannel.totalViews * (longPercentage / 100) / 1000) * longRpm * 1388)) : '0원'}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="total-revenue-card">
                      <div className="total-revenue-label">숏폼 + 롱폼 총 수익</div>
                      <div className="total-revenue-value">{calculateTotalRevenue()}</div>
                    </div>
                  </div>
                </div>

                <SubTitle>디테일 정보</SubTitle>
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-label">총 조회수</div>
                    <div className="stat-value">{formatViews(selectedChannel.totalViews)}</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">평균 조회수</div>
                    <div className="stat-value">{formatViews(selectedChannel.avgViews)}</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">총 영상수</div>
                    <div className="stat-value">{formatVideosCount(selectedChannel.videosCount)}</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">업로드 빈도</div>
                    <div className="stat-value">{formatUploadFrequency(selectedChannel.uploadFrequency)}</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">월간증가</div>
                    <div className="stat-value growth-value">{formatGrowth(selectedChannel.monthlyGrowth)}</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">년간증가</div>
                    <div className="stat-value growth-value">{formatGrowth(selectedChannel.yearlyGrowth)}</div>
                  </div>
                  <div 
                    className="stat-card tooltip-container"
                    onMouseEnter={() => setHoveredStat('views-per-subscriber')}
                    onMouseLeave={() => setHoveredStat(null)}
                  >
                    <div className="stat-label">구독자 대비 조회수</div>
                    <div className="stat-value">{calculateViewsPerSubscriber(selectedChannel)}</div>
                    {hoveredStat === 'views-per-subscriber' && (
                      <div className="stat-tooltip" dangerouslySetInnerHTML={{__html: cf('viewsPerSubscriberTooltip')}} />
                    )}
                  </div>
                  <div 
                    className="stat-card tooltip-container"
                    onMouseEnter={() => setHoveredStat('subscription-rate')}
                    onMouseLeave={() => setHoveredStat(null)}
                  >
                    <div className="stat-label">구독 전환율</div>
                    <div className="stat-value">{calculateSubscriptionRate(selectedChannel)}</div>
                    {hoveredStat === 'subscription-rate' && (
                      <div className="stat-tooltip" dangerouslySetInnerHTML={{__html: cf('subscriptionRateTooltip')}} />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          ) : null
        )}
      </div>

      <style>{`
        .channel-stats-section {
          margin-top: 2rem;
        }

        .stats-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          padding: 1rem;
          background: white;
          border-radius: 8px;
        }

        .stats-header h2 {
          color: #333;
          margin: 0;
          font-size: 1.2rem;
        }

        .stats-info {
          color: #666;
        }

        .total-channels {
          color: #4a9eff;
          font-weight: bold;
          margin-right: 1rem;
        }

        .table-container {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .channel-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.9rem;
          table-layout: fixed;
        }

        .channel-table th {
          background: #f8f9fa;
          padding: 12px 8px;
          text-align: left;
          font-weight: 600;
          border-bottom: 2px solid #e9ecef;
          white-space: nowrap;
          color: #333;
        }

        .channel-table th:nth-child(1) { width: 5%; } /* 순위 */
        .channel-table th:nth-child(2) { width: 12%; } /* 채널명 */
        .channel-table th:nth-child(3) { width: 8%; } /* 카테고리 */
        .channel-table th:nth-child(4) { width: 10%; } /* 구독자 */
        .channel-table th:nth-child(5) { width: 10%; } /* 연간성장 */
        .channel-table th:nth-child(6) { width: 10%; } /* 월간성장 */
        .channel-table th:nth-child(7) { width: 8%; } /* 일간성장 */
        .channel-table th:nth-child(8) { width: 8%; } /* 구독자/영상 */
        .channel-table th:nth-child(9) { width: 8%; } /* 운영기간 */
        .channel-table th:nth-child(10) { width: 10%; } /* 총 조회수 */
        .channel-table th:nth-child(11) { width: 8%; } /* 평균 조회수 */
        .channel-table th:nth-child(12) { width: 6%; } /* 영상 수 */
        .channel-table th:nth-child(13) { width: 8%; } /* 업로드 빈도 */
        .channel-table th:nth-child(14) { width: 7%; } /* 국가 */

        .sortable-header {
          cursor: pointer;
          position: relative;
          transition: all 0.2s ease;
          user-select: none;
        }

        .sortable-header:hover {
          background: #e3f2fd !important;
          color: #1976d2;
        }

        .sortable-header:active {
          background: #bbdefb !important;
        }

        .sort-menu {
          position: absolute;
          top: 100%;
          left: 0;
          background: white;
          border: 1px solid #e9ecef;
          border-radius: 6px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          z-index: 1000;
          min-width: 140px;
          overflow: hidden;
          animation: sortMenuSlide 0.2s ease;
        }

        @keyframes sortMenuSlide {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .sort-menu div {
          padding: 0.75rem 1rem;
          cursor: pointer;
          transition: background 0.2s ease;
          color: #333;
          font-size: 0.9rem;
          border-bottom: 1px solid #f5f5f5;
        }

        .sort-menu div:last-child {
          border-bottom: none;
        }

        .sort-menu div:hover {
          background: #f8f9fa;
          color: #1976d2;
        }

        .sort-menu div:active {
          background: #e3f2fd;
        }

        .category-menu {
          width: 400px;
        }

        .category-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0;
        }

        .category-item {
          padding: 0.75rem 1rem;
          cursor: pointer;
          transition: background 0.2s ease;
          color: #333;
          font-size: 0.9rem;
          border-bottom: 1px solid #f5f5f5;
          border-right: 1px solid #f5f5f5;
        }

        .category-item:nth-child(even) {
          border-right: none;
        }

        .category-item:hover {
          background: #f8f9fa;
          color: #1976d2;
        }

        .category-item:active {
          background: #e3f2fd;
        }


        .channel-table td {
          padding: 12px 8px;
          border-bottom: 1px solid #e9ecef;
          white-space: nowrap;
          color: #555;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .channel-row {
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .channel-row:hover {
          background: #e3f2fd !important;
          transform: translateX(2px);
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .channel-row:active {
          background: #bbdefb !important;
          transform: translateX(1px);
        }

        .channel-name {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .rank-badge {
          width: 24px;
          height: 24px;
          background: #333;
          color: white;
          border-radius: 50%;
          font-size: 0.8rem;
          font-weight: bold;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .subscribers {
          font-weight: 600;
          color: #333;
        }

        .growth.positive {
          color: #28a745;
          font-weight: 500;
        }

        .period {
          color: #555;
          text-align: center;
          font-size: 0.9rem;
        }

        .total-views {
          font-weight: 600;
          color: #6c757d;
        }

        .avg-views {
          font-weight: 500;
          color: #495057;
        }

        .upload-frequency {
          color: #555;
          text-align: center;
          font-size: 0.9rem;
        }

        .country {
          color: #555;
          text-align: center;
          font-size: 0.9rem;
        }

        /* Sidebar Styles */
        .sidebar-overlay {
          position: fixed;
          top: 0;
          right: 0;
          width: 450px;
          height: 100%;
          display: flex;
          justify-content: flex-end;
          z-index: 1000;
          pointer-events: none;
        }

        .sidebar {
          width: 450px;
          height: 100%;
          background: white;
          box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
          animation: slideIn 0.3s ease;
          pointer-events: auto;
        }

        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }

        .sidebar-header {
          padding: 1.5rem;
          border-bottom: 1px solid #e9ecef;
          background: #f8f9fa;
        }

        .sidebar-header h3 {
          margin: 0;
          color: #333;
          font-size: 1.75rem;
          font-weight: bold;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .back-btn {
          background: none;
          border: none;
          font-size: 1.3rem;
          cursor: pointer;
          color: #666;
          padding: 0.3rem 0.5rem;
          border-radius: 4px;
          transition: all 0.2s ease;
        }

        .back-btn:hover {
          background: #e9ecef;
          color: #333;
        }

        .youtube-visit-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.4rem 0.7rem;
          background: #FF0000;
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-top: 0.6rem;
          margin-left: 2.3rem;
          text-decoration: none;
        }

        .youtube-visit-btn:hover {
          background: #CC0000;
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(255, 0, 0, 0.3);
        }

        .youtube-visit-btn:active {
          transform: translateY(0);
          box-shadow: 0 1px 4px rgba(255, 0, 0, 0.3);
        }

        .sidebar-content {
          padding: 1.5rem;
          padding-bottom: 150px;
          height: calc(100% - 80px);
          overflow-y: auto;
        }

        .channel-info {
          margin-bottom: 2rem;
        }

        .info-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 6px;
          padding: 0.8rem;
          background: #f8f9fa;
          border-radius: 6px;
        }

        .info-item .label {
          font-weight: 600;
          color: #666;
        }

        .info-item .value {
          color: #333;
        }

        .chart-section {
          margin-bottom: 2rem;
        }

        .subtitle {
          color: #333;
          margin-bottom: 1rem;
          font-size: 1.1rem;
          margin-top: 0;
        }

        .chart-placeholder {
          padding: 1rem;
          background: #f8f9fa;
          border-radius: 8px;
        }

        .line-chart {
          margin-bottom: 1rem;
          background: white;
          padding: 1rem;
          border-radius: 6px;
          overflow: hidden;
        }

        .growth-line {
          animation: drawLine 2s ease-out;
          stroke-dasharray: 400;
          stroke-dashoffset: 400;
        }

        @keyframes drawLine {
          to {
            stroke-dashoffset: 0;
          }
        }

        .line-chart circle {
          animation: fadeInPoints 2.5s ease-out;
          opacity: 0;
          animation-fill-mode: forwards;
        }

        @keyframes fadeInPoints {
          0% { opacity: 0; transform: scale(0); }
          80% { opacity: 0; transform: scale(0); }
          100% { opacity: 1; transform: scale(1); }
        }

        .growth-percentage {
          font-size: 10px;
          font-weight: 600;
          fill: #2c3e50;
          opacity: 0;
          animation: fadeInPercentage 3s ease-out forwards;
        }

        @keyframes fadeInPercentage {
          0% { opacity: 0; transform: translateY(3px); }
          70% { opacity: 0; }
          100% { opacity: 1; transform: translateY(0); }
        }

        .hover-area {
          cursor: pointer;
        }

        .hover-area:hover {
          fill: rgba(79, 195, 247, 0.2);
        }

        .tooltip {
          pointer-events: none;
          animation: tooltipFadeIn 0.2s ease-out;
        }

        .tooltip-text {
          font-size: 14px;
          font-weight: 500;
          fill: white;
        }

        .html-tooltip {
          animation: tooltipFadeIn 0.2s ease-out;
        }

        .tooltip-bubble {
          position: relative;
          background: #4fc3f7;
          border-radius: 15px;
          padding: 15px 20px;
          width: 150px;
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        .tooltip-arrow {
          position: absolute;
          top: -10px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 10px solid transparent;
          border-right: 10px solid transparent;
          border-bottom: 10px solid #4fc3f7;
        }

        .tooltip-content {
          color: white;
          font-size: 14px;
          font-weight: 500;
          text-align: center;
          line-height: 1.4;
        }

        @keyframes tooltipFadeIn {
          0% { opacity: 0; transform: translateY(-3px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        .chart-labels {
          display: flex;
          justify-content: space-around;
          font-size: 0.8rem;
          color: #666;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .stat-card {
          padding: 1rem;
          background: #f8f9fa;
          border-radius: 8px;
          text-align: center;
          border: 1px solid #e9ecef;
        }

        .tooltip-container {
          position: relative;
          cursor: help;
        }

        .stat-tooltip {
          position: absolute;
          top: -10px;
          left: 50%;
          transform: translateX(-50%) translateY(-100%);
          background: #333;
          color: white;
          padding: 1.2rem;
          border-radius: 12px;
          font-size: 15px;
          line-height: 1.8;
          width: 200px;
          text-align: left;
          z-index: 1000;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          white-space: normal;
          word-wrap: break-word;
        }

        .stat-tooltip::after {
          content: '';
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          border: 8px solid transparent;
          border-top-color: #333;
        }

        .stat-label {
          font-size: 0.8rem;
          color: #666;
          font-weight: 500;
          margin-bottom: 0.5rem;
        }

        .stat-value {
          font-size: 1.1rem;
          font-weight: 700;
          color: #333544;
        }

        .growth-value {
          color: #28a745 !important;
        }

        /* RPM Section Styles */
        .rpm-section {
          margin-bottom: 2rem;
        }

        .content-tabs {
          display: flex;
          margin-bottom: 1rem;
          background: #e9ecef;
          border-radius: 6px;
          padding: 4px;
        }

        .tab {
          flex: 1;
          padding: 0.5rem 1rem;
          border: none;
          background: transparent;
          color: #666;
          font-weight: 500;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .tab.active {
          background: white;
          color: #333;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .tab:hover:not(.active) {
          color: #333;
        }

        .rpm-card {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 1rem;
          margin-bottom: 1rem;
          border: 1px solid #e9ecef;
        }

        .rpm-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 1rem;
          color: #666;
          font-weight: 600;
          font-size: 0.9rem;
        }

        .rpm-controls {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .rpm-btn {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: none;
          background: #e9ecef;
          color: #666;
          font-size: 1.2rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .rpm-btn:hover {
          background: #dee2e6;
          color: #333;
        }

        .rpm-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #333;
        }

        .period-value {
          font-size: 1.1rem;
          font-weight: 600;
          color: #333;
        }

        .revenue-grid {
          display: grid;
          grid-template-columns: 1fr 1.5fr;
          gap: 1rem;
          margin-top: 30px;
        }

        .revenue-card {
          background: white;
          border-radius: 8px;
          padding: 1rem;
          text-align: center;
          border: 1px solid #e9ecef;
        }

        .revenue-label {
          font-size: 0.8rem;
          color: #7c4dff;
          margin-bottom: 0.5rem;
          font-weight: 500;
        }

        .revenue-value {
          font-size: 1.2rem;
          font-weight: 700;
          color: #7c4dff;
        }

        .revenue-value.recent {
          color: #7c4dff;
        }

        .revenue-value.total {
          color: #7c4dff;
        }

        .unified-revenue-section {
          background: #f8f9fa;
          border-radius: 12px;
          padding: 1.5rem 10px;
          border: 1px solid #e9ecef;
        }

        .total-views-simple {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .total-views-label {
          font-size: 0.9rem;
          color: #666;
          font-weight: 500;
        }

        .total-views-value {
          font-size: 1.1rem;
          color: #333;
          font-weight: 700;
        }

        .country-selector {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .country-label {
          font-size: 0.9rem;
          color: #666;
          font-weight: 500;
        }

        .country-dropdown-wrapper {
          position: relative;
        }

        .country-select-button {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.4rem 0.6rem;
          border: 1px solid #ddd;
          border-radius: 12px;
          background: white;
          font-size: 0.85rem;
          color: #333;
          cursor: pointer;
          outline: none;
          height: 48px;
          width: 50%;
          transition: border-color 0.2s ease;
        }

        .country-select-button:hover {
          border-color: #999;
        }

        .country-select-button:focus {
          border-color: #7c4dff;
          box-shadow: 0 0 0 2px rgba(124, 77, 255, 0.1);
        }

        .dropdown-arrow {
          transition: transform 0.2s ease;
        }

        .dropdown-arrow.open {
          transform: rotate(180deg);
        }

        .main-country-button {
          width: auto;
          min-width: 50px;
          height: auto;
          padding: 0.3rem 0.4rem;
          font-size: 0.9rem;
          font-weight: 500;
        }

        .country-header {
          position: relative;
        }

        .revenue-cards-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }

        .content-revenue-card {
          background: white;
          border-radius: 8px;
          padding: 1rem;
          border: 1px solid #e9ecef;
        }

        .content-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .content-title {
          font-size: 1rem;
          color: #333;
          font-weight: 600;
        }

        .content-percentage {
          font-size: 0.9rem;
          color: #666;
          background: #f0f0f0;
          padding: 0.25rem 0.5rem;
          border-radius: 10px;
        }

        .rpm-controller {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }

        .rpm-label {
          text-align: center;
          font-size: 0.8rem;
          color: #666;
          margin-bottom: 1rem;
        }

        .rpm-controller .rpm-btn {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: none;
          background: #f8f9fa;
          color: #666;
          font-size: 1.1rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .rpm-controller .rpm-btn:hover {
          background: #e9ecef;
        }

        .rpm-controller .rpm-value {
          font-size: 1.2rem;
          font-weight: 700;
          color: #333;
          min-width: 60px;
          text-align: center;
        }

        .revenue-result {
          text-align: center;
          border-top: 1px solid #f0f0f0;
          padding-top: 1rem;
        }

        .revenue-result .revenue-label {
          font-size: 0.8rem;
          color: #666;
          margin-bottom: 0.5rem;
        }

        .revenue-result .revenue-value {
          font-size: 1.1rem;
          font-weight: 700;
          color: #333;
        }

        .total-revenue-card {
          background: white;
          border-radius: 8px;
          padding: 1rem;
          text-align: center;
          border: 1px solid #e9ecef;
          margin-top: 0;
        }

        .total-revenue-label {
          font-size: 0.9rem;
          color: #7c4dff;
          margin-bottom: 0.5rem;
          font-weight: 500;
        }

        .total-revenue-value {
          font-size: 1.3rem;
          font-weight: 700;
          color: #7c4dff;
        }

        /* 스켈레톤 스타일 */
        .skeleton-row {
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .skeleton-row td {
          padding: 12px 8px;
          border-bottom: 1px solid #e9ecef;
          white-space: nowrap;
          color: transparent;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .skeleton-cell-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .skeleton-cell {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 4px;
          display: inline-block;
        }

        .skeleton-rank {
          width: 20px;
          height: 20px;
          color: transparent;
        }
        
        .skeleton-channel-name {
          width: 120px;
          height: 18px;
        }
        
        .skeleton-category {
          width: 80px;
          height: 16px;
        }
        
        .skeleton-subscribers {
          width: 90px;
          height: 18px;
        }
        
        .skeleton-growth {
          width: 70px;
          height: 16px;
        }
        
        .skeleton-number {
          width: 60px;
          height: 16px;
        }
        
        .skeleton-period {
          width: 80px;
          height: 16px;
        }
        
        .skeleton-views-large {
          width: 100px;
          height: 18px;
        }
        
        .skeleton-views-medium {
          width: 85px;
          height: 18px;
        }
        
        .skeleton-videos-count {
          width: 50px;
          height: 16px;
        }
        
        .skeleton-frequency {
          width: 65px;
          height: 16px;
        }
        
        .skeleton-country {
          width: 45px;
          height: 16px;
        }

        /* 사이드바 스켈레톤 스타일 - 실제 구조와 정확히 매칭 */
        .skeleton-sidebar-content .skeleton-back-btn {
          color: #666;
        }

        .skeleton-title {
          width: 180px;
          height: 28px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 4px;
          margin-left: 0.5rem;
        }

        .skeleton-youtube-btn {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          color: transparent;
        }

        .skeleton-btn-text {
          width: 30px;
          height: 16px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 4px;
        }

        .skeleton-info-value {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 4px;
        }

        .skeleton-chart {
          width: 100%;
          height: 100px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 6px;
        }

        .skeleton-rpm-value {
          width: 60px;
          height: 30px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 4px;
        }

        .skeleton-period-value {
          width: 120px;
          height: 24px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 4px;
        }

        .skeleton-revenue-value {
          width: 90px;
          height: 20px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 4px;
          margin-top: 0.5rem;
        }

        .skeleton-total-revenue {
          width: 110px;
          height: 22px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 4px;
          margin-top: 0.5rem;
        }

        .skeleton-stat-value {
          width: 85px;
          height: 18px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 4px;
        }

        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }

        @media (max-width: 768px) {
          .table-container {
            
          }
          
          .stats-header {
            flex-direction: column;
            gap: 0.5rem;
            text-align: center;
          }

          .sidebar {
            width: 100%;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* 전역 공용 드롭다운 - 단 1개만 존재 */}
      {dropdownState.isOpen && dropdownState.position && (
        <div 
          style={{
            position: 'fixed',
            left: dropdownState.position.x,
            top: dropdownState.position.y,
            zIndex: 2000
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
    </>
  );
};

export default ChannelFinder;