import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import styles from '../InfoShorts.module.css';
import HelpButton from '../../shared/HelpButton';

interface Step5Props {
  currentStep: number;
  previousStep: number;
  navigationDirection: 'next' | 'prev' | null;
  fourthColumnRef: React.RefObject<HTMLDivElement>;
  selectedLanguage2: string;
  setSelectedLanguage2: (language: string) => void;
  ChevronDown: ({ isOpen }: { isOpen: boolean }) => JSX.Element;
  analysisTypes2: Record<string, string>;
  expandedAnalysis2: string;
  setExpandedAnalysis2: (type: string) => void;
  scrollToColumn: (columnRef: React.RefObject<HTMLDivElement>) => void;
  c: (...args: any[]) => string;
  customAnalysisPrompt2: string;
  setCustomAnalysisPrompt2: (prompt: string) => void;
  handleAnalyzeContent2: (type: string) => void;
  apiKey: string;
  isLoadingScript: boolean;
  LoadingMessage: ({ type }: { type?: 'default' | 'voice' | 'srt' }) => JSX.Element;
  analysisResult2: string;
  selectedAnalysisType2: string;
  DownloadCopyButtons: ({ content, filename }: { content: string; filename: string }) => JSX.Element;
  uploadedFiles: Record<string, File | null>;
  handleFileUpload: (fileKey: string, file: File) => void;
  handleFileDelete: (fileKey: string) => void;
  handleRewriteWithExamples: () => void;
  isLoadingRewrite: boolean;
  rewrittenResult: string;
}

const Step5: React.FC<Step5Props> = ({
  currentStep,
  previousStep,
  navigationDirection,
  fourthColumnRef,
  selectedLanguage2,
  setSelectedLanguage2,
  ChevronDown,
  analysisTypes2,
  expandedAnalysis2,
  setExpandedAnalysis2,
  scrollToColumn,
  c,
  customAnalysisPrompt2,
  setCustomAnalysisPrompt2,
  handleAnalyzeContent2,
  apiKey,
  isLoadingScript,
  LoadingMessage,
  analysisResult2,
  selectedAnalysisType2,
  DownloadCopyButtons,
  uploadedFiles,
  handleFileUpload,
  handleFileDelete,
  handleRewriteWithExamples,
  isLoadingRewrite,
  rewrittenResult
}) => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalContent, setModalContent] = useState<{ type: string; prompt: string } | null>(null);
  const [selectedMode, setSelectedMode] = useState<string>('정보력 만렙');
  const [showExampleModal, setShowExampleModal] = useState(false);
  const [selectedExample, setSelectedExample] = useState(1);
  const [showFullContent, setShowFullContent] = useState<number | null>(null);
  return (
    <div className="step-card" style={{
      position: 'absolute',
      top: 0,
      left: 0,
      background: 'rgb(249, 250, 251)',
      border: '1px solid rgb(209, 213, 219)',
      borderRadius: '16px',
      padding: '2rem',
      textAlign: 'center',
      width: '100%',
      height: 'fit-content',
      opacity: currentStep === 5 ? 1 : 0,
      visibility: currentStep === 5 ? 'visible' : 'hidden',
      pointerEvents: currentStep === 5 ? 'auto' : 'none',
      transform: (() => {
        const stepNumber = 5;
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
      })(),
      transition: 'opacity 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94), visibility 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
    }}>
      <HelpButton
        stepName="음성분석"
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

      {/* 상단: 분석 옵션 선택 */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
        marginBottom: '2rem'
      }}>
        <div className="button-column-step4" ref={fourthColumnRef} style={{
          background: '#eaedf1',
          borderRadius: '20px',
          padding: '2rem',
          width: '800px',
          height: '550px',
          overflow: 'hidden'
        }}>
          <div className="modeSelector">
            <div>
              <h2 style={{ fontWeight: 'bold', color: '#333d4b', fontSize: '18px', textAlign: 'center', marginBottom: '1.5rem' }}>대사 작성 유형을 선택하세요</h2>

              <div className="modeList">
                {Object.entries(analysisTypes2).map(([type, prompt]) => (
                  <div key={type}>
                    <button
                      className={c('button', {
                        active: type === selectedMode,
                      })}
                      onClick={() => {
                        setSelectedMode(type);
                        setModalContent({ type, prompt });
                        setShowModal(true);
                      }}
                      style={{width: '200px', height: '200px', fontSize: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center'}}
                    >
                      <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                        <span className="emoji" style={{ fontSize: '35px', marginBottom: '8px' }}>
                          {type === '커스텀' ? '🔧' : type === '3초 후킹' ? '⚡' : type === '정보력 만렙' ? '🧠' : type === '바이럴 대사' ? '💬' : '📝'}
                        </span>
                        <span>{type}</span>
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
          onClick={() => {
            if (selectedMode) {
              handleAnalyzeContent2(selectedMode);
            } else {
              alert('분석 타입을 선택해주세요.');
            }
          }}
          disabled={!selectedMode || (selectedMode === '커스텀' && !customAnalysisPrompt2.trim())}
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
        >
          {isLoadingScript ? (
            <div style={{
              width: '16px',
              height: '16px',
              border: '2px solid transparent',
              borderTop: '2px solid white',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
          ) : (
            '대사만들기'
          )}
        </button>
      </div>

      {/* 로딩 메시지 */}
      {isLoadingScript && (
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

      {/* 결과 출력 영역 */}
      {analysisResult2 && (
        <div style={{ 
          width: '100%',
          marginTop: '2rem'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '10px',
            marginBottom: '20px'
          }}>
            <DownloadCopyButtons 
              content={analysisResult2}
              filename={`대사쓰기_${selectedAnalysisType2}`}
            />
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <div className="output-box-step4">
            <div style={{
              whiteSpace: 'pre-wrap',
              lineHeight: '1.7',
              fontSize: '15px',
              color: '#333'
            }}>
              {analysisResult2.replace(/\\n/g, '\n')}
            </div>
            </div>
          </div>
          
          <div style={{
            marginTop: '15px',
            padding: '20px',
            background: '#e8f4f8',
            border: '1px solid #bee5eb',
            borderRadius: '12px',
            color: '#0c5460',
            fontSize: '13px',
            width: '800px',
            margin: '15px auto 0 auto',
            position: 'relative'
          }}>
            {/* 잘된 예시 버튼 */}
            <button
              onClick={() => setShowExampleModal(true)}
              style={{
                position: 'absolute',
                top: '10px',
                right: '15px',
                padding: '6px 12px',
                backgroundColor: '#0c5460',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#08434d';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#0c5460';
              }}
            >
              잘된 예시
            </button>

            <div style={{ marginBottom: '15px', fontSize: '16px', lineHeight: '1.5' }}>
              이 대사를 내 스타일로 바꾸고 싶다면,<br/>
              잘된 예시 최대 3개를 올려주세요
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
              {['example1', 'example2', 'example3'].map((fileKey, index) => (
                <div key={fileKey} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {!uploadedFiles[fileKey] ? (
                    <label style={{
                      padding: '8px 12px',
                      background: 'white',
                      border: '1px solid #bee5eb',
                      borderRadius: '12px',
                      color: '#0c5460',
                      fontSize: '15px',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                      display: 'flex',
                      textAlign: 'center',
                      height: '48px',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '410px'
                    }}
                    onMouseOver={(e) => (e.target as HTMLElement).style.backgroundColor = '#f0f9ff'}
                    onMouseOut={(e) => (e.target as HTMLElement).style.backgroundColor = 'white'}>
                      📁 잘된 예시{index + 1}.txt 업로드
                      <input
                        type="file"
                        accept=".txt"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleFileUpload(fileKey, file);
                          }
                        }}
                      />
                    </label>
                  ) : (
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      background: '#f0f9ff',
                      border: '1px solid #bee5eb',
                      borderRadius: '12px',
                      height: '48px',
                      width: '410px'
                    }}>
                      <span style={{ 
                        color: '#0c5460', 
                        fontSize: '15px',
                        flex: 1,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        📄 {uploadedFiles[fileKey]?.name}
                      </span>
                      <button
                        onClick={() => handleFileDelete(fileKey)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#dc3545',
                          fontSize: '15px',
                          cursor: 'pointer',
                          marginLeft: '8px',
                          padding: '2px 6px',
                          borderRadius: '3px'
                        }}
                        onMouseOver={(e) => (e.target as HTMLElement).style.backgroundColor = '#ffebee'}
                        onMouseOut={(e) => (e.target as HTMLElement).style.backgroundColor = 'transparent'}
                      >
                        삭제
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button
              onClick={handleRewriteWithExamples}
              style={{
                marginTop: '12px',
                marginBottom: '20px',
                padding: '10px 16px',
                background: 'rgb(124, 58, 237)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '15px',
                cursor: 'pointer',
                width: '410px',
                transition: 'background-color 0.2s',
                height: '48px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center'
              }}
              onMouseOver={(e) => (e.target as HTMLElement).style.backgroundColor = 'rgb(100, 45, 190)'}
              onMouseOut={(e) => (e.target as HTMLElement).style.backgroundColor = 'rgb(124, 58, 237)'}
              disabled={Object.values(uploadedFiles).every(file => file === null)}
            >
              {isLoadingRewrite ? (
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid transparent',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
              ) : (
                '📝 이 예시를 기준으로 재작성하기'
              )}
            </button>
            </div>
            
            {isLoadingRewrite && (
              <div style={{ marginTop: '10px', textAlign: 'center' }}>
                <LoadingMessage />
              </div>
            )}
            
            {rewrittenResult && (
              <div>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  gap: '10px',
                  marginBottom: '20px'
                }}>
                  <DownloadCopyButtons 
                    content={rewrittenResult}
                    filename="재작성된_대사"
                  />
                </div>
                
                <div style={{
                  padding: '15px',
                  background: '#f0fff4',
                  border: '1px solid #90ee90',
                  borderRadius: '6px',
                  color: '#333'
                }}>
                  <h4 style={{ marginBottom: '10px', color: '#2d5016' }}>
                    재작성된 대사:
                  </h4>
                  <div style={{ 
                    whiteSpace: 'pre-wrap', 
                    lineHeight: '1.7',
                    fontSize: '15px',
                    color: '#333'
                  }}>
                    {rewrittenResult.replace(/\\n/g, '\n')}
                  </div>
                </div>
              </div>
            )}
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
                {modalContent.type} 대사 작성
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
              {modalContent.type === '커스텀' ? (
                <div>
                  <textarea
                    placeholder="커스텀 대사 작성을 위한 프롬포트를 입력하세요..."
                    value={customAnalysisPrompt2}
                    onChange={(e) => setCustomAnalysisPrompt2(e.target.value)}
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
                        if (customAnalysisPrompt2.trim()) {
                          setShowModal(false);
                        }
                      }}
                      disabled={!customAnalysisPrompt2.trim()}
                      style={{
                        padding: '10px 20px',
                        backgroundColor: customAnalysisPrompt2.trim() ? '#7c3aed' : '#d1d5db',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: customAnalysisPrompt2.trim() ? 'pointer' : 'not-allowed',
                        fontSize: '14px'
                      }}
                    >
                      적용하기
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  {modalContent.prompt.replace(/\\n/g, '\n')}
                </div>
              )}
            </div>
            
          </div>
        </div>,
        document.body
      )}

      {/* 잘된 예시 모달 */}
      {showExampleModal && createPortal(
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
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '30px',
            width: '700px',
            maxHeight: '80%',
            overflow: 'auto',
            position: 'relative'
          }}>
            {/* 닫기 버튼 */}
            <button
              onClick={() => setShowExampleModal(false)}
              style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#666'
              }}
            >
              ×
            </button>

            {/* 모달 내용 */}
            <h2 style={{
              margin: '0 0 20px 0',
              fontSize: '20px',
              fontWeight: 'bold',
              color: '#333',
              textAlign: 'center'
            }}>
              아래 예시 중에 1개를 고르세요
            </h2>

            {/* 3개의 예시 옵션 정사각형 블럭 */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '15px',
              marginBottom: '30px',
              justifyItems: 'center'
            }}>
              {[1, 2, 3].map((option) => {
                const getTitle = (optionNum: number) => {
                  if (optionNum === 1) return "기본 템플릿";
                  if (optionNum === 2) return "반전 구조 템플릿 5";
                  return "반전 구조 템플릿 6";
                };

                const getSubtitle = (optionNum: number) => {
                  if (optionNum === 1) return "의견→이유→근거 구조";
                  if (optionNum === 2) return "오해유발→반전→진실공개";
                  return "신기한현상→반전→원리";
                };

                return (
                  <button
                    key={option}
                    onClick={() => setSelectedExample(option)}
                    style={{
                      width: '200px',
                      height: '200px',
                      border: selectedExample === option ? '1px solid #2872e34d' : '1px solid #e5e7eb',
                      borderRadius: '12px',
                      backgroundColor: selectedExample === option ? '#2872e31a' : 'white',
                      color: '#333',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      padding: '15px',
                      textAlign: 'center',
                      position: 'relative',
                      outline: selectedExample === option ? '2px solid rgba(40, 114, 227, .8)' : 'none'
                    }}
                    onMouseEnter={(e) => {
                      if (selectedExample !== option) {
                        e.currentTarget.style.backgroundColor = '#f8f9fa';
                        e.currentTarget.style.transform = 'scale(1.02)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedExample !== option) {
                        e.currentTarget.style.backgroundColor = 'white';
                      }
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    <div style={{
                      fontSize: '40px',
                      marginBottom: '8px'
                    }}>
                      📄
                    </div>
                    <div style={{
                      fontSize: '16px',
                      fontWeight: 'normal',
                      textAlign: 'center',
                      lineHeight: '1.2',
                      color: '#333'
                    }}>
                      {option === 1 && "기본템플릿"}
                      {option === 2 && "반전구조 템플릿 5"}
                      {option === 3 && "반전구조 템플릿 6"}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowFullContent(option);
                      }}
                      style={{
                        fontSize: '15px',
                        padding: '4px 8px',
                        backgroundColor: 'rgba(124, 58, 237, 0.1)',
                        color: 'rgb(124, 58, 237)',
                        border: 'none',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        marginTop: '15px'
                      }}
                    >
                      전체보기
                    </button>
                  </button>
                );
              })}
            </div>

            {/* 선택 완료 버튼 */}
            <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
              <button
                onClick={() => {
                  // 선택된 예시에 따라 가상의 파일 객체 생성
                  const getFileContent = (exampleNum: number) => {
                    if (exampleNum === 1) {
                      return `기본 템플릿
글은 3개의 문단으로 이뤄져있고, 각 문단은 의견→이유→근거로 반복된다. 또한 각 문단은 유기적으로 연결되어야 하며 문단 진행시 , 점차 구체적으로 전개되어야 한다. 예를들어 문단 1에서 언급한 "LED조명"은 → 문단 2에서 언급해 유기적으로 연결했고 문단2에서 언급한 "의사의 정교함"을 → 문단 3에서도 언급해 문단의 연결성을 부여해라. 따라서 문단1→문단2→ 문단3으로 진행됨에 따라 내용이 점점 구체적으로 서술해야된다.

##문단 1 구조 : 의견1 -이유1
의견제시 1  : 수술실에서 가장 놀라운 기술은 그림자가 생기지 않는 수술용 조명인데요.
그 이유1 : 놀라운 이유는 하나의 큰 전구가 아니라 수많은 작은 LED들이 링 모양으로 배치되어 있고, 각각이 서로 다른 각도에서 빛을 비추기 때문이네요.

##문단2 구조 : 의견2-이유2-근거2
의견제시2 : 이 LED 조명들은 위에서 내려다봤을 때 더욱 정교한 시스템을 보여주는데,
그 이유2 : 정교한 이유는 외과의사의 손이 하나의 LED 빛을 가려도 다른 LED들이 그 부분을 계속 밝혀주기 때문이네요.
그 근거2 : 이렇게 작동하는 이유는 각 LED가 미세하게 다른 각도로 설치되어 있어서 빛의 중복 효과를 만들어내기 때문이라네요.

##문단3 구조 : 의견3-이유3
의견제시 3 : 이런 다중 LED 시스템은 의료진의 안전성까지 높여주는데요.
그 이유3 : 안전성이 높아지는 이유는 하나의 LED가 고장나도 나머지 LED들이 계속 작동해서 수술 중 갑작스런 조명 중단 사고를 예방할 수 있기 때문이라네요.

—— 위 내용을 보면 각 구조에 한 문장씩 구성되어있는걸 볼 수 있다. 이와 비슷하게 내용은 아래 내용으로 맞추고 '구조'만 위내용을 참고해서 다시 짜라 ——`;
                    } else if (exampleNum === 2) {
                      return `반전 구조 템플릿
글은 반전 구조로 이뤄져있고, [오해 유발] → [반전 신호] → [진실 공개] → [구체적 설명] → [추가 정보]로 전개된다. 또한 각 단계는 유기적으로 연결되어야 하며 진행시, 점차 구체적으로 전개되어야 한다. 예를들어 오해 유발에서 언급한 현상은 → 진실 공개에서 언급해 유기적으로 연결했고 구체적 설명에서 언급한 기술명을 → 추가 정보에서도 언급해 단계의 연결성을 부여해라. 따라서 오해 유발→반전 신호→ 진실 공개→구체적 설명→추가 정보로 진행됨에 따라 내용이 점점 구체적으로 서술해야된다.

##오해 유발 구조 : 충격적 현상+후킹
오해 유발 : "콘크리트가 갑자기 땅속으로 가라앉는데 주변에 회색 액체가 구덩이 위로 넘쳐흘러 나옵니다."

##진실 공개 구조 : 반전 + 긍정적 재정의
진실 공개 : "건설 사고 같지만 사실 이건 지하 깊은 곳까지 안정적으로 벽을 만들 수 있는 특수 공법이라고 하는데 이는 연속벽 공법이라 불리는 특수 공법으로 안정액을 채운 상태에서 콘크리트를 천천히 부어 지하벽을 만드는 방식입니다."

##구체적 설명 구조 : 활용 분야 + 기능 설명
구체적 설명 : "충분히 깊어지면 안정액 대신 콘크리트가 벽을 이루며 굳어지는데 이는 지하철 터널부터 대형 빌딩 지하실을 만들 때도 사용할 수 있죠."

##추가 정보 구조 : 성능 특성
추가 정보 : "벽이 충분히 깊어지면 지하수와 흙을 완전히 차단할 수 있는데 깊이가 30미터가 넘어도 연속벽은 무너지지 않는다고 하네요."

`;
                    } else {
                      return `반전 구조 템플릿
글은 반전 구조로 이뤄져있고, [오해 유발/신기한 현상] → [반전 신호] → [진실 공개] → [구체적 설명] → [추가 정보]로 전개된다. 또한 각 단계는 유기적으로 연결되어야 하며 진행시, 점차 구체적으로 전개되어야 한다. 예를들어 오해 유발에서 언급한 현상은 → 진실 공개에서 언급해 유기적으로 연결했고 구체적 설명에서 언급한 기술명을 → 추가 정보에서도 언급해 단계의 연결성을 부여해라. 따라서 오해 유발→반전 신호→ 진실 공개→구체적 설명→추가 정보로 진행됨에 따라 내용이 점점 구체적으로 서술해야된다.

##오해 유발 구조 : 충격적/신기한 현상
오해 유발 : 얼어붙은 호수 속에 하얀 거품들이 박혀있는데 마치 얼음 속 보석처럼 아름답게 빛나고 있습니다.

##진실 공개 구조 : 반전 + 긍정적 재정의
진실 공개 : 사실 이건 호수 바닥에서 올라오는 메탄 가스라고 하는데 박테리아가 죽은 식물을 분해하면서 자연스럽게 발생시키는 천연 가스가 얼음에 갇힌 현상이죠.

##구체적 설명 구조 : 작동 원리 + 메커니즘
구체적 설명 : 이 메탄 가스는 호수 바닥에서 물 표면으로 계속 상승하는데 겨울철 호수 표면이 얼어버리면 가스 거품들이 얼음 속에서 빠져나가지 못하고 하얀 덩어리 모양으로 응축되어 보석 같은 모습을 만들어내죠.

##추가 정보 구조 : 성능 비교 + 효과
추가 정보 : 이 메탄은 매우 가연성이 높아서 얼음을 깨고 라이터를 가져다 대면 실제로 불꽃이 타오른다고 하네요.

`;
                    }
                  };

                  // 파일명을 템플릿 제목으로 설정
                  const getFileName = (exampleNum: number) => {
                    if (exampleNum === 1) return "기본 템플릿 적용";
                    if (exampleNum === 2) return "반전구조 템플릿 5 적용";
                    return "반전구조 템플릿 6 적용";
                  };

                  // 가상의 파일 객체 생성 (실제 파일 업로드와 동일한 방식)
                  const fileContent = getFileContent(selectedExample);
                  const fileName = getFileName(selectedExample);
                  const blob = new Blob([fileContent], { type: 'text/plain' });
                  const file = new File([blob], `${fileName}.txt`, { type: 'text/plain' });

                  // 실제 파일 업로드와 동일한 함수 호출
                  handleFileUpload('example1', file);

                  setShowExampleModal(false);
                  console.log(`예시 ${selectedExample} 선택됨 - 파일 업로드 완료`);
                }}
                style={{
                  padding: '12px 30px',
                  backgroundColor: 'rgb(124, 58, 237)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: 'normal',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgb(100, 40, 200)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgb(124, 58, 237)';
                }}
              >
                선택 완료
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* 전체보기 모달 */}
      {showFullContent && createPortal(
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
          zIndex: 1001
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '20px',
            width: '700px',
            height: '700px',
            overflow: 'hidden',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* 닫기 버튼 */}
            <button
              onClick={() => setShowFullContent(null)}
              style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#666'
              }}
            >
              ×
            </button>

            {/* 헤더 영역 */}
            <div style={{
              padding: '30px 30px 0 30px'
            }}>
              <h2 style={{
                margin: '0 0 20px 0',
                fontSize: '20px',
                fontWeight: 'bold',
                color: '#333'
              }}>
                {showFullContent === 1 && "기본 템플릿"}
                {showFullContent === 2 && "반전 구조 템플릿 5"}
                {showFullContent === 3 && "반전 구조 템플릿 6"}
              </h2>
            </div>

            {/* 스크롤 가능한 내용 영역 */}
            <div style={{
              flex: 1,
              padding: '0 30px 30px 30px',
              overflow: 'auto'
            }}>
              <div style={{
                color: '#333',
                fontSize: '14px',
                lineHeight: '1.6',
                whiteSpace: 'pre-line',
                fontFamily: 'monospace'
              }}>
              {showFullContent === 1 && `기본 템플릿
글은 3개의 문단으로 이뤄져있고, 각 문단은 의견→이유→근거로 반복된다. 또한 각 문단은 유기적으로 연결되어야 하며 문단 진행시 , 점차 구체적으로 전개되어야 한다. 예를들어 문단 1에서 언급한 "LED조명"은 → 문단 2에서 언급해 유기적으로 연결했고 문단2에서 언급한 "의사의 정교함"을 → 문단 3에서도 언급해 문단의 연결성을 부여해라. 따라서 문단1→문단2→ 문단3으로 진행됨에 따라 내용이 점점 구체적으로 서술해야된다.

##문단 1 구조 : 의견1 -이유1
의견제시 1  : 수술실에서 가장 놀라운 기술은 그림자가 생기지 않는 수술용 조명인데요.
그 이유1 : 놀라운 이유는 하나의 큰 전구가 아니라 수많은 작은 LED들이 링 모양으로 배치되어 있고, 각각이 서로 다른 각도에서 빛을 비추기 때문이네요.

##문단2 구조 : 의견2-이유2-근거2
의견제시2 : 이 LED 조명들은 위에서 내려다봤을 때 더욱 정교한 시스템을 보여주는데,
그 이유2 : 정교한 이유는 외과의사의 손이 하나의 LED 빛을 가려도 다른 LED들이 그 부분을 계속 밝혀주기 때문이네요.
그 근거2 : 이렇게 작동하는 이유는 각 LED가 미세하게 다른 각도로 설치되어 있어서 빛의 중복 효과를 만들어내기 때문이라네요.

##문단3 구조 : 의견3-이유3
의견제시 3 : 이런 다중 LED 시스템은 의료진의 안전성까지 높여주는데요.
그 이유3 : 안전성이 높아지는 이유는 하나의 LED가 고장나도 나머지 LED들이 계속 작동해서 수술 중 갑작스런 조명 중단 사고를 예방할 수 있기 때문이라네요.

—— 위 내용을 보면 각 구조에 한 문장씩 구성되어있는걸 볼 수 있다. 이와 비슷하게 내용은 아래 내용으로 맞추고 '구조'만 위내용을 참고해서 다시 짜라 ——

`}

              {showFullContent === 2 && `반전 구조 템플릿
글은 반전 구조로 이뤄져있고, [오해 유발] → [반전 신호] → [진실 공개] → [구체적 설명] → [추가 정보]로 전개된다. 또한 각 단계는 유기적으로 연결되어야 하며 진행시, 점차 구체적으로 전개되어야 한다. 예를들어 오해 유발에서 언급한 현상은 → 진실 공개에서 언급해 유기적으로 연결했고 구체적 설명에서 언급한 기술명을 → 추가 정보에서도 언급해 단계의 연결성을 부여해라. 따라서 오해 유발→반전 신호→ 진실 공개→구체적 설명→추가 정보로 진행됨에 따라 내용이 점점 구체적으로 서술해야된다.

##오해 유발 구조 : 충격적 현상+후킹
오해 유발 : "콘크리트가 갑자기 땅속으로 가라앉는데 주변에 회색 액체가 구덩이 위로 넘쳐흘러 나옵니다."

##진실 공개 구조 : 반전 + 긍정적 재정의
진실 공개 : "건설 사고 같지만 사실 이건 지하 깊은 곳까지 안정적으로 벽을 만들 수 있는 특수 공법이라고 하는데 이는 연속벽 공법이라 불리는 특수 공법으로 안정액을 채운 상태에서 콘크리트를 천천히 부어 지하벽을 만드는 방식입니다."

##구체적 설명 구조 : 활용 분야 + 기능 설명
구체적 설명 : "충분히 깊어지면 안정액 대신 콘크리트가 벽을 이루며 굳어지는데 이는 지하철 터널부터 대형 빌딩 지하실을 만들 때도 사용할 수 있죠."

##추가 정보 구조 : 성능 특성
추가 정보 : "벽이 충분히 깊어지면 지하수와 흙을 완전히 차단할 수 있는데 깊이가 30미터가 넘어도 연속벽은 무너지지 않는다고 하네요."

`}

              {showFullContent === 3 && `반전 구조 템플릿
글은 반전 구조로 이뤄져있고, [오해 유발/신기한 현상] → [반전 신호] → [진실 공개] → [구체적 설명] → [추가 정보]로 전개된다. 또한 각 단계는 유기적으로 연결되어야 하며 진행시, 점차 구체적으로 전개되어야 한다. 예를들어 오해 유발에서 언급한 현상은 → 진실 공개에서 언급해 유기적으로 연결했고 구체적 설명에서 언급한 기술명을 → 추가 정보에서도 언급해 단계의 연결성을 부여해라. 따라서 오해 유발→반전 신호→ 진실 공개→구체적 설명→추가 정보로 진행됨에 따라 내용이 점점 구체적으로 서술해야된다.

##오해 유발 구조 : 충격적/신기한 현상
오해 유발 : 얼어붙은 호수 속에 하얀 거품들이 박혀있는데 마치 얼음 속 보석처럼 아름답게 빛나고 있습니다.

##진실 공개 구조 : 반전 + 긍정적 재정의
진실 공개 : 사실 이건 호수 바닥에서 올라오는 메탄 가스라고 하는데 박테리아가 죽은 식물을 분해하면서 자연스럽게 발생시키는 천연 가스가 얼음에 갇힌 현상이죠.

##구체적 설명 구조 : 작동 원리 + 메커니즘
구체적 설명 : 이 메탄 가스는 호수 바닥에서 물 표면으로 계속 상승하는데 겨울철 호수 표면이 얼어버리면 가스 거품들이 얼음 속에서 빠져나가지 못하고 하얀 덩어리 모양으로 응축되어 보석 같은 모습을 만들어내죠.

##추가 정보 구조 : 성능 비교 + 효과
추가 정보 : 이 메탄은 매우 가연성이 높아서 얼음을 깨고 라이터를 가져다 대면 실제로 불꽃이 타오른다고 하네요.

`}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default Step5;