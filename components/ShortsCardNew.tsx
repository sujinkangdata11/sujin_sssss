import React from 'react';
import { YouTubeShort, Language } from '../types';

interface ShortsCardNewProps {
  short: YouTubeShort;
  language: Language;
  index: number;
}

const ShortsCardNew: React.FC<ShortsCardNewProps> = ({ short, language, index }) => {
  const [showAllTags, setShowAllTags] = React.useState(false);
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [isCopied, setIsCopied] = React.useState(false);
  const [showTooltip, setShowTooltip] = React.useState(false);
  const [rpmRate, setRpmRate] = React.useState(() => {
    // 1차: 실제 채널 국가 정보 기반 RPM (2024년 실제 데이터)
    if (short.channelCountry) {
      const countryCode = short.channelCountry.toUpperCase();
      const rpmMap: Record<string, number> = {
        'US': 0.33,    // 미국
        'CH': 0.21,    // 스위스
        'AU': 0.19,    // 호주
        'KR': 0.19,    // 한국
        'GB': 0.17,    // 영국
        'CA': 0.17,    // 캐나다
        'DE': 0.16,    // 독일
        'HK': 0.15,    // 홍콩
        'JP': 0.14,    // 일본
        'TW': 0.14,    // 대만
        'AT': 0.14,    // 오스트리아
        'NZ': 0.11,    // 뉴질랜드
        'FR': 0.10,    // 프랑스
        'BR': 0.05,    // 브라질
        'MX': 0.04,    // 멕시코
        'TR': 0.02,    // 터키
        'PH': 0.02,    // 필리핀
        'ID': 0.01,    // 인도네시아
        'IN': 0.01,    // 인도
        'VN': 0.02,    // 베트남
        'PK': 0.03,    // 파키스탄
        'ES': 0.08     // 스페인
      };
      return rpmMap[countryCode] || 0.08; // 기타 국가 기본값
    }
    
    // 2차: 제목 언어로 추정
    const hasKorean = /[ㄱ-ㅎㅏ-ㅣ가-힣]/.test(short.title);
    if (hasKorean) return 0.19; // 한국
    
    // 3차: 글로벌 (국가 정보 없음)
    return 0.10; // 글로벌 평균
  });
  // 참여율 계산 (좋아요+댓글)/조회수×10,000 (1만뷰 기준)
  const calculateEngagementRate = (): number => {
    if (short.viewCount === 0) return 0;
    const likes = short.likeCount || 0;
    const comments = short.commentCount || 0;
    return ((likes + comments) / short.viewCount) * 10000;
  };

  const engagementRate = calculateEngagementRate();

  // 숫자 포맷팅 함수
  const formatNumber = (num: number): string => {
    if (language === 'ko') {
      if (num >= 100000000) return `${(num / 100000000).toFixed(1)}억`;
      if (num >= 10000) return `${Math.floor(num / 10000)}만`;
      if (num >= 1000) return `${(num / 1000).toFixed(1)}천`;
      return num.toLocaleString();
    }
    return num.toLocaleString();
  };

  // 평균 조회수 계산
  const calculateAverageViews = (): number => {
    if (!short.channelViewCount || !short.videoCount || short.videoCount === 0) return 0;
    return Math.round(short.channelViewCount / short.videoCount);
  };

  const averageViews = calculateAverageViews();

  // 수익 계산 함수들
  const calculateChannelDuration = () => {
    if (!short.channelPublishedAt) return '1개월';
    const channelStartDate = new Date(short.channelPublishedAt);
    const now = new Date();
    const diffMonths = Math.ceil((now.getTime() - channelStartDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
    if (diffMonths >= 12) {
      const years = Math.floor(diffMonths / 12);
      const remainingMonths = diffMonths % 12;
      return remainingMonths === 0 ? `${years}년` : `${years}년 ${remainingMonths}개월`;
    }
    return `${diffMonths}개월`;
  };

  const calculateVideoRevenue = () => (short.viewCount / 1000) * rpmRate;
  const calculateChannelRevenue = () => short.channelViewCount ? (short.channelViewCount / 1000) * rpmRate : 0;
  const formatRevenue = (revenue: number) => {
    const won = revenue * 1300;
    if (won >= 100000000) {
      const eok = Math.floor(won / 100000000);
      const man = Math.floor((won % 100000000) / 10000);
      return man > 0 ? `${eok}억 ${man}만원` : `${eok}억원`;
    }
    if (won >= 10000) return `${Math.floor(won / 10000)}만원`;
    return `${Math.floor(won).toLocaleString()}원`;
  };

  // YouTube 카테고리 ID를 실제 카테고리명으로 변환
  const getCategoryName = (categoryId: string | undefined): string => {
    if (!categoryId) return '인물/블로그';
    
    const categoryMap: Record<string, string> = {
      '1': '영화/애니메이션',
      '2': '자동차/차량',
      '10': '음악',
      '15': '애완동물/동물',
      '17': '스포츠',
      '19': '여행/이벤트',
      '20': '게임',
      '22': '인물/블로그',
      '23': '코미디',
      '24': '엔터테인먼트',
      '25': '뉴스/정치',
      '26': '하우투/스타일',
      '27': '교육',
      '28': '과학/기술',
      '29': '비영리/활동'
    };
    
    return categoryMap[categoryId] || `카테고리 ${categoryId}`;
  };

  // 채널 국가 정보를 실제 API 데이터로 변환
  const detectCountryFromChannel = (): string => {
    console.log(`🔍 Card country check for ${short.channelTitle}: channelCountry=${short.channelCountry}`);
    
    // 1차: API에서 가져온 실제 채널 국가 사용
    if (short.channelCountry) {
      const countryCode = short.channelCountry.toUpperCase();
      const countryMap: Record<string, { flag: string; names: Record<Language, string> }> = {
        'US': { flag: '🇺🇸', names: { en: 'United States', ko: '미국', ja: 'アメリカ', zh: '美国', hi: 'संयुक्त राज्य अमेरिका', es: 'Estados Unidos', fr: 'États-Unis', de: 'Vereinigte Staaten', nl: 'Verenigde Staten', pt: 'Estados Unidos', ru: 'США' } },
        'KR': { flag: '🇰🇷', names: { en: 'South Korea', ko: '한국', ja: '韓国', zh: '韩国', hi: 'दक्षिण कोरिया', es: 'Corea del Sur', fr: 'Corée du Sud', de: 'Südkorea', nl: 'Zuid-Korea', pt: 'Coreia do Sul', ru: 'Южная Корея' } },
        'JP': { flag: '🇯🇵', names: { en: 'Japan', ko: '일본', ja: '日本', zh: '日本', hi: 'जापान', es: 'Japón', fr: 'Japon', de: 'Japan', nl: 'Japan', pt: 'Japão', ru: 'Япония' } },
        'KZ': { flag: '🇰🇿', names: { en: 'Kazakhstan', ko: '카자흐스탄', ja: 'カザフスタン', zh: '哈萨克斯坦', hi: 'कज़ाख़िस्तान', es: 'Kazajistán', fr: 'Kazakhstan', de: 'Kasachstan', nl: 'Kazachstan', pt: 'Cazaquistão', ru: 'Казахстан' } },
        'CN': { flag: '🇨🇳', names: { en: 'China', ko: '중국', ja: '中国', zh: '中国', hi: 'चीन', es: 'China', fr: 'Chine', de: 'China', nl: 'China', pt: 'China', ru: 'Китай' } },
        'GB': { flag: '🇬🇧', names: { en: 'United Kingdom', ko: '영국', ja: 'イギリス', zh: '英国', hi: 'यूनाइटेड किंगडम', es: 'Reino Unido', fr: 'Royaume-Uni', de: 'Vereinigtes Königreich', nl: 'Verenigd Koninkrijk', pt: 'Reino Unido', ru: 'Великобритания' } },
        'CA': { flag: '🇨🇦', names: { en: 'Canada', ko: '캐나다', ja: 'カナダ', zh: '加拿大', hi: 'कनाडा', es: 'Canadá', fr: 'Canada', de: 'Kanada', nl: 'Canada', pt: 'Canadá', ru: 'Канада' } },
        'AU': { flag: '🇦🇺', names: { en: 'Australia', ko: '호주', ja: 'オーストラリア', zh: '澳大利亚', hi: 'ऑस्ट्रेलिया', es: 'Australia', fr: 'Australie', de: 'Australien', nl: 'Australië', pt: 'Austrália', ru: 'Австралия' } },
        'DE': { flag: '🇩🇪', names: { en: 'Germany', ko: '독일', ja: 'ドイツ', zh: '德国', hi: 'जर्मनी', es: 'Alemania', fr: 'Allemagne', de: 'Deutschland', nl: 'Duitsland', pt: 'Alemanha', ru: 'Германия' } },
        'FR': { flag: '🇫🇷', names: { en: 'France', ko: '프랑스', ja: 'フランス', zh: '法国', hi: 'फ़्रांस', es: 'Francia', fr: 'France', de: 'Frankreich', nl: 'Frankrijk', pt: 'França', ru: 'Франция' } },
        'IN': { flag: '🇮🇳', names: { en: 'India', ko: '인도', ja: 'インド', zh: '印度', hi: 'भारत', es: 'India', fr: 'Inde', de: 'Indien', nl: 'India', pt: 'Índia', ru: 'Índия' } },
        'CH': { flag: '🇨🇭', names: { en: 'Switzerland', ko: '스위스', ja: 'スイス', zh: '瑞士', hi: 'स्विट्जरलैंड', es: 'Suiza', fr: 'Suisse', de: 'Schweiz', nl: 'Zwitserland', pt: 'Suíça', ru: 'Швейцария' } },
        'HK': { flag: '🇭🇰', names: { en: 'Hong Kong', ko: '홍콩', ja: '香港', zh: '香港', hi: 'हांगकांग', es: 'Hong Kong', fr: 'Hong Kong', de: 'Hongkong', nl: 'Hongkong', pt: 'Hong Kong', ru: 'Гонконг' } },
        'TW': { flag: '🇹🇼', names: { en: 'Taiwan', ko: '대만', ja: '台湾', zh: '台湾', hi: 'ताइवान', es: 'Taiwán', fr: 'Taïwan', de: 'Taiwan', nl: 'Taiwan', pt: 'Taiwan', ru: 'Тайвань' } },
        'AT': { flag: '🇦🇹', names: { en: 'Austria', ko: '오스트리아', ja: 'オーストリア', zh: '奥地利', hi: 'ऑस्ट्रिया', es: 'Austria', fr: 'Autriche', de: 'Österreich', nl: 'Oostenrijk', pt: 'Áustria', ru: 'Австрия' } },
        'NZ': { flag: '🇳🇿', names: { en: 'New Zealand', ko: '뉴질랜드', ja: 'ニュージーランド', zh: '新西兰', hi: 'न्यूजीलैंड', es: 'Nueva Zelanda', fr: 'Nouvelle-Zélande', de: 'Neuseeland', nl: 'Nieuw-Zeeland', pt: 'Nova Zelândia', ru: 'Новая Зеландия' } },
        'BR': { flag: '🇧🇷', names: { en: 'Brazil', ko: '브라질', ja: 'ブラジル', zh: '巴西', hi: 'ब्राजील', es: 'Brasil', fr: 'Brésil', de: 'Brasilien', nl: 'Brazilië', pt: 'Brasil', ru: 'Бразилия' } },
        'MX': { flag: '🇲🇽', names: { en: 'Mexico', ko: '멕시코', ja: 'メキシコ', zh: '墨西哥', hi: 'मेक्सिको', es: 'México', fr: 'Mexique', de: 'Mexiko', nl: 'Mexico', pt: 'México', ru: 'Мексика' } },
        'TR': { flag: '🇹🇷', names: { en: 'Turkey', ko: '터키', ja: 'トルコ', zh: '土耳其', hi: 'तुर्की', es: 'Turquía', fr: 'Turquie', de: 'Türkei', nl: 'Turkije', pt: 'Turquia', ru: 'Турция' } },
        'PH': { flag: '🇵🇭', names: { en: 'Philippines', ko: '필리핀', ja: 'フィリピン', zh: '菲律宾', hi: 'फिलीपींस', es: 'Filipinas', fr: 'Philippines', de: 'Philippinen', nl: 'Filipijnen', pt: 'Filipinas', ru: 'Филиппины' } },
        'ID': { flag: '🇮🇩', names: { en: 'Indonesia', ko: '인도네시아', ja: 'インドネシア', zh: '印度尼西亚', hi: 'इंडोनेशिया', es: 'Indonesia', fr: 'Indonésie', de: 'Indonesien', nl: 'Indonesië', pt: 'Indonésia', ru: 'Индонезия' } },
        'VN': { flag: '🇻🇳', names: { en: 'Vietnam', ko: '베트남', ja: 'ベトナム', zh: '越南', hi: 'वियतनाम', es: 'Vietnam', fr: 'Vietnam', de: 'Vietnam', nl: 'Vietnam', pt: 'Vietnã', ru: 'Вьетнам' } },
        'PK': { flag: '🇵🇰', names: { en: 'Pakistan', ko: '파키스탄', ja: 'パキスタン', zh: '巴基斯坦', hi: 'पाकिस्तान', es: 'Pakistán', fr: 'Pakistan', de: 'Pakistan', nl: 'Pakistan', pt: 'Paquistão', ru: 'Пакистан' } },
        'ES': { flag: '🇪🇸', names: { en: 'Spain', ko: '스페인', ja: 'スペイン', zh: '西班牙', hi: 'स्पेन', es: 'España', fr: 'Espagne', de: 'Spanien', nl: 'Spanje', pt: 'Espanha', ru: 'Испания' } }
      };
      
      const country = countryMap[countryCode];
      if (country) {
        const countryName = country.names[language] || country.names.en;
        return `${country.flag} ${countryName}`;
      }
    }
    
    // 2차: 제목 언어로 추정 (fallback)
    const title = short.title.toLowerCase();
    if (/[ㄱ-ㅎㅏ-ㅣ가-힣]/.test(title)) {
      return language === 'en' ? '🇰🇷 South Korea' : '🇰🇷 한국';
    }
    
    // 기본값: 글로벌 (국가 정보 없음)
    return language === 'en' ? '🌍 Global' : language === 'ko' ? '🌍 글로벌' : '🌍 Global';
  };

  // 기존 ShortsCard의 timeAgo 함수 복사
  const timeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    type Unit = 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second';
    const units: Record<Language, Record<string, string>> = {
      en: { year: 'year', month: 'month', day: 'day', hour: 'hour', minute: 'minute', second: 'second', plural: 's', ago: 'ago' },
      ko: { year: '년', month: '개월', day: '일', hour: '시간', minute: '분', second: '초', plural: '', ago: '전' },
      ja: { year: '年', month: 'ヶ月', day: '日', hour: '時間', minute: '分', second: '秒', plural: '', ago: '前' },
      zh: { year: '年', month: '个月', day: '天', hour: '小时', minute: '分钟', second: '秒', plural: '', ago: '前' },
      hi: { year: 'साल', month: 'महीने', day: 'दिन', hour: 'घंटा', minute: 'मिनट', second: 'सेकंड', plural: '', ago: 'पहले' },
      es: { year: 'año', month: 'mes', day: 'día', hour: 'hora', minute: 'minuto', second: 'segundo', plural: 's', ago: 'hace' },
      fr: { year: 'an', month: 'mois', day: 'jour', hour: 'heure', minute: 'minute', second: 'seconde', plural: 's', ago: 'il y a' },
      de: { year: 'Jahr', month: 'Monat', day: 'Tag', hour: 'Stunde', minute: 'Minute', second: 'Sekunde', plural: 'en', ago: 'vor' },
      nl: { year: 'jaar', month: 'maand', day: 'dag', hour: 'uur', minute: 'minuut', second: 'seconde', plural: 'en', ago: 'geleden' },
      pt: { year: 'ano', month: 'mês', day: 'dia', hour: 'hora', minute: 'minuto', second: 'segundo', plural: 's', ago: 'atrás' },
      ru: { year: 'год', month: 'месяц', day: 'день', hour: 'час', minute: 'минуту', second: 'секунду', ago: 'назад' },
    };

    const t = units[language] || units.en;

    const format = (value: number, unit: Unit) => {
      if (language === 'ru') {
        let form = '';
        if (unit === 'year') form = (value === 1) ? 'год' : (value < 5 ? 'года' : 'лет');
        else if (unit === 'month') form = (value === 1) ? 'месяц' : (value < 5 ? 'месяца' : 'месяцев');
        else if (unit === 'day') form = (value === 1) ? 'день' : (value < 5 ? 'дня' : 'дней');
        else if (unit === 'hour') form = (value === 1) ? 'час' : (value < 5 ? 'часа' : 'часов');
        else if (unit === 'minute') form = (value === 1) ? 'минута' : (value < 5 ? 'минуты' : 'минут');
        else form = (value === 1) ? 'секунда' : (value < 5 ? 'секунды' : 'секунд');
        return `${value} ${form} ${t.ago}`;
      }
      const plural = value > 1 ? (t.plural || '') : '';
      if(language === 'es' || language === 'fr' || language === 'pt') {
        return `${t.ago} ${value} ${t[unit]}${plural}`;
      }
      return `${value} ${t[unit]}${plural} ${t.ago}`;
    };

    const intervals: { limit: number; unit: Unit }[] = [
      { limit: 31536000, unit: 'year' },
      { limit: 2592000, unit: 'month' },
      { limit: 86400, unit: 'day' },
      { limit: 3600, unit: 'hour' },
      { limit: 60, unit: 'minute' },
    ];

    for (const interval of intervals) {
      const count = Math.floor(seconds / interval.limit);
      if (count >= 1) {
        return format(count, interval.unit);
      }
    }

    return format(seconds, 'second');
  };

  return (
    <div style={{
      border: '1px solid #e0e0e0',
      borderRadius: '12px',
      overflow: 'hidden',
      backgroundColor: 'white',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      width: '280px',
      minHeight: '950px',
      display: 'flex',
      flexDirection: 'column',
      transition: 'height 0.3s ease'
    }}>
      {/* 썸네일 영역 */}
      <div 
        style={{ position: 'relative', paddingBottom: '56.25%', backgroundColor: '#f0f0f0', cursor: 'pointer' }}
        onClick={() => window.open(`https://www.youtube.com/shorts/${short.id}`, '_blank')}
      >
        <img
          src={short.thumbnailUrl}
          alt={short.title}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />
        {short.duration && (
          <div style={{
            position: 'absolute',
            bottom: '8px',
            right: '8px',
            backgroundColor: 'rgba(0,0,0,0.8)',
            color: 'white',
            padding: '2px 6px',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: 'bold'
          }}>
            {short.duration}
          </div>
        )}
      </div>

      {/* 콘텐츠 영역 */}
      <div style={{ padding: '16px', flex: 1 }}>
        {/* 제목 */}
        <h3 style={{
          margin: '0 0 8px 0',
          fontSize: '16px',
          fontWeight: 'bold',
          lineHeight: '1.3',
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          color: '#323545'
        }}>
          {short.title}
        </h3>

        {/* 채널명 */}
        <p style={{
          margin: '0 0 8px 0',
          color: '#323545',
          fontSize: '14px'
        }}>
          @ {short.channelTitle}
        </p>


        <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '16px 0' }} />

        {/* 상단 통계 3개 열 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '16px',
          marginBottom: '16px',
          textAlign: 'center'
        }}>
          <div>
            <div style={{ fontSize: '12px', color: '#323545', marginBottom: '8px' }}>구독자</div>
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#323545' }}>
              {short.subscriberCount ? formatNumber(short.subscriberCount) : 'N/A'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#323545', marginBottom: '8px' }}>조회수</div>
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'rgb(124, 58, 237)' }}>
              {formatNumber(short.viewCount)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#323545', marginBottom: '8px' }}>업로드</div>
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'rgb(124, 58, 237)' }}>
              {timeAgo(short.publishedAt)}
            </div>
          </div>
        </div>


        {/* 좋아요, 댓글 2개 열 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '32px',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          <div>
            <div style={{ fontSize: '21px', marginBottom: '4px' }}>❤️</div>
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#323545' }}>
              {short.likeCount ? formatNumber(short.likeCount) : 'N/A'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '20px', marginBottom: '4px' }}>💬</div>
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#323545' }}>
              {short.commentCount ? formatNumber(short.commentCount) : 'N/A'}
            </div>
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '16px 0' }} />

        {/* 분석 정보 */}
        <div style={{ fontSize: '13px', lineHeight: '1.8', color: '#323545' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span>국가</span>
            <span style={{ fontWeight: 'bold' }}>
              {detectCountryFromChannel()}
            </span>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span>카테고리</span>
            <span style={{ fontWeight: 'bold' }}>
              {getCategoryName(short.categoryId)}
            </span>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span>총 영상</span>
            <span style={{ fontWeight: 'bold' }}>
              {short.videoCount ? formatNumber(short.videoCount) + '개' : 'N/A'}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span>총 조회수</span>
            <span style={{ fontWeight: 'bold' }}>
              {short.channelViewCount ? formatNumber(short.channelViewCount) : 'N/A'}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span>평균 조회수</span>
            <span style={{ fontWeight: 'bold', color: 'rgb(124, 58, 237)' }}>
              {averageViews > 0 ? formatNumber(averageViews) : 'N/A'}
            </span>
          </div>

          {/* 구독자 대비 조회수 - 프로그레스 바 */}
          {short.viewsPerSubscriber && (
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ color: '#323545', fontSize: '13px' }}>구독자 대비 조회수</span>
                <span style={{ fontWeight: 'bold', color: 'rgb(124, 58, 237)', fontSize: '13px' }}>
                  {short.viewsPerSubscriber.toFixed(0)}%
                </span>
              </div>
              
              {/* 구독자 대비 조회수 프로그래스 바 */}
              <div style={{
                width: '100%',
                height: '8px',
                backgroundColor: '#e0e0e0',
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${Math.min((short.viewsPerSubscriber / 1000) * 100, 100)}%`, // 1,000%를 최대값으로 설정
                  height: '100%',
                  backgroundColor: 'rgb(124, 58, 237)',
                  transition: 'width 0.3s ease'
                }} />
              </div>
            </div>
          )}

          {/* 참여율 */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span>참여율</span>
              <span style={{ fontWeight: 'bold' }}>{engagementRate.toFixed(2)}%</span>
            </div>
            
            {/* 참여율 프로그래스 바 */}
            <div style={{
              width: '100%',
              height: '8px',
              backgroundColor: '#e0e0e0',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${Math.min((engagementRate / 100) * 100, 100)}%`, // 100%를 최대로 스케일링
                height: '100%',
                backgroundColor: 'rgb(124, 58, 237)',
                transition: 'width 0.3s ease'
              }} />
            </div>
          </div>
        </div>

        {/* 태그들 */}
        <div style={{ marginTop: '16px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <div style={{
              display: 'flex',
              flexWrap: 'nowrap',
              gap: '6px',
              flex: 1,
              overflow: 'hidden'
            }}>
              {short.tags && short.tags.length > 0 ? (
                <>
                  {short.tags.length > 1 && (
                    <button
                      onClick={() => {
                        setIsExpanded(!isExpanded);
                        setShowAllTags(!showAllTags);
                      }}
                      style={{
                        backgroundColor: isExpanded ? '#666666' : '#f0f0f0',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '4px 8px',
                        fontSize: '13px',
                        color: isExpanded ? '#ffffff' : '#323545',
                        cursor: 'pointer',
                        fontWeight: 'normal',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      [+ {short.tags.length - 1}]
                    </button>
                  )}
                  <span style={{
                    backgroundColor: '#f0f0f0',
                    color: '#323545',
                    fontSize: '13px',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontWeight: 'normal',
                    whiteSpace: 'nowrap'
                  }}>
                    {short.tags[0]}
                  </span>
                </>
              ) : (
                <span style={{
                  backgroundColor: '#f0f0f0',
                  color: '#323545',
                  fontSize: '13px',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontWeight: 'normal',
                  whiteSpace: 'nowrap'
                }}>
                  [No tag]
                </span>
              )}
            </div>
            <button
              onClick={() => {
                const tagsText = short.tags?.join(', ') || '';
                navigator.clipboard.writeText(tagsText).then(() => {
                  setIsCopied(true);
                  setTimeout(() => setIsCopied(false), 2000);
                }).catch(() => {
                  alert('복사에 실패했습니다.');
                });
              }}
              style={{
                backgroundColor: '#fafafa',
                border: '1px solid #eeeeee',
                borderRadius: '6px',
                padding: '6px 8px',
                cursor: 'pointer',
                fontSize: '14px',
                color: '#323545',
                minWidth: '32px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="태그 복사"
            >
              {isCopied ? '✓' : '📋'}
            </button>
          </div>
          {isExpanded && short.tags && short.tags.length > 1 && (
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '6px',
              marginTop: '12px',
              padding: '12px',
              backgroundColor: '#f9f9f9',
              borderRadius: '8px'
            }}>
              {short.tags.slice(1).map((tag, idx) => (
                <span key={idx + 1} style={{
                  backgroundColor: '#f0f0f0',
                  color: '#323545',
                  fontSize: '13px',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontWeight: 'normal'
                }}>
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 태그 아래 구분선 */}
        <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '16px 0' }} />

        {/* RPM 수익 계산 2x2 그리드 */}
        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '16px',
            marginLeft: '-15px',
            padding: '10px',
            borderRadius: '8px',
            transition: 'background-color 0.2s ease',
            position: 'relative',
            backgroundColor: showTooltip ? '#f5f5f5' : 'transparent'
          }}
          onMouseEnter={() => {
            setShowTooltip(true);
          }}
          onMouseLeave={() => {
            setShowTooltip(false);
          }}
        >
          {/* 커스텀 툴팁 */}
          {showTooltip && (
            <div style={{
              position: 'absolute',
              top: '-80px',
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: 'rgb(124, 58, 237)',
              color: 'white',
              padding: '10px 15px',
              borderRadius: '10px',
              fontSize: '12px',
              whiteSpace: 'nowrap',
              zIndex: 1000,
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              '::after': {
                content: '""',
                position: 'absolute',
                top: '100%',
                left: '50%',
                transform: 'translateX(-50%)',
                width: 0,
                height: 0,
                borderStyle: 'solid',
                borderWidth: '8px 8px 0 8px',
                borderColor: 'rgb(124, 58, 237) transparent transparent transparent'
              }
            }}>
              계산방법<br />
              1,000회당<br />
              RPM 을 곱한<br />
              금액
              {/* 말풍선 꼬리 */}
              <div style={{
                position: 'absolute',
                top: '100%',
                left: '50%',
                transform: 'translateX(-50%)',
                width: 0,
                height: 0,
                borderStyle: 'solid',
                borderWidth: '8px 8px 0 8px',
                borderColor: 'rgb(124, 58, 237) transparent transparent transparent'
              }} />
            </div>
          )}
          
          <div>
            <div style={{ fontSize: '12px', color: '#323545', marginBottom: '8px', textAlign: 'center' }}>RPM</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <button
                onClick={() => setRpmRate(Math.max(0.01, rpmRate - 0.01))}
                style={{ width: '24px', height: '24px', borderRadius: '50%', border: 'none', backgroundColor: '#f0f0f0', color: '#323545', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>-</button>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#6C6D78', margin: '0', minWidth: '30px', textAlign: 'center' }}>{rpmRate.toFixed(2)}</div>
              <button
                onClick={() => setRpmRate(rpmRate + 0.01)}
                style={{ width: '24px', height: '24px', borderRadius: '50%', border: 'none', backgroundColor: '#f0f0f0', color: '#323545', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
            </div>
          </div>

          <div style={{ marginLeft: '-10px' }}>
            <div style={{ fontSize: '12px', color: '#323545', marginBottom: '8px', textAlign: 'center' }}>기간</div>
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#6C6D78', textAlign: 'center', minWidth: '60px', margin: '0 auto' }}>{calculateChannelDuration()}</div>
          </div>

          <div>
            <div style={{ fontSize: '12px', color: 'rgb(124, 58, 237)', marginBottom: '8px', textAlign: 'center' }}>이 영상 수익</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'rgb(124, 58, 237)', textAlign: 'center' }}>{formatRevenue(calculateVideoRevenue())}</div>
          </div>

          <div style={{ marginLeft: '-10px' }}>
            <div style={{ fontSize: '12px', color: 'rgb(124, 58, 237)', marginBottom: '8px', textAlign: 'center' }}>채널 총 수익</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'rgb(124, 58, 237)', textAlign: 'center' }}>{formatRevenue(calculateChannelRevenue())}</div>
          </div>
        </div>
        
        {/* 하단 여백 유지 */}
        <div style={{ height: '40px' }}></div>
      </div>
    </div>
  );
};

export default ShortsCardNew;