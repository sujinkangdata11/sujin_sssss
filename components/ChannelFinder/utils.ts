import { Language } from '../../types';
import { ChannelData } from './types';
import { getChannelFinderTranslation, formatLocalizedNumber } from '../../i18n/channelFinderI18n';
import { channelFinderI18n } from '../../i18n/channelFinderI18n';
import currencyExchangeData from '../../data/currencyExchangeData.json';

export { formatLocalizedNumber };

export const formatRevenue = (
  revenue: number,
  language: Language,
  currentCountry: string
): string => {
  const currentCurrency = currencyExchangeData[currentCountry as keyof typeof currencyExchangeData];
  const currencyCode = currentCurrency?.currency || 'USD';
  const currencySymbol = getChannelFinderTranslation(channelFinderI18n, language, `currencies.${currencyCode}`) || '달러';
  
  // 지역화된 숫자 형식 사용
  return formatLocalizedNumber(revenue, language, currencySymbol);
};

export const calculateRevenueFromViews = (views: number, exchangeRate: number): number => {
  return Math.round(views * exchangeRate);
};

export const calculateViewsPerSubscriber = (channel: ChannelData): string => {
  if (!channel || channel.subscribers === 0) {
    return '0%'; // 안전한 기본값 (구독자 0명일 때)
  }
  // 총 조회수 대비 구독자 비율 계산
  const ratio = Math.round((channel.totalViews / channel.subscribers) * 100);
  return `${ratio.toLocaleString()}%`;
};

export const calculateSubscriptionRate = (channel: ChannelData): string => {
  // API에서 받은 gsub 값을 소수점 3자리까지 표시
  return `${(channel.subscribersPerVideo || 0).toFixed(3)}%`;
};

export const formatUploadFrequency = (videosPerWeek: number, language: Language): string => {
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