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
  // YouTube 채널 ID (하트 아이콘 매칭용)
  channelId?: string; // YouTube 채널 ID (UC로 시작하는 24자리)
  customUrl?: string; // YouTube 커스텀 URL (@username 형태)
  // 추가 채널 정보
  thumbnailUrl?: string; // 채널 썸네일 URL
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