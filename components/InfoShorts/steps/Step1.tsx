import React, { useState, useEffect, useCallback } from 'react';
import styles from '../InfoShorts.module.css';
import VideoPlayer from '../VideoPlayer';
import ExplorationBlocks, { ExplorationBlock } from '../../shared/ExplorationBlocks';
import YouTubeFilter, { FilterState } from '../../shared/YouTubeFilter';
import RankingTable, { RankingData } from '../../shared/RankingTable';
import { listupService } from '../../../services/listupService';
import { convertListupToRankingData, ShortsFilterState, ListupChannelData } from '../../../utils/listupDataMapper';
import { infoshortsChannels } from '../../../data/channels/infoshorts-channels';
import { Language } from '../../../types';
import { useExplorationTranslation } from '../../../i18n/explorationI18n';

interface Step1Props {
  currentStep: number;
  previousStep: number;
  navigationDirection: 'next' | 'prev' | null;
  youtubeUrlInput: string;
  setYoutubeUrlInput: (value: string) => void;
  handleLoadVideo: (e: React.FormEvent) => void;
  youtubeVideoId: string;
  requestedTimecode: number;
  timecodeList: number[];
  setRequestedTimecode: (timecode: number) => void;
  videoColumnRef: React.RefObject<HTMLDivElement>;
  language: Language;
}

const Step1: React.FC<Step1Props> = ({
  currentStep,
  previousStep,
  navigationDirection,
  youtubeUrlInput,
  setYoutubeUrlInput,
  handleLoadVideo,
  youtubeVideoId,
  requestedTimecode,
  timecodeList,
  setRequestedTimecode,
  videoColumnRef,
  language
}) => {
  const [showVideo, setShowVideo] = useState(false);
  const [shouldRenderVideo, setShouldRenderVideo] = useState(false);

  // 🌍 다국어 번역 함수
  const et = useExplorationTranslation(language);

  // 필터 상태 관리 - 🌍 번역 키 기반 초기값
  const [filters, setFilters] = useState<FilterState>({
    selectedCategory: et('filterAll'),
    selectedCriteria: et('filterViews'),
    selectedCountry: et('filterWorldwide'),
    selectedPeriod: et('filterMonthly'), // 디폴트: 월간
    selectedDate: '2025-09', // 디폴트: 9월
    selectedChannel: et('filterAll')
  });

  // 랭킹 테이블 페이지네이션 상태
  const [currentRankingPage, setCurrentRankingPage] = useState(1);

  // 실제 데이터 상태 관리
  const [channelData, setChannelData] = useState<ListupChannelData[]>([]);
  const [rankingData, setRankingData] = useState<RankingData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [availableDates, setAvailableDates] = useState<{
    daily: string[];
    weekly: string[];
    monthly: string[];
  }>({
    daily: [],
    weekly: [],
    monthly: []
  });

  // 스켈레톤 로딩 데이터 (실제 데이터 구조와 일치하는 플레이스홀더)
  const skeletonRankingData: RankingData[] = Array.from({ length: 10 }, (_, i) => ({
    rank: i + 1,
    change: '',
    title: '', // 스켈레톤에서는 빈 문자열
    tags: [],
    date: '',
    views: '',
    channel: {
      name: '', // 스켈레톤에서는 빈 문자열
      subs: '',
      avatar: ''
    },
    isSkeleton: true // 스켈레톤 식별용 플래그
  } as RankingData));

  // 실제 데이터에서 사용 가능한 날짜들 추출
  const extractAvailableDates = (channels: ListupChannelData[]) => {
    const allDates = new Set<string>();

    channels.forEach(channel => {
      if (channel.recentThumbnailsHistory) {
        channel.recentThumbnailsHistory.forEach(thumbnail => {
          allDates.add(thumbnail.date);
        });
      }
    });

    const sortedDates = Array.from(allDates).sort((a, b) => b.localeCompare(a)); // 최신순 정렬

    // 일간: 실제 날짜들
    const daily = sortedDates;

    // 주간: 날짜들을 주별로 그룹화
    const weeklyGroups = new Map<string, string[]>();
    daily.forEach(date => {
      const dateObj = new Date(date);
      const weekNum = Math.ceil(dateObj.getDate() / 7);
      const month = dateObj.getMonth() + 1;
      const weekKey = `${month}월 ${weekNum}주`;

      if (!weeklyGroups.has(weekKey)) {
        weeklyGroups.set(weekKey, []);
      }
      weeklyGroups.get(weekKey)?.push(date);
    });
    const weekly = Array.from(weeklyGroups.keys());

    // 월간: 년-월 형태로 그룹화
    const monthlyGroups = new Set<string>();
    daily.forEach(date => {
      const yearMonth = date.slice(0, 7); // YYYY-MM
      const month = parseInt(yearMonth.split('-')[1]);
      monthlyGroups.add(`${month}월`);
    });
    const monthly = Array.from(monthlyGroups);

    return { daily, weekly, monthly };
  };

  // 실제 채널 데이터 로드
  const loadChannelData = async () => {
    setIsLoading(true);
    try {
      const response = await listupService.getExplorationData();

      if (response.success) {
        setChannelData(response.data);

        // 사용 가능한 날짜들 추출
        const dates = extractAvailableDates(response.data);
        setAvailableDates(dates);

        // 초기 필터로 랭킹 데이터 생성 (기본 필터 값 사용) - 🌍 번역 키 기반
        const initialFilter: FilterState = {
          selectedCategory: et('filterAll'),
          selectedCriteria: et('filterViews'),
          selectedCountry: et('filterWorldwide'),
          selectedPeriod: et('filterMonthly'),
          selectedDate: '2025-09',
          selectedChannel: et('filterAll')
        };
        updateRankingData(response.data, initialFilter);
      } else {
        setChannelData([]);
      }
    } catch (error) {
      setChannelData([]);
    } finally {
      setIsLoading(false);
    }
  };

  // 필터에 따른 랭킹 데이터 업데이트 (쇼츠메이커용)
  const updateRankingData = (data: ListupChannelData[], currentFilters: FilterState) => {
    const filterState: ShortsFilterState = {
      category: currentFilters.selectedCategory,
      criteria: currentFilters.selectedCriteria,
      country: currentFilters.selectedCountry,
      period: currentFilters.selectedPeriod,
      date: currentFilters.selectedDate,
      channel: currentFilters.selectedChannel
    };

    const availableChannels = channelData.map(channel =>
      channel.staticData?.title || channel.snapshots?.[0]?.title || ''
    ).filter(Boolean);

    const newRankingData = convertListupToRankingData(data, filterState, availableChannels);
    setRankingData(newRankingData);
  };

  // 필터 변경 핸들러 (useCallback으로 메모이제이션)
  const handleFilterChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);

    // 실제 데이터가 있으면 필터 적용
    if (channelData.length > 0) {
      updateRankingData(channelData, newFilters);
    }
  }, [channelData]);

  // 탐험 블럭들 데이터
  const explorationBlocks: ExplorationBlock[] = [
    {
      id: 'youtube-filter',
      title: (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span>{et('explorationTitle')}</span>
          <span style={{
            fontSize: '12px',
            color: rankingData.length > 0 ? '#28a745' : '#3b82f6',
            fontWeight: 'bold'
          }}>
            {rankingData.length > 0
              ? `✅ ${rankingData.length}${et('statusDataConnected')}`
              : `${et('statusDummyData')}`
            }
          </span>
        </div>
      ),
      onClick: () => {
        console.log('YouTube 필터링 클릭됨');
      },
      content: (
        <YouTubeFilter
          onFilterChange={handleFilterChange}
          language={language}
          channelList={(() => {
            // 채널 데이터를 구독자 수 순으로 정렬한 후 채널명 추출
            const channelsWithSubs = channelData
              .map(channel => {
                const snapshot = channel.snapshots?.[0];
                const title = snapshot?.title || '';

                // 구독자 수 추출
                let subscriberCount = 0;

                if (channel.subscriberHistory && channel.subscriberHistory.length > 0) {
                  // subscriberHistory에서 최신 데이터의 count 사용
                  const latestSub = channel.subscriberHistory.sort((a, b) => {
                    // month 기준으로 최신 순 정렬 (2025-09 형태)
                    return b.month.localeCompare(a.month);
                  })[0];
                  subscriberCount = parseInt(latestSub.count?.toString().replace(/,/g, '') || '0');
                } else if (snapshot?.subscriberCount) {
                  // 백업: snapshot의 subscriberCount 사용
                  subscriberCount = parseInt(snapshot.subscriberCount.toString().replace(/,/g, '') || '0');
                }

                return { title, subscriberCount };
              })
              .filter(channel => channel.title)
              .sort((a, b) => b.subscriberCount - a.subscriberCount) // 구독자 수 많은 순
              .map(channel => channel.title);

            return channelsWithSubs;
          })()}
          availableDates={availableDates}
        />
      )
    },
    {
      id: 'second-block',
      title: (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '20px',
          width: '100%'
        }}>
          {/* 이전 버튼: 데이터1이면 흰색, 아니면 원래 색 */}
          <button style={{
            padding: '8px 16px',
            border: currentRankingPage > 1 ? '1px solid #d1d5db' : '1px solid white',
            borderRadius: '8px',
            backgroundColor: 'white',
            cursor: currentRankingPage > 1 ? 'pointer' : 'default',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: currentRankingPage > 1 ? '#000' : 'white'
          }}
          onClick={() => currentRankingPage > 1 && setCurrentRankingPage(currentRankingPage - 1)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          <span style={{ fontSize: '20px', fontWeight: 'bold' }}>데이터 {currentRankingPage}</span>

          {/* 다음 버튼: 마지막 페이지면 흰색, 아니면 원래 색 */}
          <button style={{
            padding: '8px 16px',
            border: currentRankingPage < 5 ? '1px solid #d1d5db' : '1px solid white',
            borderRadius: '8px',
            backgroundColor: 'white',
            cursor: currentRankingPage < 5 ? 'pointer' : 'default',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: currentRankingPage < 5 ? '#000' : 'white'
          }}
          onClick={() => currentRankingPage < 5 && setCurrentRankingPage(currentRankingPage + 1)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      ),
      onClick: () => {
        console.log('새 블럭 클릭됨');
      },
      content: (
        <div>
          {isLoading && (
            <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
              🔄 {et('statusLoading')}
            </div>
          )}
          <RankingTable
            data={(() => {
              // 실제 API 데이터 우선, 없으면 스켈레톤 데이터
              const data = rankingData.length > 0 ? rankingData : skeletonRankingData;
              const startIndex = (currentRankingPage - 1) * 10;
              const endIndex = startIndex + 10;
              return data.slice(startIndex, endIndex);
            })()}
            currentPage={currentRankingPage}
            onPageChange={setCurrentRankingPage}
            totalPages={Math.ceil((rankingData.length > 0 ? rankingData.length : skeletonRankingData.length) / 10)}
          />
        </div>
      ),
      customStyle: {
        padding: '0 0 clamp(1rem, 4vw, 2rem) 0',
        textAlign: 'center'
      }
    },
    {
      title: '',
      description: '',
      onClick: () => {},
      content: (
        <div style={{
          height: '200px',
          background: 'rgb(249, 250, 251)',
          border: '1px solid rgb(209, 213, 219)',
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#999',
          fontSize: '14px'
        }}>
          <div style={{
            textAlign: 'center',
            lineHeight: '1.6',
            color: '#666'
          }}>
            <div style={{
              fontWeight: 'bold',
              color: '#d97706',
              marginBottom: '12px',
              fontSize: '16px'
            }}>
              ⚠️ 주의사항
            </div>
            <div style={{ fontSize: '14px', fontWeight: 'normal' }}>
              이 데이터는 밤 12시에 데이터를 수집하여, 그 다음날 업데이트하는 방식입니다.
              <br />
              최대 1~3일이 소요되며, 실시간 데이터가 아닙니다.
              <br />
              <br />
              따라서 바로 10분 전 업로드, 1시간 전 업로드의 실시간 데이터를 보기 위해서는
              <br />
              <a
                href="https://www.vidhunt.me/"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: '#2563eb',
                  fontWeight: 'normal',
                  textDecoration: 'underline',
                  cursor: 'pointer'
                }}
              >
                "쇼츠파인더"
              </a>를 이용하셔야 합니다.
            </div>
          </div>
        </div>
      ),
      customStyle: {
        padding: '0 0 clamp(2rem, 6vw, 4rem) 0'
      }
    }
  ];

  // 컴포넌트 마운트 시 실제 데이터 로드
  useEffect(() => {
    loadChannelData();
  }, []);

  useEffect(() => {
    if (youtubeVideoId) {
      // 비디오가 있을 때: 먼저 렌더링한 후 애니메이션 시작
      setShouldRenderVideo(true);
      const timer = setTimeout(() => setShowVideo(true), 100);
      return () => clearTimeout(timer);
    } else {
      // 비디오가 없어질 때: 애니메이션으로 사라진 후 DOM에서 제거
      setShowVideo(false);
      const timer = setTimeout(() => setShouldRenderVideo(false), 600); // 애니메이션 시간과 동일
      return () => clearTimeout(timer);
    }
  }, [youtubeVideoId]);

  return (
    <div
      className="step1-container"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '97%', /* 원복용 삭제처리가능 - 가로폭 살짝 줄임 */
        opacity: currentStep === 1 ? 1 : 0,
        visibility: currentStep === 1 ? 'visible' : 'hidden',
        pointerEvents: currentStep === 1 ? 'auto' : 'none',
        transform: (() => {
          const stepNumber = 1;

          // 현재 활성 카드
          if (currentStep === stepNumber) return 'translateX(0)';

          // 애니메이션 중인 카드들
          if (navigationDirection) {
            // 이전에 보이던 카드 (나가는 카드)
            if (previousStep === stepNumber) {
              return navigationDirection === 'next' ? 'translateX(-100%)' : 'translateX(100%)';
            }
            // 새로 들어올 카드가 이 카드라면 (들어오는 카드)
            if (currentStep === stepNumber) {
              return navigationDirection === 'next' ? 'translateX(100%)' : 'translateX(-100%)';
            }
          }

          // 기본 숨김 상태 - 화면 밖에 대기
          return stepNumber > (currentStep || 1) ? 'translateX(100%)' : 'translateX(-100%)';
        })(),
        transition: 'opacity 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94), visibility 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
      }}
    >
      {/* 메인 카드 - 이제 relative positioning */}
      <div className="step-card" style={{
        position: 'relative',
        background: '#f9fafb',
        border: '1px solid #d1d5db',
        borderRadius: '16px',
        padding: 'clamp(1rem, 4vw, 2rem)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        minHeight: 'fit-content',
        maxHeight: '90vh'
      }}>
      {/* 개발중 안내 메시지 */}

      {/* 제목 - 가로 중앙 정렬 */}
      <div style={{
        fontSize: '26px',
        fontWeight: 'bold',
        color: '#333d4b',
        textAlign: 'center',
        paddingTop: '20px'
      }}>
        쇼츠링크 입력하기
      </div>

      {/* URL 입력 폼 - 가로 중앙 정렬 */}
      <div className="url-input-section" style={{
        display: 'flex',
        justifyContent: 'center',
        width: '100%',
        marginLeft: '40px'
      }}>
        <form onSubmit={handleLoadVideo} className={styles.urlInputForm} style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          width: '100%',
          maxWidth: '600px',
          height: '80px'
        }}>
          <input
            type="text"
            placeholder="Enter YouTube URL..."
            value={youtubeUrlInput}
            onChange={(e) => setYoutubeUrlInput(e.target.value)}
            className={styles.urlInput}
            required
            style={{
              width: '400px',
              backgroundColor: '#ffffff',
              border: '0.5px solid #d1d5db',
              borderRadius: '0.75rem',
              boxShadow: 'var(--shadow-sm)',
              padding: '0.875rem var(--spacing-4)',
              color: '#000000',
              transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast), background-color var(--transition-fast)',
              textAlign: 'center'
            }}
            onFocus={(e) => {
              e.target.style.border = '1px solid #7c3aed';
              e.target.style.outline = 'none';
              e.target.style.background = 'white';
            }}
            onBlur={(e) => {
              e.target.style.border = '0.5px solid #d1d5db';
              e.target.style.background = 'white';
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#f9fafb';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'white';
            }}
          />
          <button
            type="submit"
            className={styles.loadButton}
            style={{
              borderRadius: '12px',
              background: '#7c3aed',
              transition: 'all 0.2s ease',
              width: '100px',
              fontSize: '15px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#6d28d9';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = '#7c3aed';
            }}
          >
            확인
          </button>
        </form>
      </div>

      {/* VideoPlayer 컴포넌트 - 쇼츠 입력 후에만 부드러운 애니메이션과 함께 표시 */}
      {shouldRenderVideo && (
        <div
          className="video-column"
          ref={videoColumnRef}
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            opacity: showVideo ? 1 : 0,
            transform: showVideo ? 'translateY(0)' : 'translateY(30px)',
            transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
            marginTop: '0'
          }}
        >
          {youtubeVideoId && (
            <VideoPlayer
              videoId={youtubeVideoId}
              requestedTimecode={requestedTimecode}
              timecodeList={timecodeList}
              jumpToTimecode={setRequestedTimecode}
              onLoadVideo={handleLoadVideo}
              youtubeUrlInput={youtubeUrlInput}
              setYoutubeUrlInput={setYoutubeUrlInput}
            />
          )}
        </div>
      )}
      </div>

      {/* 탐험 블럭들 - 메인 카드 아래 자연스럽게 배치 */}
      <ExplorationBlocks
        blocks={explorationBlocks}
        style={{
          marginTop: '30px'
        }}
      />
    </div>
  );
};

export default Step1;