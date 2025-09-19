import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ChannelData } from '../components/ChannelFinder/types';
import { cloudflareService } from '../services/mainFinder/cloudflareService';

interface ChannelFinderContextType {
  channelData: ChannelData[];
  channelIdSet: Set<string>;
  isLoading: boolean;
  error: string | null;
  isChannelInFinder: (channelId: string) => boolean;
}

const ChannelFinderContext = createContext<ChannelFinderContextType | undefined>(undefined);

interface ChannelFinderProviderProps {
  children: ReactNode;
}

// YouTube 채널ID 형식 검증 함수
const isValidYouTubeChannelId = (id: string): boolean => {
  return /^UC[A-Za-z0-9_-]{22}$/.test(id);
};

// 채널ID Set 생성 함수
const createChannelIdSet = (channelData: ChannelData[]): Set<string> => {
  const channelIdSet = new Set<string>();

  channelData.forEach(channel => {
    // channelId가 있으면 추가 (우선순위 1)
    if (channel.channelId && isValidYouTubeChannelId(channel.channelId)) {
      channelIdSet.add(channel.channelId);
    }
    // id도 channelId 형식이면 추가 (백업)
    if (channel.id && isValidYouTubeChannelId(channel.id)) {
      channelIdSet.add(channel.id);
    }
  });

  console.log('🔍 [DEBUG] ChannelIdSet 생성 완료:', {
    totalChannels: channelData.length,
    validChannelIds: channelIdSet.size,
    channelIds: Array.from(channelIdSet).slice(0, 5) // 처음 5개만 로깅
  });

  return channelIdSet;
};

export const ChannelFinderProvider: React.FC<ChannelFinderProviderProps> = ({ children }) => {
  const [channelData, setChannelData] = useState<ChannelData[]>([]);
  const [channelIdSet, setChannelIdSet] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 채널 데이터 로드
  useEffect(() => {
    const loadChannelData = async () => {
      try {
        setIsLoading(true);
        console.log('📊 [INFO] ChannelFinder 데이터 로딩 시작...');

        const result = await cloudflareService.getChannelData();

        if (result.success && result.data.length > 0) {
          console.log('✅ [SUCCESS] ChannelFinder 데이터 로드 성공:', result.data.length, '개');
          setChannelData(result.data);

          // 고속 검색을 위한 Set 생성
          const idSet = createChannelIdSet(result.data);
          setChannelIdSet(idSet);

          setError(null);
        } else {
          console.warn('⚠️ [WARNING] ChannelFinder 데이터 로드 실패');
          setError('채널 데이터를 불러올 수 없습니다.');
        }
      } catch (err) {
        console.error('❌ [ERROR] ChannelFinder 데이터 로딩 에러:', err);
        setError(err instanceof Error ? err.message : '알 수 없는 오류');
      } finally {
        setIsLoading(false);
      }
    };

    loadChannelData();
  }, []);

  // O(1) 성능의 매칭 함수
  const isChannelInFinder = (channelId: string): boolean => {
    if (!channelId || !isValidYouTubeChannelId(channelId)) {
      return false;
    }

    const exists = channelIdSet.has(channelId);

    // if (exists) {
    //   console.log('💖 [MATCH] 채널파인더에서 발견:', channelId);
    // }

    return exists;
  };

  const value: ChannelFinderContextType = {
    channelData,
    channelIdSet,
    isLoading,
    error,
    isChannelInFinder
  };

  return (
    <ChannelFinderContext.Provider value={value}>
      {children}
    </ChannelFinderContext.Provider>
  );
};

// Context 사용을 위한 hook
export const useChannelFinder = (): ChannelFinderContextType => {
  const context = useContext(ChannelFinderContext);
  if (context === undefined) {
    throw new Error('useChannelFinder must be used within a ChannelFinderProvider');
  }
  return context;
};