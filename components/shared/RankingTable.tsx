import React, { useState } from 'react';
import ExplorationSidebar from './ExplorationSidebar';

export interface RankingData {
  rank: number;
  change: string;
  title: string;
  tags: string[];
  date: string;
  views: string; // 개별 영상 조회수
  thumbnail?: string; // 비디오 썸네일 추가
  totalChannelViews?: string; // 채널 총 조회수 (dailyViewsHistory의 최신 totalViews)
  channel: {
    name: string;
    subs: string;
    avatar: string;
  };
}

export interface RankingTableProps {
  data: RankingData[];
  currentPage: number;
  onPageChange: (page: number) => void;
  totalPages: number;
}

const RankingTable: React.FC<RankingTableProps> = ({
  data,
  currentPage,
  onPageChange,
  totalPages
}) => {
  // 사이드바 상태 관리
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<RankingData | null>(null);

  // 임시: 최소한의 Props만 전달 (추후 완전 구현)
  const dummyProps = {
    formatSubscribers: (count: number) => count.toLocaleString(),
    formatOperatingPeriod: (period: number) => `${period}개월`,
    formatGrowth: (growth: number) => `${growth > 0 ? '+' : ''}${growth}%`,
    getCountryDisplayName: (language: any, country: string) => country,
    chartData: [],
    growthTooltips: [],
    hoveredPoint: null,
    hoveredStat: null,
    setHoveredStat: () => {},
    shortsPercentage: 70,
    longPercentage: 30,
    shortsRpm: 0.5,
    longRpm: 2.0,
    exchangeRate: 1300,
    currentCountry: 'KR',
    dropdownState: { isOpen: false, type: null },
    openDropdown: () => {},
    countryOptions: [],
    onCountrySelect: () => {},
    adjustShortsRpm: () => {},
    adjustLongRpm: () => {},
    calculateTotalRevenue: () => '$0',
    calculateLocalCurrencyRevenue: () => '0원',
    openExchangeRateModal: () => {},
    setExchangeRate: () => {},
    formatViews: (views: number) => views.toLocaleString(),
    formatVideosCount: (count: number) => `${count}개`,
    formatUploadFrequency: (freq: number) => `주 ${freq}회`,
    currencyExchangeData: {},
    cf: (key: string) => key
  };

  // 랭킹 아이템 클릭 핸들러
  const handleItemClick = (item: RankingData) => {
    setSelectedItem(item);
    setIsSidebarOpen(true);
  };

  // RankingData를 ChannelData로 변환 (실제 API 데이터 기반)
  const convertToChannelData = (item: RankingData) => {
    if (!item) return null;

    // 구독자 수 파싱 (M, K 형태 처리)
    const parseSubscriberCount = (subText: string): number => {
      const cleanText = subText.replace(/[,]/g, '');
      if (cleanText.includes('M')) {
        return parseFloat(cleanText.replace('M', '')) * 1000000;
      } else if (cleanText.includes('K')) {
        return parseFloat(cleanText.replace('K', '')) * 1000;
      }
      return parseInt(cleanText) || 100000;
    };

    // 조회수 파싱 (+ 기호 및 M, K 형태 처리)
    const parseViews = (viewsText: string): number => {
      const cleanText = viewsText.replace(/[+,]/g, '');
      if (cleanText.includes('M')) {
        return parseFloat(cleanText.replace('M', '')) * 1000000;
      } else if (cleanText.includes('K')) {
        return parseFloat(cleanText.replace('K', '')) * 1000;
      }
      return parseInt(cleanText) || 1000000;
    };

    const subscribers = parseSubscriberCount(item.channel.subs);

    // 📊 채널 총 조회수 사용 (dailyViewsHistory의 최신 totalViews)
    const totalViews = item.totalChannelViews
      ? parseViews(item.totalChannelViews)
      : parseViews(item.views) * 100; // fallback: 개별 영상 조회수 * 100

    // 실제 데이터 기반 추정값 계산
    const avgViews = Math.floor(totalViews * 0.3); // 총 조회수의 30%를 평균으로 추정
    const videosCount = Math.floor(subscribers / 5000) || 200; // 구독자 수 기반 영상 수 추정
    const subscribersPerVideo = Math.floor(subscribers / videosCount);
    const uploadFrequency = Math.min(3.5, Math.max(0.2, videosCount / 100)); // 주당 업로드 빈도 추정

    // 쇼츠 vs 롱폼 비율 (쇼츠가 더 많다고 가정)
    const shortsViewsPercentage = 75;
    const longformViewsPercentage = 25;
    const shortsTotalViews = Math.floor(totalViews * (shortsViewsPercentage / 100));
    const longTotalViews = Math.floor(totalViews * (longformViewsPercentage / 100));

    // YouTube URL 생성 (채널명 기반 검색 URL)
    const youtubeUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(item.channel.name)}`;

    return {
      id: `rank_${item.rank}`,
      rank: item.rank,
      channelName: item.channel.name,
      category: item.tags?.[0]?.replace('#', '').toUpperCase() || 'ENTERTAINMENT',
      subscribers: subscribers,
      yearlyGrowth: 15.0 + Math.random() * 20, // 15-35% 범위로 랜덤
      monthlyGrowth: 2.0 + Math.random() * 8, // 2-10% 범위로 랜덤
      dailyGrowth: 0.1 + Math.random() * 2, // 0.1-2.1% 범위로 랜덤
      subscribersPerVideo: subscribersPerVideo,
      operatingPeriod: Math.floor(12 + Math.random() * 36), // 12-48개월 랜덤
      totalViews: totalViews,
      avgViews: avgViews,
      videosCount: videosCount,
      uploadFrequency: uploadFrequency,
      country: 'KR', // 기본값 (추후 실제 API에서 국가 정보 연동 가능)
      youtubeUrl: youtubeUrl,
      shortsTotalViews: shortsTotalViews,
      longTotalViews: longTotalViews,
      shortsViewsPercentage: shortsViewsPercentage,
      longformViewsPercentage: longformViewsPercentage,
      subscriberHistory: [] // 추후 실제 구독자 히스토리 연동 가능
    };
  };

  // 사이드바 닫기 핸들러
  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
    setSelectedItem(null);
  };

  // 데이터를 두 그룹으로 나누기 (1-5위, 6-10위)
  const leftData = data.slice(0, 5);
  const rightData = data.slice(5, 10);

  const renderTableBlock = (blockData: RankingData[], blockTitle: string) => (
    <div style={{ border: '1px solid rgb(229, 231, 235)', borderRadius: '8px', padding: '12px' }}>
      {/* 헤더 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '0.1fr 1fr 0.7fr 0.7fr 1fr',
        gap: '8px',
        padding: '8px 0',
        borderBottom: '1px solid #d1d5db',
        fontSize: '15px',
        fontWeight: '600',
        color: '#374151'
      }}>
        <div></div>
        <div style={{ textAlign: 'center', marginLeft: '-20px' }}>채널</div>
        <div style={{ textAlign: 'center', marginLeft: '-30px' }}>구독자수</div>
        <div style={{ textAlign: 'center', marginLeft: '-30px' }}>조회수</div>
        <div style={{ textAlign: 'center', marginLeft: '-30px' }}>제목</div>
      </div>

      {/* 데이터 행들 */}
      {blockData.map((item, i) => {
        // 순위 계산: 페이지 기반 + 블럭 내 인덱스
        const displayRank = (currentPage - 1) * 10 + (blockTitle === '1-5위' ? i + 1 : i + 6);

        return (
        <div key={i} style={{
          display: 'grid',
          gridTemplateColumns: '0.1fr 1fr 0.7fr 0.7fr 1fr',
          gap: '8px',
          padding: '8px 0',
          borderBottom: i < 4 ? '1px solid #e5e7eb' : 'none',
          alignItems: 'center',
          borderRadius: '6px',
          transition: 'background-color 0.2s ease',
          cursor: 'pointer'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#f9fafb';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
        onClick={() => handleItemClick(item)}>
          {/* 순위 */}
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '14px', fontWeight: '600' }}>{displayRank}</span>
          </div>

          {/* 채널 */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: '#d1d5db',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '6px',
              color: '#6b7280',
              overflow: 'hidden'
            }}>
              {item.channel.avatar && item.channel.avatar !== '👤' ? (
                <img
                  src={item.channel.avatar}
                  alt={item.channel.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              ) : (
                '👤'
              )}
            </div>
            <div>
              <div style={{
                fontSize: '15px',
                fontWeight: '500',
                color: '#111827',
                textAlign: 'center'
              }}>
                {item.channel.name}
              </div>
            </div>
          </div>

          {/* 구독자수 */}
          <div style={{
            fontSize: '15px',
            fontWeight: '500',
            color: '#6b7280',
            textAlign: 'center'
          }}>
            {item.channel.subs}
          </div>

          {/* 조회수 */}
          <div style={{
            fontSize: '15px',
            fontWeight: '600',
            color: '#ef4444',
            textAlign: 'center'
          }}>
            {item.views}
          </div>

          {/* 제목 */}
          <div>
            {/* 썸네일 */}
            <div style={{
              width: '180px',
              height: '100px',
              backgroundColor: '#d1d5db',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '8px',
              color: '#6b7280',
              marginBottom: '4px',
              overflow: 'hidden'
            }}>
              {item.thumbnail ? (
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              ) : (
                '썸네일'
              )}
            </div>

            <div>
              <div style={{
                fontSize: '15px',
                fontWeight: '500',
                color: '#111827',
                marginBottom: '2px',
                lineHeight: '1.3',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                width: '180px'
              }}>
                {item.title}
              </div>
              <div style={{
                fontSize: '13px',
                fontWeight: '400',
                color: '#9ca3af'
              }}>
                {item.date}
              </div>
            </div>
          </div>
        </div>
        );
      })}
    </div>
  );

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      margin: '16px 0'
    }}>
      {/* 2열 그리드로 테이블 배치 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '15px'
      }}>
        {/* 왼쪽 블럭: 1-5위 */}
        {renderTableBlock(leftData, '1-5위')}

        {/* 오른쪽 블럭: 6-10위 */}
        {renderTableBlock(rightData, '6-10위')}
      </div>

      {/* 사이드바 컴포넌트 */}
      {selectedItem && (
        <ExplorationSidebar
          selectedChannel={convertToChannelData(selectedItem)}
          language={'ko'}
          onClose={handleCloseSidebar}
          {...dummyProps}
        />
      )}
    </div>
  );
};

export default RankingTable;