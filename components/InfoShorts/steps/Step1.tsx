import React, { useState, useEffect } from 'react';
import styles from '../InfoShorts.module.css';
import VideoPlayer from '../VideoPlayer';

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
    <div className="step-card" style={{
      position: 'absolute',
      top: 0,
      left: 0,
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
      maxHeight: '90vh',
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
    }}>
      {/* 제목 - 가로 중앙 정렬 */}
      <div style={{ 
        fontSize: 'clamp(24px, 5vw, 32px)', 
        fontWeight: 'bold', 
        color: '#333d4b', 
        textAlign: 'center',
        paddingTop: '20px'
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
  );
};

export default Step1;