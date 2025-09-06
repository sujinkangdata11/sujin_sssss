import React, { useState } from 'react';
import { Language } from '../types';
import { translations } from '../i18n/translations';
import { channelFinderTranslations } from '../i18n/channelFinderTranslations';
import { channelFinderI18n, getChannelFinderTranslation, formatLocalizedNumber } from '../i18n/channelFinderI18n';
import SEOHead from '../components/SEOHead';
import DropdownOptions from '../components/DropdownOptions';
import Pagination from '../components/Pagination';
import countryRpmDefaults from '../data/countryRpmDefaults.json';
import currencyExchangeData from '../data/currencyExchangeData.json';
import { cloudflareService } from '../services/mainFinder/cloudflareService';

// 국가 표시용 매핑 (간단한 객체)
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

// 국가 표시용 매핑 함수 (컴포넌트 내부에서 사용)
const getCountryDisplayName = (language: Language, countryKey: string): string => {
  const countryTranslations: { [key: string]: { [key in Language]: string } } = {
    'United States': { en: 'United States', ko: '미국', ja: 'アメリカ', zh: '美国', hi: 'अमेरिका', es: 'Estados Unidos', fr: 'États-Unis', de: 'USA', nl: 'Verenigde Staten', pt: 'Estados Unidos', ru: 'США' },
    'Australia': { en: 'Australia', ko: '호주', ja: 'オーストラリア', zh: '澳大利亚', hi: 'ऑस्ट्रेलिया', es: 'Australia', fr: 'Australie', de: 'Australien', nl: 'Australië', pt: 'Austrália', ru: 'Австралия' },
    'Austria': { en: 'Austria', ko: '오스트리아', ja: 'オーストリア', zh: '奥地利', hi: 'ऑस्ट्रिया', es: 'Austria', fr: 'Autriche', de: 'Österreich', nl: 'Oostenrijk', pt: 'Áustria', ru: 'Австрия' },
    'Belgium': { en: 'Belgium', ko: '벨기에', ja: 'ベルギー', zh: '比利时', hi: 'बेल्जियम', es: 'Bélgica', fr: 'Belgique', de: 'Belgien', nl: 'België', pt: 'Bélgica', ru: 'Бельгия' },
    'Brazil': { en: 'Brazil', ko: '브라질', ja: 'ブラジル', zh: '巴西', hi: 'ब्राजील', es: 'Brasil', fr: 'Brésil', de: 'Brasilien', nl: 'Brazilië', pt: 'Brasil', ru: 'Бразилия' },
    'Canada': { en: 'Canada', ko: '캐나다', ja: 'カナダ', zh: '加拿大', hi: 'कनाडा', es: 'Canadá', fr: 'Canada', de: 'Kanada', nl: 'Canada', pt: 'Canadá', ru: 'Канада' },
    'Denmark': { en: 'Denmark', ko: '덴마크', ja: 'デンマーク', zh: '丹麦', hi: 'डेनमार्क', es: 'Dinamarca', fr: 'Danemark', de: 'Dänemark', nl: 'Denemarken', pt: 'Dinamarca', ru: 'Дания' },
    'Egypt': { en: 'Egypt', ko: '이집트', ja: 'エジプト', zh: '埃及', hi: 'मिस्र', es: 'Egipto', fr: 'Égypte', de: 'Ägypten', nl: 'Egypte', pt: 'Egito', ru: 'Египет' },
    'Finland': { en: 'Finland', ko: '핀란드', ja: 'フィンランド', zh: '芬兰', hi: 'फिनलैंड', es: 'Finlandia', fr: 'Finlande', de: 'Finnland', nl: 'Finland', pt: 'Finlândia', ru: 'Финляндия' },
    'France': { en: 'France', ko: '프랑스', ja: 'フランス', zh: '法国', hi: 'फ्रांस', es: 'Francia', fr: 'France', de: 'Frankreich', nl: 'Frankrijk', pt: 'França', ru: 'Франция' },
    'Germany': { en: 'Germany', ko: '독일', ja: 'ドイツ', zh: '德国', hi: 'जर्मनी', es: 'Alemania', fr: 'Allemagne', de: 'Deutschland', nl: 'Duitsland', pt: 'Alemanha', ru: 'Германия' },
    'Hong Kong': { en: 'Hong Kong', ko: '홍콩', ja: '香港', zh: '香港', hi: 'हांग कांग', es: 'Hong Kong', fr: 'Hong Kong', de: 'Hongkong', nl: 'Hong Kong', pt: 'Hong Kong', ru: 'Гонконг' },
    'India': { en: 'India', ko: '인도', ja: 'インド', zh: '印度', hi: 'भारत', es: 'India', fr: 'Inde', de: 'Indien', nl: 'India', pt: 'Índia', ru: 'Индия' },
    'Indonesia': { en: 'Indonesia', ko: '인도네시아', ja: 'インドネシア', zh: '印度尼西亚', hi: 'इंडोनेशिया', es: 'Indonesia', fr: 'Indonésie', de: 'Indonesien', nl: 'Indonesië', pt: 'Indonésia', ru: 'Индонезия' },
    'Ireland': { en: 'Ireland', ko: '아일랜드', ja: 'アイルランド', zh: '爱尔兰', hi: 'आयरलैंड', es: 'Irlanda', fr: 'Irlande', de: 'Irland', nl: 'Ierland', pt: 'Irlanda', ru: 'Ирландия' },
    'Israel': { en: 'Israel', ko: '이스라엘', ja: 'イスラエル', zh: '以色列', hi: 'इज़राइल', es: 'Israel', fr: 'Israël', de: 'Israel', nl: 'Israël', pt: 'Israel', ru: 'Израиль' },
    'Japan': { en: 'Japan', ko: '일본', ja: '日本', zh: '日本', hi: 'जापान', es: 'Japón', fr: 'Japon', de: 'Japan', nl: 'Japan', pt: 'Japão', ru: 'Япония' },
    'Mexico': { en: 'Mexico', ko: '멕시코', ja: 'メキシコ', zh: '墨西哥', hi: 'मेक्सिको', es: 'México', fr: 'Mexique', de: 'Mexiko', nl: 'Mexico', pt: 'México', ru: 'Мексика' },
    'Netherlands': { en: 'Netherlands', ko: '네덜란드', ja: 'オランダ', zh: '荷兰', hi: 'नीदरलैंड', es: 'Países Bajos', fr: 'Pays-Bas', de: 'Niederlande', nl: 'Nederland', pt: 'Países Baixos', ru: 'Нидерланды' },
    'New Zealand': { en: 'New Zealand', ko: '뉴질랜드', ja: 'ニュージーランド', zh: '新西兰', hi: 'न्यूज़ीलैंड', es: 'Nueva Zelanda', fr: 'Nouvelle-Zélande', de: 'Neuseeland', nl: 'Nieuw-Zeeland', pt: 'Nova Zelândia', ru: 'Новая Зеландия' },
    'Norway': { en: 'Norway', ko: '노르웨이', ja: 'ノルウェー', zh: '挪威', hi: 'नॉर्वे', es: 'Noruega', fr: 'Norvège', de: 'Norwegen', nl: 'Noorwegen', pt: 'Noruega', ru: 'Норвегия' },
    'Pakistan': { en: 'Pakistan', ko: '파키스탄', ja: 'パキスタン', zh: '巴基斯坦', hi: 'पाकिस्तान', es: 'Pakistán', fr: 'Pakistan', de: 'Pakistan', nl: 'Pakistan', pt: 'Paquistão', ru: 'Пакистан' },
    'Philippines': { en: 'Philippines', ko: '필리핀', ja: 'フィリピン', zh: '菲律宾', hi: 'फिलीपींस', es: 'Filipinas', fr: 'Philippines', de: 'Philippinen', nl: 'Filipijnen', pt: 'Filipinas', ru: 'Филиппины' },
    'Portugal': { en: 'Portugal', ko: '포르투갈', ja: 'ポルトガル', zh: '葡萄牙', hi: 'पुर्तगाल', es: 'Portugal', fr: 'Portugal', de: 'Portugal', nl: 'Portugal', pt: 'Portugal', ru: 'Португалия' },
    'Singapore': { en: 'Singapore', ko: '싱가포르', ja: 'シンガポール', zh: '新加坡', hi: 'सिंगापुर', es: 'Singapur', fr: 'Singapour', de: 'Singapur', nl: 'Singapore', pt: 'Singapura', ru: 'Сингапур' },
    'South Africa': { en: 'South Africa', ko: '남아프리카공화국', ja: '南アフリカ', zh: '南非', hi: 'दक्षिण अफ्रीका', es: 'Sudáfrica', fr: 'Afrique du Sud', de: 'Südafrika', nl: 'Zuid-Afrika', pt: 'África do Sul', ru: 'ЮАР' },
    'South Korea': { en: 'South Korea', ko: '한국', ja: '韓国', zh: '韩国', hi: 'दक्षिण कोरिया', es: 'Corea del Sur', fr: 'Corée du Sud', de: 'Südkorea', nl: 'Zuid-Korea', pt: 'Coreia do Sul', ru: 'Южная Корея' },
    'Spain': { en: 'Spain', ko: '스페인', ja: 'スペイン', zh: '西班牙', hi: 'स्पेन', es: 'España', fr: 'Espagne', de: 'Spanien', nl: 'Spanje', pt: 'Espanha', ru: 'Испания' },
    'Sweden': { en: 'Sweden', ko: '스웨덴', ja: 'スウェーデン', zh: '瑞典', hi: 'स्वीडन', es: 'Suecia', fr: 'Suède', de: 'Schweden', nl: 'Zweden', pt: 'Suécia', ru: 'Швеция' },
    'Switzerland': { en: 'Switzerland', ko: '스위스', ja: 'スイス', zh: '瑞士', hi: 'स्विट्जरलैंड', es: 'Suiza', fr: 'Suisse', de: 'Schweiz', nl: 'Zwitserland', pt: 'Suíça', ru: 'Швейцария' },
    'Taiwan': { en: 'Taiwan', ko: '대만', ja: '台湾', zh: '台湾', hi: 'ताइवान', es: 'Taiwán', fr: 'Taïwan', de: 'Taiwan', nl: 'Taiwan', pt: 'Taiwan', ru: 'Тайвань' },
    'Turkey': { en: 'Turkey', ko: '터키', ja: 'トルコ', zh: '土耳其', hi: 'तुर्की', es: 'Turquía', fr: 'Turquie', de: 'Türkei', nl: 'Turkije', pt: 'Turquia', ru: 'Турция' },
    'United Kingdom': { en: 'United Kingdom', ko: '영국', ja: 'イギリス', zh: '英国', hi: 'यूनाइटेड किंगडम', es: 'Reino Unido', fr: 'Royaume-Uni', de: 'Vereinigtes Königreich', nl: 'Verenigd Koninkrijk', pt: 'Reino Unido', ru: 'Великобритания' },
    '기타': { en: 'Others', ko: '기타', ja: 'その他', zh: '其他', hi: 'अन्य', es: 'Otros', fr: 'Autres', de: 'Andere', nl: 'Anderen', pt: 'Outros', ru: 'Прочие' }
  };
  
  return countryTranslations[countryKey]?.[language] || countryKey;
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
  // 조회수 비율 데이터
  shortsViewsPercentage?: number;  // 숏폼 조회수 비율 (%)
  longformViewsPercentage?: number; // 롱폼 조회수 비율 (%)
  // 구독자 성장 데이터
  subscriberHistory?: Array<{
    month: string;
    count: string;
  }>;
}

const SubTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <h4 className="subtitle">{children}</h4>;
};

// 스켈레톤 컴포넌트들
const TableSkeleton: React.FC = () => (
  <>
    {Array.from({ length: 40 }).map((_, i) => (
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
    label: getCountryDisplayName(language, country)
  }));
  
  // 메인 테이블용 국가 옵션 배열 ("전체 국가" 포함) - 사이드바와 동일한 국가 목록 사용
  const mainCountryOptions = [
    { value: '', label: 'ALL' },
    ...countryOptions
  ];
  const [selectedChannel, setSelectedChannel] = useState<ChannelData | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentCountry, setCurrentCountry] = useState('기타'); // 기본 국가
  const [shortsRpm, setShortsRpm] = useState(countryRpmDefaults['기타'].shorts);
  const [longRpm, setLongRpm] = useState(countryRpmDefaults['기타'].long);
  const [exchangeRate, setExchangeRate] = useState(currencyExchangeData['기타'].exchangeRate); // 환율 상태
  // 선택된 채널의 숏폼/롱폼 비율 (실제 데이터 사용)
  const shortsPercentage = selectedChannel?.shortsViewsPercentage || 20;
  const longPercentage = selectedChannel?.longformViewsPercentage || 80;

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
  const itemsPerPage = 40;
  
  // 현지 화폐 환율 및 모달 상태
  const [localExchangeRate, setLocalExchangeRate] = useState(1300);
  const [exchangeRateModalOpen, setExchangeRateModalOpen] = useState(false);
  const [tempExchangeRate, setTempExchangeRate] = useState(1300);

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

  // 필터나 정렬이 변경되면 첫 페이지로 리셋
  React.useEffect(() => {
    setCurrentPage(1);
  }, [filteredChannels.length, selectedCountry]);


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
      const exchangeData = currencyExchangeData[newCountry as keyof typeof currencyExchangeData];
      if (exchangeData) {
        setExchangeRate(exchangeData.exchangeRate);
      }
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
      const exchangeData = currencyExchangeData[channelCountry as keyof typeof currencyExchangeData];
      if (exchangeData) {
        setExchangeRate(exchangeData.exchangeRate);
      }
    } else {
      // 해당 국가의 데이터가 없거나 국가 설정이 없는 채널은 "기타" 사용
      setCurrentCountry('기타');
      setShortsRpm(countryRpmDefaults['기타'].shorts);
      setLongRpm(countryRpmDefaults['기타'].long);
      setExchangeRate(currencyExchangeData['기타'].exchangeRate);
    }
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

  const calculateTotalRevenue = () => {
    if (!selectedChannel) return formatRevenue(0);
    
    const currentExchangeRate = exchangeRate; // 실제 설정된 환율 사용
    
    // 숏폼 조회수 = 총 조회수의 20%
    const shortsViews = selectedChannel.totalViews * (shortsPercentage / 100);
    // 숏폼 수익 = (숏폼 조회수 ÷ 1000) × 숏폼 RPM × 환율
    const shortsRevenue = Math.round((shortsViews / 1000) * shortsRpm * currentExchangeRate);
    
    // 롱폼 조회수 = 총 조회수의 80%
    const longViews = selectedChannel.totalViews * (longPercentage / 100);
    // 롱폼 수익 = (롱폼 조회수 ÷ 1000) × 롱폼 RPM × 환율
    const longRevenue = Math.round((longViews / 1000) * longRpm * currentExchangeRate);
    
    const total = shortsRevenue + longRevenue;
    
    return formatRevenue(total);
  };

  const calculateLocalCurrencyRevenue = () => {
    if (!selectedChannel) return formatRevenue(0);
    
    const currentExchangeRate = exchangeRate; // 실제 설정된 환율 사용
    
    // 숏폼 조회수 = 총 조회수의 20%
    const shortsViews = selectedChannel.totalViews * (shortsPercentage / 100);
    // 숏폼 수익 = (숏폼 조회수 ÷ 1000) × 숏폼 RPM × 환율
    const shortsRevenue = Math.round((shortsViews / 1000) * shortsRpm * currentExchangeRate);
    
    // 롱폼 조회수 = 총 조회수의 80%
    const longViews = selectedChannel.totalViews * (longPercentage / 100);
    // 롱폼 수익 = (롱폼 조회수 ÷ 1000) × 롱폼 RPM × 환율
    const longRevenue = Math.round((longViews / 1000) * longRpm * currentExchangeRate);
    
    const totalUsd = shortsRevenue + longRevenue;
    
    // 현지 화폐로 환율 변환
    const currentCurrency = currencySettings[language];
    const localTotal = Math.round(totalUsd * localExchangeRate);
    
    return formatLocalizedNumber(localTotal, language, currentCurrency.symbol);
  };

  // 현지 화폐 초기화 effect
  React.useEffect(() => {
    const defaultRate = currencySettings[language]?.rate || 1300;
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
    setTempExchangeRate(localExchangeRate);
    setExchangeRateModalOpen(true);
  };

  const closeExchangeRateModal = () => {
    setExchangeRateModalOpen(false);
  };

  const applyExchangeRate = () => {
    setLocalExchangeRate(tempExchangeRate);
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
      
      <div className="page-container">
        <div className="content-wrapper" style={{ padding: '0 100px' }}>

          <div className="channel-stats-section">
            <div className="stats-header">
              <h2>{getChannelFinderTranslation(channelFinderI18n, language, 'header.mainTitle')}</h2>
            </div>

            <div className="table-container">
              <table className="channel-table">
                <thead>
                  <tr>
                    {/* 리사이즈 핸들러 추가 - No 컬럼 */}
                    <th className="category-header-resizable" style={{ width: columnWidths[0] }}>
                      <div className="resize-handle resize-handle-left" onMouseDown={(e) => handleMouseDown(0, e)}></div>
                      {getChannelFinderTranslation(channelFinderI18n, language, 'table.headers.no')}
                    </th>
                    {/* 리사이즈 핸들러 추가 - 채널명 컬럼 */}
                    <th className="category-header-resizable" style={{ width: columnWidths[1] }}>
                      <div className="resize-handle resize-handle-left" onMouseDown={(e) => handleMouseDown(1, e)}></div>
                      {getChannelFinderTranslation(channelFinderI18n, language, 'table.headers.channelName')}
                    </th>
                    <th 
                      className="sortable-header category-header-resizable"
                      onClick={() => handleHeaderClick('category')}
                      style={{ width: columnWidths[2] }}
                    >
                      <div className="resize-handle resize-handle-left" onMouseDown={(e) => handleMouseDown(2, e)}></div>
                      {getChannelFinderTranslation(channelFinderI18n, language, 'table.headers.category')}
                      
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
                    {/* 리사이즈 핸들러 추가 - 구독자 컬럼 */}
                    <th 
                      className="sortable-header category-header-resizable"
                      onClick={() => handleHeaderClick('subscribers')}
                      style={{ width: columnWidths[3] }}
                    >
                      <div className="resize-handle resize-handle-left" onMouseDown={(e) => handleMouseDown(3, e)}></div>
                      {getChannelFinderTranslation(channelFinderI18n, language, 'table.headers.subscribers')}
                      {sortMenuOpen === 'subscribers' && (
                        <div className="sort-menu">
                          <div onClick={() => handleSort('subscribers', 'desc')}>{getChannelFinderTranslation(channelFinderI18n, language, 'table.sortOptions.highToLow')}</div>
                          <div onClick={() => handleSort('subscribers', 'asc')}>{getChannelFinderTranslation(channelFinderI18n, language, 'table.sortOptions.lowToHigh')}</div>
                        </div>
                      )}
                    </th>
                    {/* 리사이즈 핸들러 추가 - 연간성장 컬럼 */}
                    <th 
                      className="sortable-header category-header-resizable"
                      onClick={() => handleHeaderClick('yearlyGrowth')}
                      style={{ width: columnWidths[4] }}
                    >
                      <div className="resize-handle resize-handle-left" onMouseDown={(e) => handleMouseDown(4, e)}></div>
                      {getChannelFinderTranslation(channelFinderI18n, language, 'table.headers.yearlyGrowth')}
                      {sortMenuOpen === 'yearlyGrowth' && (
                        <div className="sort-menu">
                          <div onClick={() => handleSort('yearlyGrowth', 'desc')}>{getChannelFinderTranslation(channelFinderI18n, language, 'table.sortOptions.highToLow')}</div>
                          <div onClick={() => handleSort('yearlyGrowth', 'asc')}>{getChannelFinderTranslation(channelFinderI18n, language, 'table.sortOptions.lowToHigh')}</div>
                        </div>
                      )}
                    </th>
                    {/* 리사이즈 핸들러 추가 - 월간성장 컬럼 */}
                    <th 
                      className="sortable-header category-header-resizable"
                      onClick={() => handleHeaderClick('monthlyGrowth')}
                      style={{ width: columnWidths[5] }}
                    >
                      <div className="resize-handle resize-handle-left" onMouseDown={(e) => handleMouseDown(5, e)}></div>
                      {getChannelFinderTranslation(channelFinderI18n, language, 'table.headers.monthlyGrowth')}
                      {sortMenuOpen === 'monthlyGrowth' && (
                        <div className="sort-menu">
                          <div onClick={() => handleSort('monthlyGrowth', 'desc')}>{getChannelFinderTranslation(channelFinderI18n, language, 'table.sortOptions.highToLow')}</div>
                          <div onClick={() => handleSort('monthlyGrowth', 'asc')}>{getChannelFinderTranslation(channelFinderI18n, language, 'table.sortOptions.lowToHigh')}</div>
                        </div>
                      )}
                    </th>
                    {/* 리사이즈 핸들러 추가 - 일간성장 컬럼 */}
                    <th 
                      className="sortable-header category-header-resizable"
                      onClick={() => handleHeaderClick('dailyGrowth')}
                      style={{ width: columnWidths[6] }}
                    >
                      <div className="resize-handle resize-handle-left" onMouseDown={(e) => handleMouseDown(6, e)}></div>
                      {getChannelFinderTranslation(channelFinderI18n, language, 'table.headers.dailyGrowth')}
                      {sortMenuOpen === 'dailyGrowth' && (
                        <div className="sort-menu">
                          <div onClick={() => handleSort('dailyGrowth', 'desc')}>{getChannelFinderTranslation(channelFinderI18n, language, 'table.sortOptions.highToLow')}</div>
                          <div onClick={() => handleSort('dailyGrowth', 'asc')}>{getChannelFinderTranslation(channelFinderI18n, language, 'table.sortOptions.lowToHigh')}</div>
                        </div>
                      )}
                    </th>
                    {/* 리사이즈 핸들러 추가 - 구독전환율 컬럼 */}
                    <th 
                      className="sortable-header category-header-resizable"
                      onClick={() => handleHeaderClick('subscribersPerVideo')}
                      style={{ width: columnWidths[7] }}
                    >
                      <div className="resize-handle resize-handle-left" onMouseDown={(e) => handleMouseDown(7, e)}></div>
                      {getChannelFinderTranslation(channelFinderI18n, language, 'table.headers.subscriptionRate')}
                      {sortMenuOpen === 'subscribersPerVideo' && (
                        <div className="sort-menu">
                          <div onClick={() => handleSort('subscribersPerVideo', 'desc')}>{getChannelFinderTranslation(channelFinderI18n, language, 'table.sortOptions.highToLow')}</div>
                          <div onClick={() => handleSort('subscribersPerVideo', 'asc')}>{getChannelFinderTranslation(channelFinderI18n, language, 'table.sortOptions.lowToHigh')}</div>
                        </div>
                      )}
                    </th>
                    {/* 리사이즈 핸들러 추가 - 운영기간 컬럼 */}
                    <th 
                      className="sortable-header category-header-resizable"
                      onClick={() => handleHeaderClick('operatingPeriod')}
                      style={{ width: columnWidths[8] }}
                    >
                      <div className="resize-handle resize-handle-left" onMouseDown={(e) => handleMouseDown(8, e)}></div>
                      {getChannelFinderTranslation(channelFinderI18n, language, 'table.headers.operatingPeriod')}
                      {sortMenuOpen === 'operatingPeriod' && (
                        <div className="sort-menu">
                          <div onClick={() => handleSort('operatingPeriod', 'desc')}>{getChannelFinderTranslation(channelFinderI18n, language, 'table.sortOptions.highToLow')}</div>
                          <div onClick={() => handleSort('operatingPeriod', 'asc')}>{getChannelFinderTranslation(channelFinderI18n, language, 'table.sortOptions.lowToHigh')}</div>
                        </div>
                      )}
                    </th>
                    {/* 리사이즈 핸들러 추가 - 총조회수 컬럼 */}
                    <th 
                      className="sortable-header category-header-resizable"
                      onClick={() => handleHeaderClick('totalViews')}
                      style={{ width: columnWidths[9] }}
                    >
                      <div className="resize-handle resize-handle-left" onMouseDown={(e) => handleMouseDown(9, e)}></div>
                      {getChannelFinderTranslation(channelFinderI18n, language, 'table.headers.totalViews')}
                      {sortMenuOpen === 'totalViews' && (
                        <div className="sort-menu">
                          <div onClick={() => handleSort('totalViews', 'desc')}>{getChannelFinderTranslation(channelFinderI18n, language, 'table.sortOptions.highToLow')}</div>
                          <div onClick={() => handleSort('totalViews', 'asc')}>{getChannelFinderTranslation(channelFinderI18n, language, 'table.sortOptions.lowToHigh')}</div>
                        </div>
                      )}
                    </th>
                    {/* 리사이즈 핸들러 추가 - 평균조회수 컬럼 */}
                    <th 
                      className="sortable-header category-header-resizable"
                      onClick={() => handleHeaderClick('avgViews')}
                      style={{ width: columnWidths[10] }}
                    >
                      <div className="resize-handle resize-handle-left" onMouseDown={(e) => handleMouseDown(10, e)}></div>
                      {getChannelFinderTranslation(channelFinderI18n, language, 'table.headers.avgViews')}
                      {sortMenuOpen === 'avgViews' && (
                        <div className="sort-menu">
                          <div onClick={() => handleSort('avgViews', 'desc')}>{getChannelFinderTranslation(channelFinderI18n, language, 'table.sortOptions.highToLow')}</div>
                          <div onClick={() => handleSort('avgViews', 'asc')}>{getChannelFinderTranslation(channelFinderI18n, language, 'table.sortOptions.lowToHigh')}</div>
                        </div>
                      )}
                    </th>
                    <th 
                      className="sortable-header"
                      onClick={() => handleHeaderClick('videosCount')}
                    >
                      {getChannelFinderTranslation(channelFinderI18n, language, 'table.headers.totalVideos')}
                      {sortMenuOpen === 'videosCount' && (
                        <div className="sort-menu">
                          <div onClick={() => handleSort('videosCount', 'desc')}>{getChannelFinderTranslation(channelFinderI18n, language, 'table.sortOptions.highToLow')}</div>
                          <div onClick={() => handleSort('videosCount', 'asc')}>{getChannelFinderTranslation(channelFinderI18n, language, 'table.sortOptions.lowToHigh')}</div>
                        </div>
                      )}
                    </th>
                    <th 
                      className="sortable-header"
                      onClick={() => handleHeaderClick('uploadFrequency')}
                    >
                      {getChannelFinderTranslation(channelFinderI18n, language, 'table.headers.uploadFrequency')}
                      {sortMenuOpen === 'uploadFrequency' && (
                        <div className="sort-menu">
                          <div onClick={() => handleSort('uploadFrequency', 'desc')}>{getChannelFinderTranslation(channelFinderI18n, language, 'table.sortOptions.highToLow')}</div>
                          <div onClick={() => handleSort('uploadFrequency', 'asc')}>{getChannelFinderTranslation(channelFinderI18n, language, 'table.sortOptions.lowToHigh')}</div>
                        </div>
                      )}
                    </th>
                    <th className="sortable-header country-header">
                      <button 
                        className="country-select-button main-country-button"
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
                      className="channel-row"
                      onClick={() => handleChannelClick(channel)}
                    >
                      <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                      <td className="channel-name">
                        <span className="rank-badge">
                          {channel.thumbnailUrl && (
                            <img 
                              src={channel.thumbnailUrl} 
                              alt={channel.channelName}
                              className="rank-badge-img"
                            />
                          )}
                        </span>
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
                      <td className="country">{getCountryDisplayName(language, channel.country)}</td>
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
                    <span className="label">채널명</span>
                    <span className="value">{selectedChannel.channelName}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">{getChannelFinderTranslation(channelFinderI18n, language, 'sidebar.labels.category')}</span>
                    <span className="value">{selectedChannel.category}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">{getChannelFinderTranslation(channelFinderI18n, language, 'sidebar.labels.subscribers')}</span>
                    <span className="value">{formatSubscribers(selectedChannel.subscribers)}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">{getChannelFinderTranslation(channelFinderI18n, language, 'sidebar.labels.country')}</span>
                    <span className="value">{getCountryDisplayName(language, selectedChannel.country)}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">{getChannelFinderTranslation(channelFinderI18n, language, 'sidebar.labels.operatingPeriod')}</span>
                    <span className="value">{formatOperatingPeriod(selectedChannel.operatingPeriod)}</span>
                  </div>
                </div>

                {/* 구독자 성장 추이는 최소 3개월 데이터가 있을 때만 표시 */}
                {selectedChannel?.subscriberHistory && selectedChannel.subscriberHistory.length >= 3 && (
                  <div className="chart-section" style={{position: 'relative'}}>
                    <SubTitle>{getChannelFinderTranslation(channelFinderI18n, language, 'sidebar.subscriberGrowth')}</SubTitle>
                  <div className="chart-placeholder">
                    <div className="line-chart">
                      {chartData.length > 0 ? (
                        <svg width="100%" height="100" viewBox="0 0 300 100">
                          <defs>
                            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="0%" style={{stopColor: '#4fc3f7', stopOpacity: 0.3}} />
                              <stop offset="100%" style={{stopColor: '#4fc3f7', stopOpacity: 0.05}} />
                            </linearGradient>
                          </defs>
                          
                          {/* 동적으로 생성되는 선 그래프와 포인트 */}
                          {chartData.length > 1 && (
                            <>
                              {/* 그라데이션 영역 */}
                              <path 
                                d={`M ${chartData[0].x} ${chartData[0].y} ${chartData.slice(1).map(point => `L ${point.x} ${point.y}`).join(' ')} L ${chartData[chartData.length-1].x} 100 L ${chartData[0].x} 100 Z`}
                                fill="url(#areaGradient)"
                              />
                              {/* 선 그래프 */}
                              <path 
                                d={`M ${chartData[0].x} ${chartData[0].y} ${chartData.slice(1).map(point => `L ${point.x} ${point.y}`).join(' ')}`}
                                stroke="#4fc3f7" 
                                strokeWidth="3" 
                                fill="none"
                                className="growth-line"
                              />
                            </>
                          )}
                          
                          {/* 데이터 포인트와 라벨 */}
                          {chartData.map((point, index) => (
                            <g key={index}>
                              <circle cx={point.x} cy={point.y} r="4" fill="#4fc3f7" />
                              <text x={point.x} y={point.y - 8} textAnchor="middle" className="growth-percentage">
                                {point.value}
                              </text>
                            </g>
                          ))}
                        </svg>
                      ) : (
                        <div className="no-data-message">{getChannelFinderTranslation(channelFinderI18n, language, 'sidebar.noSubscriberData')}</div>
                      )}
                    </div>
                    <div className="chart-labels" style={{ position: 'relative', height: '20px', width: '100%' }}>
                      {chartData.map((point, index) => {
                        // SVG 300px 기준으로 퍼센트 계산 후 적용 + 20px 오프셋 (30px에서 10px 왼쪽으로)
                        const leftPercentage = ((point.x + 20) / 300) * 100;
                        return (
                          <span 
                            key={index} 
                            style={{ 
                              position: 'absolute', 
                              left: `${leftPercentage}%`,
                              transform: 'translateX(-50%)',
                              fontSize: '0.8rem',
                              color: '#666'
                            }}
                          >
                            {point.month}
                          </span>
                        );
                      })}
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
                )}

                <div className="rpm-section">
                  <SubTitle>{getChannelFinderTranslation(channelFinderI18n, language, 'sidebar.revenueCalculation')}</SubTitle>
                  
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
                        <span>{getCountryDisplayName(language, currentCountry)}</span>
                        <svg className={`dropdown-arrow ${dropdownState.isOpen && dropdownState.type === 'sidebar' ? 'open' : ''}`} width="16" height="16" viewBox="0 0 20 20">
                          <path stroke="#666" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="m6 8 4 4 4-4"/>
                        </svg>
                      </button>
                    </div>
                    
                    {/* 환율 입력 섹션 (미국이 아닐 때만 표시) */}
                    {currentCountry !== 'United States' && (
                      <div className="exchange-rate-section">
                        <div className="country-selector">
                          <label className="country-label">{getChannelFinderTranslation(channelFinderI18n, language, 'units.exchangeRate')}</label>
                          <div className="exchange-rate-input-wrapper">
                            <input
                              type="number"
                              className="exchange-rate-input"
                              value={exchangeRate}
                              onChange={(e) => setExchangeRate(Number(e.target.value))}
                              placeholder={getChannelFinderTranslation(channelFinderI18n, language, 'units.exchangeRatePlaceholder')}
                              min="0"
                              step="0.01"
                            />
                            <span className="currency-unit">
                              {(() => {
                                const currencyCode = currencyExchangeData[currentCountry as keyof typeof currencyExchangeData]?.currency || 'USD';
                                return getChannelFinderTranslation(channelFinderI18n, language, `currencies.${currencyCode}`) || '달러';
                              })()}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                    
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
                          <div className="revenue-label">{getChannelFinderTranslation(channelFinderI18n, language, 'sidebar.totalShortsRevenue')}</div>
                          <div className="revenue-value">
                            {selectedChannel ? formatRevenue(Math.round((selectedChannel.totalViews * (shortsPercentage / 100) / 1000) * shortsRpm * exchangeRate)) : formatRevenue(0)}
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
                          <div className="revenue-label">{getChannelFinderTranslation(channelFinderI18n, language, 'sidebar.totalLongRevenue')}</div>
                          <div className="revenue-value">
                            {selectedChannel ? formatRevenue(Math.round((selectedChannel.totalViews * (longPercentage / 100) / 1000) * longRpm * exchangeRate)) : formatRevenue(0)}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="total-revenue-card">
                      <div className="total-revenue-label">{getChannelFinderTranslation(channelFinderI18n, language, 'sidebar.totalRevenue')}</div>
                      <div className="total-revenue-value">{calculateTotalRevenue()}</div>
                    </div>
                    
                    {language !== 'en' && (
                      <div 
                        className="total-revenue-card korean-currency-hover"
                        onClick={openExchangeRateModal}
                      >
                        <div className="total-revenue-label">
                          {getChannelFinderTranslation(channelFinderI18n, language, 'sidebar.localCurrencyText')}
                        </div>
                        <div className="total-revenue-value">{calculateLocalCurrencyRevenue()}</div>
                      </div>
                    )}
                  </div>
                </div>

                <SubTitle>{getChannelFinderTranslation(channelFinderI18n, language, 'sidebar.detailInfo')}</SubTitle>
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-label">{getChannelFinderTranslation(channelFinderI18n, language, 'sidebar.labels.totalViews')}</div>
                    <div className="stat-value">{formatViews(selectedChannel.totalViews)}</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">{getChannelFinderTranslation(channelFinderI18n, language, 'sidebar.labels.avgViews')}</div>
                    <div className="stat-value">{formatViews(selectedChannel.avgViews)}</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">{getChannelFinderTranslation(channelFinderI18n, language, 'sidebar.labels.totalVideos')}</div>
                    <div className="stat-value">{formatVideosCount(selectedChannel.videosCount)}</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">{getChannelFinderTranslation(channelFinderI18n, language, 'sidebar.labels.uploadFrequency')}</div>
                    <div className="stat-value">{formatUploadFrequency(selectedChannel.uploadFrequency)}</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">{getChannelFinderTranslation(channelFinderI18n, language, 'sidebar.labels.monthlyGrowth')}</div>
                    <div className="stat-value growth-value">{formatGrowth(selectedChannel.monthlyGrowth)}</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">{getChannelFinderTranslation(channelFinderI18n, language, 'sidebar.labels.yearlyGrowth')}</div>
                    <div className="stat-value growth-value">{formatGrowth(selectedChannel.yearlyGrowth)}</div>
                  </div>
                  <div 
                    className="stat-card tooltip-container"
                    onMouseEnter={() => setHoveredStat('views-per-subscriber')}
                    onMouseLeave={() => setHoveredStat(null)}
                  >
                    <div className="stat-label">{getChannelFinderTranslation(channelFinderI18n, language, 'sidebar.labels.viewsPerSubscriber')}</div>
                    <div className="stat-value">{calculateViewsPerSubscriber(selectedChannel)}</div>
                    {hoveredStat === 'views-per-subscriber' && (
                      <div className="stat-tooltip" dangerouslySetInnerHTML={{__html: getChannelFinderTranslation(channelFinderI18n, language, 'tooltips.viewsPerSubscriber')}} />
                    )}
                  </div>
                  <div 
                    className="stat-card tooltip-container"
                    onMouseEnter={() => setHoveredStat('subscription-rate')}
                    onMouseLeave={() => setHoveredStat(null)}
                  >
                    <div className="stat-label">{getChannelFinderTranslation(channelFinderI18n, language, 'sidebar.labels.subscriptionRate')}</div>
                    <div className="stat-value">{calculateSubscriptionRate(selectedChannel)}</div>
                    {hoveredStat === 'subscription-rate' && (
                      <div className="stat-tooltip" dangerouslySetInnerHTML={{__html: getChannelFinderTranslation(channelFinderI18n, language, 'tooltips.subscriptionRate')}} />
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
          width: 90%;
          margin: 0 auto 1rem auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
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
          width: 90%;
          margin: 0 auto;
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

        /* 카테고리 헤더 리사이즈 핸들러 스타일 */
        .category-header-resizable {
          position: relative;
        }

        .resize-handle {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 8px;
          height: 16px;
          cursor: col-resize;
          opacity: 1 !important;
          transition: opacity 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 999;
          right: -4px; /* 기본은 오른쪽 */
        }

        /* 왼쪽 핸들러 - 더 구체적인 선택자로 강제 적용 */
        .category-header-resizable .resize-handle.resize-handle-left,
        th .resize-handle.resize-handle-left {
          width: 12px !important;
          height: 20px !important;
          z-index: 0 !important;
          opacity: 1 !important;
        }

        .resize-handle-left::before {
          content: '';
          width: 1px;
          height: 12px;
          background-color: #1976d2;
          margin-right: 1px;
          box-shadow: 2px 0 0 #1976d2, 4px 0 0 #1976d2;
        }

        /* 카테고리 헤더 hover 시 핸들러 표시 */
        .category-header-resizable:hover .resize-handle {
          opacity: 0.7;
        }

        .resize-handle:hover {
          opacity: 1 !important;
        }

        /* 리사이즈 중일 때 커서 변경 */
        body.resizing {
          cursor: col-resize !important;
          user-select: none;
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
          min-width: 24px;
          min-height: 24px;
          background: #333;
          color: white;
          border-radius: 50%;
          font-size: 0.8rem;
          font-weight: bold;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          flex-shrink: 0;
        }

        .rank-badge-img {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          object-fit: cover;
          border: none;
        }

        .channel-name .name {
          max-width: 120px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
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

        /* 환율 입력 섹션 */
        .exchange-rate-section {
          margin-top: 1rem;
          margin-bottom: 1.5rem;
        }

        .exchange-rate-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          width: 100%;
          flex: 1;
        }

        .exchange-rate-input {
          flex: 0.4;
          padding: 0.4rem 0.6rem;
          border: 1px solid #ddd;
          border-radius: 12px;
          background: white;
          font-size: 0.85rem;
          color: #333;
          cursor: text;
          height: 48px;
          margin-right: 10px;
          transition: border-color 0.2s ease;
        }

        /* 브라우저 기본 number input 화살표 제거 */
        .exchange-rate-input::-webkit-outer-spin-button,
        .exchange-rate-input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }

        .exchange-rate-input[type=number] {
          -moz-appearance: textfield;
        }

        .exchange-rate-input:hover {
          border-color: #999;
        }

        .exchange-rate-input:focus {
          border-color: #7c4dff;
          box-shadow: 0 0 0 2px rgba(124, 77, 255, 0.1);
          outline: none;
        }

        .currency-unit {
          flex-shrink: 0;
          font-size: 0.85rem;
          font-weight: 400;
          color: #666;
          white-space: nowrap;
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

        /* Pagination Styles - VidHunt News Design */
        .pagination {
          display: flex;
          justify-content: center;
          gap: var(--spacing-1, 8px);
          margin-top: 50px;
        }

        .pagination-btn {
          width: 40px;
          height: 40px;
          border: none;
          background: transparent;
          color: #374151;
          border-radius: 50%;
          cursor: pointer;
          transition: all var(--transition-fast, 0.2s ease);
          font-weight: 500;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .pagination-btn:hover {
          background-color: #f3f4f6;
        }

        .pagination-btn.active {
          background-color: #7c3aed;
          color: white;
          border: 1px solid #7c3aed;
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

          .pagination {
            gap: 6px;
            margin-top: 30px;
          }

          .pagination-btn {
            width: 32px;
            height: 32px;
            font-size: 14px;
          }
        }

        /* 한국 화폐 변환 호버 효과 */
        .korean-currency-hover {
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .korean-currency-hover:hover {
          background-color: #f5f5f5 !important;
          transform: translateY(-1px);
        }

        /* 환율 모달 스타일 */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 3000;
        }

        .exchange-rate-modal {
          background: white;
          border-radius: 12px;
          width: 400px;
          overflow: hidden;
        }

        .modal-header {
          padding: 20px 24px 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-header h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: #333;
        }

        .modal-close {
          background: none;
          border: 1px solid transparent;
          font-size: 28px;
          color: #666;
          cursor: pointer;
          padding: 0;
          width: 34px;
          height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: background-color 0.2s;
        }

        .modal-close:hover {
          background-color: #f5f5f5;
        }

        .modal-content {
          padding: 24px;
          text-align: center;
          box-shadow: none !important;
        }

        .exchange-rate-display {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          font-size: 20px;
          color: #333;
        }

        .exchange-rate-input {
          border: 2px solid #e9ecef;
          border-radius: 12px;
          padding: 12px 16px;
          font-size: 20px;
          width: 120px;
          text-align: center;
          outline: none;
          transition: border-color 0.2s;
        }

        .exchange-rate-input:focus {
          border-color: #7c4dff;
        }

        .modal-footer {
          padding: 16px 24px 24px;
          display: flex;
          gap: 12px;
          justify-content: center;
        }

        .confirm-btn, .cancel-btn {
          padding: 10px 24px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          border: none;
          transition: all 0.2s;
        }

        .confirm-btn {
          background: #7c4dff;
          color: white;
        }

        .confirm-btn:hover {
          background: #6a3de8;
        }

        .cancel-btn {
          background: #f8f9fa;
          color: #666;
          border: 1px solid #e9ecef;
        }

        .cancel-btn:hover {
          background: #e9ecef;
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

      {/* 환율 설정 모달 */}
      {exchangeRateModalOpen && (
        <div className="modal-overlay" onClick={closeExchangeRateModal}>
          <div className="exchange-rate-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>환율 설정</h3>
              <button className="modal-close" onClick={closeExchangeRateModal}>×</button>
            </div>
            <div className="modal-content">
              <div className="exchange-rate-display">
                <span>$ 1 = </span>
                <input 
                  type="number" 
                  value={tempExchangeRate}
                  onChange={(e) => setTempExchangeRate(Number(e.target.value))}
                  className="exchange-rate-input"
                />
                <span>{currencySettings[language]?.symbol || '원'}</span>
              </div>
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={closeExchangeRateModal}>취소</button>
              <button className="confirm-btn" onClick={applyExchangeRate}>확인</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChannelFinder;