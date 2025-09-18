import { Language } from '../../types';

export interface ChannelFinderProps {
  language: Language;
}

export interface ChannelData {
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
  videoUrl?: string; // 선택된 비디오의 YouTube URL (임베드용)
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