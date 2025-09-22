import React, { useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import styles from '../InfoShorts.module.css';
import HelpButton from '../../shared/HelpButton';

// YouTube iframe API 타입 선언
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

interface Step3Props {
  currentStep: number;
  previousStep: number;
  navigationDirection: 'next' | 'prev' | null;
  youtubeVideoId: string;
  buttonColumnRef: React.RefObject<HTMLDivElement>;
  modes: any;
  selectedMode: string;
  setSelectedMode: (mode: string) => void;
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  modalContent: { mode: string; prompt: any } | null;
  setModalContent: (content: { mode: string; prompt: any } | null) => void;
  scrollToColumn: (columnRef: React.RefObject<HTMLDivElement>) => void;
  isCustomMode: boolean;
  customPrompt: string;
  setCustomPrompt: (prompt: string) => void;
  apiKey: string;
  setApiKey: (key: string) => void;
  onModeSelect: (mode: string) => Promise<void>;
  isLoadingGenerate: boolean;
  LoadingMessage: ({ type }: { type?: 'default' | 'voice' | 'srt' }) => JSX.Element;
  timecodeList: any[];
  activeMode: string;
  scrollRef: React.RefObject<HTMLElement>;
  setRequestedTimecode: (timecode: number) => void;
  timeToSecs: (time: string) => number;
  c: (...args: any[]) => string;
  ChevronDown: ({ isOpen }: { isOpen: boolean }) => JSX.Element;
  step2ErrorMessage: string;
}

// 스피너 애니메이션 CSS 추가
const spinnerStyle = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const Step3: React.FC<Step3Props> = ({
  currentStep,
  previousStep,
  navigationDirection,
  youtubeVideoId,
  buttonColumnRef,
  modes,
  selectedMode,
  setSelectedMode,
  showModal,
  setShowModal,
  modalContent,
  setModalContent,
  scrollToColumn,
  isCustomMode,
  customPrompt,
  setCustomPrompt,
  apiKey,
  setApiKey,
  onModeSelect,
  isLoadingGenerate,
  LoadingMessage,
  timecodeList,
  activeMode,
  scrollRef,
  setRequestedTimecode,
  timeToSecs,
  c,
  ChevronDown,
  step2ErrorMessage
}) => {
  const step3VideoRef = useRef<HTMLIFrameElement>(null);
  const [step3Player, setStep3Player] = React.useState<any>(null);
  // 스피너 CSS를 head에 추가
  React.useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = spinnerStyle;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  // YouTube iframe API 로드 및 플레이어 초기화
  useEffect(() => {
    if (!youtubeVideoId) return;

    // YouTube iframe API 스크립트 로드
    const loadYouTubeAPI = () => {
      if (!window.YT) {
        const script = document.createElement('script');
        script.src = 'https://www.youtube.com/iframe_api';
        document.head.appendChild(script);
        
        window.onYouTubeIframeAPIReady = () => {
          initializePlayer();
        };
      } else {
        initializePlayer();
      }
    };

    const initializePlayer = () => {
      if (step3VideoRef.current && window.YT && window.YT.Player) {
        const player = new window.YT.Player(step3VideoRef.current, {
          events: {
            onReady: (event: any) => {
              setStep3Player(event.target);
            }
          }
        });
      }
    };

    loadYouTubeAPI();
  }, [youtubeVideoId]);

  // Step3 전용 시간 점프 함수
  const jumpToTimeInStep3Video = (timeInSeconds: number) => {
    if (step3Player && step3Player.seekTo) {
      step3Player.seekTo(timeInSeconds, true);
      step3Player.playVideo();
    }
  };

  return (
    <div className="step-card" style={{
      position: 'absolute',
      top: 0,
      left: 0,
      marginTop: '100px', /* 원복용 삭제처리가능 - 탭 네비게이션 가림 방지용 */
      background: 'rgb(249, 250, 251)',
      border: '1px solid rgb(209, 213, 219)',
      borderRadius: '16px',
      padding: '2rem',
      textAlign: 'center',
      width: '100%',
      height: 'fit-content',
      opacity: currentStep === 3 ? 1 : 0,
      visibility: currentStep === 3 ? 'visible' : 'hidden',
      pointerEvents: currentStep === 3 ? 'auto' : 'none',
      transform: (() => {
        const stepNumber = 3;
        
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
      <HelpButton
        stepName="영상분석"
        helpContent={
          <div>
            <h4 style={{ marginTop: 0 }}>❌ 이 기능이 불가능한 경우</h4>
            <p>1. Chrome 외 브라우저 [ 사파리, 마이크로소프트 엣지, 네이버 브라우저, 웨일, 파이어폭스 등 브라우저 ]</p>
            <div style={{ margin: '0.5rem 0', display: 'flex', justifyContent: 'flex-start', gap: '10px' }}>
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/5/52/Safari_browser_logo.svg"
                alt="Safari Browser"
                style={{
                  width: '32px',
                  height: '32px'
                }}
              />
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/9/98/Microsoft_Edge_logo_%282019%29.svg"
                alt="Microsoft Edge Browser"
                style={{
                  width: '32px',
                  height: '32px'
                }}
              />
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/a/a0/Firefox_logo%2C_2019.svg"
                alt="Firefox Browser"
                style={{
                  width: '32px',
                  height: '32px'
                }}
              />
            </div>
            <p>2. 60초 이상 긴 영상</p>
          </div>
        }
      />
      {/* 비디오 컨테이너 - 절대 위치로 제목 옆에 배치 */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        background: 'black',
        border: '2px solid #000',
        borderRadius: '12px',
        padding: '4px',
        width: '198px',
        height: '377px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '16px',
        zIndex: 10
      }}>
        {youtubeVideoId ? (
          <iframe
            ref={step3VideoRef}
            width="190"
            height="369"
            src={`https://www.youtube.com/embed/${youtubeVideoId}?enablejsapi=1&autoplay=0&mute=0&controls=1&modestbranding=1&rel=0`}
            title="YouTube Shorts Video"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{
              borderRadius: '8px',
              aspectRatio: '9/16',
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
        ) : (
          <div style={{ textAlign: 'center', fontSize: '12px' }}>
            <div style={{ marginBottom: '0.5rem', fontSize: '16px' }}>📱</div>
            <div>쇼츠 링크 필요</div>
          </div>
        )}
      </div>


      {/* 상단: 영상 분석 옵션 */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
        marginBottom: '2rem'
      }}>
        <div className="button-column-step2" ref={buttonColumnRef} style={{
          background: '#eaedf1',
          borderRadius: '20px',
          padding: '2rem',
          width: '600px',
          height: '350px'
        }}>
          <div className="modeSelector">
            <div>
              <h2 style={{ fontWeight: 'bold', color: '#333d4b', fontSize: '18px', textAlign: 'center', marginBottom: '1rem' }}>영상 분석 프롬포트를 선택하세요</h2>
              <div className="modeList-step2">
                {Object.entries(modes).map(([mode, {emoji, prompt}]: [string, any]) => (
                  <div key={mode}>
                    <button
                      className={c('button', {
                        active: mode === selectedMode,
                      })}
                      onClick={() => {
                        setSelectedMode(mode);
                        setModalContent({ mode, prompt });
                        setShowModal(true);
                      }}
                      style={{width: '200px', height: '200px', fontSize: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                      <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                        <span className="emoji" style={{ fontSize: '35px', marginBottom: '8px' }}>{emoji}</span>
                        <span>{mode}</span>
                      </span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 하단: 분석하기 버튼 */}
      <div style={{ 
        display: 'flex',
        justifyContent: 'center',
        width: '100%',
        marginBottom: '2rem'
      }}>
        <button
          className="button generateButton"
          onClick={() => onModeSelect(selectedMode)}
          disabled={!apiKey.trim() || !youtubeVideoId || (isCustomMode && !customPrompt.trim())}
          style={{
            borderRadius: '12px',
            background: '#7c3aed',
            transition: 'all 0.2s ease',
            width: '120px',
            fontSize: '15px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '48px',
            border: 'none',
            color: 'white',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            if (!isLoadingGenerate) {
              e.target.style.background = '#6d28d9';
            }
          }}
          onMouseLeave={(e) => {
            if (!isLoadingGenerate) {
              e.target.style.background = '#7c3aed';
            }
          }}
        >
          {isLoadingGenerate ? (
            <div style={{
              width: '16px',
              height: '16px',
              border: '2px solid transparent',
              borderTop: '2px solid white',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
          ) : (
            '분석하기'
          )}
        </button>
      </div>

      {/* 로딩 메시지 */}
      {isLoadingGenerate && (
        <div style={{ 
          display: 'flex',
          justifyContent: 'center',
          width: '100%',
          marginBottom: '1rem'
        }}>
          <div style={{ textAlign: 'center' }}>
            <LoadingMessage />
          </div>
        </div>
      )}
      
      {/* Step2 에러 메시지 */}
      {step2ErrorMessage && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          width: '100%',
          marginBottom: '1rem'
        }}>
          <div style={{
            textAlign: 'center',
            color: '#dc3545',
            fontSize: '14px',
            fontStyle: 'italic'
          }}>
            {step2ErrorMessage}
          </div>
        </div>
      )}

      {/* 결과 출력 영역 */}
      {timecodeList && activeMode && (
        <div style={{ 
          display: 'flex',
          justifyContent: 'center',
          width: '100%',
          marginTop: '2rem'
        }}>
          <div className="output-box-step2">
            <div className={c('tools', {inactive: !youtubeVideoId})}>
              <section
                className={c('output', {['mode' + activeMode]: activeMode})}
                ref={scrollRef}>
            {timecodeList && activeMode ? (
              activeMode === 'Table' ? (
                <table>
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Description</th>
                      <th>Objects</th>
                    </tr>
                  </thead>
                  <tbody>
                    {timecodeList.map(({time, text, objects}, i) => (
                      <tr
                        key={i}
                        role="button"
                        onClick={() =>
                          jumpToTimeInStep3Video(timeToSecs(time))
                        }
                        style={{
                          cursor: 'pointer',
                          transition: 'background-color 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#f3f4f6';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}>
                        <td>
                          <time>{time}</time>
                        </td>
                        <td>{text}</td>
                        <td>
                          {objects?.map(obj => (
                            <span key={obj}>{obj}</span>
                          ))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : activeMode === 'Cards' ? (
                <div className="timecode-cards">
                  {timecodeList.map(({time, text, objects}, i) => (
                    <div
                      key={i}
                      className="timecode-card"
                      role="button"
                      onClick={() => jumpToTimeInStep3Video(timeToSecs(time))}
                      style={{
                        cursor: 'pointer',
                        transition: 'background-color 0.2s ease',
                        borderRadius: '8px',
                        padding: '0.5rem'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f3f4f6';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}>
                      <div className="card-header">
                        <time className="card-time">{time}</time>
                      </div>
                      <div className="card-body">
                        <p className="card-text">{text}</p>
                        {objects && objects.length > 0 && (
                          <div className="card-objects">
                            {objects.map(obj => (
                              <span key={obj} className="object-tag">{obj}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="simple-list">
                  {timecodeList.map(({time, text}, i) => (
                    <div
                      key={i}
                      className="list-item"
                      role="button"
                      onClick={() => jumpToTimeInStep3Video(timeToSecs(time))}
                      style={{
                        cursor: 'pointer',
                        transition: 'background-color 0.2s ease',
                        borderRadius: '4px',
                        padding: '0.5rem',
                        margin: '0.2rem 0'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f3f4f6';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}>
                      <time className="list-time">{time}</time>
                      <span className="list-text">{text}</span>
                    </div>
                  ))}
                </div>
              )
            ) : null}
              </section>
            </div>
          </div>
        </div>
      )}

      {/* Modal via Portal */}
      {showModal && modalContent && createPortal(
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 10000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '2rem',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem'
            }}>
              <h3 style={{ 
                margin: 0, 
                color: '#333d4b', 
                fontSize: '18px',
                fontWeight: 'bold'
              }}>
                {modalContent.mode} 프롬포트
              </h3>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#666',
                  padding: '0',
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ×
              </button>
            </div>
            
            <div style={{
              backgroundColor: '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '1rem',
              fontSize: '14px',
              color: '#333',
              lineHeight: '1.6',
              whiteSpace: 'pre-wrap',
              textAlign: 'left'
            }}>
              {modalContent.mode === '커스텀' ? (
                <div>
                  <textarea
                    placeholder="커스텀 분석을 위한 프롬포트를 입력하세요..."
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    rows={6}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontFamily: 'inherit',
                      resize: 'vertical',
                      lineHeight: '1.5'
                    }}
                  />
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'flex-end', 
                    marginTop: '1rem' 
                  }}>
                    <button
                      onClick={() => {
                        if (customPrompt.trim()) {
                          setShowModal(false);
                        }
                      }}
                      disabled={!customPrompt.trim()}
                      style={{
                        padding: '10px 20px',
                        backgroundColor: customPrompt.trim() ? '#7c3aed' : '#d1d5db',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: customPrompt.trim() ? 'pointer' : 'not-allowed',
                        fontSize: '14px'
                      }}
                    >
                      적용하기
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  {typeof modalContent.prompt === 'function' ? 
                    'Custom prompt with user input' : 
                    modalContent.prompt
                  }
                </div>
              )}
            </div>
            
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default Step3;