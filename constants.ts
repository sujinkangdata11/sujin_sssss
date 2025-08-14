
import { Country, DateRangeOption, Language, LanguageOption } from './types';

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
];

export const getDateRanges = (lang: Language): DateRangeOption[] => {
  const labels: Record<Language, string[]> = {
    en: ['Last 24 hours', 'Last 3 days', 'Last 7 days', 'Last month', 'Last 3 months', 'Last 6 months'],
    ko: ['최근 24시간', '최근 3일', '최근 7일', '최근 한 달', '최근 3개월', '최근 6개월'],
    ja: ['過去24時間', '過去3日間', '過去7日間', '過去1ヶ月', '過去3ヶ月', '過去6ヶ月'],
    zh: ['过去24小时', '过去3天', '过去7天', '最近一个月', '最近三个月', '最近六个月'],
    hi: ['पिछले 24 घंटे', 'पिछले 3 दिन', 'पिछले 7 दिन', 'पिछला महीना', 'पिछले 3 महीने', 'पिछले 6 महीने'],
    es: ['Últimas 24 horas', 'Últimos 3 días', 'Últimos 7 días', 'Último mes', 'Últimos 3 meses', 'Últimos 6 meses'],
    fr: ['Dernières 24 heures', '3 derniers jours', '7 derniers jours', 'Dernier mois', '3 derniers mois', '6 derniers mois'],
    de: ['Letzte 24 Stunden', 'Letzte 3 Tage', 'Letzte 7 Tage', 'Letzter Monat', 'Letzte 3 Monate', 'Letzte 6 Monate'],
    nl: ['Laatste 24 uur', 'Laatste 3 dagen', 'Laatste 7 dagen', 'Laatste maand', 'Laatste 3 maanden', 'Laatste 6 maanden'],
    pt: ['Últimas 24 horas', 'Últimos 3 dias', 'Últimos 7 dias', 'Último mês', 'Últimos 3 meses', 'Últimos 6 meses'],
    ru: ['Последние 24 часа', 'Последние 3 дня', 'Последние 7 дней', 'Последний месяц', 'Последние 3 месяца', 'Последние 6 месяцев'],
  };
  const values = ['1', '3', '7', '30', '90', '180'];
  
  return values.map((value, index) => ({
    value,
    label: labels[lang][index],
  }));
};


export const COUNTRIES: Country[] = [
    { code: 'US', name: 'United States', language: 'English' },
    { code: 'KR', name: 'South Korea', language: 'Korean' },
    { code: 'JP', name: 'Japan', language: 'Japanese' },
    { code: 'IN', name: 'India', language: 'Hindi' },
    { code: 'BR', name: 'Brazil', language: 'Portuguese' },
    { code: 'GB', name: 'United Kingdom', language: 'English' },
    { code: 'DE', name: 'Germany', language: 'German' },
    { code: 'FR', name: 'France', language: 'French' },
    { code: 'RU', name: 'Russia', language: 'Russian' },
    { code: 'ID', name: 'Indonesia', language: 'Indonesian' },
    { code: 'MX', name: 'Mexico', language: 'Spanish' },
    { code: 'ES', name: 'Spain', language: 'Spanish' },
    { code: 'CA', name: 'Canada', language: 'English' },
    { code: 'AU', name: 'Australia', language: 'English' },
    { code: 'TR', name: 'Turkey', language: 'Turkish' },
    { code: 'IT', name: 'Italy', language: 'Italian' },
    { code: 'PL', name: 'Poland', language: 'Polish' },
    { code: 'UA', name: 'Ukraine', language: 'Ukrainian' },
    { code: 'NL', name: 'Netherlands', language: 'Dutch' },
    { code: 'AR', name: 'Argentina', language: 'Spanish' },
    { code: 'CO', name: 'Colombia', language: 'Spanish' },
    { code: 'EG', name: 'Egypt', language: 'Arabic' },
    { code: 'SA', name: 'Saudi Arabia', language: 'Arabic' },
    { code: 'AE', name: 'United Arab Emirates', language: 'Arabic' },
    { code: 'TH', name: 'Thailand', language: 'Thai' },
    { code: 'VN', name: 'Vietnam', language: 'Vietnamese' },
    { code: 'PH', name: 'Philippines', language: 'Filipino' },
    { code: 'MY', name: 'Malaysia', language: 'Malay' },
];
