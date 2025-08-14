
import React from 'react';
import { YouTubeShort, Language } from '../types';
import './ShortsCard.css';

interface ShortsCardProps {
  short: YouTubeShort;
  language: Language;
}

const ShortsCard: React.FC<ShortsCardProps> = ({ short, language }) => {
  const formatViews = (views: number): string => {
    const viewTextMap: Record<Language, string> = {
      en: 'views', ko: '회', ja: '回視聴', zh: '次观看', hi: 'बार देखा गया',
      es: 'vistas', fr: 'vues', de: 'Aufrufe', nl: 'weergaven', pt: 'visualizações', ru: 'просмотров'
    };
    const viewText = viewTextMap[language] || viewTextMap.en;

    // Special formats for languages with unique numbering systems
    if (language === 'ko') {
      if (views >= 100000000) return `${(views / 100000000).toFixed(1)}억${viewText}`;
      if (views >= 10000) return `${Math.floor(views / 10000)}만${viewText}`;
      return `${new Intl.NumberFormat('ko-KR').format(views)}${viewText}`;
    }
    if (language === 'ja') {
      if (views >= 100000000) return `${(views / 100000000).toFixed(1)}億${viewText}`;
      if (views >= 10000) return `${Math.floor(views / 10000)}万${viewText}`;
      return `${new Intl.NumberFormat('ja-JP').format(views)}${viewText}`;
    }

    // Default to Intl.NumberFormat for robust internationalization
    const localeMap: Record<string, string> = {
      en: 'en-US', zh: 'zh-CN', hi: 'en-IN', es: 'es-ES', fr: 'fr-FR',
      de: 'de-DE', nl: 'nl-NL', pt: 'pt-BR', ru: 'ru-RU'
    };
    const locale = localeMap[language] || 'en-US';
    const formattedViews = new Intl.NumberFormat(locale, {
      notation: 'compact',
      compactDisplay: 'short',
      maximumFractionDigits: 1
    }).format(views);

    if (['ja', 'zh'].includes(language)) {
       return `${formattedViews}${viewText}`;
    }

    return `${formattedViews} ${viewText}`;
  };

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
      // Russian grammar for "ago" is complex, simple format is better
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
      const value = seconds / interval.limit;
      if (value >= 1) {
        return format(Math.floor(value), interval.unit);
      }
    }
    return format(Math.floor(seconds), 'second');
  };

  return (
    <a
      href={`https://www.youtube.com/shorts/${short.id}`}
      target="_blank"
      rel="noopener noreferrer"
      className="shorts-card"
    >
      <div className="shorts-card-thumbnail-container">
        <img
          src={short.thumbnailUrl}
          alt={short.title}
          className="shorts-card-thumbnail"
          loading="lazy"
        />
        <div className="shorts-card-overlay"></div>
      </div>
      <div className="shorts-card-content">
        <h3 className="shorts-card-title" title={short.title}>
          {short.title}
        </h3>
        <div className="shorts-card-meta">
          <p className="shorts-card-channel" title={short.channelTitle}>{short.channelTitle}</p>
          <div className="shorts-card-stats">
            <span>{formatViews(short.viewCount)}</span>
            <span className="shorts-card-stats-separator">•</span>
            <span>{timeAgo(short.publishedAt)}</span>
          </div>
        </div>
      </div>
    </a>
  );
};

export default ShortsCard;
