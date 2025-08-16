
export interface YouTubeShort {
  id: string;
  title: string;
  thumbnailUrl: string;
  channelTitle: string;
  channelId?: string;
  publishedAt: string;
  viewCount: number;
  duration?: string;
  subscriberCount?: number;
  viewsPerSubscriber?: number;
}

export interface Country {
  code: string;
  name: string;
  language: string;
}

export interface DateRangeOption {
  value: string;
  label: string;
}

export type SortOption = 'viewCount' | 'date' | 'viewsPerSubscriber';

export type Language = 'en' | 'ko' | 'ja' | 'zh' | 'hi' | 'es' | 'fr' | 'de' | 'nl' | 'pt' | 'ru';

export interface LanguageOption {
  code: Language;
  name: string; // English name
  nativeName: string; // Name in its own language
}

export interface Article {
  id: number;
  title: string;
  date: string;
  excerpt: string;
  content: string;
  category: string;
}
