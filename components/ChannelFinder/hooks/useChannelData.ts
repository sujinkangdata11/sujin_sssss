import { useState, useEffect } from 'react';
import { ChannelData } from '../types';
import { cloudflareService } from '../../../services/mainFinder/cloudflareService';

export const useChannelData = () => {
  const [selectedChannel, setSelectedChannel] = useState<ChannelData | null>(null);
  const [sortedChannels, setSortedChannels] = useState<ChannelData[]>([]);
  const [filteredChannels, setFilteredChannels] = useState<ChannelData[]>([]);
  const [loading, setLoading] = useState(true);

  // 채널 데이터 로드
  const loadChannelData = async () => {
    try {
      setLoading(true);
      const result = await cloudflareService.getChannelData();
      
      if (result.success && result.data) {
        setSortedChannels(result.data);
        setFilteredChannels(result.data);
      } else {
        console.warn('채널 데이터 로드 실패:', result.message);
      }
    } catch (error) {
      console.error('채널 데이터 로드 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    selectedChannel,
    setSelectedChannel,
    sortedChannels,
    setSortedChannels,
    filteredChannels,
    setFilteredChannels,
    loading,
    setLoading,
    loadChannelData
  };
};