import React from 'react';
import { createPortal } from 'react-dom';
import styles from '../InfoShorts.module.css';
import { VOICE_CONFIGS } from '../tts/voiceMapping';
import HelpButton from '../../shared/HelpButton';

interface Step6Props {
  currentStep: number;
  previousStep: number;
  navigationDirection: 'next' | 'prev' | null;
  fifthColumnRef: React.RefObject<HTMLDivElement>;
  analysisResult2: string;
  selectedLanguage2: string;
  selectedVoice: string;
  setSelectedVoice: (voice: string) => void;
  ChevronDown: ({ isOpen }: { isOpen: boolean }) => JSX.Element;
  scriptText: string;
  setScriptText: (text: string) => void;
  ssmlEnabled: boolean;
  setSsmlEnabled: (enabled: boolean) => void;
  voiceSpeed: number;
  setVoiceSpeed: (speed: number) => void;
  voicePitch: number;
  setVoicePitch: (pitch: number) => void;
  handleGenerateAudio: () => void;
  isGeneratingAudio: boolean;
  LoadingMessage: ({ type }: { type?: 'default' | 'voice' | 'srt' }) => JSX.Element;
  generatedAudio: ArrayBuffer | null;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  handleAudioPlay: () => void;
  handleAudioSeek: (time: number) => void;
  AudioPlayer: React.FC<any>;
  processedAudio: ArrayBuffer | null;
  processedCurrentTime: number;
  processedDuration: number;
  processedAudioPlaying: boolean;
  handleProcessedAudioPlay: () => void;
  handleProcessedAudioSeek: (time: number) => void;
  silenceThreshold: number;
  setSilenceThreshold: (threshold: number) => void;
  handleSilenceRemoval: () => void;
  isProcessingSilence: boolean;
  selectedAudioSource: string;
  setSelectedAudioSource: (source: string) => void;
  wordsPerSubtitle: number;
  setWordsPerSubtitle: (count: number) => void;
  handleDownloadSRT: () => void;
  isGeneratingSRT: boolean;
  apiKey: string;
  ttsErrorMessage: string;
  srtErrorMessage: string;
}

const Step6: React.FC<Step6Props> = ({
  currentStep,
  previousStep,
  navigationDirection,
  fifthColumnRef,
  analysisResult2,
  selectedLanguage2,
  selectedVoice,
  setSelectedVoice,
  ChevronDown,
  scriptText,
  setScriptText,
  ssmlEnabled,
  setSsmlEnabled,
  voiceSpeed,
  setVoiceSpeed,
  voicePitch,
  setVoicePitch,
  handleGenerateAudio,
  isGeneratingAudio,
  LoadingMessage,
  generatedAudio,
  currentTime,
  duration,
  isPlaying,
  handleAudioPlay,
  handleAudioSeek,
  AudioPlayer,
  processedAudio,
  processedCurrentTime,
  processedDuration,
  processedAudioPlaying,
  handleProcessedAudioPlay,
  handleProcessedAudioSeek,
  silenceThreshold,
  setSilenceThreshold,
  handleSilenceRemoval,
  isProcessingSilence,
  selectedAudioSource,
  setSelectedAudioSource,
  wordsPerSubtitle,
  setWordsPerSubtitle,
  handleDownloadSRT,
  isGeneratingSRT,
  apiKey,
  ttsErrorMessage,
  srtErrorMessage
}) => {
  const [voicePage, setVoicePage] = React.useState(0);
  const [voiceSearch, setVoiceSearch] = React.useState('');
  const [isPreviewPlaying, setIsPreviewPlaying] = React.useState<string | null>(null);
  const [previewAudio, setPreviewAudio] = React.useState<HTMLAudioElement | null>(null);
  const [selectedLanguage, setSelectedLanguage] = React.useState('ko'); // 기본값을 한국어로 설정
  const [isLanguageModalOpen, setIsLanguageModalOpen] = React.useState(false); // 언어 모달 상태

  // voiceMapping.ts에서 실제 음성 데이터를 사용
  const voiceOptions = React.useMemo(() => {
    const options: Record<string, string> = {};
    
    // 한국어 이름과 특성 매핑
    const koreanNames: Record<string, string> = {
      'youngsu': '영수 - 회사 공식',
      'changhee': '창희 - 차분함', 
      'minjun': '민준 - 권위감',
      'jihun': '지훈 - 전문가',
      'yejun': '예준 - 에너지',
      'hunyoung': '훈영 - 교사',
      'jimin': '지민 - 활발함',
      'sujin': '수진 - 기업가',
      'yena': '예나 - 교수',
      'eunji': '은지 - 귀여움',
      'yejin': '예진 - 영리함',
      'minjin': '민진 - 관계성',
      'jihyun': '지현 - 속도감',
      'eunsu': '은수 - 영감',
      'yedam': '예담 - 유머'
    };

    // VOICE_CONFIGS에서 사용 가능한 음성만 추출
    Object.keys(VOICE_CONFIGS).forEach(voiceKey => {
      options[voiceKey] = koreanNames[voiceKey] || voiceKey;
    });

    return options;
  }, []);

  const voicesPerPage = 6;
  
  // 검색 필터링 (한국어 이름과 영어 키 모두 검색 가능)
  const filteredVoices = Object.entries(voiceOptions).filter(([voiceKey, displayName]) =>
    voiceKey.toLowerCase().includes(voiceSearch.toLowerCase()) ||
    displayName.toLowerCase().includes(voiceSearch.toLowerCase())
  );
  
  const totalPages = Math.ceil(filteredVoices.length / voicesPerPage);
  const currentVoices = filteredVoices.slice(
    voicePage * voicesPerPage,
    (voicePage + 1) * voicesPerPage
  );

  // 검색어가 바뀔 때 페이지를 첫 페이지로 리셋
  React.useEffect(() => {
    setVoicePage(0);
  }, [voiceSearch]);

  // 음성 미리보기 재생 함수
  const handleVoicePreview = async (voiceKey: string) => {
    try {
      if (isPreviewPlaying === voiceKey && previewAudio) {
        // 정지
        previewAudio.pause();
        setIsPreviewPlaying(null);
        setPreviewAudio(null);
        return;
      }

      // 기존 미리보기 정지
      if (previewAudio) {
        previewAudio.pause();
        setPreviewAudio(null);
      }

      // 미리보기 음성 파일 경로 (voices 폴더에서 가져올 예정)
      const voicePreviewUrl = `/voices/${voiceKey}.wav`;
      
      const audio = new Audio(voicePreviewUrl);
      
      audio.onended = () => {
        setIsPreviewPlaying(null);
        setPreviewAudio(null);
      };
      
      audio.onerror = () => {
        setIsPreviewPlaying(null);
        setPreviewAudio(null);
        console.warn(`${voiceKey} 미리보기 파일을 찾을 수 없습니다.`);
      };
      
      setPreviewAudio(audio);
      setIsPreviewPlaying(voiceKey);
      await audio.play();
      
    } catch (error) {
      console.error('미리듣기 재생 오류:', error);
      setIsPreviewPlaying(null);
      setPreviewAudio(null);
    }
  };

  // 컴포넌트 언마운트 시 미리보기 오디오 정리
  React.useEffect(() => {
    return () => {
      if (previewAudio) {
        previewAudio.pause();
        setPreviewAudio(null);
        setIsPreviewPlaying(null);
      }
    };
  }, [previewAudio]);

  return (
    <div className={styles.stepLayer} style={{
      background: 'rgb(249, 250, 251)',
      border: '1px solid rgb(209, 213, 219)',
      borderRadius: '16px',
      padding: '2rem',
      textAlign: 'center',
      width: '100%',
      height: 'fit-content',
      opacity: currentStep === 6 ? 1 : 0,
      visibility: currentStep === 6 ? 'visible' : 'hidden',
      pointerEvents: currentStep === 6 ? 'auto' : 'none',
      transform: (() => {
        const stepNumber = 6;
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
        stepName="자막생성"
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
            <p>2. 1000자 이상의 긴 글, 또는 10자 이하의 분량이 적은 글</p>
          </div>
        }
      />


      {/* 스크립트 설정 블럭 + 음성 타입 선택 블럭을 가로로 배치 */}
      <div style={{
        display: 'flex',
        gap: '20px',
        width: '820px',
        margin: '0 auto 20px auto'
      }}>
        {/* 스크립트 설정 블럭 */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '20px',
          width: '400px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#333d4b',
              margin: 0,
              flex: 1,
              textAlign: 'center',
              marginLeft: '40px'
            }}>
              스크립트
            </h3>
            <div style={{
              fontSize: '14px',
              color: '#666',
              fontWeight: '500',
              minWidth: '100px',
              textAlign: 'right'
            }}>
              공백포함 {scriptText.length}자
            </div>
          </div>
          <div>
            <textarea
              value={scriptText}
              onChange={(e) => setScriptText(e.target.value)}
              rows={12}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ccc',
                borderRadius: '12px',
                fontSize: '18px',
                backgroundColor: 'white',
                color: '#333',
                resize: 'vertical',
                lineHeight: '1.8'
              }}
              placeholder="음성으로 변환할 텍스트를 입력하세요..."
            />
          </div>
        </div>

        {/* 음성 타입 선택 블럭 */}
        <div className="fifth-column" ref={fifthColumnRef} style={{
          width: '400px',
          background: '#f8f9fa',
          borderRadius: '16px',
          padding: '20px'
        }}>
          <div style={{ position: 'relative' }}>
            <h3 style={{ 
              fontSize: '18px', 
              fontWeight: 'bold', 
              color: '#333d4b', 
              marginBottom: '16px',
              textAlign: 'center'
            }}>
              음성 선택
            </h3>
            
            {/* 언어 선택 버튼 */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px' }}>
              <button
                onClick={() => setIsLanguageModalOpen(true)}
                style={{
                  width: '270px',
                  height: '45px',
                  padding: '0 15px',
                  border: '1px solid #ccc',
                  borderRadius: '12px',
                  fontSize: '16px',
                  backgroundColor: 'white',
                  color: '#333',
                  outline: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#f8f9fa';
                  e.currentTarget.style.borderColor = '#7c3aed';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                  e.currentTarget.style.borderColor = '#ccc';
                }}
              >
                <span style={{ fontSize: '20px' }}>
                  {selectedLanguage === 'ko' ? '🇰🇷' :
                   selectedLanguage === 'ja' ? '🇯🇵' :
                   selectedLanguage === 'en' ? '🇺🇸' :
                   selectedLanguage === 'es' ? '🇪🇸' :
                   selectedLanguage === 'zh' ? '🇨🇳' :
                   selectedLanguage === 'fr' ? '🇫🇷' :
                   selectedLanguage === 'de' ? '🇩🇪' :
                   selectedLanguage === 'pt' ? '🇵🇹' :
                   selectedLanguage === 'ru' ? '🇷🇺' :
                   selectedLanguage === 'hi' ? '🇮🇳' :
                   selectedLanguage === 'nl' ? '🇳🇱' : '🇰🇷'}
                </span>
                <span>
                  {selectedLanguage === 'ko' ? '한국어' :
                   selectedLanguage === 'ja' ? '일본어' :
                   selectedLanguage === 'en' ? '영어' :
                   selectedLanguage === 'es' ? '스페인어' :
                   selectedLanguage === 'zh' ? '중국어' :
                   selectedLanguage === 'fr' ? '프랑스어' :
                   selectedLanguage === 'de' ? '독일어' :
                   selectedLanguage === 'pt' ? '포르투갈어' :
                   selectedLanguage === 'ru' ? '러시아어' :
                   selectedLanguage === 'hi' ? '힌디어' :
                   selectedLanguage === 'nl' ? '네덜란드어' : '한국어'}
                </span>
              </button>
            </div>
            
            {/* 왼쪽 화살표 */}
            <button
              onClick={() => setVoicePage(prev => Math.max(0, prev - 1))}
              disabled={voicePage === 0}
              style={{
                position: 'absolute',
                left: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                fontSize: '40px',
                color: voicePage === 0 ? '#ccc' : '#333',
                cursor: voicePage === 0 ? 'not-allowed' : 'pointer',
                padding: '8px',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseOver={(e) => {
                if (voicePage > 0) {
                  (e.target as HTMLElement).style.backgroundColor = '#f0f0f0';
                }
              }}
              onMouseOut={(e) => {
                (e.target as HTMLElement).style.backgroundColor = 'transparent';
              }}
            >
              ‹
            </button>
            
            {/* 오른쪽 화살표 */}
            <button
              onClick={() => setVoicePage(prev => Math.min(totalPages - 1, prev + 1))}
              disabled={voicePage === totalPages - 1}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                fontSize: '40px',
                color: voicePage === totalPages - 1 ? '#ccc' : '#333',
                cursor: voicePage === totalPages - 1 ? 'not-allowed' : 'pointer',
                padding: '8px',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseOver={(e) => {
                if (voicePage < totalPages - 1) {
                  (e.target as HTMLElement).style.backgroundColor = '#f0f0f0';
                }
              }}
              onMouseOut={(e) => {
                (e.target as HTMLElement).style.backgroundColor = 'transparent';
              }}
            >
              ›
            </button>
            
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '10px',
              justifyContent: 'center',
              maxWidth: '400px',
              margin: '0 auto',
              minHeight: '260px'
            }}>
              {currentVoices.map(([voiceKey, displayName]) => {
              const getEmoji = (voiceKey: string) => {
                // 개별 음성별 특색있는 이모지
                switch (voiceKey) {
                  case 'youngsu': return '🌟'; // 에너지 넘치는 젊은 남성
                  case 'changhee': return '🧑‍💼'; // 차분하고 신뢰감 있는 남성
                  case 'jimin': return '🌸'; // 밝고 발랄한 여성
                  case 'sujin': return '💝'; // 친근하고 따뜻한 여성
                  case 'minjun': return '🎓'; // 학생, 활기차고 친근한
                  case 'yena': return '✨'; // 여성 음성
                  case 'jihun': return '🎸'; // 남성 음성
                  case 'eunji': return '🌺'; // 여성 음성
                  case 'yejun': return '🎯'; // 남성 음성
                  case 'hunyoung': return '🔥'; // 남성 음성
                  case 'yejin': return '🦋'; // 여성 음성
                  case 'minjin': return '💫'; // 여성 음성
                  case 'jihyun': return '🌙'; // 여성 음성
                  case 'eunsu': return '🌻'; // 여성 음성
                  case 'yedam': return '🎀'; // 여성 음성
                  default: return '🎤';
                }
              };
              
              return (
                <div
                  key={voiceKey}
                  style={{
                    position: 'relative',
                    width: '126px',
                    height: '126px'
                  }}
                >
                  <button
                    onClick={() => setSelectedVoice(voiceKey)}
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: '12px',
                      border: selectedVoice === voiceKey ? '1px solid #7c3aed' : '1px solid #ccc',
                      background: selectedVoice === voiceKey ? '#f3f0ff' : 'white',
                      color: selectedVoice === voiceKey ? '#7c3aed' : '#333',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: selectedVoice === voiceKey ? 'bold' : 'normal',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center',
                      transition: 'all 0.2s ease',
                      padding: '10px'
                    }}
                    onMouseOver={(e) => {
                      if (selectedVoice !== voiceKey) {
                        (e.target as HTMLElement).style.backgroundColor = '#f8f9fa';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (selectedVoice !== voiceKey) {
                        (e.target as HTMLElement).style.backgroundColor = 'white';
                      }
                    }}
                  >
                    <span style={{ fontSize: '28px', marginBottom: '4px' }}>
                      {getEmoji(voiceKey)}
                    </span>
                    <span style={{ fontSize: '12px' }}>{displayName}</span>
                  </button>
                  
                  {/* 미리보기 플레이/정지 버튼 */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleVoicePreview(voiceKey);
                    }}
                    style={{
                      position: 'absolute',
                      top: '4px',
                      right: '4px',
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      border: '1px solid #ccc',
                      background: 'white',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '10px',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                    }}
                    onMouseOver={(e) => {
                      (e.target as HTMLElement).style.backgroundColor = '#f0f0f0';
                      (e.target as HTMLElement).style.borderColor = '#999';
                    }}
                    onMouseOut={(e) => {
                      (e.target as HTMLElement).style.backgroundColor = 'white';
                      (e.target as HTMLElement).style.borderColor = '#ccc';
                    }}
                  >
                    {isPreviewPlaying === voiceKey ? '⏸️' : '▶️'}
                  </button>
                </div>
              );
            })}
            </div>
          </div>
        </div>
      </div>

      {/* 음성 생성 버튼 */}
      <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
        <button
          className="button generateButton"
          onClick={handleGenerateAudio}
          disabled={!scriptText.trim() || isGeneratingAudio}
          style={{
            borderRadius: '12px',
            background: 'rgb(124, 58, 237)',
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
        >
          {isGeneratingAudio ? (
            <div style={{
              width: '16px',
              height: '16px',
              border: '2px solid transparent',
              borderTop: '2px solid white',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
          ) : (
            '음성생성'
          )}
        </button>
      </div>
      
      {/* TTS 에러 메시지 표시 */}
      {ttsErrorMessage && (
        <div style={{
          marginTop: '10px',
          textAlign: 'center',
          color: '#dc3545',
          fontSize: '14px',
          fontStyle: 'italic'
        }}>
          {ttsErrorMessage}
        </div>
      )}

      {/* 음성 생성 결과 블럭 */}
      <div style={{
        width: '800px',
        margin: '20px auto 0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>

            {isGeneratingAudio && <LoadingMessage type="voice" />}

            {generatedAudio && (
              <AudioPlayer
                title="생성된 음성"
                audioBuffer={generatedAudio}
                isPlaying={isPlaying}
                currentTime={currentTime}
                duration={duration}
                onPlay={handleAudioPlay}
                onSeek={handleAudioSeek}
                downloadFileName={`generated-${selectedVoice}-audio.wav`}
              />
            )}

            {generatedAudio && (
              <div style={{
                marginTop: '20px',
                padding: '20px',
                background: '#e8f4f8',
                border: '1px solid #bee5eb',
                borderRadius: '12px',
                width: '600px'
              }}>
                <div style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: '#0c5460',
                  marginBottom: '15px'
                }}>
                  🎛️ 무음 제거 (선택사항)
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    color: '#0c5460',
                    marginBottom: '5px',
                    fontWeight: 'bold'
                  }}>
                    무음 감지 데시벨: {silenceThreshold}dB
                  </label>
                  <input
                    type="range"
                    min="-60"
                    max="-10"
                    step="1"
                    value={silenceThreshold}
                    onChange={(e) => setSilenceThreshold(parseInt(e.target.value))}
                    style={{
                      width: '55%',
                      height: '4px',
                      borderRadius: '2px',
                      background: '#bee5eb',
                      outline: 'none',
                      appearance: 'none'
                    }}
                  />
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '12px',
                    color: '#6c757d',
                    marginTop: '5px',
                    width: '55%',
                    margin: '5px auto 0 auto'
                  }}>
                    <span>-60dB</span>
                    <span>-10dB</span>
                  </div>
                  
                  {/* 안내 메시지 */}
                  <div style={{
                    textAlign: 'center',
                    fontSize: '15px',
                    color: '#6c757d',
                    marginTop: '10px'
                  }}>
                    -10dB 로 갈수록 음성이 많이 삭제됩니다
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '15px' }}>
                  <button
                    onClick={handleSilenceRemoval}
                    disabled={isProcessingSilence}
                    style={{
                      padding: '10px 16px',
                      background: isProcessingSilence ? '#6c757d' : 'rgb(98, 193, 177)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '14px',
                      cursor: isProcessingSilence ? 'not-allowed' : 'pointer',
                      width: '150px',
                      height: '45px',
                      fontWeight: 'bold',
                      transition: 'all 0.1s ease'
                    }}
                    onMouseDown={(e) => {
                      (e.target as HTMLElement).style.height = '45px';
                    }}
                    onMouseUp={(e) => {
                      (e.target as HTMLElement).style.height = '45px';
                    }}
                    onMouseLeave={(e) => {
                      (e.target as HTMLElement).style.height = '45px';
                    }}
                  >
                    {isProcessingSilence ? '🔄 처리 중...' : '✂️ 무음 제거 실행'}
                  </button>
                </div>

                {processedAudio && (
                  <div style={{ marginLeft: '-20px', marginTop: '20px' }}>
                    <AudioPlayer
                      title="무음제거된 음성"
                      audioBuffer={processedAudio}
                      isPlaying={processedAudioPlaying}
                      currentTime={processedCurrentTime}
                      duration={processedDuration}
                      onPlay={handleProcessedAudioPlay}
                      onSeek={handleProcessedAudioSeek}
                      downloadFileName={`processed-${selectedVoice}-audio.wav`}
                      progressColor="rgb(98, 193, 177)"
                    />
                  </div>
                )}
              </div>
            )}

            {(generatedAudio || processedAudio) && (
              <div style={{
                marginTop: '20px',
                padding: '20px',
                background: '#fff3cd',
                border: '1px solid #ffeaa7',
                borderRadius: '12px',
                width: '600px'
              }}>
                <div style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: '#856404',
                  marginBottom: '15px'
                }}>
                  📝 SRT 자막생성(베타,개발중)
                </div>

                <div style={{
                  display: 'flex',
                  gap: '15px',
                  alignItems: 'center',
                  marginBottom: '15px',
                  flexWrap: 'wrap',
                  justifyContent: 'center'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <label style={{ fontSize: '14px', color: '#856404', fontWeight: 'bold' }}>
                      사용할 오디오:
                    </label>
                    <select
                      value={selectedAudioSource}
                      onChange={(e) => setSelectedAudioSource(e.target.value)}
                      style={{
                        padding: '6px 10px',
                        border: '1px solid #ffeaa7',
                        borderRadius: '8px',
                        fontSize: '13px',
                        backgroundColor: 'white',
                        color: '#856404'
                      }}
                    >
                      <option value="original">원본 음성</option>
                      {processedAudio && <option value="processed">무음제거된 음성</option>}
                    </select>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <label style={{ fontSize: '14px', color: '#856404', fontWeight: 'bold' }}>
                      자막당 단어 수:
                    </label>
                    <select
                      value={wordsPerSubtitle}
                      onChange={(e) => setWordsPerSubtitle(parseInt(e.target.value))}
                      style={{
                        width: '60px',
                        padding: '6px',
                        border: '1px solid #ffeaa7',
                        borderRadius: '8px',
                        fontSize: '13px',
                        textAlign: 'center',
                        backgroundColor: 'white',
                        color: '#856404'
                      }}
                    >
                      <option value={1}>1</option>
                      <option value={2}>2</option>
                      <option value={3}>3</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '15px' }}>
                  <button
                    onClick={handleDownloadSRT}
                    disabled={isGeneratingSRT || (!generatedAudio && !processedAudio)}
                    style={{
                      padding: '10px 16px',
                      background: '#fd7e14',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '14px',
                      cursor: isGeneratingSRT ? 'not-allowed' : 'pointer',
                      width: '200px',
                      height: '45px',
                      fontWeight: 'bold',
                      textAlign: 'center',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.1s ease'
                    }}
                    onMouseDown={(e) => {
                      (e.target as HTMLElement).style.height = '45px';
                    }}
                    onMouseUp={(e) => {
                      (e.target as HTMLElement).style.height = '45px';
                    }}
                    onMouseLeave={(e) => {
                      (e.target as HTMLElement).style.height = '45px';
                    }}
                  >
                    {isGeneratingSRT ? (
                      <div style={{
                        width: '16px',
                        height: '16px',
                        border: '2px solid transparent',
                        borderTop: '2px solid white',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }} />
                    ) : (
                      <span style={{ textAlign: 'center' }}>📥 SRT 자막 다운로드</span>
                    )}
                  </button>
                </div>

                {isGeneratingSRT && (
                  <div style={{ marginTop: '10px', textAlign: 'center' }}>
                    <LoadingMessage type="srt" />
                  </div>
                )}
                
                {/* SRT 에러 메시지 표시 */}
                {srtErrorMessage && (
                  <div style={{ 
                    marginTop: '10px', 
                    textAlign: 'center', 
                    color: '#dc3545',
                    fontSize: '14px',
                    fontStyle: 'italic'
                  }}>
                    {srtErrorMessage}
                  </div>
                )}
              </div>
            )}
      </div>

      {/* 언어 선택 모달 */}
      {isLanguageModalOpen && createPortal(
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
        }}
        onClick={() => setIsLanguageModalOpen(false)}
        >
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '2rem',
            width: '650px',
            height: '490px',
            overflow: 'auto'
          }}
          onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: '1.5rem',
              position: 'relative'
            }}>
              <h3 style={{
                margin: 0,
                color: '#333d4b',
                fontSize: '18px',
                fontWeight: 'bold',
                textAlign: 'center'
              }}>
                언어 선택
              </h3>
              <button
                onClick={() => setIsLanguageModalOpen(false)}
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
                  justifyContent: 'center',
                  position: 'absolute',
                  right: '0'
                }}
              >
                ×
              </button>
            </div>

            {/* 언어 선택 버튼들 */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              alignItems: 'center'
            }}>
              {/* 첫 번째 줄 - 3개 */}
              <div style={{
                display: 'flex',
                gap: '15px',
                justifyContent: 'center'
              }}>
                {[
                  { code: 'ko', name: '한국어', flag: '🇰🇷' },
                  { code: 'ja', name: '일본어', flag: '🇯🇵' },
                  { code: 'en', name: '영어', flag: '🇺🇸' }
                ].map((language) => (
                  <button
                    key={language.code}
                    onClick={() => {
                      setSelectedLanguage(language.code);
                      setIsLanguageModalOpen(false);
                    }}
                    style={{
                      width: '100px',
                      height: '100px',
                      border: selectedLanguage === language.code ? '2px solid rgb(124, 58, 237)' : '1px solid #ccc',
                      borderRadius: '12px',
                      background: selectedLanguage === language.code ? 'rgb(243, 240, 255)' : 'white',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px',
                      fontWeight: selectedLanguage === language.code ? 'bold' : 'normal',
                      color: selectedLanguage === language.code ? 'rgb(124, 58, 237)' : '#333',
                      transition: 'all 0.2s ease',
                      gap: '8px'
                    }}
                    onMouseOver={(e) => {
                      if (selectedLanguage !== language.code) {
                        e.currentTarget.style.backgroundColor = '#f8f9fa';
                      }
                      e.currentTarget.style.transform = 'scale(1.05)';
                    }}
                    onMouseOut={(e) => {
                      if (selectedLanguage !== language.code) {
                        e.currentTarget.style.backgroundColor = 'white';
                      } else {
                        e.currentTarget.style.backgroundColor = 'rgb(243, 240, 255)';
                      }
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    <span style={{ fontSize: '32px' }}>{language.flag}</span>
                    <span>{language.name}</span>
                  </button>
                ))}
              </div>

              {/* 두 번째 줄 - 4개 */}
              <div style={{
                display: 'flex',
                gap: '15px',
                justifyContent: 'center'
              }}>
                {[
                  { code: 'es', name: '스페인어', flag: '🇪🇸' },
                  { code: 'zh', name: '중국어', flag: '🇨🇳' },
                  { code: 'fr', name: '프랑스어', flag: '🇫🇷' },
                  { code: 'de', name: '독일어', flag: '🇩🇪' }
                ].map((language) => (
                  <button
                    key={language.code}
                    onClick={() => {
                      setSelectedLanguage(language.code);
                      setIsLanguageModalOpen(false);
                    }}
                    style={{
                      width: '100px',
                      height: '100px',
                      border: selectedLanguage === language.code ? '2px solid rgb(124, 58, 237)' : '1px solid #ccc',
                      borderRadius: '12px',
                      background: selectedLanguage === language.code ? 'rgb(243, 240, 255)' : 'white',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px',
                      fontWeight: selectedLanguage === language.code ? 'bold' : 'normal',
                      color: selectedLanguage === language.code ? 'rgb(124, 58, 237)' : '#333',
                      transition: 'all 0.2s ease',
                      gap: '8px'
                    }}
                    onMouseOver={(e) => {
                      if (selectedLanguage !== language.code) {
                        e.currentTarget.style.backgroundColor = '#f8f9fa';
                      }
                      e.currentTarget.style.transform = 'scale(1.05)';
                    }}
                    onMouseOut={(e) => {
                      if (selectedLanguage !== language.code) {
                        e.currentTarget.style.backgroundColor = 'white';
                      } else {
                        e.currentTarget.style.backgroundColor = 'rgb(243, 240, 255)';
                      }
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    <span style={{ fontSize: '32px' }}>{language.flag}</span>
                    <span>{language.name}</span>
                  </button>
                ))}
              </div>

              {/* 세 번째 줄 - 4개 */}
              <div style={{
                display: 'flex',
                gap: '15px',
                justifyContent: 'center'
              }}>
                {[
                  { code: 'pt', name: '포르투갈어', flag: '🇵🇹' },
                  { code: 'ru', name: '러시아어', flag: '🇷🇺' },
                  { code: 'hi', name: '힌디어', flag: '🇮🇳' },
                  { code: 'nl', name: '네덜란드어', flag: '🇳🇱' }
                ].map((language) => (
                  <button
                    key={language.code}
                    onClick={() => {
                      setSelectedLanguage(language.code);
                      setIsLanguageModalOpen(false);
                    }}
                    style={{
                      width: '100px',
                      height: '100px',
                      border: selectedLanguage === language.code ? '2px solid rgb(124, 58, 237)' : '1px solid #ccc',
                      borderRadius: '12px',
                      background: selectedLanguage === language.code ? 'rgb(243, 240, 255)' : 'white',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px',
                      fontWeight: selectedLanguage === language.code ? 'bold' : 'normal',
                      color: selectedLanguage === language.code ? 'rgb(124, 58, 237)' : '#333',
                      transition: 'all 0.2s ease',
                      gap: '8px'
                    }}
                    onMouseOver={(e) => {
                      if (selectedLanguage !== language.code) {
                        e.currentTarget.style.backgroundColor = '#f8f9fa';
                      }
                      e.currentTarget.style.transform = 'scale(1.05)';
                    }}
                    onMouseOut={(e) => {
                      if (selectedLanguage !== language.code) {
                        e.currentTarget.style.backgroundColor = 'white';
                      } else {
                        e.currentTarget.style.backgroundColor = 'rgb(243, 240, 255)';
                      }
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    <span style={{ fontSize: '32px' }}>{language.flag}</span>
                    <span>{language.name}</span>
                  </button>
                ))}
              </div>

            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default Step6;
