import React, { useState } from 'react';
import ExplorationSidebar from './ExplorationSidebar';
import ExplorationExchangeRateModal from './ExplorationExchangeRateModal';
import { getCountryRpm, getExplorationInitialRpm, getExplorationCountryDisplayName, calculateExplorationRevenue, getChannelFinderRpmByCountry, calculateExplorationMonthlyRevenue } from '../../utils/explorationRpmUtils';
import { Language } from '../../types';
import { getChannelFinderTranslation, channelFinderI18n, formatLocalizedNumber } from '../../i18n/channelFinderI18n';
import countryRpmDefaults from '../../data/countryRpmDefaults.json';

export interface RankingData {
  rank: number;
  change: string;
  title: string;
  tags: string[];
  date: string;
  views: string; // 개별 영상 조회수
  thumbnail?: string; // 비디오 썸네일 추가
  totalChannelViews?: string; // 채널 총 조회수 (dailyViewsHistory의 최신 totalViews)
  country?: string; // 국가 정보 (snapshots[].country)
  vsvp?: number; // 숏폼 조회수 비율 (snapshots[].vsvp)
  vlvp?: number; // 롱폼 조회수 비율 (snapshots[].vlvp)
  vesv?: string; // 숏폼 예상 조회수 (snapshots[].vesv)
  velv?: string; // 롱폼 예상 조회수 (snapshots[].velv)
  channelId?: string; // 채널 ID (channelId)
  // 📊 ChannelFinder 호환 실제 API 필드들
  gavg?: number;        // 평균 조회수 (averageViewsPerVideo)
  gvcc?: number;        // 총 영상수 (videosCount)
  gspm?: number;        // 월간 구독자 증가수 (subsGainedPerMonth)
  gspy?: number;        // 년간 구독자 증가수 (subsGainedPerYear)
  gspd?: number;        // 일일 구독자 증가수 (subsGainedPerDay)
  gsub?: number;        // 구독 전환율 (subscriberConversionRate) - 핵심!
  gage?: number;        // 채널 나이(일) (channelAgeInDays) - 운영기간 계산용
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

  // 📊 채널파인더와 동일한 국가 옵션 생성
  const countryOptions = Object.keys(countryRpmDefaults).map(country => ({
    value: country,
    label: getExplorationCountryDisplayName('ko', country)
  }));

  // 📊 RPM 상태 관리 (채널파인더와 동일한 로직)
  const initialRpm = getExplorationInitialRpm('ko'); // 기본값: 한국
  const [shortsRpm, setShortsRpm] = useState(initialRpm.shorts);
  const [longRpm, setLongRpm] = useState(initialRpm.long);
  const [currentCountry, setCurrentCountry] = useState('South Korea');

  // 💱 환율 상태 관리 (채널파인더와 완전 동일)
  const [exchangeRate, setExchangeRate] = useState(1300);
  const [localExchangeRate, setLocalExchangeRate] = useState(1300);
  const [exchangeRateModalOpen, setExchangeRateModalOpen] = useState(false);
  const [tempExchangeRate, setTempExchangeRate] = useState(1300);

  // 💰 채널파인더 방식: 비율 상태들 (실시간 조정 가능)
  const [shortsPercentage, setShortsPercentage] = useState(20);
  const [longPercentage, setLongPercentage] = useState(80);
  // 중복 제거 확인용 주석

  // 💰 채널파인더 방식: 수익 계산 함수들 (ExplorationSidebar에서 사용하는 동일한 selectedChannel 데이터 사용)
  const calculateTotalRevenueValue = (shortsPercentage: number, longPercentage: number, shortsRpm: number, longRpm: number) => {
    if (!selectedItem) return 0;

    const selectedChannel = convertToChannelData(selectedItem);
    if (!selectedChannel) return 0;

    // ExplorationSidebar와 완전 동일한 계산 (개별 수익의 합)
    const shortsRevenue = Math.round((selectedChannel.totalViews * (shortsPercentage / 100) / 1000) * shortsRpm);
    const longRevenue = Math.round((selectedChannel.totalViews * (longPercentage / 100) / 1000) * longRpm);

    return shortsRevenue + longRevenue;
  };

  const calculateTotalRevenue = (shortsPercentage: number, longPercentage: number, shortsRpm: number, longRpm: number) => {
    const dollarText = getChannelFinderTranslation(channelFinderI18n, 'ko', 'currencies.USD') || '달러';
    if (!selectedItem) return formatLocalizedNumber(0, 'ko', dollarText);

    const totalUsd = calculateTotalRevenueValue(shortsPercentage, longPercentage, shortsRpm, longRpm);
    return formatLocalizedNumber(totalUsd, 'ko', dollarText);
  };

  const calculateLocalCurrencyRevenue = (shortsPercentage: number, longPercentage: number, shortsRpm: number, longRpm: number) => {
    if (!selectedItem) return formatLocalizedNumber(0, 'ko', '원');

    // 채널파인더 방식으로 USD 계산 후 환율 적용
    const totalRevenueUsd = calculateTotalRevenueValue(shortsPercentage, longPercentage, shortsRpm, longRpm);
    const localTotal = Math.round(totalRevenueUsd * exchangeRate);

    return formatLocalizedNumber(localTotal, 'ko', '원');
  };

  // 환율 모달 관련 함수들 (채널파인더에서 완전 복사)
  const openExchangeRateModal = () => {
    setTempExchangeRate(exchangeRate);
    setExchangeRateModalOpen(true);
  };

  const closeExchangeRateModal = () => {
    setExchangeRateModalOpen(false);
  };

  const applyExchangeRate = () => {
    setExchangeRate(tempExchangeRate); // exchangeRate를 업데이트하도록 수정
    setLocalExchangeRate(tempExchangeRate); // 기존 로직도 유지
    setExchangeRateModalOpen(false);
  };

  // 🎯 실제 RPM 기반 Props (채널파인더와 동일한 구조)
  const explorationProps = {
    formatSubscribers: (count: number) => count.toLocaleString(),
    formatOperatingPeriod: (period: number) => {
      const years = Math.floor(period / 12);
      const remainingMonths = period % 12;
      const yearUnit = getChannelFinderTranslation(channelFinderI18n, 'ko', 'units.years');
      const monthUnit = getChannelFinderTranslation(channelFinderI18n, 'ko', 'units.months');
      return `${years}${yearUnit} ${remainingMonths}${monthUnit}`;
    },
    formatGrowth: (growth: number) => {
      // 채널파인더 방식: 포맷팅 로직 완전 복사
      const formatGrowthNumber = (num: number): string => {
        if (num >= 100000000) { // 억 단위
          const eok = Math.floor(num / 100000000);
          const man = Math.floor((num % 100000000) / 10000);
          if (man >= 1000) {
            const roundedMan = Math.round(man / 1000) * 1000;
            return `${eok}억 ${roundedMan / 1000}천만`;
          } else if (man > 0) {
            return `${eok}억 ${man}만`;
          } else {
            return `${eok}억`;
          }
        } else if (num >= 10000) { // 만 단위
          const man = Math.floor(num / 10000);
          const remainder = num % 10000;
          if (remainder > 0) {
            return `${man}만 ${remainder.toLocaleString()}`;
          } else {
            return `${man}만`;
          }
        } else {
          return num.toLocaleString();
        }
      };
      return '+' + formatGrowthNumber(growth);
    },
    getCountryDisplayName: (language: any, country: string) => getExplorationCountryDisplayName(language, country),
    chartData: [],
    growthTooltips: [],
    hoveredPoint: null,
    hoveredStat: null,
    setHoveredStat: () => {},
    shortsPercentage: selectedItem?.vsvp ?? 75, // 실제 API 데이터 사용 (vsvp), 0도 정상값
    longPercentage: selectedItem?.vlvp ?? 25, // 실제 API 데이터 사용 (vlvp), 0도 정상값
    shortsRpm: shortsRpm, // 채널파인더 방식: 국가별 자동 선택된 쇼츠 RPM
    longRpm: longRpm, // 채널파인더 방식: 국가별 자동 선택된 롱폼 RPM
    exchangeRate: exchangeRate,
    currentCountry: currentCountry, // 실제 선택된 국가
    dropdownState: { isOpen: false, type: null },
    openDropdown: () => {},
    countryOptions: countryOptions,
    onCountrySelect: (country: string) => {
      setCurrentCountry(country);
      // 채널파인더와 동일한 방식: 국가 선택 시 RPM 자동 업데이트
      const newRpm = getChannelFinderRpmByCountry(country);
      setShortsRpm(newRpm.shorts);
      setLongRpm(newRpm.long);
    },
    adjustShortsRpm: (isIncrease: boolean) => {
      setShortsRpm(prev => isIncrease ? Math.min(prev + 0.01, 10) : Math.max(prev - 0.01, 0));
    },
    adjustLongRpm: (isIncrease: boolean) => {
      setLongRpm(prev => isIncrease ? Math.min(prev + 0.1, 50) : Math.max(prev - 0.1, 0));
    },
    calculateTotalRevenue: () => calculateTotalRevenue(selectedItem?.vsvp ?? 75, selectedItem?.vlvp ?? 25, shortsRpm, longRpm),
    calculateLocalCurrencyRevenue: () => calculateLocalCurrencyRevenue(selectedItem?.vsvp ?? 75, selectedItem?.vlvp ?? 25, shortsRpm, longRpm),
    openExchangeRateModal: openExchangeRateModal,
    setExchangeRate: setExchangeRate,
    formatViews: (views: number) => views.toLocaleString(),
    formatVideosCount: (count: number) => `${count}개`,
    formatUploadFrequency: (videosPerWeek: number, language: Language) => {
      const weekUnit = getChannelFinderTranslation(channelFinderI18n, 'ko', 'units.perWeek');

      if (videosPerWeek >= 7) {
        const perDay = Math.round(videosPerWeek / 7);
        return `하루 ${perDay}개`;
      } else {
        return `${videosPerWeek}${weekUnit}`;
      }
    },
    currencyExchangeData: {},
    cf: (key: string) => key
  };

  // 랭킹 아이템 클릭 핸들러
  const handleItemClick = (item: RankingData) => {
    setSelectedItem(item);
    setIsSidebarOpen(true);

    // 📊 채널파인더 방식: 채널 국가에 따라 정확한 RPM 자동 설정
    const channelCountry = item.country === 'null' || item.country === null || !item.country ? 'United States' : item.country;
    const channelFinderRpm = getChannelFinderRpmByCountry(channelCountry);
    setShortsRpm(channelFinderRpm.shorts);
    setLongRpm(channelFinderRpm.long);
    setCurrentCountry(channelCountry);
  };

  // RankingData를 ChannelData로 변환 (실제 API 데이터 기반)
  const convertToChannelData = (item: RankingData) => {
    if (!item) return null;

    // 구독자 수 파싱 (subscriberHistory 최신 count, M/K 형태 처리)
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

    // 📊 ChannelFinder 방식: 실제 API 데이터만 사용 (20년차 개발자 접근법)
    const avgViews = item.gavg || 0; // gavg 실제 데이터만 사용
    const videosCount = item.gvcc || 0; // gvcc 실제 데이터만 사용
    // 📊 ChannelFinder 방식: gsub 필드 사용 (구독 전환율)
    const subscribersPerVideo = item.gsub || 0;
    const uploadFrequency = item.gupw || 0; // gupw → 주당 업로드 수 (실제 API 데이터)

    // 📊 실제 API 데이터 사용 (vsvp, vlvp) - 채널파인더와 동일한 로직
    const shortsViewsPercentage = item.vsvp !== undefined && item.vsvp !== null ? item.vsvp : 75; // 기본값 75%
    const longformViewsPercentage = item.vlvp !== undefined && item.vlvp !== null ? item.vlvp : 25; // 기본값 25%

    // vesv, velv 값이 있으면 사용, 없으면 총 조회수 기반 계산
    const shortsTotalViews = item.vesv ? parseInt(item.vesv.toString()) : Math.floor(totalViews * (shortsViewsPercentage / 100));
    const longTotalViews = item.velv ? parseInt(item.velv.toString()) : Math.floor(totalViews * (longformViewsPercentage / 100));

    // YouTube URL 생성 (채널 ID 기반 직접 링크)
    const youtubeUrl = `https://www.youtube.com/channel/${item.channelId}`;

    return {
      id: `rank_${item.rank}`,
      rank: item.rank,
      channelName: item.channel.name,
      category: item.tags?.[0]?.replace('#', '').toLowerCase() === 'general' ? 'GENERAL' : item.tags?.[0]?.replace('#', '').toUpperCase() || 'ENTERTAINMENT',
      subscribers: subscribers,
      // 📊 ChannelFinder 방식: 실제 API 데이터만 사용 (랜덤값 제거)
      yearlyGrowth: item.gspy || 0, // gspy 실제 데이터만 사용
      monthlyGrowth: item.gspm || 0, // gspm 실제 데이터만 사용
      dailyGrowth: item.gspd || 0, // gspd 실제 데이터만 사용
      subscribersPerVideo: subscribersPerVideo,
      operatingPeriod: Math.round((item.gage || 0) / 30), // gage → 채널 나이(일) → 운영기간(월) 변환 (channelAgeInDays)
      totalViews: totalViews,
      avgViews: avgViews,
      videosCount: videosCount,
      uploadFrequency: uploadFrequency,
      country: item.country === 'null' || item.country === null || !item.country ? '기타' : item.country, // snapshots.country 사용, null은 "기타"
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
          {...explorationProps}
        />
      )}

      {/* 환율 모달 컴포넌트 */}
      <ExplorationExchangeRateModal
        isOpen={exchangeRateModalOpen}
        tempExchangeRate={tempExchangeRate}
        onTempRateChange={setTempExchangeRate}
        onClose={closeExchangeRateModal}
        onApply={applyExchangeRate}
        language={'ko' as Language}
        currencySymbol="원"
      />
    </div>
  );
};

export default RankingTable;