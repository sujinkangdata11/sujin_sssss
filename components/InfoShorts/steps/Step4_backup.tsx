import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import styles from '../InfoShorts.module.css';

interface Step4Props {
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

const Step4: React.FC<Step4Props> = ({
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
  const [selectedMode, setSelectedMode] = useState<string>('기본 대사');
  
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
      opacity: currentStep === 4 ? 1 : 0,
      visibility: currentStep === 4 ? 'visible' : 'hidden',
      pointerEvents: currentStep === 4 ? 'auto' : 'none',
      transform: (() => {
        const stepNumber = 4;
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

      {/* 하단: 대사만들기 버튼 */}
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
              alert('대사 작성 유형을 선택해주세요.');
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
            fontSize: '13px'
          }}>
            <div style={{ marginBottom: '15px', fontSize: '16px', lineHeight: '1.5' }}>
              이 대사를 내 스타일로 바꾸고 싶다면,<br/>
              잘된 예시 3개를 올려주세요
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
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
                      justifyContent: 'center'
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
                      height: '48px'
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
            
            <button
              onClick={handleRewriteWithExamples}
              style={{
                marginTop: '12px',
                padding: '10px 16px',
                background: '#7c3aed',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '15px',
                cursor: 'pointer',
                width: '100%',
                transition: 'background-color 0.2s',
                height: '48px'
              }}
              onMouseOver={(e) => (e.target as HTMLElement).style.backgroundColor = '#6366f1'}
              onMouseOut={(e) => (e.target as HTMLElement).style.backgroundColor = '#7c3aed'}
              disabled={Object.values(uploadedFiles).every(file => file === null)}
            >
              📝 이 예시를 기준으로 재작성하기
            </button>
            
            {isLoadingRewrite && (
              <div style={{ marginTop: '10px', textAlign: 'center' }}>
                <LoadingMessage />
              </div>
            )}
            
            {rewrittenResult && (
              <div>
                <DownloadCopyButtons 
                  content={rewrittenResult}
                  filename="재작성된_대사"
                />
                
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
    </div>
  );
};

export default Step4;