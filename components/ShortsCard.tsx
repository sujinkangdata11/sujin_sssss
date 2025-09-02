
import React from 'react';
import { YouTubeShort, Language } from '../types';

interface ShortsCardProps {
  short: YouTubeShort;
  language: Language;
  index?: number;
}

const ShortsCard: React.FC<ShortsCardProps> = ({ short, language, index }) => {
  const [showAllTags, setShowAllTags] = React.useState(false);
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [isCopied, setIsCopied] = React.useState(false);
  const [showTooltip, setShowTooltip] = React.useState(false);

  // 다국어 번역 객체
  const translations = {
    // 기본 통계 항목들
    subscribers: {
      en: 'Subscribers', ko: '구독자', ja: '登録者', zh: '订阅者', hi: 'सब्सक्राइबर',
      es: 'Suscriptores', fr: 'Abonnés', de: 'Abonnenten', nl: 'Abonnees', pt: 'Inscritos', ru: 'Подписчики'
    },
    views: {
      en: 'Views', ko: '조회수', ja: '再生回数', zh: '观看次数', hi: 'दृश्य',
      es: 'Vistas', fr: 'Vues', de: 'Aufrufe', nl: 'Weergaven', pt: 'Visualizações', ru: 'Просмотры'
    },
    uploaded: {
      en: 'Uploaded', ko: '업로드', ja: '投稿', zh: '上传', hi: 'अपलोड',
      es: 'Subido', fr: 'Téléchargé', de: 'Hochgeladen', nl: 'Geüpload', pt: 'Enviado', ru: 'Загружено'
    },
    // 분석 정보 항목들
    country: {
      en: 'Country', ko: '국가', ja: '国', zh: '国家', hi: 'देश',
      es: 'País', fr: 'Pays', de: 'Land', nl: 'Land', pt: 'País', ru: 'Страна'
    },
    category: {
      en: 'Category', ko: '카테고리', ja: 'カテゴリー', zh: '类别', hi: 'श्रेणी',
      es: 'Categoría', fr: 'Catégorie', de: 'Kategorie', nl: 'Categorie', pt: 'Categoria', ru: 'Категория'
    },
    totalVideos: {
      en: 'Total Videos', ko: '총 영상', ja: '総動画数', zh: '总视频', hi: 'कुल वीडियो',
      es: 'Videos Totales', fr: 'Vidéos Totales', de: 'Gesamt Videos', nl: 'Totaal Video\'s', pt: 'Vídeos Totais', ru: 'Всего видео'
    },
    totalViews: {
      en: 'Total Views', ko: '총 조회수', ja: '総再生回数', zh: '总观看次数', hi: 'कुल दृश्य',
      es: 'Vistas Totales', fr: 'Vues Totales', de: 'Gesamt Aufrufe', nl: 'Totaal Weergaven', pt: 'Visualizações Totais', ru: 'Всего просмотров'
    },
    averageViews: {
      en: 'Average Views', ko: '평균 조회수', ja: '平均再生回数', zh: '平均观看次数', hi: 'औसत दृश्य',
      es: 'Vistas Promedio', fr: 'Vues Moyennes', de: 'Durchschn. Aufrufe', nl: 'Gem. Weergaven', pt: 'Visualizações Médias', ru: 'Средние просмотры'
    },
    viewsPerSubscriber: {
      en: 'Views per Subscriber', ko: '구독자 대비 조회수', ja: '登録者対再生回数', zh: '每订阅者观看次数', hi: 'प्रति सब्सक्राइबर व्यू',
      es: 'Vistas por Suscriptor', fr: 'Vues par Abonné', de: 'Aufrufe pro Abonnent', nl: 'Weergaven per Abonnee', pt: 'Views por Inscrito', ru: 'Просмотры на подписчика'
    },
    engagementRate: {
      en: 'Engagement Rate', ko: '참여율', ja: 'エンゲージメント率', zh: '参与率', hi: 'सहभागिता दर',
      es: 'Tasa de Participación', fr: 'Taux d\'Engagement', de: 'Engagement-Rate', nl: 'Betrokkenheidsgraad', pt: 'Taxa de Engajamento', ru: 'Уровень вовлеченности'
    },
    // RPM 수익 관련
    rpm: {
      en: 'RPM', ko: 'RPM', ja: 'RPM', zh: 'RPM', hi: 'RPM',
      es: 'RPM', fr: 'RPM', de: 'RPM', nl: 'RPM', pt: 'RPM', ru: 'RPM'
    },
    duration: {
      en: 'Duration', ko: '기간', ja: '期間', zh: '期间', hi: 'अवधि',
      es: 'Duración', fr: 'Durée', de: 'Dauer', nl: 'Duur', pt: 'Duração', ru: 'Длительность'
    },
    videoRevenue: {
      en: 'Video Revenue', ko: '이 영상 수익', ja: 'この動画収益', zh: '视频收益', hi: 'वीडियो आय',
      es: 'Ingresos del Video', fr: 'Revenus Vidéo', de: 'Video-Einnahmen', nl: 'Video Inkomsten', pt: 'Receita do Vídeo', ru: 'Доход с видео'
    },
    channelRevenue: {
      en: 'Channel Revenue', ko: '채널 총 수익', ja: 'チャンネル総収益', zh: '频道总收益', hi: 'चैनल आय',
      es: 'Ingresos del Canal', fr: 'Revenus du Canal', de: 'Kanal-Einnahmen', nl: 'Kanaal Inkomsten', pt: 'Receita do Canal', ru: 'Доход канала'
    },
    // 툴팁 텍스트
    calculationMethod: {
      en: 'Calculation Method\nPer 1,000 views\nMultiplied by\nRPM rate',
      ko: '계산방법\n1,000회당\nRPM 을 곱한\n금액',
      ja: '計算方法\n1,000回当たり\nRPMを掛けた\n金額',
      zh: '计算方法\n每1000次观看\n乘以RPM\n金额',
      hi: 'गणना विधि\n1,000 व्यू प्रति\nRPM से गुणा\nराशि',
      es: 'Método de Cálculo\nPor 1,000 vistas\nMultiplicado por\nTasa RPM',
      fr: 'Méthode de Calcul\nPar 1,000 vues\nMultiplié par\nTaux RPM',
      de: 'Berechnungsmethode\nPro 1.000 Aufrufe\nMultipliziert mit\nRPM-Rate',
      nl: 'Berekeningsmethode\nPer 1.000 weergaven\nVermenigvuldigd met\nRPM tarief',
      pt: 'Método de Cálculo\nPor 1.000 visualizações\nMultiplicado por\nTaxa RPM',
      ru: 'Метод расчёта\nЗа 1000 просмотров\nУмноженное на\nСтавку RPM'
    },
    // 복사 관련
    copyTags: {
      en: 'Copy tags', ko: '태그 복사', ja: 'タグをコピー', zh: '复制标签', hi: 'टैग कॉपी करें',
      es: 'Copiar etiquetas', fr: 'Copier les tags', de: 'Tags kopieren', nl: 'Tags kopiëren', pt: 'Copiar tags', ru: 'Копировать теги'
    },
    copyFailed: {
      en: 'Copy failed.', ko: '복사에 실패했습니다.', ja: 'コピーに失敗しました。', zh: '复制失败。', hi: 'कॉपी असफल।',
      es: 'Falló la copia.', fr: 'Échec de la copie.', de: 'Kopieren fehlgeschlagen.', nl: 'Kopiëren mislukt.', pt: 'Falha ao copiar.', ru: 'Копирование не удалось.'
    }
  };

  // 번역 헬퍼 함수
  const t = (key: keyof typeof translations) => {
    return translations[key][language] || translations[key].en;
  };
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
        'ES': 0.08,    // 스페인
        'UA': 0.04     // 우크라이나
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

  // 국가별 간결한 숫자 포맷팅 함수
  const formatNumber = (num: number): string => {
    switch (language) {
      case 'ko':
        // 한국: 억/만/천 단위
        if (num >= 100000000) return `${(num / 100000000).toFixed(1)}억`;
        if (num >= 10000) return `${Math.floor(num / 10000)}만`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}천`;
        return num.toLocaleString('ko-KR');

      case 'ja':
        // 일본: 億/万 단위
        if (num >= 100000000) return `${(num / 100000000).toFixed(1)}億`;
        if (num >= 10000) return `${Math.floor(num / 10000)}万`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toLocaleString('ja-JP');

      case 'zh':
        // 중국: 亿/万 단위
        if (num >= 100000000) return `${(num / 100000000).toFixed(1)}亿`;
        if (num >= 10000) return `${Math.floor(num / 10000)}万`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toLocaleString('zh-CN');

      case 'en':
        // 영어: K/M/B 단위 (미국식)
        if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)}B`;
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toLocaleString('en-US');

      case 'es':
        // 스페인어: K/M/B 단위
        if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)}mil M`;
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toLocaleString('es-ES');

      case 'fr':
        // 프랑스어: K/M/Mrd 단위
        if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)}Mrd`;
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toLocaleString('fr-FR');

      case 'de':
        // 독일어: Tsd/Mio/Mrd 단위
        if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)}Mrd`;
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}Mio`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}Tsd`;
        return num.toLocaleString('de-DE');

      case 'ru':
        // 러시아어: тыс/млн/млрд 단위
        if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)}млрд`;
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}млн`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}тыс`;
        return num.toLocaleString('ru-RU');

      case 'pt':
        // 포르투갈어: K/M/B 단위
        if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)}B`;
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toLocaleString('pt-BR');

      case 'nl':
        // 네덜란드어: K/M/Mld 단위
        if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)}Mld`;
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toLocaleString('nl-NL');

      case 'hi':
        // 힌디어: K/L(Lakh)/Cr(Crore) 단위 (인도식)
        if (num >= 10000000) return `${(num / 10000000).toFixed(1)}Cr`; // 1 Crore = 10M
        if (num >= 100000) return `${(num / 100000).toFixed(1)}L`; // 1 Lakh = 100K
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toLocaleString('hi-IN');

      default:
        // 기본값: 영어 스타일
        if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)}B`;
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toLocaleString();
    }
  };

  // 평균 조회수 계산
  const calculateAverageViews = (): number => {
    if (!short.channelViewCount || !short.videoCount || short.videoCount === 0) return 0;
    return Math.round(short.channelViewCount / short.videoCount);
  };

  const averageViews = calculateAverageViews();

  // 수익 계산 함수들 - 다국어 기간 포맷팅
  const calculateChannelDuration = () => {
    // 기본값 처리
    if (!short.channelPublishedAt) {
      const defaultDuration = {
        en: '1 mo', ko: '1개월', ja: '1ヶ月', zh: '1个月', hi: '1 महीना',
        es: '1 mes', fr: '1 mois', de: '1 Mo', nl: '1 mnd', pt: '1 mês', ru: '1 мес'
      };
      return defaultDuration[language] || defaultDuration.en;
    }
    
    const channelStartDate = new Date(short.channelPublishedAt);
    const now = new Date();
    const diffMonths = Math.ceil((now.getTime() - channelStartDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
    
    if (diffMonths >= 12) {
      const years = Math.floor(diffMonths / 12);
      const remainingMonths = diffMonths % 12;
      
      // 각 언어별 기간 포맷팅
      switch (language) {
        case 'ko':
          return remainingMonths === 0 ? `${years}년` : `${years}년 ${remainingMonths}개월`;
        case 'ja':
          return remainingMonths === 0 ? `${years}年` : `${years}年${remainingMonths}ヶ月`;
        case 'zh':
          return remainingMonths === 0 ? `${years}年` : `${years}年${remainingMonths}个月`;
        case 'hi':
          return remainingMonths === 0 ? `${years} वर्ष` : `${years}व ${remainingMonths}मही`;
        case 'es':
          return remainingMonths === 0 ? `${years}a` : `${years}a ${remainingMonths}m`;
        case 'fr':
          return remainingMonths === 0 ? `${years}a` : `${years}a ${remainingMonths}m`;
        case 'de':
          return remainingMonths === 0 ? `${years}J` : `${years}J ${remainingMonths}Mo`;
        case 'nl':
          return remainingMonths === 0 ? `${years}j` : `${years}j ${remainingMonths}m`;
        case 'pt':
          return remainingMonths === 0 ? `${years}a` : `${years}a ${remainingMonths}m`;
        case 'ru':
          return remainingMonths === 0 ? `${years}г` : `${years}г ${remainingMonths}м`;
        case 'en':
        default:
          return remainingMonths === 0 ? `${years}y` : `${years}y ${remainingMonths}mo`;
      }
    }
    
    // 12개월 미만인 경우
    const monthUnits = {
      en: 'mo', ko: '개월', ja: 'ヶ月', zh: '个月', hi: 'महीना',
      es: 'mes', fr: 'mois', de: 'Mo', nl: 'mnd', pt: 'mês', ru: 'мес'
    };
    const unit = monthUnits[language] || monthUnits.en;
    return `${diffMonths}${unit}`;
  };

  const calculateVideoRevenue = () => (short.viewCount / 1000) * rpmRate;
  const calculateChannelRevenue = () => short.channelViewCount ? (short.channelViewCount / 1000) * rpmRate : 0;
  
  // 다국가 환율 및 화폐 단위 (2024년 12월 기준)
  const currencyData = {
    ko: { rate: 1300, symbol: '원', major: 10000, majorUnit: '만원', superMajor: 100000000, superMajorUnit: '억원' },
    en: { rate: 1, symbol: '$', major: 1000, majorUnit: 'K', superMajor: 1000000, superMajorUnit: 'M' },
    ja: { rate: 150, symbol: '¥', major: 10000, majorUnit: '万円', superMajor: 100000000, superMajorUnit: '億円' },
    zh: { rate: 7.2, symbol: '¥', major: 10000, majorUnit: '万元', superMajor: 100000000, superMajorUnit: '亿元' },
    hi: { rate: 83, symbol: '₹', major: 100000, majorUnit: 'L', superMajor: 10000000, superMajorUnit: 'Cr' }, // Lakh/Crore
    es: { rate: 0.92, symbol: '€', major: 1000, majorUnit: 'K€', superMajor: 1000000, superMajorUnit: 'M€' },
    fr: { rate: 0.92, symbol: '€', major: 1000, majorUnit: 'K€', superMajor: 1000000, superMajorUnit: 'M€' },
    de: { rate: 0.92, symbol: '€', major: 1000, majorUnit: 'Tsd€', superMajor: 1000000, superMajorUnit: 'Mio€' },
    nl: { rate: 0.92, symbol: '€', major: 1000, majorUnit: 'K€', superMajor: 1000000, superMajorUnit: 'M€' },
    pt: { rate: 5.2, symbol: 'R$', major: 1000, majorUnit: 'K', superMajor: 1000000, superMajorUnit: 'M' }, // Brazilian Real
    ru: { rate: 92, symbol: '₽', major: 1000, majorUnit: 'тыс₽', superMajor: 1000000, superMajorUnit: 'млн₽' }
  };

  const formatRevenue = (revenueUSD: number) => {
    const currency = currencyData[language] || currencyData.en;
    const localAmount = revenueUSD * currency.rate;
    
    // 각 언어별 특별한 포맷팅
    switch (language) {
      case 'ko':
        // 한국: 억원/만원 단위
        if (localAmount >= currency.superMajor) {
          const eok = Math.floor(localAmount / currency.superMajor);
          const man = Math.floor((localAmount % currency.superMajor) / currency.major);
          return man > 0 ? `${eok}억 ${man}만원` : `${eok}억원`;
        }
        if (localAmount >= currency.major) return `${Math.floor(localAmount / currency.major)}만원`;
        return `${Math.floor(localAmount).toLocaleString('ko-KR')}원`;

      case 'ja':
        // 일본: 億円/万円 단위
        if (localAmount >= currency.superMajor) {
          const oku = (localAmount / currency.superMajor).toFixed(1);
          return `${oku}億円`;
        }
        if (localAmount >= currency.major) {
          const man = Math.floor(localAmount / currency.major);
          return `${man}万円`;
        }
        return `${Math.floor(localAmount).toLocaleString('ja-JP')}円`;

      case 'zh':
        // 중국: 亿元/万元 단위
        if (localAmount >= currency.superMajor) {
          const yi = (localAmount / currency.superMajor).toFixed(1);
          return `${yi}亿元`;
        }
        if (localAmount >= currency.major) {
          const wan = Math.floor(localAmount / currency.major);
          return `${wan}万元`;
        }
        return `${Math.floor(localAmount).toLocaleString('zh-CN')}元`;

      case 'hi':
        // 인도: Crore/Lakh 단위
        if (localAmount >= currency.superMajor) {
          const crore = (localAmount / currency.superMajor).toFixed(1);
          return `₹${crore}Cr`;
        }
        if (localAmount >= currency.major) {
          const lakh = (localAmount / currency.major).toFixed(1);
          return `₹${lakh}L`;
        }
        return `₹${Math.floor(localAmount).toLocaleString('hi-IN')}`;

      case 'en':
        // 영어: $M/$K 단위
        if (localAmount >= currency.superMajor) {
          const millions = (localAmount / currency.superMajor).toFixed(1);
          return `$${millions}M`;
        }
        if (localAmount >= currency.major) {
          const thousands = (localAmount / currency.major).toFixed(1);
          return `$${thousands}K`;
        }
        return `$${Math.floor(localAmount).toLocaleString('en-US')}`;

      case 'de':
        // 독일어: Mio€/Tsd€ 단위
        if (localAmount >= currency.superMajor) {
          const mio = (localAmount / currency.superMajor).toFixed(1);
          return `${mio}Mio€`;
        }
        if (localAmount >= currency.major) {
          const tsd = (localAmount / currency.major).toFixed(1);
          return `${tsd}Tsd€`;
        }
        return `€${Math.floor(localAmount).toLocaleString('de-DE')}`;

      case 'ru':
        // 러시아어: млн₽/тыс₽ 단위
        if (localAmount >= currency.superMajor) {
          const mln = (localAmount / currency.superMajor).toFixed(1);
          return `${mln}млн₽`;
        }
        if (localAmount >= currency.major) {
          const tys = (localAmount / currency.major).toFixed(1);
          return `${tys}тыс₽`;
        }
        return `₽${Math.floor(localAmount).toLocaleString('ru-RU')}`;

      case 'pt':
        // 포르투갈어(브라질): R$M/R$K 단위
        if (localAmount >= currency.superMajor) {
          const millions = (localAmount / currency.superMajor).toFixed(1);
          return `R$${millions}M`;
        }
        if (localAmount >= currency.major) {
          const thousands = (localAmount / currency.major).toFixed(1);
          return `R$${thousands}K`;
        }
        return `R$${Math.floor(localAmount).toLocaleString('pt-BR')}`;

      case 'es':
      case 'fr':
      case 'nl':
      default:
        // 유로권/기타: €M/€K 단위
        if (localAmount >= currency.superMajor) {
          const millions = (localAmount / currency.superMajor).toFixed(1);
          return `€${millions}M`;
        }
        if (localAmount >= currency.major) {
          const thousands = (localAmount / currency.major).toFixed(1);
          return `€${thousands}K`;
        }
        return `€${Math.floor(localAmount).toLocaleString()}`;
    }
  };

  // YouTube 카테고리 ID를 실제 카테고리명으로 변환
  const getCategoryName = (categoryId: string | undefined): string => {
    const categoryTranslations = {
      default: {
        en: 'People & Blogs', ko: '인물/블로그', ja: '人物・ブログ', zh: '人物博客', hi: 'व्यक्ति और ब्लॉग',
        es: 'Personas y Blogs', fr: 'Personnes et Blogs', de: 'Menschen & Blogs', nl: 'Mensen & Blogs', pt: 'Pessoas & Blogs', ru: 'Люди и блоги'
      },
      '1': {
        en: 'Film & Animation', ko: '영화/애니메이션', ja: '映画・アニメ', zh: '电影动画', hi: 'फिल्म एवं एनीमेशन',
        es: 'Cine y Animación', fr: 'Cinéma et Animation', de: 'Film & Animation', nl: 'Film & Animatie', pt: 'Filme e Animação', ru: 'Фильмы и анимация'
      },
      '2': {
        en: 'Autos & Vehicles', ko: '자동차/차량', ja: '自動車・乗り物', zh: '汽车载具', hi: 'ऑटो एवं वाहन',
        es: 'Autos y Vehículos', fr: 'Autos et Véhicules', de: 'Autos & Fahrzeuge', nl: 'Auto\'s & Voertuigen', pt: 'Autos e Veículos', ru: 'Авто и транспорт'
      },
      '10': {
        en: 'Music', ko: '음악', ja: '音楽', zh: '音乐', hi: 'संगीत',
        es: 'Música', fr: 'Musique', de: 'Musik', nl: 'Muziek', pt: 'Música', ru: 'Музыка'
      },
      '15': {
        en: 'Pets & Animals', ko: '애완동물/동물', ja: 'ペット・動物', zh: '宠物动物', hi: 'पालतू जानवर एवं पशु',
        es: 'Mascotas y Animales', fr: 'Animaux', de: 'Haustiere & Tiere', nl: 'Huisdieren & Dieren', pt: 'Pets e Animais', ru: 'Питомцы и животные'
      },
      '17': {
        en: 'Sports', ko: '스포츠', ja: 'スポーツ', zh: '体育', hi: 'खेल',
        es: 'Deportes', fr: 'Sports', de: 'Sport', nl: 'Sport', pt: 'Esportes', ru: 'Спорт'
      },
      '19': {
        en: 'Travel & Events', ko: '여행/이벤트', ja: '旅行・イベント', zh: '旅游活动', hi: 'यात्रा एवं घटनाएं',
        es: 'Viajes y Eventos', fr: 'Voyages et Événements', de: 'Reisen & Events', nl: 'Reizen & Evenementen', pt: 'Viagem e Eventos', ru: 'Путешествия и события'
      },
      '20': {
        en: 'Gaming', ko: '게임', ja: 'ゲーム', zh: '游戏', hi: 'गेमिंग',
        es: 'Videojuegos', fr: 'Jeux vidéo', de: 'Gaming', nl: 'Gaming', pt: 'Jogos', ru: 'Игры'
      },
      '22': {
        en: 'People & Blogs', ko: '인물/블로그', ja: '人物・ブログ', zh: '人物博客', hi: 'व्यक्ति और ब्लॉग',
        es: 'Personas y Blogs', fr: 'Personnes et Blogs', de: 'Menschen & Blogs', nl: 'Mensen & Blogs', pt: 'Pessoas & Blogs', ru: 'Люди и блоги'
      },
      '23': {
        en: 'Comedy', ko: '코미디', ja: 'コメディ', zh: '喜剧', hi: 'कॉमेडी',
        es: 'Comedia', fr: 'Comédie', de: 'Komödie', nl: 'Komedie', pt: 'Comédia', ru: 'Комедия'
      },
      '24': {
        en: 'Entertainment', ko: '엔터테인먼트', ja: 'エンターテインメント', zh: '娱乐', hi: 'मनोरंजन',
        es: 'Entretenimiento', fr: 'Divertissement', de: 'Unterhaltung', nl: 'Entertainment', pt: 'Entretenimento', ru: 'Развлечения'
      },
      '25': {
        en: 'News & Politics', ko: '뉴스/정치', ja: 'ニュース・政治', zh: '新闻政治', hi: 'समाचार एवं राजनीति',
        es: 'Noticias y Política', fr: 'Actualités et Politique', de: 'Nachrichten & Politik', nl: 'Nieuws & Politiek', pt: 'Notícias e Política', ru: 'Новости и политика'
      },
      '26': {
        en: 'Howto & Style', ko: '하우투/스타일', ja: 'ハウツー・スタイル', zh: '时尚美妆', hi: 'कैसे करें एवं स्टाइल',
        es: 'Tutoriales y Estilo', fr: 'Tutoriels et Style', de: 'Anleitungen & Stil', nl: 'Instructies & Stijl', pt: 'Estilo e Moda', ru: 'Обучение и стиль'
      },
      '27': {
        en: 'Education', ko: '교육', ja: '教育', zh: '教育', hi: 'शिक्षा',
        es: 'Educación', fr: 'Éducation', de: 'Bildung', nl: 'Onderwijs', pt: 'Educação', ru: 'Образование'
      },
      '28': {
        en: 'Science & Technology', ko: '과학/기술', ja: '科学・技術', zh: '科学技术', hi: 'विज्ञान एवं प्रौद्योगिकी',
        es: 'Ciencia y Tecnología', fr: 'Science et Technologie', de: 'Wissenschaft & Technik', nl: 'Wetenschap & Technologie', pt: 'Ciência e Tecnologia', ru: 'Наука и технологии'
      },
      '29': {
        en: 'Nonprofits & Activism', ko: '비영리/활동', ja: '非営利・活動', zh: '非营利组织', hi: 'गैर-लाभकारी संस्थाएं',
        es: 'ONG y Activismo', fr: 'Organisations à but non lucratif', de: 'Gemeinnützig & Aktivismus', nl: 'Non-profit & Activisme', pt: 'Organizações sem fins lucrativos', ru: 'Некоммерческие организации'
      }
    };
    
    if (!categoryId) {
      return categoryTranslations.default[language] || categoryTranslations.default.en;
    }
    
    const category = categoryTranslations[categoryId as keyof typeof categoryTranslations];
    if (category) {
      return category[language] || category.en;
    }
    
    // 알 수 없는 카테고리 ID인 경우
    const unknownCategory = {
      en: `Category ${categoryId}`, ko: `카테고리 ${categoryId}`, ja: `カテゴリー ${categoryId}`, 
      zh: `类别 ${categoryId}`, hi: `श्रेणी ${categoryId}`, es: `Categoría ${categoryId}`, 
      fr: `Catégorie ${categoryId}`, de: `Kategorie ${categoryId}`, nl: `Categorie ${categoryId}`, 
      pt: `Categoria ${categoryId}`, ru: `Категория ${categoryId}`
    };
    
    return unknownCategory[language] || unknownCategory.en;
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
        'ES': { flag: '🇪🇸', names: { en: 'Spain', ko: '스페인', ja: 'スペイン', zh: '西班牙', hi: 'स्पेن', es: 'España', fr: 'Espagne', de: 'Spanien', nl: 'Spanje', pt: 'Espanha', ru: 'Испания' } },
        'UA': { flag: '🇺🇦', names: { en: 'Ukraine', ko: '우크라이나', ja: 'ウクライナ', zh: '乌克兰', hi: 'यूक्रेन', es: 'Ucrania', fr: 'Ukraine', de: 'Ukraine', nl: 'Oekraïne', pt: 'Ucrânia', ru: 'Украина' } }
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

  // 간결한 업로드 시간 표시 함수 (공간 절약형)
  const timeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    // 간결한 단위 표기 (공간 절약)
    const compactUnits: Record<Language, Record<string, string>> = {
      en: { year: 'y', month: 'mo', day: 'd', hour: 'h', minute: 'm', second: 's', ago: ' ago' },
      ko: { year: '년', month: '개월', day: '일', hour: '시간', minute: '분', second: '초', ago: ' 전' },
      ja: { year: '年', month: 'ヶ月', day: '日', hour: 'h', minute: 'm', second: 's', ago: '前' },
      zh: { year: '年', month: '月', day: '天', hour: 'h', minute: 'm', second: 's', ago: '前' },
      hi: { year: 'y', month: 'mo', day: 'd', hour: 'h', minute: 'm', second: 's', ago: ' पहले' },
      es: { year: 'a', month: 'mes', day: 'd', hour: 'h', minute: 'm', second: 's', ago: ' hace' },
      fr: { year: 'a', month: 'mois', day: 'j', hour: 'h', minute: 'm', second: 's', ago: ' il y a' },
      de: { year: 'J', month: 'Mo', day: 'T', hour: 'Std', minute: 'Min', second: 'Sek', ago: ' vor' },
      nl: { year: 'j', month: 'mnd', day: 'd', hour: 'u', minute: 'm', second: 's', ago: ' geleden' },
      pt: { year: 'a', month: 'mês', day: 'd', hour: 'h', minute: 'm', second: 's', ago: ' atrás' },
      ru: { year: 'г', month: 'мес', day: 'д', hour: 'ч', minute: 'м', second: 'с', ago: ' назад' },
    };

    const units = compactUnits[language] || compactUnits.en;

    const intervals: { limit: number; unit: keyof typeof units }[] = [
      { limit: 31536000, unit: 'year' },
      { limit: 2592000, unit: 'month' },
      { limit: 86400, unit: 'day' },
      { limit: 3600, unit: 'hour' },
      { limit: 60, unit: 'minute' },
    ];

    for (const interval of intervals) {
      const count = Math.floor(seconds / interval.limit);
      if (count >= 1) {
        const unit = units[interval.unit];
        
        // 특별한 포맷팅이 필요한 언어들
        if (language === 'es') {
          return `hace ${count}${unit}`;
        } else if (language === 'fr') {
          return `il y a ${count}${unit}`;
        } else if (language === 'pt') {
          return `${count}${unit} atrás`;
        } else if (language === 'de') {
          return `vor ${count}${unit}`;
        } else if (language === 'nl') {
          return `${count}${unit} geleden`;
        } else if (language === 'ru') {
          return `${count}${unit} назад`;
        } else if (language === 'hi') {
          return `${count}${unit} पहले`;
        } else if (language === 'ja' || language === 'zh') {
          return `${count}${unit}前`;
        } else {
          // 영어, 한국어 등
          return `${count}${unit}${units.ago}`;
        }
      }
    }

    // 초 단위
    const secondUnit = units.second;
    if (language === 'es') {
      return `hace ${seconds}${secondUnit}`;
    } else if (language === 'fr') {
      return `il y a ${seconds}${secondUnit}`;
    } else if (language === 'pt') {
      return `${seconds}${secondUnit} atrás`;
    } else if (language === 'de') {
      return `vor ${seconds}${secondUnit}`;
    } else if (language === 'nl') {
      return `${seconds}${secondUnit} geleden`;
    } else if (language === 'ru') {
      return `${seconds}${secondUnit} назад`;
    } else if (language === 'hi') {
      return `${seconds}${secondUnit} पहले`;
    } else if (language === 'ja' || language === 'zh') {
      return `${seconds}${secondUnit}前`;
    } else {
      return `${seconds}${secondUnit}${units.ago}`;
    }
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
            <div style={{ fontSize: '12px', color: '#323545', marginBottom: '8px' }}>{t('subscribers')}</div>
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#323545' }}>
              {short.subscriberCount ? formatNumber(short.subscriberCount) : 'N/A'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#323545', marginBottom: '8px' }}>{t('views')}</div>
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'rgb(124, 58, 237)' }}>
              {formatNumber(short.viewCount)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#323545', marginBottom: '8px' }}>{t('uploaded')}</div>
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
            <span>{t('country')}</span>
            <span style={{ fontWeight: 'bold' }}>
              {detectCountryFromChannel()}
            </span>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span>{t('category')}</span>
            <span style={{ fontWeight: 'bold' }}>
              {getCategoryName(short.categoryId)}
            </span>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span>{t('totalVideos')}</span>
            <span style={{ fontWeight: 'bold' }}>
              {short.videoCount ? formatNumber(short.videoCount) + (language === 'ko' ? '개' : '') : 'N/A'}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span>{t('totalViews')}</span>
            <span style={{ fontWeight: 'bold' }}>
              {short.channelViewCount ? formatNumber(short.channelViewCount) : 'N/A'}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span>{t('averageViews')}</span>
            <span style={{ fontWeight: 'bold', color: 'rgb(124, 58, 237)' }}>
              {averageViews > 0 ? formatNumber(averageViews) : 'N/A'}
            </span>
          </div>

          {/* 구독자 대비 조회수 - 프로그레스 바 */}
          {short.viewsPerSubscriber && (
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ color: '#323545', fontSize: '13px' }}>{t('viewsPerSubscriber')}</span>
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
              <span>{t('engagementRate')}</span>
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
                  alert(t('copyFailed'));
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
              title={t('copyTags')}
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
{t('calculationMethod').split('\n').map((line, i) => (
                <React.Fragment key={i}>
                  {line}
                  {i < t('calculationMethod').split('\n').length - 1 && <br />}
                </React.Fragment>
              ))}
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
            <div style={{ fontSize: '12px', color: '#323545', marginBottom: '8px', textAlign: 'center' }}>{t('rpm')}</div>
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
            <div style={{ fontSize: '12px', color: '#323545', marginBottom: '8px', textAlign: 'center' }}>{t('duration')}</div>
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#6C6D78', textAlign: 'center', minWidth: '60px', margin: '0 auto' }}>{calculateChannelDuration()}</div>
          </div>

          <div>
            <div style={{ fontSize: '12px', color: 'rgb(124, 58, 237)', marginBottom: '8px', textAlign: 'center' }}>{t('videoRevenue')}</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'rgb(124, 58, 237)', textAlign: 'center' }}>{formatRevenue(calculateVideoRevenue())}</div>
          </div>

          <div style={{ marginLeft: '-10px' }}>
            <div style={{ fontSize: '12px', color: 'rgb(124, 58, 237)', marginBottom: '8px', textAlign: 'center' }}>{t('channelRevenue')}</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'rgb(124, 58, 237)', textAlign: 'center' }}>{formatRevenue(calculateChannelRevenue())}</div>
          </div>
        </div>
        
        {/* 하단 여백 유지 */}
        <div style={{ height: '40px' }}></div>
      </div>
    </div>
  );
};

export default ShortsCard;
