import React, { useState, useEffect, useRef } from 'react';
import styles from '../InfoShorts.module.css';
import HelpButton from '../../shared/HelpButton';

interface Step7Props {
  currentStep: number;
  previousStep: number;
  navigationDirection: 'next' | 'prev' | null;
  sixthColumnRef: React.RefObject<HTMLDivElement>;
  handleKeywordExtraction: () => void;
  apiKey: string;
  youtubeVideoId: string;
  isExtractingKeywords: boolean;
  extractedKeywords: string;
  scrollToColumn: (columnRef: React.RefObject<HTMLDivElement>) => void;
  keywordExtractionError: string;
  // 6단계 음성 재생 관련 props
  generatedAudio: ArrayBuffer | null;
  processedAudio: ArrayBuffer | null;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  handleAudioPlay: () => void;
  handleAudioSeek: (time: number) => void;
  AudioPlayer: React.ComponentType<any>;
  processedCurrentTime: number;
  processedDuration: number;
  processedAudioPlaying: boolean;
  handleProcessedAudioPlay: () => void;
  handleProcessedAudioSeek: (time: number) => void;
  selectedAudioSource: string;
  setSelectedAudioSource: (source: string) => void;
  selectedVoice: string;
}

const Step7: React.FC<Step7Props> = ({
  currentStep,
  previousStep,
  navigationDirection,
  sixthColumnRef,
  handleKeywordExtraction,
  apiKey,
  youtubeVideoId,
  isExtractingKeywords,
  extractedKeywords,
  scrollToColumn,
  keywordExtractionError,
  // 6단계 음성 재생 관련 props
  generatedAudio,
  processedAudio,
  currentTime,
  duration,
  isPlaying,
  handleAudioPlay,
  handleAudioSeek,
  AudioPlayer,
  processedCurrentTime,
  processedDuration,
  processedAudioPlaying,
  handleProcessedAudioPlay,
  handleProcessedAudioSeek,
  selectedAudioSource,
  setSelectedAudioSource,
  selectedVoice
}) => {
  // 6단계 음성 재생 관련 로직 활용
  const hasGeneratedAudio = generatedAudio !== null;
  const hasProcessedAudio = processedAudio !== null;
  const youtubeIframeRef = useRef<HTMLIFrameElement>(null);

  const getMessageText = () => {
    return "이전 단계에서 음성을 생성하세요";
  };

  // 7단계 특정 YouTube 영상과 동기화된 재생
  const handleStep7SyncPlay = () => {
    // 음성 재생
    if (selectedAudioSource === 'original' && hasGeneratedAudio) {
      handleAudioPlay();
    } else if (selectedAudioSource === 'processed' && hasProcessedAudio) {
      handleProcessedAudioPlay();
    }

    // 7단계 YouTube 영상 무음 재생
    if (youtubeIframeRef.current) {
      // postMessage로 YouTube iframe에 재생 명령 전송
      youtubeIframeRef.current.contentWindow?.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
    }
  };

  return (
    <div className={styles.stepLayer} style={{
      background: 'rgb(249, 250, 251)',
      border: '1px solid rgb(209, 213, 219)',
      borderRadius: '16px',
      padding: '2rem',
      textAlign: 'center',
      width: '100%',
      height: 'fit-content',
      opacity: currentStep === 7 ? 1 : 0,
      visibility: currentStep === 7 ? 'visible' : 'hidden',
      pointerEvents: currentStep === 7 ? 'auto' : 'none',
      transform: (() => {
        const stepNumber = 7;
        if (currentStep === stepNumber) return 'translateX(0)';
        if (navigationDirection) {
          if (previousStep === stepNumber) {
            return navigationDirection === 'next' ? 'translateX(-100%)' : 'translateX(100%)';
          }
          if (currentStep === stepNumber) {
            return navigationDirection === 'next' ? 'translateX(100%)' : 'translateX(-100%)';
          }
        }
        return stepNumber > (currentStep || 1) ? 'translateX(100%)' : 'translateX(-100%)';
      })()
    }}>
      <HelpButton
        stepName="관련영상 찾기"
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
            <p>2. 3번 생성을 하지 않은 경우</p>
          </div>
        }
      />
      
      {/* 새로운 빈 블럭 */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        width: '100%',
        marginBottom: '2rem'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '1.5rem 2rem',
          width: '800px',
          minHeight: '100px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {youtubeVideoId ? (
            <>
              <h3 style={{
                fontWeight: 'bold',
                color: '#333',
                fontSize: '18px',
                margin: '0 0 20px 0',
                textAlign: 'center'
              }}>
                분석한 쇼츠 영상
              </h3>

              {/* 오디오 소스 선택 드롭다운 */}
              <div style={{
                marginBottom: '20px',
                display: 'flex',
                justifyContent: 'center'
              }}>
                <select
                  value={selectedAudioSource}
                  style={{
                    backgroundColor: 'white',
                    color: '#333',
                    border: '1px solid #ccc',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                  onChange={(e) => {
                    setSelectedAudioSource(e.target.value);
                  }}
                >
                  <option value="original">1. 원본음성</option>
                  <option value="processed">2. 무음제거음성</option>
                </select>
              </div>

              {/* 6단계와 동일한 AudioPlayer 컴포넌트 사용 */}
              {hasGeneratedAudio && selectedAudioSource === 'original' && (
                <AudioPlayer
                  title="원본 음성"
                  audioBuffer={generatedAudio}
                  isPlaying={isPlaying}
                  currentTime={currentTime}
                  duration={duration}
                  onPlay={handleStep7SyncPlay}
                  onSeek={handleAudioSeek}
                  downloadFileName={`${selectedVoice}-original-audio.wav`}
                  progressColor="#007bff"
                />
              )}

              {hasProcessedAudio && selectedAudioSource === 'processed' && (
                <AudioPlayer
                  title="무음제거 음성"
                  audioBuffer={processedAudio}
                  isPlaying={processedAudioPlaying}
                  currentTime={processedCurrentTime}
                  duration={processedDuration}
                  onPlay={handleStep7SyncPlay}
                  onSeek={handleProcessedAudioSeek}
                  downloadFileName={`${selectedVoice}-processed-audio.wav`}
                  progressColor="#28a745"
                />
              )}

              {!hasProcessedAudio && selectedAudioSource === 'processed' && (
                <div style={{
                  width: '600px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '12px',
                  padding: '40px 20px',
                  marginBottom: '20px',
                  border: '1px solid #e9ecef',
                  textAlign: 'center'
                }}>
                  <div style={{
                    fontSize: '16px',
                    color: '#666',
                    fontFamily: 'system-ui, -apple-system, sans-serif'
                  }}>
                    {getMessageText()}
                  </div>
                </div>
              )}

              {!hasGeneratedAudio && selectedAudioSource === 'original' && (
                <div style={{
                  width: '600px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '12px',
                  padding: '40px 20px',
                  marginBottom: '20px',
                  border: '1px solid #e9ecef',
                  textAlign: 'center'
                }}>
                  <div style={{
                    fontSize: '16px',
                    color: '#666',
                    fontFamily: 'system-ui, -apple-system, sans-serif'
                  }}>
                    {getMessageText()}
                  </div>
                </div>
              )}


              <iframe
                ref={youtubeIframeRef}
                width="315"
                height="560"
                src={`https://www.youtube.com/embed/${youtubeVideoId}?enablejsapi=1&modestbranding=1&rel=0&showinfo=0&controls=1&iv_load_policy=3&fs=1&disablekb=1&autohide=1&color=white&theme=light&cc_load_policy=0&hl=ko&origin=${window.location.origin}&mute=1`}
                title="YouTube Shorts Video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{
                  borderRadius: '12px'
                }}
              />

              {/* YouTube 다운로드 버튼 */}
              <button
                className="button generateButton"
                onClick={() => {
                  const downloadUrl = `https://ssyoutube.com/watch?v=${youtubeVideoId}`;
                  window.open(downloadUrl, '_blank');
                }}
                style={{
                  marginTop: '15px',
                  width: '170px',
                  fontSize: '15px',
                  border: 'none',
                  backgroundColor: 'rgb(124, 58, 237)',
                  color: 'white',
                  borderRadius: '12px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgb(104, 48, 197)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgb(124, 58, 237)';
                }}
              >
                📥 유튜브 다운로드
              </button>
            </>
          ) : (
            <div style={{
              color: '#666',
              fontSize: '16px',
              textAlign: 'center'
            }}>
              분석할 쇼츠 영상을 먼저 입력해주세요.
            </div>
          )}
        </div>
      </div>

      <div className="sixth-column" ref={sixthColumnRef} style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto',
        minWidth: '800px',
        maxWidth: '800px'
      }}>
        <div style={{ marginBottom: '15px' }}>
          <h3 style={{ fontWeight: 'bold', color: '#333', fontSize: '18px', margin: 0 }}>관련 영상 더 찾기</h3>
        </div>
        
        <div style={{ 
          marginBottom: '15px', 
          display: 'flex', 
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column'
        }}>
          <button
            className="button generateButton"
            onClick={handleKeywordExtraction}
            disabled={!apiKey.trim() || !youtubeVideoId || isExtractingKeywords}
            style={{ 
              width: '170px', 
              marginBottom: '10px', 
              fontSize: '15px', 
              border: 'none',
              backgroundColor: 'rgb(124, 58, 237)',
              color: 'white',
              borderRadius: '12px'
            }}
          >
            {isExtractingKeywords ? '키워드 추출 중...' : '영상 키워드 추출'}
          </button>
          
          {keywordExtractionError && (
            <div style={{
              color: 'red',
              fontSize: '15px',
              marginBottom: '15px',
              textAlign: 'center'
            }}>
              {keywordExtractionError}
            </div>
          )}
          
          <div style={{
            marginTop: '10px',
            marginBottom: '15px',
            padding: '15px',
            background: extractedKeywords ? '#f8f9fa' : '#fafafa',
            border: '1px solid #dee2e6',
            borderRadius: '12px',
            color: '#333',
            width: '400px'
          }}>
            <h4 style={{ 
              marginBottom: '10px', 
              color: 'rgb(153, 153, 153)', 
              fontSize: '16px',
              fontWeight: 'bold'
            }}>
              키워드 리스트
            </h4>
            <div style={{ 
              minHeight: '80px'
            }}>
              {extractedKeywords ? (
                extractedKeywords.split('\n').filter(keyword => keyword.trim()).map((keyword, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '8px',
                    padding: '6px 0',
                    fontSize: '16px',
                    color: '#333'
                  }}>
                    <span style={{ flex: 1 }}>
                      {keyword.trim()}
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(keyword.trim());
                        const btn = document.activeElement as HTMLButtonElement;
                        const originalText = btn.innerHTML;
                        btn.innerHTML = '✅';
                        setTimeout(() => {
                          btn.innerHTML = originalText;
                        }, 1000);
                      }}
                      style={{
                        marginLeft: '8px',
                        padding: '4px 6px',
                        backgroundColor: 'transparent',
                        border: '1px solid #ccc',
                        borderRadius: '3px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        color: '#666'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f0f0f0';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                      title="키워드 복사"
                    >
                      📋 복사
                    </button>
                  </div>
                ))
              ) : (
                <div style={{ 
                  color: 'rgb(153, 153, 153)',
                  fontSize: '16px',
                  lineHeight: '1.5'
                }}>
                  키워드 추출 버튼을 눌러서 영상의 키워드를 추출해보세요.
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div style={{
          marginTop: '10px',
          padding: '15px',
          backgroundColor: '#fff3cd',
          border: '1px solid #ffeaa7',
          borderRadius: '12px',
          fontSize: '14px',
          color: '#856404',
          lineHeight: '1.5',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '400px'
        }}>
          <div style={{ marginBottom: '15px', fontSize: '15px' }}>
            ⚠️ 페이지를 이동하면 이곳의 내용이 전부 새로고침됩니다.<br/>중요한 정보는 다운로드와 복사해놓으세요
          </div>
          <button
            className="button generateButton"
            onClick={() => {
              window.open('/', '_blank');
            }}
            style={{ 
              fontSize: '15px', 
              width: '200px',
              backgroundColor: 'rgb(241, 223, 167)',
              border: 'none',
              borderRadius: '12px',
              padding: '10px',
              cursor: 'pointer'
            }}
          >
            쇼츠 파인더에서 영상찾기
          </button>
        </div>
      </div>
    </div>
  );
};

export default Step7;
