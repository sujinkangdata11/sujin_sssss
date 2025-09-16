import React, { useState, useEffect, useCallback } from 'react';
import styles from '../InfoShorts.module.css';
import VideoPlayer from '../VideoPlayer';
import ExplorationBlocks, { ExplorationBlock } from '../../shared/ExplorationBlocks';
import YouTubeFilter, { FilterState } from '../../shared/YouTubeFilter';
import RankingTable, { RankingData } from '../../shared/RankingTable';
import { listupService } from '../../../services/listupService';
import { convertListupToRankingData, ShortsFilterState, ListupChannelData } from '../../../utils/listupDataMapper';
import { infoshortsChannels } from '../../../data/channels/infoshorts-channels';

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
  videoColumnRef
}) => {
  const [showVideo, setShowVideo] = useState(false);
  const [shouldRenderVideo, setShouldRenderVideo] = useState(false);

  // 필터 상태 관리
  const [filters, setFilters] = useState<FilterState>({
    selectedCategory: '전체',
    selectedCriteria: '조회수',
    selectedCountry: '🌍 전세계',
    selectedPeriod: '일간',
    selectedDate: 0
  });

  // 랭킹 테이블 페이지네이션 상태
  const [currentRankingPage, setCurrentRankingPage] = useState(1);

  // 실제 데이터 상태 관리
  const [channelData, setChannelData] = useState<ListupChannelData[]>([]);
  const [rankingData, setRankingData] = useState<RankingData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 더미 랭킹 데이터 (백업용)
  const dummyRankingData: RankingData[] = [
    {
      rank: 1, change: '▲9', title: 'Rock ✓ YA😴Body ✓ (⚠Don\'t try this⚠) #Shorts',
      tags: ['#Shorts', '#trending'], date: '2025.08.29', views: '+20,911,279',
      channel: { name: '치단빈 Cha Da...', subs: '9,800,000', avatar: '👤' }
    },
    {
      rank: 2, change: '▼1', title: 'MENTE MÁ - Nakama & Mc Staff | Dance Cover #krstudio',
      tags: ['#krstudio'], date: '2025.08.27', views: '+17,477,547',
      channel: { name: 'KrStudio [원...', subs: '563,000', avatar: '🎬' }
    },
    {
      rank: 3, change: '▲1', title: '혼한 아이돌 연습생이 부르는 HUNTR/X - Golden 레전드 뽑은ㄷㄷ',
      tags: ['#추니그룹', '#레단해'], date: '2025.07.19', views: '+10,717,557',
      channel: { name: 'SOONIGROUP...', subs: '549,000', avatar: '👥' }
    },
    {
      rank: 4, change: 'NEW', title: '버닝 파이어는 연주 소리가 진짜일까?? #피아노 #피아노연주',
      tags: ['#피아노', '#피아노연주'], date: '2025.09.02', views: '+8,460,808',
      channel: { name: '1분간박', subs: '15,700', avatar: '🎹' }
    },
    {
      rank: 5, change: '-', title: '감치가 \'HUNTR/X - GOLDEN\'을 부르는 외국인 룸메이트.. 남지가 이 고를이 가능하다고..?',
      tags: ['#huntrx', '#golden', '#reaction'], date: '2025.07.31', views: '+8,437,023',
      channel: { name: '오명화 Ohye...', subs: '558,000', avatar: '👩' }
    },
    {
      rank: 6, change: '▲2', title: '신나는 댄스 챌린지 #dance #viral',
      tags: ['#dance', '#viral'], date: '2025.08.30', views: '+7,234,567',
      channel: { name: '댄스킹...', subs: '2,100,000', avatar: '💃' }
    },
    {
      rank: 7, change: '▼3', title: '맛집 리뷰 솔직후기 #foodie #review',
      tags: ['#foodie', '#review'], date: '2025.08.28', views: '+6,789,012',
      channel: { name: '맛집탐험가...', subs: '890,000', avatar: '🍴' }
    },
    {
      rank: 8, change: 'NEW', title: '펫샵에서 만난 귀여운 강아지들 #pets #cute',
      tags: ['#pets', '#cute'], date: '2025.09.01', views: '+5,432,109',
      channel: { name: '펫러버...', subs: '670,000', avatar: '🐕' }
    },
    {
      rank: 9, change: '▲1', title: '게임 하이라이트 모음 #gaming #highlight',
      tags: ['#gaming', '#highlight'], date: '2025.08.29', views: '+4,876,543',
      channel: { name: '게임마스터...', subs: '1,200,000', avatar: '🎮' }
    },
    {
      rank: 10, change: '-', title: '여행 브이로그 제주도 편 #travel #vlog',
      tags: ['#travel', '#vlog'], date: '2025.08.26', views: '+3,654,321',
      channel: { name: '여행유튜버...', subs: '450,000', avatar: '✈️' }
    }
  ];

  // 실제 채널 데이터 로드
  const loadChannelData = async () => {
    console.log('🚀 [DEBUG] 채널 데이터 로드 시작...');
    setIsLoading(true);
    try {
      console.log('🚀 [DEBUG] listupService.getExplorationData() 호출...');
      const response = await listupService.getExplorationData();
      console.log('🚀 [DEBUG] API 응답:', response);

      if (response.success) {
        setChannelData(response.data);
        console.log('✅ 채널 데이터 로드 성공:', response.data.length + '개');
        console.log('📊 [DEBUG] 첫 번째 채널 데이터:', response.data[0]);

        // 초기 필터로 랭킹 데이터 생성 (기본 필터 값 사용)
        const initialFilter: FilterState = {
          selectedCategory: '전체',
          selectedCriteria: '조회수',
          selectedCountry: '🌍 전세계',
          selectedPeriod: '일간',
          selectedDate: 0
        };
        updateRankingData(response.data, initialFilter);
      } else {
        console.error('❌ 채널 데이터 로드 실패:', response.message);
        console.log('🔄 [DEBUG] 더미 데이터로 폴백');
      }
    } catch (error) {
      console.error('❌ 채널 데이터 로드 오류:', error);
      console.log('🔄 [DEBUG] 더미 데이터로 폴백');
    } finally {
      setIsLoading(false);
      console.log('🚀 [DEBUG] 로딩 완료, isLoading:', false);
    }
  };

  // 필터에 따른 랭킹 데이터 업데이트 (쇼츠메이커용)
  const updateRankingData = (data: ListupChannelData[], currentFilters: FilterState) => {
    const filterState: ShortsFilterState = {
      category: currentFilters.selectedCategory,
      criteria: currentFilters.selectedCriteria,
      country: currentFilters.selectedCountry,
      period: currentFilters.selectedPeriod,
      date: currentFilters.selectedDate
    };

    const availableChannels = channelData.map(channel =>
      channel.staticData?.title || channel.snapshots?.[0]?.title || ''
    ).filter(Boolean);

    const newRankingData = convertListupToRankingData(data, filterState, availableChannels);
    setRankingData(newRankingData);
    console.log('🔄 쇼츠메이커 랭킹 데이터 업데이트:', newRankingData.length + '개');
    console.log('🔍 [DEBUG] 변환된 데이터 예시:', newRankingData.slice(0, 1));
  };

  // 필터 변경 핸들러 (useCallback으로 메모이제이션)
  const handleFilterChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);
    console.log('필터 변경됨:', newFilters);

    // 실제 데이터가 있으면 필터 적용
    if (channelData.length > 0) {
      updateRankingData(channelData, newFilters);
    }
  }, [channelData]);

  // 탐험 블럭들 데이터
  const explorationBlocks: ExplorationBlock[] = [
    {
      id: 'youtube-filter',
      title: '탐험하기',
      onClick: () => {
        console.log('YouTube 필터링 클릭됨');
      },
      content: (
        <YouTubeFilter
          onFilterChange={handleFilterChange}
          channelList={channelData.flatMap(channel =>
            channel.snapshots?.map(snapshot => snapshot.title).filter(Boolean) || []
          )}
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
              🔄 데이터 로딩 중...
            </div>
          )}
          <RankingTable
            data={(() => {
              // 실제 API 데이터 우선, 없으면 더미 데이터
              const data = rankingData.length > 0 ? rankingData : dummyRankingData;
              const startIndex = (currentRankingPage - 1) * 10;
              const endIndex = startIndex + 10;
              return data.slice(startIndex, endIndex);
            })()}
            currentPage={currentRankingPage}
            onPageChange={setCurrentRankingPage}
            totalPages={Math.ceil((rankingData.length > 0 ? rankingData.length : dummyRankingData.length) / 10)}
          />
        </div>
      ),
      customStyle: {
        padding: '0 0 clamp(1rem, 4vw, 2rem) 0',
        textAlign: 'center'
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
        width: '100%',
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
      <div style={{
        fontSize: '15px',
        color: '#dc3545',
        textAlign: 'center',
        marginBottom: '20px',
        paddingTop: '20px'
      }}>
        개발중 ㅣ 사용가능 ㅣ 9월 30일 완료예정
      </div>

      {/* 제목 - 가로 중앙 정렬 */}
      <div style={{
        fontSize: 'clamp(24px, 5vw, 32px)',
        fontWeight: 'bold',
        color: '#333d4b',
        textAlign: 'center'
      }}>
        쇼츠링크를 입력하세요
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