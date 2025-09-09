// 📝 Sentence-based Filter System for Channel Finder
// Pure functions for filtering channel data based on natural language conditions

import { ChannelData } from '../types';

// 🔧 Filter Condition Types
export interface FilterCondition {
  id: string;
  type: 'videoCount' | 'subscribers' | 'totalViews' | 'avgViews' | 'monthlyRevenue' | 'operatingPeriod' | 'uploadFrequency';
  operator: 'gte' | 'lte' | 'eq' | 'between';
  value: number | [number, number];
  label: string;
  description: string;
}

// 🎯 Filter State Interface (matches existing FilterTagsSection)
export interface FilterState {
  videoCount?: {
    min?: number;
    max?: number;
  };
  subscribers?: {
    min?: number;
    max?: number;
  };
  totalViews?: {
    min?: number;
    max?: number;
  };
  monthlyRevenue?: {
    min?: number;
    max?: number;
  };
  operatingPeriod?: {
    min?: number;
    max?: number;
  };
  uploadFrequency?: {
    min?: number;
    max?: number;
  };
  videoRevenue?: {
    videoCount?: number;
    revenue?: number;
  };
  periodRevenue?: {
    period?: number;
    revenue?: number;
  };
  videoSubscribers?: {
    videoCount?: number;
    subscribers?: number;
  };
}

// 🚀 Main Filter Function - Apply all active filters to channel data
export const applyFilters = (channels: ChannelData[], filterState: FilterState): ChannelData[] => {
  return channels.filter(channel => {
    // Video Count Filter
    if (filterState.videoCount) {
      if (filterState.videoCount.min && channel.videosCount < filterState.videoCount.min) return false;
      if (filterState.videoCount.max && channel.videosCount > filterState.videoCount.max) return false;
    }

    // Subscribers Filter
    if (filterState.subscribers) {
      if (filterState.subscribers.min && channel.subscribers < filterState.subscribers.min) return false;
      if (filterState.subscribers.max && channel.subscribers > filterState.subscribers.max) return false;
    }

    // Total Views Filter
    if (filterState.totalViews) {
      if (filterState.totalViews.min && channel.totalViews < filterState.totalViews.min) return false;
      if (filterState.totalViews.max && channel.totalViews > filterState.totalViews.max) return false;
    }

    // Monthly Revenue Filter (calculated on-the-fly)
    if (filterState.monthlyRevenue) {
      // Simple revenue estimation: totalViews / 1000 * 2 (rough RPM) / operatingPeriod
      const estimatedMonthlyRevenue = (channel.totalViews / 1000 * 2) / Math.max(channel.operatingPeriod, 1);
      if (filterState.monthlyRevenue.min && estimatedMonthlyRevenue < filterState.monthlyRevenue.min) return false;
      if (filterState.monthlyRevenue.max && estimatedMonthlyRevenue > filterState.monthlyRevenue.max) return false;
    }

    // Operating Period Filter
    if (filterState.operatingPeriod) {
      if (filterState.operatingPeriod.min && channel.operatingPeriod < filterState.operatingPeriod.min) return false;
      if (filterState.operatingPeriod.max && channel.operatingPeriod > filterState.operatingPeriod.max) return false;
    }

    // Upload Frequency Filter
    if (filterState.uploadFrequency) {
      if (filterState.uploadFrequency.min && channel.uploadFrequency < filterState.uploadFrequency.min) return false;
      if (filterState.uploadFrequency.max && channel.uploadFrequency > filterState.uploadFrequency.max) return false;
    }

    // Video Revenue Filter - Combined condition: videoCount >= 100 AND revenue >= 1000
    if (filterState.videoRevenue) {
      // 영상개수 조건 확인 (100개 이하)
      if (filterState.videoRevenue.videoCount && channel.videosCount > filterState.videoRevenue.videoCount) return false;
      
      // 수익 조건 확인 (영상당 예상 수익)
      if (filterState.videoRevenue.revenue) {
        const estimatedRevenuePerVideo = (channel.totalViews / 1000 * 2) / Math.max(channel.videosCount, 1);
        if (estimatedRevenuePerVideo < filterState.videoRevenue.revenue) return false;
      }
    }

    // Period Revenue Filter - Combined condition: operatingPeriod <= period AND revenue >= revenue
    if (filterState.periodRevenue) {
      // 운영기간 조건 확인 (1년 = 12개월)
      if (filterState.periodRevenue.period) {
        const maxMonths = filterState.periodRevenue.period * 12; // 년수를 개월로 변환
        if (channel.operatingPeriod > maxMonths) return false;
      }
      
      // 수익 조건 확인 (월평균 수익)
      if (filterState.periodRevenue.revenue) {
        const estimatedMonthlyRevenue = (channel.totalViews / 1000 * 2) / Math.max(channel.operatingPeriod, 1);
        if (estimatedMonthlyRevenue < filterState.periodRevenue.revenue) return false;
      }
    }

    // Video Subscribers Filter - Combined condition: videoCount <= 100 AND subscribers >= 100000
    if (filterState.videoSubscribers) {
      // 영상개수 조건 확인 (100개 이하)
      if (filterState.videoSubscribers.videoCount && channel.videosCount > filterState.videoSubscribers.videoCount) return false;
      
      // 구독자 조건 확인 (10만명 이상)
      if (filterState.videoSubscribers.subscribers && channel.subscribers < filterState.videoSubscribers.subscribers) return false;
    }

    return true; // Channel passes all filters
  });
};

// 🏷️ Predefined Filter Presets - Common filtering scenarios
export const FILTER_PRESETS: { [key: string]: FilterCondition } = {
  // Video Count Presets
  highVideoCount: {
    id: 'highVideoCount',
    type: 'videoCount',
    operator: 'gte',
    value: 100,
    label: '영상개수 100개 이상',
    description: 'Channels with 100+ videos'
  },
  megaVideoCount: {
    id: 'megaVideoCount',
    type: 'videoCount',
    operator: 'gte',
    value: 1000,
    label: '영상개수 1000개 이상',
    description: 'Channels with 1000+ videos'
  },

  // Subscriber Presets
  millionSubs: {
    id: 'millionSubs',
    type: 'subscribers',
    operator: 'gte',
    value: 1000000,
    label: '구독자 100만 이상',
    description: 'Channels with 1M+ subscribers'
  },
  tenMillionSubs: {
    id: 'tenMillionSubs',
    type: 'subscribers',
    operator: 'gte',
    value: 10000000,
    label: '구독자 1000만 이상',
    description: 'Channels with 10M+ subscribers'
  },

  // Views Presets
  billionViews: {
    id: 'billionViews',
    type: 'totalViews',
    operator: 'gte',
    value: 1000000000,
    label: '총조회수 10억 이상',
    description: 'Channels with 1B+ total views'
  },

  // Operating Period Presets
  establishedChannel: {
    id: 'establishedChannel',
    type: 'operatingPeriod',
    operator: 'gte',
    value: 60,
    label: '운영기간 5년 이상',
    description: 'Channels operating for 5+ years'
  },

  // Upload Frequency Presets
  activeUploader: {
    id: 'activeUploader',
    type: 'uploadFrequency',
    operator: 'gte',
    value: 1,
    label: '주 1회 이상 업로드',
    description: 'Channels uploading 1+ times per week'
  },
  dailyUploader: {
    id: 'dailyUploader',
    type: 'uploadFrequency',
    operator: 'gte',
    value: 7,
    label: '매일 업로드',
    description: 'Channels uploading daily'
  }
};

// 🔍 Helper function to get filter preset by ID
export const getFilterPreset = (id: string): FilterCondition | undefined => {
  return FILTER_PRESETS[id];
};

// 🌐 Helper function to convert FilterState to active conditions list
export const getActiveFilterConditions = (filterState: FilterState): FilterCondition[] => {
  const conditions: FilterCondition[] = [];
  
  Object.entries(filterState).forEach(([key, value]) => {
    if (value && typeof value === 'object') {
      if (value.min) {
        conditions.push({
          id: `${key}_min`,
          type: key as any,
          operator: 'gte',
          value: value.min,
          label: `${key} ${value.min} 이상`,
          description: `${key} >= ${value.min}`
        });
      }
      if (value.max) {
        conditions.push({
          id: `${key}_max`,
          type: key as any,
          operator: 'lte',
          value: value.max,
          label: `${key} ${value.max} 이하`,
          description: `${key} <= ${value.max}`
        });
      }
    }
  });

  return conditions;
};